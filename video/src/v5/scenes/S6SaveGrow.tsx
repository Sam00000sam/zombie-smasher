import React from "react";
import { useCurrentFrame } from "remotion";
import { lerp } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Card } from "../../v2/components/Card";
import { Halo } from "../../v2/components/Glow";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, GLOW, INK } from "../../v2/theme";
import { Coin } from "../../v3/fx";
import { cameraAt } from "../camera";
import { P } from "../products";
import { io, p01, Rise } from "../smooth";
import { Place, Tiny } from "../ui";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const STYLES = ["handbag", "tote", "clutch", "backpack", "crossbody"];
const SW = 160;
const SG = 20;
const SX = 760;
const SY = 400;
const SH = 210;
const POT = { x: 1180, y: 640 };

/** A line-art plant that grows: g 0..1 (stem height + leaves), drawn on smoothly. */
const Plant: React.FC<{ x: number; y: number; g: number }> = ({ x, y, g }) => {
  if (g <= 0) return null;
  const h = 300 * g;
  const leaves = [
    { at: 0.18, side: -1, s: 1 },
    { at: 0.32, side: 1, s: 1.05 },
    { at: 0.5, side: -1, s: 1.1 },
    { at: 0.64, side: 1, s: 1.1 },
    { at: 0.8, side: -1, s: 1.15 },
    { at: 0.92, side: 1, s: 1.15 },
  ];
  return (
    <svg width={400} height={400} style={{ position: "absolute", left: x - 200, top: y - 380, overflow: "visible", filter: GLOW }}>
      <path d={`M200 380 C ${200 - 14} ${380 - h * 0.35} ${200 + 14} ${380 - h * 0.7} 200 ${380 - h}`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      {leaves.map((l, i) => {
        const lp = Math.max(0, Math.min(1, (g * 300 / 300 - l.at) / 0.12));
        if (lp <= 0) return null;
        const ly = 380 - 300 * l.at;
        const sx = l.side * 46 * l.s * lp;
        return <path key={i} d={`M200 ${ly} Q ${200 + sx * 0.5} ${ly - 30 * lp} ${200 + sx} ${ly - 8 * lp} Q ${200 + sx * 0.55} ${ly + 8 * lp} 200 ${ly} Z`} fill="none" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />;
      })}
    </svg>
  );
};

/** "The money you save could buy five styles, instead of one. Or skip the extra bags, and put that money
 *  somewhere it can actually grow. Even small savings add up over time." */
export const S6SaveGrow: React.FC = () => {
  const fr = useCurrentFrame();
  const s0 = SCENES.save.from;
  const sv = f(CUE.saveWord);
  const five = f(CUE.five);
  const inst = f(CUE.instead);
  const skip = f(CUE.skip);
  const put = f(CUE.put);
  const grow = f(CUE.growWord);
  const add = f(CUE.addup);
  const tEnd = f(CUE.time) + 12;
  const dimReal = p01(fr, inst, 18);
  const rowOut = p01(fr, skip + 4, 20);
  const cardMove = p01(fr, skip + 10, 26);
  const cardX = lerp(830, 520, cardMove);
  const cardY = lerp(180, 460, cardMove);
  const g = 0.55 * p01(fr, grow - 14, 30) + 0.45 * p01(fr, add, tEnd - add);

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
          {/* the savings card (moves over to feed the plant later) */}
          <Rise at={s0 + 6} dur={20}>
            <Card x={cardX} y={cardY} w={270} h={124} start={s0 + 6} title="YOU SAVED" titleSize={16} />
            <div style={{ position: "absolute", left: cardX + 28, top: cardY + 46, fontFamily: FONT, fontSize: 48, fontWeight: 700, color: INK, textShadow: "0 0 14px rgba(255,255,255,0.5)" }}>
              ${Math.round(1110 * p01(fr, sv - 6, 24)).toLocaleString("en-US")}
            </div>
          </Rise>

          {/* one real bag or five copies */}
          <div style={{ position: "absolute", inset: 0, opacity: 1 - rowOut }}>
            <div style={{ position: "absolute", inset: 0, opacity: lerp(1, 0.4, dimReal) }}>
              <Card x={420} y={SY} w={SW + 20} h={SH} start={s0 + 10} title="REAL" titleSize={16} />
              <LineArt parts={P.handbag} p={p01(fr, s0 + 14, 24)} x={510} y={SY + 114} size={120} width={2.2} />
            </div>
            <Rise at={inst}>
              <Place x={510} y={SY + SH + 20}>
                <Tiny text="1 style" />
              </Place>
            </Rise>
            <Rise at={s0 + 18}>
              <Place x={665} y={SY + SH / 2 - 10} w={80}>
                <Tiny text="or" color="#8f8f8f" size={18} />
              </Place>
            </Rise>
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
                  <LineArt parts={P[k]} p={on} x={x + SW / 2} y={SY + 110} size={112} width={2.2} />
                </React.Fragment>
              );
            })}
            <Rise at={inst + 4}>
              <Place x={SX + (5 * SW + 4 * SG) / 2} y={SY + SH + 20} w={300}>
                <Tiny text="5 styles" />
              </Place>
            </Rise>
          </div>

          {/* or: put it somewhere it can grow */}
          <Rise at={skip + 16} dur={20}>
            <LineArt parts={P.pot} p={p01(fr, skip + 16, 24)} x={POT.x} y={POT.y} size={190} width={2.4} />
          </Rise>
          {[0, 1, 2].map((i) => {
            const t = p01(fr, put + i * 6, 18);
            if (t <= 0 || t >= 1) return null;
            const e = io(t);
            const x = lerp(cardX + 135, POT.x, e);
            const y = lerp(cardY + 60, POT.y + 20, e) - Math.sin(e * Math.PI) * 120;
            return <Coin key={i} x={x} y={y} r={18} o={Math.min(1, t * 4) * (1 - Math.pow(t, 6))} />;
          })}
          <Halo x={POT.x} y={POT.y - 140} r={260} o={p01(fr, grow - 10, 30) * 0.8} />
          <Plant x={POT.x} y={POT.y + 10} g={g} />
          {/* over time */}
          <Rise at={add - 4} dur={18}>
            <div style={{ position: "absolute", left: 860, top: 760, width: 640 }}>
              <div style={{ position: "relative", height: 2, background: "rgba(255,255,255,0.25)" }}>
                <div style={{ position: "absolute", left: 0, top: -2, height: 6, borderRadius: 3, width: `${(100 * p01(fr, add, tEnd - add)).toFixed(1)}%`, background: INK, boxShadow: "0 0 12px rgba(255,255,255,0.8)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
                <Tiny text="Today" size={14} />
                <Tiny text="Over time" size={14} />
              </div>
            </div>
          </Rise>
        </>
      }
    />
  );
};
