import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { prog } from "../v2/anim";
import { DotGrid } from "../v2/components/DotGrid";
import { cameraAt } from "./camera";
import { S1Compare } from "./scenes/S1Compare";
import { S2Choice } from "./scenes/S2Choice";
import { S3Everyday } from "./scenes/S3Everyday";
import { S4End } from "./scenes/S4End";
import { Subtitles } from "./Subtitles";
import { TOTAL_FRAMES } from "./timing";

/** "Why Fake Products Are Better Than Real Ones" — narration is the only audio (no music, no SFX). */
export const FakeBetter: React.FC = () => {
  const fr = useCurrentFrame();
  const cam = cameraAt(fr);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <DotGrid camX={cam.x} camY={cam.y} opacity={prog(fr, 2, 30)} />
      <S1Compare />
      <S2Choice />
      <S3Everyday />
      <S4End />
      <Subtitles />
      <AbsoluteFill style={{ background: "#000", opacity: prog(fr, TOTAL_FRAMES - 20, 18) }} />
      <Audio src={staticFile("voice/fake-narration.wav")} />
    </AbsoluteFill>
  );
};
