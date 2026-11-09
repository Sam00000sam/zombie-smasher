import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { prog, slam } from "../lib/anim";
import { FONT } from "../lib/theme";

/** Dramatic price: counts up, slams in with a spring and a glow flash. */
export const Price: React.FC<{
  value: number;
  start: number;
  color: string;
  fontSize?: number;
  countFrames?: number;
}> = ({ value, start, color, fontSize = 170, countFrames = 26 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = slam(frame, fps, start);
  const visible = prog(frame, start, 5);
  const n = Math.round(value * prog(frame, start, countFrames));
  const flash = Math.max(0, 1 - (frame - start) / 22);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize,
        letterSpacing: "-0.04em",
        color,
        opacity: visible,
        transform: `scale(${1.55 - 0.55 * Math.min(1.08, s)})`,
        textShadow: `0 0 ${40 + flash * 90}px ${color}${flash > 0.05 ? "aa" : "55"}, 0 6px 30px rgba(0,0,0,0.7)`,
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1,
      }}
    >
      ${n}
    </div>
  );
};

export const Pill: React.FC<{
  text: string;
  start: number;
  color: string;
  fontSize?: number;
}> = ({ text, start, color, fontSize = 38 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = slam(frame, fps, start);
  const o = prog(frame, start, 6);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize,
        letterSpacing: "0.06em",
        color: "#05060a",
        background: `linear-gradient(135deg, ${color}, #fff 160%)`,
        padding: "16px 34px",
        borderRadius: 999,
        opacity: o,
        transform: `scale(${0.6 + 0.4 * Math.min(1.1, s)})`,
        boxShadow: `0 0 60px ${color}66, 0 10px 40px rgba(0,0,0,0.5)`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
