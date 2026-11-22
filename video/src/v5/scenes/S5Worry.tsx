import React from "react";
import { useCurrentFrame } from "remotion";
import { lerp } from "../../v2/anim";
import { LineArt } from "../../v2/components/Draw";
import { Floor, Halo } from "../../v2/components/Glow";
import { SceneLayer } from "../../v2/components/SceneLayer";
import { FONT, INK } from "../../v2/theme";
import { cameraAt } from "../camera";
import { P } from "../products";
import { p01, Rise } from "../smooth";
import { Chip, Place, Tiny, WhitePill } from "../ui";
import { CUE, f, ORIGIN, SCENES, XFADE } from "../timing";

const RX = 620;
const CX = 1150;
const Y = 450;

const Meter: React.FC<{ x: number; y: number; v: number; label: string }> = ({ x, y, v, label }) => (
  <div style={{ position: "absolute", left: x - 150, top: y, width: 300 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 15, fontWeight: 700, letterSpacing: "0.24em", color: INK }}>
      <span>WORRY</span>
      <span>{label}</span>
    </div>
    <div style={{ position: "relative", marginTop: 10, height: 14, borderRadius: 7, border: "1.6px solid rgba(255,255,255,0.75)" }}>
      <div style={{ position: "absolute", left: 2, top: 2, bottom: 2, width: `calc(${(v * 100).toFixed(1)}% - 4px)`, borderRadius: 5, background: INK, boxShadow: "0 0 12px rgba(255,255,255,0.7)" }} />
    </div>
  </div>
);

/** "A cheaper bag also takes the pressure off. Scuff it, spill on it, leave it on the bus. It's not a disaster." */
export const S5Worry: React.FC = () => {
  const fr = useCurrentFrame();
  const w0 = f(CUE.worry);
  const pr = f(CUE.pressure);
  const scuff = f(CUE.scuff);
  const spill = f(CUE.spill);
  const bus = f(CUE.leave);
  const dis = f(CUE.disaster);
  const fillReal = 0.92 * p01(fr, pr - 6, 24);
  const fillCheap = 0.14 * p01(fr, pr - 6, 24) + Math.sin(fr / 5) * 0.01 * p01(fr, scuff, 10);
  // a drop falls onto the cheaper bag, then a small splash ring
  const dropT = p01(fr, spill - 4, 10);
  const splash = p01(fr, spill + 6, 12);
  const busX = lerp(1880, 1420, p01(fr, bus - 6, 30));

  return (
    <SceneLayer
      win={SCENES.worry}
      origin={ORIGIN.worry}
      fadeIn={XFADE}
      fadeOut={XFADE}
      push={0}
      camera={cameraAt}
      world={
        <>
          {/* real: high worry */}
          <Halo x={RX} y={Y} r={220} o={p01(fr, w0, 20) * 0.6} />
          <LineArt parts={P.handbag} p={p01(fr, w0, 28)} x={RX} y={Y} size={240} width={2.4} opacity={0.75} />
          <Floor x={RX} y={Y + 84} w={280} p={p01(fr, w0 + 6, 20)} />
          <Rise at={w0 + 10}>
            <Place x={RX} y={Y + 100}>
              <Tiny text="Real" />
            </Place>
          </Rise>
          <Rise at={pr - 8}>
            <Meter x={RX} y={Y + 150} v={fillReal} label="HIGH" />
          </Rise>

          {/* cheaper: low worry, whatever happens */}
          <Halo x={CX} y={Y} r={240} o={p01(fr, w0 + 6, 20)} />
          <LineArt parts={P.handbag} p={p01(fr, w0 + 6, 28)} x={CX} y={Y} size={240} width={2.4} />
          <Floor x={CX} y={Y + 84} w={280} p={p01(fr, w0 + 12, 20)} />
          <Rise at={w0 + 16}>
            <Place x={CX} y={Y + 100}>
              <Tiny text="Cheaper" />
            </Place>
          </Rise>
          <Rise at={pr - 2}>
            <Meter x={CX} y={Y + 150} v={fillCheap} label="LOW" />
          </Rise>

          {/* scuff marks */}
          <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: p01(fr, scuff, 8) }}>
            {[0, 1, 2].map((i) => (
              <line key={i} x1={CX - 40 + i * 14} y1={Y + 40} x2={CX - 26 + i * 14} y2={Y + 22} stroke={INK} strokeWidth={2.2} strokeLinecap="round" opacity={0.8} />
            ))}
          </svg>
          {/* a spill */}
          {dropT > 0 && dropT < 1 && (
            <svg width={30} height={40} viewBox="0 0 30 40" style={{ position: "absolute", left: CX + 30, top: lerp(Y - 260, Y - 70, dropT), overflow: "visible" }}>
              <path d="M15 2 C15 2 4 18 4 26 A11 11 0 0 0 26 26 C26 18 15 2 15 2 Z" fill={INK} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }} />
            </svg>
          )}
          {splash > 0 && splash < 1 && (
            <div style={{ position: "absolute", left: CX + 45 - 40 * splash, top: Y - 62 - 10 * splash, width: 80 * splash, height: 20 * splash, borderRadius: "50%", border: `2px solid ${INK}`, opacity: 1 - splash }} />
          )}
          {/* the bus pulls in */}
          <LineArt parts={P.bus} p={p01(fr, bus - 6, 20)} x={busX} y={Y + 250} size={160} width={2.2} opacity={p01(fr, bus - 6, 10)} />

          {/* what happened — all fine */}
          {[
            { t: "Scuffed", at: scuff },
            { t: "Spilled on", at: spill + 2 },
            { t: "Left on the bus", at: bus + 4 },
          ].map((c, i) => (
            <Rise key={c.t} at={c.at} dur={14} dy={10}>
              <div style={{ position: "absolute", left: CX + 175, top: Y - 150 + i * 62 }}>
                <Chip text={c.t} size={16} />
              </div>
            </Rise>
          ))}
          <Rise at={dis} dur={18} dy={12}>
            <Place x={CX} y={Y - 210} w={360}>
              <WhitePill text="No big deal" />
            </Place>
          </Rise>
        </>
      }
    />
  );
};
