import React from "react";
import { useCurrentFrame } from "remotion";
import { lerp } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Card } from "../../v2/components/Card";
import { Halo } from "../../v2/components/Glow";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { P } from "../products";
import { p01, Rise } from "../smooth";
import { Place, Tiny } from "../ui";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const STYLES = ["handbag", "tote", "clutch", "backpack", "crossbody"];
const SW = 160;
const SG = 20;
const SX = 760;
const SY = 400;
const SH = 210;

/** "The money you save could buy five styles, instead of one." */
export const S4Save: React.FC = () => {
  const fr = useCurrentFrame();
  const s0 = SCENES.save.from;
  const sv = f(CUE.saveWord);
  const five = f(CUE.five);
  const inst = f(CUE.instead);
  const dimReal = p01(fr, inst, 18);
  return (
    <SceneLayer
      win={SCENES.save}
      origin={ORIGIN.save}
      fadeIn={XFADE}
      fadeOut={XFADE}
      push={0}
      camera={cameraAt}
      world={
        <>
          <Rise at={s0 + 6} dur={20}>
            <Card x={830} y={180} w={260} h={120} start={s0 + 6} title="YOU SAVED" titleSize={16} />
            <div style={{ position: "absolute", left: 856, top: 222, fontFamily: FONT, fontSize: 44, fontWeight: 700, color: INK, textShadow: "0 0 14px rgba(255,255,255,0.5)" }}>
              ${Math.round(1110 * p01(fr, sv - 6, 24)).toLocaleString("en-US")}
            </div>
          </Rise>

          {/* one real bag … */}
          <div style={{ position: "absolute", inset: 0, opacity: lerp(1, 0.4, dimReal) }}>
            <Card x={420} y={SY} w={SW + 20} h={SH} start={s0 + 10} title="REAL" titleSize={16} />
            <LineArt parts={P.handbag} p={p01(fr, s0 + 14, 24)} x={510} y={SY + 112} size={120} width={2.2} />
          </div>
          <Rise at={inst}>
            <Place x={510} y={SY + SH + 20}>
              <Tiny text="1 style" />
            </Place>
          </Rise>
          <Rise at={s0 + 18}>
            <Place x={665} y={SY + SH / 2 - 10} w={80}>
              <Tiny text="or" color="#8f8f8f" size={16} />
            </Place>
          </Rise>

          {/* … or five copies, lighting up one by one */}
          {STYLES.map((k, i) => {
            const x = SX + i * (SW + SG);
            const on = p01(fr, five + i * 5 - 4, 16);
            return (
              <React.Fragment key={k}>
                <div style={{ position: "absolute", left: x, top: SY, width: SW, height: SH, borderRadius: 16, border: `2px solid ${INK}`, background: "#000", opacity: lerp(0.22, 1, on) * p01(fr, s0 + 12 + i * 2, 16), boxShadow: `0 0 ${8 + on * 16}px rgba(255,255,255,${0.12 + on * 0.35})` }}>
                  <div style={{ position: "absolute", left: 14, top: 12, fontFamily: FONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.22em", color: INK }}>{`COPY 0${i + 1}`}</div>
                  <div style={{ position: "absolute", right: 14, bottom: 12, fontFamily: FONT, fontSize: 19, fontWeight: 700, color: INK, opacity: on }}>$90</div>
                </div>
                <Halo x={x + SW / 2} y={SY + SH / 2} r={130} o={on * 0.6} />
                <LineArt parts={P[k]} p={on} x={x + SW / 2} y={SY + 108} size={112} width={2.2} />
              </React.Fragment>
            );
          })}
          <Rise at={inst + 4}>
            <Place x={SX + (5 * SW + 4 * SG) / 2} y={SY + SH + 20} w={300}>
              <Tiny text="5 styles" />
            </Place>
          </Rise>
        </>
      }
    />
  );
};
