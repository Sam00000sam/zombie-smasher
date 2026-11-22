import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { lerp } from "../v2/anim";
import { io } from "../v5/smooth";
import { burst, Cam, floor, GOLD, GREEN, INK, Item, motes, RED, setView, spot, toCam, V3, VIEW } from "../v6/engine";
import { BAG_S, PAWN_S, pedestalS, shelfS } from "../v12/models";
import { solid } from "../v12/solid";
import { Big, Face, lineSlab, Small, VIEW_TT } from "../v12/ui";
import { slab } from "../v11/three";

/**
 * Look-development reel: five short cuts showing the upgraded finish — bloom, neon-tube edges, a
 * moving light with specular glints, a richer background, lens streaks, and 60 fps motion.
 */
export const FPS60 = 60;
const Z0 = 1200;
const PALETTE = ["#ffd04d", "#36e3a3", "#ff6fb1", "#5ab8ff", "#ffffff", "#ff9f43", "#b48cff", "#ff4a5a"];

/** eased 0→1 between a and a+d seconds */
const e = (t: number, a: number, d: number) => io(Math.max(0, Math.min(1, (t - a) / d)));
type Orbit = { tx: number; ty: number; tz: number; R: number; th: number; y: number };
const cam = (o: Orbit): Cam => {
  const th = (o.th * Math.PI) / 180;
  return { x: o.tx - o.R * Math.sin(th), y: o.y, z: o.tz - o.R * Math.cos(th), yaw: th, pitch: -Math.atan2(o.y - o.ty, o.R) * 0.6, focus: o.R };
};
const mixO = (a: Orbit, b: Orbit, k: number): Orbit => ({ tx: lerp(a.tx, b.tx, k), ty: lerp(a.ty, b.ty, k), tz: lerp(a.tz, b.tz, k), R: lerp(a.R, b.R, k), th: lerp(a.th, b.th, k), y: lerp(a.y, b.y, k) });
/** A light that circles the set, so glints slide across surfaces as time passes. */
const sweep = (t: number, speed = 0.6): V3 => [Math.sin(t * speed) * 0.8, 0.75, -Math.cos(t * speed) * 0.8];

type Cut = { from: number; to: number; render: (t: number) => { c: Cam; items: (Item | null)[]; flares: { p: V3; col: string; a: number }[] } };

/* ---- 1: hero orbit ------------------------------------------------------------------ */
const hero: Cut = {
  from: 0,
  to: 3.3,
  render: (t) => {
    const c = cam(mixO({ tx: 0, ty: 190, tz: Z0, R: 920, th: -70, y: 360 }, { tx: 0, ty: 200, tz: Z0, R: 760, th: 55, y: 300 }, e(t, 0, 3.3)));
    const L = sweep(t, 1.1);
    const it: (Item | null)[] = [spot(c, "sp", { p: [0, 0, Z0], r: 170, color: GOLD, opacity: 0.9 })];
    it.push(...solid(c, "pd", { m: pedestalS(130, 50), xf: { p: [0, 0, Z0] }, color: INK, opacity: 1, shadow: 170, width: 1.8, light: L, tube: true }));
    it.push(...solid(c, "bag", { m: BAG_S, xf: { p: [0, 50, Z0], yaw: c.yaw * 0.35 + 0.2 }, color: GOLD, accent: "#ffffff", opacity: e(t, 0, 0.5), light: L, tube: true, reflect: 0.22 }));
    return { c, items: it, flares: [] };
  },
};

/* ---- 2: the price reveal ---------------------------------------------------------------- */
const price: Cut = {
  from: 3.05,
  to: 6.4,
  render: (t) => {
    const c = cam(mixO({ tx: 0, ty: 300, tz: Z0, R: 1150, th: 16, y: 470 }, { tx: 0, ty: 300, tz: Z0, R: 960, th: -10, y: 430 }, e(t, 0, 3.3)));
    const L = sweep(t + 2, 0.8);
    const it: (Item | null)[] = [];
    const flares: { p: V3; col: string; a: number }[] = [];
    [
      { x: -210, col: RED, bag: INK, at: 0.55, label: "DESIGNER", val: "$3,000" },
      { x: 210, col: GREEN, bag: GOLD, at: 1.75, label: "REPLICA", val: "$100" },
    ].forEach((o, i) => {
      it.push(spot(c, `sp${i}`, { p: [o.x, 0, Z0], r: 150, color: o.bag, opacity: 0.85 }));
      it.push(...solid(c, `pd${i}`, { m: pedestalS(120, 46), xf: { p: [o.x, 0, Z0] }, color: INK, opacity: 1, shadow: 150, width: 1.6, light: L, tube: true }));
      it.push(...solid(c, `bag${i}`, { m: BAG_S, xf: { p: [o.x, 46, Z0], yaw: c.yaw + (i ? -0.35 : 0.35) }, color: o.bag, accent: i ? "#ffffff" : GOLD, opacity: 1, light: L, tube: true }));
      const a = e(t, o.at, 0.55);
      it.push(slab(c, `tag${i}`, { p: [o.x, lerp(760, 440, a), Z0 - 20], w: 300, h: 124, yaw: c.yaw - 0.22, opacity: Math.min(1, a * 3), depth: 22, layers: 9, children: <Face col={o.col}><Small>{o.label}</Small><Big s={62}>{o.val}</Big></Face> }));
      it.push(burst(c, `b${i}`, { p: [o.x, 440, Z0 - 40], t: Math.max(0, Math.min(1, (t - o.at - 0.5) / 0.6)), color: o.col, n: 26, spread: 260 }));
      const fl = Math.max(0, 1 - Math.abs(t - o.at - 0.55) / 0.3) * 0.8;
      if (fl > 0) flares.push({ p: [o.x, 368, Z0 - 30], col: o.col, a: fl });
    });
    return { c, items: it, flares };
  },
};

