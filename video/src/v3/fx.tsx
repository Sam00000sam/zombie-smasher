import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp01, easeOut, lerp, prog } from "../v2/anim";
import { renderPart } from "../v2/components/Draw";
import { FONT, GLOW, GLOW_SOLID, INK } from "../v2/theme";

/** Damped oscillation (degrees or px) starting at frame offset t. */
export const damp = (t: number, amp: number, decay = 16, freq = 0.32) => (t < 0 ? 0 : amp * Math.exp(-t / decay) * Math.cos(t * freq));

/** Quick in, slower out bump used for camera punch-ins. */
export const bump = (t: number) => (t < 0 ? 0 : (1 - Math.exp(-t / 2.2)) * Math.exp(-t / 13));

const glowText = "0 0 14px rgba(255,255,255,0.55)";

/** A tag hanging on a string that drops in and swings to rest. */
export const HangingTag: React.FC<{ x: number; top: number; len: number; start: number; swing?: number; children: React.ReactNode }> = ({
  x,
  top,
  len,
  start,
  swing = 16,
  children,
}) => {
  const fr = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (fr < start) return null;
  const s = spring({ frame: fr - start, fps, config: { damping: 11, stiffness: 110, mass: 0.9 } });
  const ang = damp(fr - start - 4, swing, 18, 0.3);
  return (
    <div style={{ position: "absolute", left: x, top: top + lerp(-520, 0, s), width: 0, height: 0, transform: `rotate(${ang}deg)`, transformOrigin: "0 0" }}>
      <div style={{ position: "absolute", left: -1, top: 0, width: 2, height: len, background: INK, boxShadow: "0 0 8px rgba(255,255,255,0.6)" }} />
      <div style={{ position: "absolute", left: 0, top: len, transform: "translateX(-50%)" }}>{children}</div>
    </div>
  );
};

/** Tag body: outlined card with a punched hole, tiny label and a counting price. */
export const TagBody: React.FC<{ label: string; value: number; start: number; big?: number; w?: number }> = ({ label, value, start, big = 56, w = 220 }) => {
  const fr = useCurrentFrame();
  const n = Math.round(value * prog(fr, start + 8, 22, easeOut));
  return (
    <div
      style={{
        position: "relative",
        width: w,
        padding: "26px 0 16px",
        border: `2px solid ${INK}`,
        borderRadius: 16,
        background: "#000",
        boxShadow: "0 0 14px rgba(255,255,255,0.35), inset 0 0 18px rgba(255,255,255,0.06)",
        textAlign: "center",
        fontFamily: FONT,
        color: INK,
      }}
    >
      <div style={{ position: "absolute", left: "50%", top: 8, width: 10, height: 10, marginLeft: -5, borderRadius: 5, border: `2px solid ${INK}` }} />
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: big, fontWeight: 700, lineHeight: 1.05, fontVariantNumeric: "tabular-nums", textShadow: glowText }}>${n}</div>
    </div>
  );
};

/** Solid glowing coin with a dollar sign. */
export const Coin: React.FC<{ x: number; y: number; r?: number; o?: number; s?: number }> = ({ x, y, r = 20, o = 1, s = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      background: INK,
      color: "#000",
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: r * 1.15,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: o,
      transform: `scale(${s})`,
      boxShadow: "0 0 14px rgba(255,255,255,0.7), 0 0 34px rgba(255,255,255,0.25)",
    }}
  >
    $
  </div>
);

/** A coin flying along an arc from one point to another. */
export const FlyingCoin: React.FC<{ from: [number, number]; to: [number, number]; start: number; dur?: number; lift?: number }> = ({
  from,
  to,
  start,
  dur = 18,
  lift = 160,
}) => {
  const fr = useCurrentFrame();
  const t = prog(fr, start, dur, (v) => v);
  if (fr < start || t >= 1) return null;
  const e = 1 - Math.pow(1 - t, 2);
  const x = lerp(from[0], to[0], e);
  const y = lerp(from[1], to[1], e) - Math.sin(e * Math.PI) * lift;
  return <Coin x={x} y={y} o={Math.min(1, t * 6) * (1 - Math.pow(t, 6))} s={lerp(0.7, 1, Math.min(1, t * 3))} />;
};

/** Line-art wallet. */
export const Wallet: React.FC<{ x: number; y: number; p: number; open?: number }> = ({ x, y, p, open = 0 }) => {
  if (p <= 0) return null;
  return (
    <svg width={160} height={120} viewBox="0 0 160 120" style={{ position: "absolute", left: x - 80, top: y - 60, overflow: "visible", filter: GLOW }}>
      {renderPart({ t: "rect", x: 10, y: 30, w: 140, h: 80, rx: 14 }, p, "b", { width: 2.4, color: INK })}
      <g transform={`rotate(${-open * 28} 10 32)`}>{renderPart({ t: "path", d: "M10 44 L10 32 Q10 18 24 18 L136 18 Q150 18 150 32 L150 44" }, p, "f", { width: 2.4, color: INK })}</g>
      {renderPart({ t: "rect", x: 104, y: 56, w: 46, h: 28, rx: 8 }, p, "c", { width: 2.4, color: INK })}
      {p > 0.8 && <circle cx={120} cy={70} r={4} fill={INK} />}
    </svg>
  );
};

