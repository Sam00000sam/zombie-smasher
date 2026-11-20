import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { p01 } from "../v5/smooth";
import { DISPLAY, UI } from "./fonts";
import { goldText, GOLD, WHITE } from "./stage";
import { CHAPTERS, f, L, WORDS } from "./timing";

/** Centre of the area TikTok leaves clear (its buttons sit on the right). */
export const SAFE_CX = 500;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/* ------------------------------------------------------------ chapter cards */
/** "05 · THE PRICE": a big gold number that lands while the camera flies to the next reason. */
export const ChapterCards: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <>
      {CHAPTERS.map((ch) => {
        const tIn = f(ch.from) - 5;
        const tOut = f(ch.until) + 2;
        if (fr < tIn || fr > tOut + 10) return null;
        const enter = spring({ frame: fr - tIn, fps: 30, config: { damping: 16, stiffness: 140, mass: 0.8 } });
        const exit = p01(fr, tOut, 10);
        const op = clamp01(enter * 1.4) * (1 - exit);
        const reveal = p01(fr, tIn + 7, 11);
        return (
          <AbsoluteFill key={ch.n} style={{ pointerEvents: "none" }}>
            <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 45% at 46% 40%, rgba(0,0,0,0.55), rgba(0,0,0,0.25))", opacity: op }} />
            <div style={{ position: "absolute", left: 0, width: SAFE_CX * 2, top: 440, display: "flex", flexDirection: "column", alignItems: "center", opacity: op }}>
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 28, letterSpacing: "0.55em", paddingLeft: "0.55em", color: "rgba(246,243,236,0.7)", transform: `translateY(${(1 - enter) * 20}px)` }}>REASON</div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 900,
                  fontSize: 420,
                  lineHeight: 0.92,
                  letterSpacing: "-0.04em",
                  ...goldText,
                  filter: `drop-shadow(0 18px 40px rgba(242,193,78,0.25)) blur(${(1 - enter) * 12 + exit * 10}px)`,
                  transform: `scale(${interpolate(enter, [0, 1], [1.35, 1]) * interpolate(exit, [0, 1], [1, 0.9])})`,
                }}
              >
                0{ch.n}
              </div>
              <div style={{ clipPath: `inset(0 ${100 - reveal * 100}% 0 0)`, fontFamily: DISPLAY, fontWeight: 800, fontSize: 62, letterSpacing: "0.02em", color: WHITE, marginTop: 6 }}>{ch.title}</div>
              <div style={{ width: 140 * reveal, height: 5, borderRadius: 3, background: GOLD, marginTop: 18, boxShadow: `0 0 18px ${GOLD}` }} />
            </div>
          </AbsoluteFill>
        );
      })}
    </>
  );
};

/* --------------------------------------------------------------- tracker */
/** Story-style progress bar for the five reasons, with the current one named beneath. */
export const Tracker: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const show = p01(fr, f(L.r5.start) - 4, 10);
  if (show <= 0) return null;
  const cur = CHAPTERS.findIndex((ch) => t >= ch.from && t < ch.next);
  const segW = 128;
  const gap = 10;
  const total = 5 * segW + 4 * gap;
  return (
    <div style={{ position: "absolute", top: 190, left: SAFE_CX - total / 2, width: total, opacity: show }}>
      <div style={{ display: "flex", gap }}>
        {CHAPTERS.map((ch) => {
          const p = clamp01((t - ch.from) / (ch.next - ch.from));
          return (
            <div key={ch.n} style={{ width: segW, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
              <div style={{ width: `${p * 100}%`, height: "100%", background: GOLD, boxShadow: `0 0 10px ${GOLD}` }} />
            </div>
          );
        })}
      </div>
      <div style={{ position: "relative", height: 40, marginTop: 14 }}>
        {CHAPTERS.map((ch) => {
          const o = p01(fr, f(ch.from), 8) * (1 - p01(fr, f(ch.next), 8));
          if (o <= 0) return null;
          return (
            <div key={ch.n} style={{ position: "absolute", inset: 0, textAlign: "center", opacity: o, fontFamily: UI, fontWeight: 700, fontSize: 24, letterSpacing: "0.24em", color: "rgba(246,243,236,0.85)" }}>
              <span style={{ color: GOLD }}>#{ch.n}</span>&nbsp;&nbsp;{ch.title}
            </div>
          );
        })}
        {cur < 0 && fr > f(L.end.start) && (
          <div style={{ position: "absolute", inset: 0, textAlign: "center", opacity: p01(fr, f(L.end.start), 8), fontFamily: UI, fontWeight: 700, fontSize: 24, letterSpacing: "0.24em", color: "rgba(246,243,236,0.85)" }}>
            <span style={{ color: GOLD }}>YOUR CALL</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- captions */
type Word = { w: string; start: number; end: number };
const groups: Word[][] = (() => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const next = WORDS[i + 1];
    if (cur.length === 3 || /[.,?!:]$/.test(w.w) || !next || next.start - w.end > 0.3) {
      out.push(cur);
      cur = [];
    }
  });
  return out;
})();
const hidden = CHAPTERS.map((ch) => [ch.from - 0.05, ch.until - 0.02]);
const isHidden = (t: number) => hidden.some(([a, b]) => t >= a && t < b);
const clean = (w: string) => w.replace(/[.,!?;:]+$/g, "").toUpperCase();

/** Phrase captions (up to three words) with the spoken word on a gold pill. */
export const PhraseCaptions: React.FC<{ top?: number }> = ({ top = 1236 }) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  let gi = -1;
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const next = groups[i + 1];
    const last = g[g.length - 1];
    const until = next && next[0].start - last.end < 0.7 ? next[0].start : last.end + 0.25;
    if (t >= g[0].start - 0.03 && t < until) {
      gi = i;
      break;
    }
  }
  if (gi < 0 || isHidden(groups[gi][0].start)) return null;
  const g = groups[gi];
  const g0 = Math.round(g[0].start * 30);
  const enter = p01(fr, g0 - 1, 5);
  let active = 0;
  g.forEach((w, i) => {
    if (t >= w.start - 0.02) active = i;
  });
  return (
    <div style={{ position: "absolute", top, left: 40, width: SAFE_CX * 2 - 80, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 16px", opacity: enter, transform: `translateY(${(1 - enter) * 14}px)` }}>
      {g.map((w, i) => {
        const on = i === active;
        const pop = on ? spring({ frame: fr - Math.round(w.start * 30), fps: 30, config: { damping: 14, stiffness: 300, mass: 0.5 } }) : 1;
        return (
          <span
            key={i}
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 72,
              lineHeight: 1.12,
              padding: "0 16px",
              borderRadius: 16,
              color: on ? "#16120a" : WHITE,
              background: on ? "linear-gradient(180deg, #f8d67f, #e2ab3d)" : "transparent",
              boxShadow: on ? "0 10px 30px rgba(242,193,78,0.35)" : undefined,
              textShadow: on ? undefined : "0 4px 18px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
              transform: `scale(${on ? interpolate(pop, [0, 1], [0.86, 1.04]) : 1})`,
              display: "inline-block",
            }}
          >
            {clean(w.w)}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ grain */
/** Subtle animated film grain over everything. */
export const Grain: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.075, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={fr % 24} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
};