/* ---- 3: the shelf fills ------------------------------------------------------------------- */
const shelf: Cut = {
  from: 6.15,
  to: 9.4,
  render: (t) => {
    const c = cam(mixO({ tx: -40, ty: 260, tz: Z0, R: 950, th: -34, y: 260 }, { tx: 40, ty: 270, tz: Z0, R: 980, th: 28, y: 400 }, e(t, 0, 3.25)));
    const L = sweep(t, 1.4);
    const it: (Item | null)[] = [];
    it.push(...solid(c, "sh", { m: shelfS(5, 6, 86, 8, 92), xf: { p: [0, 0, Z0 + 4] }, color: GOLD, opacity: 1, reflect: 0.14, width: 1.5, glow: 5, light: L, tube: true }));
    for (let k = 0; k < 30; k++) {
      const col = k % 5;
      const row = Math.floor(k / 5);
      const a = e(t, 0.05 + k * 0.035, 0.28);
      if (a <= 0) continue;
      it.push(...solid(c, `b${k}`, { m: BAG_S, xf: { p: [-219 + 4 + 43 + col * 86, row * 86 + 8, Z0], yaw: c.yaw + Math.sin(t * 1.4 + k) * 0.15, s: 0.27 * lerp(0.4, 1, a) }, color: PALETTE[(k * 3 + row) % PALETTE.length], opacity: a, reflect: 0, width: 1.3, glow: 4, light: L, tube: true, reg: false }));
    }
    return { c, items: it, flares: [] };
  },
};

/* ---- 4: figures light up, camera cranes ------------------------------------------------- */
const figures: Cut = {
  from: 9.15,
  to: 12.4,
  render: (t) => {
    const c = cam(mixO({ tx: 0, ty: 120, tz: Z0, R: 820, th: 22, y: 110 }, { tx: 0, ty: 160, tz: Z0, R: 900, th: -18, y: 560 }, e(t, 0, 3.25)));
    const L = sweep(t, 0.9);
    const it: (Item | null)[] = [];
    ["#ff6fb1", "#5ab8ff", "#ffd04d", "#36e3a3", "#b48cff"].forEach((col, i) => {
      const x = (i - 2) * 150;
      const on = e(t, 0.3 + i * 0.32, 0.35);
      it.push(spot(c, `sp${i}`, { p: [x, 0, Z0], r: 80, color: col, opacity: on }));
      it.push(...solid(c, `p${i}`, { m: PAWN_S, xf: { p: [x, 0, Z0], s: 0.85 }, color: col, opacity: lerp(0.25, 1, on), shadow: 70, reflect: 0.2, width: 1.7, glow: 6, light: L, tube: on > 0.5 }));
    });
    return { c, items: it, flares: [] };
  },
};

