import React from "react";
import { Composition } from "remotion";
import { WhyFakeProducts } from "./Video";
import { FPS, HEIGHT, TOTAL, WIDTH } from "./lib/theme";
import { ValueExplainer } from "./v2/Explainer";
import { TOTAL_FRAMES } from "./v2/timing";
import { FakeBetter } from "./v3/Explainer";
import { TOTAL_FRAMES as FAKE_FRAMES } from "./v3/timing";
import { LabelOrProduct } from "./v4/Explainer";
import { TOTAL_FRAMES as LABEL_FRAMES } from "./v4/timing";
import { LabelOrProduct60 } from "./v5/Explainer";
import { TOTAL_FRAMES as LABEL60_FRAMES } from "./v5/timing";
import { NeonLabel } from "./v6/Neon";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WhyFakeProducts"
        component={WhyFakeProducts}
        durationInFrames={TOTAL}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="ValueExplainer30"
        component={ValueExplainer}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="FakeBetter"
        component={FakeBetter}
        durationInFrames={FAKE_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="LabelOrProduct"
        component={LabelOrProduct}
        durationInFrames={LABEL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="LabelOrProduct60"
        component={LabelOrProduct60}
        durationInFrames={LABEL60_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition id="NeonLabel60" component={NeonLabel} durationInFrames={LABEL60_FRAMES} fps={FPS} width={1080} height={1920} />
    </>
  );
};
