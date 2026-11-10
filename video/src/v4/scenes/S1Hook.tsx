import React from "react";
import { useCurrentFrame } from "remotion";
import { lerp } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Floor, Halo } from "../../v2/components/Glow";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { P } from "../products";
import { p01, Rise } from "../smooth";
import { Place, Tiny } from "../ui";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const RX = 700;
const FX = 1220;
const Y = 500;

/** "Unpopular opinion: sometimes, the fake is the smarter buy." — real vs fake, the fake wins. */
export const S1Hook: React.FC = () => {
  const fr = useCurrentFrame();
  const fake = f(CUE.sometimes) + 6;
  const win = p01(fr, f(CUE.smarter) - 2, 20);
  return (
    <SceneLayer
      win={SCENES.hook}
      origin={ORIGIN.hook}
      fadeOut={XFADE}
      push={0}
      camera={cameraAt}
      world={
        <>
          <Halo x={RX} y={Y} r={230} o={p01(fr, 4, 24) * lerp(1, 0.4, win)} />
          <LineArt parts={P.handbag} p={p01(fr, 6, 34)} x={RX} y={Y} size={260} width={2.6} opacity={lerp(1, 0.55, win)} />
          <Floor x={RX} y={Y + 92} w={300} p={p01(fr, 14, 24)} />
          <Rise at={20}>
            <Place x={RX} y={Y + 112}>
              <Tiny text="Real" />
            </Place>
          </Rise>

          <Halo x={FX} y={Y} r={lerp(230, 290, win)} o={p01(fr, fake, 24) * lerp(1, 1.6, win)} />
          <LineArt parts={P.handbag} p={p01(fr, fake, 34)} x={FX} y={Y} size={260} width={2.6} />
          <Floor x={FX} y={Y + 92} w={300} p={p01(fr, fake + 8, 24)} />
          <Rise at={fake + 14}>
            <Place x={FX} y={Y + 112}>
              <Tiny text="Fake" />
            </Place>
          </Rise>

          {/* the verdict settles on the fake */}
          <Rise at={f(CUE.smarter) - 2} dy={12} dur={20}>
            <Place x={FX} y={Y - 196} w={300}>
              <div style={{ padding: "9px 22px", borderRadius: 999, background: INK, color: "#000", fontFamily: FONT, fontSize: 14, fontWeight: 800, letterSpacing: "0.24em", boxShadow: "0 0 22px rgba(255,255,255,0.55)" }}>SMARTER BUY</div>
            </Place>
          </Rise>
        </>
      }
      screen={
        <Rise at={f(CUE.hook)} out={SCENES.hook.to - 20} dy={14} dur={22}>
          <Place x={960} y={130} w={1200}>
            <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 700, letterSpacing: "0.24em", color: INK, textShadow: "0 0 18px rgba(255,255,255,0.45)" }}>UNPOPULAR OPINION</div>
          </Place>
        </Rise>
      }
    />
  );
};
