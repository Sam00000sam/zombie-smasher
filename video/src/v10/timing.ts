import N from "./narration.json";

/** Timing for "Follow the Money", derived from voiceover/scripts/v10-journey.json (+ Whisper word times). */
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
export const L = { hook: line("hook"), factory: line("factory"), logo: line("logo"), ads: line("ads"), store: line("store"), you: line("you"), replica: line("replica"), end: line("end") };

export const CUE = {
  factoryWord: word("factory"),
  leather: word("leather"),
  hardware: word("hardware"),
  labour: word("labour"),
  three300: word("three", L.factory.start),
  stamps: word("stamps"),
  logo: word("logo"),
  jumps: word("jumps"),
  ads: word("ads"),
  celebrities: word("celebrities"),
  billboards: word("billboards"),
  magazine: word("magazine"),
  add: word("add"),
  prime: word("prime"),
  marble: word("marble"),
  guy: word("guy"),
  another: word("another", L.store.start),
  reaches: word("reaches"),
  three3000: word("three", L.you.start),
  every: word("every"),
  similar: word("similar"),
  cheaper: word("cheaper"),
  no1: word("no", L.replica.start),
  no2: word("no", word("no", L.replica.start) + 0.1),
  no3: word("no", word("no", word("no", L.replica.start) + 0.1) + 0.1),
  ships: word("ships"),
  hundred100: word("hundred", L.replica.start),
  same: word("same"),
  difference: word("difference"),
  never: word("never"),
  so: word("so", L.end.start),
  paying: word("paying"),
};
export const TOTAL_FRAMES = f(N.duration);

export const EMPHASIS = [
  "three", "thousand", "money", "factory", "leather", "hardware", "labour", "hundred", "logo", "twelve", "ads",
  "celebrities", "billboards", "magazine", "six", "store", "rent", "marble", "door", "billboard", "replica",
  "cheaper", "tax", "straight", "same", "never", "paying",
];
