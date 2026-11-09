import React from "react";
import { renderPart } from "./Draw";
import { INK } from "../theme";

/** Floating information panel: hairline border that draws itself + faint glass fill. */
export const Panel: React.FC<{ x: number; y: number; w: number; h: number; p: number; opacity?: number }> = ({ x, y, w, h, p, opacity = 1 }) => {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 22,
          background: "linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
          boxShadow: "0 0 60px rgba(255,255,255,0.05)",
          opacity: p,
        }}
      />
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {renderPart({ t: "rect", x: 0.5, y: 0.5, w: w - 1, h: h - 1, rx: 22 }, p, "r", { width: 1.2, color: "rgba(255,255,255,0.35)" })}
      </svg>
    </div>
  );
};

export const Hairline: React.FC<{ x: number; y: number; w: number; p: number; opacity?: number }> = ({ x, y, w, p, opacity = 0.18 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w * p, height: 1, background: INK, opacity }} />
);
