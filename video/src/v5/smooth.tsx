import React from "react";
import { useCurrentFrame } from "remotion";
import { Easing, interpolate } from "remotion";

/** Smooth in-out easing used for everything in this video. */
export const io = Easing.bezier(0.45, 0, 0.25, 1);
export const p01 = (fr: number, start: number, dur: number) =>
  interpolate(fr, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: io });

/** Fade + gentle rise in at `at`; optional fade out at `out`. */
export const Rise: React.FC<{ at: number; out?: number; dy?: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at,
  out,
  dy = 18,
  dur = 18,
  children,
  style,
}) => {
  const fr = useCurrentFrame();
  const i = p01(fr, at, dur);
  const o = out === undefined ? 1 : 1 - p01(fr, out, 16);
  if (i <= 0 || o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, opacity: i * o, transform: `translateY(${(1 - i) * dy - (1 - o) * 8}px)`, ...style }}>{children}</div>;
};
