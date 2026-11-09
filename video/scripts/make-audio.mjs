// Synthesises the score and sound effects used by the video (no external assets).
// Run: node scripts/make-audio.mjs   (needs ffmpeg for the mp3 encode)
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const SR = 44100;
const OUT = path.resolve("public/audio");
mkdirSync(OUT, { recursive: true });

// deterministic PRNG so renders are reproducible
let seed = 1337;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;
const TAU = Math.PI * 2;

const makeBuf = (sec) => ({
  L: new Float32Array(Math.ceil(sec * SR)),
  R: new Float32Array(Math.ceil(sec * SR)),
});

// ---------- tiny DSP helpers ----------
const reverb = (buf, wet = 0.3) => {
  const combs = [1557, 1617, 1491, 1422, 1277, 1356];
  const mk = (n, g) => ({ b: new Float32Array(n), i: 0, g });
  const process = (x, chan) => {
    const out = new Float32Array(x.length);
    const cs = combs.map((c, k) => mk(c + chan * 23 + k * 3, 0.84));
    const aps = [225, 556].map((c) => mk(c + chan * 11, 0.5));
    let lp = 0;
    for (let n = 0; n < x.length; n++) {
      let s = 0;
      for (const c of cs) {
        const y = c.b[c.i];
        lp = lp * 0.4 + y * 0.6;
        c.b[c.i] = x[n] + lp * c.g;
        c.i = (c.i + 1) % c.b.length;
        s += y;
      }
      s /= combs.length;
      for (const a of aps) {
        const y = a.b[a.i];
        const z = s + y * a.g;
        a.b[a.i] = z;
        a.i = (a.i + 1) % a.b.length;
        s = y - z * a.g;
      }
      out[n] = s;
    }
    return out;
  };
  const rl = process(buf.L, 0);
  const rr = process(buf.R, 1);
  for (let n = 0; n < buf.L.length; n++) {
    buf.L[n] = buf.L[n] * (1 - wet * 0.5) + rl[n] * wet * 2.4;
    buf.R[n] = buf.R[n] * (1 - wet * 0.5) + rr[n] * wet * 2.4;
  }
};

const addTo = (buf, startSec, fn, durSec, pan = 0) => {
  const s0 = Math.floor(startSec * SR);
  const len = Math.floor(durSec * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let n = 0; n < len; n++) {
    const i = s0 + n;
    if (i < 0 || i >= buf.L.length) continue;
    const v = fn(n / SR, n);
    buf.L[i] += v * gl;
    buf.R[i] += v * gr;
  }
};

const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));

const saw = (ph, harmonics = 10) => {
  let s = 0;
  for (let k = 1; k <= harmonics; k++) s += Math.sin(ph * k) / k;
  return s * 0.6;
};

// ---------- instruments ----------
const pad = (buf, t0, dur, freq, gain) => {
  const dets = [-0.07, 0, 0.07];
  addTo(
    buf,
    t0,
    (t) => {
      const a = Math.min(1, t / 1.6);
      const r = Math.min(1, (dur - t) / 1.6);
      const e = Math.max(0, Math.min(a, r));
      const wob = 1 + 0.003 * Math.sin(TAU * 0.25 * t);
      let s = 0;
      for (const d of dets) s += saw(TAU * freq * (1 + d * 0.01) * wob * t, 7);
      s += Math.sin(TAU * freq * 0.5 * t) * 0.9;
      return s * e * gain * 0.33;
    },
    dur,
    0,
  );
};

const pluck = (buf, t0, freq, gain, pan) => {
  addTo(
    buf,
    t0,
    (t) => {
      const e = env(t, 0.004, 0.28);
      return (
        (Math.sin(TAU * freq * t) + 0.35 * Math.sin(TAU * freq * 2 * t) * Math.exp(-t * 9)) *
        e *
        gain
      );
    },
    1.4,
    pan,
  );
};

const kick = (buf, t0, gain) =>
  addTo(
    buf,
    t0,
    (t) => {
      const f = 42 + 90 * Math.exp(-t * 28);
      return Math.sin(TAU * f * t) * Math.exp(-t * 7) * gain;
    },
    0.55,
  );

