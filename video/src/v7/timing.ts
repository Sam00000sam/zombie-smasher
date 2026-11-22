import N from "./narration.json";

/** Timing for "Real or Fake?", derived from voiceover/scripts/v7-realorfake.json (+ Whisper word times). */
export const FPS = 30;
export const f = (s: number) => Math.round(s * FPS);
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");

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
export const L = {
  hook: line("hook"),
  price: line("price"),
  closet: line("closet"),
  wear: line("wear"),
  fearless: line("fearless"),
  test: line("test"),
  lost: line("lost"),
  resale: line("resale"),
  seen: line("seen"),
  end: line("end"),
};

export const CUE = {
  win: word("win"),
  designer: word("designer"),
  three: word("three"),
  good: word("good"),
  replica: word("replica"),
  hundred: word("hundred"),
  scared: word("scared"),
  sits: word("sits"),
  closet: word("closet"),
  cost: word("cost", L.wear.start),
  carry: word("carry"),
  every: word("every"),
  year: word("year"),
  less: word("less"),
  thirty: word("thirty"),
  concerts: word("concerts"),
  airports: word("airports"),
  rainy: word("rainy"),
  everywhere: word("everywhere"),
  zero: word("zero"),
  test: word("test"),
  try: word("try"),
  hundred2: word("hundred", L.test.start),
  commit: word("commit"),
  stolen: word("stolen"),
  lost: word("lost"),
  out: word("out"),
  not: word("not", L.lost.start),
  months: word("month's"),
  investment: word("investment"),
  resell: word("resell"),
  less2: word("less", L.resale.start),
  nobody: word("nobody"),
  receipt: word("receipt"),
  see: word("see", L.seen.start),
  carry2: word("carry", L.seen.start),
  keep: word("keep"),
  money: word("money"),
  real2: word("real", L.end.start),
  pick: word("pick"),
  speechEnd: L.end.end,
};
export const TOTAL_FRAMES = f(N.duration);

export const EMPHASIS = [
  "real", "fake", "win", "three", "thousand", "hundred", "scared", "closet", "cost", "wear", "year", "thirty", "cents",
  "concerts", "airports", "rainy", "everywhere", "zero", "stress", "test", "style", "commit", "stolen", "lost",
  "month's", "investment", "less", "nobody", "receipt", "carry", "look", "money", "pick",
];
