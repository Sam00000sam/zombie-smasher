import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, lerp, prog } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Halo } from "../../v2/components/Glow";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { ArmsPawn, BrowserWindow, Cursor, Ripple, Spark, Spotlight } from "../../v3/fx2";
import { SlamTitle } from "../../v3/scenes/S1Compare";
import { cameraAt } from "../camera";
import { P } from "../products";
import { CUE, f, FINAL_TITLE, ORIGIN, SCENES, XFADE } from "../timing";

const WX = 560;
const WY = 240;
const WW = 560;
const WH = 380;

const SplitCard: React.FC<{ x: number; y: number; title: string; value: string; icon: string; start: number }> = ({ x, y, title, value, icon, start }) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 10, easeOut);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x + (1 - p) * 60, top: y, width: 380, height: 150, opacity: p, borderRadius: 16, border: `2px solid ${INK}`, background: "#000", boxShadow: `0 0 ${14 + (1 - p) * 30}px rgba(255,255,255,0.45)` }}>
      <div style={{ position: "absolute", left: 20, top: 25, width: 100, height: 100 }}>
        <LineArt parts={P[icon]} p={prog(fr, start + 2, 16)} x={50} y={50} size={100} width={2.2} />
      </div>
      <div style={{ position: "absolute", left: 140, top: 34, fontFamily: FONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.28em", color: INK }}>{title}</div>
      <div style={{ position: "absolute", left: 140, top: 60, fontFamily: FONT, fontSize: 48, fontWeight: 700, color: INK, textShadow: "0 0 14px rgba(255,255,255,0.55)" }}>{value}</div>
    </div>
  );
};

/** Scene 6 — at checkout, hesitate: are you paying for the product, or the label? */
export const S5End: React.FC = () => {
  const fr = useCurrentFrame();
  const s0 = SCENES.end.from;
  const pay = f(CUE.pay);
  const ask = f(CUE.ask);
  const pq = f(CUE.productQ);
  const lb = f(CUE.label);
  const stage = 1 - prog(fr, FINAL_TITLE - 10, 12);
  const ul = prog(fr, FINAL_TITLE + 14, 18);

  return (
    <SceneLayer
      win={SCENES.end}
      origin={ORIGIN.end}
      fadeIn={XFADE}
      push={0.02}
      camera={cameraAt}
      world={
        <div style={{ position: "absolute", inset: 0, opacity: stage }}>
          <Spotlight keys={[{ at: s0, x: 840, y: 430, r: 480 }, { at: ask, x: 330, y: 600, r: 300 }, { at: pq, x: 1430, y: 430, r: 460 }]} />
          <BrowserWindow x={WX} y={WY} w={WW} h={WH} start={s0 + 2} url="checkout">
            <div style={{ position: "absolute", left: 30, top: 26, fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.28em", color: INK }}>YOUR ORDER</div>
            <div style={{ position: "absolute", left: 30, right: 30, top: 54, height: 1, background: "rgba(255,255,255,0.25)" }} />
            <LineArt parts={P.handbag} p={prog(fr, s0 + 8, 20)} x={90} y={130} size={110} width={2.2} />
            <div style={{ position: "absolute", left: 170, top: 96, fontFamily: FONT, fontSize: 18, fontWeight: 600, letterSpacing: "0.12em", color: INK }}>BRAND-NAME BAG</div>
            <div style={{ position: "absolute", left: 170, top: 124, fontFamily: FONT, fontSize: 13, fontWeight: 600, letterSpacing: "0.24em", color: "#9a9a9a" }}>QTY 1</div>
            <div style={{ position: "absolute", right: 30, top: 104, fontFamily: FONT, fontSize: 30, fontWeight: 700, color: INK }}>$1,200</div>
            <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, height: 62, borderRadius: 999, background: INK, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 18, fontWeight: 800, letterSpacing: "0.26em", boxShadow: "0 0 22px rgba(255,255,255,0.55)" }}>PAY $1,200</div>
          </BrowserWindow>
          <Cursor path={[{ at: s0, x: 1150, y: 760 }, { at: pay, x: 860, y: 590 }, { at: pay + 8, x: 880, y: 600 }, { at: pay + 16, x: 852, y: 588 }, { at: pay + 24, x: 900, y: 640 }]} o={prog(fr, s0 + 4, 6) * (1 - prog(fr, pq - 4, 8))} />
          <div style={{ position: "absolute", left: 210, top: 760, width: 240, height: 0, borderTop: "1.5px dashed rgba(255,255,255,0.45)" }} />
          <ArmsPawn x={330} y={760} h={170} o={prog(fr, s0 + 6, 10)} q={prog(fr, ask, 8)} />

          {/* the split: what the $1,200 actually buys */}
          <Spark pts={[[WX + WW, WY + 140], [1260, WY + 140], [1260, 300]]} start={pq - 6} dur={10} dashed wireStart={pq - 8} />
          <Spark pts={[[WX + WW, WY + 140], [1260, WY + 140], [1260, 490]]} start={lb - 6} dur={10} dashed wireStart={lb - 8} />
          <SplitCard x={1270} y={225} title="THE PRODUCT" value="$90" icon="handbag" start={pq} />
          <SplitCard x={1270} y={415} title="THE LABEL" value={`$${Math.round(lerp(0, 1110, prog(fr, lb + 2, 14, easeOut))).toLocaleString("en-US")}`} icon="crest" start={lb} />
          <Ripple x={1460} y={300} at={pq + 2} r={140} />
          <Ripple x={1460} y={490} at={lb + 2} r={160} />
          <Halo x={1460} y={490} r={260} o={prog(fr, lb + 4, 10)} />
        </div>
      }
      screen={
        <>
          <Halo x={960} y={500} r={430} o={prog(fr, FINAL_TITLE, 20, easeOut) * 0.9} />
          <SlamTitle text="PRODUCT OR LABEL?" start={FINAL_TITLE} size={68} y={458} />
          <div style={{ position: "absolute", left: 960 - 90 * ul, top: 556, width: 180 * ul, height: 2, background: INK, boxShadow: "0 0 10px rgba(255,255,255,0.8)" }} />
        </>
      }
    />
  );
};
