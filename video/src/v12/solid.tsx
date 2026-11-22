import React from "react";
import { Cam, dof, Item, NEAR, nearFade, toCam, V3, VIEW, W, H } from "../v6/engine";
import { Xf } from "../v11/three";

/**
 * Solid 3D for the neon world. Faces carry outward normals: back faces are culled, front faces are
 * painted far→near with lit fills (so nearer faces hide what's behind them), and only creases and
 * silhouettes are outlined. Objects get a soft contact shadow and a faint reflection in the floor.
 * Screen boxes go to the same layout registry as src/v11/three.tsx.
 */
type P2 = [number, number];
export type SFace = { pts: V3[]; n: V3; stroke: boolean[]; nb: (number | undefined)[]; two?: boolean };
export type SMesh = { faces: SFace[]; decals: { pts: V3[]; face: number }[] };
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const nrm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const combine = (...ms: SMesh[]): SMesh => {
  const out: SMesh = { faces: [], decals: [] };
  ms.forEach((m) => {
    const o = out.faces.length;
    m.faces.forEach((f) => out.faces.push({ ...f, nb: f.nb.map((x) => (x === undefined ? undefined : x + o)) }));
    m.decals.forEach((d) => out.decals.push({ pts: d.pts, face: d.face + o }));
  });
  return out;
};

