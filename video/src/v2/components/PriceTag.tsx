import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, prog } from "../anim";
import { FONT, GLOW, INK } from "../theme";
import { renderPart } from "./Draw";

/** Hanging price tag that draws itself, then counts up to its value. */
export const PriceTag: React.FC<{
  x: number;
  y: number;
  start: number;
  value: number;
  strike?: boolean;
  strikeAt?: number;
  opacity?: number;
}> = ({ x, y, start, value, strike = false, strikeAt = 0, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 20);
  if (p <= 0) return null;
  const n = Math.round(value * prog(frame, start + 8, 18, easeOut));
  const tp = prog(frame, start + 10, 10);
  const sp = strike ? prog(frame, strikeAt, 12) : 0;
  const W = 170;
  const Hh = 66;
  return (
    <div style={{ position: "absolute", left: x - W / 2, top: y - Hh / 2, width: W, height: Hh, opacity }}>
      <svg width={W} height={Hh + 46} viewBox={`0 0 ${W} ${Hh + 46}`} style={{ position: "absolute", left: 0, top: -46, overflow: "visible", filter: GLOW }}>
        {/* string */}
        {renderPart({ t: "line", x1: 24, y1: 0, x2: 24, y2: 46 + Hh / 2 - 4 }, Math.min(1, p * 1.6), "s", { width: 1.4, color: INK })}
        {/* tag body */}
        {renderPart({ t: "path", d: `M28 ${46 + 3} L${W - 6} ${46 + 3} Q${W - 2} ${46 + 3} ${W - 2} ${46 + 8} L${W - 2} ${46 + Hh - 8} Q${W - 2} ${46 + Hh - 3} ${W - 6} ${46 + Hh - 3} L28 ${46 + Hh - 3} L6 ${46 + Hh / 2} Z` }, p, "b", { width: 2, color: INK })}
        {renderPart({ t: "circle", cx: 24, cy: 46 + Hh / 2, r: 4 }, p, "h", { width: 1.6, color: INK })}
        {sp > 0 && renderPart({ t: "line", x1: 52, y1: 46 + Hh / 2 + 2, x2: W - 18, y2: 46 + Hh / 2 - 2 }, sp, "x", { width: 2.4, color: INK })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 34,
          right: 6,
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 32,
          letterSpacing: "0.02em",
          color: INK,
          opacity: tp,
          fontVariantNumeric: "tabular-nums",
          textShadow: "0 0 14px rgba(255,255,255,0.35)",
        }}
      >
        ${n}
      </div>
    </div>
  );
};
