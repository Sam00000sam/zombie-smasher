import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../anim";
import { cameraAt } from "../camera";

/**
 * A scene on the shared canvas. `world` content moves with the camera (scene changes read as one
 * continuous camera move over the dotted grid) and gets a slow push-in; `screen` content stays put.
 * Entering/leaving uses the reference's blur-dissolve.
 */
export const SceneLayer: React.FC<{
  win: { from: number; to: number };
  origin: { x: number; y: number };
  fadeIn?: number;
  fadeOut?: number;
  push?: number;
  world: React.ReactNode;
  screen?: React.ReactNode;
}> = ({ win, origin, fadeIn = 0, fadeOut = 0, push = 0.035, world, screen }) => {
  const frame = useCurrentFrame();
  if (frame < win.from || frame >= win.to) return null;
  const cam = cameraAt(frame);
  const fi = fadeIn ? prog(frame, win.from, fadeIn) : 1;
  const fo = fadeOut ? 1 - prog(frame, win.to - fadeOut, fadeOut) : 1;
  const o = Math.min(fi, fo);
  const zoom = 1 + push * prog(frame, win.from, win.to - win.from);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, filter: o < 1 ? `blur(${(1 - o) * 10}px)` : undefined }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${origin.x - cam.x}px, ${origin.y - cam.y}px) scale(${zoom})`,
          transformOrigin: "50% 50%",
        }}
      >
        {world}
      </div>
      {screen}
    </div>
  );
};
