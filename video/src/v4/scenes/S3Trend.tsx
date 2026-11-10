import React from "react";
import { useCurrentFrame } from "remotion";
import { lerp } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Card } from "../../v2/components/Card";
import { ChartLine } from "../../v2/components/Chart";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { P } from "../products";
import { p01, Rise } from "../smooth";
import { Place, Tiny } from "../ui";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const KW = 760;
const KH = 360;
const KX = 960 - KW / 2;
const KY = 270;
const PW = KW - 100;
const PH = 210;
const MONTHS = "JFMAMJJASOND".split("");
const hype = (t: number) => ({ x: t * PW, y: PH - PH * (t < 0.42 ? Math.pow(t / 0.42, 1.8) : Math.max(0.06, 1 - Math.pow((t - 0.42) / 0.5, 0.7))) * 0.95 });
const path = Array.from({ length: 61 }, (_, i) => {
  const p = hype(i / 60);
  return `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
}).join(" ");

/** "Trends also change fast. Why spend a month's rent on something you'll stop wearing next season?" */
export const S3Trend: React.FC = () => {
  const fr = useCurrentFrame();
  const t0 = f(CUE.trend);
  const rent = f(CUE.rent) - 10;
  const stop = f(CUE.stop);
  const season = f(CUE.season);
  const chartOut = p01(fr, rent - 18, 16);
  const rentOut = p01(fr, stop - 4, 16);
  // the bag glides from its card to the centre and sinks into the box
  const toCentre = p01(fr, stop, 18);
  const sink = p01(fr, stop + 14, 22);
  const bagX = lerp(1160, 960, toCentre);
  const bagY = lerp(430, 500, toCentre) + sink * 190;
  const lid = p01(fr, season, 16);

  return (
    <SceneLayer
      win={SCENES.trend}
      origin={ORIGIN.trend}
      fadeIn={XFADE}
      fadeOut={XFADE}
      push={0}
      camera={cameraAt}
      world={
        <>
          {/* trends rise and fall */}
          <div style={{ position: "absolute", inset: 0, opacity: 1 - chartOut }}>
            <Card x={KX} y={KY} w={KW} h={KH} start={SCENES.trend.from + 6} title="TREND" />
            <div style={{ position: "absolute", left: KX + 50, top: KY + 60, width: PW, height: PH }}>
              <ChartLine d={path} at={hype} w={PW} h={PH} start={t0} dur={f(1.6)} />
            </div>
            <div style={{ position: "absolute", left: KX + 50, top: KY + 60 + PH + 20, width: PW, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#8f8f8f", opacity: p01(fr, t0, 14) }}>
              {MONTHS.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          </div>

          {/* a month's rent = one bag */}
          <div style={{ position: "absolute", inset: 0, opacity: 1 - rentOut }}>
            <Rise at={rent} dur={20}>
              <Card x={640} y={300} w={240} h={260} start={rent} title="RENT" />
              <LineArt parts={P.house} p={p01(fr, rent + 4, 24)} x={760} y={410} size={120} width={2.2} />
              <Place x={760} y={480} w={240}>
                <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 700, color: INK }}>$1,200</div>
              </Place>
            </Rise>
            <Rise at={rent + 10} dur={18}>
              <Place x={960} y={392} w={80}>
                <div style={{ fontFamily: FONT, fontSize: 48, fontWeight: 300, color: INK, textShadow: "0 0 16px rgba(255,255,255,0.6)" }}>=</div>
              </Place>
            </Rise>
            <Rise at={rent + 6} dur={20}>
              <Card x={1040} y={300} w={240} h={260} start={rent + 6} title="ONE BAG" />
              <Place x={1160} y={480} w={240}>
                <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 700, color: INK }}>$1,200</div>
              </Place>
            </Rise>
          </div>
          <LineArt parts={P.handbag} p={p01(fr, rent + 10, 24)} x={bagX} y={bagY} size={130} width={2.2} />

          {/* next season: into the box */}
          <Rise at={stop + 6} dur={20}>
            <div style={{ position: "absolute", left: 960 - 120, top: 640, width: 240, height: 130 }}>
              <div style={{ position: "absolute", left: 0, top: 26, width: 240, height: 104, border: `2px solid ${INK}`, borderTop: "none", borderRadius: "0 0 12px 12px", background: "#000", boxShadow: "0 0 14px rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Tiny text="Next season" />
              </div>
              <div style={{ position: "absolute", left: -6, top: 24, width: 252, height: 4, borderRadius: 2, background: INK, transformOrigin: "0 2px", transform: `rotate(${lerp(-70, 0, lid)}deg)`, boxShadow: "0 0 10px rgba(255,255,255,0.7)" }} />
            </div>
          </Rise>
        </>
      }
    />
  );
};
