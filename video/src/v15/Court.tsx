import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { lerp } from "../v2/anim";
import { p01 } from "../v5/smooth";
import { burst, Cam, floor, GOLD, GREEN, INK, Item, motes, pawn, RED, setView, spot, V3 } from "../v6/engine";
import { WordCaptions } from "../v6/WordCaptions";
import { BAG_S, pedestalS } from "../v12/models";
import { key, makeRig, Rig } from "../v12/rig";
import { SMesh, solid } from "../v12/solid";
import { Big, CAPTION_TOP, Face, inn, lineSlab, SAFE_CX, Sfx, SfxTrack, Small, tagSlab, VIEW_TT } from "../v12/ui";
import { slab } from "../v11/three";
import { BENCH, BLOCK, COLUMN, GAVEL, RAIL, SHADES, SNEAKER, WATCH } from "./models";
import { CUE, EMPHASIS, f, L, TOTAL_FRAMES, WORDS } from "./timing";

/* the set */
const Z0 = 1200; // evidence stand
const ZB = Z0 + 520; // judge's bench
const JX = 640; // jury box
const JZ = Z0 + 240;
const GV: V3 = [210, 316, ZB - 70]; // gavel pivot
const IX = 200; // exhibit pedestals at ±IX

const base: Rig = { tx: 0, ty: 260, tz: Z0 + 150, R: 1300, th: 0, y: 520 };
const K = (t: number, dur: number, r: Partial<Rig>) => key(f(t), dur, r, base);
const { camAt, camSpeed } = makeRig([
  K(0, 1, { tx: 0, tz: ZB, ty: 280, R: 1500, th: -22, y: 600 }),
  K(L.order.end - 0.05, f(L.order.end - 0.05), { tx: 140, tz: ZB - 40, ty: 300, R: 820, th: -14, y: 440 }),
  K(L.case.end, f(L.case.end - L.order.end + 0.05), { tx: 0, tz: ZB - 220, ty: 330, R: 1320, th: 12, y: 540 }),
  K(L.a1.start + 0.55, 24, { tx: 0, tz: Z0, ty: 250, R: 930, th: -14, y: 420 }),
  K(L.b1.start - 0.1, f(L.b1.start - L.a1.start - 0.65), { tx: 0, tz: Z0, ty: 250, R: 900, th: 10, y: 410 }),
  K(L.c1.start - 0.1, f(L.c1.start - L.b1.start), { tx: 0, tz: Z0, ty: 250, R: 900, th: -10, y: 410 }),
  K(L.jury.start - 0.1, f(L.jury.start - L.c1.start), { tx: 0, tz: Z0, ty: 250, R: 880, th: 12, y: 410 }),
  K(L.jury.start + 0.6, 22, { tx: JX - 40, tz: JZ, ty: 220, R: 880, th: 16, y: 400 }),
  K(L.v1.start + 0.5, 22, { tx: 60, tz: ZB - 60, ty: 330, R: 980, th: -8, y: 450 }),
  K(L.v2.end, f(L.v2.end - L.v1.start - 0.5), { tx: 40, tz: ZB - 80, ty: 340, R: 1020, th: 6, y: 470 }),
  K(L.end.start + 0.6, 24, { tx: 0, tz: (Z0 + ZB) / 2, ty: 300, R: 1450, th: -18, y: 560 }),
  K(TOTAL_FRAMES / 30, TOTAL_FRAMES - f(L.end.start + 0.6), { tx: 0, tz: (Z0 + ZB) / 2, ty: 300, R: 1400, th: 14, y: 560 }),
]);

const STRIKES = [f(CUE.court), f(L.v1.end) + 2];
/** Gavel angle: lift, then two quick knocks on each strike (matches the knock sound). */
const gavelTilt = (fr: number) => {
  let a = 0;
  for (const s of STRIKES) {
    if (fr < s - 14 || fr > s + 14) continue;
    if (fr < s) a = -0.75 * Math.sin((Math.PI / 2) * Math.min(1, (fr - (s - 14)) / 10)) * (fr > s - 4 ? (s - fr) / 4 : 1);
    else if (fr < s + 5) a = -0.28 * Math.sin((Math.PI * (fr - s)) / 5);
  }
  return a;
};

const SFX: Sfx[] = [
  { at: STRIKES[0] - 1, file: "knock", vol: 0.45 },
  { at: f(L.case.start + 0.1), file: "pop", vol: 0.2 },
  { at: f(L.a1.start - 0.1), file: "whoosh", vol: 0.26 },
  { at: f(CUE.eighty), file: "chime", vol: 0.2 },
  { at: f(CUE.two), file: "chime", vol: 0.2 },
  { at: f(CUE.fraction), file: "chime", vol: 0.2 },
  { at: f(L.jury.start - 0.1), file: "whoosh", vol: 0.24 },
  { at: f(L.v1.start - 0.05), file: "whoosh", vol: 0.22 },
  { at: STRIKES[1] - 1, file: "knock", vol: 0.45 },
  { at: f(L.end.start + 0.05), file: "whoosh", vol: 0.24 },
];

