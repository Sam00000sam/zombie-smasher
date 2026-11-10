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

/** Outlined chip with an optional check mark (bigger, phone-readable). */
export const Chip: React.FC<{ text: string; check?: boolean; size?: number }> = ({ text, check = true, size = 17 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: `${size * 0.45}px ${size * 0.9}px`, borderRadius: 999, border: `1.8px solid ${INK}`, background: "#000", fontFamily: FONT, fontSize: size, fontWeight: 700, letterSpacing: "0.18em", color: INK, whiteSpace: "nowrap", boxShadow: "0 0 14px rgba(255,255,255,0.35)" }}>
    {text.toUpperCase()}
    {check && (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path d="M4 12.5 L10 18.5 L20 6.5" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </div>
);

/** Solid white pill with black text. */
export const WhitePill: React.FC<{ text: string; size?: number }> = ({ text, size = 17 }) => (
  <div style={{ padding: `${size * 0.55}px ${size * 1.3}px`, borderRadius: 999, background: INK, color: "#000", fontFamily: FONT, fontSize: size, fontWeight: 800, letterSpacing: "0.22em", whiteSpace: "nowrap", boxShadow: "0 0 22px rgba(255,255,255,0.55)" }}>{text.toUpperCase()}</div>
);

/** Stat card: tiny title + big number. */
export const Stat: React.FC<{ title: string; value: string; glow?: number; w?: number }> = ({ title, value, glow = 0, w = 300 }) => (
  <div style={{ width: w, padding: "18px 24px", borderRadius: 16, border: `2px solid ${INK}`, background: "#000", boxShadow: `0 0 ${14 + glow * 24}px rgba(255,255,255,${0.3 + glow * 0.5})`, fontFamily: FONT, color: INK }}>
    <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.24em" }}>{title.toUpperCase()}</div>
    <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: "tabular-nums", textShadow: "0 0 14px rgba(255,255,255,0.5)" }}>{value}</div>
  </div>
);
