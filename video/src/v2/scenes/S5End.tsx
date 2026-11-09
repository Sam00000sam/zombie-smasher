import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, prog } from "../anim";
import { LineArt } from "../components/Draw";
import { PRODUCTS } from "../components/Products";
import { Card } from "../components/Card";
import { ChartLine } from "../components/Chart";
import { Floor, Halo } from "../components/Glow";
import { At, GlowText, Label } from "../components/Text";
import { SceneLayer } from "../components/SceneLayer";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";
import { INK } from "../theme";

const LINEUP = ["watch", "headphones", "sneaker", "phone", "earbuds"] as const;
// chart card geometry
const KX = 690;
const KY = 560;
const KW = 540;
const KH = 230;
const PW = KW - 150; // plot width
const PH = 120; // plot height

const priceAt = (t: number) => ({ x: t * PW, y: 12 + PH * (1 - Math.pow(1 - t, 1.6)) * 0.85 });
const valueAt = (t: number) => ({ x: t * PW, y: 26 + Math.sin(t * Math.PI) * 4 });
const pathFrom = (fn: (t: number) => { x: number; y: number }) =>
  Array.from({ length: 41 }, (_, i) => {
    const p = fn(i / 40);
    return `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join(" ");

export const S5End: React.FC = () => {
  const fr = useCurrentFrame();
  const s = SCENES.end.from;
  const e1 = f(CUE.end1);
  const fin = f(CUE.end2);
  const l2 = Math.round(e1 + (fin - e1) * 0.5);
  const stage = 1 - prog(fr, fin - 12, 14);
  const underline = prog(fr, f(CUE.notExpensive) + 8, 20);

  return (
    <SceneLayer
      win={SCENES.end}
      origin={ORIGIN.end}
      fadeIn={XFADE}
      push={0.02}
      world={
        <div style={{ position: "absolute", inset: 0, opacity: stage }}>
          <Halo x={960} y={420} r={520} o={prog(fr, s, 30) * 0.7} />
          {LINEUP.map((k, i) => (
            <LineArt key={k} parts={PRODUCTS[k]} p={prog(fr, s + 4 + i * 4, 30)} x={500 + i * 230} y={410} size={150} />
          ))}
          <Floor x={960} y={492} w={1200} p={prog(fr, s + 8, 24)} o={0.4} />

          {/* price vs value chart card */}
          <Card x={KX} y={KY} w={KW} h={KH} start={s + 10} title="PRICE VS VALUE" />
          <div style={{ position: "absolute", left: KX + 40, top: KY + 70, width: PW, height: PH }}>
            <div style={{ position: "absolute", left: 0, top: PH + 8, width: PW, height: 1, background: "rgba(255,255,255,0.2)" }} />
            <ChartLine d={pathFrom(valueAt)} at={valueAt} w={PW} h={PH} start={s + 22} dur={30} />
            <ChartLine d={pathFrom(priceAt)} at={priceAt} w={PW} h={PH} start={s + 26} dur={34} dashed />
          </div>
          <div style={{ position: "absolute", left: KX + 40 + PW + 22, top: KY + 70 + valueAt(1).y - 8 }}>
            <Label text="Value" start={s + 50} size={12} />
          </div>
          <div style={{ position: "absolute", left: KX + 40 + PW + 22, top: KY + 70 + priceAt(1).y - 8 }}>
            <Label text="Price" start={s + 56} size={12} color="#9a9a9a" />
          </div>
        </div>
      }
      screen={
        <>
          <At x={960} y={110} w={1700}>
            <GlowText text="IT'S NOT ALWAYS ABOUT THE BRAND." start={e1 + 2} size={34} stagger={0.5} out={fin - 12} />
          </At>
          <At x={960} y={164} w={1700}>
            <GlowText text="IT'S ABOUT THE VALUE." start={l2} size={34} stagger={0.7} out={fin - 12} />
          </At>

          {/* final card, styled after the reference's closing "UNDERSTAND WHY." */}
          <Halo x={960} y={540} r={420} o={prog(fr, fin, 24, easeOut) * 0.9} />
          <At x={960} y={462} w={1700}>
            <GlowText text="BUY SMART." start={fin} size={56} spacing="0.2em" stagger={1} />
          </At>
          <At x={960} y={536} w={1700}>
            <GlowText text="NOT EXPENSIVE." start={f(CUE.notExpensive)} size={56} spacing="0.2em" stagger={1} />
          </At>
          <div style={{ position: "absolute", left: 960 - 70 * underline, top: 626, width: 140 * underline, height: 1.5, background: INK, boxShadow: "0 0 10px rgba(255,255,255,0.8)" }} />
        </>
      }
    />
  );
};
