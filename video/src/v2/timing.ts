import N from "./narration.json";

/**
 * All timing is derived from the generated narration (voiceover/make_voice.py → narration.json,
 * word timings from Whisper via voiceover/align.py). Sentence starts/ends come from the generator
 * (exact); in-sentence beats come from Whisper word timestamps. Re-voicing re-syncs everything.
 */
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const f = (seconds: number) => Math.round(seconds * FPS);

const norm = (w: string) => w.toLowerCase().replace(/[^a-z']/g, "");

const line = (key: string) => {
  const l = N.lines.find((x) => x.key === key);
  if (!l) throw new Error(`narration line ${key} missing`);
  return l;
};
const word = (w: string, after = 0) => {
  const x = N.words.find((y) => norm(y.w) === w && y.start >= after);
  if (!x) throw new Error(`narration word ${w} missing`);
  return x.start;
};

const L = {
  hook: line("hook"),
  compare: line("compare"),
  value: line("value"),
  reality1: line("reality1"),
  reality2: line("reality2"),
  end1: line("end1"),
  end2: line("end2"),
};

/** Cue points in seconds. */
export const CUE = {
  hook: L.hook.start,
  hundreds: word("hundreds"),
  when: word("when"),
  compare: L.compare.start,
  more: word("more"),
  logo: word("logo"),
  marketing: word("marketing"),
  prestige: word("prestige"),
  notNecessarily: word("not", L.compare.start),
  performance: word("performance"),
  value: L.value.start,
  impressive: word("impressive"),
  functionality: word("functionality"),
  without: word("without"),
  reality1: L.reality1.start,
  counterfeits: word("counterfeits"),
  reality2: L.reality2.start,
  safer: word("safer"),
  warranties: word("warranties"),
  qualityControl: word("quality", L.reality2.start),
  control: word("control"),
  end1: L.end1.start,
  end2: L.end2.start,
  notExpensive: word("not", L.end2.start),
  speechEnd: L.end2.end,
  audioDuration: N.duration,
};

/** Scene boundaries sit in the pauses between narration lines. */
const mid = (a: { end: number }, b: { start: number }) => (a.end + b.start) / 2;
const B = {
  b1: mid(L.hook, L.compare),
  b2: mid(L.compare, L.value),
  b3: mid(L.value, L.reality1),
  b4: mid(L.reality2, L.end1),
};
const X = 0.45; // cross-dissolve half-length (s)

export const SCENES = {
  hook: { from: 0, to: f(B.b1) },
  compare: { from: f(B.b1), to: f(B.b2 + X) },
  value: { from: f(B.b2 - X), to: f(B.b3 + X) },
  reality: { from: f(B.b3 - X), to: f(B.b4 + X) },
  end: { from: f(B.b4 - X), to: f(L.end2.end + 1.1) },
};
export const TOTAL_FRAMES = SCENES.end.to;
export const XFADE = f(2 * X);

/** Camera moves (global). Scenes are laid out on one continuous canvas. */
export const CAMERA_MOVES = [
  { at: f(B.b2 - X), dur: f(2 * X) + 2, dx: 420, dy: 0 }, // compare → value: glide right
  { at: f(CUE.without - 0.5), dur: 22, dx: 0, dy: 440 }, // value: tilt down to the shopper
  { at: f(B.b3 - X), dur: f(2 * X) + 2, dx: 420, dy: 0 }, // value → reality
  { at: f(B.b4 - X), dur: f(2 * X) + 2, dx: 420, dy: 0 }, // reality → ending
];
/** Where each scene sits on the canvas (camera position when it is centred). */
export const ORIGIN = {
  hook: { x: 0, y: 0 },
  compare: { x: 0, y: 0 },
  value: { x: 420, y: 0 },
  reality: { x: 840, y: 440 },
  end: { x: 1260, y: 440 },
};
