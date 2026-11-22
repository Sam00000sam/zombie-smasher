import { Easing, interpolate } from "remotion";

export const ease = Easing.bezier(0.45, 0, 0.2, 1); // smooth in-out
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** Eased 0→1 between frame `start` and `start + dur`. */
export const prog = (frame: number, start: number, dur: number, e: (t: number) => number = ease) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: e,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Progress of part i of n when a whole drawing is at progress p (parts overlap). */
export const stagger = (p: number, i: number, n: number, spread = 0.55) => {
  const start = n <= 1 ? 0 : (i / (n - 1)) * spread;
  return clamp01((p - start) / (1 - spread));
};
