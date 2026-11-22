import React from "react";
import { Cam, camSeg, dof, Item, NEAR, nearFade, toCam, V3, VIEW, W, H } from "../v6/engine";

/**
 * Real 3D for the neon world: meshes (edges + lit translucent faces) built from extrusions,
 * boxes and cylinders, and text slabs — HTML planes placed in 3D with a perspective-correct
 * homography (CSS matrix3d) and extruded by stacking darker copies behind. Every text slab and
 * mesh records its screen box in the layout registry so overlaps can be checked without rendering.
 */

/* ------------------------------------------------------------ layout registry */
export type Box = { key: string; kind: "text" | "obj"; x0: number; y0: number; x1: number; y1: number; op: number };
type G = { __LAYOUT?: Box[] };
const reg = (b: Box) => {
  const g = globalThis as G;
  if (g.__LAYOUT && b.op > 0.3) g.__LAYOUT.push(b);
};

/* ------------------------------------------------------------- transforms */
/** Local → world: rotate about x (tilt), then about y (yaw), then translate to p. */
export type Xf = { p: V3; yaw?: number; tilt?: number; s?: number };
export const tf = (x: Xf, q: V3): V3 => {
  const s = x.s ?? 1;
  const lx = q[0] * s;
  let ly = q[1] * s;
  let lz = q[2] * s;
  const t = x.tilt ?? 0;
  if (t) [ly, lz] = [ly * Math.cos(t) - lz * Math.sin(t), ly * Math.sin(t) + lz * Math.cos(t)];
  const a = x.yaw ?? 0;
  return [x.p[0] + lx * Math.cos(a) + lz * Math.sin(a), x.p[1] + ly, x.p[2] - lx * Math.sin(a) + lz * Math.cos(a)];
};
const scr = (q: V3) => ({ x: VIEW.cx + (VIEW.f * q[0]) / q[2], y: VIEW.cy - (VIEW.f * q[1]) / q[2] });

/* ------------------------------------------------------------------ meshes */
export type Mesh = { edges: [V3, V3][]; faces: V3[][]; accents?: [V3, V3][] };
export const emptyMesh = (): Mesh => ({ edges: [], faces: [], accents: [] });
export const merge = (...ms: Mesh[]): Mesh => ({ edges: ms.flatMap((m) => m.edges), faces: ms.flatMap((m) => m.faces), accents: ms.flatMap((m) => m.accents ?? []) });

/** Extrude closed/open 2D outlines (x right, y up) to depth d, centred on z = 0. */
export const extrude = (outlines: { pts: [number, number][]; closed?: boolean }[], d: number, every = 3): Mesh => {
  const m = emptyMesh();
  outlines.forEach((o) => {
    const P = o.pts;
    const n = P.length;
    const segN = o.closed ? n : n - 1;
    for (let i = 0; i < segN; i++) {
      const a = P[i];
      const b = P[(i + 1) % n];
      const fa: V3 = [a[0], a[1], -d / 2];
      const fb: V3 = [b[0], b[1], -d / 2];
      const ba: V3 = [a[0], a[1], d / 2];
      const bb: V3 = [b[0], b[1], d / 2];
      m.edges.push([fa, fb], [ba, bb]);
      m.faces.push([fa, fb, bb, ba]);
      if (i % every === 0) m.edges.push([fa, ba]);
    }
    if (o.closed) {
      m.faces.push(P.map((q) => [q[0], q[1], -d / 2] as V3));
      m.faces.push(P.map((q) => [q[0], q[1], d / 2] as V3));
    }
  });
  return m;
};
/** Lines drawn on the front face (z = -d/2 - 0.5): stitching, locks, screens, clock hands. */
export const decal = (lines: [number, number][][], d: number): Mesh => {
  const m = emptyMesh();
  lines.forEach((L) => {
    for (let i = 0; i < L.length - 1; i++) m.accents!.push([[L[i][0], L[i][1], -d / 2 - 0.5], [L[i + 1][0], L[i + 1][1], -d / 2 - 0.5]]);
  });
  return m;
};
export const box = (w: number, h: number, d: number, y0 = 0): Mesh => {
  const x = w / 2;
  const z = d / 2;
  const v: V3[] = [[-x, y0, -z], [x, y0, -z], [x, y0 + h, -z], [-x, y0 + h, -z], [-x, y0, z], [x, y0, z], [x, y0 + h, z], [-x, y0 + h, z]];
  const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  const F = [[0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0]];
  return { edges: E.map(([a, b]) => [v[a], v[b]]), faces: F.map((f) => f.map((i) => v[i])), accents: [] };
};
export const circle = (r: number, n = 32): [number, number][] => Array.from({ length: n }, (_, i) => [Math.cos((i / n) * Math.PI * 2) * r, Math.sin((i / n) * Math.PI * 2) * r]);
/** Vertical cylinder (axis = y) from y0 to y0 + h, with optional rings (e.g. coin edges). */
export const cylinder = (r: number, h: number, y0 = 0, n = 28, rings = 0): Mesh => {
  const m = emptyMesh();
  const ring = (y: number) => Array.from({ length: n }, (_, i) => [Math.cos((i / n) * Math.PI * 2) * r, y, Math.sin((i / n) * Math.PI * 2) * r] as V3);
  const top = ring(y0 + h);
  const bot = ring(y0);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    m.edges.push([top[i], top[j]], [bot[i], bot[j]]);
    m.faces.push([bot[i], bot[j], top[j], top[i]]);
    if (i % 4 === 0) m.edges.push([bot[i], top[i]]);
  }
  for (let k = 1; k <= rings; k++) {
    const rr = ring(y0 + (h * k) / (rings + 1));
    for (let i = 0; i < n; i++) m.accents!.push([rr[i], rr[(i + 1) % n]]);
  }
  m.faces.push(top);
  return m;
};

