import { interpolate } from "remotion";
import { io } from "../v5/smooth";
import { Cam } from "../v6/engine";
import { CHAPTERS, CUE, f, L, TOTAL_FRAMES } from "./timing";

const GAP = 1300;
/** Stations along z: hook, reasons 5→1, ending. */
export const Z = { H: 1200, R5: 1200 + GAP, R4: 1200 + 2 * GAP, R3: 1200 + 3 * GAP, R2: 1200 + 4 * GAP, R1: 1200 + 5 * GAP, E: 1200 + 6 * GAP };

type K = Cam & { at: number; dur: number };
const k = (t: number, x: number, y: number, z: number, yaw: number, pitch: number, focus: number, dur = 30): K => ({ at: f(t), x, y, z, yaw, pitch, focus, dur });
/** A flight from t0 to t1 that swings out to one side and lifts on the way (banking comes from camMotion). */
const fly = (t0: number, t1: number, to: Omit<K, "at" | "dur">, side: number): K[] => {
  const at = f(t1);
  const dur = at - f(t0);
  const mid: K = { ...to, at: at - Math.round(dur * 0.45), dur: Math.round(dur * 0.6), x: to.x + side * 380, y: to.y + 150, z: to.z - 500, yaw: to.yaw - side * 0.2, pitch: to.pitch - 0.05 };
  return [mid, { ...to, at, dur }];
};
const st = (x: number, y: number, z: number, yaw: number, pitch: number, focus: number) => ({ x, y, z, yaw, pitch, focus });
const [c5, c4, c3, c2, c1] = CHAPTERS;

const KEYS: K[] = [
  k(0, 0, 430, 160, 0.03, -0.04, 1040, 1),
  k(L.hook.end, -30, 410, 330, -0.03, -0.05, 870, f(L.hook.end) - 1),
  // 5 — the price
  ...fly(c5.from, c5.until, st(0, 440, Z.R5 - 1000, 0, -0.04, 1000), 1),
  k(CUE.same, -40, 425, Z.R5 - 940, 0.025, -0.04, 940, f(CUE.same - c5.until)),
  k(CUE.thirty + 0.3, 0, 470, Z.R5 - 1060, 0, -0.05, 1060, 24),
  // 4 — you'll use it
  ...fly(c4.from, c4.until, st(0, 430, Z.R4 - 1000, 0, -0.04, 1000), -1),
  k(CUE.rains, 40, 420, Z.R4 - 940, -0.025, -0.04, 940, f(CUE.rains - c4.until)),
  // 3 — nobody can tell (pull back "across the room", then push in for the reveal)
  ...fly(c3.from, c3.until, st(0, 440, Z.R3 - 950, 0, -0.04, 950), 1),
  k(CUE.room + 0.3, 0, 560, Z.R3 - 1750, 0, -0.07, 1750, 44),
  k(CUE.realThing + 0.3, 0, 470, Z.R3 - 1200, 0, -0.05, 1200, 26),
  // 2 — trends move fast
  ...fly(c2.from, c2.until, st(0, 560, Z.R2 - 1080, 0, -0.04, 1080), -1),
  k(CUE.lost + 0.2, 0, 380, Z.R2 - 1000, 0, -0.04, 1000, 34),
  // 1 — the money you keep
  ...fly(c1.from, c1.until, st(0, 540, Z.R1 - 1080, 0, -0.04, 1080), 1),
  k(CUE.five2, 0, 430, Z.R1 - 1000, 0, -0.04, 1000, f(CUE.five2 - c1.until)),
  // the close
  ...fly(L.r1.end + 0.15, L.end.start + 0.25, st(0, 430, Z.E - 1000, 0, -0.04, 1000), -1),
  k(TOTAL_FRAMES / 30, 0, 415, Z.E - 880, 0, -0.045, 880, TOTAL_FRAMES - f(L.end.start + 0.25)),
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
  const t = frame / 30;
  c.x += Math.sin(t * 0.8) * 8;
  c.y += Math.cos(t * 0.6) * 5;
  c.yaw += Math.sin(t * 0.45) * 0.006;
  return c;
};

/** Roll (radians) from sideways motion, and speed (units/frame) for motion blur. */
export const camMotion = (frame: number) => {
  const a = camAt(frame - 1);
  const b = camAt(frame + 1);
  const dx = (b.x - a.x) / 2;
  const dz = (b.z - a.z) / 2;
  const dyaw = (b.yaw - a.yaw) / 2;
  const lateral = dx * Math.cos(a.yaw) - dz * Math.sin(a.yaw);
  return { roll: Math.max(-0.06, Math.min(0.06, -lateral * 0.002 - dyaw * 2)), speed: Math.hypot(dx, dz, (b.y - a.y) / 2) };
};
