import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, lerp, prog } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Floor, Halo } from "../../v2/components/Glow";
import { At, Label, Pill } from "../../v2/components/Text";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { Callout, Counter, FlyingCoin, HangingTag, Magnifier, Scanner, TagBody, Wallet } from "../fx";
import { P } from "../products";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const GX = 620;
const FX = 1300;
const PY = 460;
const PS = 300;

/** Slammed-in title (scale down + unblur). */
export const SlamTitle: React.FC<{ text: string; start: number; out?: number; size?: number; y: number }> = ({ text, start, out, size = 42, y }) => {
  const fr = useCurrentFrame();
  const s = prog(fr, start, 9, easeOut);
  const o = out === undefined ? 1 : 1 - prog(fr, out, 10);
  if (s <= 0 || o <= 0) return null;
  return (
    <At x={960} y={y} w={1800}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: "0.2em",
          color: INK,
          whiteSpace: "nowrap",
          transform: `scale(${lerp(1.5, 1, s)})`,
          opacity: s * o,
          filter: s < 1 ? `blur(${(1 - s) * 8}px)` : o < 1 ? `blur(${(1 - o) * 8}px)` : undefined,
          textShadow: "0 0 20px rgba(255,255,255,0.55), 0 0 4px rgba(255,255,255,0.4)",
        }}
      >
        {text}
      </div>
    </At>
  );
};

/** A match bar that fills to a percentage with a counting readout. */
const MatchRow: React.FC<{ y: number; label: string; pct: number; start: number }> = ({ y, label, pct, start }) => {
  const fr = useCurrentFrame();
  const p = prog(fr, start, 22, easeOut);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 720, top: y, width: 480 }}>
      <Label text={label} start={start} size={12} />
      <div style={{ position: "absolute", left: 0, top: 26, width: 380, height: 0, borderTop: "1px dashed rgba(255,255,255,0.25)" }} />
      <div style={{ position: "absolute", left: 0, top: 23, width: 380 * (pct / 100) * p, height: 6, borderRadius: 3, background: INK, boxShadow: "0 0 12px rgba(255,255,255,0.7)" }} />
      <div style={{ position: "absolute", left: 400, top: 4 }}>
        <Counter value={pct} start={start} dur={22} suffix="%" size={28} />
      </div>
    </div>
  );
};

