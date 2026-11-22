import React from "react";
import { stagger } from "../anim";
import { GLOW, INK } from "../theme";

export type Part =
  | { t: "path"; d: string }
  | { t: "rect"; x: number; y: number; w: number; h: number; rx?: number }
  | { t: "circle"; cx: number; cy: number; r: number }
  | { t: "line"; x1: number; y1: number; x2: number; y2: number };

type StrokeOpts = { width: number; color: string; dash?: string };

/** One SVG primitive that draws itself on as `p` goes 0→1 (normalised pathLength). */
export const renderPart = (part: Part, p: number, key: React.Key, o: StrokeOpts) => {
  if (p <= 0) return null;
  const common = {
    fill: "none",
    stroke: o.color,
    strokeWidth: o.width,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...(o.dash
      ? { strokeDasharray: o.dash }
      : { pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - p }),
  };
  switch (part.t) {
    case "path":
      return <path key={key} d={part.d} {...common} />;
    case "rect":
      return <rect key={key} x={part.x} y={part.y} width={part.w} height={part.h} rx={part.rx ?? 0} {...common} />;
    case "circle":
      return <circle key={key} cx={part.cx} cy={part.cy} r={part.r} {...common} />;
    case "line":
      return <line key={key} x1={part.x1} y1={part.y1} x2={part.x2} y2={part.y2} {...common} />;
  }
};

type LineArtProps = {
  parts: Part[];
  /** 0..1 drawing progress (parts draw in sequence, overlapping) */
  p: number;
  /** centre position + rendered size in px */
  x: number;
  y: number;
  size: number;
  viewBox?: number;
  width?: number;
  color?: string;
  /** dashed outline revealed with a wipe instead of a line draw */
  dashed?: boolean;
  glow?: boolean;
  opacity?: number;
  spread?: number;
  children?: React.ReactNode;
};

/** A line-art illustration that draws itself onto the screen. */
export const LineArt: React.FC<LineArtProps> = ({
  parts,
  p,
  x,
  y,
  size,
  viewBox = 200,
  width = 2.4,
  color = INK,
  dashed = false,
  glow = true,
  opacity = 1,
  spread = 0.55,
  children,
}) => {
  if (p <= 0) return null;
  // stroke widths are given in screen px; convert to viewBox units so line weight is consistent at any size
  const sw = (width * viewBox) / size;
  const clipId = `wipe-${Math.round(x)}-${Math.round(y)}-${Math.round(size)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        overflow: "visible",
        opacity,
        filter: glow ? GLOW : undefined,
      }}
    >
      {dashed ? (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect x={-20} y={-20} width={(viewBox + 40) * p} height={viewBox + 40} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            {parts.map((pt, i) => renderPart(pt, 1, i, { width: sw, color, dash: `${(6 * viewBox) / size} ${(7 * viewBox) / size}` }))}
          </g>
        </>
      ) : (
        parts.map((pt, i) => renderPart(pt, stagger(p, i, parts.length, spread), i, { width: sw, color }))
      )}
      {children}
    </svg>
  );
};

/** A free-standing line in screen space that draws from (x1,y1) to (x2,y2). */
export const DrawLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  p: number;
  width?: number;
  color?: string;
  dashed?: boolean;
  opacity?: number;
}> = ({ x1, y1, x2, y2, p, width = 1.6, color = INK, dashed = false, opacity = 1 }) => {
  if (p <= 0) return null;
  const xe = x1 + (x2 - x1) * p;
  const ye = y1 + (y2 - y1) * p;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity, pointerEvents: "none" }}>
      <line
        x1={x1}
        y1={y1}
        x2={xe}
        y2={ye}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? "5 7" : undefined}
      />
    </svg>
  );
};
