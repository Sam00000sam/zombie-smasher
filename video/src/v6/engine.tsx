import React from "react";
import { random } from "remotion";
import { FONT } from "../v2/theme";

/**
 * Tiny 3D engine for the vertical "neon world" style: a perspective camera (position, yaw, pitch),
 * projection to screen, depth-sorted items, depth-of-field blur, a receding floor grid, neon cards,
 * wireframe boxes, glossy pawns with floor reflections, 3D polylines and bokeh motes.
 * World units ≈ pixels at 1 m… (a card 400 wide at distance F is 400 px on screen).
 */
export const W = 1080;
export const H = 1920;
export const F = 1180; // focal length (px)
export const CX = W / 2;
export const CY = 880; // horizon sits a little above centre

export const GOLD = "#ffd04d";
export const RED = "#ff4a5a";
export const GREEN = "#36e3a3";
export const INK = "#ffffff";

export type V3 = [number, number, number];
export type Cam = { x: number; y: number; z: number; yaw: number; pitch: number; focus: number };
export type Item = { z: number; node: React.ReactNode };

/** World → camera space. yaw: + looks right; pitch: − looks down. */
export const toCam = (c: Cam, p: V3): V3 => {
  const dx = p[0] - c.x;
  const dy = p[1] - c.y;
  const dz = p[2] - c.z;
  const cy = Math.cos(c.yaw);
  const sy = Math.sin(c.yaw);
  const xc = dx * cy - dz * sy;
  const zc = dx * sy + dz * cy;
  const cp = Math.cos(c.pitch);
  const sp = Math.sin(c.pitch);
  return [xc, dy * cp - zc * sp, dy * sp + zc * cp];
};
export const NEAR = 40;
export const proj = (c: Cam, p: V3) => {
  const [x, y, z] = toCam(c, p);
  return { x: CX + (F * x) / z, y: CY - (F * y) / z, s: F / z, z };
};
/** Depth-of-field blur (screen px) for something at camera depth z. */
/** Things the camera flies past fade out before they can fill the lens. */
export const nearFade = (z: number) => Math.max(0, Math.min(1, (z - 240) / 380));
export const dof = (c: Cam, z: number) => Math.min(10, (Math.abs(z - c.focus) / c.focus) * 8);

const camSeg = (c: Cam, a: V3, b: V3) => {
  let A = toCam(c, a);
  let B = toCam(c, b);
  if (A[2] < NEAR && B[2] < NEAR) return null;
  if (A[2] < NEAR) {
    const t = (NEAR - A[2]) / (B[2] - A[2]);
    A = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, NEAR];
  } else if (B[2] < NEAR) {
    const t = (NEAR - B[2]) / (A[2] - B[2]);
    B = [B[0] + (A[0] - B[0]) * t, B[1] + (A[1] - B[1]) * t, NEAR];
  }
  const s = (q: V3) => ({ x: CX + (F * q[0]) / q[2], y: CY - (F * q[1]) / q[2], z: q[2] });
  return [s(A), s(B)] as const;
};

