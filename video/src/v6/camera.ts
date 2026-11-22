import { interpolate } from "remotion";
import { io } from "../v5/smooth";
import { CUE, f } from "../v5/timing";
import { Cam } from "./engine";

/** Camera path through the neon world: smooth eased moves between keyed shots, always travelling. */
type K = Cam & { at: number; dur?: number };
const k = (t: number, x: number, y: number, z: number, yaw: number, pitch: number, focus: number, dur = 30): K => ({ at: f(t), x, y, z, yaw, pitch, focus, dur });

export const LOOP_Z = 13600;
const KEYS: K[] = [
  k(0, 0, 460, 200, 0.04, -0.04, 1000, 1),
  k(1.3, 0, 470, 330, -0.03, -0.04, 870, 38),
  k(1.95, 0, 330, 430, 0, -0.06, 880, 18),
  k(CUE.smarter + 0.3, 60, 320, 540, -0.06, -0.06, 800, 40),
  // → price tower
  k(4.75, 0, 380, 2100, 0.05, -0.05, 950, 26),
  k(CUE.product + 0.2, 50, 360, 2200, 0.06, -0.03, 880, 30),
  k(CUE.store + 0.2, 60, 420, 2050, 0.05, -0.08, 980, 36),
  k(CUE.copy + 0.4, 0, 380, 2150, 0, -0.06, 900, 24),
  k(CUE.look + 0.3, 0, 330, 2260, -0.02, -0.04, 760, 34),
  k(CUE.fraction + 0.2, 0, 300, 2150, 0, -0.1, 880, 30),
  k(CUE.everyday + 0.2, 0, 300, 2250, 0.02, -0.1, 820, 40),
  // → street
  k(19.25, -200, 320, 4050, 0.15, -0.05, 800, 28),
  k(22.2, 150, 330, 4080, -0.12, -0.05, 780, 80),
  k(CUE.stitching + 0.2, 60, 300, 4160, -0.05, -0.06, 700, 36),
  // → trend
  k(25.95, 0, 360, 5850, 0.06, -0.02, 900, 26),
  k(27.6, 80, 380, 5950, -0.06, -0.02, 880, 40),
  k(CUE.rent + 0.2, 0, 340, 5820, 0, -0.03, 760, 26),
  k(CUE.season + 0.1, 0, 270, 5860, 0, -0.12, 700, 26),
  // → worry
  k(31.65, 0, 380, 7600, -0.05, -0.05, 850, 26),
  k(CUE.scuff + 0.2, 40, 380, 7700, 0.05, -0.04, 760, 34),
  k(CUE.disaster + 0.2, 60, 400, 7650, 0.04, -0.05, 800, 30),
  // → save & grow
  k(38.45, 0, 420, 9300, 0, -0.05, 900, 26),
  k(CUE.instead + 0.1, -80, 400, 9350, -0.08, -0.05, 860, 30),
  k(CUE.put, 0, 380, 9450, 0.04, -0.03, 820, 34),
  k(CUE.growWord + 0.2, 60, 420, 9560, 0.06, -0.02, 740, 34),
  k(CUE.time, 0, 460, 9500, 0, 0, 820, 40),
  // → status
  k(48.95, -150, 320, 11250, 0.12, -0.05, 760, 26),
  k(52.2, 100, 330, 11300, -0.08, -0.05, 760, 70),
  // → checkout
  k(54.15, 0, 420, 12950, 0, -0.05, 860, 26),
  k(CUE.pay + 0.5, 40, 450, 13090, 0.03, -0.04, 720, 24),
  k(CUE.ask + 0.3, -80, 380, 13000, -0.06, -0.05, 800, 26),
  k(CUE.productQ + 0.2, 0, 360, 12950, 0, -0.08, 850, 30),
  // loop back to the opening shot (one station further on)
  k(59.7, 0, 460, 200 + LOOP_Z, 0.04, -0.04, 1000, 36),
];
// pull the camera back at every station after the opening shot so side cards stay in the 9:16 frame
const PULL = 260;
KEYS.forEach((key, i) => {
  if (i >= 3 && i < KEYS.length - 1) {
    key.z -= PULL;
    key.focus += PULL;
  }
});

export const camAt = (frame: number): Cam => {
  const c: Cam = { x: KEYS[0].x, y: KEYS[0].y, z: KEYS[0].z, yaw: KEYS[0].yaw, pitch: KEYS[0].pitch, focus: KEYS[0].focus };
  for (const key of KEYS) {
    const d = key.dur ?? 30;
    const p = interpolate(frame, [key.at - d, key.at], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: io });
    c.x += (key.x - c.x) * p;
    c.y += (key.y - c.y) * p;
    c.z += (key.z - c.z) * p;
    c.yaw += (key.yaw - c.yaw) * p;
    c.pitch += (key.pitch - c.pitch) * p;
    c.focus += (key.focus - c.focus) * p;
  }
  // gentle handheld float so held shots keep breathing (zero at the loop frames)
  const t = frame / 30;
  const fl = Math.sin((Math.PI * frame) / Math.max(1, f(60.47))) ;
  c.x += Math.sin(t * 0.9) * 10 * fl;
  c.y += Math.cos(t * 0.7) * 6 * fl;
  return c;
};
