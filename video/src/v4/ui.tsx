import React from "react";
import { FONT, INK } from "../v2/theme";

/** Price tag hanging from a short string (static — no swinging). */
export const Tag: React.FC<{ label: string; value: number; w?: number; big?: number; strike?: number }> = ({ label, value, w = 240, big = 56, strike = 0 }) => (
  <div style={{ position: "relative", width: w }}>
    <div style={{ position: "absolute", left: w / 2 - 1, top: -34, width: 2, height: 34, background: INK, boxShadow: "0 0 8px rgba(255,255,255,0.6)" }} />
    <div style={{ position: "relative", padding: "24px 0 14px", border: `2px solid ${INK}`, borderRadius: 16, background: "#000", boxShadow: "0 0 14px rgba(255,255,255,0.3)", textAlign: "center", fontFamily: FONT, color: INK }}>
      <div style={{ position: "absolute", left: "50%", top: 8, width: 10, height: 10, marginLeft: -5, borderRadius: 5, border: `2px solid ${INK}` }} />
      <div style={{ fontSize: Math.max(15, big * 0.24), fontWeight: 600, letterSpacing: "0.3em" }}>{label.toUpperCase()}</div>
      <div style={{ position: "relative", display: "inline-block", fontSize: big, fontWeight: 700, lineHeight: 1.05, fontVariantNumeric: "tabular-nums", textShadow: "0 0 14px rgba(255,255,255,0.5)" }}>
        ${Math.round(value).toLocaleString("en-US")}
        {strike > 0 && <div style={{ position: "absolute", left: -8, top: "52%", width: `calc(${(strike * 100).toFixed(1)}% + 16px)`, height: Math.max(3, big * 0.06), background: INK, transform: "rotate(-8deg)", transformOrigin: "0 50%", boxShadow: "0 0 12px rgba(255,255,255,0.9)" }} />}
      </div>
    </div>
  </div>
);

/** Small centred caption-like label under an object. */
export const Tiny: React.FC<{ text: string; color?: string; size?: number }> = ({ text, color = INK, size = 16 }) => (
  <div style={{ fontFamily: FONT, fontSize: size, fontWeight: 600, letterSpacing: "0.28em", color, textTransform: "uppercase", whiteSpace: "nowrap", textAlign: "center" }}>{text}</div>
);

/** Absolutely placed, centre-anchored box. */
export const Place: React.FC<{ x: number; y: number; w?: number; children: React.ReactNode }> = ({ x, y, w = 400, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, display: "flex", justifyContent: "center" }}>{children}</div>
);

/** The opening (and closing, for a seamless loop) image: a big luxury tag, optionally slashed to $90. */
export const OpeningTag: React.FC<{ o: number; strike: number; ninety: number }> = ({ o, strike, ninety }) =>
  o <= 0 ? null : (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Place x={960} y={250} w={460}>
        <Tag label="Luxury price" value={1200} big={96} w={430} strike={strike} />
      </Place>
      {ninety > 0 && (
        <Place x={960} y={455} w={460}>
          <div style={{ fontFamily: FONT, fontSize: 120, fontWeight: 800, color: INK, opacity: ninety, transform: `scale(${0.85 + 0.15 * ninety})`, textShadow: "0 0 30px rgba(255,255,255,0.7)" }}>$90</div>
        </Place>
      )}
    </div>
  );
