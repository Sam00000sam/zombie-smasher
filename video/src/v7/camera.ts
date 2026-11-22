import { interpolate } from "remotion";
import { io } from "../v5/smooth";
import { Cam } from "../v6/engine";
import { CUE, f, TOTAL_FRAMES } from "./timing";

/** Stations along z; the last stop is a copy of the first one LOOP_Z further on, so the video loops. */
const GAP = 1300;
export const Z = { A: 1200, B: 1200 + GAP, C: 1200 + 2 * GAP, D: 1200 + 3 * GAP, E: 1200 + 4 * GAP, F: 1200 + 5 * GAP, G: 1200 + 6 * GAP, H: 1200 + 7 * GAP, I: 1200 + 8 * GAP, J: 1200 + 9 * GAP };
export const LOOP_Z = 10 * GAP;

type K = Cam & { at: number; dur: number };
const k = (t: number, x: number, y: number, z: number, yaw: number, pitch: number, focus: number, dur = 30): K => ({ at: f(t), x, y, z, yaw, pitch, focus, dur });
/** A flight between stations that swings out to one side (bank) and lifts, arriving at `to` at time t. */
const fly = (t: number, to: K, side: number): K[] => {
  const at = f(t);
  const mid: K = { ...to, at: at - 11, dur: 14, x: to.x + side * 420, y: to.y + 160, z: to.z - 520, yaw: to.yaw - side * 0.22, pitch: to.pitch - 0.05 };
  return [mid, { ...to, at, dur: 24 }];
};

const KEYS: K[] = [
  k(0, 0, 420, 200, 0, -0.04, 1000, 1),
  k(CUE.win + 0.35, 30, 390, 320, -0.03, -0.06, 880, 70),
  // B price tags
  ...fly(4.1, k(0, -110, 420, Z.B - 1000, 0.03, -0.04, 1000), 1),
  k(CUE.good + 0.4, 110, 420, Z.B - 1000, -0.03, -0.04, 1000, 40),
  k(8.35, 0, 440, Z.B - 1080, 0, -0.05, 1080, 34),
  // C closet
  ...fly(9.25, k(0, 0, 450, Z.C - 1100, 0, -0.05, 1100), -1),
  k(CUE.closet + 0.4, 0, 430, Z.C - 1010, 0, -0.04, 1010, 50),
  // D cost per wear
  ...fly(12.3, k(0, 0, 470, Z.D - 1120, 0, -0.06, 1120), 1),
  k(15.2, 50, 450, Z.D - 1060, -0.02, -0.06, 1060, 60),
  k(CUE.less + 0.35, 0, 330, Z.D - 960, 0, -0.07, 780, 24),
  // E concerts / airports / rain
  ...fly(17.95, k(0, -110, 430, Z.E - 1020, -0.05, -0.05, 1020), -1),
  k(CUE.airports + 0.3, 0, 430, Z.E - 1020, 0, -0.05, 1020, 18),
  k(CUE.rainy + 0.3, 110, 430, Z.E - 1020, 0.05, -0.05, 1020, 18),
  k(CUE.zero + 0.2, 0, 420, Z.E - 1120, 0, -0.06, 1080, 30),
  // F turntable
  ...fly(22.65, k(0, 0, 560, Z.F - 1180, 0, -0.15, 1000), 1),
  k(CUE.try + 0.5, 0, 450, Z.F - 1080, 0, -0.08, 720, 36),
  k(CUE.commit + 0.4, 0, 500, Z.F - 1180, 0, -0.08, 1000, 30),
  // G stolen / lost
  ...fly(29.3, k(0, 0, 430, Z.G - 1020, 0, -0.05, 1020), -1),
  k(CUE.lost + 0.3, 70, 440, Z.G - 1060, -0.03, -0.05, 1060, 24),
  k(CUE.not + 0.2, 0, 400, Z.G - 980, 0, -0.06, 900, 30),
  // H resale chart
  ...fly(34.15, k(0, -100, 480, Z.H - 1060, 0.04, -0.05, 1060), 1),
  k(38.3, 100, 470, Z.H - 1000, -0.04, -0.05, 1000, 110),
  // I nobody sees the receipt
  ...fly(39.35, k(0, -130, 430, Z.I - 1000, 0.05, -0.05, 1000), -1),
  k(CUE.see + 0.3, 90, 390, Z.I - 960, -0.04, -0.05, 960, 34),
  // J keep the look / money
  ...fly(44.0, k(0, 0, 440, Z.J - 1000, 0, -0.05, 1000), 1),
  k(CUE.money + 0.4, 0, 420, Z.J - 920, 0, -0.04, 920, 40),
  // back to the opening shot, one loop further on
  ...fly(46.45, k(0, 0, 420, 200 + LOOP_Z, 0, -0.04, 1000), -1),
];

export const camAt = (frame: number): Cam => {
  const c: Cam = { x: KEYS[0].x, y: KEYS[0].y, z: KEYS[0].z, yaw: KEYS[0].yaw, pitch: KEYS[0].pitch, focus: KEYS[0].focus };
  for (const key of KEYS) {
    const p = interpolate(frame, [key.at - key.dur, key.at], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: io });
    c.x += (key.x - c.x) * p;
    c.y += (key.y - c.y) * p;
    c.z += (key.z - c.z) * p;
    c.yaw += (key.yaw - c.yaw) * p;
    c.pitch += (key.pitch - c.pitch) * p;
    c.focus += (key.focus - c.focus) * p;
  }
  // gentle handheld float, zero at both ends so the loop is seamless
  const fl = Math.sin((Math.PI * frame) / TOTAL_FRAMES);
  const t = frame / 30;
  c.x += Math.sin(t * 0.9) * 12 * fl;
  c.y += Math.cos(t * 0.7) * 7 * fl;
  c.yaw += Math.sin(t * 0.5) * 0.008 * fl;
  return c;
};

/** Camera roll (radians) and speed (world units per frame), for banking and motion blur. */
export const camMotion = (frame: number) => {
  const a = camAt(frame - 1);
  const b = camAt(frame + 1);
  const dx = (b.x - a.x) / 2;
  const dz = (b.z - a.z) / 2;
  const dyaw = (b.yaw - a.yaw) / 2;
  const lateral = dx * Math.cos(a.yaw) - dz * Math.sin(a.yaw);
  const roll = Math.max(-0.07, Math.min(0.07, -lateral * 0.0022 - dyaw * 2.2));
  return { roll, speed: Math.hypot(dx, dz, (b.y - a.y) / 2) };
};
