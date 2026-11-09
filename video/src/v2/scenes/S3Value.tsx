import React from "react";
import { useCurrentFrame } from "remotion";
import { lerp, prog } from "../anim";
import { LineArt } from "../components/Draw";
import { PRODUCTS } from "../components/Products";
import { Icon } from "../components/Icon";
import { PriceTag } from "../components/PriceTag";
import { StickFigure } from "../components/StickFigure";
import { At, GlowText, Label } from "../components/Text";
import { Kicker, SceneLayer } from "../components/SceneLayer";
import { CAMERA_MOVES, CUE, f, ORIGIN, SCENES } from "../timing";
import { FONT, INK } from "../theme";

const ITEMS = [
  { kind: "headphones", x: 560, cat: "Audio", feats: ["Clear sound", "All-day comfort"] },
  { kind: "sneaker", x: 960, cat: "Footwear", feats: ["Durable sole", "Supportive fit"] },
  { kind: "phone", x: 1360, cat: "Electronics", feats: ["Fast performance", "Great camera"] },
] as const;

const TILT = CAMERA_MOVES[1]; // camera tilts down to the shopper
const DY = 420; // shopper beat sits one camera-tilt below

const Feature: React.FC<{ x: number; y: number; text: string; start: number }> = ({ x, y, text, start }) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 14);
  return (
    <>
      <Icon name="check" x={x - 112} y={y + 11} p={p} size={24} width={2.4} />
      <div
        style={{
          position: "absolute",
          left: x - 92,
          top: y,
          fontFamily: FONT,
          fontSize: 17,
          fontWeight: 500,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: INK,
          whiteSpace: "nowrap",
          opacity: prog(fr, start + 4, 12),
        }}
      >
        {text}
      </div>
    </>
  );
};

export const S3Value: React.FC = () => {
  const fr = useCurrentFrame();
  const v = f(CUE.value);
  const beatA = 1 - prog(fr, TILT.at - 2, 20);

  // beat B — the shopper chooses
  const b0 = TILT.at + 4;
  const fig = prog(fr, b0, 22);
  const look = lerp(lerp(0, -1, prog(fr, b0 + 24, 8)), 1, prog(fr, b0 + 34, 8));
  const point = prog(fr, b0 + 40, 12);
  const ring = prog(fr, b0 + 46, 16);
  const chosen = prog(fr, b0 + 58, 12);
  const leftDim = lerp(1, 0.35, prog(fr, b0 + 52, 14));

  return (
    <SceneLayer
      win={SCENES.value}
      origin={ORIGIN.value}
      fadeIn={24}
      fadeOut={24}
      world={
        <>
          {/* beat A — three everyday categories */}
          <div style={{ position: "absolute", inset: 0, opacity: beatA }}>
            {ITEMS.map((it, i) => {
              const st = v + 4 + i * 9;
              return (
                <React.Fragment key={it.kind}>
                  <LineArt parts={PRODUCTS[it.kind]} p={prog(fr, st, 40)} x={it.x} y={380} size={220} />
                  <At x={it.x} y={488} w={360}>
                    <Label text={it.cat} start={st + 18} size={15} />
                  </At>
                  <Feature x={it.x} y={540} text={it.feats[0]} start={f(CUE.impressive) + i * 5} />
                  <Feature x={it.x} y={584} text={it.feats[1]} start={f(CUE.functionality) - 6 + i * 5} />
                </React.Fragment>
              );
            })}
          </div>

          {/* beat B — a shopper choosing between two similar products */}
          <StickFigure x={960} y={DY + 470} height={290} p={fig} look={look} point={point} />
          <LineArt parts={PRODUCTS.sneaker} p={prog(fr, b0 + 2, 30)} x={620} y={DY + 520} size={240} opacity={leftDim} />
          <LineArt parts={PRODUCTS.sneaker} p={prog(fr, b0 + 8, 30)} x={1300} y={DY + 520} size={240} />
          <PriceTag x={620} y={DY + 400} start={b0 + 12} value={180} opacity={leftDim} />
          <PriceTag x={1300} y={DY + 400} start={b0 + 18} value={45} />
          <LineArt parts={[{ t: "path", d: "M10 100 A90 44 0 1 1 190 100 A90 44 0 1 1 10 100" }]} p={ring} x={1300} y={DY + 532} size={300} width={1.6} />
          <div style={{ position: "absolute", left: 1300 + 112, top: DY + 532 - 92, opacity: chosen }}>
            <div style={{ position: "relative", width: 44, height: 44, borderRadius: 22, background: "#000", border: `1.5px solid ${INK}`, boxShadow: "0 0 16px rgba(255,255,255,0.45)" }}>
              <Icon name="check" x={22} y={22} p={chosen} size={28} width={2.6} />
            </div>
          </div>
        </>
      }
      screen={
        <>
          <Kicker n="03" title="The value" start={SCENES.value.from + 10} out={SCENES.value.to - 24} />
          <At x={960} y={120} w={1600}>
            <div style={{ display: "flex", gap: 26 }}>
              <GlowText text="SAME PURPOSE." start={f(CUE.functionality)} size={54} />
              <GlowText text="LESS MONEY." start={f(CUE.without)} size={54} />
            </div>
          </At>
        </>
      }
    />
  );
};
