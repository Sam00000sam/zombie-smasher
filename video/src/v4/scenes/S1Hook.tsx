import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, lerp, prog } from "../../v2/anim";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { ArmsPawn, Cursor, Ripple, Spotlight } from "../../v3/fx2";
import { Pill } from "../../v2/components/Text";
import { SlamTitle } from "../../v3/scenes/S1Compare";
import { cameraAt } from "../camera";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const CX = 620;
const CY = 270;
const CW = 680;
const CH = 330;

/** Scene 1 — a live poll on the unpopular opinion; "agree" overtakes on "smarter buy". */
export const S1Hook: React.FC = () => {
  const fr = useCurrentFrame();
  const sm = f(CUE.smarter);
  const flip = prog(fr, sm - 6, 14, easeOut);
  const agree = lerp(43 + Math.sin(fr / 5) * 3, 64 + Math.sin(fr / 7) * 1.2, flip);
  const votes = Math.round(9800 + fr * 37 + Math.sin(fr) * 5);
  const bar = (y: number, label: string, pct: number, strong: boolean) => (
    <div style={{ position: "absolute", left: 40, right: 40, top: y }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 15, fontWeight: 700, letterSpacing: "0.24em", color: INK }}>
        <span>{label}</span>
        <span style={{ fontVariantNumeric: "tabular-nums", textShadow: strong ? "0 0 12px rgba(255,255,255,0.7)" : undefined }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ position: "relative", marginTop: 10, height: 14, borderRadius: 7, border: "1.5px solid rgba(255,255,255,0.7)" }}>
        <div style={{ position: "absolute", left: 2, top: 2, bottom: 2, width: `calc(${pct}% - 4px)`, borderRadius: 5, background: INK, boxShadow: strong ? "0 0 16px rgba(255,255,255,0.8)" : undefined, opacity: strong ? 1 : 0.55 }} />
      </div>
    </div>
  );
  return (
    <SceneLayer
      win={SCENES.hook}
      origin={ORIGIN.hook}
      fadeOut={XFADE}
      push={0.03}
      camera={cameraAt}
      world={
        <>
          <Spotlight keys={[{ at: 0, x: 960, y: 430, r: 520 }, { at: sm, x: 900, y: 420, r: 420 }]} />
          <div style={{ position: "absolute", left: CX, top: CY, width: CW, height: CH, borderRadius: 18, border: `2px solid ${INK}`, background: "#000", boxShadow: "0 0 16px rgba(255,255,255,0.3)" }}>
            <div style={{ position: "absolute", left: 40, top: 26, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: 13, background: INK, boxShadow: "0 0 10px rgba(255,255,255,0.7)" }} />
              <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.26em", color: INK }}>POLL · LIVE</div>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: INK, opacity: 0.4 + 0.6 * Math.abs(Math.sin(fr / 6)) }} />
            </div>
            <div style={{ position: "absolute", left: 40, top: 74, fontFamily: FONT, fontSize: 24, fontWeight: 600, letterSpacing: "0.04em", color: INK }}>Is the fake the smarter buy?</div>
            {bar(132, "AGREE", agree, flip > 0.5)}
            {bar(204, "DISAGREE", 100 - agree, flip <= 0.5)}
            <div style={{ position: "absolute", left: 40, bottom: 22, fontFamily: FONT, fontSize: 13, fontWeight: 600, letterSpacing: "0.24em", color: "#9a9a9a", fontVariantNumeric: "tabular-nums" }}>{votes.toLocaleString("en-US")} VOTES</div>
          </div>
          <Ripple x={CX + 120} y={CY + 152} at={sm} r={90} />
          <div style={{ position: "absolute", left: CX + CW - 150, top: CY - 18 }}>
            <Pill text="Winning" start={sm + 4} size={12} />
          </div>
          {/* live reactions floating off the card */}
          {Array.from({ length: 6 }, (_, i) => {
            const t = (((fr + i * 11) % 66) + 66) % 66 / 66;
            return (
              <div key={i} style={{ position: "absolute", left: CX + CW + 20 + (i % 3) * 26 + Math.sin(t * 7 + i) * 8, top: CY + CH - 30 - t * 240, opacity: Math.sin(t * Math.PI) * 0.9, fontFamily: FONT, fontSize: 18, fontWeight: 800, color: INK, textShadow: "0 0 10px rgba(255,255,255,0.7)" }}>
                {i % 2 ? "▲" : "+1"}
              </div>
            );
          })}
          <ArmsPawn x={420} y={700} h={160} raise={prog(fr, sm + 2, 8, easeOut)} hop={prog(fr, sm + 2, 8) * 8} />
          <div style={{ position: "absolute", left: 300, top: 700, width: 240, height: 0, borderTop: "1.5px dashed rgba(255,255,255,0.45)" }} />
          <Cursor path={[{ at: 0, x: 1200, y: 560 }, { at: f(1.6), x: 900, y: 470 }, { at: sm - 8, x: 760, y: 420 }, { at: sm + 20, x: 820, y: 520 }]} clicks={[sm - 6]} o={1 - prog(fr, sm + 16, 8)} />
        </>
      }
      screen={<SlamTitle text="UNPOPULAR OPINION" start={f(CUE.hook)} out={SCENES.hook.to - 16} y={96} size={44} />}
    />
  );
};
