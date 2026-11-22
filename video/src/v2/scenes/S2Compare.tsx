import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, lerp, prog } from "../anim";
import { DrawLine, LineArt } from "../components/Draw";
import { PRODUCTS } from "../components/Products";
import { PriceCard } from "../components/Card";
import { Floor, Halo } from "../components/Glow";
import { At, Label, Pill } from "../components/Text";
import { SceneLayer } from "../components/SceneLayer";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";
import { INK } from "../theme";
import { HERO } from "./S1Hook";

const LX = 600;
const RX = 1320;
const PY = 430;
const PS = 250;

/** Butterfly comparison: left bars = branded, right bars = alternative. */
const ROWS = [
  { label: "Branding", cue: () => CUE.logo, l: 0.92, r: 0.18 },
  { label: "Marketing", cue: () => CUE.marketing, l: 0.9, r: 0.15 },
  { label: "Price", cue: () => CUE.prestige, l: 0.95, r: 0.14 },
  { label: "Functionality", cue: () => CUE.notNecessarily, l: 0.8, r: 0.77 },
];
const ROW_Y0 = 650;
const ROW_STEP = 54;
const BAR_MAX = 300;
const L_EDGE = 835;
const R_EDGE = 1085;

const Bar: React.FC<{ x: number; y: number; len: number; dir: 1 | -1; p: number; strong: boolean }> = ({ x, y, len, dir, p, strong }) => {
  const w = len * p;
  return (
    <>
      <div style={{ position: "absolute", top: y - 0.5, left: dir === 1 ? x : x - BAR_MAX, width: BAR_MAX, height: 0, borderTop: "1px dashed rgba(255,255,255,0.18)", opacity: Math.min(1, p * 3) }} />
      <div
        style={{
          position: "absolute",
          top: y - 2.5,
          left: dir === 1 ? x : x - w,
          width: w,
          height: 5,
          borderRadius: 3,
          background: INK,
          boxShadow: strong ? "0 0 16px rgba(255,255,255,0.8)" : "0 0 8px rgba(255,255,255,0.4)",
        }}
      />
    </>
  );
};

export const S2Compare: React.FC = () => {
  const fr = useCurrentFrame();
  const s = SCENES.compare.from;
  const mv = prog(fr, s, 26);
  const bx = lerp(HERO.x, LX, mv);
  const by = lerp(HERO.y, PY, mv);
  const bs = lerp(HERO.size, PS, mv);
  const alt = prog(fr, f(CUE.compare) + 6, 40);
  const more = f(CUE.more);
  const perf = prog(fr, f(CUE.performance) - 6, 14, easeOut);

  return (
    <SceneLayer
      win={SCENES.compare}
      origin={ORIGIN.compare}
      fadeOut={XFADE}
      world={
        <>
          <Halo x={bx} y={by} r={lerp(300, 230, mv)} o={1} />
          <Halo x={RX} y={PY} r={230} o={alt} />
          <LineArt parts={PRODUCTS.headphones} p={1} x={bx} y={by} size={bs} width={2.6} />
          <LineArt parts={PRODUCTS.headphones} p={alt} x={RX} y={PY} size={PS} width={2.6} />
          <Floor x={LX} y={PY + 112} w={340} p={prog(fr, s + 10, 20)} />
          <Floor x={RX} y={PY + 112} w={340} p={prog(fr, s + 20, 20)} />

          {/* price cards + the gap between them */}
          <PriceCard x={LX} y={200} start={more - 8} label="Branded" value={349} />
          <PriceCard x={RX} y={200} start={more + 2} label="Alternative" value={49} />
          <DrawLine x1={722} y1={200} x2={1198} y2={200} p={prog(fr, more + 18, 20)} dashed opacity={0.6} width={1.4} />
          <At x={960} y={185} w={400}>
            <Pill text="Save $300" start={more + 30} />
          </At>

          {/* comparison diagram */}
          {ROWS.map((r, i) => {
            const c = f(r.cue());
            const y = ROW_Y0 + i * ROW_STEP;
            const p = prog(fr, c + 2, 20, easeOut);
            const isFunc = r.label === "Functionality";
            return (
              <React.Fragment key={r.label}>
                <At x={960} y={y - 9} w={240}>
                  <Label text={r.label} start={c} size={13} opacity={isFunc || perf === 0 ? 1 : 0.75} />
                </At>
                <Bar x={L_EDGE} y={y} len={BAR_MAX * r.l} dir={-1} p={p} strong={isFunc && perf > 0} />
                <Bar x={R_EDGE} y={y} len={BAR_MAX * r.r} dir={1} p={p} strong={isFunc && perf > 0} />
              </React.Fragment>
            );
          })}
          <At x={R_EDGE + BAR_MAX * 0.77 + 80} y={ROW_Y0 + 3 * ROW_STEP - 15} w={160}>
            <Pill text="Similar" start={f(CUE.performance) - 6} size={12} />
          </At>
        </>
      }
    />
  );
};
