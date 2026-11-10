import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, prog } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { ICONS } from "../../v2/components/Products";
import { Halo } from "../../v2/components/Glow";
import { Pawn } from "../../v2/components/Pawn";
import { Label } from "../../v2/components/Text";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, GLOW, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { Skyline, Stamp } from "../fx";
import { Ripple } from "../fx2";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const PX = 520;
const FLOOR = 720;
const PH = 230;
const SPEED = 9;

/** Headphones worn by the pawn: black-filled cups so they read against the solid white head. */
const WornHeadphones: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={112} height={96} viewBox="0 0 140 120" style={{ position: "absolute", left: x - 56, top: y - 56, overflow: "visible", filter: GLOW }}>
    <path d="M18 70 C18 10 122 10 122 70" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <rect x={4} y={56} width={24} height={40} rx={10} fill="#000" stroke={INK} strokeWidth={3.5} />
    <rect x={112} y={56} width={24} height={40} rx={10} fill="#000" stroke={INK} strokeWidth={3.5} />
  </svg>
);

const Notes: React.FC<{ x: number; y: number; start: number }> = ({ x, y, start }) => {
  const fr = useCurrentFrame();
  if (fr < start) return null;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = ((((fr - start + i * 20) % 60) + 60) % 60) / 60;
        return (
          <div key={i} style={{ position: "absolute", left: x + (i - 1) * 30 + Math.sin(t * 6 + i) * 8, top: y - t * 100, fontFamily: FONT, fontSize: 28, color: INK, opacity: Math.sin(t * Math.PI), textShadow: "0 0 12px rgba(255,255,255,0.7)" }}>
            {i === 1 ? "♫" : "♪"}
          </div>
        );
      })}
    </>
  );
};

/** Scroll distance (px): walk at constant speed, then ease to a stop. */
const walk = (fr: number, s0: number, stopAt: number, ease: number) => {
  const t = fr - s0;
  const t1 = stopAt - s0;
  if (t <= t1) return SPEED * t;
  const d = Math.min(t - t1, ease);
  return SPEED * t1 + SPEED * d - (SPEED * d * d) / (2 * ease);
};

const SPEC = ["Carbon-fibre plate", "Limited-edition box", "Celebrity collab", "Signature logo"];

