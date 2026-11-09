import React from "react";
import { FloorPool, Reflection } from "./Reflection";
import { Kind, Product, Tier, Tilt } from "./Products";

type Props = {
  kind: Kind;
  tier: Tier;
  /** horizontal centre + floor contact line (px) */
  cx: number;
  baseY: number;
  size: number;
  /** 0..1 reveal (opacity / blur / scale) */
  reveal?: number;
  /** 0..1 specular sweep */
  light?: number;
  rotY?: number;
  rotX?: number;
  rotZ?: number;
  float?: number;
  reflection?: number;
  glow?: string;
  opacity?: number;
};

/** A product standing on the glossy stage floor with reflection, contact shadow and light pool. */
export const ProductSpot: React.FC<Props> = ({
  kind,
  tier,
  cx,
  baseY,
  size,
  reveal = 1,
  light = 0.5,
  rotY = 0,
  rotX = 0,
  rotZ = 0,
  float = 0,
  reflection = 0.3,
  glow = "rgba(255,255,255,0.2)",
  opacity = 1,
}) => {
  const top = baseY - size * 0.95;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: cx - size * 0.62,
          top: baseY - size * 0.08,
          opacity: reveal * opacity,
        }}
      >
        <FloorPool width={size * 1.24} glow={glow} />
      </div>
      <div
        style={{
          position: "absolute",
          left: cx - size / 2,
          top: top + float,
          opacity: reveal * opacity,
          filter: reveal < 1 ? `blur(${(1 - reveal) * 20}px)` : undefined,
          transform: `scale(${0.93 + reveal * 0.07})`,
          transformOrigin: "50% 90%",
        }}
      >
        <Reflection width={size} height={size} strength={reflection}>
          <Tilt rotY={rotY} rotX={rotX} rotZ={rotZ}>
            <Product kind={kind} tier={tier} light={light} size={size} />
          </Tilt>
        </Reflection>
      </div>
    </>
  );
};