/* ------------------------------------------------------------------ floor */
/** Receding floor grid (y = 0) that fades with distance; optional court circles at given centres. */
export const floor = (c: Cam, circles: V3[] = []): Item => {
  const lines: React.ReactNode[] = [];
  const zMin = Math.floor((c.z - 400) / 200) * 200;
  const zMax = c.z + 6000;
  const xMin = Math.floor((c.x - 3200) / 200) * 200;
  let k = 0;
  // lines running away from camera, in chunks so they fade with distance
  for (let x = xMin; x <= c.x + 3200; x += 200) {
    for (let z = zMin; z < zMax; z += 600) {
      const s = camSeg(c, [x, 0, z], [x, 0, z + 600]);
      if (!s) continue;
      const a = Math.max(0, 1 - s[0].z / 5200) * 0.22;
      if (a < 0.01) continue;
      lines.push(<line key={k++} x1={s[0].x} y1={s[0].y} x2={s[1].x} y2={s[1].y} stroke={INK} strokeOpacity={a} strokeWidth={1.2} />);
    }
  }
  // cross lines
  for (let z = zMin; z < zMax; z += 200) {
    const s = camSeg(c, [xMin, 0, z], [c.x + 3200, 0, z]);
    if (!s) continue;
    const a = Math.max(0, 1 - s[0].z / 5200) * 0.16;
    if (a < 0.01) continue;
    lines.push(<line key={k++} x1={s[0].x} y1={s[0].y} x2={s[1].x} y2={s[1].y} stroke={INK} strokeOpacity={a} strokeWidth={1} />);
  }
  // court circles
  circles.forEach((cc) => {
    const pts: { x: number; y: number }[] = [];
    let ok = true;
    for (let i = 0; i <= 48; i++) {
      const t = (i / 48) * Math.PI * 2;
      const q = toCam(c, [cc[0] + Math.cos(t) * cc[1], 0, cc[2] + Math.sin(t) * cc[1]]);
      if (q[2] < NEAR) {
        ok = false;
        break;
      }
      pts.push({ x: CX + (F * q[0]) / q[2], y: CY - (F * q[1]) / q[2] });
    }
    if (ok) lines.push(<polyline key={k++} points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={INK} strokeOpacity={0.28} strokeWidth={1.6} />);
  });
  return {
    z: 1e9,
    node: (
      <svg key="floor" width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {lines}
      </svg>
    ),
  };
};

/* ------------------------------------------------------------------ cards */
export const neon = (col: string, strength = 1): React.CSSProperties => ({
  border: `3px solid ${col}`,
  borderRadius: 16,
  background: "rgba(5,5,8,0.82)",
  boxShadow: `0 0 ${22 * strength}px ${col}99, inset 0 0 ${16 * strength}px ${col}44`,
});

/** A flat card in 3D (faces the camera's forward axis, optional extra yaw), optionally hanging on a string. */
export const card = (
  c: Cam,
  key: string,
  o: { p: V3; w: number; h: number; yaw?: number; opacity?: number; string?: boolean; children: React.ReactNode; noBlur?: boolean },
): Item | null => {
  let op = o.opacity ?? 1;
  if (op <= 0.001) return null;
  const pr = proj(c, o.p);
  if (pr.z < NEAR + 20) return null;
  op *= nearFade(pr.z);
  const tilt = ((o.yaw ?? 0) - c.yaw) * 57.3;
  const blur = o.noBlur ? 0 : dof(c, pr.z);
  const nodes: React.ReactNode[] = [];
  if (o.string) {
    const s = camSeg(c, [o.p[0], o.p[1] + o.h / 2, o.p[2]], [o.p[0], o.p[1] + 4000, o.p[2]]);
    if (s)
      nodes.push(
        <svg key={key + "-s"} width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>
          <line x1={s[0].x} y1={s[0].y} x2={s[1].x} y2={s[1].y} stroke={INK} strokeOpacity={0.55} strokeWidth={1.5} />
        </svg>,
      );
  }
  nodes.push(
    <div
      key={key}
      style={{
        position: "absolute",
        left: pr.x,
        top: pr.y,
        width: o.w,
        height: o.h,
        transform: `translate(-50%, -50%) scale(${pr.s}) perspective(1600px) rotateY(${tilt}deg)`,
        opacity: op,
        filter: blur > 0.5 ? `blur(${(blur / pr.s).toFixed(2)}px)` : undefined,
      }}
    >
      {o.children}
    </div>,
  );
  return { z: pr.z, node: <React.Fragment key={key + "-f"}>{nodes}</React.Fragment> };
};

