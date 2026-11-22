import N from "./narration.json";

/** Timing for "Spot the Fake" (voiceover/scripts/v12-spot.json + Whisper word times). */
export const f = (s: number) => Math.round(s * 30);
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9'-]/g, "");
export const WORDS = N.words;
const line = (k: string) => {
  const l = N.lines.find((x) => x.key === k);
  if (!l) throw new Error(`line ${k} missing`);
  return l;
};
const word = (w: string, after = 0) => {
  const x = N.words.find((y) => norm(y.w) === w && y.start >= after);
  if (!x) throw new Error(`word ${w} missing`);
  return x.start;
};
const L = { stitch: line("stitch"), hardware: line("hardware"), shape: line("shape"), give: line("give"), reveal: line("reveal"), end: line("end") };
export const CUE = {
  spot: word("spot"),
  stitch: L.stitch.start,
  even: word("even"),
  either: word("either"),
  hardware: L.hardware.start,
  gold: word("gold"),
  weight: word("weight"),
  shape: L.shape.start,
  exactly: word("exactly"),
  give: L.give.start,
  three: word("three", L.reveal.start),
  hundred: word("about", L.reveal.start),
  same: word("same", L.reveal.start),
  arm: word("arm"),
  which: word("which", L.end.start),
  tell: word("tell", L.end.start),
};
export const TOTAL_FRAMES = f(N.duration);
export const EMPHASIS = ["fake", "spot", "stitching", "even", "tight", "threads", "hardware", "gold", "weight", "shape", "exactly", "difference", "three", "thousand", "hundred", "same", "pick", "comments"];
