import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { prog } from "../v2/anim";
import { DotGrid } from "../v2/components/DotGrid";
import { bump } from "../v3/fx";
import { buildCues, Captions } from "../shared/Captions";
import { cameraAt } from "./camera";
import { S1Hook } from "./scenes/S1Hook";
import { S2Tower } from "./scenes/S2Tower";
import { S3Trend } from "./scenes/S3Trend";
import { S4Save } from "./scenes/S4Save";
import { S5End } from "./scenes/S5End";
import { EMPHASIS, f, FPS, PHRASES, PUNCHES, TOTAL_FRAMES, WORDS } from "./timing";

const CUES = buildCues(WORDS, PHRASES, EMPHASIS, FPS);

/** "Product or Label?" — second explainer. Narration is the only audio (no music, no SFX). */
export const LabelOrProduct: React.FC = () => {
  const fr = useCurrentFrame();
  const cam = cameraAt(fr);
  const zoom = 1 + PUNCHES.reduce((z, t) => z + 0.05 * bump(fr - f(t)), 0);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <DotGrid camX={cam.x} camY={cam.y} opacity={1} />
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <S1Hook />
        <S2Tower />
        <S3Trend />
        <S4Save />
        <S5End />
      </AbsoluteFill>
      <Captions cues={CUES} fps={FPS} />
      <AbsoluteFill style={{ background: "#000", opacity: prog(fr, TOTAL_FRAMES - 18, 16) }} />
      <Audio src={staticFile("voice/label-narration.wav")} />
    </AbsoluteFill>
  );
};
