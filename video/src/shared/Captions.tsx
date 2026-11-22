import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, lerp, prog } from "../v2/anim";
import { FONT } from "../v2/theme";

/**
 * Professional documentary captions:
 *  - fixed bottom safe zone, dark translucent panel with a hairline border
 *  - short hand-broken phrases (one or two balanced lines)
 *  - each word brightens exactly as it is spoken; upcoming words sit dimmed
 *  - emphasis words take a heavier weight and a soft glow once spoken
 *  - gentle crossfade between phrases, no bouncing or oversized type
 */
export type Word = { w: string; start: number; end: number };

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");

type Cue = { words: (Word & { em: boolean })[]; from: number; to: number };

export const buildCues = (words: Word[], phrases: string[], emphasis: string[], fps: number): Cue[] => {
  const em = new Set(emphasis.map(norm));
  const f = (s: number) => Math.round(s * fps);
  const cues: Cue[] = [];
  let wi = 0;
  for (const ph of phrases) {
    const toks = ph.split(" ");
    const ws = toks.map((t, k) => {
      const w = words[wi + k];
      if (!w || norm(w.w) !== norm(t)) throw new Error(`caption "${t}" does not match narration word "${w?.w}"`);
      return { ...w, w: t, em: em.has(norm(t)) };
    });
    cues.push({ words: ws, from: f(ws[0].start - 0.12), to: f(ws[ws.length - 1].end + 0.45) });
    wi += toks.length;
  }
  if (wi !== words.length) throw new Error(`captions cover ${wi} of ${words.length} words`);
  for (let i = 0; i < cues.length - 1; i++) cues[i].to = Math.min(cues[i].to, cues[i + 1].from);
  return cues;
};

const FADE = 6;

export const Captions: React.FC<{ cues: Cue[]; fps: number; bottom?: number }> = ({ cues, fps, bottom = 62 }) => {
  const frame = useCurrentFrame();
  const cue = cues.find((c) => frame >= c.from && frame < c.to);
  if (!cue) return null;
  const inP = prog(frame, cue.from, FADE, easeOut);
  const outP = prog(frame, cue.to - FADE, FADE);
  const o = Math.min(inP, 1 - outP);
  const t = frame / fps;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 1180,
          padding: "14px 30px 16px",
          borderRadius: 14,
          background: "rgba(12,12,12,0.66)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          backdropFilter: "blur(8px)",
          opacity: o,
          transform: `translateY(${lerp(8, 0, inP)}px)`,
          textAlign: "center",
          textWrap: "balance",
          fontFamily: FONT,
          fontSize: 36,
          fontWeight: 500,
          lineHeight: 1.3,
          letterSpacing: "0.005em",
        }}
      >
        {cue.words.map((w, i) => {
          const s = prog(t, w.start - 0.03, 0.12); // seconds-based ramp, frame-accurate via t
          const spoken = s;
          return (
            <span
              key={i}
              style={{
                color: `rgba(255,255,255,${lerp(0.36, 1, spoken)})`,
                fontWeight: w.em ? 700 : 500, // fixed weight: brightening never reflows the line
                textShadow: w.em && spoken > 0.5 ? "0 0 16px rgba(255,255,255,0.45)" : undefined,
              }}
            >
              {w.w}
              {i < cue.words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};