/** The three exhibits: a real one (white) and a replica (gold) of each. */
const EXHIBITS: { id: string; title: string; m: SMesh; s: number; from: number; to: number; realAt: number; repAt: number; real: string; rep: string }[] = [
  { id: "A", title: "SNEAKERS", m: SNEAKER, s: 1.12, from: L.a1.start, to: L.b1.start, realAt: CUE.nine, repAt: CUE.eighty, real: "$900", rep: "$80" },
  { id: "B", title: "WATCH", m: WATCH, s: 0.95, from: L.b1.start, to: L.c1.start, realAt: CUE.five, repAt: CUE.two, real: "$5,000", rep: "$200" },
  { id: "C", title: "SUNGLASSES", m: SHADES, s: 1.15, from: L.c1.start, to: L.jury.start, realAt: CUE.fraction - 0.25, repAt: CUE.fraction, real: "$450", rep: "$40" },
];

const sweepLight = (fr: number): V3 => [Math.sin(fr * 0.03) * 0.8, 0.75, -Math.cos(fr * 0.03) * 0.8];

const world = (c: Cam, fr: number): (Item | null)[] => {
  const it: (Item | null)[] = [];
  const Lt = sweepLight(fr);
  const S = (k: string, m: SMesh, p: V3, col: string, o: Partial<Parameters<typeof solid>[2]> = {}) =>
    it.push(...solid(c, k, { m, xf: { p }, color: col, opacity: 1, light: Lt, tube: true, width: 1.8, reflect: 0.14, ...o }));

  /* the courtroom */
  S("bench", BENCH, [0, 0, ZB], GOLD, { shadow: 0, width: 1.6, glow: 4 });
  S("colL", COLUMN, [-470, 0, ZB + 30], INK, { width: 1.5, reg: false });
  S("colR", COLUMN, [470, 0, ZB + 30], INK, { width: 1.5, reg: false });
  it.push(pawn(c, "judge", { p: [0, 0, ZB + 130], h: 360, opacity: 1 }));
  it.push(spot(c, "jsp", { p: [0, 0, ZB + 130], r: 150, color: GOLD, opacity: 0.55 }));
  S("block", BLOCK, [GV[0], 272, GV[2] + 160], INK, { reflect: 0, reg: false });
  it.push(...solid(c, "gavel", { m: GAVEL, xf: { p: GV, tilt: gavelTilt(fr) }, color: GOLD, accent: INK, opacity: 1, light: Lt, tube: true, width: 1.6, reflect: 0, reg: false }));
  STRIKES.forEach((s, i) => it.push(burst(c, `gb${i}`, { p: [GV[0], 300, GV[2] + 150], t: p01(fr, s, 18), n: 16, spread: 120, color: GOLD })));
  S("rail", RAIL, [JX, 0, JZ - 60], GOLD, { shadow: 0, width: 1.4 });
  [-120, 0, 120].forEach((dx, i) => it.push(pawn(c, `jury${i}`, { p: [JX + dx, 0, JZ + 40], h: 230, opacity: 1 })));
  const js = inn(fr, f(L.jury.start) - 2, 10) * (1 - inn(fr, f(L.v1.start) - 4, 10));
  [-120, 0, 120].forEach((dx, i) => it.push(spot(c, `jsp${i}`, { p: [JX + dx, 0, JZ + 40], r: 70, color: INK, opacity: 0.25 + 0.6 * js })));

  /* the evidence stand */
  // the stand only exists while exhibits are on it (otherwise it would sit in front of the bench shots)
  const stand = inn(fr, f(L.a1.start) - 10, 12) * (1 - inn(fr, f(L.jury.start) - 2, 10));
  if (stand > 0)
    [-1, 1].forEach((sd, i) => {
      it.push(spot(c, `esp${i}`, { p: [sd * IX, 0, Z0], r: 140, color: i ? GOLD : INK, opacity: 0.8 * stand }));
      S(`ped${i}`, pedestalS(112, 44), [sd * IX, 0, Z0], INK, { shadow: 140, width: 1.6, reg: false, opacity: stand });
    });
  EXHIBITS.forEach((ex) => {
    const a = inn(fr, f(ex.from) - 2, 14);
    const out = inn(fr, f(ex.to) - 6, 8);
    const op = a * (1 - out);
    if (op <= 0) return;
    [-1, 1].forEach((sd, i) => {
      const col = i ? GOLD : INK;
      it.push(...solid(c, `ex${ex.id}${i}`, { m: ex.m, xf: { p: [sd * IX, 44 + (1 - a) * -30, Z0], yaw: c.yaw + sd * -0.3, s: ex.s * lerp(0.7, 1, a) * lerp(1, 0.85, out) }, color: col, accent: i ? INK : GOLD, opacity: op, light: Lt, tube: true, width: 1.8 }));
    });
    // the heading gives way to the exhibit's one-line point when it's spoken
    const point = ex.id === "B" ? inn(fr, f(L.b2.start) - 2) : ex.id === "C" ? inn(fr, f(CUE.fraction) + 8) : 0;
    it.push(lineSlab(c, `exl${ex.id}`, [0, 690, Z0], 640, 92, op * (1 - point), GOLD, `EXHIBIT ${ex.id} · ${ex.title}`, 42, true));
    it.push(tagSlab(c, `exr${ex.id}`, [-IX, 470, Z0 - 20], 280, 116, op * inn(fr, f(ex.realAt) - 3), RED, "REAL", ex.real, 56));
    it.push(tagSlab(c, `exp${ex.id}`, [IX, 470, Z0 - 20], 280, 116, op * inn(fr, f(ex.repAt) - 3), GREEN, "REPLICA", ex.rep, 56));
    it.push(burst(c, `exb${ex.id}`, { p: [IX, 470, Z0 + 30], t: p01(fr, f(ex.repAt), 22), color: GREEN, n: 20, spread: 200 }));
  });
  it.push(lineSlab(c, "sameTime", [0, 690, Z0], 460, 84, inn(fr, f(L.b2.start) - 2) * (1 - inn(fr, f(L.c1.start) - 6, 8)), INK, "SAME TIME ✓", 34));
  it.push(lineSlab(c, "tenth", [0, 690, Z0], 520, 84, inn(fr, f(CUE.fraction) + 8) * (1 - inn(fr, f(L.jury.start) - 6, 8)), INK, "≈ 1/10 THE PRICE", 34));

  /* headings over the bench */
  const caseOp = inn(fr, f(L.case.start + 0.55)) * (1 - inn(fr, f(L.a1.start) - 4, 8));
  it.push(slab(c, "case", { p: [0, 620, ZB - 140], w: 700, h: 120, yaw: c.yaw - 0.2, opacity: caseOp, depth: 22, layers: 9, children: <Face col={GOLD}><Big s={66} c={INK}>REAL <span style={{ color: GOLD }}>vs</span> REPLICA</Big></Face> }));
  it.push(lineSlab(c, "jury", [JX - 40, 470, JZ - 40], 600, 84, js, INK, "THE JURY HAS SEEN ENOUGH", 34));
  const v1 = inn(fr, f(L.v1.start) - 2) * (1 - inn(fr, f(L.v2.start) - 4, 8));
  it.push(lineSlab(c, "v1", [0, 560, ZB - 140], 420, 96, v1, INK, "THE VERDICT", 48));
  const v2 = inn(fr, f(L.v2.start) - 2) * (1 - inn(fr, f(L.end.start) - 4, 8));
  it.push(slab(c, "v2", { p: [0, 560, ZB - 140], w: 580, h: 140, yaw: c.yaw - 0.2, opacity: v2, depth: 24, layers: 10, children: <Face col={GOLD} solid><Small c="#000">VERDICT</Small><Big s={64}>REPLICA WINS</Big></Face> }));
  it.push(burst(c, "vb", { p: [0, 620, ZB - 100], t: p01(fr, f(CUE.wallet), 26), n: 28, spread: 360 }));
  it.push(lineSlab(c, "agree", [0, 640, (Z0 + ZB) / 2], 560, 110, inn(fr, f(CUE.agree) - 6), GOLD, "DO YOU AGREE?", 60, true));
  // the white bag rests on the bench as the case file
  it.push(...solid(c, "file", { m: BAG_S, xf: { p: [-230, 272, ZB - 30], yaw: c.yaw + 0.4, s: 0.38 }, color: INK, accent: GOLD, opacity: 1, reflect: 0, reg: false, width: 1.3, light: Lt, tube: true }));
  return it;
};

