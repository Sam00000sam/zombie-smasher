import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Card } from "../../v2/components/Card";
import { Halo } from "../../v2/components/Glow";
import { At, Label, Pill } from "../../v2/components/Text";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { P } from "../products";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const CW = 280;
const CH = 230;
const COLS = [640, 960, 1280];
const ROWS = [360, 630];
const ITEMS = [
  { kind: "sneakerStripes", hi: 180, lo: 28 },
  { kind: "handbag", hi: 950, lo: 60 },
  { kind: "sneakerHigh", hi: 260, lo: 40 },
  { kind: "sunglasses", hi: 320, lo: 22 },
  { kind: "watch", hi: 1200, lo: 45 },
  { kind: "cap", hi: 90, lo: 15 },
];
const SWATCHES = [
  ["#ffffff", "#7a7a7a", "none"],
  ["#bdbdbd", "none", "#ffffff"],
  ["none", "#ffffff", "#5a5a5a"],
];

/** Scene 3 — more choice: floating panels of styles, colours and designs. */
export const S2Choice: React.FC = () => {
  const fr = useCurrentFrame();
  const c0 = f(CUE.choice);
  const exp = f(CUE.expensive);
  return (
    <SceneLayer
      win={SCENES.choice}
      origin={ORIGIN.choice}
      fadeIn={XFADE}
      fadeOut={XFADE}
      push={0.025}
      camera={cameraAt}
      world={
        <>
          <At x={960} y={176} w={800}>
            <Label text="Styles · Colours · Designs" start={f(CUE.styles) - 4} size={14} />
          </At>
          {ITEMS.map((it, i) => {
            const cx = COLS[i % 3];
            const cy = ROWS[Math.floor(i / 3)];
            const st = c0 + 2 + i * 5;
            const bob = Math.sin((fr + i * 23) / 38) * 4;
            const priceO = prog(fr, exp + i * 3, 12);
            return (
              <div key={it.kind} style={{ position: "absolute", left: 0, top: bob, width: 1920, height: 1080 }}>
                {i === 2 && <Halo x={cx} y={cy} r={220} o={prog(fr, f(CUE.difficult), 16)} />}
                <Card x={cx - CW / 2} y={cy - CH / 2} w={CW} h={CH} start={st} title={`STYLE 0${i + 1}`} />
                <LineArt parts={P[it.kind]} p={prog(fr, st + 6, 30)} x={cx} y={cy - 4} size={150} width={2.2} />
                {/* colour swatches (kept monochrome, like the reference) */}
                {SWATCHES[i % 3].map((c, k) => (
                  <div
                    key={k}
                    style={{
                      position: "absolute",
                      left: cx - CW / 2 + 26 + k * 22,
                      top: cy + CH / 2 - 34,
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      background: c === "none" ? "transparent" : c,
                      border: `1.5px solid ${INK}`,
                      opacity: prog(fr, st + 14 + k * 3, 10),
                    }}
                  />
                ))}
                <div
                  style={{
                    position: "absolute",
                    left: cx + CW / 2 - 130,
                    width: 108,
                    top: cy + CH / 2 - 40,
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "baseline",
                    gap: 8,
                    fontFamily: FONT,
                    opacity: priceO,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#8f8f8f", textDecoration: "line-through", letterSpacing: "0.06em" }}>${it.hi}</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: INK, textShadow: "0 0 10px rgba(255,255,255,0.5)" }}>${it.lo}</span>
                </div>
                {i === 2 && (
                  <At x={cx} y={cy - CH / 2 - 16} w={260}>
                    <Pill text="Hard to find" start={f(CUE.difficult)} size={12} />
                  </At>
                )}
              </div>
            );
          })}
        </>
      }
    />
  );
};
