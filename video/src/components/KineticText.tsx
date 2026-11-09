import React from "react";
import { useCurrentFrame } from "remotion";
import { easeInOut, easeOutExpo, prog } from "../lib/anim";
import { C, FONT } from "../lib/theme";

type Props = {
  text: string;
  start: number;
  fontSize?: number;
  weight?: number;
  color?: string;
  /** words (by index) rendered in an accent colour */
  accent?: number[];
  accentColor?: string;
  stagger?: number;
  dur?: number;
  /** frame at which the text starts leaving; omit to stay */
  outStart?: number;
  outDur?: number;
  maxWidth?: number;
  letterSpacing?: string;
  align?: "center" | "left";
  lineHeight?: number;
  /** subtle vertical drift while on screen (px over 120 frames) */
  drift?: number;
};

/** Word-by-word kinetic headline: blur + rise + tracking settle, all frame-driven. */
export const KineticText: React.FC<Props> = ({
  text,
  start,
  fontSize = 96,
  weight = 800,
  color = C.text,
  accent = [],
  accentColor = C.gold,
  stagger = 4,
  dur = 26,
  outStart,
  outDur = 14,
  maxWidth = 1600,
  letterSpacing = "-0.02em",
  align = "center",
  lineHeight = 1.06,
  drift = 14,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  const out = outStart === undefined ? 0 : prog(frame, outStart, outDur, easeInOut);
  const driftY = -Math.min(1, Math.max(0, (frame - start) / 150)) * drift;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: fontSize * 0.28,
        rowGap: fontSize * 0.04,
        maxWidth,
        fontFamily: FONT,
        fontWeight: weight,
        fontSize,
        lineHeight,
        letterSpacing,
        textTransform: "uppercase",
        textAlign: align,
        opacity: 1 - out,
        transform: `translateY(${driftY - out * 30}px)`,
        filter: out > 0 ? `blur(${out * 14}px)` : undefined,
      }}
    >
      {words.map((w, i) => {
        const p = prog(frame, start + i * stagger, dur, easeOutExpo);
        const isAccent = accent.includes(i);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * fontSize * 0.45}px) scale(${1 + (1 - p) * 0.12})`,
              filter: `blur(${(1 - p) * 18}px)`,
              letterSpacing: `${(1 - p) * 0.12 - 0.02}em`,
              color: isAccent ? accentColor : color,
              textShadow: isAccent
                ? `0 0 ${fontSize * 0.4}px ${accentColor}66`
                : `0 4px 40px rgba(0,0,0,0.6)`,
              background: isAccent
                ? undefined
                : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Small tracked-out label. */
export const Kicker: React.FC<{
  text: string;
  start: number;
  color?: string;
  size?: number;
  outStart?: number;
}> = ({ text, start, color = C.dim, size = 24, outStart }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 30);
  const out = outStart === undefined ? 0 : prog(frame, outStart, 14, easeInOut);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: `${0.7 - p * 0.25}em`,
        color,
        textTransform: "uppercase",
        opacity: p * (1 - out),
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
