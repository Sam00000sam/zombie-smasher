import N from "./narration.json";

/** Timing for "What It Really Costs", from voiceover/scripts/v11-hours.json (+ Whisper word times). */
export const FPS = 30;
export const f = (s: number) => Math.round(s * FPS);
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
export const L = { hook: line("hook"), hours: line("hours"), replica: line("replica"), gap: line("gap"), spend: line("spend"), end: line("end") };

export const CUE = {
  three: word("three"),
  but: word("but"),
  earn: word("earn"),
  thats150: word("that's", L.hours.start),
  work: word("work"),
  almost: word("almost"),
  hundred100: word("hundred", L.replica.start),
  thats5: word("that's", L.replica.start),
  less: word("less"),
  fortyFive: word("forty-five"),
  twentyNine: word("twenty-nine"),
  back: word("back"),
  trip: word("weekend"),
  phone: word("new"),
  fund: word("fully"),
  same: word("same"),
  so: word("so", L.end.start),
};
export const TOTAL_FRAMES = f(N.duration);
export const EMPHASIS = ["designer", "three", "thousand", "really", "twenty", "hundred", "fifty", "hours", "month", "clock", "replica", "five", "shift", "forty-five", "twenty-nine", "pocket", "weekend", "trip", "phone", "emergency", "fund", "same", "logo", "worth"];
