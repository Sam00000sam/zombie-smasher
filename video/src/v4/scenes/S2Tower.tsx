import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { easeOut, lerp, prog } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Floor, Halo } from "../../v2/components/Glow";
import { At, Label } from "../../v2/components/Text";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, GLOW, INK } from "../../v2/theme";
import { Counter, HangingTag, Scanner } from "../../v3/fx";
import { Ripple, Spark, Spotlight } from "../../v3/fx2";
import { cameraAt } from "../camera";
import { P } from "../products";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const GX = 470;
const FX = 900;
const BY = 560;
const TX = 1390;
const BASE = 790;
const TW = 250;
const BLOCKS = [
  { k: "product", label: "Product", amt: 90, h: 50, icon: "handbag", cue: () => CUE.product },
  { k: "logo", label: "Logo", amt: 520, h: 150, icon: "crest", cue: () => CUE.logo },
  { k: "ads", label: "Ads", amt: 280, h: 106, icon: "megaphone", cue: () => CUE.ads },
  { k: "store", label: "Store", amt: 310, h: 124, icon: "store", cue: () => CUE.store },
];

/** A live price tag: hangs on a string, value animates between numbers. */
const LiveTag: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div style={{ position: "relative", width: 210, padding: "24px 0 14px", border: `2px solid ${INK}`, borderRadius: 16, background: "#000", boxShadow: "0 0 14px rgba(255,255,255,0.35)", textAlign: "center", fontFamily: FONT, color: INK }}>
    <div style={{ position: "absolute", left: "50%", top: 8, width: 10, height: 10, marginLeft: -5, borderRadius: 5, border: `2px solid ${INK}` }} />
    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.3em" }}>{label.toUpperCase()}</div>
    <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.05, fontVariantNumeric: "tabular-nums", textShadow: "0 0 14px rgba(255,255,255,0.55)" }}>${Math.round(value).toLocaleString("en-US")}</div>
  </div>
);

