import { interpolate } from "remotion";
import { io } from "./smooth";
import { CUE, f, SCENES } from "./timing";

/**
 * Gentle lens: a closer base framing (bigger, phone-readable content) plus slow, eased reframes that
 * drift toward whatever the narration is talking about. Long durations, small zoom changes, no whips.
 * The last key matches the first so the video loops seamlessly.
 */
const BASE = 1.2;
type K = { at: number; x: number; y: number; m: number; dur?: number };
const KEYS: K[] = [
  { at: 0, x: 960, y: 430, m: 1.0, dur: 1 },
  { at: f(1.6), x: 960, y: 480, m: 1.0, dur: 24 },
  { at: f(CUE.smarter) + 4, x: 1060, y: 470, m: 1.08 },
  { at: SCENES.hook.to - 8, x: 960, y: 480, m: 1.0, dur: 26 },
  { at: f(CUE.luxury) + 6, x: 820, y: 450, m: 1.03 },
  { at: f(CUE.store) + 4, x: 980, y: 470, m: 1.0 },
  { at: f(CUE.look) + 6, x: 950, y: 470, m: 1.08 },
  { at: f(CUE.fraction) + 6, x: 950, y: 540, m: 1.05 },
  { at: SCENES.tower.to - 8, x: 960, y: 480, m: 1.0, dur: 26 },
  { at: f(CUE.rent), x: 960, y: 430, m: 1.08 },
  { at: f(CUE.stop) + 16, x: 960, y: 560, m: 1.06 },
  { at: SCENES.trend.to - 8, x: 960, y: 480, m: 1.0, dur: 26 },
  { at: f(CUE.five) + 4, x: 1100, y: 470, m: 1.05 },
  { at: f(CUE.instead) + 6, x: 880, y: 470, m: 1.04 },
  { at: SCENES.save.to - 8, x: 960, y: 480, m: 1.0, dur: 26 },
  { at: SCENES.end.from + 34, x: 960, y: 430, m: 1.06 },
  { at: f(CUE.pay) + 10, x: 980, y: 530, m: 1.12 },
  { at: f(CUE.ask) + 8, x: 780, y: 520, m: 1.0 },
  { at: f(CUE.productQ) + 4, x: 1060, y: 450, m: 1.03 },
  { at: f(CUE.label) + 6, x: 1090, y: 470, m: 1.05 },
  { at: f(CUE.speechEnd) + 40, x: 960, y: 430, m: 1.0, dur: 40 },
];

/** Reframes are softened: half the drift, 60% of the zoom change, slower moves (opening/closing frame unchanged). */
const SOFT = KEYS.map((k, i) =>
  i === 0 || i === KEYS.length - 1
    ? k
    : { ...k, x: 960 + (k.x - 960) * 0.5, y: 480 + (k.y - 480) * 0.6, m: 1 + (k.m - 1) * 0.6, dur: Math.max(k.dur ?? 30, 40) },
);

export const lensAt = (frame: number) => {
  let { x, y, m } = SOFT[0];
  for (const k of SOFT) {
    const d = k.dur ?? 30;
    const p = interpolate(frame, [k.at - d, k.at], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: io });
    x += (k.x - x) * p;
    y += (k.y - y) * p;
    m += (k.m - m) * p;
  }
  return { x, y, z: BASE * m };
};
