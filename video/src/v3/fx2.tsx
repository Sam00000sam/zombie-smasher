import React from "react";
import { useCurrentFrame } from "remotion";
import { clamp01, easeOut, lerp, prog } from "../v2/anim";
import { renderPart } from "../v2/components/Draw";
import { FONT, GLOW, GLOW_SOLID, INK } from "../v2/theme";

/**
 * Building blocks modelled on the reference's techniques: characters that act, a clicking cursor,
 * sparks that travel along wires (cause → effect), sliding notifications, toggles, ratings.
 */

/** Pawn with arms. `raise` 0 = arms down (hidden by the body), 1 = arms up celebrating. */
export const ArmsPawn: React.FC<{ x: number; y: number; h: number; o?: number; raise?: number; hop?: number; q?: number }> = ({
  x,
  y,
  h,
  o = 1,
  raise = 0,
  hop = 0,
  q = 0,
}) => {
  if (o <= 0) return null;
  const w = h * 0.62;
  const s = h / 100;
  const armAng = lerp(160, 35, raise); // degrees from straight up
  const arm = (side: 1 | -1) => {
    const a = ((side * armAng) * Math.PI) / 180;
    const sx = 31 + side * 18;
    const sy = 50;
    return <line x1={sx} y1={sy} x2={sx + Math.sin(a) * 30} y2={sy - Math.cos(a) * 30} stroke={INK} strokeWidth={9} strokeLinecap="round" />;
  };
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h - hop, width: w, height: h, opacity: o }}>
      <svg width={w} height={h} viewBox="0 0 62 100" style={{ overflow: "visible", filter: GLOW_SOLID }}>
        {raise > 0.05 && arm(-1)}
        {raise > 0.05 && arm(1)}
        <circle cx={31} cy={17} r={16} fill={INK} />
        <path d="M4 100 C4 62 14 40 31 40 C48 40 58 62 58 100 Z" fill={INK} />
      </svg>
      {q > 0 && (
        <div
          style={{
            position: "absolute",
            left: w / 2 - 20 * s,
            top: -52 * s,
            width: 40 * s,
            textAlign: "center",
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 38 * s,
            color: INK,
            opacity: q,
            transform: `translateY(${(1 - q) * 10}px) scale(${0.7 + 0.3 * q})`,
            textShadow: "0 0 16px rgba(255,255,255,0.8)",
          }}
        >
          ?
        </div>
      )}
    </div>
  );
};

/** Expanding ring marking a click or an impact. */
export const Ripple: React.FC<{ x: number; y: number; at: number; r?: number }> = ({ x, y, at, r = 70 }) => {
  const fr = useCurrentFrame();
  const t = prog(fr, at, 16, easeOut);
  if (fr < at || t >= 1) return null;
  const rr = lerp(8, r, t);
  return <div style={{ position: "absolute", left: x - rr, top: y - rr, width: rr * 2, height: rr * 2, borderRadius: "50%", border: `2px solid ${INK}`, opacity: 1 - t, boxShadow: "0 0 18px rgba(255,255,255,0.5)", pointerEvents: "none" }} />;
};

/** Mouse cursor following keyframes; presses (and ripples) at click frames. */
export const Cursor: React.FC<{ path: { at: number; x: number; y: number }[]; clicks?: number[]; o?: number }> = ({ path, clicks = [], o = 1 }) => {
  const fr = useCurrentFrame();
  if (o <= 0) return null;
  let x = path[0].x;
  let y = path[0].y;
  for (let i = 1; i < path.length; i++) {
    const p = prog(fr, path[i - 1].at, Math.max(1, path[i].at - path[i - 1].at));
    if (fr >= path[i - 1].at) {
      x = lerp(path[i - 1].x, path[i].x, p);
      y = lerp(path[i - 1].y, path[i].y, p);
    }
  }
  const press = clicks.reduce((m, c) => Math.max(m, fr >= c && fr < c + 6 ? 1 - (fr - c) / 6 : 0), 0);
  return (
    <>
      {clicks.map((c) => (
        <Ripple key={c} x={x} y={y} at={c} r={56} />
      ))}
      <svg width={30} height={38} viewBox="0 0 30 38" style={{ position: "absolute", left: x - 3, top: y - 2, overflow: "visible", opacity: o, transform: `scale(${1 - press * 0.18})`, transformOrigin: "3px 2px", filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }}>
        <path d="M3 2 L3 30 L10 23 L15 35 L20 33 L15 21 L25 21 Z" fill={INK} stroke="#000" strokeWidth={2} strokeLinejoin="round" />
      </svg>
    </>
  );
};