/* ------------------------------------------------------------- wire boxes */
export const wireBox = (c: Cam, key: string, o: { c: V3; size: V3; yaw?: number; color: string; opacity?: number; width?: number }): Item | null => {
  let op = o.opacity ?? 1;
  if (op <= 0.001) return null;
  const [w, h, d] = o.size;
  const ya = o.yaw ?? 0;
  const cs = Math.cos(ya);
  const sn = Math.sin(ya);
  const v = (sx: number, sy: number, sz: number): V3 => {
    const lx = (sx * w) / 2;
    const lz = (sz * d) / 2;
    return [o.c[0] + lx * cs - lz * sn, o.c[1] + (sy * h) / 2, o.c[2] + lx * sn + lz * cs];
  };
  const P = [v(-1, -1, -1), v(1, -1, -1), v(1, 1, -1), v(-1, 1, -1), v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1)];
  const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  const segs = E.map(([a, b]) => camSeg(c, P[a], P[b])).filter(Boolean) as unknown as { x: number; y: number; z: number }[][];
  if (!segs.length) return null;
  const zc = toCam(c, o.c)[2];
  op *= nearFade(zc);
  const blur = dof(c, zc);
  return {
    z: zc,
    node: (
      <svg key={key} width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op, filter: `drop-shadow(0 0 8px ${o.color}) ${blur > 0.5 ? `blur(${blur}px)` : ""}` }}>
        {segs.map((s, i) => (
          <line key={i} x1={s[0].x} y1={s[0].y} x2={s[1].x} y2={s[1].y} stroke={o.color} strokeWidth={o.width ?? 3} strokeLinecap="round" />
        ))}
      </svg>
    ),
  };
};

/* --------------------------------------------------------------- polylines */
/** 3D polyline drawn up to progress p, with a glowing dot riding the tip. */
export const line3 = (c: Cam, key: string, o: { pts: V3[]; p: number; color: string; width?: number; opacity?: number; dot?: boolean }): Item | null => {
  const op = o.opacity ?? 1;
  if (op <= 0.001 || o.p <= 0) return null;
  const n = o.pts.length - 1;
  const upto = o.p * n;
  const segs: React.ReactNode[] = [];
  let tip: { x: number; y: number } | null = null;
  for (let i = 0; i < n && i < upto; i++) {
    const t = Math.min(1, upto - i);
    const a = o.pts[i];
    const b: V3 = [a[0] + (o.pts[i + 1][0] - a[0]) * t, a[1] + (o.pts[i + 1][1] - a[1]) * t, a[2] + (o.pts[i + 1][2] - a[2]) * t];
    const s = camSeg(c, a, b);
    if (!s) continue;
    segs.push(<line key={i} x1={s[0].x} y1={s[0].y} x2={s[1].x} y2={s[1].y} stroke={o.color} strokeWidth={o.width ?? 5} strokeLinecap="round" />);
    tip = s[1];
  }
  const zc = toCam(c, o.pts[Math.min(n, Math.floor(upto))])[2];
  return {
    z: zc,
    node: (
      <svg key={key} width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op, filter: `drop-shadow(0 0 10px ${o.color})` }}>
        {segs}
        {o.dot && tip && (
          <>
            <circle cx={tip.x} cy={tip.y} r={22} fill={o.color} opacity={0.25} />
            <circle cx={tip.x} cy={tip.y} r={9} fill="#fff" />
          </>
        )}
      </svg>
    ),
  };
};