/* ---- 5: real or fake? --------------------------------------------------------------------- */
const closer: Cut = {
  from: 12.15,
  to: 15.5,
  render: (t) => {
    const c = cam(mixO({ tx: 0, ty: 300, tz: Z0, R: 1180, th: -14, y: 470 }, { tx: 0, ty: 300, tz: Z0, R: 1020, th: 10, y: 440 }, e(t, 0, 3.35)));
    const L = sweep(t, 0.7);
    const it: (Item | null)[] = [];
    [-1, 1].forEach((sd, i) => {
      const x = sd * 205;
      // two beams that lean in and out
      it.push(spot(c, `sp${i}`, { p: [x + Math.sin(t * 1.3 + i * 2) * 40, 0, Z0], r: 150, color: i ? GOLD : INK, opacity: 0.9 }));
      it.push(...solid(c, `pd${i}`, { m: pedestalS(120, 46), xf: { p: [x, 0, Z0] }, color: INK, opacity: 1, shadow: 150, width: 1.6, light: L, tube: true }));
      it.push(...solid(c, `bag${i}`, { m: BAG_S, xf: { p: [x, 46, Z0], yaw: c.yaw + sd * -0.3 }, color: i ? GOLD : INK, accent: i ? "#ffffff" : GOLD, opacity: 1, light: L, tube: true }));
    });
    const a = e(t, 0.35, 0.6);
    it.push(
      slab(c, "title", {
        p: [0, lerp(700, 680, a), Z0 - 30],
        w: 720,
        h: 130,
        yaw: c.yaw - 0.2,
        opacity: a,
        depth: 26,
        layers: 10,
        children: (
          <Face col={GOLD}>
            <Big s={84} c={INK}>
              REAL OR <span style={{ color: GOLD }}>FAKE?</span>
            </Big>
          </Face>
        ),
      }),
    );
    it.push(lineSlab(c, "sub", [0, 560, Z0 - 30], 420, 70, e(t, 0.9, 0.5), INK, "YOU DECIDE", 34));
    return { c, items: it, flares: a > 0 && a < 1 ? [{ p: [0, 680, Z0 - 40], col: GOLD, a: Math.sin(a * Math.PI) }] : [] };
  },
};

const CUTS = [hero, price, shelf, figures, closer];
export const REEL_FRAMES = Math.round(15.5 * FPS60);

/** One cut, drawn twice more as bloom (a tight glow and a wide soft one). */
const CutLayer: React.FC<{ cut: Cut; t: number; fr: number; opacity: number }> = ({ cut, t, fr, opacity }) => {
  const lt = t - cut.from;
  const { c, items, flares } = cut.render(lt);
  const all = [floor(c, [], 0.8, true), ...motes(c, fr / 2), ...(items.filter(Boolean) as Item[])];
  all.sort((a, b) => b.z - a.z);
  const nodes = all.map((i) => i.node);
  const fl = flares
    .map((f0) => {
      const q = toCam(c, f0.p);
      if (q[2] < 60) return null;
      return { x: VIEW.cx + (VIEW.f * q[0]) / q[2], y: VIEW.cy - (VIEW.f * q[1]) / q[2], col: f0.col, a: f0.a };
    })
    .filter(Boolean) as { x: number; y: number; col: string; a: number }[];
  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill>{nodes}</AbsoluteFill>
      <AbsoluteFill style={{ filter: "blur(7px) brightness(1.35) saturate(1.25)", mixBlendMode: "screen", opacity: 0.55 }}>{nodes}</AbsoluteFill>
      <AbsoluteFill style={{ filter: "blur(26px) brightness(1.6) saturate(1.4)", mixBlendMode: "screen", opacity: 0.45 }}>{nodes}</AbsoluteFill>
      {fl.map((f0, i) => (
        <div key={i} style={{ position: "absolute", left: f0.x - 520, top: f0.y - 3, width: 1040, height: 6, borderRadius: 3, opacity: f0.a, background: `linear-gradient(90deg, transparent, ${f0.col} 30%, #fff 50%, ${f0.col} 70%, transparent)`, filter: "blur(2px)", mixBlendMode: "screen", boxShadow: `0 0 30px 8px ${f0.col}` }} />
      ))}
    </AbsoluteFill>
  );
};

const SFX = [
  { at: 3.0, file: "whoosh", vol: 0.26 },
  { at: 3.6, file: "chime", vol: 0.22 },
  { at: 4.8, file: "chime", vol: 0.22 },
  { at: 6.1, file: "whoosh", vol: 0.26 },
  { at: 6.4, file: "shimmer", vol: 0.28 },
  { at: 9.1, file: "whoosh", vol: 0.24 },
  { at: 12.1, file: "whoosh", vol: 0.26 },
  { at: 12.5, file: "pop", vol: 0.24 },
];

/** Look-dev reel: five cuts, 60 fps. */
export const Reel: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / FPS60;
  setView({ ...VIEW_TT, cy: 800 });
  const live = CUTS.filter((cu) => t >= cu.from && t < cu.to + 0.001);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 55% at 46% 38%, #1a1238 0%, #0a0818 45%, #000 78%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 34%, rgba(120,90,255,0.10) 42%, transparent 52%)" }} />
      {live.map((cu) => {
        // soft crossfade where cuts overlap
        const fadeIn = cu.from === 0 ? 1 : Math.min(1, (t - cu.from) / 0.25);
        const fadeOut = cu.to >= 15.5 ? 1 : Math.min(1, (cu.to - t) / 0.25);
        return <CutLayer key={cu.from} cut={cu} t={t} fr={fr} opacity={Math.max(0, Math.min(fadeIn, fadeOut))} />;
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 72% at 46% 42%, transparent 55%, rgba(0,0,0,0.8) 100%)", pointerEvents: "none" }} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * FPS60)} durationInFrames={110} layout="none">
          <Audio src={staticFile(`sfx/${s.file}.wav`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
