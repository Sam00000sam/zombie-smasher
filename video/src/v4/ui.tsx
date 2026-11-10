import React from "react";
import { FONT, INK } from "../v2/theme";

/** Price tag hanging from a short string (static — no swinging). */
export const Tag: React.FC<{ label: string; value: number; w?: number; big?: number }> = ({ label, value, w = 210, big = 48 }) => (
  <div style={{ position: "relative", width: w }}>
    <div style={{ position: "absolute", left: w / 2 - 1, top: -34, width: 2, height: 34, background: INK, boxShadow: "0 0 8px rgba(255,255,255,0.6)" }} />
    <div style={{ position: "relative", padding: "24px 0 14px", border: `2px solid ${INK}`, borderRadius: 16, background: "#000", boxShadow: "0 0 14px rgba(255,255,255,0.3)", textAlign: "center", fontFamily: FONT, color: INK }}>
      <div style={{ position: "absolute", left: "50%", top: 8, width: 10, height: 10, marginLeft: -5, borderRadius: 5, border: `2px solid ${INK}` }} />
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.3em" }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: big, fontWeight: 700, lineHeight: 1.05, fontVariantNumeric: "tabular-nums", textShadow: "0 0 14px rgba(255,255,255,0.5)" }}>${Math.round(value).toLocaleString("en-US")}</div>
    </div>
  </div>
);

/** Small centred caption-like label under an object. */
export const Tiny: React.FC<{ text: string; color?: string; size?: number }> = ({ text, color = INK, size = 13 }) => (
  <div style={{ fontFamily: FONT, fontSize: size, fontWeight: 600, letterSpacing: "0.28em", color, textTransform: "uppercase", whiteSpace: "nowrap", textAlign: "center" }}>{text}</div>
);

/** Absolutely placed, centre-anchored box. */
export const Place: React.FC<{ x: number; y: number; w?: number; children: React.ReactNode }> = ({ x, y, w = 400, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, display: "flex", justifyContent: "center" }}>{children}</div>
);
