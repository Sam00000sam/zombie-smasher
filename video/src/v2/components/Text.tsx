import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, prog } from "../anim";
import { FONT, INK } from "../theme";

/** Tracked headline that reveals character by character (rise + unblur) with a soft glow. */
export const GlowText: React.FC<{
  text: string;
  start: number;
  size?: number;
  weight?: number;
  color?: string;
  spacing?: string;
  out?: number;
  stagger?: number;
}> = ({ text, start, size = 40, weight = 600, color = INK, spacing = "0.14em", out, stagger = 0.8 }) => {
  const frame = useCurrentFrame();
  const outP = out === undefined ? 0 : prog(frame, out, 12);
  if (frame < start || outP >= 1) return null;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: spacing,
        color,
        whiteSpace: "pre",
        lineHeight: 1.2,
        textTransform: "uppercase",
        opacity: 1 - outP,
        filter: outP > 0 ? `blur(${outP * 8}px)` : undefined,
        textShadow: "0 0 18px rgba(255,255,255,0.45), 0 0 3px rgba(255,255,255,0.3)",
      }}
    >
      {Array.from(text).map((c, i) => {
        const p = prog(frame, start + i * stagger, 14, easeOut);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * size * 0.28}px)`,
              filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
};

/** Tiny uppercase tracked label (the reference's main text style). */
export const Label: React.FC<{
  text: string;
  start: number;
  size?: number;
  color?: string;
  out?: number;
  weight?: number;
  spacing?: string;
  opacity?: number;
}> = ({ text, start, size = 14, color = INK, out, weight = 600, spacing = "0.26em", opacity = 1 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 14, easeOut);
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
        opacity: p * (1 - outP) * opacity,
        filter: p < 1 ? `blur(${(1 - p) * 4}px)` : undefined,
      }}
    >
      {text}
    </div>
  );
};

/** Solid white pill with black text that pops in (e.g. "BUT WHY?" in the reference). */
export const Pill: React.FC<{ text: string; start: number; size?: number; out?: number }> = ({ text, start, size = 14, out }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 12, easeOut);
  const outP = out === undefined ? 0 : prog(frame, out, 10);
  if (p <= 0 || outP >= 1) return null;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.2em",
        color: "#000",
        background: INK,
        padding: `${size * 0.5}px ${size * 1.1}px ${size * 0.5}px ${size * 1.3}px`,
        borderRadius: 999,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        opacity: p * (1 - outP),
        transform: `scale(${0.75 + 0.25 * p})`,
        boxShadow: "0 0 18px rgba(255,255,255,0.55), 0 0 40px rgba(255,255,255,0.2)",
      }}
    >
      {text}
    </div>
  );
};

/** Absolutely positioned box helper (centre-anchored on x by default). */
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
