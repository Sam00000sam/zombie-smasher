import React from "react";
import { stagger, lerp } from "../anim";
import { GLOW, INK } from "../theme";
import { Part, renderPart } from "./Draw";

/**
 * Minimal stick figure (viewBox 160×280). `look` -1..1 turns the head,
 * `point` 0..1 raises the right arm towards the right.
 */
export const StickFigure: React.FC<{
  x: number;
  y: number;
  height: number;
  p: number;
  look?: number;
  point?: number;
  opacity?: number;
}> = ({ x, y, height, p, look = 0, point = 0, opacity = 1 }) => {
  if (p <= 0) return null;
  const w = (height * 160) / 280;
  const hx = 80 + look * 4;
  const armR = { x: lerp(106, 150, point), y: lerp(142, 92, point) };
  const parts: Part[] = [
    { t: "circle", cx: hx, cy: 40, r: 22 },
    { t: "line", x1: 80, y1: 62, x2: 80, y2: 160 },
    { t: "line", x1: 80, y1: 84, x2: 54, y2: 142 },
    { t: "line", x1: 80, y1: 84, x2: armR.x, y2: armR.y },
    { t: "line", x1: 80, y1: 160, x2: 58, y2: 252 },
    { t: "line", x1: 80, y1: 160, x2: 102, y2: 252 },
  ];
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 160 280"
      style={{ position: "absolute", left: x - w / 2, top: y - height / 2, overflow: "visible", opacity, filter: GLOW }}
    >
      {parts.map((pt, i) => renderPart(pt, stagger(p, i, parts.length, 0.6), i, { width: (2.6 * 280) / height, color: INK }))}
      {/* eye: shows which way the figure is looking */}
      {p > 0.3 && <circle cx={hx + look * 10} cy={37} r={2.2} fill={INK} opacity={Math.min(1, (p - 0.3) * 3)} />}
    </svg>
  );
};
