import { interpolate } from "remotion";
import { io } from "../v5/smooth";
import { Cam } from "../v6/engine";
import { CHAPTERS, CUE, f, L, TOTAL_FRAMES } from "../v8/timing";

const GAP = 1300;
/** Stations along z: hook, reasons 5→1, ending. */
export const Z = { H: 1200, R5: 1200 + GAP, R4: 1200 + 2 * GAP, R3: 1200 + 3 * GAP, R2: 1200 + 4 * GAP, R1: 1200 + 5 * GAP, E: 1200 + 6 * GAP };

type K = Cam & { at: number; dur: number };
const k = (t: number, x: number, y: number, z: number, yaw: number, pitch: number, focus: number, dur = 30): K => ({ at: f(t), x, y, z, yaw, pitch, focus, dur });
/** A clean flight: one eased move with a gentle arc to one side. */
const fly = (t0: number, t1: number, to: Omit<K, "at" | "dur">, side: number): K[] => {
  const at = f(t1);
  const dur = at - f(t0);
  const mid: K = { ...to, at: at - Math.round(dur * 0.45), dur: Math.round(dur * 0.6), x: to.x + side * 170, y: to.y + 70, z: to.z - 450, yaw: to.yaw - side * 0.07, pitch: to.pitch - 0.02 };
  return [mid, { ...to, at, dur }];
};
const st = (x: number, y: number, z: number, yaw: number, pitch: number, focus: number) => ({ x, y, z, yaw, pitch, focus });
const [c5, c4, c3, c2, c1] = CHAPTERS;

/** Each station: arrive, then one slow continuous push for the rest of the beat (no back-and-forth). */
const KEYS: K[] = [
  k(0, 0, 430, 180, 0, -0.04, 1020, 1),
  k(L.hook.end, 0, 420, 320, 0, -0.045, 880, f(L.hook.end) - 1),
  ...fly(c5.from, c5.until, st(0, 440, Z.R5 - 1020, 0, -0.04, 1020), 1),
  k(c4.from - 0.05, 0, 430, Z.R5 - 930, 0, -0.045, 930, f(c4.from - 0.05 - c5.until)),
  ...fly(c4.from, c4.until, st(0, 430, Z.R4 - 1020, 0, -0.04, 1020), -1),
  k(c3.from - 0.05, 0, 425, Z.R4 - 930, 0, -0.045, 930, f(c3.from - 0.05 - c4.until)),
  // 3: ease back "across the room", then ease in for the reveal
  ...fly(c3.from, c3.until, st(0, 440, Z.R3 - 980, 0, -0.04, 980), 1),
  k(CUE.room + 0.4, 0, 520, Z.R3 - 1650, 0, -0.06, 1650, 50),
  k(CUE.realThing + 0.4, 0, 460, Z.R3 - 1180, 0, -0.045, 1180, 30),
  ...fly(c2.from, c2.until, st(0, 520, Z.R2 - 1060, 0, -0.04, 1060), -1),
  k(c1.from - 0.05, 0, 470, Z.R2 - 980, 0, -0.045, 980, f(c1.from - 0.05 - c2.until)),
  ...fly(c1.from, c1.until, st(0, 440, Z.R1 - 1080, 0, -0.035, 1080), 1),
  k(L.r1.end, 0, 425, Z.R1 - 1000, 0, -0.04, 1000, f(L.r1.end - c1.until)),
  ...fly(L.r1.end + 0.15, L.end.start + 0.25, st(0, 430, Z.E - 1020, 0, -0.04, 1020), -1),
  k(TOTAL_FRAMES / 30, 0, 420, Z.E - 900, 0, -0.045, 900, TOTAL_FRAMES - f(L.end.start + 0.25)),
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
  // a very slow float so held shots never feel frozen
  const t = frame / 30;
  c.x += Math.sin(t * 0.5) * 6;
  c.y += Math.cos(t * 0.4) * 3;
  return c;
};

/** Gentle bank and speed (for a light motion blur on flights). */
export const camMotion = (frame: number) => {
  const a = camAt(frame - 1);
  const b = camAt(frame + 1);
  const dx = (b.x - a.x) / 2;
  const dz = (b.z - a.z) / 2;
  const lateral = dx * Math.cos(a.yaw) - dz * Math.sin(a.yaw);
  return { roll: Math.max(-0.025, Math.min(0.025, -lateral * 0.0012)), speed: Math.hypot(dx, dz, (b.y - a.y) / 2) };
};
