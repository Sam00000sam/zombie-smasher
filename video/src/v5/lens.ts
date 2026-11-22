import { interpolate } from "remotion";
import { io } from "./smooth";
import { CUE, f, SCENES } from "./timing";

/** Gentle lens for the 60 s cut: closer base framing + slow, softened reframes toward what's said. Loops. */
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
  { at: f(CUE.everyday), x: 960, y: 560, m: 1.02 },
  { at: SCENES.tower.to - 8, x: 960, y: 480, m: 1.0, dur: 26 },
  { at: f(CUE.walk), x: 960, y: 460, m: 1.03 },
  { at: f(CUE.nobody) + 6, x: 1060, y: 520, m: 1.07 },
  { at: SCENES.notice.to - 8, x: 960, y: 480, m: 1.0, dur: 26 },
  { at: f(CUE.rent), x: 960, y: 430, m: 1.08 },
  { at: f(CUE.stop) + 16, x: 960, y: 560, m: 1.06 },
  { at: SCENES.trend.to - 8, x: 960, y: 480, m: 1.0, dur: 26 },
  { at: f(CUE.scuff), x: 1200, y: 440, m: 1.06 },
  { at: f(CUE.disaster) + 6, x: 980, y: 460, m: 1.02 },
  { at: SCENES.worry.to - 8, x: 960, y: 480, m: 1.0, dur: 26 },
  { at: f(CUE.five) + 4, x: 1100, y: 470, m: 1.05 },
  { at: f(CUE.instead) + 6, x: 880, y: 470, m: 1.04 },
  { at: f(CUE.growWord) + 6, x: 1000, y: 520, m: 1.05 },
  { at: f(CUE.time), x: 1080, y: 560, m: 1.06 },
  { at: SCENES.save.to - 8, x: 960, y: 480, m: 1.0, dur: 26 },
  { at: f(CUE.isnt) + 6, x: 920, y: 420, m: 1.06 },
  { at: f(CUE.overpay) + 6, x: 1000, y: 480, m: 1.03 },
  { at: SCENES.status.to - 8, x: 960, y: 480, m: 1.0, dur: 26 },
  { at: SCENES.end.from + 34, x: 960, y: 430, m: 1.06 },
  { at: f(CUE.pay) + 10, x: 980, y: 530, m: 1.12 },
  { at: f(CUE.ask) + 8, x: 780, y: 520, m: 1.0 },
  { at: f(CUE.productQ) + 4, x: 1060, y: 450, m: 1.03 },
  { at: f(CUE.label) + 6, x: 1090, y: 470, m: 1.05 },
  { at: f(CUE.speechEnd) + 40, x: 960, y: 430, m: 1.0, dur: 40 },
];

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