/** Scenes 2–3 — the price tower (product, logo, ads, store), then strip it back to the product = the copy. */
export const S2Tower: React.FC = () => {
  const fr = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s0 = SCENES.tower.from;
  const lux = f(CUE.luxury);
  const take = f(CUE.copy);
  const beam = take + 18;
  const look = f(CUE.look);
  const frac = f(CUE.fraction);
  const tagVal = 1200 * prog(fr, lux, 22, easeOut);
  const totalO = prog(fr, f(CUE.store) + 10, 10) * (1 - prog(fr, take, 8));

  let y = BASE;
  const placed = BLOCKS.map((b) => {
    y -= b.h;
    return { ...b, top: y };
  });

  return (
    <SceneLayer
      win={SCENES.tower}
      origin={ORIGIN.tower}
      fadeIn={XFADE}
      fadeOut={XFADE}
      push={0.02}
      camera={cameraAt}
      world={
        <>
          <Spotlight
            keys={[
              { at: s0, x: GX, y: 470, r: 360 },
              { at: f(CUE.product), x: TX, y: 560, r: 420 },
              { at: take + 10, x: 700, y: 480, r: 620 },
              { at: frac, x: TX, y: 470, r: 360 },
            ]}
          />
          {/* the genuine bag and its price */}
          <Halo x={GX} y={BY} r={250} o={prog(fr, s0, 20)} />
          <LineArt parts={P.handbag} p={prog(fr, s0 + 4, 26)} x={GX} y={BY} size={300} width={2.6} />
          <Floor x={GX} y={BY + 100} w={320} p={prog(fr, s0 + 10, 18)} />
          <At x={GX} y={BY + 118} w={300}>
            <Label text="Genuine" start={s0 + 14} size={13} />
          </At>
          <HangingTag x={GX} top={150} len={36} start={lux - 8} swing={14}>
            <LiveTag value={tagVal} label="Luxury price" />
          </HangingTag>

          {/* price tower: blocks drop in on their words */}
          {placed.map((b, i) => {
            const c = f(b.cue());
            if (fr < c - 2) return null;
            const s = spring({ frame: fr - c + 2, fps, config: { damping: 13, stiffness: 150 } });
            const fly = i > 0 ? prog(fr, take + (i - 1) * 3, 14) : 0;
            const toFake = i === 0 ? prog(fr, beam, 16, easeOut) : 0;
            const o = (1 - fly) * (1 - toFake);
            if (o <= 0) return null;
            return (
              <div
                key={b.k}
                style={{
                  position: "absolute",
                  left: TX - TW / 2 + fly * 420,
                  top: b.top + lerp(-420, 0, s) - fly * 160,
                  width: TW,
                  height: b.h,
                  opacity: o,
                  transform: `rotate(${fly * 24}deg) scale(${1 - toFake * 0.3})`,
                  borderRadius: 10,
                  border: `2px solid ${INK}`,
                  background: "#000",
                  boxShadow: "0 0 14px rgba(255,255,255,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 18px",
                  fontFamily: FONT,
                  color: INK,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {b.h > 60 && (
                    <div style={{ position: "relative", width: 46, height: 46 }}>
                      <LineArt parts={P[b.icon]} p={prog(fr, c + 2, 14)} x={23} y={23} size={46} width={1.8} glow={false} />
                    </div>
                  )}
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.24em" }}>{b.label.toUpperCase()}</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>${b.amt}</span>
              </div>
            );
          })}
          {BLOCKS.map((b) => (
            <Ripple key={b.k} x={TX} y={BASE - 20} at={f(b.cue()) + 8} r={150} />
          ))}
          <div style={{ position: "absolute", left: TX - TW / 2, top: BASE + 2, width: TW, height: 2, background: INK, opacity: prog(fr, f(CUE.product) - 6, 8) * (1 - prog(fr, frac - 10, 8)) }} />
          <div style={{ position: "absolute", left: TX - 120, top: 270, width: 240, textAlign: "center", opacity: totalO }}>
            <Label text="Total" start={f(CUE.store) + 10} size={12} />
            <Counter value={1200} start={f(CUE.store) + 10} dur={12} prefix="$" size={40} />
          </div>

          {/* take that away → the product alone becomes the copy */}
          <Spark pts={[[TX, BASE - 25], [TX, 700], [FX, 700], [FX, 640]]} start={beam} dur={14} dashed wireStart={beam - 2} />
          <Halo x={FX} y={BY} r={250} o={prog(fr, beam + 12, 16)} />
          <LineArt parts={P.handbag} p={prog(fr, beam + 12, 26)} x={FX} y={BY} size={300} width={2.6} dashed={false} />
          <Floor x={FX} y={BY + 100} w={320} p={prog(fr, beam + 14, 18)} />
          <At x={FX} y={BY + 118} w={300}>
            <Label text="Good copy" start={f(CUE.good)} size={13} />
          </At>
          <HangingTag x={FX} top={150} len={36} start={f(CUE.good) - 2} swing={-12}>
            <LiveTag value={90 * prog(fr, f(CUE.good) + 6, 14, easeOut)} label="Copy price" />
          </HangingTag>
          <Scanner x0={GX - 190} x1={FX + 190} y={BY - 120} h={240} start={look - 4} dur={24} />
          <div style={{ position: "absolute", left: (GX + FX) / 2 - 130, top: BY + 160, width: 260, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 12, opacity: prog(fr, look + 4, 8) }}>
            <Label text="Look match" start={look + 4} size={12} />
            <Counter value={96} start={look + 4} dur={20} suffix="%" size={34} />
          </div>

          {/* fraction of the cost: a pie with a tiny slice */}
          <svg width={300} height={300} style={{ position: "absolute", left: TX - 150, top: 330, overflow: "visible", filter: GLOW, opacity: prog(fr, frac - 8, 10) }}>
            <circle cx={150} cy={150} r={118} fill="none" stroke={INK} strokeWidth={2.4} />
            {(() => {
              const a = 2 * Math.PI * 0.075 * prog(fr, frac, 14, easeOut);
              const x = 150 + 118 * Math.sin(a);
              const yy = 150 - 118 * Math.cos(a);
              return <path d={`M150 150 L150 32 A118 118 0 0 1 ${x} ${yy} Z`} fill={INK} />;
            })()}
          </svg>
          <div style={{ position: "absolute", left: TX - 150, top: 650, width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: prog(fr, frac + 8, 8) }}>
            <Counter value={7} start={frac + 8} dur={10} suffix="%" size={40} />
            <Label text="Of the price" start={frac + 10} size={12} />
          </div>
          <Ripple x={TX + 30} y={400} at={frac + 4} r={130} />
        </>
      }
    />
  );
};
