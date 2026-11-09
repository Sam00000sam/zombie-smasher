import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../anim";
import { cameraAt } from "../camera";
import { DIM, FONT, INK } from "../theme";

/**
 * A scene on the shared canvas. `world` content moves with the camera (so scene changes read as one
 * continuous camera move over the dotted grid); `screen` content (headlines, kicker) stays put.
 */
export const SceneLayer: React.FC<{
  win: { from: number; to: number };
  origin: { x: number; y: number };
  fadeIn?: number;
  fadeOut?: number;
  world: React.ReactNode;
  screen?: React.ReactNode;
}> = ({ win, origin, fadeIn = 0, fadeOut = 0, world, screen }) => {
  const frame = useCurrentFrame();
  if (frame < win.from || frame >= win.to) return null;
  const cam = cameraAt(frame);
  const fi = fadeIn ? prog(frame, win.from, fadeIn) : 1;
  const fo = fadeOut ? 1 - prog(frame, win.to - fadeOut, fadeOut) : 1;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: Math.min(fi, fo) }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${origin.x - cam.x}px, ${origin.y - cam.y}px)` }}>
        {world}
      </div>
      {screen}
    </div>
  );
};

/** Section marker in the top-left corner, e.g. "02 — THE COMPARISON". */
export const Kicker: React.FC<{ n: string; title: string; start: number; out?: number }> = ({ n, title, start, out }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 18);
  const o = out === undefined ? 1 : 1 - prog(frame, out, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 62,
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontFamily: FONT,
        fontSize: 15,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        opacity: p * o,
      }}
    >
      <span style={{ color: INK, fontWeight: 600 }}>{n}</span>
      <span style={{ width: 40 * p, height: 1, background: DIM, display: "inline-block" }} />
      <span style={{ color: DIM, fontWeight: 500 }}>{title}</span>
    </div>
  );
};
