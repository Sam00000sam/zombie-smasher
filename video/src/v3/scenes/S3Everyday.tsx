import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, prog } from "../../v2/anim";
import { Card } from "../../v2/components/Card";
import { Floor, Halo } from "../../v2/components/Glow";
import { Pawn } from "../../v2/components/Pawn";
import { At, Label, Pill } from "../../v2/components/Text";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, GLOW, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const PX = 600;
const FLOOR = 700;
const PH = 250;
const KX = 900;
const KY = 290;
const KW = 600;
const KH = 380;
const BAR_X = KX + 40;
const BAR_MAX = KW - 80;

const ROWS = [
  { label: "Appearance", g: 0.95, k: 0.9, cue: () => CUE.cheaper },
  { label: "Basic function", g: 0.92, k: 0.86, cue: () => CUE.job },
  { label: "Premium features", g: 0.95, k: 0.32, cue: () => CUE.premium },
];

/** Headphones worn by the pawn: black-filled cups so they read against the solid white head. */
const WornHeadphones: React.FC<{ x: number; y: number; r: number; p: number }> = ({ x, y, r, p }) => {
  if (p <= 0) return null;
  const s = r / 40;
  return (
    <svg width={140 * s} height={120 * s} viewBox="0 0 140 120" style={{ position: "absolute", left: x - 70 * s, top: y - 70 * s, overflow: "visible", filter: GLOW, opacity: p }}>
      <path d="M18 70 C18 10 122 10 122 70" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
      <rect x={4} y={56} width={24} height={40} rx={10} fill="#000" stroke={INK} strokeWidth={3} />
      <rect x={112} y={56} width={24} height={40} rx={10} fill="#000" stroke={INK} strokeWidth={3} />
    </svg>
  );
};

/** Floating music notes drifting up from the listener (frame-driven loop). */
const Notes: React.FC<{ x: number; y: number; start: number }> = ({ x, y, start }) => {
  const fr = useCurrentFrame();
  if (fr < start) return null;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = (((fr - start + i * 22) % 66) + 66) % 66 / 66;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + (i - 1) * 34 + Math.sin(t * 6 + i) * 8,
              top: y - t * 110,
              fontFamily: FONT,
              fontSize: 30,
              color: INK,
              opacity: Math.sin(t * Math.PI) * prog(fr, start, 12),
              textShadow: "0 0 12px rgba(255,255,255,0.7)",
            }}
          >
            {i === 1 ? "♫" : "♪"}
          </div>
        );
      })}
    </>
  );
};

const Bar: React.FC<{ y: number; v: number; p: number; dashed?: boolean }> = ({ y, v, p, dashed = false }) => (
  <>
    <div style={{ position: "absolute", left: BAR_X, top: y, width: BAR_MAX, height: 0, borderTop: "1px dashed rgba(255,255,255,0.15)", opacity: Math.min(1, p * 3) }} />
    <div
      style={{
        position: "absolute",
        left: BAR_X,
        top: y - 3,
        width: BAR_MAX * v * p,
        height: 6,
        borderRadius: 3,
        background: dashed ? "repeating-linear-gradient(90deg, #fff 0 10px, transparent 10px 16px)" : INK,
        boxShadow: dashed ? undefined : "0 0 10px rgba(255,255,255,0.5)",
      }}
    />
  </>
);

/** Scene 4 — everyday use: a listener on their commute + appearance/function comparison. */
export const S3Everyday: React.FC = () => {
  const fr = useCurrentFrame();
  const e0 = f(CUE.everyday);
  const headY = FLOOR - PH + 42;
  return (
    <SceneLayer
      win={SCENES.everyday}
      origin={ORIGIN.everyday}
      fadeIn={XFADE}
      fadeOut={XFADE}
      push={0.025}
      camera={cameraAt}
      world={
        <>
          <Halo x={PX} y={FLOOR - 110} r={240} o={prog(fr, e0, 24)} />
          <Floor x={PX} y={FLOOR} w={420} p={prog(fr, e0, 22)} />
          <Pawn x={PX} y={FLOOR} h={PH} frame={fr} start={e0 + 2} lean={Math.sin(fr / 14) * 0.25} />
          <WornHeadphones x={PX} y={headY} r={40} p={prog(fr, e0 + 12, 16, easeOut)} />
          <Notes x={PX + 40} y={headY - 70} start={e0 + 22} />
          <At x={PX} y={FLOOR + 22} w={300}>
            <Label text="Everyday use" start={e0 + 8} size={13} />
          </At>

          {/* comparison panel */}
          <Card x={KX} y={KY} w={KW} h={KH} start={e0 + 6} title="FAKE VS GENUINE" />
          <div style={{ position: "absolute", left: KX + KW - 250, top: KY + 22, display: "flex", gap: 22, alignItems: "center", fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", color: "#bdbdbd", opacity: prog(fr, e0 + 14, 12) }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 22, height: 4, background: INK, borderRadius: 2 }} /> GENUINE
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 22, height: 4, background: "repeating-linear-gradient(90deg, #fff 0 5px, transparent 5px 8px)" }} /> FAKE
            </span>
          </div>
          {ROWS.map((r, i) => {
            const c = f(r.cue());
            const y0 = KY + 84 + i * 96;
            const p = prog(fr, c, 20, easeOut);
            return (
              <React.Fragment key={r.label}>
                <div style={{ position: "absolute", left: BAR_X, top: y0 }}>
                  <Label text={r.label} start={c - 2} size={13} />
                </div>
                <Bar y={y0 + 34} v={r.g} p={p} />
                <Bar y={y0 + 52} v={r.k} p={prog(fr, c + 4, 20, easeOut)} dashed />
              </React.Fragment>
            );
          })}
          <div style={{ position: "absolute", left: BAR_X + BAR_MAX * 0.32 + 26, top: KY + 84 + 2 * 96 + 40 }}>
            <Pill text="Not needed" start={f(CUE.important) - 4} size={11} />
          </div>
        </>
      }
    />
  );
};
