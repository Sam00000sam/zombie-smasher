"""Synthesize a small set of clean, subtle sound effects into public/sfx/ (48 kHz mono WAV).

    voiceover/.venv/bin/python scripts/make_sfx.py

whoosh  - airy filtered-noise swell for camera moves
pop     - soft rounded blip for a reveal
chime   - two-note bell (coin / price moment)
shimmer - short rising sparkle for a "fill up" moment
All are peak-normalised to -6 dBFS; set the per-use volume in the composition.
"""
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(d * SR)) / SR


def norm(x, db=-6):
    return (x / (np.abs(x).max() + 1e-9) * 10 ** (db / 20)).astype(np.float32)


def onepole_lp(x, cut):
    """One-pole low-pass with a per-sample cutoff (Hz)."""
    y = np.zeros_like(x)
    a = np.exp(-2 * np.pi * np.asarray(cut) / SR) * np.ones_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def fade(x, ms=6):
    n = int(SR * ms / 1000)
    x[:n] *= np.linspace(0, 1, n)
    x[-n:] *= np.linspace(1, 0, n)
    return x


# whoosh: noise through a sweeping low-pass, swelling in and out
d = 0.85
tt = t(d)
env = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.6
cut = 300 + 2600 * np.sin(np.pi * tt / d) ** 2
w = onepole_lp(rng.standard_normal(len(tt)), cut)
w = w - onepole_lp(w, 120)  # take out rumble
sf.write(OUT / "whoosh.wav", norm(fade(w * env)), SR)

# pop: a rounded sine blip with a quick downward pitch bend
d = 0.16
tt = t(d)
f = 620 * np.exp(-tt * 14) + 380
ph = 2 * np.pi * np.cumsum(f) / SR
p = np.sin(ph) * np.exp(-tt * 34)
p += 0.15 * onepole_lp(rng.standard_normal(len(tt)), 3000) * np.exp(-tt * 120)
sf.write(OUT / "pop.wav", norm(fade(p, 2)), SR)

# chime: two bell notes (E6 then B6) with soft inharmonic partials
d = 1.5
tt = t(d)


def bell(f0, start):
    s = np.clip(tt - start, 0, None)
    on = (tt >= start).astype(float)
    return on * np.exp(-s * 3.2) * (np.sin(2 * np.pi * f0 * s) + 0.35 * np.sin(2 * np.pi * f0 * 2.76 * s) * np.exp(-s * 5) + 0.18 * np.sin(2 * np.pi * f0 * 5.4 * s) * np.exp(-s * 9))


c = bell(1318.5, 0.0) * 0.8 + bell(1975.5, 0.09)
sf.write(OUT / "chime.wav", norm(fade(c, 3)), SR)

# shimmer: a quick rising arpeggio of soft sines
d = 1.1
tt = t(d)
s = np.zeros_like(tt)
for i, f0 in enumerate([880, 1108.7, 1318.5, 1760, 2217.5, 2637]):
    st = i * 0.09
    on = np.clip(tt - st, 0, None)
    s += (tt >= st) * np.sin(2 * np.pi * f0 * on) * np.exp(-on * 6) * 0.6
sf.write(OUT / "shimmer.wav", norm(fade(s, 3), -8), SR)
print("wrote", sorted(p.name for p in OUT.glob("*.wav")))
