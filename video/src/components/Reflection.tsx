import React from "react";

/** Renders children plus a faded, flipped, blurred mirror image below them (glossy floor). */
export const Reflection: React.FC<{
  width: number;
  height: number;
  strength?: number;
  gap?: number;
  children: React.ReactNode;
}> = ({ width, height, strength = 0.32, gap = 6, children }) => {
  return (
    <div style={{ position: "relative", width, height }}>
      <div style={{ position: "absolute", left: 0, top: 0, width, height }}>{children}</div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: height + gap,
          width,
          height,
          transform: "scaleY(-1)",
          opacity: strength,
          filter: "blur(2.5px)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,1) 100%)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,1) 100%)",
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Soft contact shadow + light pool under a product. */
export const FloorPool: React.FC<{ width: number; glow?: string; opacity?: number }> = ({
  width,
  glow = "rgba(255,255,255,0.22)",
  opacity = 1,
}) => (
  <div style={{ position: "relative", width, height: width * 0.16, opacity }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: `radial-gradient(ellipse at center, ${glow}, transparent 68%)`,
        filter: "blur(6px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: "18%",
        right: "18%",
        top: "34%",
        height: "34%",
        borderRadius: "50%",
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85), transparent 70%)",
        filter: "blur(8px)",
      }}
    />
  </div>
);
