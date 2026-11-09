import React from "react";
import { easeOut, prog } from "../anim";
import { GLOW_SOLID, INK } from "../theme";

/** Solid glowing "pawn" person, as used in the reference (head + rounded body). */
export const Pawn: React.FC<{
  x: number;
  /** y of the feet (ground line) */
  y: number;
  h: number;
  frame: number;
  start: number;
  lean?: number;
  opacity?: number;
}> = ({ x, y, h, frame, start, lean = 0, opacity = 1 }) => {
  const p = prog(frame, start, 16, easeOut);
  if (p <= 0) return null;
  const w = h * 0.62;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 62 100"
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h,
        overflow: "visible",
        opacity: p * opacity,
        transform: `scale(${0.7 + 0.3 * p}) rotate(${lean * 5}deg)`,
        transformOrigin: "50% 100%",
        filter: GLOW_SOLID,
      }}
    >
      <circle cx={31} cy={17} r={16} fill={INK} />
      <path d="M4 100 C4 62 14 40 31 40 C48 40 58 62 58 100 Z" fill={INK} />
    </svg>
  );
};