/** Glowing spark travelling along a polyline (the reference's "signal on a wire"). Optionally draws the wire. */
export const Spark: React.FC<{ pts: [number, number][]; start: number; dur: number; wire?: boolean; wireStart?: number; dashed?: boolean }> = ({
  pts,
  start,
  dur,
  wire = true,
  wireStart,
  dashed = false,
}) => {
  const fr = useCurrentFrame();
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  const at = (t: number): [number, number] => {
    let d = t * total;
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i]) return [lerp(pts[i][0], pts[i + 1][0], d / segs[i]), lerp(pts[i][1], pts[i + 1][1], d / segs[i])];
      d -= segs[i];
    }
    return pts[pts.length - 1];
  };
  const wp = prog(fr, wireStart ?? start - 12, 14);
  const t = prog(fr, start, dur, (v) => v);
  const live = fr >= start && t < 1;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  const [sx, sy] = at(t);
  return (
    <>
      {wire && wp > 0 && (
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
          {dashed ? (
            <path d={d} fill="none" stroke={INK} strokeWidth={1.4} strokeDasharray="4 6" opacity={0.55 * wp} />
          ) : (
            renderPart({ t: "path", d }, wp, "w", { width: 1.6, color: "rgba(255,255,255,0.6)" })
          )}
        </svg>
      )}
      {live && (
        <>
          <div style={{ position: "absolute", left: sx - 26, top: sy - 26, width: 52, height: 52, borderRadius: 26, background: "radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)" }} />
          <div style={{ position: "absolute", left: sx - 5, top: sy - 5, width: 10, height: 10, borderRadius: 5, background: INK, boxShadow: "0 0 14px rgba(255,255,255,1)" }} />
        </>
      )}
    </>
  );
};

/** Browser-style window (the reference's "MY STORE" card): drawn border, header dots and URL pill. */
export const BrowserWindow: React.FC<{ x: number; y: number; w: number; h: number; start: number; url: string; o?: number; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  start,
  url,
  o = 1,
  children,
}) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 20);
  if (p <= 0 || o <= 0) return null;
  const c = prog(fr, start + 8, 12, easeOut);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: o }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: "#000", opacity: p }} />
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible", filter: GLOW }}>
        {renderPart({ t: "rect", x: 1, y: 1, w: w - 2, h: h - 2, rx: 16 }, p, "b", { width: 2, color: INK })}
        {renderPart({ t: "line", x1: 1, y1: 40, x2: w - 1, y2: 40 }, prog(fr, start + 6, 12), "h", { width: 1.2, color: "rgba(255,255,255,0.5)" })}
      </svg>
      <div style={{ position: "absolute", left: 16, top: 15, display: "flex", gap: 6, opacity: c }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: INK }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: w / 2 - 110, top: 10, width: 220, height: 20, borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", color: INK, opacity: c }}>
        {url.toUpperCase()}
      </div>
      <div style={{ position: "absolute", left: 0, top: 40, width: w, height: h - 40, opacity: c }}>{children}</div>
    </div>
  );
};

