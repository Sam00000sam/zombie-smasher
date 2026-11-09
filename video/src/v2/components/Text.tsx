import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, prog } from "../anim";
import { DIM, FONT, INK } from "../theme";

/** Headline that reveals character by character (rise + unblur) with a soft glow. */
export const GlowText: React.FC<{
  text: string;
  start: number;
  size?: number;
  weight?: number;
  color?: string;
  spacing?: string;
  out?: number;
  stagger?: number;
  glow?: boolean;
}> = ({ text, start, size = 56, weight = 600, color = INK, spacing = "0.04em", out, stagger = 0.9, glow = true }) => {
  const frame = useCurrentFrame();
  const outP = out === undefined ? 0 : prog(frame, out, 12);
  if (frame < start || outP >= 1) return null;
  const chars = Array.from(text);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: spacing,
        color,
        whiteSpace: "pre",
        lineHeight: 1.15,
        textTransform: "uppercase",
        opacity: 1 - outP,
        transform: `translateY(${-outP * 10}px)`,
        filter: outP > 0 ? `blur(${outP * 6}px)` : undefined,
        textShadow: glow ? "0 0 18px rgba(255,255,255,0.35), 0 0 4px rgba(255,255,255,0.25)" : undefined,
      }}
    >
      {chars.map((c, i) => {
        const p = prog(frame, start + i * stagger, 14, easeOut);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * size * 0.3}px)`,
              filter: p < 1 ? `blur(${(1 - p) * 5}px)` : undefined,
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
};

/** Small uppercase tracked label. */
export const Label: React.FC<{
  text: string;
  start: number;
  size?: number;
  color?: string;
  out?: number;
  weight?: number;
  spacing?: string;
}> = ({ text, start, size = 16, color = DIM, out, weight = 500, spacing = "0.28em" }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 16, easeOut);
  const outP = out === undefined ? 0 : prog(frame, out, 10);
  if (p <= 0 || outP >= 1) return null;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: spacing,
        color,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        opacity: p * (1 - outP),
        transform: `translateY(${(1 - p) * 8}px)`,
      }}
    >
      {text}
    </div>
  );
};

/** Absolutely positioned box helper (centre-anchored on x). */
export const At: React.FC<{ x: number; y: number; w?: number; align?: "center" | "left" | "right"; children: React.ReactNode }> = ({
  x,
  y,
  w = 900,
  align = "center",
  children,
}) => (
  <div
    style={{
      position: "absolute",
      top: y,
      left: align === "center" ? x - w / 2 : align === "left" ? x : x - w,
      width: w,
      display: "flex",
      justifyContent: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
    }}
  >
    {children}
  </div>
);
