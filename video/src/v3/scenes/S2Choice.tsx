import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, lerp, prog } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Floor } from "../../v2/components/Glow";
import { At, Label } from "../../v2/components/Text";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { Counter, Padlock, Stamp } from "../fx";
import { ArmsPawn, Cursor, Ripple, Spark, Spotlight, Toggle } from "../fx2";
import { P } from "../products";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const KINDS = ["sneakerStripes", "handbag", "sneakerHigh", "sunglasses", "watch", "cap", "headphones", "earbuds", "sneaker", "phone"];
const GX = 620;
const GY = 300;
const CW = 118;
const CH = 100;
const GAP = 16;
const CASE = { x: 1430, y: 330, w: 210, h: 300 };

/** Scene 3 — flip the switch, a spark runs down the wire, the wall of styles lights up; the official piece stays locked. */
export const S2Choice: React.FC = () => {
  const fr = useCurrentFrame();
  const c0 = f(CUE.choice);
  const flip = c0 + 6;
  const sparkAt = flip + 4;
  const lit0 = sparkAt + 14;
  const exp = f(CUE.expensive);
  const dif = f(CUE.difficult);
  const find = f(CUE.find);
  const walkIn = prog(fr, f(15.4), 30, easeOut);
  const q = prog(fr, dif + 4, 6) * (1 - prog(fr, find + 6, 6));
  const raise = prog(fr, find + 8, 8, easeOut);

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
          <Spotlight
            keys={[
              { at: 0, x: 300, y: 440, r: 300 },
              { at: lit0, x: 950, y: 470, r: 520 },
              { at: exp, x: 1540, y: 470, r: 380 },
              { at: find + 6, x: 1000, y: 470, r: 640 },
            ]}
          />
          <Toggle x={300} y={440} start={SCENES.choice.from} onAt={flip} label="ON" />
          <Cursor path={[{ at: SCENES.choice.from, x: 440, y: 600 }, { at: flip - 2, x: 312, y: 470 }, { at: flip + 20, x: 380, y: 620 }]} clicks={[flip]} o={1 - prog(fr, flip + 16, 8)} />
          <Spark pts={[[334, 440], [470, 440], [470, 700], [GX + 2 * (CW + GAP) + CW / 2, 700], [GX + 2 * (CW + GAP) + CW / 2, GY + 3 * CH + 2 * GAP]]} start={sparkAt} dur={14} wireStart={SCENES.choice.from + 4} />

          {/* wall of styles: dim until the signal reaches it, then lights up cell by cell */}
          {Array.from({ length: 15 }, (_, i) => {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = GX + col * (CW + GAP);
            const y = GY + row * (CH + GAP);
            const order = Math.abs(col - 2) + (2 - row);
            const on = prog(fr, lit0 + order * 3, 6);
            return (
              <div key={i} style={{ position: "absolute", left: x, top: y, width: CW, height: CH, borderRadius: 12, border: `1.8px solid ${INK}`, background: "#000", opacity: lerp(0.28, 1, on) * prog(fr, SCENES.choice.from + 2 + i, 8), boxShadow: on > 0 ? `0 0 ${8 + on * 18}px rgba(255,255,255,${0.15 + on * 0.4})` : undefined }}>
                <LineArt parts={P[KINDS[i % KINDS.length]]} p={on} x={CW / 2} y={CH / 2} size={86} width={2} />
              </div>
            );
          })}
          <Ripple x={GX + 2 * (CW + GAP) + CW / 2} y={GY + 3 * CH + 2 * GAP} at={lit0} r={120} />
          <At x={GX + 327} y={250} w={600}>
            <Label text="Styles · Designs" start={f(CUE.styles) - 2} size={14} />
          </At>
          <div style={{ position: "absolute", left: GX, top: 660, display: "flex", alignItems: "baseline", gap: 14, opacity: prog(fr, f(CUE.designs), 8) }}>
            <Label text="Styles available" start={f(CUE.designs)} size={12} />
            <Counter value={142} start={f(CUE.designs)} dur={26} size={30} />
          </div>

          {/* the official piece: expensive, locked, sold out */}
          <div style={{ position: "absolute", left: CASE.x, top: CASE.y, width: CASE.w, height: CASE.h, borderRadius: 14, border: `2px solid ${INK}`, background: "rgba(255,255,255,0.03)", opacity: prog(fr, f(15.0), 14), boxShadow: "0 0 14px rgba(255,255,255,0.3)" }}>
            <div style={{ position: "absolute", left: 18, top: 14, fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.26em", color: INK }}>OFFICIAL</div>
            <div style={{ position: "absolute", left: 30, right: 30, top: 214, height: 2, background: INK, opacity: 0.8 }} />
            <LineArt parts={P.handbag} p={prog(fr, f(15.1), 24)} x={CASE.w / 2} y={150} size={150} width={2.2} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center" }}>
              {fr >= exp && <Counter value={950} start={exp} dur={14} prefix="$" size={36} />}
            </div>
          </div>
          <Padlock x={CASE.x + CASE.w - 24} y={CASE.y + 22} start={exp + 8} openAt={99999} size={40} />
          <Stamp x={CASE.x + CASE.w / 2} y={CASE.y + 150} text="SOLD OUT" start={dif} size={22} />
          <Ripple x={CASE.x + CASE.w / 2} y={CASE.y + 150} at={dif + 2} r={150} />
          <Floor x={1600} y={690} w={420} p={prog(fr, f(15.0), 16)} o={0.4} />
          <ArmsPawn x={lerp(1960, 1730, walkIn)} y={690} h={150} o={prog(fr, f(15.4), 8)} hop={walkIn < 1 ? Math.abs(Math.sin(fr * 0.5)) * 6 : raise * 8} q={q} raise={raise} />
        </>
      }
    />
  );
};