const hat = (buf, t0, gain, pan) => {
  let prev = 0;
  addTo(
    buf,
    t0,
    (t) => {
      const n = noise();
      const hp = n - prev;
      prev = n;
      return hp * Math.exp(-t * 55) * gain;
    },
    0.12,
    pan,
  );
};

// ---------- the score: 120 bpm, 4 s per chord ----------
const DURATION = 84;
const music = makeBuf(DURATION);

const CHORDS = [
  { pad: [110, 220, 261.63, 329.63], arp: [220, 261.63, 329.63, 440] }, // Am
  { pad: [87.31, 174.61, 220, 261.63], arp: [174.61, 220, 261.63, 349.23] }, // F
  { pad: [130.81, 261.63, 329.63, 392], arp: [261.63, 329.63, 392, 523.25] }, // C
  { pad: [98, 196, 246.94, 293.66], arp: [196, 246.94, 293.66, 392] }, // G
];

// energy curve (0..1) following the story
const energy = (t) => {
  if (t < 8) return 0.35 + 0.1 * (t / 8);
  if (t < 20) return 0.6;
  if (t < 35) return 0.8;
  if (t < 50) return 0.9;
  if (t < 65) return 0.5; // reality check: pull back
  return 1.0;
};

for (let c = 0; c < 21; c++) {
  const t0 = c * 4;
  const ch = CHORDS[c % 4];
  const e = energy(t0 + 2);
  for (const f of ch.pad) pad(music, t0, 4.6, f, 0.42 * e);

  // arpeggio from 8 s
  if (t0 >= 8) {
    const arpGain = t0 >= 50 && t0 < 65 ? 0.05 : 0.09 * e;
    for (let i = 0; i < 8; i++) {
      const f = ch.arp[[0, 1, 2, 3, 2, 1, 2, 3][i]] * (t0 >= 65 ? 2 : 1);
      pluck(music, t0 + i * 0.5, f, arpGain, i % 2 ? 0.35 : -0.35);
    }
  }
  // heartbeat in the intro
  if (t0 < 8) {
    kick(music, t0 + 0.0, 0.5);
    kick(music, t0 + 0.5, 0.32);
    kick(music, t0 + 2.0, 0.5);
    kick(music, t0 + 2.5, 0.32);
  }
  // groove 20-50 s and 65 s+
  const groove = (t0 >= 20 && t0 < 50) || t0 >= 66;
  if (groove) {
    for (let b = 0; b < 8; b++) {
      kick(music, t0 + b * 0.5, b % 2 === 0 ? 0.55 : 0.0);
      hat(music, t0 + b * 0.5 + 0.25, 0.1, b % 2 ? 0.3 : -0.3);
    }
  }
}
reverb(music, 0.32);

// master: gentle fade in/out, normalise to -2 dBFS
const fade = (t) =>
  Math.min(1, t / 1.5) * Math.min(1, Math.max(0, (DURATION - t) / 2.5));
let peak = 0;
for (let n = 0; n < music.L.length; n++) {
  const g = fade(n / SR);
  music.L[n] *= g;
  music.R[n] *= g;
  peak = Math.max(peak, Math.abs(music.L[n]), Math.abs(music.R[n]));
}
const norm = 0.79 / peak;
for (let n = 0; n < music.L.length; n++) {
  music.L[n] = Math.tanh(music.L[n] * norm * 1.1);
  music.R[n] = Math.tanh(music.R[n] * norm * 1.1);
}

// ---------- sound effects ----------
const sfx = {};

// whoosh: band-passed noise sweep
{
  const b = makeBuf(1.2);
  let lp1 = 0;
  let lp2 = 0;
  addTo(
    b,
    0,
    (t) => {
      const k = t / 1.2;
      const fc = 250 + 5200 * Math.sin(Math.PI * k) ** 2;
      const a = 1 - Math.exp((-TAU * fc) / SR);
      const n = noise();
      lp1 += a * (n - lp1);
      lp2 += a * (lp1 - lp2);
      const band = lp1 - lp2;
      return band * 9 * Math.sin(Math.PI * k) ** 1.5;
    },
    1.2,
  );
  reverb(b, 0.18);
  sfx.whoosh = b;
}

