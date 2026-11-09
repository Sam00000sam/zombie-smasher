import React from "react";
import { GRID } from "../theme";
import { H, W } from "../timing";

/** Pure black canvas with a subtle dotted grid that moves with the camera. */
export const DotGrid: React.FC<{ camX: number; camY: number; opacity: number; spacing?: number }> = ({
  camX,
  camY,
  opacity,
  spacing = 40,
}) => {
  const ox = ((-camX % spacing) + spacing) % spacing;
  const oy = ((-camY % spacing) + spacing) % spacing;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity }}>
        <defs>
          <pattern id="dot-grid" width={spacing} height={spacing} patternUnits="userSpaceOnUse" x={ox} y={oy}>
            <circle cx={spacing / 2} cy={spacing / 2} r={1.5} fill={GRID} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#dot-grid)" />
      </svg>
      {/* soft edge falloff keeps attention in the centre */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 55%, rgba(0,0,0,0.85) 100%)",
        }}
      />
    </div>
  );
};