/** Notification card that slides in from the right (like the reference's "+$1,000 NEW SALE" stack). */
export const Notice: React.FC<{ x: number; y: number; text: string; start: number; out?: number; w?: number }> = ({ x, y, text, start, out, w = 280 }) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 12, easeOut);
  const o = out === undefined ? 1 : 1 - prog(fr, out, 10);
  if (p <= 0 || o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x + (1 - p) * 80, top: y, width: w, height: 52, borderRadius: 12, border: `1.8px solid ${INK}`, background: "#000", display: "flex", alignItems: "center", gap: 14, padding: "0 16px", opacity: p * o, boxShadow: `0 0 ${12 + (1 - p) * 30}px rgba(255,255,255,${0.3 + (1 - p) * 0.5})` }}>
      <div style={{ width: 26, height: 26, borderRadius: 13, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={16} height={16} viewBox="0 0 24 24">
          <path d="M5 12.5 L10 17.5 L19.5 7" fill="none" stroke="#000" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.22em", color: INK, whiteSpace: "nowrap" }}>{text.toUpperCase()}</div>
    </div>
  );
};

/** Small check pill like the reference's "SALES ✓". */
export const CheckPill: React.FC<{ x: number; y: number; text: string; start: number; o?: number }> = ({ x, y, text, start, o = 1 }) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 10, easeOut);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, 0) scale(${lerp(0.6, 1, p)})`, opacity: p * o, display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 14px", borderRadius: 999, border: `1.6px solid ${INK}`, background: "#000", fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: INK, whiteSpace: "nowrap", boxShadow: `0 0 ${10 + (1 - p) * 24}px rgba(255,255,255,0.45)` }}>
      {text.toUpperCase()}
      <svg width={14} height={14} viewBox="0 0 24 24">
        <path d="M4 12.5 L10 18.5 L20 6.5" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Toggle switch (the reference's "ON" switch) that flips at `onAt`. */
export const Toggle: React.FC<{ x: number; y: number; start: number; onAt: number; label?: string }> = ({ x, y, start, onAt, label = "ON" }) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 14);
  if (p <= 0) return null;
  const on = prog(fr, onAt, 8, easeOut);
  return (
    <div style={{ position: "absolute", left: x - 34, top: y - 56, width: 68, height: 112, opacity: p }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 16, border: `2.4px solid ${INK}`, background: "#000", boxShadow: `0 0 ${14 + on * 30}px rgba(255,255,255,${0.3 + on * 0.5})` }} />
      <div style={{ position: "absolute", left: 14, top: lerp(58, 14, on), width: 40, height: 40, borderRadius: 10, background: on > 0.5 ? INK : "transparent", border: `2.4px solid ${INK}`, boxShadow: on > 0.5 ? "0 0 20px rgba(255,255,255,0.9)" : undefined }} />
      <div style={{ position: "absolute", left: -40, right: -40, top: 122, textAlign: "center", fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.26em", color: INK, opacity: clamp01(on * 2) }}>{label}</div>
    </div>
  );
};

/** Star rating that fills to `value` of 5. */
export const Stars: React.FC<{ x: number; y: number; start: number; value: number; size?: number }> = ({ x, y, start, value, size = 22 }) => {
  const fr = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", gap: 6 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const p = prog(fr, start + i * 4, 8, easeOut);
        const filled = i < value && p > 0.5;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" style={{ opacity: Math.max(0.25, p), transform: `scale(${filled ? lerp(1.4, 1, p) : 1})`, filter: filled ? "drop-shadow(0 0 6px rgba(255,255,255,0.8))" : undefined }}>
            <path d="M12 2.5 L14.9 8.6 L21.5 9.3 L16.5 13.8 L17.9 20.4 L12 17 L6.1 20.4 L7.5 13.8 L2.5 9.3 L9.1 8.6 Z" fill={filled ? INK : "none"} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
          </svg>
        );
      })}
    </div>
  );
};

/** Moving spotlight: soft glow that glides between targets (keyframed). */
export const Spotlight: React.FC<{ keys: { at: number; x: number; y: number; r: number }[]; o?: number }> = ({ keys, o = 1 }) => {
  const fr = useCurrentFrame();
  let { x, y, r } = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const p = prog(fr, keys[i].at - 14, 14);
    x = lerp(x, keys[i].x, p);
    y = lerp(y, keys[i].y, p);
    r = lerp(r, keys[i].r, p);
  }
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0) 70%)",
        opacity: o,
        pointerEvents: "none",
      }}
    />
  );
};