/* ---------------------------------------------------------------- builders */
const area2 = (P: P2[]) => P.reduce((s, p, i) => s + p[0] * P[(i + 1) % P.length][1] - P[(i + 1) % P.length][0] * p[1], 0) / 2;
/** Extrude a closed outline (x right, y up) to depth d (z from -d/2 to d/2). Corners sharper than `sharp` degrees get crease lines. */
export const extrudeS = (P: P2[], d: number, sharp = 32): SMesh => {
  const n = P.length;
  const ccw = area2(P) > 0;
  const faces: SFace[] = [];
  const corner = (i: number) => {
    const a = P[(i - 1 + n) % n];
    const b = P[i];
    const c = P[(i + 1) % n];
    const u = nrm([b[0] - a[0], b[1] - a[1], 0]);
    const v = nrm([c[0] - b[0], c[1] - b[1], 0]);
    return Math.acos(Math.max(-1, Math.min(1, dot(u, v)))) > (sharp * Math.PI) / 180;
  };
  const FRONT = n;
  const BACK = n + 1;
  for (let i = 0; i < n; i++) {
    const a = P[i];
    const b = P[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const out = nrm(ccw ? [dy, -dx, 0] : [-dy, dx, 0]);
    faces.push({
      pts: [[a[0], a[1], -d / 2], [b[0], b[1], -d / 2], [b[0], b[1], d / 2], [a[0], a[1], d / 2]],
      n: out,
      stroke: [true, corner((i + 1) % n), true, corner(i)],
      nb: [FRONT, (i + 1) % n, BACK, (i - 1 + n) % n],
    });
  }
  faces.push({ pts: P.map((p) => [p[0], p[1], -d / 2] as V3), n: [0, 0, -1], stroke: P.map(() => true), nb: P.map(() => undefined) });
  faces.push({ pts: P.map((p) => [p[0], p[1], d / 2] as V3), n: [0, 0, 1], stroke: P.map(() => true), nb: P.map(() => undefined) });
  return { faces, decals: [] };
};
/** Turn an open polyline into a closed band of width t (for handles), ready for extrudeS. */
export const thicken = (P: P2[], t: number): P2[] => {
  const L: P2[] = [];
  const R: P2[] = [];
  P.forEach((p, i) => {
    const a = P[Math.max(0, i - 1)];
    const b = P[Math.min(P.length - 1, i + 1)];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const l = Math.hypot(dx, dy) || 1;
    L.push([p[0] - (dy / l) * (t / 2), p[1] + (dx / l) * (t / 2)]);
    R.push([p[0] + (dy / l) * (t / 2), p[1] - (dx / l) * (t / 2)]);
  });
  return [...L, ...R.reverse()];
};
/** Lines on the front face (z = -d/2) of the first front cap in `m`. */
export const decalS = (m: SMesh, lines: P2[][], d: number): SMesh => {
  const face = m.faces.findIndex((f) => f.n[2] === -1);
  return { faces: m.faces, decals: [...m.decals, ...lines.map((L) => ({ pts: L.map((p) => [p[0], p[1], -d / 2 - 0.6] as V3), face }))] };
};
export const boxS = (w: number, h: number, d: number, y0 = 0): SMesh => {
  const x = w / 2;
  const z = d / 2;
  const v: V3[] = [[-x, y0, -z], [x, y0, -z], [x, y0 + h, -z], [-x, y0 + h, -z], [-x, y0, z], [x, y0, z], [x, y0 + h, z], [-x, y0 + h, z]];
  const F: [number[], V3][] = [[[0, 1, 2, 3], [0, 0, -1]], [[5, 4, 7, 6], [0, 0, 1]], [[4, 0, 3, 7], [-1, 0, 0]], [[1, 5, 6, 2], [1, 0, 0]], [[3, 2, 6, 7], [0, 1, 0]], [[4, 5, 1, 0], [0, -1, 0]]];
  return { faces: F.map(([ix, n]) => ({ pts: ix.map((i) => v[i]), n, stroke: [true, true, true, true], nb: [undefined, undefined, undefined, undefined] })), decals: [] };
};
/**
 * Surface of revolution about the y axis from a profile of (radius, y) points (bottom → top).
 * `crease` lists profile indices that get a ring line (rims, waists).
 */
export const latheS = (prof: P2[], seg = 28, crease: number[] = []): SMesh => {
  const faces: SFace[] = [];
  const J = prof.length - 1;
  const id = (i: number, j: number) => j * seg + ((i + seg) % seg);
  for (let j = 0; j < J; j++) {
    const [r0, y0] = prof[j];
    const [r1, y1] = prof[j + 1];
    const tr = [r1 - r0, y1 - y0];
    const nr = tr[1];
    const ny = -tr[0];
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2;
      const a1 = ((i + 1) / seg) * Math.PI * 2;
      const am = (a0 + a1) / 2;
      const P = (r: number, y: number, a: number): V3 => [Math.cos(a) * r, y, Math.sin(a) * r];
      faces.push({
        pts: [P(r0, y0, a0), P(r0, y0, a1), P(r1, y1, a1), P(r1, y1, a0)],
        n: nrm([Math.cos(am) * nr, ny, Math.sin(am) * nr]),
        stroke: [crease.includes(j), false, crease.includes(j + 1), false],
        nb: [j > 0 ? id(i, j - 1) : undefined, id(i + 1, j), j < J - 1 ? id(i, j + 1) : undefined, id(i - 1, j)],
      });
    }
  }
  return { faces, decals: [] };
};
/** Vertical cylinder with a top cap and optional ring lines (coin edges). */
export const cylS = (r: number, h: number, y0 = 0, seg = 32, rings = 0): SMesh => {
  const prof: P2[] = [[r, y0], ...Array.from({ length: rings }, (_, k) => [r, y0 + (h * (k + 1)) / (rings + 1)] as P2), [r, y0 + h]];
  const m = latheS(prof, seg, prof.map((_, k) => k));
  const top = m.faces.length;
  const ring = Array.from({ length: seg }, (_, i) => [Math.cos((i / seg) * Math.PI * 2) * r, y0 + h, Math.sin((i / seg) * Math.PI * 2) * r] as V3);
  m.faces.push({ pts: ring, n: [0, 1, 0], stroke: ring.map(() => true), nb: ring.map(() => undefined) });
  // the side's top edge borders the cap
  m.faces.forEach((f, k) => {
    if (k < top && k >= top - seg) f.nb[2] = top;
  });
  return m;
};
export const arcPts = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 16): P2[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = a0 + ((a1 - a0) * i) / n;
    return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry];
  });