// impact: sub drop + noise burst + tail
{
  const b = makeBuf(3.2);
  let lp = 0;
  addTo(
    b,
    0,
    (t) => {
      const f = 38 + 120 * Math.exp(-t * 9);
      const sub = Math.sin(TAU * f * t) * Math.exp(-t * 1.9) * 0.95;
      const n = noise();
      lp += 0.08 * (n - lp);
      const burst = lp * Math.exp(-t * 14) * 2.2;
      const click = n * Math.exp(-t * 90) * 0.4;
      return sub + burst + click;
    },
    3.2,
  );
  reverb(b, 0.3);
  sfx.impact = b;
}

// tick
{
  const b = makeBuf(0.12);
  addTo(b, 0, (t) => Math.sin(TAU * 2400 * t) * Math.exp(-t * 90) * 0.5, 0.12);
  sfx.tick = b;
}

// chime
{
  const b = makeBuf(2.0);
  addTo(
    b,
    0,
    (t) =>
      (Math.sin(TAU * 1318.5 * t) + 0.5 * Math.sin(TAU * 1975.5 * t) + 0.25 * Math.sin(TAU * 2637 * t)) *
      env(t, 0.003, 0.35) *
      0.3,
    2.0,
  );
  reverb(b, 0.3);
  sfx.chime = b;
}

// riser
{
  const b = makeBuf(4.0);
  let lp = 0;
  addTo(
    b,
    0,
    (t) => {
      const k = t / 4;
      const fc = 300 + 7000 * k * k;
      const a = 1 - Math.exp((-TAU * fc) / SR);
      lp += a * (noise() - lp);
      const tone = Math.sin(TAU * (110 + 330 * k * k) * t) * 0.35;
      return (lp * 2.5 + tone) * k ** 2.2 * 0.8;
    },
    4.0,
  );
  reverb(b, 0.2);
  sfx.riser = b;
}

// whole-body low swell (used under the opening)
{
  const b = makeBuf(4.0);
  addTo(
    b,
    0,
    (t) => {
      const k = Math.sin((Math.PI * t) / 4) ** 2;
      return (Math.sin(TAU * 55 * t) + 0.5 * Math.sin(TAU * 82.4 * t)) * k * 0.7;
    },
    4.0,
  );
  sfx.swell = b;
}

// ---------- write files ----------
const writeWav = (name, buf) => {
  const n = buf.L.length;
  const data = Buffer.alloc(44 + n * 4);
  data.write("RIFF", 0);
  data.writeUInt32LE(36 + n * 4, 4);
  data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 4, 28);
  data.writeUInt16LE(4, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(n * 4, 40);
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (const ch of [buf.L, buf.R]) {
      const v = Math.max(-1, Math.min(1, ch[i]));
      data.writeInt16LE(Math.round(v * 32767), o);
      o += 2;
    }
  }
  const p = path.join(OUT, name);
  writeFileSync(p, data);
  return p;
};

const musicWav = writeWav("music.wav", music);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", musicWav, "-b:a", "192k", path.join(OUT, "music.mp3")]);
execFileSync("rm", [musicWav]);

for (const [name, buf] of Object.entries(sfx)) {
  // normalise each effect to -3 dBFS
  let pk = 0;
  for (let i = 0; i < buf.L.length; i++) pk = Math.max(pk, Math.abs(buf.L[i]), Math.abs(buf.R[i]));
  const g = pk > 0 ? 0.7 / pk : 1;
  for (let i = 0; i < buf.L.length; i++) {
    buf.L[i] *= g;
    buf.R[i] *= g;
  }
  const w = writeWav(`${name}.wav`, buf);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", w, "-b:a", "160k", path.join(OUT, `${name}.mp3`)]);
  execFileSync("rm", [w]);
}
console.log("audio written to", OUT);