/** Scene 4 — everyday use: walk through the city ticking off tasks, then strike out the premium extras. */
export const S3Everyday: React.FC = () => {
  const fr = useCurrentFrame();
  const s0 = SCENES.everyday.from;
  const stopAt = f(CUE.premium) - 22;
  const scroll = walk(fr, s0, stopAt, 18);
  const walking = fr < stopAt + 10;
  const bob = walking ? -Math.abs(Math.sin(fr * 0.45)) * 7 : 0;
  const headY = FLOOR - PH + 40 + bob;
  const sheetIn = prog(fr, f(CUE.premium) - 22, 16, easeOut);
  const strikes = [f(CUE.premium), f(CUE.premium) + 9, f(CUE.premium) + 18, f(CUE.premium) + 27];

  const posts = [
    { t: "Commute", at: f(CUE.everydayWord) + 4 },
    { t: "Gym", at: f(CUE.cheaper) + 8 },
    { t: "Errands", at: f(CUE.job) + 8 },
  ];

  return (
    <SceneLayer
      win={SCENES.everyday}
      origin={ORIGIN.everyday}
      fadeIn={XFADE}
      fadeOut={XFADE}
      push={0.02}
      camera={cameraAt}
      world={
        <>
          <Skyline y={FLOOR} offset={scroll * 0.35} o={0.35} />
          <div style={{ position: "absolute", left: 0, width: 1920, top: FLOOR, height: 2, backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.75) 0 10px, transparent 10px 20px)", backgroundPosition: `${-scroll}px 0`, opacity: 0.7 }} />

          {/* signposts that the walker passes and ticks off */}
          {posts.map((p) => {
            const x = PX + 110 + SPEED * (p.at - s0) - scroll;
            if (x < -200 || x > 2100) return null;
            const passed = prog(fr, p.at, 10, easeOut);
            return (
              <div key={p.t} style={{ position: "absolute", left: x, top: FLOOR - 300 }}>
                <div style={{ position: "absolute", left: -1, top: 44, width: 2, height: 256, background: INK, boxShadow: "0 0 8px rgba(255,255,255,0.6)" }} />
                <div style={{ position: "absolute", left: -78, top: 0, width: 156, height: 44, border: `2px solid ${INK}`, borderRadius: 10, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.24em", color: INK, boxShadow: `0 0 ${10 + passed * 18}px rgba(255,255,255,${0.3 + passed * 0.4})` }}>
                  {p.t.toUpperCase()}
                </div>
                <div style={{ position: "absolute", left: 58, top: -18, transform: `scale(${0.4 + 0.6 * passed})`, opacity: passed }}>
                  <div style={{ position: "relative", width: 36, height: 36, borderRadius: 18, background: INK, boxShadow: "0 0 16px rgba(255,255,255,0.8)" }}>
                    <LineArt parts={ICONS.check} p={passed} x={18} y={18} size={26} viewBox={24} width={3} color="#000" glow={false} />
                  </div>
                </div>
              </div>
            );
          })}

          {posts.map((p) => (
            <Ripple key={p.t} x={PX + 110 + 58} y={FLOOR - 318} at={p.at} r={60} />
          ))}
          <div style={{ position: "absolute", left: PX - 70, top: 250, display: "flex", alignItems: "center", gap: 12, opacity: prog(fr, s0 + 6, 10) }}>
            <svg width={30} height={30} viewBox="0 0 30 30" style={{ filter: GLOW }}>
              <circle cx={15} cy={15} r={12} fill="none" stroke={INK} strokeWidth={2.2} />
              <line x1={15} y1={15} x2={15 + Math.sin(fr / 4) * 8} y2={15 - Math.cos(fr / 4) * 8} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
            </svg>
            <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, letterSpacing: "0.24em", color: INK, fontVariantNumeric: "tabular-nums" }}>
              DAY {Math.min(30, 1 + Math.floor(Math.max(0, fr - s0) / 6))}
            </div>
          </div>
          <Halo x={PX} y={FLOOR - 110} r={220} o={prog(fr, s0, 20)} />
          <div style={{ position: "absolute", left: 0, top: bob }}>
            <Pawn x={PX} y={FLOOR} h={PH} frame={fr} start={s0 + 4} lean={walking ? 0.35 + Math.sin(fr * 0.45) * 0.15 : 0} />
          </div>
          {fr > s0 + 10 && <WornHeadphones x={PX} y={headY} />}
          <Notes x={PX + 30} y={headY - 70} start={s0 + 16} />
          <div style={{ position: "absolute", left: PX - 150, top: FLOOR + 18, width: 300, display: "flex", justifyContent: "center" }}>
            <Label text="Everyday use" start={f(CUE.everyday) + 4} size={13} />
          </div>

          {/* premium spec sheet gets struck out */}
          {sheetIn > 0 && (
            <div style={{ position: "absolute", left: 1040 + (1 - sheetIn) * 260, top: 210, width: 560, height: 400, opacity: sheetIn, borderRadius: 18, border: `2px solid ${INK}`, background: "#000", boxShadow: "0 0 16px rgba(255,255,255,0.3)" }}>
              <div style={{ position: "absolute", left: 30, top: 24, fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.28em", color: INK }}>PREMIUM FEATURES</div>
              <div style={{ position: "absolute", left: 30, right: 30, top: 56, height: 1, background: "rgba(255,255,255,0.25)" }} />
              {SPEC.map((s, i) => {
                const sp = prog(fr, strikes[i], 8);
                return (
                  <div key={s} style={{ position: "absolute", left: 30, top: 86 + i * 62, fontFamily: FONT, fontSize: 20, fontWeight: 500, letterSpacing: "0.06em", color: sp > 0.5 ? "#7a7a7a" : INK }}>
                    {s.toUpperCase()}
                    <div style={{ position: "absolute", left: -6, top: "52%", width: `calc(${(100 * sp).toFixed(1)}% + 12px)`, height: 2.5, background: INK, boxShadow: "0 0 8px rgba(255,255,255,0.8)" }} />
                  </div>
                );
              })}
            </div>
          )}
          <Stamp x={1320} y={560} text="NOT NEEDED" start={f(CUE.important) - 2} size={26} rot={-8} />
          <Ripple x={1320} y={560} at={f(CUE.important)} r={170} />
        </>
      }
    />
  );
};
