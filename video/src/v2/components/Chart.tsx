import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../anim";
import { renderPart } from "./Draw";
import { GLOW, INK } from "../theme";

/** A line on a chart that draws left→right with a glowing dot riding its tip. */
export const ChartLine: React.FC<{
  d: string;
  /** point sampler for the dot, t in 0..1 */
  at: (t: number) => { x: number; y: number };
  w: number;
  h: number;
  start: number;
  dur: number;
  dashed?: boolean;
}> = ({ d, at, w, h, start, dur, dashed = false }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, dur);
  if (p <= 0) return null;
  const dot = at(p);
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible", filter: GLOW }}>
      {dashed ? (
        <g opacity={0.9}>
          <clipPath id={`cl-${start}`}>
            <rect x={-10} y={-20} width={(w + 20) * p} height={h + 40} />
          </clipPath>
          <path d={d} fill="none" stroke={INK} strokeWidth={1.6} strokeDasharray="3 6" clipPath={`url(#cl-${start})`} />
        </g>
      ) : (
        renderPart({ t: "path", d }, p, "l", { width: 2, color: INK })
      )}
      <circle cx={dot.x} cy={dot.y} r={5} fill={INK} />
      <circle cx={dot.x} cy={dot.y} r={14} fill={INK} opacity={0.18} />
    </svg>
  );
};
