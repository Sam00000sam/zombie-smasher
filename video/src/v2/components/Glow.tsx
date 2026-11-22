import React from "react";

/** Soft bloom halo behind a focal object (the reference's signature lighting). */
export const Halo: React.FC<{ x: number; y: number; r: number; o: number }> = ({ x, y, r, o }) =>
  o <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.07) 35%, rgba(255,255,255,0) 70%)",
        opacity: o,
        pointerEvents: "none",
      }}
    />
  );

/** Dashed ground line that draws outward from its centre. */
export const Floor: React.FC<{ x: number; y: number; w: number; p: number; o?: number }> = ({ x, y, w, p, o = 0.45 }) =>
  p <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: x - (w / 2) * p,
        top: y,
        width: w * p,
        height: 0,
        borderTop: "1.5px dashed rgba(255,255,255,0.9)",
        opacity: o,
      }}
    />
  );
