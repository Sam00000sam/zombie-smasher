import N from "./narration.json";

/** Timing for "5 Reasons", derived from voiceover/scripts/v8-top5.json (+ Whisper word times). */
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
export const L = { hook: line("hook"), r5: line("r5"), r4: line("r4"), r3: line("r3"), r2: line("r2"), r1: line("r1"), end: line("end") };

export const CUE = {
  fake: word("fake"),
  real: word("real"),
  stay: word("stay"),
  price: word("price"),
  three: word("three"),
  hundred: word("hundred"),
  same: word("same"),
  thirty: word("thirty"),
  youll: word("you'll"),
  use: word("use"),
  no1: word("no", L.r4.start),
  no2: word("no", word("no", L.r4.start) + 0.1),
  no3: word("panic") - 0.12,
  rains: word("rains"),
  nobody: word("nobody"),
  from: word("from"),
  room: word("room"),
  realThing: word("real", L.r3.start),
  trends: word("trends"),
  hype: word("hype"),
  dies: word("dies"),
  lost: word("lost"),
  hundred2: word("hundred", L.r2.start),
  three2: word("three", L.r2.start),
  money: word("money"),
  keep: word("keep"),
  invest: word("invest"),
  years: word("years"),
  five2: word("five", L.r1.start),
  realEnd: word("real", L.end.start),
  fakeEnd: word("fake", L.end.start),
  tell: word("tell", L.end.start),
  speechEnd: L.end.end,
};
export const TOTAL_FRAMES = f(N.duration);

/** The countdown: each reason's number card runs from its line start until its title is spoken. */
export const CHAPTERS = [
  { n: 5, title: "THE PRICE", from: L.r5.start, until: word("the", L.r5.start), next: L.r4.start },
  { n: 4, title: "YOU'LL USE IT", from: L.r4.start, until: CUE.youll, next: L.r3.start },
  { n: 3, title: "NOBODY CAN TELL", from: L.r3.start, until: CUE.nobody, next: L.r2.start },
  { n: 2, title: "TRENDS MOVE FAST", from: L.r2.start, until: CUE.trends, next: L.r1.start },
  { n: 1, title: "THE MONEY YOU KEEP", from: L.r1.start, until: word("the", L.r1.start), next: L.end.start },
];
