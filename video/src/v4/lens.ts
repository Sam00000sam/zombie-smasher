import { Easing, interpolate } from "remotion";
import { CUE, f, SCENES } from "./timing";

/**
 * The "lens": zoom + focus keyframes on top of the rig's pans between scenes.
 * Each key says: by this time, frame the point (x, y) of the current scene at zoom z.
 * Moves ease in/out over ~20 frames, then the shot holds with a slow breathing drift.
 */
type Key = { at: number; x: number; y: number; z: number; dur?: number };

const S = (t: number) => f(t);
const KEYS: Key[] = [
  // hook — open tight on the live poll, pull back, push to "agree"
  { at: 0, x: 900, y: 390, z: 1.6, dur: 1 },
  { at: S(CUE.sometimes) - 4, x: 960, y: 440, z: 1.12 },
  { at: S(CUE.smarter) - 8, x: 770, y: 420, z: 1.42 },
  { at: SCENES.hook.to - 22, x: 960, y: 540, z: 1.0 },
  // price tower
  { at: S(CUE.luxury) - 10, x: 470, y: 400, z: 1.5 },
  { at: S(CUE.product) - 6, x: 1390, y: 690, z: 1.7, dur: 12 },
  { at: S(CUE.logo) - 4, x: 1390, y: 560, z: 1.3 },
  { at: S(CUE.store) - 2, x: 1120, y: 470, z: 0.98 },
  { at: S(CUE.copy) - 2, x: 1250, y: 560, z: 1.18, dur: 12 },
  { at: S(CUE.good) - 10, x: 690, y: 500, z: 1.22 },
  { at: S(CUE.look) - 2, x: 690, y: 470, z: 1.5 },
  { at: S(CUE.fraction) - 18, x: 1150, y: 470, z: 1.02 },
  { at: S(CUE.fraction) + 2, x: 1390, y: 480, z: 1.55, dur: 12 },
  { at: SCENES.tower.to - 20, x: 960, y: 540, z: 1.0 },
  // trend
  { at: S(CUE.trend), x: 420, y: 390, z: 1.55, dur: 1 },
  { at: S(CUE.trend) + 22, x: 740, y: 370, z: 1.3, dur: 30 },
  { at: S(CUE.rent) - 8, x: 1300, y: 360, z: 1.45, dur: 14 },
  { at: S(CUE.stop), x: 1520, y: 560, z: 1.55 },
  { at: SCENES.trend.to - 20, x: 960, y: 540, z: 1.0 },
  // save
  { at: SCENES.save.from + 12, x: 960, y: 250, z: 1.65, dur: 1 },
  { at: S(CUE.five) - 4, x: 1100, y: 440, z: 1.12 },
  { at: S(CUE.instead) - 2, x: 360, y: 520, z: 1.55, dur: 12 },
  { at: SCENES.save.to - 20, x: 960, y: 540, z: 1.0 },
  // end — checkout, hesitate on PAY, the viewer, then the split
  { at: SCENES.end.from + 12, x: 840, y: 420, z: 1.42, dur: 1 },
  { at: S(CUE.pay) - 4, x: 860, y: 580, z: 1.9 },
  { at: S(CUE.ask) - 4, x: 480, y: 600, z: 1.3 },
  { at: S(CUE.productQ) - 6, x: 1460, y: 300, z: 1.55, dur: 12 },
  { at: S(CUE.label) - 4, x: 1460, y: 490, z: 1.6, dur: 12 },
  { at: S(CUE.speechEnd) + 4, x: 1020, y: 430, z: 1.0, dur: 50 },
];

const ease = Easing.bezier(0.65, 0, 0.35, 1);

export const lensAt = (frame: number) => {
  let x = KEYS[0].x;
  let y = KEYS[0].y;
  let z = KEYS[0].z;
  for (const k of KEYS) {
    const d = k.dur ?? 20;
    const p = interpolate(frame, [k.at - d, k.at], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
    x += (k.x - x) * p;
    y += (k.y - y) * p;
    z += (k.z - z) * p;
  }
  // slow breathing so held shots never sit dead still
  const t = frame / 30;
  return { x: x + Math.sin(t * 0.9) * 6, y: y + Math.cos(t * 0.7) * 4, z: z * (1 + Math.sin(t * 0.6) * 0.008) };
};