/** Draw a mesh: faces back-to-front with simple lighting, then glowing edges and accents. */
export const mesh = (
  c: Cam,
  key: string,
  o: { m: Mesh; xf: Xf; color: string; accent?: string; opacity: number; fill?: number; width?: number; reg?: boolean },
): Item | null => {
  let op = o.opacity;
  if (op <= 0.001) return null;
  const zc = toCam(c, o.xf.p)[2];
  if (zc < NEAR + 60) return null;
  op *= nearFade(zc);
  const fill = o.fill ?? 0.14;
  const faces = o.m.faces
    .map((f) => {
      const cs = f.map((q) => toCam(c, tf(o.xf, q)));
      if (cs.some((q) => q[2] < NEAR)) return null;
      const depth = cs.reduce((a, q) => a + q[2], 0) / cs.length;
      const u = [cs[1][0] - cs[0][0], cs[1][1] - cs[0][1], cs[1][2] - cs[0][2]];
      const v = [cs[cs.length - 1][0] - cs[0][0], cs[cs.length - 1][1] - cs[0][1], cs[cs.length - 1][2] - cs[0][2]];
      const nx = u[1] * v[2] - u[2] * v[1];
      const ny = u[2] * v[0] - u[0] * v[2];
      const nz = u[0] * v[1] - u[1] * v[0];
      const nl = Math.hypot(nx, ny, nz) || 1;
      const light = Math.abs((nx * 0.3 + ny * 0.8 - nz * 0.5) / nl);
      return { pts: cs.map(scr), depth, a: fill * (0.45 + 0.9 * light) };
    })
    .filter(Boolean) as { pts: { x: number; y: number }[]; depth: number; a: number }[];
  faces.sort((a, b) => b.depth - a.depth);
  const seg = (e: [V3, V3]) => camSeg(c, tf(o.xf, e[0]), tf(o.xf, e[1]));
  const edges = o.m.edges.map(seg).filter(Boolean) as unknown as { x: number; y: number }[][];
  const acc = (o.m.accents ?? []).map(seg).filter(Boolean) as unknown as { x: number; y: number }[][];
  if (!edges.length) return null;
  const all = edges.flat();
  const bx = { x0: Math.min(...all.map((p) => p.x)), x1: Math.max(...all.map((p) => p.x)), y0: Math.min(...all.map((p) => p.y)), y1: Math.max(...all.map((p) => p.y)) };
  if (o.reg !== false) reg({ key, kind: "obj", ...bx, op });
  const blur = dof(c, zc);
  const w = o.width ?? 2.4;
  return {
    z: zc,
    node: (
      <svg key={key} width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op, filter: `drop-shadow(0 0 7px ${o.color})${blur > 0.6 ? ` blur(${blur.toFixed(1)}px)` : ""}` }}>
        {faces.map((f, i) => (
          <polygon key={`f${i}`} points={f.pts.map((p) => `${p.x},${p.y}`).join(" ")} fill={o.color} fillOpacity={f.a} />
        ))}
        {edges.map((s, i) => (
          <line key={`e${i}`} x1={s[0].x} y1={s[0].y} x2={s[1].x} y2={s[1].y} stroke={o.color} strokeWidth={w} strokeLinecap="round" />
        ))}
        {acc.map((s, i) => (
          <line key={`a${i}`} x1={s[0].x} y1={s[0].y} x2={s[1].x} y2={s[1].y} stroke={o.accent ?? o.color} strokeWidth={w * 0.9} strokeLinecap="round" />
        ))}
      </svg>
    ),
  };
};

