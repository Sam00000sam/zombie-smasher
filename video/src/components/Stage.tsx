import React from "react";
import { random, useCurrentFrame } from "remotion";
import { C, HEIGHT, WIDTH } from "../lib/theme";

type StageProps = {
  /** 0..1 overall light intensity */
  intensity?: number;
  /** spotlight centre (px) */
  spotX?: number;
  spotY?: number;
  warm?: string;
  cool?: string;
  /** show the glossy floor horizon */
  floorY?: number | null;
};

const DUST = new Array(46).fill(0).map((_, i) => ({
  x: random(`dx${i}`) * WIDTH,
  y: random(`dy${i}`) * HEIGHT,
  r: 1 + random(`dr${i}`) * 2.6,
  s: 0.15 + random(`ds${i}`) * 0.5,
  p: random(`dp${i}`) * 6.28,
}));

export const Stage: React.FC<StageProps> = ({
  intensity = 1,
  spotX = WIDTH / 2,
  spotY = 330,
  warm = "rgba(227,189,115,0.20)",
  cool = "rgba(80,130,255,0.14)",
  floorY = 760,
}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90);
  const drift2 = Math.cos(frame / 120);

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden" }}>
      {/* key light */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: intensity,
          background: `radial-gradient(ellipse 1000px 760px at ${spotX + drift * 60}px ${spotY}px, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 45%, transparent 72%)`,
        }}
      />
      {/* warm + cool colour glows for drama */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: intensity,
          background: `radial-gradient(ellipse 800px 600px at ${300 + drift2 * 80}px ${760 + drift * 30}px, ${warm}, transparent 70%), radial-gradient(ellipse 800px 600px at ${1620 - drift * 80}px ${300 + drift2 * 40}px, ${cool}, transparent 70%)`,
        }}
      />
      {/* glossy floor */}
      {floorY !== null && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: floorY,
            bottom: 0,
            opacity: intensity,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.015) 40%, rgba(0,0,0,0) 100%)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        />
      )}
      {/* dust motes */}
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0, opacity: intensity }}>
        {DUST.map((d, i) => {
          const y = (((d.y - frame * d.s * 0.6) % HEIGHT) + HEIGHT) % HEIGHT;
          const x = d.x + Math.sin(frame / 70 + d.p) * 22;
          const tw = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(frame / 30 + d.p));
          return <circle key={i} cx={x} cy={y} r={d.r} fill="#fff" opacity={tw * 0.55} />;
        })}
      </svg>
      {/* vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 75% 70% at 50% 48%, transparent 40%, rgba(0,0,0,0.78) 100%)",
        }}
      />
      <Grain />
    </div>
  );
};

/** Frame-seeded film grain. */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.16 }}
    >
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed={frame % 9} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
};
