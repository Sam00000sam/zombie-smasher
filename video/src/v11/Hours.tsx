import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { lerp } from "../v2/anim";
import { FONT } from "../v2/theme";
import { p01 } from "../v5/smooth";
import { burst, Cam, floor, GOLD, GREEN, INK, Item, motes, RED, setView, spot, V3 } from "../v6/engine";
import { WordCaptions } from "../v6/WordCaptions";
import { camAt, camSpeed, FLIGHTS, Z } from "./camera";
import { BAG, clockFace, PHONE, SAFE, SUITCASE } from "./models";
import { box, cylinder, merge, mesh, Mesh, slab } from "./three";
import { CUE, EMPHASIS, f, L, TOTAL_FRAMES, WORDS } from "./timing";

const SAFE_CX = 500;
export const VIEW_TT = { f: 1010, cx: SAFE_CX, cy: 770, billboard: true };

/* motion rules (video/CLAUDE.md): one easing, fade + settle, stations fade as a unit on departure */
const inn = (fr: number, at: number, d = 12) => p01(fr, at, d);
const station = (fr: number, a: number, b: number) => p01(fr, a, 12) * (1 - p01(fr, b - 9, 12));
const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
/** Text slabs turn with the camera but trail it slightly, so their 3D depth always shows. */
const Y = (c: Cam) => c.yaw - 0.22;

/* ------------------------------------------------------------- slab faces */
const Face: React.FC<{ col: string; children: React.ReactNode; solid?: boolean }> = ({ col, children, solid }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: 18,
      border: `4px solid ${col}`,
      background: solid ? col : "rgba(6,6,10,0.88)",
      boxShadow: `0 0 26px ${col}, inset 0 0 18px ${col}55`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      fontFamily: FONT,
      color: solid ? "#000" : col,
      fontWeight: 900,
      textAlign: "center",
      lineHeight: 1.02,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);
const Small: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = INK }) => <div style={{ fontSize: 22, letterSpacing: "0.28em", paddingLeft: "0.28em", color: c, fontWeight: 800 }}>{children}</div>;
const Big: React.FC<{ children: React.ReactNode; s?: number; c?: string }> = ({ children, s = 64, c }) => <div style={{ fontSize: s, letterSpacing: "0.02em", color: c, textShadow: c ? `0 0 18px ${c}` : undefined }}>{children}</div>;

/** A labelled slab: small caption + big value, in a neon frame. */
const tagSlab = (c: Cam, key: string, p: V3, w: number, h: number, op: number, col: string, small: string, big: string, s = 60) =>
  slab(c, key, { p, w, h, yaw: Y(c), opacity: op, children: <Face col={col}><Small>{small}</Small><Big s={s}>{big}</Big></Face> });
const lineSlab = (c: Cam, key: string, p: V3, w: number, h: number, op: number, col: string, text: React.ReactNode, s = 48, solid = false) =>
  slab(c, key, { p, w, h, yaw: Y(c), opacity: op, children: <Face col={col} solid={solid}><Big s={s}>{text}</Big></Face> });

/** A grid of cubes (one per hour), revealed n at a time, as a single mesh. */
const cubes = (n: number, cols: number, size: number, gap: number): Mesh => {
  const parts: Mesh[] = [];
  const W = cols * (size + gap) - gap;
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const b = box(size, size, size, row * (size + gap));
    const dx = -W / 2 + size / 2 + col * (size + gap);
    parts.push({ edges: b.edges.map(([a, q]) => [[a[0] + dx, a[1], a[2]], [q[0] + dx, q[1], q[2]]]), faces: b.faces.map((fc) => fc.map((q) => [q[0] + dx, q[1], q[2]] as V3)), accents: [] });
  }
  return parts.length ? merge(...parts) : { edges: [], faces: [] };
};
const pedestal = (c: Cam, key: string, p: V3, op: number, col: string, r = 140, h = 60) => mesh(c, key, { m: cylinder(r, h), xf: { p }, color: col, opacity: op * 0.8, fill: 0.07, width: 2, reg: false });
const bag = (c: Cam, key: string, p: V3, op: number, col: string, spin: number, s = 1) => mesh(c, key, { m: BAG, xf: { p, yaw: spin, s }, color: col, accent: col === INK ? GOLD : INK, opacity: op, fill: 0.16, width: 2.6 });

