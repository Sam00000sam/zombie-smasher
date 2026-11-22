import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { lerp } from "../v2/anim";
import { p01 } from "../v5/smooth";
import { burst, Cam, floor, GOLD, GREEN, INK, Item, motes, RED, setView, spot, V3 } from "../v6/engine";
import { WordCaptions } from "../v6/WordCaptions";
import { BAG_S, PAWN_S, pedestalS, shelfS } from "../v12/models";
import { key, makeRig, Rig } from "../v12/rig";
import { solid } from "../v12/solid";
import { CAPTION_TOP, inn, lineSlab, SAFE_CX, Sfx, SfxTrack, tagSlab, VIEW_TT } from "../v12/ui";
import { CUE, EMPHASIS, f, L, TOTAL_FRAMES, WORDS } from "./timing";

const Z0 = 1200;
const ONE_X = -270;
const SH_X = 170;
const CUB = 86;
const COLS = 5;
const ROWS = 6;
const PALETTE = ["#ffd04d", "#36e3a3", "#ff6fb1", "#5ab8ff", "#ffffff", "#ff9f43", "#b48cff", "#ff4a5a"];
/** Cubby k (0-29): its bag's base position and colour. */
const cubby = (k: number): { p: V3; col: string } => {
  const col = k % COLS;
  const row = Math.floor(k / COLS);
  return { p: [SH_X - (COLS * CUB + 8) / 2 + 4 + CUB / 2 + col * CUB, row * CUB + 8, Z0], col: PALETTE[(k * 3 + row) % PALETTE.length] };
};
const SCUFF = 12;
const PAWNS = [
  { x: -300, col: "#ff6fb1", one: false, label: "WORK" },
  { x: -150, col: "#ffffff", one: true, label: "GYM" },
  { x: 0, col: "#5ab8ff", one: false, label: "DATE NIGHT" },
  { x: 150, col: "#d9d9d9", one: true, label: "WEEKEND" },
  { x: 300, col: "#36e3a3", one: false, label: "" },
];
const PZ = Z0 - 330;

const base: Rig = { tx: 60, ty: 250, tz: Z0, R: 1060, th: 0, y: 430 };
const K = (t: number, dur: number, r: Partial<Rig>) => key(f(t), dur, r, base);
const { camAt, camSpeed, rigAt } = makeRig([
  K(0, 1, { th: -20 }),
  K(L.math.start - 0.1, f(L.math.start - 0.1), { th: 14 }),
  K(L.math.start + 1.0, 30, { tx: SH_X, ty: 280, R: 1000, th: 8 }),
  K(L.match.start - 0.2, f(L.match.start - 1.2 - L.math.start), { tx: SH_X, ty: 280, R: 960, th: -2 }),
  K(L.match.start + 0.6, 26, { tx: 0, ty: 230, tz: Z0 - 120, R: 1180, th: -12, y: 500 }),
  K(L.plans.end, f(L.plans.end - L.match.start - 0.6), { tx: 0, ty: 230, tz: Z0 - 120, R: 1130, th: 14, y: 500 }),
  K(CUE.scuffed + 0.3, 26, { tx: cubby(SCUFF).p[0], ty: 230, R: 640, th: 10, y: 360 }),
  K(L.scuff.end, f(L.scuff.end - CUE.scuffed - 0.3), { tx: cubby(SCUFF).p[0], ty: 230, R: 600, th: 2, y: 350 }),
  K(L.end.start + 0.6, 26, { tx: 30, ty: 250, tz: Z0 - 60, R: 1160, th: -16, y: 470 }),
  K(TOTAL_FRAMES / 30, TOTAL_FRAMES - f(L.end.start + 0.6), { tx: 30, ty: 250, tz: Z0 - 60, R: 1110, th: 10, y: 470 }),
]);

