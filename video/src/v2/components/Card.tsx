import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, prog } from "../anim";
import { renderPart } from "./Draw";
import { FONT, GLOW, INK } from "../theme";

/** Outlined rounded card whose border draws itself; optional clipboard clip and header label. */
export const Card: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  start: number;
  title?: string;
  clip?: boolean;
  radius?: number;
  opacity?: number;
  titleSize?: number;
  children?: React.ReactNode;
}> = ({ x, y, w, h, start, title, clip = false, radius = 18, opacity = 1, titleSize = 13, children }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 24);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible", filter: GLOW }}>
        {renderPart({ t: "rect", x: 1, y: 1, w: w - 2, h: h - 2, rx: radius }, p, "b", { width: 2, color: INK })}
      </svg>
      {clip && <div style={{ position: "absolute", left: w / 2 - 43, top: -13, width: 86, height: 26, borderRadius: 8, background: "#000", opacity: p }} />}
      {clip && (
        <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible", filter: GLOW }}>
          {renderPart({ t: "rect", x: w / 2 - 44, y: -14, w: 88, h: 28, rx: 8 }, prog(frame, start + 10, 14), "c2", { width: 2, color: INK })}
        </svg>
      )}
      {title && (
        <div
          style={{
            position: "absolute",
            left: 28,
            top: clip ? 34 : 20,
            fontFamily: FONT,
            fontSize: titleSize,
            fontWeight: 600,
            letterSpacing: "0.26em",
            color: INK,
            opacity: prog(frame, start + 10, 12, easeOut),
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

/** Price card in the reference's "$10,000" style: tiny label, big counting number. */
export const PriceCard: React.FC<{
  x: number;
  y: number;
  start: number;
  label: string;
  value: number;
  w?: number;
  big?: number;
  opacity?: number;
}> = ({ x, y, start, label, value, w = 230, big = 54, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const h = big * 1.95;
  const n = Math.round(value * prog(frame, start + 6, 22, easeOut));
  return (
    <Card x={x - w / 2} y={y - h / 2} w={w} h={h} start={start} opacity={opacity} radius={14}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          fontFamily: FONT,
          color: INK,
          opacity: prog(frame, start + 6, 12, easeOut),
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase" }}>{label}</div>
        <div
          style={{
            fontSize: big,
            fontWeight: 700,
            letterSpacing: "0.01em",
            lineHeight: 1.05,
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 0 18px rgba(255,255,255,0.5)",
          }}
        >
          ${n}
        </div>
      </div>
    </Card>
  );
};

/** Rounded checkbox: square draws in, then optional mark (check / warning / tilde). */
export const Checkbox: React.FC<{ x: number; y: number; start: number; mark: "check" | "warn" | "varies"; size?: number }> = ({
  x,
  y,
  start,
  mark,
  size = 26,
}) => {
  const frame = useCurrentFrame();
  const pb = prog(frame, start, 10);
  const pm = prog(frame, start + 6, 12);
  if (pb <= 0) return null;
  const s = size;
  const markPath =
    mark === "check" ? "M6.5 13.5 L11 18 L19.5 8.5" : mark === "varies" ? "M6 13 Q9.5 9 13 13 T20 13" : "M13 6.5 L13 15";
  return (
    <svg width={s} height={s} viewBox="0 0 26 26" style={{ position: "absolute", left: x - s / 2, top: y - s / 2, overflow: "visible", filter: GLOW }}>
      {renderPart({ t: "rect", x: 1, y: 1, w: 24, h: 24, rx: 5 }, pb, "b", { width: 1.8, color: INK })}
      {renderPart({ t: "path", d: markPath }, pm, "m", { width: 2.4, color: INK })}
      {mark === "warn" && pm > 0.9 && <circle cx={13} cy={19.5} r={1.5} fill={INK} />}
    </svg>
  );
};
