import React from "react";
import { Composition } from "remotion";
import { WhyFakeProducts } from "./Video";
import { FPS, HEIGHT, TOTAL, WIDTH } from "./lib/theme";

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
    </>
  );
};