/** Magnifying glass that inspects the scene. */
export const Magnifier: React.FC<{ x: number; y: number; o: number; r?: number }> = ({ x, y, o, r = 74 }) =>
  o <= 0 ? null : (
    <svg width={r * 3} height={r * 3} style={{ position: "absolute", left: x - r, top: y - r, overflow: "visible", opacity: o, filter: GLOW }}>
      <circle cx={r} cy={r} r={r} fill="rgba(255,255,255,0.05)" stroke={INK} strokeWidth={3} />
      <circle cx={r} cy={r} r={r - 9} fill="none" stroke={INK} strokeWidth={1} opacity={0.35} />
      <line x1={r + r * 0.72} y1={r + r * 0.72} x2={r + r * 1.45} y2={r + r * 1.45} stroke={INK} strokeWidth={9} strokeLinecap="round" />
    </svg>
  );

/** Flaw callout: dot on the product, dotted leader line, outlined label. */
export const Callout: React.FC<{ px: number; py: number; lx: number; ly: number; text: string; start: number; out?: number }> = ({ px, py, lx, ly, text, start, out }) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 12, easeOut);
  const o = out === undefined ? 1 : 1 - prog(fr, out, 8);
  if (p <= 0 || o <= 0) return null;
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: o, pointerEvents: "none" }}>
        <circle cx={px} cy={py} r={6 * p} fill={INK} style={{ filter: GLOW_SOLID }} />
        <line x1={px} y1={py} x2={lerp(px, lx, p)} y2={lerp(py, ly, p)} stroke={INK} strokeWidth={1.4} strokeDasharray="3 5" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: lx,
          top: ly,
          transform: `translate(${lx < px ? "-100%" : "0"}, -50%) scale(${0.8 + 0.2 * p})`,
          transformOrigin: lx < px ? "100% 50%" : "0 50%",
          padding: "8px 14px",
          border: `1.5px solid ${INK}`,
          borderRadius: 8,
          background: "#000",
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.22em",
          color: INK,
          whiteSpace: "nowrap",
          opacity: p * o,
          boxShadow: "0 0 12px rgba(255,255,255,0.3)",
        }}
      >
        {text}
      </div>
    </>
  );
};