/* ------------------------------------------------------------------- pawns */
/** Glossy white pawn standing on the floor, with a gold tie and a floor reflection. */
export const pawn = (c: Cam, key: string, o: { p: V3; h?: number; opacity?: number; raise?: number; tie?: boolean; q?: number; hop?: number }): Item | null => {
  let op = o.opacity ?? 1;
  if (op <= 0.001) return null;
  const h = o.h ?? 200;
  const feet = proj(c, [o.p[0], (o.hop ?? 0), o.p[2]]);
  if (feet.z < NEAR + 20) return null;
  op *= nearFade(feet.z);
  const sh = h * feet.s;
  const sw = sh * 0.62;
  const blur = dof(c, feet.z);
  const raise = o.raise ?? 0;
  const id = `pg-${key}`;
  const body = (flip: boolean) => (
    <svg width={sw} height={sh} viewBox="0 0 62 100" style={{ overflow: "visible", display: "block", transform: flip ? "scaleY(-1)" : undefined }}>
      <defs>
        <radialGradient id={`${id}-b`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#e9e9ee" />
          <stop offset="1" stopColor="#9a9aa4" />
        </radialGradient>
        <radialGradient id={`${id}-h`} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#b9b9c2" />
        </radialGradient>
      </defs>
      {raise > 0.05 &&
        [-1, 1].map((sd) => {
          const a = ((sd * (160 - 125 * raise)) * Math.PI) / 180;
          const sx = 31 + sd * 18;
          return <line key={sd} x1={sx} y1={50} x2={sx + Math.sin(a) * 30} y2={50 - Math.cos(a) * 30} stroke="#e8e8ee" strokeWidth={9} strokeLinecap="round" />;
        })}
      <circle cx={31} cy={17} r={16} fill={`url(#${id}-h)`} />
      <path d="M4 100 C4 62 14 40 31 40 C48 40 58 62 58 100 Z" fill={`url(#${id}-b)`} />
      {(o.tie ?? true) && <path d="M31 44 L35 50 L33 76 L31 80 L29 76 L27 50 Z" fill={GOLD} />}
    </svg>
  );
  return {
    z: feet.z,
    node: (
      <div key={key} style={{ position: "absolute", left: feet.x - sw / 2, top: feet.y - sh, width: sw, height: sh, opacity: op, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>
        <div style={{ position: "absolute", left: -sw * 0.5, top: sh - sh * 0.08, width: sw * 2, height: sh * 0.16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,255,255,0.35), rgba(255,255,255,0) 70%)" }} />
        <div style={{ filter: "drop-shadow(0 0 14px rgba(255,255,255,0.55))" }}>{body(false)}</div>
        <div style={{ position: "absolute", left: 0, top: sh + 2, opacity: 0.22, filter: "blur(2px)", WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0) 60%)" }}>{body(true)}</div>
        {(o.q ?? 0) > 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: -sh * 0.42, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: sh * 0.32, color: GOLD, opacity: o.q, textShadow: `0 0 16px ${GOLD}` }}>?</div>
        )}
      </div>
    ),
  };
};

/* -------------------------------------------------------------------- motes */
const MOTES = Array.from({ length: 140 }, (_, i) => ({
  x: random(`m3x${i}`) * 3000 - 1500,
  y: 60 + random(`m3y${i}`) * 1400,
  z: random(`m3z${i}`) * 16000,
  r: 2 + random(`m3r${i}`) * 3,
  gold: random(`m3g${i}`) > 0.6,
}));
/** Floating specks in 3D; out-of-focus ones become soft bokeh. */
export const motes = (c: Cam, fr: number): Item[] =>
  MOTES.map((m, i) => {
    const p = proj(c, [m.x + Math.sin(fr / 70 + i) * 30, m.y + Math.sin(fr / 50 + i * 2) * 20, m.z]);
    if (p.z < NEAR + 10 || p.z > 5000 || p.x < -100 || p.x > W + 100 || p.y < -100 || p.y > H + 100) return null;
    const blur = dof(c, p.z);
    const r = Math.max(1.5, m.r * p.s) + blur * 1.6;
    return {
      z: p.z,
      node: <div key={`mote${i}`} style={{ position: "absolute", left: p.x - r, top: p.y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: m.gold ? GOLD : INK, opacity: Math.min(0.55, 0.9 / (1 + blur * 0.6)) * (1 - p.z / 5000), filter: blur > 0.5 ? `blur(${blur * 0.8}px)` : undefined }} />,
    };
  }).filter(Boolean) as Item[];
