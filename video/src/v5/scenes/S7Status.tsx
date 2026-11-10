import React from "react";
import { useCurrentFrame } from "remotion";
import { lerp } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Card } from "../../v2/components/Card";
import { Halo } from "../../v2/components/Glow";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { ArmsPawn } from "../../v3/fx2";
import { cameraAt } from "../camera";
import { P } from "../products";
import { p01, Rise } from "../smooth";
import { Place, Tiny, WhitePill } from "../ui";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const PX = 820;
const FLOOR = 740;

/** "Because real status isn't a logo on your arm. It's knowing you didn't overpay for one." */
export const S7Status: React.FC = () => {
  const fr = useCurrentFrame();
  const s0 = f(CUE.status);
  const logoAt = f(CUE.logoArm) - 8;
  const isnt = f(CUE.isnt);
  const know = f(CUE.knowing);
  const over = f(CUE.overpay);
  const strike = p01(fr, isnt + 4, 16);
  const logoOut = p01(fr, know - 4, 18);
  const raise = p01(fr, over - 2, 16);

  return (
    <SceneLayer
      win={SCENES.status}
      origin={ORIGIN.status}
      fadeIn={XFADE}
      fadeOut={XFADE}
      push={0}
      camera={cameraAt}
      world={
        <>
          <div style={{ position: "absolute", left: PX - 170, top: FLOOR, width: 340, borderTop: "1.5px dashed rgba(255,255,255,0.5)", opacity: p01(fr, s0 - 6, 18) }} />
          <Halo x={PX} y={FLOOR - 120} r={240} o={p01(fr, s0 - 6, 20)} />
          <ArmsPawn x={PX} y={FLOOR} h={230} o={p01(fr, s0 - 6, 18)} raise={raise} hop={raise * 10} />
          <LineArt parts={P.handbag} p={p01(fr, s0, 24)} x={PX + 100} y={FLOOR - 80 - raise * 10} size={116} width={2.2} />

          {/* the logo as "status" — then struck out */}
          <div style={{ position: "absolute", inset: 0, opacity: 1 - logoOut }}>
            <Halo x={PX + 100} y={FLOOR - 300} r={170} o={p01(fr, logoAt, 18) * lerp(1, 0.3, strike)} />
            <LineArt parts={P.crest} p={p01(fr, logoAt, 22)} x={PX + 100} y={FLOOR - 300} size={150} width={2.4} opacity={lerp(1, 0.45, strike)} />
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
              <line x1={PX + 30} y1={FLOOR - 360} x2={PX + 30 + 140 * strike} y2={FLOOR - 360 + 120 * strike} stroke={INK} strokeWidth={4} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9))" }} />
            </svg>
            <Rise at={isnt + 6}>
              <Place x={PX + 100} y={FLOOR - 210} w={300}>
                <Tiny text="≠ status" size={17} />
              </Place>
            </Rise>
          </div>

          {/* didn't overpay */}
          <Rise at={over - 4} dur={18} dy={12}>
            <Place x={PX} y={FLOOR - 340} w={420}>
              <WhitePill text="Didn't overpay" />
            </Place>
          </Rise>
          <Rise at={know} dur={22}>
            <Card x={1130} y={330} w={320} h={250} start={know} title="RECEIPT" titleSize={16} />
            <LineArt parts={P.receipt} p={p01(fr, know + 4, 24)} x={1200} y={460} size={110} width={2} />
            <div style={{ position: "absolute", left: 1270, top: 400, fontFamily: FONT, color: INK }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.22em" }}>PAID</div>
              <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 10 }}>$90</div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.22em", opacity: p01(fr, over, 14) }}>SAVED</div>
              <div style={{ fontSize: 36, fontWeight: 700, opacity: p01(fr, over, 14), textShadow: "0 0 14px rgba(255,255,255,0.6)" }}>$1,110</div>
            </div>
          </Rise>
        </>
      }
    />
  );
};