/** Rubber-stamp slam (e.g. SOLD OUT, NOT NEEDED). */
export const Stamp: React.FC<{ x: number; y: number; text: string; start: number; rot?: number; size?: number }> = ({ x, y, text, start, rot = -9, size = 22 }) => {
  const fr = useCurrentFrame();
  const s = prog(fr, start, 7, easeOut);
  if (s <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${lerp(1.9, 1, s)})`,
        opacity: s,
        padding: `${size * 0.35}px ${size * 0.7}px`,
        border: `3px solid ${INK}`,
        borderRadius: 8,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 800,
        letterSpacing: "0.22em",
        color: INK,
        background: "rgba(0,0,0,0.85)",
        whiteSpace: "nowrap",
        boxShadow: "0 0 18px rgba(255,255,255,0.5), inset 0 0 12px rgba(255,255,255,0.15)",
        textShadow: glowText,
      }}
    >
      {text}
    </div>
  );
};

/** Padlock that pops in, then unlocks (shackle lifts and swings). */
export const Padlock: React.FC<{ x: number; y: number; start: number; openAt: number; size?: number }> = ({ x, y, start, openAt, size = 46 }) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 8, easeOut);
  if (p <= 0) return null;
  const op = prog(fr, openAt, 10, easeOut);
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 40 48"
      style={{ position: "absolute", left: x - size / 2, top: y - size * 0.6, overflow: "visible", filter: GLOW, transform: `scale(${lerp(1.6, 1, p)})`, opacity: p }}
    >
      <g transform={`translate(0 ${-9 * op}) rotate(${-28 * op} 30 22)`}>
        <path d="M10 23 V14 A10 10 0 0 1 30 14 V23" fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
      </g>
      <rect x={4} y={21} width={32} height={25} rx={6} fill="#000" stroke={INK} strokeWidth={3} />
      <circle cx={20} cy={31} r={3.2} fill={INK} />
      <line x1={20} y1={32} x2={20} y2={39} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
    </svg>
  );
};

/** Vertical scan line sweeping across a region, with a soft trailing beam. */
export const Scanner: React.FC<{ x0: number; x1: number; y: number; h: number; start: number; dur: number }> = ({ x0, x1, y, h, start, dur }) => {
  const fr = useCurrentFrame();
  const t = prog(fr, start, dur);
  if (fr < start || fr > start + dur + 8) return null;
  const x = lerp(x0, x1, t);
  const o = Math.min(1, (fr - start) / 4) * (1 - prog(fr, start + dur, 8));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: o, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x - 120, top: y, width: 120, height: h, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.10))" }} />
      <div style={{ position: "absolute", left: x - 1, top: y - 14, width: 2.5, height: h + 28, background: INK, boxShadow: "0 0 12px rgba(255,255,255,0.95), 0 0 34px rgba(255,255,255,0.45)" }} />
    </div>
  );
};

/** Semicircle risk gauge; needle angle -80 (LOW) … +80 (HIGH). */
export const Gauge: React.FC<{ x: number; y: number; start: number; settleAt: number }> = ({ x, y, start, settleAt }) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 18);
  if (p <= 0) return null;
  const toLow = prog(fr, settleAt, 14, easeOut);
  const ang = lerp(62, -62, toLow) + damp(fr - settleAt - 12, 8, 10, 0.5);
  const r = 86;
  return (
    <div style={{ position: "absolute", left: x - r - 20, top: y - r - 20, width: r * 2 + 40, height: r + 70, opacity: p }}>
      <svg width={r * 2 + 40} height={r + 40} style={{ overflow: "visible", filter: GLOW }}>
        {renderPart({ t: "path", d: `M20 ${r + 20} A${r} ${r} 0 0 1 ${2 * r + 20} ${r + 20}` }, p, "a", { width: 2.4, color: INK })}
        {[-60, -30, 0, 30, 60].map((a) => {
          const rad = ((a - 90) * Math.PI) / 180;
          const cx = r + 20;
          const cy = r + 20;
          return <line key={a} x1={cx + Math.cos(rad) * (r - 14)} y1={cy + Math.sin(rad) * (r - 14)} x2={cx + Math.cos(rad) * (r - 4)} y2={cy + Math.sin(rad) * (r - 4)} stroke={INK} strokeWidth={2} opacity={p} />;
        })}
        <g transform={`rotate(${ang} ${r + 20} ${r + 20})`}>
          <line x1={r + 20} y1={r + 20} x2={r + 20} y2={34} stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
        </g>
        <circle cx={r + 20} cy={r + 20} r={7} fill={INK} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: r + 34, display: "flex", justifyContent: "space-between", padding: "0 6px", fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.24em", color: INK }}>
        <span style={{ textShadow: toLow > 0.5 ? glowText : undefined }}>LOW</span>
        <span style={{ color: "#8f8f8f" }}>RISK</span>
        <span style={{ color: "#8f8f8f" }}>HIGH</span>
      </div>
    </div>
  );
};

/** Deterministic line-art city skyline (like the reference), scrolled by `offset`. */
const BUILDINGS = Array.from({ length: 16 }, (_, i) => {
  const h = 120 + ((i * 53) % 5) * 34;
  const w = 70 + ((i * 37) % 3) * 18;
  return { x: i * 150, w, h };
});
export const Skyline: React.FC<{ y: number; offset: number; o: number }> = ({ y, offset, o }) => {
  const span = 16 * 150;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: o, pointerEvents: "none" }}>
      {[0, 1].map((k) =>
        BUILDINGS.map((b, i) => {
          const x = ((b.x - offset + k * span) % (span * 2)) - 200;
          if (x < -250 || x > 2150) return null;
          const rows = Math.floor((b.h - 30) / 26);
          return (
            <div key={`${k}-${i}`} style={{ position: "absolute", left: x, top: y - b.h, width: b.w, height: b.h, border: "1.5px solid rgba(255,255,255,0.55)", borderBottom: "none", borderRadius: "4px 4px 0 0" }}>
              {Array.from({ length: rows }, (_, r) =>
                [0, 1, 2].map((c) => (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      position: "absolute",
                      left: 10 + c * ((b.w - 20) / 3),
                      top: 14 + r * 26,
                      width: (b.w - 20) / 3 - 8,
                      height: 12,
                      border: "1px solid rgba(255,255,255,0.4)",
                      background: (r * 3 + c + i) % 5 === 0 ? "rgba(255,255,255,0.55)" : "transparent",
                    }}
                  />
                )),
              )}
            </div>
          );
        }),
      )}
    </div>
  );
};

/** Animated number from 0 → value. */
export const Counter: React.FC<{ value: number; start: number; dur?: number; prefix?: string; suffix?: string; size?: number }> = ({
  value,
  start,
  dur = 24,
  prefix = "",
  suffix = "",
  size = 40,
}) => {
  const fr = useCurrentFrame();
  const n = Math.round(value * prog(fr, start, dur, easeOut));
  return (
    <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: size, color: INK, fontVariantNumeric: "tabular-nums", textShadow: glowText, opacity: clamp01((fr - start) / 4) }}>
      {prefix}
      {n.toLocaleString("en-US")}
      {suffix}
    </span>
  );
};