/* ===================================================================== world */
const world = (c: Cam, fr: number): (Item | null)[] => {
  const it: (Item | null)[] = [];
  // props sway in front of the camera (never edge-on), so their depth always reads
  const spin = c.yaw + Math.sin(fr * 0.025) * 0.55;

  /* ---- hook: a $3,000 bag, turning --------------------------------------------- */
  const HO = 1 - p01(fr, f(FLIGHTS.hr[0]) - 6, 12);
  if (HO > 0) {
    const z = Z.HK;
    it.push(spot(c, "H-sp", { p: [0, 0, z], r: 170, color: INK, opacity: HO * 0.8 }));
    it.push(pedestal(c, "H-pd", [0, 0, z], HO, INK, 150));
    it.push(bag(c, "H-bag", [0, 60, z], HO * inn(fr, 0, 14), INK, spin, 1.15));
    it.push(tagSlab(c, "H-price", [0, 520, z], 320, 130, HO * inn(fr, f(CUE.three) - 4), RED, "PRICE", "$3,000"));
    it.push(lineSlab(c, "H-q", [0, 790, z], 820, 100, HO * inn(fr, f(CUE.but) - 3), GOLD, "WHAT DOES IT REALLY COST?", 50));
  }

  /* ---- 150 hours of work ------------------------------------------------------------ */
  const HR = station(fr, f(FLIGHTS.hr[0]) - 4, f(FLIGHTS.rp[0]) + 5);
  if (HR > 0) {
    const z = Z.HR;
    const n = Math.round(150 * p01(fr, f(CUE.thats150) - 4, f(CUE.work + 0.4) - f(CUE.thats150) + 4));
    it.push(mesh(c, "R-ghost", { m: cubes(150, 15, 36, 8), xf: { p: [0, 10, z + 2] }, color: GOLD, opacity: HR * 0.16, fill: 0.02, width: 1, reg: false }));
    it.push(mesh(c, "R-wall", { m: cubes(n, 15, 36, 8), xf: { p: [0, 10, z] }, color: GOLD, opacity: HR, fill: 0.14, width: 1.6 }));
    const formula = inn(fr, f(CUE.earn) - 3) * (1 - inn(fr, f(CUE.almost) - 6, 8));
    it.push(lineSlab(c, "R-f", [0, 820, z], 600, 90, HR * formula, INK, "$3,000 ÷ $20 / HOUR", 44));
    it.push(lineSlab(c, "R-m", [0, 820, z], 600, 90, HR * inn(fr, f(CUE.almost) - 2), GOLD, "≈ 1 MONTH OF WORK", 46));
    it.push(tagSlab(c, "R-n", [-120, 620, z - 40], 390, 130, HR * inn(fr, f(CUE.thats150) - 4), GOLD, "HOURS OF WORK", `${n}`, 70));
    const ck = inn(fr, f(CUE.almost) - 4);
    const t = Math.max(0, fr - f(CUE.almost));
    it.push(mesh(c, "R-clock", { m: clockFace(t * 0.06, t * 0.5), xf: { p: [255, 620, z - 40], s: 0.9 }, color: INK, accent: GOLD, opacity: HR * ck, fill: 0.1, width: 2.2 }));
  }

  /* ---- the replica: 5 hours ------------------------------------------------------------ */
  const RP = station(fr, f(FLIGHTS.rp[0]) - 4, f(FLIGHTS.gp[0]) + 5);
  if (RP > 0) {
    const z = Z.RP;
    it.push(spot(c, "P-sp", { p: [-190, 0, z], r: 160, color: GOLD, opacity: RP * 0.85 }));
    it.push(pedestal(c, "P-pd", [-190, 0, z], RP, GOLD, 135));
    it.push(bag(c, "P-bag", [-190, 60, z], RP, GOLD, spin));
    it.push(tagSlab(c, "P-price", [-190, 470, z], 260, 120, RP * inn(fr, f(CUE.hundred100) - 5), GREEN, "PRICE", "$100"));
    const n = Math.round(5 * p01(fr, f(CUE.thats5) - 2, 14));
    it.push(mesh(c, "P-cubes", { m: cubes(n, 5, 44, 10), xf: { p: [200, 0, z] }, color: GOLD, opacity: RP, fill: 0.16, width: 2 }));
    it.push(tagSlab(c, "P-h", [200, 240, z - 40], 300, 110, RP * inn(fr, f(CUE.thats5) - 2), GOLD, "HOURS OF WORK", `${n}`, 56));
    it.push(lineSlab(c, "P-shift", [0, 780, z], 580, 90, RP * inn(fr, f(CUE.less) - 3), GREEN, "LESS THAN ONE SHIFT", 44, true));
  }

  /* ---- what you keep ---------------------------------------------------------------------- */
  const GP = station(fr, f(FLIGHTS.gp[0]) - 4, f(FLIGHTS.sp[0]) + 5);
  if (GP > 0) {
    const z = Z.GP;
    const n = Math.round(145 * p01(fr, f(CUE.fortyFive) - 6, 26));
    it.push(mesh(c, "G-ghost", { m: cubes(145, 13, 22, 6), xf: { p: [-200, 10, z + 2] }, color: GREEN, opacity: GP * 0.16, fill: 0.02, width: 0.9, reg: false }));
    it.push(mesh(c, "G-wall", { m: cubes(n, 13, 22, 6), xf: { p: [-200, 10, z] }, color: GREEN, opacity: GP, fill: 0.14, width: 1.3 }));
    it.push(tagSlab(c, "G-h", [-200, 500, z - 30], 330, 120, GP * inn(fr, f(CUE.fortyFive) - 6), GREEN, "HOURS BACK", `${n}`, 64));
    const g = p01(fr, f(CUE.twentyNine) - 6, 30);
    it.push(mesh(c, "G-coins", { m: cylinder(80, Math.max(4, 330 * g), 0, 28, Math.floor(22 * g)), xf: { p: [220, 0, z] }, color: GOLD, opacity: GP * inn(fr, f(CUE.twentyNine) - 8), fill: 0.18, width: 2 }));
    it.push(tagSlab(c, "G-$", [220, 500, z - 30], 300, 120, GP * inn(fr, f(CUE.twentyNine) - 6), GOLD, "MONEY KEPT", money(2900 * g), 60));
    it.push(lineSlab(c, "G-pocket", [0, 790, z], 640, 90, GP * inn(fr, f(CUE.back) - 3), GOLD, "BACK IN YOUR POCKET", 46, true));
    it.push(burst(c, "G-burst", { p: [0, 700, z + 40], t: p01(fr, f(CUE.back), 26), n: 26, spread: 360 }));
  }

  /* ---- what it buys instead -------------------------------------------------------------- */
  const SP = station(fr, f(FLIGHTS.sp[0]) - 4, f(FLIGHTS.en[0]) + 5);
  if (SP > 0) {
    const z = Z.SP;
    [
      { x: -300, m: SUITCASE, s: 0.85, col: GOLD, at: f(CUE.trip), small: "TRIP", big: "$800" },
      { x: 0, m: PHONE, s: 0.95, col: INK, at: f(CUE.phone), small: "PHONE", big: "$900" },
      { x: 300, m: SAFE, s: 0.8, col: GREEN, at: f(CUE.fund), small: "SAFETY NET", big: "$1,200" },
    ].forEach((o, i) => {
      const a = inn(fr, o.at - 4);
      it.push(pedestal(c, `S-pd${i}`, [o.x, 0, z], SP * lerp(0.35, 1, a), o.col, 95, 36));
      it.push(mesh(c, `S-o${i}`, { m: o.m, xf: { p: [o.x, 36, z], yaw: spin + (i - 1) * 0.25, s: o.s }, color: o.col, accent: o.col === INK ? GOLD : INK, opacity: SP * a, fill: 0.15, width: 2.2 }));
      it.push(tagSlab(c, `S-t${i}`, [o.x, 420, z - 30], 262, 112, SP * a, o.col, o.small, o.big, 50));
    });
    it.push(lineSlab(c, "S-sum", [0, 780, z], 420, 90, SP * inn(fr, f(CUE.fund) + 14), GOLD, "= $2,900", 54));
  }

  /* ---- same look, different cost -------------------------------------------------------- */
  const EN = p01(fr, f(FLIGHTS.en[0]) - 4, 12);
  if (EN > 0) {
    const z = Z.EN;
    [
      { x: -200, col: INK, tag: RED, small: "150 HOURS", big: "$3,000" },
      { x: 200, col: GOLD, tag: GREEN, small: "5 HOURS", big: "$100" },
    ].forEach((o, i) => {
      it.push(spot(c, `E-sp${i}`, { p: [o.x, 0, z], r: 160, color: o.col, opacity: EN * 0.85 }));
      it.push(pedestal(c, `E-pd${i}`, [o.x, 0, z], EN, o.col, 135));
      it.push(bag(c, `E-b${i}`, [o.x, 60, z], EN, o.col, spin + (i ? -0.3 : 0.3)));
      it.push(tagSlab(c, `E-t${i}`, [o.x, 470, z - 20], 300, 120, EN * inn(fr, f(FLIGHTS.en[1]) + i * 5), o.tag, o.small, o.big, 56));
    });
    const sm = inn(fr, f(CUE.same) - 3) * (1 - inn(fr, f(CUE.so) - 6, 8));
    it.push(lineSlab(c, "E-same", [0, 780, z], 420, 90, EN * sm, INK, "SAME LOOK", 50));
    it.push(
      slab(c, "E-q", {
        p: [0, 800, z],
        w: 760,
        h: 150,
        yaw: Y(c),
        opacity: EN * inn(fr, f(CUE.so) - 2),
        children: (
          <Face col={GOLD}>
            <Big s={46} c={INK}>HOW MANY HOURS</Big>
            <Big s={46}>IS A LOGO WORTH?</Big>
          </Face>
        ),
      }),
    );
  }
  return it;
};

