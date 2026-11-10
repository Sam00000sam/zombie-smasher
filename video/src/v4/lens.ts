import { SCENES } from "./timing";

/**
 * Calm lens: within each scene the camera makes one slow, gentle push-in and settles back
 * (sine-shaped, so it is continuous across scene boundaries). No whips, no punches, no shake.
 */
const WINDOWS = [SCENES.hook, SCENES.tower, SCENES.trend, SCENES.save, SCENES.end];
const AMOUNT = [0.05, 0.05, 0.05, 0.045, 0.06];

export const lensAt = (frame: number) => {
  let z = 1;
  WINDOWS.forEach((w, i) => {
    if (frame >= w.from && frame <= w.to) {
      const p = (frame - w.from) / (w.to - w.from);
      z = Math.max(z, 1 + AMOUNT[i] * Math.sin(Math.PI * p));
    }
  });
  return { x: 960, y: 500, z };
};
