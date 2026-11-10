import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, prog } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Halo } from "../../v2/components/Glow";
import { At, Label } from "../../v2/components/Text";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, GLOW, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { Padlock, Stamp } from "../fx";
import { P } from "../products";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const CW = 236;
const CH = 196;
const PITCH = 290;
const KINDS = ["sneakerStripes", "handbag", "sneakerHigh", "sunglasses", "watch", "cap", "headphones", "earbuds"];
const HI = [180, 950, 260, 320, 1200, 90, 349, 179];
const LO = [28, 60, 40, 22, 45, 15, 39, 29];
const ROWS = [
  { y: 330, dir: -1, shift: 0 },
  { y: 590, dir: 1, shift: 3 },
];
const N_CARDS = 12;

/** Conveyor offset (px): constant speed, then eases to a stop. */
const conveyor = (fr: number, s0: number, stopAt: number, ease: number, v: number) => {
  const t = fr - s0;
  const t1 = stopAt - s0;
  if (t <= t1) return v * t;
  const d = Math.min(t - t1, ease);
  return v * t1 + v * d - (v * d * d) / (2 * ease);
};

/** Scene 3 — more choice: two conveyor rows of styles stream past, lock up, sell out, then unlock. */
export const S2Choice: React.FC = () => {
  const fr = useCurrentFrame();
  const s0 = SCENES.choice.from;
  const stop = f(CUE.expensive) - 16;
  const exp = f(CUE.expensive);
  const dif = f(CUE.difficult);
  const unlock = f(CUE.difficult) + 16;
  const off = conveyor(fr, s0, stop, 16, 8);

  return (
    <SceneLayer
      win={SCENES.choice}
      origin={ORIGIN.choice}
      fadeIn={XFADE}
      fadeOut={XFADE}
      push={0.02}
      camera={cameraAt}
      world={
        <>
          <At x={960} y={150} w={900}>
            <Label text="Styles · Colours · Designs" start={f(CUE.styles) - 4} size={15} />
          </At>
          {ROWS.map((row, ri) =>
            Array.from({ length: N_CARDS }, (_, i) => {
              const base = (i - 2) * PITCH + (ri ? 145 : 0);
              const span = N_CARDS * PITCH;
              const x = ((((base + row.dir * off) % span) + span) % span) - 2 * PITCH + 120;
              if (x < -CW || x > 1920 + CW) return null;
              const k = (i + row.shift) % KINDS.length;
              const centre = Math.max(0, 1 - Math.abs(x - 960) / 520);
              const visible = x > 140 && x < 1780;
              const id = ri * N_CARDS + i;
              const lockAt = exp + (id % 6) * 2;
              const soldOut = visible && id % 3 === 1;
              const opened = fr >= unlock;
              const appear = prog(fr, s0 + 4 + (id % 6) * 3, 14, easeOut);
              return (
                <div key={`${ri}-${i}`} style={{ position: "absolute", left: x - CW / 2, top: row.y - CH / 2, width: CW, height: CH, opacity: appear, transform: `scale(${1 + centre * 0.06})` }}>
                  {centre > 0.6 && <Halo x={CW / 2} y={CH / 2} r={180} o={(centre - 0.6) * 2.5 * (1 - prog(fr, stop, 10))} />}
                  <div style={{ position: "absolute", inset: 0, borderRadius: 16, border: `2px solid ${INK}`, boxShadow: "0 0 12px rgba(255,255,255,0.3)", background: "#000" }} />
                  <div style={{ position: "absolute", left: 16, top: 12, fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.26em", color: INK }}>{`STYLE ${String(k + 1).padStart(2, "0")}`}</div>
                  <LineArt parts={P[KINDS[k]]} p={1} x={CW / 2} y={CH / 2 - 6} size={130} width={2.2} />
                  {/* price strip */}
                  {visible && fr >= exp && (
                    <div style={{ position: "absolute", left: 16, right: 16, bottom: 12, display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 8, fontFamily: FONT }}>
                      <span style={{ fontSize: opened ? 12 : 18, fontWeight: opened ? 500 : 700, color: opened ? "#8f8f8f" : INK, textDecoration: opened ? "line-through" : undefined }}>${HI[k]}</span>
                      {opened && <span style={{ fontSize: 20, fontWeight: 700, color: INK, textShadow: "0 0 10px rgba(255,255,255,0.6)" }}>${LO[k]}</span>}
                    </div>
                  )}
                  {visible && <Padlock x={CW - 26} y={30} start={lockAt} openAt={unlock + (id % 4) * 2} size={34} />}
                  {soldOut && fr < unlock + 8 && <Stamp x={CW / 2} y={CH / 2} text="SOLD OUT" start={dif + (id % 4) * 3} size={17} />}
                </div>
              );
            }),
          )}
          {/* "unlocked" sweep */}
          {fr >= unlock && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center", filter: GLOW }}>
              <Label text="Unlocked for less" start={unlock + 6} size={14} />
            </div>
          )}
        </>
      }
    />
  );
};