/** For scripts/layout.ts: run one frame's world so every slab and mesh registers its screen box. */
export const layoutFrame = (fr: number) => {
  setView(VIEW_TT);
  world(camAt(fr), fr);
};

/** "What It Really Costs": hours of work, in full 3D, orbiting camera. */
export const Hours: React.FC = () => {
  const fr = useCurrentFrame();
  setView(VIEW_TT);
  const c = camAt(fr);
  const items = [floor(c, [], 1, true), ...motes(c, fr), ...(world(c, fr).filter(Boolean) as Item[])];
  items.sort((a, b) => b.z - a.z);
  const mb = Math.max(0, Math.min(2, (camSpeed(fr) - 40) / 20));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 60% at 46% 40%, #0e0e14 0%, #000 72%)" }} />
      <AbsoluteFill style={{ filter: mb > 0.2 ? `blur(${mb.toFixed(2)}px)` : undefined }}>{items.map((i) => i.node)}</AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 70% at 46% 41%, transparent 55%, rgba(0,0,0,0.78) 100%)", pointerEvents: "none" }} />
      <WordCaptions words={WORDS} emphasis={EMPHASIS} top={1255} cx={SAFE_CX} smooth />
      <div style={{ position: "absolute", left: 0, width: SAFE_CX * 2, top: 1215, textAlign: "center", fontFamily: FONT, fontSize: 16, fontWeight: 600, letterSpacing: "0.26em", color: "rgba(255,255,255,0.4)", opacity: p01(fr, f(L.hours.start), 12) * (1 - p01(fr, f(L.end.start), 12)) }}>ILLUSTRATIVE · $20/HR BEFORE TAX</div>
      <Audio src={staticFile("voice/hours-narration.wav")} />
    </AbsoluteFill>
  );
};

export const HOURS_FRAMES = TOTAL_FRAMES;
