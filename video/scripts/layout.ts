/**
 * Layout check without rendering: runs a composition's world for every Nth frame and reports text
 * slabs that overlap each other, cover 3D objects, or land under the captions / TikTok's overlay.
 *
 *   npx tsx scripts/layout.ts <module, e.g. src/v11/Hours.tsx> [step=2]
 *
 * The module must export `layoutFrame(frame)` and `<NAME>_FRAMES` (any export ending in _FRAMES).
 * Only boxes with opacity > 0.3 count (see `reg` in src/v11/three.tsx).
 */
import path from "node:path";
import { pathToFileURL } from "node:url";

type Box = { key: string; kind: "text" | "obj"; x0: number; y0: number; x1: number; y1: number; op: number };
const [modPath, stepArg] = process.argv.slice(2);
const main = async () => {
const mod = await import(pathToFileURL(path.resolve(modPath)).href);
const total: number = Object.entries(mod).find(([k]) => k.endsWith("_FRAMES"))?.[1] as number;
const step = Number(stepArg ?? 2);

const ZONES = [
  { key: "CAPTIONS", x0: 60, y0: 1240, x1: 940, y1: 1400 },
  { key: "TIKTOK-TOP", x0: 0, y0: 0, x1: 1080, y1: 150 },
  { key: "TIKTOK-BUTTONS", x0: 945, y0: 600, x1: 1080, y1: 1500 },
  { key: "TIKTOK-BOTTOM", x0: 0, y0: 1460, x1: 1080, y1: 1920 },
];
const inter = (a: { x0: number; y0: number; x1: number; y1: number }, b: typeof a) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
const area = (a: { x0: number; y0: number; x1: number; y1: number }) => (a.x1 - a.x0) * (a.y1 - a.y0);

const hits = new Map<string, number[]>();
const note = (k: string, fr: number) => (hits.get(k) ?? hits.set(k, []).get(k)!).push(fr);
for (let fr = 0; fr < total; fr += step) {
  (globalThis as { __LAYOUT?: Box[] }).__LAYOUT = [];
  mod.layoutFrame(fr);
  const boxes = (globalThis as { __LAYOUT?: Box[] }).__LAYOUT!;
  const texts = boxes.filter((b) => b.kind === "text");
  for (let i = 0; i < texts.length; i++) {
    const a = texts[i];
    // only judge boxes that are mostly on screen
    const vis = inter(a, { x0: 0, y0: 0, x1: 1080, y1: 1920 }) / area(a);
    if (vis < 0.6) continue;
    if (vis < 0.98) note(`OFF-FRAME  ${a.key}`, fr);
    for (let j = i + 1; j < texts.length; j++) {
      const b = texts[j];
      if (inter(a, b) / Math.min(area(a), area(b)) > 0.04) note(`TEXT×TEXT  ${a.key} / ${b.key}`, fr);
    }
    for (const o of boxes.filter((x) => x.kind === "obj")) if (inter(a, o) / area(a) > 0.18) note(`TEXT×OBJ   ${a.key} / ${o.key}`, fr);
    for (const z of ZONES) if (inter(a, z) / area(a) > 0.03) note(`ZONE       ${a.key} in ${z.key}`, fr);
  }
}
if (!hits.size) console.log(`layout OK (${Math.ceil(total / step)} frames checked)`);
for (const [k, frs] of [...hits.entries()].sort((a, b) => a[1][0] - b[1][0])) {
  const s = (x: number) => (x / 30).toFixed(1);
  console.log(`${k.padEnd(52)} ${frs.length * step} frames  ${s(frs[0])}s–${s(frs[frs.length - 1])}s`);
}
};
main();
