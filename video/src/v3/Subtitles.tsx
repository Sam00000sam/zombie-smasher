import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../v2/anim";
import { FONT } from "../v2/theme";
import { LINES, WORDS, f, norm } from "./timing";

/**
 * Documentary-style captions: short phrases, one or two lines, bottom centre, word-synced.
 * Phrases are hand-broken for readability; their words are matched in order to the Whisper timings.
 */
const PHRASES = [
  "Fake products might not be perfect,",
  "but sometimes they offer surprising advantages",
  "over the real thing.",
  "The biggest advantage is price.",
  "You can often get a similar look and basic function,",
  "without spending nearly as much.",
  "Fake products can also give you access to styles and designs",
  "that might otherwise be too expensive, or difficult to find.",
  "For some everyday items,",
  "the cheaper alternative may do the job well enough,",
  "especially when premium features aren't important.",
  "Of course, quality and safety still matter.",
  "But when the risks are low, and the price difference is huge,",
  "fake can sometimes make more sense.",
];

/** Words given a brighter weight and soft glow. */
const EMPHASIS = new Set(["advantages", "price", "similar", "look", "styles", "designs", "everyday", "cheaper", "quality", "safety", "huge", "sense"]);

type Cue = { words: { text: string; em: boolean }[]; from: number; to: number };

const buildCues = (): Cue[] => {
  const cues: Cue[] = [];
  let wi = 0;
  for (const ph of PHRASES) {
    const tokens = ph.split(" ");
    const first = WORDS[wi];
    const last = WORDS[wi + tokens.length - 1];
    if (!first || !last) throw new Error(`subtitle/word mismatch at "${ph}"`);
    tokens.forEach((t, k) => {
      if (norm(t) !== norm(WORDS[wi + k].w)) throw new Error(`subtitle word "${t}" ≠ narration "${WORDS[wi + k].w}"`);
    });
    // Whisper can place a sentence's first word early; never start before the line really starts.
    const lineStart = LINES.filter((l) => l.start <= first.start + 0.6).slice(-1)[0]?.start ?? first.start;
    const start = Math.max(first.start, lineStart);
    cues.push({
      words: tokens.map((t) => ({ text: t, em: EMPHASIS.has(norm(t)) })),
      from: f(start - 0.08),
      to: f(last.end + 0.3),
    });
    wi += tokens.length;
  }
  if (wi !== WORDS.length) throw new Error(`subtitles cover ${wi} of ${WORDS.length} words`);
  // hand over cleanly: a phrase ends where the next begins if they would overlap
  for (let i = 0; i < cues.length - 1; i++) cues[i].to = Math.min(cues[i].to, cues[i + 1].from);
  return cues;
};

const CUES = buildCues();
const FADE = 5;

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = CUES.find((c) => frame >= c.from && frame < c.to);
  if (!cue) return null;
  const o = Math.min(prog(frame, cue.from, FADE), 1 - prog(frame, cue.to - FADE, FADE));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 1180,
          textAlign: "center",
          textWrap: "balance",
          fontFamily: FONT,
          fontSize: 38,
          fontWeight: 500,
          lineHeight: 1.32,
          letterSpacing: "0.01em",
          color: "rgba(255,255,255,0.92)",
          opacity: o,
          transform: `translateY(${(1 - Math.min(1, prog(frame, cue.from, FADE + 3))) * 6}px)`,
          textShadow: "0 2px 10px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.9)",
        }}
      >
        {cue.words.map((w, i) => (
          <span
            key={i}
            style={
              w.em
                ? { color: "#fff", fontWeight: 700, textShadow: "0 0 14px rgba(255,255,255,0.55), 0 2px 10px rgba(0,0,0,0.95)" }
                : undefined
            }
          >
            {w.text}
            {i < cue.words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
};
