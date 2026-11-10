import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../v2/theme";
import { EMPHASIS as EMPH60, WORDS as WORDS60 } from "../v5/timing";
import { GOLD } from "./engine";

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");
const clean = (w: string) => w.replace(/[.,!?;:]+$/g, "").toUpperCase();

/** One-word-at-a-time captions (the reference style): big, bold, a quick pop on each word, gold on key words. */
type Word = { w: string; start: number; end: number };
export const WordCaptions: React.FC<{ words?: Word[]; emphasis?: string[] }> = ({ words: WORDS = WORDS60, emphasis: EMPHASIS = EMPH60 }) => {
  const fr = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = fr / fps;
  let i = -1;
  for (let k = 0; k < WORDS.length; k++) {
    const next = WORDS[k + 1];
    const until = next && next.start - WORDS[k].end < 0.35 ? next.start : WORDS[k].end + 0.12;
    if (t >= WORDS[k].start - 0.02 && t < until) {
      i = k;
      break;
    }
  }
  if (i < 0) return null;
  const w = WORDS[i];
  const local = fr - Math.round(w.start * fps);
  const pop = spring({ frame: local, fps, config: { damping: 14, stiffness: 260, mass: 0.6 } });
  const scale = interpolate(pop, [0, 1], [0.72, 1]);
  const op = interpolate(local, [-1, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hot = EMPHASIS.includes(norm(w.w));
  const txt = clean(w.w);
  const size = txt.length > 9 ? 104 : 124;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1430, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          letterSpacing: "0.01em",
          color: hot ? GOLD : "#ffffff",
          opacity: op,
          transform: `scale(${scale})`,
          WebkitTextStroke: "3px rgba(0,0,0,0.9)",
          paintOrder: "stroke fill",
          textShadow: `0 6px 0 rgba(0,0,0,0.85), 0 0 34px ${hot ? "rgba(255,208,77,0.55)" : "rgba(0,0,0,0.9)"}`,
          whiteSpace: "nowrap",
        }}
      >
        {txt}
      </div>
    </div>
  );
};
