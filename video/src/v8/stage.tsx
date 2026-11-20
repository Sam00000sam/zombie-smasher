import React from "react";
import { random } from "remotion";
import { Cam, hull, Item, nearFade, NEAR, toCam, V3, VIEW, W, H, dof } from "../v6/engine";
import { DISPLAY, UI } from "./fonts";

/* palette: charcoal, champagne gold, warm white; red/green only for money */
export const GOLD = "#f2c14e";
export const GOLD_SOFT = "rgba(242,193,78,0.55)";
export const WHITE = "#f6f3ec";
export const MUTED = "rgba(246,243,236,0.58)";
export const RED = "#ff5a5f";
export const GREEN = "#3ddc97";

const sp = (q: V3) => ({ x: VIEW.cx + (VIEW.f * q[0]) / q[2], y: VIEW.cy - (VIEW.f * q[1]) / q[2] });

/** Glossy black pedestal (a short cylinder) with a thin gold rim, standing on the floor at p. */
export const disc = (c: Cam, key: string, o: { p: V3; r: number; h: number; opacity?: number }): Item | null => {
  let op = o.opacity ?? 1;
  if (op <= 0.001) return null;
  const zc = toCam(c, o.p)[2];
  if (zc < NEAR + 80) return null;
  op *= nearFade(zc);
  const ring = (y: number) => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 48; i++) {
      const t = (i / 48) * Math.PI * 2;
      const q = toCam(c, [o.p[0] + Math.cos(t) * o.r, y, o.p[2] + Math.sin(t) * o.r]);
      if (q[2] < NEAR) return null;
      pts.push(sp(q));
    }
    return pts;
  };
  const top = ring(o.h);
  const bot = ring(0);
  if (!top || !bot) return null;
  const side = hull([...top, ...bot]);
  const pts = (a: { x: number; y: number }[]) => a.map((q) => `${q.x},${q.y}`).join(" ");
  const minY = Math.min(...side.map((q) => q.y));
  const maxY = Math.max(...side.map((q) => q.y));
  const blur = dof(c, zc);
  return {
    z: zc + 3,
    node: (
      <svg key={key} width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>
        <defs>
          <linearGradient id={`${key}-sd`} gradientUnits="userSpaceOnUse" x1={0} y1={minY} x2={0} y2={maxY}>
            <stop offset="0" stopColor="#2a2a30" />
            <stop offset="1" stopColor="#060607" />
          </linearGradient>
          <radialGradient id={`${key}-tp`} cx="0.42" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#34343b" />
            <stop offset="1" stopColor="#111114" />
          </radialGradient>
        </defs>
        <polygon points={pts(side)} fill={`url(#${key}-sd)`} />
        <polygon points={pts(top)} fill={`url(#${key}-tp)`} stroke={GOLD_SOFT} strokeWidth={1.6} />
      </svg>
    ),
  };
};

/** Rain falling through a box of space (centre c, half-width w, depth d, height h). */
export const rain = (c: Cam, key: string, o: { c: V3; w: number; d: number; h: number; fr: number; opacity: number }): Item | null => {
  if (o.opacity <= 0.001) return null;
  const segs: React.ReactNode[] = [];
  for (let i = 0; i < 70; i++) {
    const x = o.c[0] + (random(`${key}x${i}`) - 0.5) * 2 * o.w;
    const z = o.c[2] + (random(`${key}z${i}`) - 0.5) * 2 * o.d;
    const y = o.h - ((o.fr * 38 + random(`${key}y${i}`) * o.h) % o.h);
    const a = toCam(c, [x, y, z]);
    const b = toCam(c, [x - 6, y + 46, z]);
    if (a[2] < NEAR || b[2] < NEAR) continue;
    const A = sp(a);
    const B = sp(b);
    segs.push(<line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#bfe6ff" strokeOpacity={0.55} strokeWidth={Math.max(1, 2.2 * (VIEW.f / a[2]))} strokeLinecap="round" />);
  }
  return { z: toCam(c, o.c)[2] - 50, node: <svg key={key} width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o.opacity }}>{segs}</svg> };
};

/* ------------------------------------------------------------ type + panels */
export const Txt: React.FC<{ s: number; c?: string; w?: number; ls?: string; ui?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ s, c = WHITE, w = 800, ls = "0", ui, children, style }) => (
  <div style={{ fontFamily: ui ? UI : DISPLAY, fontSize: s, fontWeight: w, letterSpacing: ls, color: c, lineHeight: 1.04, whiteSpace: "nowrap", ...style }}>{children}</div>
);
export const goldText: React.CSSProperties = {
  background: "linear-gradient(180deg, #fff3c9 0%, #f2c14e 48%, #b07d24 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};
/** Frosted-glass panel that fills its card. */
export const Glass: React.FC<{ gold?: boolean; r?: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ gold, r = 28, children, style }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: r,
      background: "linear-gradient(160deg, rgba(255,255,255,0.11), rgba(255,255,255,0.025) 60%)",
      border: `1.5px solid ${gold ? "rgba(242,193,78,0.6)" : "rgba(255,255,255,0.16)"}`,
      boxShadow: `0 30px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.2)${gold ? ", 0 0 40px rgba(242,193,78,0.18)" : ""}`,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);
export const Fill: React.FC<{ children: React.ReactNode; gap?: number; row?: boolean; style?: React.CSSProperties }> = ({ children, gap = 8, row, style }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: row ? "row" : "column", alignItems: "center", justifyContent: "center", gap, ...style }}>{children}</div>
);
/** Small label chip. */
export const Chip: React.FC<{ text: string; gold?: boolean; s?: number }> = ({ text, gold, s = 26 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: 999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: gold ? "linear-gradient(180deg, #f7d27a, #d9a43a)" : "rgba(255,255,255,0.08)",
      border: gold ? "none" : "1.5px solid rgba(255,255,255,0.22)",
      boxShadow: gold ? "0 10px 30px rgba(242,193,78,0.35)" : "0 10px 24px rgba(0,0,0,0.4)",
      fontFamily: UI,
      fontWeight: 800,
      fontSize: s,
      letterSpacing: "0.22em",
      color: gold ? "#1a1406" : WHITE,
      paddingLeft: "0.22em",
    }}
  >
    {text}
  </div>
);
export const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
