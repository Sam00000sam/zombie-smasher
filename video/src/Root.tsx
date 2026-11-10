import React from "react";
import { Composition } from "remotion";
import { WhyFakeProducts } from "./Video";
import { FPS, HEIGHT, TOTAL, WIDTH } from "./lib/theme";
import { ValueExplainer } from "./v2/Explainer";
import { TOTAL_FRAMES } from "./v2/timing";
import { FakeBetter } from "./v3/Explainer";
import { TOTAL_FRAMES as FAKE_FRAMES } from "./v3/timing";

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
    </>
  );
};
