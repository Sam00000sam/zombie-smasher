import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOut, lerp, prog } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Card } from "../../v2/components/Card";
import { Floor } from "../../v2/components/Glow";
import { At, Label } from "../../v2/components/Text";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { ArmsPawn, BrowserWindow, CheckPill, Cursor, Notice, Ripple, Spark, Spotlight, Stars } from "../fx2";
import { Counter } from "../fx";
import { P } from "../products";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const WOFF = { x: 470, y: 250 };
const WFAKE = { x: 950, y: 250 };
const WW = 420;
const WH = 350;
const PAWN = { x: 250, floor: 690, h: 180 };

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

/** Shop window content: product, price (counting), rating, BUY button. */
const ShopBody: React.FC<{ kind: string; price: number; priceFrom: number; pulseAt: number; stars: number; starsAt: number; buyAt?: number; flaw?: number }> = ({
  kind,
  price,
  priceFrom,
  pulseAt,
  stars,
  starsAt,
  buyAt,
  flaw,
}) => {
  const fr = useCurrentFrame();
  const n = Math.round(price * prog(fr, priceFrom, 16, easeOut));
  const pulse = fr >= pulseAt ? lerp(1.3, 1, prog(fr, pulseAt, 10, easeOut)) : 1;
  const press = buyAt !== undefined && fr >= buyAt && fr < buyAt + 6 ? 0.9 : 1;
  return (
    <>
      <LineArt parts={P[kind]} p={prog(fr, priceFrom - 6, 26)} x={130} y={140} size={220} width={2.4} />
      <div style={{ position: "absolute", left: 262, top: 62 }}>
        <Label text="Price" start={priceFrom - 4} size={11} color="#9a9a9a" />
      </div>
      <div style={{ position: "absolute", left: 258, top: 80, fontFamily: FONT, fontWeight: 700, fontSize: 46, color: INK, fontVariantNumeric: "tabular-nums", textShadow: "0 0 14px rgba(255,255,255,0.55)", transform: `scale(${pulse})`, transformOrigin: "0 50%" }}>${n}</div>
      <Stars x={262} y={150} start={starsAt} value={stars} size={20} />
      {flaw !== undefined && (
        <div style={{ position: "absolute", left: 262, top: 184, padding: "3px 10px", border: "1.4px dashed rgba(255,255,255,0.8)", borderRadius: 999, fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: INK, opacity: prog(fr, flaw, 8), transform: `scale(${lerp(1.4, 1, prog(fr, flaw, 8, easeOut))})`, transformOrigin: "0 50%" }}>
          NOT PERFECT
        </div>
      )}
      <div style={{ position: "absolute", left: 300, top: 236, width: 92, height: 34, borderRadius: 999, background: INK, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 13, fontWeight: 800, letterSpacing: "0.22em", transform: `scale(${press})`, boxShadow: "0 0 16px rgba(255,255,255,0.55)" }}>BUY</div>
    </>
  );
};

