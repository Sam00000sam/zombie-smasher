import N from "./narration.json";

/** Timing for "One Bag or Thirty" (voiceover/scripts/v13-thirty.json + Whisper word times). */
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
export const L = { hook: line("hook"), math: line("math"), match: line("match"), plans: line("plans"), scuff: line("scuff"), end: line("end") };
export const CUE = {
  thirty: word("thirty"),
  hundred: word("hundred"),
  thats: word("that's", L.math.start),
  every: word("every", L.math.start),
  years: word("years"),
  matches: word("matches"),
  thirty2: word("thirty", L.match.start),
  work: word("work"),
  gym: word("gym"),
  date: word("date"),
  weekend: word("weekend"),
  every2: word("every", L.plans.start),
  scuffed: word("scuffed"),
  lost: word("lost"),
  twentyNine: word("twenty-nine"),
  logo: word("logo"),
  which: word("which", L.end.start),
};
export const TOTAL_FRAMES = f(N.duration);
export const EMPHASIS = ["three", "thousand", "one", "designer", "thirty", "replicas", "hundred", "style", "month", "half", "years", "some", "all", "work", "gym", "date", "weekend", "plan", "scuffed", "lost", "twenty-nine", "logo", "looks", "pick"];