export const roundRect = (w: number, h: number, r: number, y0 = 0, k = 5): P2[] => {
  const x = w / 2;
  const q = (cx: number, cy: number, a: number) => arcPts(cx, cy, r, r, a, a + Math.PI / 2, k).slice(0, k);
  return [...q(x - r, y0 + r, -Math.PI / 2), ...q(x - r, y0 + h - r, 0), ...q(-x + r, y0 + h - r, Math.PI / 2), ...q(-x + r, y0 + r, Math.PI)];
};

/* ----------------------------------------------------------------- render */
const rot = (x: Xf, v: V3): V3 => {
  const lx = v[0];
  let ly = v[1];
  let lz = v[2];
  const t = x.tilt ?? 0;
  if (t) [ly, lz] = [ly * Math.cos(t) - lz * Math.sin(t), ly * Math.sin(t) + lz * Math.cos(t)];
  const a = x.yaw ?? 0;
  return [lx * Math.cos(a) + lz * Math.sin(a), ly, -lx * Math.sin(a) + lz * Math.cos(a)];
};
const place = (x: Xf, v: V3): V3 => {
  const s = x.s ?? 1;
  const r = rot(x, [v[0] * s, v[1] * s, v[2] * s]);
  return [x.p[0] + r[0], x.p[1] + r[1], x.p[2] + r[2]];
};
const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: number[], b: number[], k: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
const BASE = [7, 7, 11];
const LIGHT = nrm([-0.45, 0.85, -0.5]);
type G = { __LAYOUT?: { key: string; kind: "text" | "obj"; x0: number; y0: number; x1: number; y1: number; op: number }[] };

