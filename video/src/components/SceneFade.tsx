import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeInOut, prog } from "../lib/anim";
import { OVERLAP } from "../lib/theme";

/** Cross-dissolve with a slight push-in, wrapped around every scene. */
export const SceneFade: React.FC<{
  children: React.ReactNode;
  fadeIn?: boolean;
  fadeOut?: boolean;
  outLen?: number;
}> = ({ children, fadeIn = true, fadeOut = true, outLen = OVERLAP }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pin = fadeIn ? prog(frame, 0, OVERLAP, easeInOut) : 1;
  const pout = fadeOut ? 1 - prog(frame, durationInFrames - outLen, outLen, easeInOut) : 1;
  const scale = 1 + (1 - pin) * 0.025 + (1 - pout) * 0.02;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: Math.min(pin, pout),
        transform: `scale(${scale})`,
        transformOrigin: "50% 50%",
      }}
    >
      {children}
    </div>
  );
};
