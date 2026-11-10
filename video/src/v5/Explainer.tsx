import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { prog } from "../v2/anim";
import { buildCues, Captions } from "../shared/Captions";
import { cameraAt } from "./camera";
import { BigGrid, Motes } from "./depth";
import { lensAt } from "./lens";
import { S1Hook } from "./scenes/S1Hook";
import { S2Tower } from "./scenes/S2Tower";
import { S3Notice } from "./scenes/S3Notice";
import { S3Trend } from "./scenes/S3Trend";
import { S5Worry } from "./scenes/S5Worry";
import { S6SaveGrow } from "./scenes/S6SaveGrow";
import { S7Status } from "./scenes/S7Status";
import { S5End } from "./scenes/S5End";
import { CUE, EMPHASIS, f, FPS, PHRASES, WORDS } from "./timing";
import { FONT } from "../v2/theme";

const CUES = buildCues(WORDS, PHRASES, EMPHASIS, FPS);

/** "Product or Label?" 60 s — calm, smooth version; the last frame matches the first so it loops. Narration is the only audio (no music, no SFX). */
export const LabelOrProduct60: React.FC = () => {
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
        <S3Notice />
        <S3Trend />
        <S5Worry />
        <S6SaveGrow />
        <S7Status />
        <S5End />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 72% 68% at 50% 48%, transparent 55%, rgba(0,0,0,0.8) 100%)", pointerEvents: "none" }} />
      <Captions cues={CUES} fps={FPS} />
      {/* small, honest note: the prices are examples */}
      <div style={{ position: "absolute", right: 48, top: 40, fontFamily: FONT, fontSize: 14, fontWeight: 600, letterSpacing: "0.24em", color: "#8a8a8a", opacity: prog(fr, f(CUE.price) - 4, 16) * (1 - prog(fr, f(CUE.speechEnd) + 6, 14)) }}>
        ILLUSTRATIVE PRICES
      </div>
      <Audio src={staticFile("voice/label60-narration.wav")} />
    </AbsoluteFill>
  );
};
