import React from "react";
import { random, useCurrentFrame } from "remotion";
import { prog } from "../v2/anim";
import { GRID } from "../v2/theme";
import { INK } from "../v2/theme";

/** Oversized dotted grid so the camera can zoom out / pan without revealing edges. */
export const BigGrid: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const S = 30;
  const ox = ((-x % S) + S) % S;
  const oy = ((-y % S) + S) % S;
  return (
    <svg width={3840} height={2160} style={{ position: "absolute", left: -960, top: -540 }}>
      <defs>
        <pattern id="big-grid" width={S} height={S} patternUnits="userSpaceOnUse" x={ox} y={oy}>
          <circle cx={S / 2} cy={S / 2} r={1.15} fill={GRID} />
        </pattern>
      </defs>
      <rect width={3840} height={2160} fill="url(#big-grid)" />
    </svg>
  );
};

/** Drifting motes of light on a parallax layer (moves at a different rate to the content). */
const MOTES = Array.from({ length: 46 }, (_, i) => ({
  x: random(`mx${i}`) * 3000 - 540,
  y: random(`my${i}`) * 1800 - 360,
  r: 1 + random(`mr${i}`) * 2.4,
  sp: 0.2 + random(`ms${i}`) * 0.5,
  ph: random(`mp${i}`) * 6.28,
  depth: 0.25 + random(`md${i}`) * 0.5,
}));
export const Motes: React.FC<{ camX: number; camY: number }> = ({ camX, camY }) => {
  const fr = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {MOTES.map((m, i) => {
        const x = m.x - camX * m.depth + Math.sin(fr / 60 + m.ph) * 20;
        const y = m.y - camY * m.depth - fr * m.sp;
        const yy = ((y % 1800) + 1800) % 1800 - 360;
        const tw = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(fr / 25 + m.ph));
        return <div key={i} style={{ position: "absolute", left: x, top: yy, width: m.r * 2, height: m.r * 2, borderRadius: m.r, background: INK, opacity: tw * 0.5, boxShadow: `0 0 ${m.r * 4}px rgba(255,255,255,0.6)` }} />;
      })}
    </div>
  );
};

/** Slowly rotating dotted orbit ring with a travelling dot — HUD flourish around a focal object. */
export const Orbit: React.FC<{ x: number; y: number; r: number; start: number; speed?: number; o?: number; ticks?: boolean }> = ({
  x,
  y,
  r,
  start,
  speed = 1,
  o = 1,
  ticks = false,
}) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 18);
  if (p <= 0 || o <= 0) return null;
  const a = ((fr - start) * 0.9 * speed) % 360;
  const dot = ((fr - start) * 2.2 * speed * Math.PI) / 180;
  return (
    <svg width={r * 2 + 40} height={r * 2 + 40} style={{ position: "absolute", left: x - r - 20, top: y - r - 20, overflow: "visible", opacity: p * o, pointerEvents: "none" }}>
      <g transform={`rotate(${a} ${r + 20} ${r + 20})`}>
        <circle cx={r + 20} cy={r + 20} r={r * (0.9 + 0.1 * p)} fill="none" stroke={INK} strokeWidth={1.2} strokeDasharray="2 9" opacity={0.55} />
        {ticks &&
          Array.from({ length: 24 }, (_, i) => {
            const t = (i * 15 * Math.PI) / 180;
            return (
              <line key={i} x1={r + 20 + Math.cos(t) * (r + 8)} y1={r + 20 + Math.sin(t) * (r + 8)} x2={r + 20 + Math.cos(t) * (r + (i % 6 === 0 ? 18 : 13))} y2={r + 20 + Math.sin(t) * (r + (i % 6 === 0 ? 18 : 13))} stroke={INK} strokeWidth={1.2} opacity={0.4} />
            );
          })}
      </g>
      <circle cx={r + 20 + Math.cos(dot) * r} cy={r + 20 + Math.sin(dot) * r} r={3.5} fill={INK} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))" }} />
    </svg>
  );
};
