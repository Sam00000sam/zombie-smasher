import N from "./narration.json";

/** Timing for the 60 s "Product or Label?" cut, derived from voiceover/scripts/v5-label60.json. */
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
const L = {
  hook: line("hook"),
  price: line("price"),
  copy: line("copy"),
  same: line("same"),
  notice: line("notice"),
  trend: line("trend"),
  worry: line("worry"),
  save: line("save"),
  grow: line("grow"),
  addup: line("addup"),
  status: line("status"),
  end: line("end"),
};

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
  same: L.same.start,
  shape: word("shape"),
  colour: word("colour"),
  everyday: word("everyday"),
  notice: L.notice.start,
  noticeWord: word("notice"),
  walk: word("walk"),
  hundred: word("hundred"),
  nobody: word("nobody"),
  stitching: word("stitching"),
  trend: L.trend.start,
  rent: word("rent"),
  stop: word("stop"),
  season: word("season"),
  worry: L.worry.start,
  pressure: word("pressure"),
  scuff: word("scuff"),
  spill: word("spill"),
  leave: word("leave"),
  bus: word("bus"),
  disaster: word("disaster"),
  save: L.save.start,
  saveWord: word("save", L.save.start),
  five: word("five"),
  instead: word("instead"),
  grow: L.grow.start,
  skip: word("skip"),
  put: word("put"),
  growWord: word("grow"),
  addup: L.addup.start,
  time: word("time"),
  status: L.status.start,
  isnt: word("isn't", L.status.start),
  logoArm: word("logo", L.status.start),
  knowing: word("knowing"),
  overpay: word("overpay"),
  end: L.end.start,
  pay: word("pay"),
  ask: word("ask"),
  productQ: word("product", L.end.start),
  label: word("label"),
  speechEnd: L.end.end,
};

const mid = (a: { end: number }, b: { start: number }) => (a.end + b.start) / 2;
const X = 0.45;
const B = {
  hook: mid(L.hook, L.price),
  tower: mid(L.same, L.notice),
  notice: mid(L.notice, L.trend),
  trend: mid(L.trend, L.worry),
  worry: mid(L.worry, L.save),
  save: mid(L.addup, L.status),
  status: mid(L.status, L.end),
};

export const SCENES = {
  hook: { from: 0, to: f(B.hook + X) },
  tower: { from: f(B.hook - X), to: f(B.tower + X) },
  notice: { from: f(B.tower - X), to: f(B.notice + X) },
  trend: { from: f(B.notice - X), to: f(B.trend + X) },
  worry: { from: f(B.trend - X), to: f(B.worry + X) },
  save: { from: f(B.worry - X), to: f(B.save + X) },
  status: { from: f(B.save - X), to: f(B.status + X) },
  end: { from: f(B.status - X), to: f(N.duration) },
};
export const TOTAL_FRAMES = SCENES.end.to;
export const XFADE = f(2 * X);

/** Rig pans between scenes (multiples of 30 px so the dot grid lines up for the loop). */
const mv = (t: number, dx: number, dy: number) => ({ at: f(t - X) - 3, dur: f(2 * X) + 8, dx, dy });
export const CAMERA_MOVES = [
  mv(B.hook, 0, 510),
  mv(B.tower, 480, 0),
  mv(B.notice, 480, 0),
  mv(B.trend, 0, 510),
  mv(B.worry, -480, 0),
  mv(B.save, -480, 0),
  mv(B.status, 0, 510),
];
export const ORIGIN = {
  hook: { x: 0, y: 0 },
  tower: { x: 0, y: 510 },
  notice: { x: 480, y: 510 },
  trend: { x: 960, y: 510 },
  worry: { x: 960, y: 1020 },
  save: { x: 480, y: 1020 },
  status: { x: 0, y: 1020 },
  end: { x: 0, y: 1530 },
};

export const PHRASES = [
  "Unpopular opinion:",
  "sometimes, the fake is the smarter buy.",
  "Most of a luxury price isn't the product.",
  "It's the logo, the ads, and the fancy store.",
  "Take that away, and a good copy",
  "can look almost identical,",
  "for a fraction of the cost.",
  "Same shape. Same colour. Same everyday use.",
  "And honestly, most people won't notice.",
  "Walk past a hundred strangers,",
  "and nobody is checking the stitching.",
  "Trends also change fast.",
  "Why spend a month's rent",
  "on something you'll stop wearing next season?",
  "A cheaper bag also takes the pressure off.",
  "Scuff it, spill on it, leave it on the bus.",
  "It's not a disaster.",
  "The money you save could buy five styles,",
  "instead of one.",
  "Or skip the extra bags,",
  "and put that money somewhere it can actually grow.",
  "Even small savings add up over time.",
  "Because real status isn't a logo on your arm.",
  "It's knowing you didn't overpay for one.",
  "So before you pay for the name, ask yourself:",
  "are you buying the product, or the label?",
];
export const EMPHASIS = [
  "opinion", "fake", "smarter", "logo", "ads", "store", "copy", "identical", "fraction", "shape", "colour", "everyday",
  "notice", "hundred", "nobody", "fast", "rent", "pressure", "disaster", "five", "styles", "grow", "add", "status",
  "overpay", "product", "label",
];