export const layoutFrame = (fr: number) => {
  setView(VIEW_TT);
  world(camAt(fr), fr);
};

/** "Real vs Replica: The Trial" — a courtroom where three exhibits face the jury. */
export const Court: React.FC = () => {
  const fr = useCurrentFrame();
  setView(VIEW_TT);
  const c = camAt(fr);
  const items = [floor(c, [], 0.9, true), ...motes(c, fr), ...(world(c, fr).filter(Boolean) as Item[])];
  items.sort((a, b) => b.z - a.z);
  const nodes = items.map((i) => i.node);
  const mb = Math.max(0, Math.min(2, (camSpeed(fr) - 40) / 20));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 60% at 46% 36%, #121216 0%, #000 72%)" }} />
      <AbsoluteFill style={{ filter: mb > 0.2 ? `blur(${mb.toFixed(2)}px)` : undefined }}>
        <AbsoluteFill>{nodes}</AbsoluteFill>
        <AbsoluteFill style={{ filter: "blur(7px) brightness(1.35) saturate(1.2)", mixBlendMode: "screen", opacity: 0.5 }}>{nodes}</AbsoluteFill>
        <AbsoluteFill style={{ filter: "blur(24px) brightness(1.5) saturate(1.3)", mixBlendMode: "screen", opacity: 0.4 }}>{nodes}</AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 70% at 46% 38%, transparent 55%, rgba(0,0,0,0.8) 100%)", pointerEvents: "none" }} />
      <WordCaptions words={WORDS} emphasis={EMPHASIS} top={CAPTION_TOP} cx={SAFE_CX} smooth />
      <Audio src={staticFile("voice/court-narration.wav")} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
export const COURT_FRAMES = TOTAL_FRAMES;