const SFX: Sfx[] = [
  { at: f(0.35), file: "pop", vol: 0.24 },
  { at: f(CUE.thirty), file: "shimmer", vol: 0.3 },
  { at: f(L.math.start - 0.05), file: "whoosh", vol: 0.3 },
  { at: f(CUE.years), file: "pop", vol: 0.24 },
  { at: f(L.match.start - 0.1), file: "whoosh", vol: 0.28 },
  { at: f(CUE.thirty2), file: "pop", vol: 0.24 },
  { at: f(CUE.scuffed - 0.25), file: "whoosh", vol: 0.28 },
  { at: f(CUE.twentyNine), file: "chime", vol: 0.22 },
  { at: f(L.end.start + 0.05), file: "whoosh", vol: 0.26 },
];

const world = (c: Cam, fr: number): (Item | null)[] => {
  const it: (Item | null)[] = [];
  const sway = Math.sin(fr * 0.03) * 0.12;
  // the one designer bag
  it.push(spot(c, "o-sp", { p: [ONE_X, 0, Z0], r: 150, color: INK, opacity: 0.75 }));
  it.push(...solid(c, "o-pd", { m: pedestalS(120, 46), xf: { p: [ONE_X, 0, Z0] }, color: INK, opacity: 1, shadow: 150, width: 1.8, reg: false }));
  it.push(...solid(c, "o-bag", { m: BAG_S, xf: { p: [ONE_X, 46, Z0], yaw: c.yaw + 0.3 + sway, s: 0.95 }, color: INK, accent: GOLD, opacity: 1 }));
  // the two price tags belong to the wide opening; after that the headline carries the story
  const topOut = inn(fr, f(CUE.hundred) - 8, 8);
  it.push(tagSlab(c, "o-tag", [ONE_X, 395, Z0 - 20], 260, 116, inn(fr, f(0.35) - 2) * (1 - topOut), RED, "1 DESIGNER BAG", "$3,000", 56));

  // the shelf of thirty
  it.push(...solid(c, "shelf", { m: shelfS(COLS, ROWS, CUB, 8, 92), xf: { p: [SH_X, 0, Z0 + 4] }, color: GOLD, opacity: 0.95, shadow: 0, reflect: 0.12, width: 1.4, glow: 4 }));
  const month = Math.min(30, Math.floor(30 * p01(fr, f(CUE.every) - 2, f(CUE.years + 0.1) - f(CUE.every) + 2)));
  for (let k = 0; k < 30; k++) {
    const cb = cubby(k);
    const a = inn(fr, f(CUE.thirty) + Math.round(k * 1.3), 8);
    const lifted = month > 0 && k === month - 1 && fr < f(CUE.years) + 6 ? 1 : 0;
    const lost = k === SCUFF ? p01(fr, f(CUE.lost) + 2, 14) : 0;
    const col = k === SCUFF && fr > f(CUE.scuffed) ? lerp(0, 1, inn(fr, f(CUE.scuffed), 6)) > 0.5 ? RED : cb.col : cb.col;
    it.push(...solid(c, `b${k}`, { m: BAG_S, xf: { p: [cb.p[0], cb.p[1] + lifted * 16 + lost * 120, cb.p[2] - lost * 60], yaw: c.yaw + sway, s: 0.27 * lerp(0.6, 1, a) * (1 + lifted * 0.15) }, color: col, opacity: a * (1 - lost), reflect: 0, width: 1.2, glow: 3, reg: false }));
  }
  it.push(burst(c, "lostb", { p: [cubby(SCUFF).p[0], cubby(SCUFF).p[1] + 60, Z0 - 60], t: p01(fr, f(CUE.lost) + 4, 22), color: RED, n: 16, spread: 120 }));
  it.push(tagSlab(c, "s-tag", [SH_X, 640, Z0 - 20], 300, 116, inn(fr, f(CUE.thirty) - 2) * (1 - topOut), GREEN, "30 REPLICAS", "$3,000", 56));

  // the headline slab above everything, one statement at a time
  const head = (k: string, at: number, until: number, col: string, text: React.ReactNode, w = 620, solidFace = false) =>
    it.push(lineSlab(c, k, [rigAt(fr).tx, 725, Z0 - 40], w, 96, inn(fr, at - 3) * (1 - inn(fr, until - 6, 8)), col, text, 46, solidFace));
  head("h-each", f(CUE.hundred) - 2, f(CUE.every) - 2, GREEN, "$100 EACH");
  head("h-month", f(CUE.every) - 2, f(CUE.years), GOLD, `MONTH ${Math.max(1, month)} OF 30`);
  head("h-years", f(CUE.years), f(L.match.start), GOLD, "2.5 YEARS OF NEW STYLES", 700, true);
  head("h-plan", f(CUE.every2) - 2, f(L.scuff.start), GOLD, "A BAG FOR EVERY PLAN", 660, true);
  head("h-29", f(CUE.twentyNine) - 2, f(L.end.start), GREEN, "29 LEFT", 380, true);
  head("h-q", f(CUE.logo) - 2, TOTAL_FRAMES + 99, GOLD, "ONE LOGO OR 30 LOOKS?", 700, true);

  // the outfits
  const po = inn(fr, f(L.match.start) - 4, 14) * (1 - inn(fr, f(L.scuff.start) - 4, 10)) + inn(fr, f(L.end.start) + 4, 14);
  const some = inn(fr, f(CUE.matches) - 2);
  const all = inn(fr, f(CUE.thirty2) - 2);
  PAWNS.forEach((pw, i) => {
    const lit = pw.one ? 1 : lerp(1, 0.3, some * (1 - all));
    it.push(spot(c, `p-sp${i}`, { p: [pw.x, 0, PZ], r: 80, color: pw.col, opacity: po * lit * 0.8 * Math.max(some, 0.3) }));
    it.push(...solid(c, `p${i}`, { m: PAWN_S, xf: { p: [pw.x, 0, PZ], s: 0.72 }, color: pw.col, opacity: po * lit, shadow: 60, reflect: 0.12, width: 1.6, glow: 5 }));
    const own = pw.one ? some : all;
    it.push(...solid(c, `pb${i}`, { m: BAG_S, xf: { p: [pw.x + 58, 40, PZ - 20], yaw: c.yaw + 0.3, s: 0.3 * lerp(0.5, 1, own) }, color: pw.one && all < 0.5 ? INK : pw.col, opacity: po * own, reflect: 0, width: 1.3, glow: 3, reg: false }));
    if (pw.label) {
      const at = [f(CUE.work), f(CUE.gym), f(CUE.date), f(CUE.weekend)][i] - 3;
      it.push(lineSlab(c, `pl${i}`, [pw.x, 28, PZ - 230], 140, 52, po * inn(fr, at) * (1 - inn(fr, f(L.scuff.start) - 6, 8)), pw.col, pw.label, 20));
    }
  });
  return it;
};

