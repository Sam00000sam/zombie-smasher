import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { lerp } from "../v2/anim";
import { p01 } from "../v5/smooth";
import { burst, Cam, floor, GOLD, GREEN, INK, Item, line3, motes, RED, setView, spot } from "../v6/engine";
import { WordCaptions } from "../v6/WordCaptions";
import { BAG_S, pedestalS, ringS } from "./models";
import { key, makeRig, Rig } from "./rig";
import { solid } from "./solid";
import { CUE, EMPHASIS, f, TOTAL_FRAMES, WORDS } from "./spotTiming";
import { CAPTION_TOP, inn, lineSlab, SAFE_CX, Sfx, SfxTrack, tagSlab, VIEW_TT } from "./ui";

const Z0 = 1200;
const BX = 210;
const base: Rig = { tx: 0, ty: 220, tz: Z0, R: 1150, th: 0, y: 430 };
const K = (t: number, dur: number, r: Partial<Rig>) => key(f(t), dur, r, base);
/** Close on a point of one bag: (x, y) on its front face. */
const close = (x: number, y: number, R: number, th: number): Partial<Rig> => ({ tx: x, ty: y, tz: Z0 - 50, R, th, y: y + 90 });

const { camAt, camSpeed } = makeRig([
  K(0, 1, { th: -24, R: 1200 }),
  K(CUE.stitch - 0.2, f(CUE.stitch - 0.2), { th: 14, R: 1100 }),
  // stitching: dive to A's seam, then glide across to B's
  K(CUE.stitch + 0.45, 20, close(-BX, 80, 560, 8)),
  K(CUE.either - 0.5, f(CUE.either - 0.5 - CUE.stitch - 0.45), close(-BX, 80, 540, -4)),
  K(CUE.either + 0.55, 32, close(BX, 80, 560, -8)),
  // hardware: the lock on A, then on B
  K(CUE.hardware + 0.5, 30, close(-BX, 150, 500, 10)),
  K(CUE.weight - 0.45, f(CUE.weight - 0.45 - CUE.hardware - 0.5), close(-BX, 150, 480, 2)),
  K(CUE.weight + 0.55, 30, close(BX, 150, 500, -10)),
  // shape: swing round to the side for the silhouettes
  K(CUE.shape + 0.4, 24, { th: 70, R: 1050, y: 520, ty: 200 }),
  K(CUE.give - 0.25, f(CUE.give - 0.25 - CUE.shape - 0.4), { th: 112, R: 1000, y: 520, ty: 200 }),
  // give up? back to the front
  K(CUE.give + 0.5, 24, { th: 0, R: 1150 }),
  K(CUE.three, f(CUE.three - CUE.give - 0.5), { th: -8, R: 1100 }),
  K(CUE.arm, f(CUE.arm - CUE.three), { th: 12, R: 1040 }),
  K(TOTAL_FRAMES / 30, TOTAL_FRAMES - f(CUE.arm), { th: -18, R: 1120 }),
]);

const SFX: Sfx[] = [
  { at: f(0.5), file: "pop", vol: 0.28 },
  { at: f(CUE.stitch - 0.15), file: "whoosh", vol: 0.32 },
  { at: f(CUE.even), file: "pop", vol: 0.22 },
  { at: f(CUE.hardware - 0.1), file: "whoosh", vol: 0.32 },
  { at: f(CUE.gold), file: "pop", vol: 0.22 },
  { at: f(CUE.shape - 0.1), file: "whoosh", vol: 0.3 },
  { at: f(CUE.give + 0.05), file: "whoosh", vol: 0.28 },
  { at: f(CUE.three), file: "chime", vol: 0.24 },
  { at: f(CUE.hundred - 0.2), file: "chime", vol: 0.24 },
];

