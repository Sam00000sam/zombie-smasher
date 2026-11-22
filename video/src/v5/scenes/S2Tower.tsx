import React from "react";
import { useCurrentFrame } from "remotion";
import { LineArt } from "../../v2/components/Draw";
import { Floor, Halo } from "../../v2/components/Glow";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { P } from "../products";
import { p01, Rise } from "../smooth";
import { Chip, Place, Tag, Tiny } from "../ui";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const GX = 640;
const CX = 1260; // price stack, later the copy
const Y = 520;
const BASE = 720;
const TW = 300;
const BLOCKS = [
  { k: "product", label: "Product", amt: 90, h: 52, icon: "handbag", cue: () => CUE.product },
  { k: "logo", label: "Logo", amt: 520, h: 120, icon: "crest", cue: () => CUE.logo },
  { k: "ads", label: "Ads", amt: 280, h: 92, icon: "megaphone", cue: () => CUE.ads },
  { k: "store", label: "Store", amt: 310, h: 104, icon: "store", cue: () => CUE.store },
];

/**
 * "Most of a luxury price isn't the product. It's the logo, the ads, and the fancy store.
 *  Take that away, and a good copy can look almost identical, for a fraction of the cost."
 */
export const S2Tower: React.FC = () => {
  const fr = useCurrentFrame();
  const s0 = SCENES.tower.from;
  const lux = f(CUE.luxury);
  const take = f(CUE.copy);
  const copyAt = f(CUE.good) - 4;
  const look = f(CUE.look);
  const frac = f(CUE.fraction);

  let top = BASE;
  const stack = BLOCKS.map((b) => {
    top -= b.h + 6;
    return { ...b, top };
  });
  const total = p01(fr, f(CUE.store) + 10, 18) * (1 - p01(fr, take, 14));
  const productOut = p01(fr, copyAt - 6, 16);

  return (
    <SceneLayer
      win={SCENES.tower}
      origin={ORIGIN.tower}
      fadeIn={XFADE}
      fadeOut={XFADE}
      push={0}
      camera={cameraAt}
      world={
        <>
          {/* the genuine bag and its price */}
          <Halo x={GX} y={Y} r={240} o={p01(fr, s0 + 4, 24)} />
          <LineArt parts={P.handbag} p={p01(fr, s0 + 6, 30)} x={GX} y={Y} size={280} width={2.6} />
          <Floor x={GX} y={Y + 98} w={320} p={p01(fr, s0 + 12, 22)} />
          <Rise at={s0 + 16}>
            <Place x={GX} y={Y + 118}>
              <Tiny text="Genuine" />
            </Place>
          </Rise>
          <Rise at={lux - 6} dur={20}>
            <Place x={GX} y={190} w={260}>
              <Tag label="Luxury price" value={1200 * p01(fr, lux - 2, 26)} />
            </Place>
          </Rise>

          {/* the price stack: each part slides into place on its word, then the extras slide away */}
          {stack.map((b, i) => {
            const c = f(b.cue());
            const inP = p01(fr, c - 4, 16);
            const away = i > 0 ? p01(fr, take + (i - 1) * 4, 18) : productOut;
            const o = inP * (1 - away);
            if (o <= 0) return null;
            return (
              <div
                key={b.k}
                style={{
                  position: "absolute",
                  left: CX - TW / 2 + (i > 0 ? away * 120 : 0),
                  top: b.top - (1 - inP) * 40,
                  width: TW,
                  height: b.h,
                  opacity: o,
                  borderRadius: 12,
                  border: `2px solid ${INK}`,
                  background: "#000",
                  boxShadow: "0 0 12px rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 20px",
                  fontFamily: FONT,
                  color: INK,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {b.h > 60 && (
                    <div style={{ position: "relative", width: 44, height: 44 }}>
                      <LineArt parts={P[b.icon]} p={p01(fr, c, 18)} x={22} y={22} size={44} width={1.8} glow={false} />
                    </div>
                  )}
                  <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "0.22em" }}>{b.label.toUpperCase()}</span>
                </div>
                <span style={{ fontSize: 24, fontWeight: 700 }}>${b.amt}</span>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: CX - TW / 2, top: BASE + 2, width: TW, height: 2, background: INK, opacity: p01(fr, f(CUE.product) - 6, 12) * (1 - productOut) }} />
          <div style={{ position: "absolute", left: CX - 150, top: stack[3].top - 70, width: 300, textAlign: "center", opacity: total, fontFamily: FONT, color: INK }}>
            <Tiny text="Total" size={15} />
            <div style={{ fontSize: 38, fontWeight: 700, textShadow: "0 0 14px rgba(255,255,255,0.5)" }}>$1,200</div>
          </div>

          {/* the product alone becomes a good copy */}
          <Halo x={CX} y={Y} r={240} o={p01(fr, copyAt, 24)} />
          <LineArt parts={P.handbag} p={p01(fr, copyAt, 30)} x={CX} y={Y} size={280} width={2.6} />
          <Floor x={CX} y={Y + 98} w={320} p={p01(fr, copyAt + 6, 22)} />
          <Rise at={copyAt + 10}>
            <Place x={CX} y={Y + 118}>
              <Tiny text="Good copy" />
            </Place>
          </Rise>
          <Rise at={copyAt + 4} dur={20}>
            <Place x={CX} y={190} w={260}>
              <Tag label="Copy price" value={90} />
            </Place>
          </Rise>

          {/* almost identical */}
          <Rise at={look} dur={20}>
            <Place x={(GX + CX) / 2} y={Y - 40} w={300}>
              <div style={{ textAlign: "center", fontFamily: FONT, color: INK }}>
                <div style={{ fontSize: 64, fontWeight: 300, lineHeight: 1, textShadow: "0 0 18px rgba(255,255,255,0.6)" }}>≈</div>
                <div style={{ marginTop: 10 }}>
                  <Tiny text="Almost identical" size={16} />
                </div>
              </div>
            </Place>
          </Rise>

          {/* a fraction of the cost: two simple price bars */}
          <Rise at={frac - 6} dur={20} out={f(CUE.same) - 10}>
            {[
              { y: 690, label: "Genuine", v: 1200, w: 620 },
              { y: 730, label: "Copy", v: 90, w: Math.max(14, 620 * (90 / 1200)) },
            ].map((b, i) => (
              <div key={b.label} style={{ position: "absolute", left: 650, top: b.y, display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 110, textAlign: "right" }}>
                  <Tiny text={b.label} size={15} />
                </div>
                <div style={{ width: b.w * p01(fr, frac + i * 6, 24), height: 10, borderRadius: 5, background: INK, boxShadow: "0 0 12px rgba(255,255,255,0.6)" }} />
                <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: INK, opacity: p01(fr, frac + 14 + i * 6, 12) }}>${b.v.toLocaleString("en-US")}</div>
              </div>
            ))}
          </Rise>
          {/* same shape, same colour, same everyday use */}
          {[
            { t: "Same shape", x: 650, at: f(CUE.shape) - 4 },
            { t: "Same colour", x: 950, at: f(CUE.colour) - 4 },
            { t: "Same everyday use", x: 1280, at: f(CUE.everyday) - 4 },
          ].map((c) => (
            <Rise key={c.t} at={c.at} dur={16} dy={12}>
              <Place x={c.x} y={690} w={420}>
                <Chip text={c.t} />
              </Place>
            </Rise>
          ))}
        </>
      }
    />
  );
};
