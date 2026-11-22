import N from "./narration.json";

/**
 * Timing for "Why Fake Products Are Better Than Real Ones", derived from the generated narration
 * (voiceover/scripts/v3-fake.json → make_voice.py → align.py). Sentence starts/ends are exact from
 * the generator; in-sentence beats come from Whisper word timestamps. Re-voicing re-syncs everything.
 */
export const FPS = 30;
export const f = (s: number) => Math.round(s * FPS);
export const norm = (w: string) => w.toLowerCase().replace(/[^a-z']/g, "");

export const WORDS = N.words;
export const LINES = N.lines;

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

const L = { hook: line("hook"), price: line("price"), choice: line("choice"), everyday: line("everyday"), end: line("end") };

export const CUE = {
  hook: L.hook.start,
  sometimes: word("sometimes"),
  surprising: word("surprising"),
  realThing: word("real"),
  price: L.price.start,
  priceWord: word("price", L.price.start),
  similar: word("similar"),
  basic: word("basic"),
  without: word("without"),
  much: word("much"),
  choice: L.choice.start,
  styles: word("styles"),
  designs: word("designs"),
  expensive: word("expensive"),
  difficult: word("difficult"),
  everyday: L.everyday.start,
  everydayWord: word("everyday"),
  cheaper: word("cheaper"),
  job: word("job"),
  enough: word("enough"),
  premium: word("premium"),
  important: word("important"),
  end: L.end.start,
  quality: word("quality", L.end.start),
  risksLow: word("risks"),
  priceDiff: word("difference"),
  huge: word("huge"),
  fakeCan: word("fake", L.end.start),
  advantages: word("advantages"),
  function: word("function"),
  find: word("find"),
  speechEnd: L.end.end,
};

const mid = (a: { end: number }, b: { start: number }) => (a.end + b.start) / 2;
const X = 0.45; // cross-dissolve half-length (s)
const B = { b2: mid(L.price, L.choice), b3: mid(L.choice, L.everyday), b4: mid(L.everyday, L.end) };

export const SCENES = {
  compare: { from: 0, to: f(B.b2 + X) }, // hook + price: one continuous shot
  choice: { from: f(B.b2 - X), to: f(B.b3 + X) },
  everyday: { from: f(B.b3 - X), to: f(B.b4 + X) },
  end: { from: f(B.b4 - X), to: f(N.duration) },
};
export const TOTAL_FRAMES = SCENES.end.to;
export const XFADE = f(2 * X);
export const FINAL_TITLE = f(CUE.speechEnd - 0.2);

/** Quick camera punch-ins on key words (seconds). */
export const PUNCHES = [2.6, CUE.priceWord, CUE.much, CUE.styles, CUE.difficult, CUE.important, CUE.priceDiff + 0.35, CUE.speechEnd - 0.2];

export const CAMERA_MOVES = [
  { at: f(B.b2 - X), dur: f(2 * X) + 2, dx: 420, dy: 0 },
  { at: f(B.b3 - X), dur: f(2 * X) + 2, dx: 0, dy: 440 },
  { at: f(B.b4 - X), dur: f(2 * X) + 2, dx: -420, dy: 0 },
];
export const ORIGIN = {
  compare: { x: 0, y: 0 },
  choice: { x: 420, y: 0 },
  everyday: { x: 420, y: 440 },
  end: { x: 0, y: 440 },
};
