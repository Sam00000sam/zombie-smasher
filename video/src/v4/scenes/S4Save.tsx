import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, prog } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Card } from "../../v2/components/Card";
import { Halo } from "../../v2/components/Glow";
import { At, Label, Pill } from "../../v2/components/Text";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { Counter } from "../../v3/fx";
import { ArmsPawn, Ripple, Spark, Spotlight } from "../../v3/fx2";
import { cameraAt } from "../camera";
import { Orbit } from "../depth";
import { P } from "../products";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const STYLES = ["handbag", "tote", "clutch", "backpack", "crossbody"];
const SX = 700;
const SW = 170;
const SG = 22;
const SY = 420;
const SH = 220;

/** Scene 5 — the savings spark into five slots that light up with five styles, versus one. */
export const S4Save: React.FC = () => {
  const fr = useCurrentFrame();
  const s0 = SCENES.save.from;
  const sv = f(CUE.saveWord);
  const five = f(CUE.five);
  const inst = f(CUE.instead);
  return (
    <SceneLayer
      win={SCENES.save}
      origin={ORIGIN.save}
      fadeIn={XFADE}
      fadeOut={XFADE}
      push={0.02}
      camera={cameraAt}
      world={
        <>
          <Spotlight keys={[{ at: s0, x: 960, y: 260, r: 320 }, { at: five, x: 1120, y: 520, r: 620 }, { at: inst, x: 380, y: 520, r: 300 }]} />
          <Orbit x={960} y={230} r={170} start={s0 + 4} ticks />
          <Card x={830} y={170} w={260} h={120} start={s0 + 2} title="YOU SAVED" />
          <div style={{ position: "absolute", left: 856, top: 214 }}>{fr >= sv - 4 && <Counter value={1110} start={sv - 4} dur={16} prefix="$" size={44} />}</div>

          {/* one real bag */}
          <Card x={250} y={SY} w={SW + 20} h={SH} start={s0 + 4} title="REAL" opacity={1 - prog(fr, inst, 10) * 0.55} />
          <LineArt parts={P.handbag} p={prog(fr, s0 + 6, 20)} x={345} y={SY + 120} size={120} width={2.2} opacity={1 - prog(fr, inst, 10) * 0.55} />
          <At x={345} y={SY + SH + 18} w={260}>
            <Label text="1 style" start={inst} size={14} />
          </At>
          <div style={{ position: "absolute", left: 500, top: SY + SH / 2 - 16, width: 150, textAlign: "center", fontFamily: FONT, fontSize: 22, fontWeight: 700, letterSpacing: "0.3em", color: "#9a9a9a", opacity: prog(fr, s0 + 10, 10) }}>OR</div>

          {/* five slots light up as the savings arrive */}
          {STYLES.map((k, i) => {
            const x = SX + i * (SW + SG);
            const hit = five + i * 4 + 12;
            const on = prog(fr, hit, 8, easeOut);
            return (
              <React.Fragment key={k}>
                <div style={{ position: "absolute", left: x, top: SY, width: SW, height: SH, borderRadius: 16, border: `2px solid ${INK}`, background: "#000", opacity: 0.3 + 0.7 * on, boxShadow: on > 0 ? `0 0 ${10 + on * 22}px rgba(255,255,255,${0.2 + on * 0.4})` : undefined }}>
                  <div style={{ position: "absolute", left: 14, top: 12, fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.26em", color: INK }}>{`COPY 0${i + 1}`}</div>
                  <div style={{ position: "absolute", right: 14, bottom: 12, fontFamily: FONT, fontSize: 16, fontWeight: 700, color: INK, opacity: on }}>$90</div>
                </div>
                {on > 0 && <Halo x={x + SW / 2} y={SY + SH / 2} r={150} o={on * 0.7} />}
                <LineArt parts={P[k]} p={on} x={x + SW / 2} y={SY + 112} size={120} width={2.2} />
                <Spark pts={[[960, 290], [960, 340], [x + SW / 2, 340], [x + SW / 2, SY]]} start={five + i * 4} dur={12} dashed wireStart={sv} />
                <Ripple x={x + SW / 2} y={SY + SH / 2} at={hit} r={110} />
              </React.Fragment>
            );
          })}
          <div style={{ position: "absolute", left: SX, top: SY + SH + 14, width: 5 * SW + 4 * SG, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 12, opacity: prog(fr, five + 26, 8) }}>
            <Counter value={5} start={five + 26} dur={8} size={34} />
            <Label text="Styles" start={five + 26} size={14} />
          </div>
          <div style={{ position: "absolute", left: SX + 5 * SW + 4 * SG - 120, top: SY - 30 }}>
            <Pill text="Same money" start={inst + 4} size={12} />
          </div>
          <ArmsPawn x={1740} y={780} h={140} raise={prog(fr, inst + 8, 8, easeOut)} hop={prog(fr, inst + 8, 8) * 10} o={prog(fr, s0 + 10, 10)} />
        </>
      }
    />
  );
};
