import N from "./narration.json";

/** Timing for "Real vs Replica: The Trial" (voiceover/scripts/v15-court.json + Whisper word times). */
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
export const L = Object.fromEntries(["order", "case", "a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "jury", "v1", "v2", "end"].map((k) => [k, line(k)])) as Record<string, { start: number; end: number }>;
export const CUE = {
  court: word("court"),
  nine: word("nine"),
  eighty: word("eighty"),
  five: word("five", L.b3.start),
  two: word("two", L.b3.start),
  fraction: word("fraction"),
  wallet: word("wallet"),
  agree: word("agree"),
};
export const TOTAL_FRAMES = f(N.duration);
export const EMPHASIS = ["order", "court", "real", "replica", "sneakers", "nine", "hundred", "eighty", "watch", "same", "time", "five", "thousand", "two", "sunglasses", "fraction", "jury", "verdict", "wallet", "wins", "agree", "comments"];