/** Scenes 1–2: start mid-action in the replica shop, pull back to the matchup, then prices and a purchase. */
export const S1Compare: React.FC = () => {
  const fr = useCurrentFrame();
  const but = f(2.5);
  const zoom = lerp(1.45, 1, prog(fr, but, 20));
  const price = f(CUE.priceWord);
  const w0 = f(CUE.without);
  const buy = w0 + 8;
  const arrive = buy + 18;
  const raise = Math.max(prog(fr, f(4.7), 8, easeOut) * (1 - prog(fr, f(5.7), 8)), prog(fr, f(CUE.much), 8, easeOut));
  const q = prog(fr, but + 8, 8) * (1 - prog(fr, f(4.5), 6));
  const balance = Math.round(lerp(300, 265, prog(fr, arrive, 12, easeOut)));

  return (
    <SceneLayer
      win={SCENES.compare}
      origin={ORIGIN.compare}
      fadeOut={XFADE}
      push={0}
      camera={cameraAt}
      world={
        <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "1160px 425px" }}>
          <Spotlight
            keys={[
              { at: 0, x: 1160, y: 425, r: 380 },
              { at: but + 14, x: 820, y: 440, r: 620 },
              { at: f(CUE.surprising) + 2, x: 1500, y: 360, r: 380 },
              { at: price - 6, x: 920, y: 360, r: 560 },
              { at: f(CUE.similar), x: 920, y: 620, r: 560 },
              { at: w0, x: 760, y: 400, r: 700 },
            ]}
          />

          {/* replica shop — already live at frame 0 */}
          <BrowserWindow x={WFAKE.x} y={WFAKE.y} w={WW} h={WH} start={-24} url="replica-shop.com">
            <ShopBody kind="sneakerFake" price={35} priceFrom={-6} pulseAt={price} stars={3} starsAt={f(0.5)} flaw={f(CUE.hook) + 36} buyAt={buy} />
          </BrowserWindow>
          {/* official store appears on the pull-back */}
          <BrowserWindow x={WOFF.x} y={WOFF.y} w={WW} h={WH} start={but} url="official-store.com">
            <ShopBody kind="sneakerGenuine" price={240} priceFrom={but + 8} pulseAt={price} stars={5} starsAt={but + 10} />
          </BrowserWindow>

          {/* opening mid-action: orders racing in, like the reference's "+$1,000 NEW SALE" stack */}
          <div style={{ position: "absolute", left: WFAKE.x + 24, top: WFAKE.y - 58, display: "flex", alignItems: "baseline", gap: 12, opacity: 1 - prog(fr, but + 4, 10) }}>
            <Label text="Sold today" start={-20} size={12} />
            <Counter value={12480} start={-30} dur={f(2.6)} size={34} />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <Notice key={i} x={1386} y={262 + i * 64} text={`+1 order · ${["London", "Paris", "Dubai", "Berlin"][i]}`} start={-8 + i * 13} out={but - 2 + i} w={262} />
          ))}

          {/* the viewer */}
          <Floor x={PAWN.x} y={PAWN.floor} w={260} p={prog(fr, but, 16)} o={0.45} />
          <ArmsPawn x={PAWN.x} y={PAWN.floor} h={PAWN.h} o={prog(fr, but + 2, 10)} raise={raise} hop={raise * 10} q={q} />

          {/* "surprising advantages" stack in like sale notifications */}
          <Notice x={1420} y={270} text="Lower price" start={f(CUE.surprising)} out={f(5.85)} w={300} />
          <Notice x={1420} y={334} text="More styles" start={f(CUE.advantages)} out={f(5.9)} w={300} />
          <Notice x={1420} y={398} text="Easy to get" start={f(CUE.advantages) + 14} out={f(5.95)} w={300} />

          {/* price: ≠ slams between the windows */}
          <div style={{ position: "absolute", left: 896, top: 395, width: 48, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 48, color: INK, opacity: prog(fr, price, 6), transform: `scale(${lerp(1.8, 1, prog(fr, price, 8, easeOut))})`, textShadow: "0 0 18px rgba(255,255,255,0.8)" }}>≠</div>
          <Ripple x={920} y={425} at={price} r={90} />

          {/* similar look + basic function, on both */}
          <CheckPill x={600} y={622} text="Look" start={f(CUE.similar)} />
          <CheckPill x={1080} y={622} text="Look" start={f(CUE.similar) + 3} />
          <CheckPill x={760} y={622} text="Function" start={f(CUE.basic)} />
          <CheckPill x={1240} y={622} text="Function" start={f(CUE.basic) + 3} />
          <div style={{ position: "absolute", left: 896, top: 612, width: 48, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 34, color: INK, opacity: prog(fr, f(CUE.function), 6), textShadow: "0 0 14px rgba(255,255,255,0.8)" }}>=</div>

          {/* the purchase: click BUY on the replica, money travels, wallet barely moves */}
          <Card x={130} y={244} w={240} h={110} start={w0 - 6} title="WALLET" />
          {fr >= w0 && (
            <div style={{ position: "absolute", left: 158, top: 288, fontFamily: FONT, fontWeight: 700, fontSize: 40, color: INK, fontVariantNumeric: "tabular-nums", textShadow: "0 0 14px rgba(255,255,255,0.55)", opacity: prog(fr, w0, 8) }}>${balance}</div>
          )}
          <div style={{ position: "absolute", left: 140, top: 366 }}>
            <Label text="Genuine would leave $60" start={arrive + 10} size={10} color="#8f8f8f" spacing="0.2em" />
          </div>
          <Spark pts={[[1300, 540], [1300, 214], [250, 214], [250, 244]]} start={buy + 4} dur={16} dashed wireStart={buy} />
          <Ripple x={250} y={300} at={arrive} r={110} />
          <Cursor
            o={prog(fr, -10, 4) * (1 - prog(fr, but - 6, 6)) + prog(fr, w0 - 6, 6)}
            path={[
              { at: 0, x: 1320, y: 600 },
              { at: f(0.8), x: 1060, y: 400 },
              { at: f(1.4), x: 1250, y: 420 },
              { at: but, x: 1250, y: 430 },
              { at: w0 - 6, x: 1330, y: 680 },
              { at: buy, x: 1300, y: 545 },
            ]}
            clicks={[f(1.1), buy]}
          />
        </div>
      }
      screen={<SlamTitle text="WHY FAKE CAN BE BETTER" start={but + 2} out={f(CUE.price) - 6} y={92} />}
    />
  );
};
