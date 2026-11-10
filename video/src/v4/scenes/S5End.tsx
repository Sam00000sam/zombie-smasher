import React from "react";
import { useCurrentFrame } from "remotion";
import { lerp } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Halo } from "../../v2/components/Glow";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { ArmsPawn, BrowserWindow, Cursor } from "../../v3/fx2";
import { cameraAt } from "../camera";
import { P } from "../products";
import { p01, Rise } from "../smooth";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const WW = 560;
const WH = 360;
const WY = 250;

const SplitCard: React.FC<{ y: number; title: string; value: string; icon: string; at: number; x: number }> = ({ y, title, value, icon, at, x }) => {
  const fr = useCurrentFrame();
  return (
    <Rise at={at} dur={20} dy={0}>
      <div style={{ position: "absolute", left: x + (1 - p01(fr, at, 20)) * 40, top: y, width: 380, height: 140, borderRadius: 16, border: `2px solid ${INK}`, background: "#000", boxShadow: "0 0 16px rgba(255,255,255,0.35)" }}>
        <div style={{ position: "absolute", left: 22, top: 22, width: 96, height: 96 }}>
          <LineArt parts={P[icon]} p={p01(fr, at + 4, 22)} x={48} y={48} size={96} width={2.2} />
        </div>
        <div style={{ position: "absolute", left: 140, top: 32, fontFamily: FONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.28em", color: INK }}>{title}</div>
        <div style={{ position: "absolute", left: 140, top: 56, fontFamily: FONT, fontSize: 46, fontWeight: 700, color: INK, textShadow: "0 0 14px rgba(255,255,255,0.5)" }}>{value}</div>
      </div>
    </Rise>
  );
};

/** "So before you pay for the name, ask yourself: are you buying the product, or the label?" */
export const S5End: React.FC = () => {
  const fr = useCurrentFrame();
  const s0 = SCENES.end.from;
  const pay = f(CUE.pay);
  const name = f(CUE.pay) + 14;
  const ask = f(CUE.ask);
  const pq = f(CUE.productQ) - 4;
  const lb = f(CUE.label) - 4;
  const slide = p01(fr, pq - 10, 24); // checkout eases left to make room for the answer
  const wx = lerp(960 - WW / 2, 470, slide);
  const nameGlow = p01(fr, name, 14) * (1 - p01(fr, pq, 14));

  return (
    <SceneLayer
      win={SCENES.end}
      origin={ORIGIN.end}
      fadeIn={XFADE}
      push={0}
      camera={cameraAt}
      world={
        <>
          <BrowserWindow x={wx} y={WY} w={WW} h={WH} start={s0 + 4} url="checkout">
            <div style={{ position: "absolute", left: 30, top: 26, fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.28em", color: INK }}>YOUR ORDER</div>
            <div style={{ position: "absolute", left: 30, right: 30, top: 54, height: 1, background: "rgba(255,255,255,0.25)" }} />
            <LineArt parts={P.handbag} p={p01(fr, s0 + 10, 24)} x={90} y={130} size={110} width={2.2} />
            <div style={{ position: "absolute", left: 170, top: 100, fontFamily: FONT, fontSize: 18, fontWeight: 600, letterSpacing: "0.12em", color: INK, textShadow: nameGlow > 0 ? `0 0 ${16 * nameGlow}px rgba(255,255,255,0.9)` : undefined }}>BRAND-NAME BAG</div>
            <div style={{ position: "absolute", left: 170, top: 128, width: 196 * nameGlow, height: 2, background: INK, boxShadow: "0 0 8px rgba(255,255,255,0.8)" }} />
            <div style={{ position: "absolute", right: 30, top: 104, fontFamily: FONT, fontSize: 28, fontWeight: 700, color: INK }}>$1,200</div>
            <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, height: 60, borderRadius: 999, background: INK, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 17, fontWeight: 800, letterSpacing: "0.26em", boxShadow: "0 0 20px rgba(255,255,255,0.5)" }}>PAY $1,200</div>
          </BrowserWindow>
          <Cursor
            path={[
              { at: s0 + 10, x: 1300, y: 760 },
              { at: pay + 10, x: wx + WW / 2 + 30, y: WY + WH - 50 },
              { at: pq - 10, x: wx + WW / 2 + 30, y: WY + WH - 50 },
              { at: pq + 14, x: 470 + WW / 2 + 30, y: WY + WH - 50 },
            ]}
            o={p01(fr, s0 + 10, 12) * (1 - p01(fr, lb + 10, 16))}
          />

          {/* ask yourself */}
          <div style={{ position: "absolute", left: 250, top: 770, width: 220, height: 0, borderTop: "1.5px dashed rgba(255,255,255,0.4)", opacity: p01(fr, ask - 6, 16) * (1 - slide) }} />
          <ArmsPawn x={360} y={770} h={160} o={p01(fr, ask - 6, 16) * (1 - slide)} q={p01(fr, ask + 2, 14)} />

          {/* the answer: what the $1,200 actually buys */}
          <SplitCard x={1090} y={WY + 20} title="THE PRODUCT" value="$90" icon="handbag" at={pq} />
          <SplitCard x={1090} y={WY + 200} title="THE LABEL" value="$1,110" icon="crest" at={lb} />
          <Halo x={1280} y={WY + 270} r={260} o={p01(fr, lb + 6, 20) * 0.9} />
        </>
      }
    />
  );
};
