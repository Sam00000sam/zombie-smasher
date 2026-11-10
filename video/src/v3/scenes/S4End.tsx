import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, lerp, prog } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Floor, Halo } from "../../v2/components/Glow";
import { At, GlowText, Label, Pill } from "../../v2/components/Text";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { P } from "../products";
import { CUE, f, FINAL_TITLE, ORIGIN, SCENES, XFADE } from "../timing";

const PY = 470;
const PS = 270;

/** Scene 5 — both products return to centre, the cheaper one wins, then the final title. */
export const S4End: React.FC = () => {
  const fr = useCurrentFrame();
  const s = SCENES.end.from;
  const back = prog(fr, s + 4, 30);
  const gx = lerp(560, 770, back);
  const fx = lerp(1360, 1150, back);
  const pick = prog(fr, f(CUE.priceDiff), 16);
  const stage = 1 - prog(fr, FINAL_TITLE - 12, 14);
  const ul = prog(fr, FINAL_TITLE + 14, 20);

  return (
    <SceneLayer
      win={SCENES.end}
      origin={ORIGIN.end}
      fadeIn={XFADE}
      push={0.02}
      camera={cameraAt}
      world={
        <div style={{ position: "absolute", inset: 0, opacity: stage }}>
          <Halo x={fx} y={PY + 20} r={260} o={pick} />
          <LineArt parts={P.sneakerGenuine} p={1} x={gx} y={PY} size={PS} width={2.6} opacity={lerp(1, 0.35, pick) * back} />
          <LineArt parts={P.sneakerFake} p={1} x={fx} y={PY} size={PS} width={2.6} opacity={back} />
          <Floor x={960} y={PY + 72} w={900} p={prog(fr, s + 10, 24)} />
          <At x={gx} y={PY + 92} w={300}>
            <Label text="Genuine · $240" start={s + 24} size={14} opacity={lerp(1, 0.4, pick)} />
          </At>
          <At x={fx} y={PY + 92} w={300}>
            <Label text="Fake · $35" start={s + 28} size={14} />
          </At>
          <At x={fx} y={PY - 112} w={300}>
            <Pill text="Cheaper" start={f(CUE.priceDiff) + 4} size={13} />
          </At>
        </div>
      }
      screen={
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center", gap: 34, opacity: stage }}>
            <GlowText text="LOWER PRICE." start={f(CUE.risksLow)} size={42} spacing="0.18em" />
            <GlowText text="MORE CHOICE." start={f(CUE.huge)} size={42} spacing="0.18em" />
          </div>

          {/* final title, styled after the reference's closing card */}
          <Halo x={960} y={500} r={430} o={prog(fr, FINAL_TITLE, 24, easeOut) * 0.9} />
          <At x={960} y={460} w={1700}>
            <GlowText text="WHY PAY MORE?" start={FINAL_TITLE} size={66} spacing="0.22em" stagger={1.4} />
          </At>
          <div style={{ position: "absolute", left: 960 - 80 * ul, top: 560, width: 160 * ul, height: 1.5, background: INK, boxShadow: "0 0 10px rgba(255,255,255,0.8)" }} />
        </>
      }
    />
  );
};
