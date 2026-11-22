import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../anim";
import { LineArt } from "../components/Draw";
import { PRODUCTS, ICONS } from "../components/Products";
import { Card, Checkbox } from "../components/Card";
import { Floor, Halo } from "../components/Glow";
import { At, GlowText, Label, Pill } from "../components/Text";
import { SceneLayer } from "../components/SceneLayer";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";
import { FONT } from "../theme";

const CX = 790;
const CY = 300;
const CW = 920;
const CH = 420;
const COL_X = [1210, 1420, 1610];
const ROW_Y0 = 446;
const ROW_STEP = 74;

type Mark = "check" | "varies" | "warn";
const ROWS: { label: string; cue: () => number; cells: [Mark, Mark, Mark] }[] = [
  { label: "Safety", cue: () => CUE.safer, cells: ["check", "check", "warn"] },
  { label: "Warranty", cue: () => CUE.warranties, cells: ["check", "check", "warn"] },
  { label: "Quality", cue: () => CUE.qualityControl, cells: ["check", "varies", "warn"] },
  { label: "Reliability", cue: () => CUE.control, cells: ["check", "varies", "warn"] },
];

export const S4Reality: React.FC = () => {
  const fr = useCurrentFrame();
  const r1 = f(CUE.reality1);
  const cf = f(CUE.counterfeits);
  const r2 = f(CUE.reality2);

  return (
    <SceneLayer
      win={SCENES.reality}
      origin={ORIGIN.reality}
      fadeIn={XFADE}
      fadeOut={XFADE}
      world={
        <>
          {/* the counterfeit: a dashed, unverified copy */}
          <Halo x={440} y={520} r={230} o={prog(fr, cf - 6, 24) * 0.8} />
          <LineArt parts={PRODUCTS.headphones} p={prog(fr, cf - 6, 28)} x={440} y={520} size={250} dashed width={2} />
          <Floor x={440} y={632} w={300} p={prog(fr, cf, 20)} o={0.35} />
          <At x={440} y={352} w={300}>
            <Pill text="Counterfeit" start={cf + 8} size={13} />
          </At>
          <LineArt parts={ICONS.warn} p={prog(fr, cf + 14, 16)} x={440} y={670} size={34} viewBox={24} width={2} spread={0.3} />
          <At x={440} y={700} w={360}>
            <Label text="Unverified copy" start={cf + 18} size={12} color="#9a9a9a" />
          </At>

          {/* checklist clipboard */}
          <Card x={CX} y={CY} w={CW} h={CH} start={r2 - 10} clip title="CHECKLIST" />
          {["Genuine", "Legit alt.", "Counterfeit"].map((h, i) => (
            <At key={h} x={COL_X[i]} y={CY + 34} w={200}>
              <Label text={h} start={r2 + 2 + i * 4} size={12} color={i === 2 ? "#bdbdbd" : "#ffffff"} />
            </At>
          ))}
          <div style={{ position: "absolute", left: CX + 28, top: CY + 74, width: (CW - 56) * prog(fr, r2 + 6, 18), height: 1, background: "rgba(255,255,255,0.25)" }} />
          {ROWS.map((r, i) => {
            const c = f(r.cue());
            const y = ROW_Y0 + i * ROW_STEP;
            return (
              <React.Fragment key={r.label}>
                <div style={{ position: "absolute", left: CX + 28, top: y - 9 }}>
                  <Label text={r.label} start={c - 2} size={14} />
                </div>
                {r.cells.map((m, ci) => (
                  <Checkbox key={ci} x={COL_X[ci]} y={y} start={c + ci * 4} mark={m} />
                ))}
                {r.cells[1] === "varies" && (
                  <div style={{ position: "absolute", left: COL_X[1] + 22, top: y - 7, fontFamily: FONT, fontSize: 10, fontWeight: 600, letterSpacing: "0.24em", color: "#9a9a9a", opacity: prog(fr, c + 10, 10) }}>
                    VARIES
                  </div>
                )}
                {i < ROWS.length - 1 && (
                  <div style={{ position: "absolute", left: CX + 28, top: y + ROW_STEP / 2, width: (CW - 56) * prog(fr, c + 4, 14), height: 1, background: "rgba(255,255,255,0.08)" }} />
                )}
              </React.Fragment>
            );
          })}
        </>
      }
      screen={
        <>
          <At x={960} y={104} w={1700}>
            <GlowText text="COUNTERFEITS AREN'T ALWAYS BETTER." start={r1 + 2} size={34} stagger={0.55} />
          </At>
          <At x={960} y={162} w={1600}>
            <Label text="A legitimate alternative is not a counterfeit" start={cf + 20} size={13} color="#a0a0a0" />
          </At>
        </>
      }
    />
  );
};
