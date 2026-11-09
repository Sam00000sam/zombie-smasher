import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, lerp, prog } from "../anim";
import { DrawLine, LineArt } from "../components/Draw";
import { PRODUCTS } from "../components/Products";
import { At, GlowText, Label } from "../components/Text";
import { Kicker, SceneLayer } from "../components/SceneLayer";
import { CUE, f, ORIGIN, SCENES } from "../timing";
import { FONT, INK } from "../theme";

const LINEUP = ["watch", "headphones", "sneaker", "phone", "earbuds"] as const;
const BAR_X = 760;
const BAR_MAX = 520;

export const S5End: React.FC = () => {
  const fr = useCurrentFrame();
  const s = SCENES.end.from;
  const l2 = f(27.7); // "IT'S ABOUT THE VALUE." appears under line 1
  const fin = f(CUE.end2);
  const dim = 1 - prog(fr, fin - 12, 14);

  const priceIn = prog(fr, s + 14, 24, easeOut);
  const priceShrink = prog(fr, l2 + 4, 22);
  const priceLen = BAR_MAX * lerp(0.95 * priceIn, 0.2, priceShrink);
  const valueLen = BAR_MAX * 0.74 * prog(fr, s + 20, 24, easeOut);
  const valueGlow = prog(fr, l2 + 10, 14);
  const swap = fr >= l2 + 14;

  const bar = (y: number, len: number, glow: number) => (
    <>
      <div style={{ position: "absolute", left: BAR_X, top: y - 0.5, width: BAR_MAX * Math.min(1, priceIn * 1.4), height: 1, background: "rgba(255,255,255,0.12)" }} />
      <div style={{ position: "absolute", left: BAR_X, top: y - 2.5, width: len, height: 5, borderRadius: 3, background: INK, boxShadow: `0 0 ${8 + glow * 12}px rgba(255,255,255,${0.35 + glow * 0.4})` }} />
    </>
  );
  const caption = (x: number, y: number, text: string, o: number) => (
    <div style={{ position: "absolute", left: x, top: y - 11, fontFamily: FONT, fontSize: 18, fontWeight: 600, letterSpacing: "0.12em", color: INK, opacity: o, whiteSpace: "nowrap", textShadow: "0 0 12px rgba(255,255,255,0.4)" }}>
      {text}
    </div>
  );

  return (
    <SceneLayer
      win={SCENES.end}
      origin={ORIGIN.end}
      fadeIn={20}
      world={
        <div style={{ position: "absolute", inset: 0, opacity: dim }}>
          {LINEUP.map((k, i) => (
            <LineArt key={k} parts={PRODUCTS[k]} p={prog(fr, s + 4 + i * 5, 34)} x={480 + i * 240} y={440} size={170} />
          ))}
          <DrawLine x1={380} y1={548} x2={1540} y2={548} p={prog(fr, s + 8, 30)} opacity={0.28} width={1.2} />

          {/* price vs value */}
          <div style={{ position: "absolute", left: 600, top: 618 }}>
            <Label text="Price" start={s + 12} color={INK} size={15} spacing="0.24em" weight={600} />
          </div>
          <div style={{ position: "absolute", left: 600, top: 676 }}>
            <Label text="Value" start={s + 18} color={INK} size={15} spacing="0.24em" weight={600} />
          </div>
          {bar(630, priceLen, 0)}
          {bar(688, valueLen, valueGlow)}
          {caption(BAR_X + priceLen + 24, 630, swap ? "$49" : "$349", prog(fr, s + 30, 10))}
          {caption(BAR_X + valueLen + 24, 688, "SAME", valueGlow)}
        </div>
      }
      screen={
        <>
          <Kicker n="05" title="The takeaway" start={s + 6} out={fin - 10} />
          <At x={960} y={118} w={1700}>
            <GlowText text="IT'S NOT ALWAYS ABOUT THE BRAND." start={s + 8} size={46} stagger={0.6} out={fin - 12} />
          </At>
          <At x={960} y={190} w={1700}>
            <GlowText text="IT'S ABOUT THE VALUE." start={l2} size={46} stagger={0.8} out={fin - 12} />
          </At>
          <At x={960} y={440} w={1700}>
            <GlowText text="BUY SMART." start={fin} size={76} stagger={1} />
          </At>
          <At x={960} y={540} w={1700}>
            <GlowText text="NOT EXPENSIVE." start={f(CUE.notExpensive)} size={76} stagger={1} />
          </At>
        </>
      }
    />
  );
};