export const layoutFrame = (fr: number) => {
  setView(VIEW_TT);
  world(camAt(fr), fr);
};

/** "One Bag or Thirty": the same $3,000 as one designer bag or a shelf of thirty styles. */
export const Thirty: React.FC = () => {
  const fr = useCurrentFrame();
  setView(VIEW_TT);
  const c = camAt(fr);
  const items = [floor(c, [], 1, true), ...motes(c, fr), ...(world(c, fr).filter(Boolean) as Item[])];
  items.sort((a, b) => b.z - a.z);
  const mb = Math.max(0, Math.min(2, (camSpeed(fr) - 40) / 20));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 60% at 46% 36%, #0e0e14 0%, #000 72%)" }} />
      <AbsoluteFill style={{ filter: mb > 0.2 ? `blur(${mb.toFixed(2)}px)` : undefined }}>{items.map((i) => i.node)}</AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 70% at 46% 38%, transparent 55%, rgba(0,0,0,0.78) 100%)", pointerEvents: "none" }} />
      <WordCaptions words={WORDS} emphasis={EMPHASIS} top={CAPTION_TOP} cx={SAFE_CX} smooth />
      <Audio src={staticFile("voice/thirty-narration.wav")} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
export const THIRTY_FRAMES = TOTAL_FRAMES;
