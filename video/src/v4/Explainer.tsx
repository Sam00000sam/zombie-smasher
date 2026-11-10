import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { prog } from "../v2/anim";
import { bump } from "../v3/fx";
import { buildCues, Captions } from "../shared/Captions";
import { cameraAt } from "./camera";
import { BigGrid, Motes } from "./depth";
import { lensAt } from "./lens";
import { S1Hook } from "./scenes/S1Hook";
import { S2Tower } from "./scenes/S2Tower";
import { S3Trend } from "./scenes/S3Trend";
import { S4Save } from "./scenes/S4Save";
import { S5End } from "./scenes/S5End";
import { EMPHASIS, f, FPS, PHRASES, PUNCHES, TOTAL_FRAMES, WORDS } from "./timing";

const CUES = buildCues(WORDS, PHRASES, EMPHASIS, FPS);

/** Screen transform for the camera at a frame: rig pans (inside scenes) × lens zoom/focus × punch-ins. */
const view = (fr: number) => {
  const L = lensAt(fr);
  const z = L.z * (1 + PUNCHES.reduce((a, t) => a + 0.045 * bump(fr - f(t)), 0));
  return { x: L.x, y: L.y, z };
};

/** "Product or Label?" — second explainer. Narration is the only audio (no music, no SFX). */
export const LabelOrProduct: React.FC = () => {
  const fr = useCurrentFrame();
  const cam = cameraAt(fr);
  const v = view(fr);
  // motion blur from camera speed (lens + rig), so whip moves feel physical
  const v0 = view(Math.max(0, fr - 1));
  const c0 = cameraAt(Math.max(0, fr - 1));
  const speed = Math.hypot((v.x - v0.x) * v.z + (cam.x - c0.x) * v.z, (v.y - v0.y) * v.z + (cam.y - c0.y) * v.z) + Math.abs(v.z - v0.z) * 900;
  const blur = Math.min(2.5, Math.max(0, (speed - 16) * 0.08));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${960 - v.x * v.z}px, ${540 - v.y * v.z}px) scale(${v.z})`,
          transformOrigin: "0 0",
          filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined,
        }}
      >
        <BigGrid x={cam.x} y={cam.y} />
        <Motes camX={cam.x} camY={cam.y} />
        <S1Hook />
        <S2Tower />
        <S3Trend />
        <S4Save />
        <S5End />
      </AbsoluteFill>
      {/* lens vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 72% 68% at 50% 48%, transparent 55%, rgba(0,0,0,0.82) 100%)", pointerEvents: "none" }} />
      <Captions cues={CUES} fps={FPS} />
      <AbsoluteFill style={{ background: "#000", opacity: prog(fr, TOTAL_FRAMES - 24, 22) }} />
      <Audio src={staticFile("voice/label-narration.wav")} />
    </AbsoluteFill>
  );
};