const world = (c: Cam, fr: number): (Item | null)[] => {
  const it: (Item | null)[] = [];
  // the bags face the camera, with a slow sway so their depth reads
  const yawB = c.yaw + Math.sin(fr * 0.03) * 0.12;
  const reveal = inn(fr, f(CUE.three) - 4);
  [-1, 1].forEach((sd, i) => {
    const x = sd * BX;
    const lit = i === 0 ? lerp(1, 1.2, reveal) : 1;
    it.push(spot(c, `sp${i}`, { p: [x, 0, Z0], r: 150, color: INK, opacity: 0.75 * lit }));
    it.push(...solid(c, `pd${i}`, { m: pedestalS(125, 50), xf: { p: [x, 0, Z0] }, color: INK, opacity: 1, shadow: 160, width: 1.8, reg: false }));
    it.push(...solid(c, `bag${i}`, { m: BAG_S, xf: { p: [x, 50, Z0], yaw: yawB }, color: INK, accent: GOLD, opacity: 1, reflect: 0 }));
    // A / B
    // shown wide only: hidden for the close-ups and the side-on shape shot
    const ab = inn(fr, f(0.55)) * (1 - inn(fr, f(CUE.stitch) - 6, 8)) + inn(fr, f(CUE.give) + 8) * (1 - inn(fr, f(CUE.three) - 8, 8));
    it.push(lineSlab(c, `ab${i}`, [x, 390, Z0], 110, 96, ab, GOLD, i ? "B" : "A", 64));
  });
  it.push(lineSlab(c, "title", [0, 740, Z0], 640, 110, inn(fr, f(CUE.spot) - 3) * (1 - inn(fr, f(CUE.stitch) - 4, 8)), GOLD, "SPOT THE FAKE", 62, true));

  // stitching
  const st = (i: number, at: number) => inn(fr, at) * (1 - inn(fr, f(CUE.hardware) - 6, 8));
  [-1, 1].forEach((sd, i) => {
    const at = i ? f(CUE.either) + 4 : f(CUE.even) - 3;
    const a = st(i, at);
    it.push(...solid(c, `ring${i}`, { m: ringS(58, 9, 8), xf: { p: [sd * BX, 70, Z0 - 64], yaw: c.yaw, s: lerp(1.4, 1, a) }, color: GOLD, opacity: a, reflect: 0, reg: false, width: 2 }));
    it.push(tagSlab(c, `stt${i}`, [sd * BX, 318, Z0 - 70], 300, 96, a, GREEN, "STITCHING", "✓ EVEN · TIGHT", 34));
  });
  // hardware
  const hw = (at: number) => inn(fr, at) * (1 - inn(fr, f(CUE.shape) - 6, 8));
  [-1, 1].forEach((sd, i) => {
    const at = i ? f(CUE.weight) + 2 : f(CUE.gold) - 3;
    const a = hw(at);
    it.push(...solid(c, `hring${i}`, { m: ringS(40, 7, 7), xf: { p: [sd * BX, 150, Z0 - 60], yaw: c.yaw, s: lerp(1.4, 1, a) }, color: GOLD, opacity: a, reflect: 0, reg: false, width: 2 }));
    it.push(tagSlab(c, `hwt${i}`, [sd * BX, 375, Z0 - 70], 300, 96, a, GOLD, i ? "WEIGHT" : "HARDWARE", i ? "✓ SAME" : "✓ GOLD FINISH", 34));
    it.push(burst(c, `hb${i}`, { p: [sd * BX, 150, Z0 - 70], t: p01(fr, at + 2, 22), n: 14, spread: 110 }));
  });
  // shape: matching height lines beside each bag
  const sh = inn(fr, f(CUE.shape) - 2, 18) * (1 - inn(fr, f(CUE.give) + 4, 8));
  [-1, 1].forEach((sd, i) => {
    const x = sd * BX + 135;
    it.push(line3(c, `dim${i}`, { pts: [[x, 52, Z0], [x, 292, Z0]], p: sh, color: GOLD, width: 3.5, opacity: sh }));
    it.push(line3(c, `dimt${i}`, { pts: [[x - 16, 292, Z0], [x + 16, 292, Z0]], p: sh, color: GOLD, width: 3.5, opacity: sh }));
    it.push(line3(c, `dimb${i}`, { pts: [[x - 16, 52, Z0], [x + 16, 52, Z0]], p: sh, color: GOLD, width: 3.5, opacity: sh }));
  });
  it.push(lineSlab(c, "shape", [0, 640, Z0], 520, 96, inn(fr, f(CUE.exactly) - 4) * (1 - inn(fr, f(CUE.give) - 8, 8)), GOLD, "SAME SHAPE", 54));
  // give up?
  const gv = inn(fr, f(CUE.give) - 2) * (1 - inn(fr, f(CUE.three) - 8, 8));
  it.push(lineSlab(c, "give", [0, 740, Z0], 460, 110, gv, INK, "GIVE UP?", 62));
  // the reveal
  it.push(tagSlab(c, "pA", [-BX, 420, Z0], 310, 120, inn(fr, f(CUE.three) - 4), RED, "PRICE", "$3,000", 60));
  it.push(tagSlab(c, "pB", [BX, 420, Z0], 310, 120, inn(fr, f(CUE.hundred) - 8), GREEN, "PRICE", "$100", 60));
  it.push(burst(c, "rb", { p: [BX, 420, Z0 - 30], t: p01(fr, f(CUE.hundred) - 4, 24), color: GREEN }));
  const same = inn(fr, f(CUE.same) - 3) * (1 - inn(fr, f(CUE.which) - 6, 8));
  it.push(lineSlab(c, "same", [0, 740, Z0], 700, 100, same, GOLD, "SAME BAG ON YOUR ARM", 50, true));
  it.push(lineSlab(c, "which", [0, 760, Z0], 700, 100, inn(fr, f(CUE.which) - 3), GOLD, "WHICH DID YOU PICK?", 52, true));
  it.push(lineSlab(c, "tell", [0, 640, Z0], 560, 76, inn(fr, f(CUE.tell) - 3), INK, "TELL ME IN THE COMMENTS", 32));
  return it;
};

export const layoutFrame = (fr: number) => {
  setView(VIEW_TT);
  world(camAt(fr), fr);
};

/** "Spot the Fake": an inspection game around two identical bags, then the price reveal. */
export const Spot: React.FC = () => {
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
      <Audio src={staticFile("voice/spot-narration.wav")} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
export const SPOT_FRAMES = TOTAL_FRAMES;
