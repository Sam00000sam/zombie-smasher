import N from "./narration.json";

/** Timing for "Product or Label?", derived from the generated narration (voiceover/scripts/v4-label.json). */
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
const L = { hook: line("hook"), price: line("price"), copy: line("copy"), trend: line("trend"), save: line("save"), end: line("end") };

export const CUE = {
  hook: L.hook.start,
  sometimes: word("sometimes"),
  smarter: word("smarter"),
  price: L.price.start,
  luxury: word("luxury"),
  product: word("product"),
  logo: word("logo"),
  ads: word("ads"),
  store: word("store"),
  copy: L.copy.start,
  good: word("good"),
  look: word("look"),
  fraction: word("fraction"),
  trend: L.trend.start,
  rent: word("rent"),
  stop: word("stop"),
  season: word("season"),
  save: L.save.start,
  saveWord: word("save", L.save.start),
  five: word("five"),
  instead: word("instead"),
  end: L.end.start,
  pay: word("pay"),
  ask: word("ask"),
  productQ: word("product", L.end.start),
  label: word("label"),
  speechEnd: L.end.end,
};

const mid = (a: { end: number }, b: { start: number }) => (a.end + b.start) / 2;
const X = 0.45;
const B = { b1: mid(L.hook, L.price), b3: mid(L.copy, L.trend), b4: mid(L.trend, L.save), b5: mid(L.save, L.end) };

export const SCENES = {
  hook: { from: 0, to: f(B.b1 + X) },
  tower: { from: f(B.b1 - X), to: f(B.b3 + X) },
  trend: { from: f(B.b3 - X), to: f(B.b4 + X) },
  save: { from: f(B.b4 - X), to: f(B.b5 + X) },
  end: { from: f(B.b5 - X), to: f(N.duration) },
};
export const TOTAL_FRAMES = SCENES.end.to;
export const XFADE = f(2 * X);
export const FINAL_TITLE = f(CUE.speechEnd - 0.1);

const mv = (t: number, dx: number, dy: number) => ({ at: f(t - X) - 3, dur: f(2 * X) + 8, dx, dy });
export const CAMERA_MOVES = [mv(B.b1, 0, 500), mv(B.b3, 480, 0), mv(B.b4, 0, 500), mv(B.b5, -480, 0)];
export const ORIGIN = {
  hook: { x: 0, y: 0 },
  tower: { x: 0, y: 500 },
  trend: { x: 480, y: 500 },
  save: { x: 480, y: 1000 },
  end: { x: 0, y: 1000 },
};

/** Camera punch-ins on key words (seconds). */
export const PUNCHES = [CUE.smarter, CUE.store, CUE.copy, CUE.fraction, CUE.rent, CUE.five, CUE.label];

export const PHRASES = [
  "Unpopular opinion:",
  "sometimes, the fake is the smarter buy.",
  "Most of a luxury price isn't the product.",
  "It's the logo, the ads, and the fancy store.",
  "Take that away, and a good copy",
  "can look almost identical,",
  "for a fraction of the cost.",
  "Trends also change fast.",
  "Why spend a month's rent",
  "on something you'll stop wearing next season?",
  "The money you save could buy five styles,",
  "instead of one.",
  "So before you pay for the name, ask yourself:",
  "are you buying the product, or the label?",
];
export const EMPHASIS = ["opinion", "fake", "smarter", "logo", "ads", "store", "copy", "identical", "fraction", "fast", "rent", "five", "styles", "product", "label"];
