import { Easing, interpolate, spring } from "remotion";

export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOutBack = Easing.bezier(0.34, 1.56, 0.64, 1);

/** 0→1 progress between two frames, eased and clamped. */
export const prog = (
  frame: number,
  start: number,
  dur: number,
  easing: (t: number) => number = easeOutExpo,
) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** 1→0 progress (for exits). */
export const progOut = (
  frame: number,
  start: number,
  dur: number,
  easing: (t: number) => number = easeInOut,
) => 1 - prog(frame, start, dur, easing);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const slam = (frame: number, fps: number, start: number) =>
  spring({
    frame: frame - start,
    fps,
    config: { damping: 11, stiffness: 160, mass: 0.7 },
  });
