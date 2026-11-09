import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../anim";
import { LineArt } from "../components/Draw";
import { PRODUCTS } from "../components/Products";
import { Icon } from "../components/Icon";
import { Hairline, Panel } from "../components/Panel";
import { At, GlowText, Label } from "../components/Text";
import { Kicker, SceneLayer } from "../components/SceneLayer";
import { CUE, f, ORIGIN, SCENES } from "../timing";
import { FONT, INK, WARN } from "../theme";

const PX = 700;
const PY = 280;
const PW = 1060;
const PH = 470;
const COL_X = [1110, 1365, 1620];
const HEAD_Y = 322;
const ROW_Y0 = 432;
const ROW_STEP = 80;

type Cell = "check" | "varies" | "warn";
const ROWS: { label: string; cue: () => number; cells: [Cell, Cell, Cell] }[] = [
  { label: "Safety", cue: () => CUE.safer, cells: ["check", "check", "warn"] },
  { label: "Warranty", cue: () => CUE.warranties, cells: ["check", "check", "warn"] },
  { label: "Quality", cue: () => CUE.qualityControl, cells: ["check", "varies", "warn"] },
  { label: "Reliability", cue: () => CUE.control, cells: ["check", "varies", "warn"] },
];

const CellView: React.FC<{ kind: Cell; x: number; y: number; start: number }> = ({ kind, x, y, start }) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 14);
  if (kind === "check") return <Icon name="check" x={x} y={y} p={p} size={30} width={2.4} />;
  if (kind === "warn") return <Icon name="warn" x={x} y={y} p={p} size={28} width={2} color={WARN} />;
  return (
    <>
      <Icon name="varies" x={x - 42} y={y} p={p} size={26} width={2.2} />
      <div style={{ position: "absolute", left: x - 22, top: y - 10, fontFamily: FONT, fontSize: 15, letterSpacing: "0.2em", color: "#bdbdbd", opacity: prog(fr, start + 4, 10) }}>
        VARIES
      </div>
    </>
  );
};

export const S4Reality: React.FC = () => {
  const fr = useCurrentFrame();
  const r1 = f(CUE.reality1);
  const cf = f(CUE.counterfeits);
  const r2 = f(CUE.reality2);

  return (
    <SceneLayer
      win={SCENES.reality}
      origin={ORIGIN.reality}
      fadeIn={24}
      fadeOut={24}
      world={
        <>
          {/* the counterfeit: dashed, unreliable copy */}
          <LineArt parts={PRODUCTS.headphones} p={prog(fr, cf - 4, 30)} x={380} y={500} size={250} dashed width={2.2} opacity={0.9} />
          <Icon name="warn" x={492} y={384} p={prog(fr, cf + 16, 16)} size={44} width={2.2} color={WARN} />
          <At x={380} y={624} w={420}>
            <Label text="Counterfeit" start={cf + 10} color={INK} size={18} weight={600} />
          </At>
          <At x={380} y={656} w={420}>
            <Label text="Copies a brand's logo" start={cf + 18} size={14} spacing="0.22em" />
          </At>

          {/* checklist panel */}
          <Panel x={PX} y={PY} w={PW} h={PH} p={prog(fr, r2 - 8, 26)} />
          {["Genuine", "Legit alternative", "Counterfeit"].map((h, i) => (
            <At key={h} x={COL_X[i]} y={HEAD_Y} w={250}>
              <Label text={h} start={r2 + 4 + i * 5} size={14} spacing="0.22em" color={i === 2 ? WARN : INK} weight={600} />
            </At>
          ))}
          <Hairline x={PX + 40} y={HEAD_Y + 48} w={PW - 80} p={prog(fr, r2 + 6, 20)} opacity={0.25} />
          {ROWS.map((r, i) => {
            const c = f(r.cue());
            const y = ROW_Y0 + i * ROW_STEP;
            return (
              <React.Fragment key={r.label}>
                <div style={{ position: "absolute", left: PX + 44, top: y - 12 }}>
                  <Label text={r.label} start={c} color={INK} size={18} weight={600} spacing="0.24em" />
                </div>
                {r.cells.map((cell, ci) => (
                  <CellView key={ci} kind={cell} x={COL_X[ci]} y={y} start={c + 3 + ci * 4} />
                ))}
                {i < ROWS.length - 1 && <Hairline x={PX + 40} y={y + ROW_STEP / 2} w={PW - 80} p={prog(fr, c + 6, 16)} opacity={0.1} />}
              </React.Fragment>
            );
          })}
        </>
      }
      screen={
        <>
          <Kicker n="04" title="The reality check" start={SCENES.reality.from + 10} out={SCENES.reality.to - 24} />
          <At x={960} y={110} w={1700}>
            <GlowText text="COUNTERFEITS AREN'T ALWAYS BETTER." start={r1 + 2} size={46} stagger={0.7} />
          </At>
          <At x={960} y={182} w={1600}>
            <Label text="A legitimate affordable alternative is not a counterfeit" start={cf + 22} size={16} />
          </At>
        </>
      }
    />
  );
};
