import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, lerp, prog } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Card } from "../../v2/components/Card";
import { ChartLine } from "../../v2/components/Chart";
import { Label } from "../../v2/components/Text";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { Counter } from "../../v3/fx";
import { Ripple, Spotlight } from "../../v3/fx2";
import { cameraAt } from "../camera";
import { Orbit } from "../depth";
import { P } from "../products";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const KX = 250;
const KY = 230;
const KW = 640;
const KH = 340;
const PW = KW - 80;
const PH = 210;
const MONTHS = "JFMAMJJASOND".split("");
/** hype curve: fast rise, peak, crash */
const hype = (t: number) => ({ x: t * PW, y: PH - PH * (t < 0.42 ? Math.pow(t / 0.42, 1.8) : Math.max(0.06, 1 - Math.pow((t - 0.42) / 0.5, 0.7))) * 0.95 });
const path = Array.from({ length: 61 }, (_, i) => {
  const p = hype(i / 60);
  return `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
}).join(" ");

/** Scene 4 — trends spike and crash; the bag costs a month's rent; next season it's boxed away. */
export const S3Trend: React.FC = () => {
  const fr = useCurrentFrame();
  const t0 = f(CUE.trend);
  const rent = f(CUE.rent);
  const stop = f(CUE.stop);
  const drop = prog(fr, stop, 16, (v) => v * v);
  const lid = prog(fr, f(CUE.season) + 2, 8, easeOut);
  const bagX = lerp(1520, 1520, drop);
  const bagY = lerp(380, 640, drop);

  return (
    <SceneLayer
      win={SCENES.trend}
      origin={ORIGIN.trend}
      fadeIn={XFADE}
      fadeOut={XFADE}
      push={0.02}
      camera={cameraAt}
      world={
        <>
          <Spotlight keys={[{ at: 0, x: 570, y: 400, r: 460 }, { at: rent, x: 1330, y: 380, r: 440 }, { at: stop, x: 1520, y: 620, r: 340 }]} />
          <Card x={KX} y={KY} w={KW} h={KH} start={SCENES.trend.from + 4} title="TREND" />
          <div style={{ position: "absolute", left: KX + 40, top: KY + 60, width: PW, height: PH }}>
            <ChartLine d={path} at={hype} w={PW} h={PH} start={t0 + 2} dur={f(1.4)} />
          </div>
          <div style={{ position: "absolute", left: KX + 40, top: KY + 60 + PH + 18, width: PW, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#8f8f8f", opacity: prog(fr, t0, 10) }}>
            {MONTHS.map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
          <div style={{ position: "absolute", left: KX + 40 + PW * 0.42 - 30, top: KY + 36 }}>
            <Label text="Hype" start={t0 + 18} size={12} />
          </div>
          <div style={{ position: "absolute", left: KX + KW - 120, top: KY + 60 + PH - 40 }}>
            <Label text="Out" start={t0 + 40} size={12} />
          </div>

          {/* a month's rent = one bag */}
          <Card x={1000} y={250} w={250} h={220} start={rent - 6} title="RENT" />
          <LineArt parts={P.house} p={prog(fr, rent - 2, 20)} x={1125} y={350} size={110} width={2.2} />
          <div style={{ position: "absolute", left: 1000, top: 410, width: 250, textAlign: "center" }}>
            {fr >= rent && <Counter value={1200} start={rent} dur={12} prefix="$" size={32} />}
          </div>
          <div style={{ position: "absolute", left: 1262, top: 330, width: 50, textAlign: "center", fontFamily: FONT, fontSize: 46, fontWeight: 700, color: INK, opacity: prog(fr, rent + 8, 6), transform: `scale(${lerp(1.8, 1, prog(fr, rent + 8, 8, easeOut))})`, textShadow: "0 0 18px rgba(255,255,255,0.8)" }}>=</div>
          <Ripple x={1287} y={360} at={rent + 8} r={90} />
          <Card x={1395} y={250} w={250} h={220} start={rent + 2} title="ONE BAG" opacity={1 - prog(fr, stop - 2, 6) * 0.6} />
          <div style={{ position: "absolute", left: 1395, top: 410, width: 250, textAlign: "center", opacity: 1 - prog(fr, stop - 2, 6) }}>
            {fr >= rent + 4 && <Counter value={1200} start={rent + 4} dur={12} prefix="$" size={32} />}
          </div>
          {/* the bag falls out of the card into next season's box */}
          <LineArt parts={P.handbag} p={prog(fr, rent + 4, 20)} x={bagX} y={bagY} size={110} width={2.2} />
          <div style={{ position: "absolute", left: 1430, top: 640, width: 180, height: 110, opacity: prog(fr, stop - 10, 10) }}>
            <div style={{ position: "absolute", left: 0, top: 22, width: 180, height: 88, border: `2px solid ${INK}`, borderTop: "none", borderRadius: "0 0 10px 10px", background: "#000", boxShadow: "0 0 14px rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.24em", color: INK }}>
              NEXT SEASON
            </div>
            <div style={{ position: "absolute", left: -6, top: 20, width: 192, height: 4, background: INK, transformOrigin: "0 2px", transform: `rotate(${lerp(-62, 0, lid)}deg)`, boxShadow: "0 0 10px rgba(255,255,255,0.7)" }} />
          </div>
          <Ripple x={1520} y={690} at={f(CUE.season) + 8} r={120} />
          <Orbit x={1520} y={690} r={130} start={stop} speed={1.5} ticks />
          <Orbit x={KX + 40 + PW * 0.42} y={KY + 72} r={46} start={t0 + 14} speed={2.4} />
        </>
      }
    />
  );
};
