import N from "./narration.json";

/**
 * All timing is derived from the generated narration (voiceover/make_voice.py → narration.json,
 * word timings from Whisper via voiceover/align.py). Sentence starts come from the generator
 * (exact); in-sentence beats come from Whisper word timestamps (checked against the waveform).
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

/** Cue points in seconds. */
export const CUE = {
  hook: line("hook").start,
  hundreds: word("hundreds"),
  when: word("when"),
  compare: line("compare").start,
  more: word("more"),
  logo: word("logo"),
  marketing: word("marketing"),
  prestige: word("prestige"),
  notNecessarily: word("not", line("compare").start),
  performance: word("performance"),
  value: line("value").start,
  impressive: word("impressive"),
  functionality: word("functionality"),
  without: word("without"),
  reality1: line("reality1").start,
  counterfeits: word("counterfeits"),
  reality2: line("reality2").start,
  safer: word("safer"),
  warranties: word("warranties"),
  qualityControl: word("quality", line("reality2").start),
  control: word("control"),
  end1: line("end1").start,
  end2: line("end2").start,
  notExpensive: word("not", line("end2").start),
  speechEnd: line("end2").end,
  audioDuration: N.duration,
};

/** Scene windows (frames). Neighbouring scenes overlap during camera moves. */
export const SCENES = {
  hook: { from: 0, to: f(5.5) },
  compare: { from: f(5.5), to: f(12.6) },
  value: { from: f(12.2), to: f(19.0) },
  reality: { from: f(18.6), to: f(26.9) },
  end: { from: f(26.4), to: f(31.5) },
};
export const TOTAL_FRAMES = f(31.5);

/** Camera moves (global). Scenes are laid out on one continuous canvas. */
export const CAMERA_MOVES = [
  { at: f(12.0), dur: 26, dx: 360, dy: 0 }, // compare → value: glide right
  { at: f(16.0), dur: 24, dx: 0, dy: 420 }, // value: tilt down to the shopper
  { at: f(18.4), dur: 26, dx: 360, dy: 0 }, // value → reality
  { at: f(26.3), dur: 26, dx: 360, dy: 0 }, // reality → ending
];
/** Where each scene sits on the canvas (camera position when it is centred). */
export const ORIGIN = {
  hook: { x: 0, y: 0 },
  compare: { x: 0, y: 0 },
  value: { x: 360, y: 0 },
  reality: { x: 720, y: 420 },
  end: { x: 1080, y: 420 },
};