/** Scenes 1–2: inspect the fake, reveal the matchup, swing in the prices, scan, and count the savings. */
export const S1Compare: React.FC = () => {
  const fr = useCurrentFrame();
  const h = f(CUE.hook);
  const but = f(2.5);
  const reveal = prog(fr, but, 20); // pull back to the matchup
  const fx = lerp(960, FX, reveal);
  const fs = lerp(400, PS, reveal);
  const fy = lerp(430, PY, reveal);
  const magX = lerp(760, 1080, prog(fr, f(0.9), f(1.5)));
  const magO = prog(fr, f(0.75), 8) * (1 - prog(fr, but - 4, 8));
  const vsO = prog(fr, f(2.9), 12) * (1 - prog(fr, f(CUE.without) - 6, 10));
  const scan0 = f(CUE.similar) - 8;
  const matchO = 1 - prog(fr, f(CUE.without) - 6, 8);
  const w0 = f(CUE.without);
  const advOut = f(5.5);

  return (
    <SceneLayer
      win={SCENES.compare}
      origin={ORIGIN.compare}
      fadeOut={XFADE}
      push={0}
      camera={cameraAt}
      world={
        <>
          {/* cold open: the fake under the magnifying glass */}
          <Halo x={fx} y={fy + 20} r={lerp(330, 250, reveal)} o={prog(fr, h, 30)} />
          <LineArt parts={P.sneakerFake} p={prog(fr, h, 34)} x={fx} y={fy} size={fs} width={2.6} />
          <Magnifier x={magX} y={455} o={magO} />
          <Callout px={890} py={470} lx={720} ly={330} text="UNEVEN STITCHING" start={f(CUE.hook) + 22} out={but - 6} />
          <Callout px={1016} py={455} lx={1170} ly={330} text="LOGO SLIGHTLY OFF" start={f(1.7)} out={but - 6} />

          {/* the matchup */}
          <Halo x={GX} y={PY + 20} r={250} o={reveal} />
          <LineArt parts={P.sneakerGenuine} p={prog(fr, but + 4, 30)} x={GX} y={PY} size={PS} width={2.6} />
          <Floor x={GX} y={PY + 78} w={360} p={prog(fr, but + 10, 20)} />
          <Floor x={FX} y={PY + 78} w={360} p={prog(fr, but + 10, 20)} />
          <At x={GX} y={PY + 98} w={300}>
            <Label text="Genuine" start={but + 14} size={14} />
          </At>
          <At x={FX} y={PY + 98} w={300}>
            <Label text="Fake" start={but + 18} size={14} />
          </At>
          <div style={{ position: "absolute", left: 959, top: 330, width: 2, height: 260 * prog(fr, f(2.9), 16), background: INK, opacity: vsO, boxShadow: "0 0 10px rgba(255,255,255,0.9), 0 0 26px rgba(255,255,255,0.4)" }} />
          <div style={{ position: "absolute", left: 936, top: 436, width: 48, height: 48, borderRadius: 24, background: "#000", border: `1.5px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: INK, opacity: prog(fr, f(3.1), 8) * vsO, boxShadow: "0 0 16px rgba(255,255,255,0.5)" }}>VS</div>

          {/* "surprising advantages" pop around the fake */}
          {[
            { t: "Lower price", x: FX, y: 312, at: f(CUE.surprising) + 2 },
            { t: "More styles", x: FX + 250, y: 418, at: f(CUE.surprising) + 10 },
            { t: "Easy to get", x: FX + 250, y: 510, at: f(CUE.surprising) + 18 },
          ].map((a, i) => (
            <div key={a.t} style={{ position: "absolute", left: 0, top: Math.sin((fr + i * 17) / 9) * 4 }}>
              <At x={a.x} y={a.y} w={260}>
                <Pill text={a.t} start={a.at} size={13} out={advOut} />
              </At>
            </div>
          ))}

          {/* price tags drop in and swing */}
          <HangingTag x={GX} top={46} len={60} start={f(CUE.price) + 6} swing={18}>
            <TagBody label="Genuine" value={240} start={f(CUE.price) + 6} big={60} w={230} />
          </HangingTag>
          <HangingTag x={FX} top={46} len={60} start={f(CUE.priceWord) - 6} swing={-12}>
            <TagBody label="Fake" value={35} start={f(CUE.priceWord) - 6} big={44} w={180} />
          </HangingTag>

          {/* scan: similar look + basic function */}
          <Scanner x0={430} x1={1490} y={360} h={200} start={scan0} dur={26} />
          <div style={{ position: "absolute", inset: 0, opacity: matchO }}>
            <MatchRow y={628} label="Look match" pct={92} start={f(CUE.similar)} />
            <MatchRow y={698} label="Basic function" pct={90} start={f(CUE.basic)} />
          </div>

          {/* savings: coins fly from the wallet */}
          <Wallet x={960} y={712} p={prog(fr, w0, 14)} open={prog(fr, w0 + 6, 8)} />
          {Array.from({ length: 7 }, (_, i) => (
            <FlyingCoin key={i} from={[960, 690]} to={[GX, 200]} start={w0 + 10 + i * 3} dur={18} lift={180} />
          ))}
          <FlyingCoin from={[960, 690]} to={[FX, 190]} start={w0 + 22} dur={18} lift={180} />
          <div style={{ position: "absolute", left: 1090, top: 676, opacity: prog(fr, w0 + 30, 10), display: "flex", flexDirection: "column", gap: 2 }}>
            <Label text="You keep" start={w0 + 30} size={12} />
            <Counter value={205} start={w0 + 30} dur={22} prefix="$" size={46} />
          </div>
        </>
      }
      screen={<SlamTitle text="WHY FAKE CAN BE BETTER" start={but + 2} out={f(CUE.price) - 6} y={92} />}
    />
  );
};
