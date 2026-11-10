import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../../v2/anim";
import { DrawLine, LineArt } from "../../v2/components/Draw";
import { ICONS } from "../../v2/components/Products";
import { PriceCard } from "../../v2/components/Card";
import { Floor, Halo } from "../../v2/components/Glow";
import { At, GlowText, Label, Pill } from "../../v2/components/Text";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { P } from "../products";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

export const GX = 620;
export const FX = 1300;
const PY = 460;
const PS = 300;

/** Check marks under both products with a label between them ("✓ ── SIMILAR LOOK ── ✓"). */
const SharedRow: React.FC<{ y: number; text: string; start: number }> = ({ y, text, start }) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 16);
  return (
    <>
      <LineArt parts={[{ t: "circle", cx: 12, cy: 12, r: 10 }, ...ICONS.check]} p={p} x={GX} y={y} size={26} viewBox={24} width={1.8} spread={0.4} />
      <LineArt parts={[{ t: "circle", cx: 12, cy: 12, r: 10 }, ...ICONS.check]} p={prog(fr, start + 4, 16)} x={FX} y={y} size={26} viewBox={24} width={1.8} spread={0.4} />
      <DrawLine x1={GX + 30} y1={y} x2={FX - 30} y2={y} p={prog(fr, start + 2, 18)} dashed opacity={0.3} width={1.2} />
      <At x={960} y={y - 14} w={360}>
        <div style={{ background: "#000", padding: "4px 16px" }}>
          <Label text={text} start={start + 4} size={14} />
        </div>
      </At>
    </>
  );
};

/** Scenes 1–2 as one continuous shot: genuine vs fake, then their prices. */
export const S1Compare: React.FC = () => {
  const fr = useCurrentFrame();
  const h = f(CUE.hook);
  const pr = f(CUE.priceWord);
  return (
    <SceneLayer
      win={SCENES.compare}
      origin={ORIGIN.compare}
      fadeOut={XFADE}
      push={0.02}
      camera={cameraAt}
      world={
        <>
          <Halo x={GX} y={PY + 30} r={260} o={prog(fr, h, 36)} />
          <Halo x={FX} y={PY + 30} r={260} o={prog(fr, h + 10, 36)} />
          <LineArt parts={P.sneakerGenuine} p={prog(fr, h + 2, 40)} x={GX} y={PY} size={PS} width={2.6} />
          <LineArt parts={P.sneakerFake} p={prog(fr, h + 12, 40)} x={FX} y={PY} size={PS} width={2.6} />
          <Floor x={GX} y={PY + 78} w={360} p={prog(fr, h + 14, 22)} />
          <Floor x={FX} y={PY + 78} w={360} p={prog(fr, h + 22, 22)} />
          <At x={GX} y={PY + 98} w={300}>
            <Label text="Genuine" start={h + 20} size={14} />
          </At>
          <At x={FX} y={PY + 98} w={300}>
            <Label text="Fake" start={h + 28} size={14} />
          </At>

          {/* glowing comparison line between them */}
          <div
            style={{
              position: "absolute",
              left: 959,
              top: 300,
              width: 2,
              height: 300 * prog(fr, h + 18, 30),
              background: INK,
              boxShadow: "0 0 10px rgba(255,255,255,0.9), 0 0 26px rgba(255,255,255,0.4)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 960 - 24,
              top: 426,
              width: 48,
              height: 48,
              borderRadius: 24,
              background: "#000",
              border: `1.5px solid ${INK}`,
              boxShadow: "0 0 16px rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: INK,
              opacity: prog(fr, h + 36, 12),
            }}
          >
            VS
          </div>

          {/* scene 2 — price */}
          <PriceCard x={GX} y={250} start={pr - 6} label="Genuine" value={240} />
          <PriceCard x={FX} y={250} start={pr + 4} label="Fake" value={35} />
          <DrawLine x1={GX + 125} y1={250} x2={FX - 125} y2={250} p={prog(fr, f(CUE.without) - 4, 18)} dashed opacity={0.6} width={1.4} />
          <At x={960} y={236} w={300}>
            <Pill text="Save $205" start={f(CUE.without) + 8} />
          </At>
          <SharedRow y={652} text="Similar look" start={f(CUE.similar) - 2} />
          <SharedRow y={708} text="Basic function" start={f(CUE.basic) - 2} />
        </>
      }
      screen={
        <At x={960} y={96} w={1700}>
          <GlowText text="WHY FAKE CAN BE BETTER" start={h + 2} size={42} spacing="0.18em" stagger={0.9} out={f(CUE.price) - 8} />
        </At>
      }
    />
  );
};
