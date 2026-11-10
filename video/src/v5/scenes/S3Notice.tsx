import React from "react";
import { useCurrentFrame } from "remotion";
import { LineArt } from "../../v2/components/Draw";
import { Halo } from "../../v2/components/Glow";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { ArmsPawn } from "../../v3/fx2";
import { cameraAt } from "../camera";
import { P } from "../products";
import { p01, Rise } from "../smooth";
import { Place, Stat } from "../ui";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const FLOOR = 730;
const LANE = 590;
const PX = 900;

/** "And honestly, most people won't notice. Walk past a hundred strangers, and nobody is checking the stitching." */
export const S3Notice: React.FC = () => {
  const fr = useCurrentFrame();
  const n0 = f(CUE.notice);
  const walk = f(CUE.walk);
  const passEnd = f(CUE.stitching) + 6;
  const passed = Math.round(100 * p01(fr, walk, passEnd - walk));
  const nobody = p01(fr, f(CUE.nobody), 14);
  const stitch = p01(fr, f(CUE.nobody) + 6, 18);

  return (
    <SceneLayer
      win={SCENES.notice}
      origin={ORIGIN.notice}
      fadeIn={XFADE}
      fadeOut={XFADE}
      push={0}
      camera={cameraAt}
      world={
        <>
          {/* the street: a back lane of strangers and the front where our shopper stands */}
          <div style={{ position: "absolute", left: 300, top: LANE, width: 1320, borderTop: "1.5px dashed rgba(255,255,255,0.22)", opacity: p01(fr, n0, 20) }} />
          <div style={{ position: "absolute", left: 520, top: FLOOR, width: 760, borderTop: "1.5px dashed rgba(255,255,255,0.5)", opacity: p01(fr, n0, 20) }} />
          {Array.from({ length: 6 }, (_, i) => {
            const st = walk - 30 + i * 21;
            if (fr < st) return null;
            const x = 1720 - (fr - st) * 8;
            if (x < 220) return null;
            const edge = Math.min(1, (1720 - x) / 120, (x - 220) / 120);
            return (
              <div key={i} style={{ position: "absolute", left: 0, top: -Math.abs(Math.sin((fr - st) / 4.5)) * 4 }}>
                <ArmsPawn x={x} y={LANE} h={110} o={0.45 * edge} />
              </div>
            );
          })}

          <Halo x={PX} y={FLOOR - 110} r={230} o={p01(fr, n0 + 4, 20)} />
          <ArmsPawn x={PX} y={FLOOR} h={210} o={p01(fr, n0 + 4, 18)} />
          <LineArt parts={P.handbag} p={p01(fr, n0 + 8, 24)} x={PX + 92} y={FLOOR - 74} size={110} width={2.2} />

          {/* counters: plenty of people, zero noticing */}
          <Rise at={walk - 4} dur={18}>
            <Place x={720} y={170} w={320}>
              <Stat title="People passed" value={String(passed)} />
            </Place>
          </Rise>
          <Rise at={f(CUE.noticeWord) - 6} dur={18}>
            <Place x={1100} y={170} w={320}>
              <Stat title="Noticed" value="0" glow={nobody} />
            </Place>
          </Rise>

          {/* nobody is checking the stitching */}
          {stitch > 0 && (
            <>
              <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: stitch }}>
                <circle cx={PX + 92} cy={FLOOR - 62} r={6} fill={INK} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))" }} />
                <line x1={PX + 92} y1={FLOOR - 62} x2={PX + 92 + 170 * stitch} y2={FLOOR - 62 + 6 * stitch} stroke={INK} strokeWidth={1.6} strokeDasharray="4 6" />
              </svg>
              <div style={{ position: "absolute", left: PX + 266, top: FLOOR - 80, opacity: stitch, padding: "10px 18px", borderRadius: 10, border: `1.8px solid ${INK}`, background: "#000", fontFamily: FONT, fontSize: 16, fontWeight: 700, letterSpacing: "0.2em", color: INK, whiteSpace: "nowrap", boxShadow: "0 0 14px rgba(255,255,255,0.35)" }}>
                STITCHING · NOT CHECKED
              </div>
            </>
          )}
        </>
      }
    />
  );
};