const draw = (c: Cam, o: { m: SMesh; xf: Xf; color: string; accent?: string; width: number; mirror: boolean }) => {
  const col = hex(o.color);
  const pts = (q: V3) => {
    const w = place(o.xf, q);
    return o.mirror ? ([w[0], -w[1], w[2]] as V3) : w;
  };
  const camP: V3 = [c.x, c.y, c.z];
  const F = o.m.faces.map((f) => {
    const wp = f.pts.map(pts);
    let n = rot(o.xf, f.n);
    if (o.mirror) n = [n[0], -n[1], n[2]];
    const ctr: V3 = [wp.reduce((s, p) => s + p[0], 0) / wp.length, wp.reduce((s, p) => s + p[1], 0) / wp.length, wp.reduce((s, p) => s + p[2], 0) / wp.length];
    const view = nrm(sub(camP, ctr));
    const facing = f.two ? true : dot(n, view) > 0;
    return { f, wp, n, view, facing };
  });
  const out: { depth: number; el: React.ReactNode[] }[] = [];
  const pts2: { x: number; y: number }[] = [];
  F.forEach((F0, k) => {
    if (!F0.facing) return;
    const cs = F0.wp.map((q) => toCam(c, q));
    if (cs.some((q) => q[2] < NEAR)) return;
    const sp = cs.map((q) => ({ x: VIEW.cx + (VIEW.f * q[0]) / q[2], y: VIEW.cy - (VIEW.f * q[1]) / q[2] }));
    pts2.push(...sp);
    const nn = F0.f.two && dot(F0.n, F0.view) < 0 ? ([-F0.n[0], -F0.n[1], -F0.n[2]] as V3) : F0.n;
    const diff = Math.max(0, dot(nn, LIGHT));
    const rim = Math.pow(1 - Math.abs(dot(nn, F0.view)), 2);
    const fill = mix(BASE, col, 0.08 + 0.42 * diff + 0.3 * rim);
    let d = "";
    F0.f.pts.forEach((_, e) => {
      const nb = F0.f.nb[e];
      const sil = nb !== undefined && !F[nb].facing;
      if (F0.f.stroke[e] || sil || (nb === undefined && !F0.f.stroke.length)) {
        const a = sp[e];
        const b = sp[(e + 1) % sp.length];
        d += `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      }
    });
    const el: React.ReactNode[] = [<polygon key={`p${k}`} points={sp.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")} fill={fill} stroke={fill} strokeWidth={0.6} />];
    if (d) el.push(<path key={`s${k}`} d={d} stroke={o.color} strokeWidth={o.width} strokeLinecap="round" fill="none" />);
    o.m.decals.forEach((dc, di) => {
      if (dc.face !== k) return;
      const ds = dc.pts.map((q) => toCam(c, pts(q)));
      if (ds.some((q) => q[2] < NEAR)) return;
      el.push(<polyline key={`d${k}-${di}`} points={ds.map((q) => `${(VIEW.cx + (VIEW.f * q[0]) / q[2]).toFixed(1)},${(VIEW.cy - (VIEW.f * q[1]) / q[2]).toFixed(1)}`).join(" ")} stroke={o.accent ?? o.color} strokeWidth={o.width * 0.85} fill="none" strokeLinecap="round" strokeLinejoin="round" />);
    });
    out.push({ depth: cs.reduce((s, q) => s + q[2], 0) / cs.length, el });
  });
  out.sort((a, b) => b.depth - a.depth);
  return { nodes: out.flatMap((x) => x.el), pts2 };
};

/**
 * Draw a solid mesh with its floor shadow and reflection. `shadow` is the footprint radius on the
 * floor (0 = none); `ground` is the floor height under it (usually 0).
 */
export const solid = (
  c: Cam,
  key: string,
  o: { m: SMesh; xf: Xf; color: string; accent?: string; opacity: number; width?: number; shadow?: number; reflect?: number; reg?: boolean; glow?: number },
): Item[] => {
  let op = o.opacity;
  if (op <= 0.001) return [];
  const zc = toCam(c, o.xf.p)[2];
  if (zc < NEAR + 60) return [];
  op *= nearFade(zc);
  const w = (o.width ?? 2.4) * Math.max(0.65, Math.min(1.5, 1000 / zc));
  const main = draw(c, { m: o.m, xf: o.xf, color: o.color, accent: o.accent, width: w, mirror: false });
  if (!main.pts2.length) return [];
  const bx = { x0: Math.min(...main.pts2.map((p) => p.x)), x1: Math.max(...main.pts2.map((p) => p.x)), y0: Math.min(...main.pts2.map((p) => p.y)), y1: Math.max(...main.pts2.map((p) => p.y)) };
  const g = globalThis as G;
  if (o.reg !== false && g.__LAYOUT && op > 0.3) g.__LAYOUT.push({ key, kind: "obj", ...bx, op });
  const blur = dof(c, zc);
  const items: Item[] = [
    {
      z: zc,
      node: (
        <svg key={key} width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op, filter: `drop-shadow(0 0 ${o.glow ?? 6}px ${o.color})${blur > 0.6 ? ` blur(${blur.toFixed(1)}px)` : ""}` }}>
          {main.nodes}
        </svg>
      ),
    },
  ];
  if ((o.reflect ?? 0.16) > 0) {
    const mir = draw(c, { m: o.m, xf: o.xf, color: o.color, accent: o.accent, width: w * 0.7, mirror: true });
    items.push({ z: zc + 1, node: <svg key={key + "-r"} width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op * (o.reflect ?? 0.16), filter: `blur(${(2.5 + blur).toFixed(1)}px)` }}>{mir.nodes}</svg> });
  }
  if (o.shadow) {
    const ring = Array.from({ length: 28 }, (_, i) => {
      const a = (i / 28) * Math.PI * 2;
      return toCam(c, [o.xf.p[0] + Math.cos(a) * o.shadow!, 0.5, o.xf.p[2] + Math.sin(a) * o.shadow!]);
    });
    if (ring.every((q) => q[2] > NEAR)) {
      const sp = ring.map((q) => ({ x: VIEW.cx + (VIEW.f * q[0]) / q[2], y: VIEW.cy - (VIEW.f * q[1]) / q[2] }));
      items.push({
        z: zc + 2,
        node: (
          <svg key={key + "-sh"} width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>
            <defs>
              <radialGradient id={`${key}-shg`}>
                <stop offset="0" stopColor="#000" stopOpacity={0.75} />
                <stop offset="1" stopColor="#000" stopOpacity={0} />
              </radialGradient>
            </defs>
            <polygon points={sp.map((p) => `${p.x},${p.y}`).join(" ")} fill={`url(#${key}-shg)`} />
          </svg>
        ),
      });
    }
  }
  return items;
};
