import React from "react";
import { useCurrentFrame } from "remotion";
import { lerp, prog } from "../anim";
import { LineArt } from "../components/Draw";
import { PRODUCTS, ICONS } from "../components/Products";
import { PriceCard } from "../components/Card";
import { Floor, Halo } from "../components/Glow";
import { Pawn } from "../components/Pawn";
import { At, GlowText, Label, Pill } from "../components/Text";
import { SceneLayer } from "../components/SceneLayer";
import { CAMERA_MOVES, CUE, f, ORIGIN, SCENES, XFADE } from "../timing";
import { FONT, INK } from "../theme";

const ITEMS = [
  { kind: "headphones", x: 560, cat: "Audio", feats: ["Clear sound", "All-day comfort"] },
  { kind: "sneaker", x: 960, cat: "Footwear", feats: ["Durable sole", "Supportive fit"] },
  { kind: "phone", x: 1360, cat: "Electronics", feats: ["Fast", "Great camera"] },
] as const;

const TILT = CAMERA_MOVES[1];
const DY = 440;

/** Circled check + tiny label, like the reference's "✓ WORKS". */
const Works: React.FC<{ x: number; y: number; text: string; start: number }> = ({ x, y, text, start }) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 14);
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 10, opacity: Math.min(1, p * 2) }}>
      <div style={{ position: "relative", width: 22, height: 22 }}>
        <LineArt parts={[{ t: "circle", cx: 12, cy: 12, r: 10 }, ...ICONS.check]} p={p} x={11} y={11} size={22} viewBox={24} width={1.6} spread={0.4} />
      </div>
      <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, letterSpacing: "0.24em", color: INK, textTransform: "uppercase", whiteSpace: "nowrap" }}>{text}</div>
    </div>
  );
};

export const S3Value: React.FC = () => {
  const fr = useCurrentFrame();
  const v = f(CUE.value);
  const beatA = 1 - prog(fr, TILT.at - 2, 18);

  // beat B — the shopper decides
  const b0 = TILT.at + 2;
  const lean = lerp(lerp(0, -1, prog(fr, b0 + 18, 8)), 1, prog(fr, b0 + 28, 8));
  const pick = prog(fr, b0 + 40, 14);
  const leftDim = lerp(1, 0.3, pick);
  const q = prog(fr, b0 + 10, 10) * (1 - prog(fr, b0 + 38, 8));

  return (
    <SceneLayer
      win={SCENES.value}
      origin={ORIGIN.value}
      fadeIn={XFADE}
      fadeOut={XFADE}
      world={
        <>
          {/* beat A — three everyday categories that do the job */}
          <div style={{ position: "absolute", inset: 0, opacity: beatA }}>
            {ITEMS.map((it, i) => {
              const st = v + 2 + i * 8;
              return (
                <React.Fragment key={it.kind}>
                  <At x={it.x} y={236} w={300}>
                    <Label text={`0${i + 1}`} start={st} size={11} color="#9a9a9a" />
                  </At>
                  <At x={it.x} y={256} w={300}>
                    <Label text={it.cat} start={st + 4} size={14} />
                  </At>
                  <Halo x={it.x} y={420} r={190} o={prog(fr, st, 30)} />
                  <LineArt parts={PRODUCTS[it.kind]} p={prog(fr, st, 38)} x={it.x} y={420} size={210} />
                  <Floor x={it.x} y={530} w={240} p={prog(fr, st + 10, 20)} o={0.35} />
                  <Works x={it.x - 88} y={566} text={it.feats[0]} start={f(CUE.impressive) + i * 5} />
                  <Works x={it.x - 88} y={604} text={it.feats[1]} start={f(CUE.functionality) - 8 + i * 5} />
                </React.Fragment>
              );
            })}
          </div>

          {/* beat B — a shopper choosing between two similar products */}
          <Floor x={960} y={DY + 640} w={1100} p={prog(fr, b0, 24)} o={0.4} />
          <Pawn x={960} y={DY + 640} h={150} frame={fr} start={b0 + 2} lean={lean * (1 - pick) + pick * 0.6} />
          <div style={{ position: "absolute", left: 960 - 20, top: DY + 440, width: 40, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 40, color: INK, opacity: q, textShadow: "0 0 16px rgba(255,255,255,0.7)", transform: `translateY(${(1 - Math.min(1, q * 1.5)) * 10}px)` }}>?</div>
          <Halo x={1320} y={DY + 600} r={220} o={pick} />
          <LineArt parts={PRODUCTS.sneaker} p={prog(fr, b0 + 4, 26)} x={600} y={DY + 600} size={240} opacity={leftDim} />
          <LineArt parts={PRODUCTS.sneaker} p={prog(fr, b0 + 8, 26)} x={1320} y={DY + 600} size={240} />
          <PriceCard x={600} y={DY + 455} start={b0 + 8} label="Brand" value={180} w={170} big={36} opacity={leftDim} />
          <PriceCard x={1320} y={DY + 455} start={b0 + 14} label="Alternative" value={45} w={170} big={36} />
          <At x={1320} y={DY + 382} w={300}>
            <Pill text="Smart pick" start={b0 + 44} size={13} />
          </At>
        </>
      }
      screen={
        <At x={960} y={108} w={1700}>
          <div style={{ display: "flex", gap: 30 }}>
            <GlowText text="SAME PURPOSE." start={f(CUE.functionality) - 2} size={38} />
            <GlowText text="LESS MONEY." start={f(CUE.without)} size={38} />
          </div>
        </At>
      }
    />
  );
};