/* ------------------------------------------------------------- text slabs */
const solve = (A: number[][], b: number[]) => {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    [M[i], M[p]] = [M[p], M[i]];
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const k = M[r][i] / M[i][i];
      for (let col = i; col <= n; col++) M[r][col] -= k * M[i][col];
    }
  }
  return M.map((r, i) => r[n] / r[i]);
};
/** CSS matrix3d mapping the w×h element rect onto four screen points (TL, TR, BR, BL). */
const quadMatrix = (w: number, h: number, d: { x: number; y: number }[]) => {
  const s = [[0, 0], [w, 0], [w, h], [0, h]];
  const A: number[][] = [];
  const b: number[] = [];
  s.forEach(([x, y], i) => {
    A.push([x, y, 1, 0, 0, 0, -x * d[i].x, -y * d[i].x]);
    b.push(d[i].x);
    A.push([0, 0, 0, x, y, 1, -x * d[i].y, -y * d[i].y]);
    b.push(d[i].y);
  });
  const [a0, a1, a2, a3, a4, a5, a6, a7] = solve(A, b);
  return `matrix3d(${a0},${a3},0,${a6},${a1},${a4},0,${a7},0,0,1,0,${a2},${a5},0,1)`;
};

/**
 * A text slab in 3D: an HTML panel (w×h) standing at p, facing yaw, extruded `depth` units back with
 * `layers` darker copies so the letters read as solid 3D. Hidden when seen from behind.
 */
export const slab = (
  c: Cam,
  key: string,
  o: { p: V3; w: number; h: number; yaw: number; opacity: number; depth?: number; layers?: number; children: React.ReactNode; edge?: string },
): Item | null => {
  let op = o.opacity;
  if (op <= 0.001) return null;
  const R: V3 = [Math.cos(o.yaw), 0, -Math.sin(o.yaw)];
  const N: V3 = [Math.sin(o.yaw), 0, Math.cos(o.yaw)];
  // facing check: the camera must be in front of the plane
  const toC = [c.x - o.p[0], c.y - o.p[1], c.z - o.p[2]];
  const facing = -(toC[0] * N[0] + toC[2] * N[2]) / Math.hypot(toC[0], toC[2]);
  if (facing < 0.15) return null;
  const zc = toCam(c, o.p)[2];
  if (zc < NEAR + 60) return null;
  op *= nearFade(zc) * Math.min(1, (facing - 0.15) / 0.25);
  const quad = (back: number) => {
    const at = (sx: number, sy: number): V3 => [o.p[0] + R[0] * sx + N[0] * back, o.p[1] + sy, o.p[2] + R[2] * sx + N[2] * back];
    const cs = [at(-o.w / 2, o.h / 2), at(o.w / 2, o.h / 2), at(o.w / 2, -o.h / 2), at(-o.w / 2, -o.h / 2)].map((q) => toCam(c, q));
    if (cs.some((q) => q[2] < NEAR + 10)) return null;
    return cs.map(scr);
  };
  const front = quad(0);
  if (!front) return null;
  reg({ key, kind: "text", x0: Math.min(...front.map((p) => p.x)), x1: Math.max(...front.map((p) => p.x)), y0: Math.min(...front.map((p) => p.y)), y1: Math.max(...front.map((p) => p.y)), op });
  const L = o.layers ?? 6;
  const D = o.depth ?? 14;
  const blur = dof(c, zc) * 0.8;
  const nodes: React.ReactNode[] = [];
  for (let i = L; i >= 0; i--) {
    const q = i === 0 ? front : quad((D * i) / L);
    if (!q) continue;
    nodes.push(
      <div
        key={`${key}-${i}`}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: o.w,
          height: o.h,
          transformOrigin: "0 0",
          transform: quadMatrix(o.w, o.h, q),
          filter: i === 0 ? (blur > 0.6 ? `blur(${blur.toFixed(1)}px)` : undefined) : `brightness(${0.32 - (0.18 * i) / L}) saturate(0.8)`,
        }}
      >
        {o.children}
      </div>,
    );
  }
  return { z: zc, node: <div key={key} style={{ position: "absolute", inset: 0, opacity: op }}>{nodes}</div> };
};
