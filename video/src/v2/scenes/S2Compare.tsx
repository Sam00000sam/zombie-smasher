import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, lerp, prog } from "../anim";
import { DrawLine, LineArt } from "../components/Draw";
import { PRODUCTS } from "../components/Products";
import { PriceTag } from "../components/PriceTag";
import { At, Label } from "../components/Text";
import { Kicker, SceneLayer } from "../components/SceneLayer";
import { CUE, f, ORIGIN, SCENES } from "../timing";
import { FONT, INK } from "../theme";
import { HERO } from "./S1Hook";

const LX = 560;
const RX = 1360;
const PY = 380;
const PS = 250;

/** Butterfly chart: left bars = branded, right bars = alternative. */
const ROWS = [
  { label: "Branding", cue: () => CUE.logo, l: 0.92, r: 0.18 },
  { label: "Marketing", cue: () => CUE.marketing, l: 0.9, r: 0.15 },
  { label: "Price", cue: () => CUE.prestige, l: 0.95, r: 0.14 },
  { label: "Functionality", cue: () => CUE.notNecessarily, l: 0.8, r: 0.77 },
];
const ROW_Y0 = 600;
const ROW_STEP = 62;
const BAR_MAX = 300;
const L_EDGE = 830; // left bars grow leftwards from here
const R_EDGE = 1090; // right bars grow rightwards from here

const Bar: React.FC<{ x: number; y: number; len: number; dir: 1 | -1; p: number; strong: boolean }> = ({ x, y, len, dir, p, strong }) => {
  const w = len * p;
  return (
    <>
      {/* track */}
      <div style={{ position: "absolute", top: y - 0.5, left: dir === 1 ? x : x - BAR_MAX, width: BAR_MAX * Math.min(1, p * 2), height: 1, background: "rgba(255,255,255,0.12)" }} />
      <div
        style={{
          position: "absolute",
          top: y - 2.5,
          left: dir === 1 ? x : x - w,
          width: w,
          height: 5,
          borderRadius: 3,
          background: INK,
          opacity: strong ? 1 : 0.85,
          boxShadow: strong ? "0 0 14px rgba(255,255,255,0.7)" : "0 0 8px rgba(255,255,255,0.35)",
        }}
      />
    </>
  );
};

export const S2Compare: React.FC = () => {
  const fr = useCurrentFrame();
  const s = SCENES.compare.from;
  const mv = prog(fr, s, 30);
  const bx = lerp(HERO.x, LX, mv);
  const by = lerp(HERO.y, PY, mv);
  const bs = lerp(HERO.size, PS, mv);
  const alt = prog(fr, f(CUE.compare) + 10, 45);
  const gap = prog(fr, f(CUE.more) + 22, 22);
  const perf = prog(fr, f(CUE.performance) - 4, 16, easeOut);

  return (
    <SceneLayer
      win={SCENES.compare}
      origin={ORIGIN.compare}
      fadeOut={24}
      world={
        <>
          <LineArt parts={PRODUCTS.headphones} p={1} x={bx} y={by} size={bs} width={2.6} />
          <LineArt parts={PRODUCTS.headphones} p={alt} x={RX} y={PY} size={PS} width={2.6} />
          <At x={LX} y={498} w={400}>
            <Label text="Branded" start={s + 26} color={INK} size={17} />
          </At>
          <At x={RX} y={498} w={400}>
            <Label text="Alternative" start={f(CUE.compare) + 30} color={INK} size={17} />
          </At>

          {/* price tags + the gap between them */}
          <PriceTag x={LX} y={214} start={f(CUE.more) - 4} value={349} />
          <PriceTag x={RX} y={214} start={f(CUE.more) + 6} value={49} />
          <DrawLine x1={662} y1={214} x2={1258} y2={214} p={gap} dashed opacity={0.55} width={1.4} />
          <At x={960} y={170} w={500}>
            <Label text="$300 difference" start={f(CUE.more) + 34} color={INK} size={16} />
          </At>

          {/* comparison diagram */}
          {ROWS.map((r, i) => {
            const c = f(r.cue());
            const y = ROW_Y0 + i * ROW_STEP;
            const p = prog(fr, c + 2, 22, easeOut);
            const isFunc = r.label === "Functionality";
            return (
              <React.Fragment key={r.label}>
                <At x={960} y={y - 10} w={240}>
                  <Label text={r.label} start={c} color={isFunc && perf > 0 ? INK : "#bdbdbd"} size={15} spacing="0.22em" weight={isFunc ? 600 : 500} />
                </At>
                <Bar x={L_EDGE} y={y} len={BAR_MAX * r.l} dir={-1} p={p} strong={isFunc && perf > 0} />
                <Bar x={R_EDGE} y={y} len={BAR_MAX * r.r} dir={1} p={p} strong={isFunc && perf > 0} />
              </React.Fragment>
            );
          })}
          {/* "similar" marker on the functionality row */}
          <div
            style={{
              position: "absolute",
              left: R_EDGE + BAR_MAX * 0.77 + 22,
              top: ROW_Y0 + 3 * ROW_STEP - 12,
              fontFamily: FONT,
              fontSize: 15,
              letterSpacing: "0.22em",
              color: INK,
              opacity: perf,
              textShadow: "0 0 12px rgba(255,255,255,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            ≈ SIMILAR
          </div>
        </>
      }
      screen={<Kicker n="02" title="The comparison" start={s + 4} out={SCENES.compare.to - 24} />}
    />
  );
};
