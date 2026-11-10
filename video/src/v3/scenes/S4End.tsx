import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { easeOut, lerp, prog } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Halo } from "../../v2/components/Glow";
import { At, Label, Pill } from "../../v2/components/Text";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, GLOW, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { damp, Gauge } from "../fx";
import { Ripple } from "../fx2";
import { P } from "../products";
import { CUE, f, FINAL_TITLE, ORIGIN, SCENES, XFADE } from "../timing";
import { SlamTitle } from "./S1Compare";

const CX = 980;
const PIVOT_Y = 300;
const BEAM = 320;
const STRING = 150;

/** A labelled weight block that drops onto a pan. */
const Weight: React.FC<{ x: number; y: number; text: string; start: number; w?: number; o?: number }> = ({ x, y, text, start, w = 150, o = 1 }) => {
  const fr = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (fr < start) return null;
  const s = spring({ frame: fr - start, fps, config: { damping: 10, stiffness: 170 } });
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - 40 + lerp(-360, 0, s), width: w, height: 40, borderRadius: 8, border: `2px solid ${INK}`, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.22em", color: INK, opacity: o, boxShadow: "0 0 14px rgba(255,255,255,0.45)" }}>
      {text}
    </div>
  );
};

/** Scene 5 — the balance: quality & safety vs a huge price gap; the cheaper side wins. */
export const S4End: React.FC = () => {
  const fr = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = SCENES.end.from;
  const qAt = f(CUE.quality);
  const sAt = f(CUE.quality) + 14;
  const dropAt = f(CUE.priceDiff) + 4;
  const draw = prog(fr, s + 2, 24);

  // beam angle: tips slightly to genuine as quality/safety land, then hard to the fake when $205 drops
  const toGenuine = spring({ frame: fr - qAt, fps, config: { damping: 12, stiffness: 90 } }) * -4 + spring({ frame: fr - sAt, fps, config: { damping: 12, stiffness: 90 } }) * -3;
  const toFake = spring({ frame: fr - dropAt - 6, fps, config: { damping: 9, stiffness: 80 } }) * 21;
  const theta = toGenuine + (fr > dropAt + 6 ? toFake : 0) + damp(fr - s - 10, 2.5, 20, 0.25);
  const rad = (theta * Math.PI) / 180;
  const L = { x: CX - BEAM * Math.cos(rad), y: PIVOT_Y - BEAM * Math.sin(rad) };
  const R = { x: CX + BEAM * Math.cos(rad), y: PIVOT_Y + BEAM * Math.sin(rad) };
  const panL = { x: L.x, y: L.y + STRING };
  const panR = { x: R.x, y: R.y + STRING };
  const lowRisk = prog(fr, f(CUE.risksLow) + 14, 14);
  const win = prog(fr, f(CUE.fakeCan), 14);
  const stage = 1 - prog(fr, FINAL_TITLE - 12, 12);
  const ul = prog(fr, FINAL_TITLE + 14, 18);

  const pan = (p: { x: number; y: number }, a: { x: number; y: number }) => (
    <>
      {[-90, 90].map((dx) => (
        <line key={dx} x1={a.x} y1={a.y} x2={p.x + dx} y2={p.y} stroke={INK} strokeWidth={1.6} opacity={0.8 * draw} />
      ))}
      <path d={`M${p.x - 110} ${p.y} Q${p.x} ${p.y + 46} ${p.x + 110} ${p.y}`} fill="none" stroke={INK} strokeWidth={2.6} opacity={draw} />
      <line x1={p.x - 110} y1={p.y} x2={p.x + 110} y2={p.y} stroke={INK} strokeWidth={2.6} opacity={draw} />
    </>
  );

  return (
    <SceneLayer
      win={SCENES.end}
      origin={ORIGIN.end}
      fadeIn={XFADE}
      push={0.02}
      camera={cameraAt}
      world={
        <div style={{ position: "absolute", inset: 0, opacity: stage }}>
          <Halo x={panR.x} y={panR.y - 40} r={260} o={win} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", filter: GLOW }}>
            {/* stand */}
            <line x1={CX} y1={PIVOT_Y} x2={CX} y2={PIVOT_Y + 420 * draw} stroke={INK} strokeWidth={3} />
            <line x1={CX - 110 * draw} y1={PIVOT_Y + 420} x2={CX + 110 * draw} y2={PIVOT_Y + 420} stroke={INK} strokeWidth={3} />
            {/* beam */}
            <line x1={lerp(CX, L.x, draw)} y1={lerp(PIVOT_Y, L.y, draw)} x2={lerp(CX, R.x, draw)} y2={lerp(PIVOT_Y, R.y, draw)} stroke={INK} strokeWidth={4} strokeLinecap="round" />
            <circle cx={CX} cy={PIVOT_Y} r={9} fill={INK} />
            {draw > 0.6 && pan(panL, L)}
            {draw > 0.6 && pan(panR, R)}
          </svg>
          <LineArt parts={P.sneakerGenuine} p={prog(fr, s + 14, 22)} x={panL.x} y={panL.y - 48} size={190} width={2.4} opacity={lerp(1, 0.4, win)} />
          <LineArt parts={P.sneakerFake} p={prog(fr, s + 20, 22)} x={panR.x} y={panR.y - 48} size={190} width={2.4} />
          <At x={panL.x} y={panL.y + 40} w={240}>
            <Label text="Genuine" start={s + 22} size={12} />
          </At>
          <At x={panR.x} y={panR.y + 40} w={240}>
            <Label text="Fake" start={s + 26} size={12} />
          </At>

          {/* weights */}
          <div style={{ position: "absolute", left: panL.x - CX, top: panL.y - PIVOT_Y - STRING, width: 1920, height: 1080 }}>
            <Weight x={CX} y={PIVOT_Y + STRING - 112} text="QUALITY" start={qAt} o={lerp(1, 0.45, lowRisk)} />
            <Weight x={CX} y={PIVOT_Y + STRING - 158} text="SAFETY" start={sAt} o={lerp(1, 0.45, lowRisk)} />
          </div>
          <div style={{ position: "absolute", left: panR.x - CX, top: panR.y - PIVOT_Y - STRING, width: 1920, height: 1080 }}>
            <Weight x={CX} y={PIVOT_Y + STRING - 112} text="SAVE $205" start={dropAt} w={190} />
          </div>
          <Ripple x={panR.x} y={panR.y - 60} at={dropAt + 12} r={190} />
          <Ripple x={panL.x} y={panL.y - 60} at={qAt + 10} r={120} />
          <At x={panR.x} y={panR.y - 206} w={260}>
            <Pill text="Cheaper" start={f(CUE.fakeCan)} size={13} />
          </At>

          <Gauge x={330} y={420} start={f(CUE.end) + 60} settleAt={f(CUE.risksLow) + 6} />
        </div>
      }
      screen={
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 100, display: "flex", justifyContent: "center", gap: 36, opacity: stage }}>
            <SlamInline text="LOWER PRICE." start={f(CUE.priceDiff)} />
            <SlamInline text="MORE CHOICE." start={f(CUE.huge)} />
          </div>
          <Halo x={960} y={500} r={430} o={prog(fr, FINAL_TITLE, 20, easeOut) * 0.9} />
          <SlamTitle text="WHY PAY MORE?" start={FINAL_TITLE} size={70} y={458} />
          <div style={{ position: "absolute", left: 960 - 90 * ul, top: 556, width: 180 * ul, height: 2, background: INK, boxShadow: "0 0 10px rgba(255,255,255,0.8)" }} />
        </>
      }
    />
  );
};

const SlamInline: React.FC<{ text: string; start: number }> = ({ text, start }) => {
  const fr = useCurrentFrame();
  const s = prog(fr, start, 8, easeOut);
  return (
    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, letterSpacing: "0.2em", color: INK, opacity: s, transform: `scale(${lerp(1.5, 1, s)})`, filter: s < 1 ? `blur(${(1 - s) * 8}px)` : undefined, textShadow: "0 0 18px rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>
      {text}
    </div>
  );
};
