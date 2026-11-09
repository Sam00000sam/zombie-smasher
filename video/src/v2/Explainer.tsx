import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { prog } from "./anim";
import { cameraAt } from "./camera";
import { DotGrid } from "./components/DotGrid";
import { S1Hook } from "./scenes/S1Hook";
import { S2Compare } from "./scenes/S2Compare";
import { S3Value } from "./scenes/S3Value";
import { S4Reality } from "./scenes/S4Reality";
import { S5End } from "./scenes/S5End";
import { TOTAL_FRAMES } from "./timing";

/** 30-second minimalist explainer. The only audio is the narration — no music, no SFX. */
export const ValueExplainer: React.FC = () => {
  const fr = useCurrentFrame();
  const cam = cameraAt(fr);
  const gridIn = prog(fr, 4, 40);
  const fadeToBlack = prog(fr, TOTAL_FRAMES - 22, 20);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <DotGrid camX={cam.x} camY={cam.y} opacity={gridIn} />
      <S1Hook />
      <S2Compare />
      <S3Value />
      <S4Reality />
      <S5End />
      <AbsoluteFill style={{ background: "#000", opacity: fadeToBlack }} />
      <Audio src={staticFile("voice/narration.wav")} />
    </AbsoluteFill>
  );
};
