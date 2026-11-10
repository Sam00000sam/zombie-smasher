import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { prog } from "../v2/anim";
import { buildCues, Captions } from "../shared/Captions";
import { cameraAt } from "./camera";
import { BigGrid, Motes } from "./depth";
import { lensAt } from "./lens";
import { S1Hook } from "./scenes/S1Hook";
import { S2Tower } from "./scenes/S2Tower";
import { S3Trend } from "./scenes/S3Trend";
import { S4Save } from "./scenes/S4Save";
import { S5End } from "./scenes/S5End";
import { EMPHASIS, FPS, PHRASES, TOTAL_FRAMES, WORDS } from "./timing";

const CUES = buildCues(WORDS, PHRASES, EMPHASIS, FPS);

/** "Product or Label?" — calm, smooth version. Narration is the only audio (no music, no SFX). */
export const LabelOrProduct: React.FC = () => {
  const fr = useCurrentFrame();
  const cam = cameraAt(fr);
  const v = lensAt(fr);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${960 - v.x * v.z}px, ${540 - v.y * v.z}px) scale(${v.z})`, transformOrigin: "0 0" }}>
        <BigGrid x={cam.x} y={cam.y} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.45 }}>
          <Motes camX={cam.x} camY={cam.y} />
        </div>
        <S1Hook />
        <S2Tower />
        <S3Trend />
        <S4Save />
        <S5End />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 72% 68% at 50% 48%, transparent 55%, rgba(0,0,0,0.8) 100%)", pointerEvents: "none" }} />
      <Captions cues={CUES} fps={FPS} />
      <AbsoluteFill style={{ background: "#000", opacity: prog(fr, TOTAL_FRAMES - 30, 28) }} />
      <Audio src={staticFile("voice/label-narration.wav")} />
    </AbsoluteFill>
  );
};
