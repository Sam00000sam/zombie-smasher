/**
 * Render review stills for a composition and tile them into a contact sheet with TikTok's overlay
 * zones shaded red (top tabs, right-hand buttons, bottom caption area).
 *
 *   node scripts/stills.mjs <CompositionId> <outDir> [frames...|--every N]
 *
 * Bundles once, renders at half size, writes <outDir>/contact.png. Uses the pre-installed headless
 * Chromium (set BROWSER to override).
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const BROWSER = process.env.BROWSER ?? "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const [id, out, ...rest] = process.argv.slice(2);
if (!id || !out) throw new Error("usage: node scripts/stills.mjs <CompositionId> <outDir> [frames...|--every N]");
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(out)) if (/^s\d+\.png$/.test(f)) fs.rmSync(path.join(out, f));

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, browserExecutable: BROWSER });
let frames = rest.map(Number);
if (rest[0] === "--every") {
  const n = Number(rest[1]);
  frames = [];
  for (let fr = Math.round(n / 2); fr < composition.durationInFrames; fr += n) frames.push(fr);
}
if (!frames.length) for (let i = 0; i < 22; i++) frames.push(Math.round(((i + 0.5) / 22) * composition.durationInFrames));
for (const fr of frames) {
  await renderStill({ serveUrl, composition, frame: fr, output: path.join(out, `s${String(fr).padStart(5, "0")}.png`), scale: 0.5, browserExecutable: BROWSER });
}
const cols = Math.min(11, frames.length);
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-pattern_type", "glob", "-i", path.join(out, "s[0-9]*.png"),
  "-vf", `drawbox=x=0:y=0:w=540:h=75:color=red@0.3:t=fill,drawbox=x=470:y=300:w=70:h=450:color=red@0.3:t=fill,drawbox=x=0:y=780:w=540:h=180:color=red@0.3:t=fill,scale=240:-1,tile=${cols}x${Math.ceil(frames.length / cols)}`,
  "-update", "1", path.join(out, "contact.png")]);
console.log(`frames: ${frames.join(" ")}\ncontact sheet: ${path.join(out, "contact.png")}`);
