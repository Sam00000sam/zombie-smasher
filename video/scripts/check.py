"""Check a rendered video: specs, narration sync, smoothness, dark gaps, loop seam.

    voiceover/.venv/bin/python scripts/check.py <video.mp4> <narration.wav> [outDir]

- audio: correlation and lag of the MP4's audio against the narration WAV (want lag 0, corr > 0.99)
- motion: mean frame-to-frame change (135x240 greyscale, 0-255) and the biggest spikes. A spike over
  ~10 usually means something swelled into the lens or popped; look at those frames.
- dark: frames much darker than the median (an empty hand-off)
- loop: first vs last frame difference
If outDir is given, writes spikes.png: a strip of frames around the biggest spike.
"""
import subprocess
import sys

import numpy as np
import soundfile as sf

mp4, wav = sys.argv[1], sys.argv[2]
out = sys.argv[3] if len(sys.argv) > 3 else None

info = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_name,width,height,nb_frames", "-show_entries", "format=duration", "-of", "compact", mp4], capture_output=True, text=True).stdout.strip()
print(info)

pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", mp4, "-ac", "1", "-ar", "24000", "-f", "f32le", "-"], capture_output=True).stdout
a = np.frombuffer(pcm, np.float32)
b, sr = sf.read(wav, dtype="float32")
n = min(len(a), len(b))
x, y = a[sr: sr * 10], b[sr: sr * 10]
lags = range(-300, 301)
lag = list(lags)[int(np.argmax([np.dot(x[300:-300], np.roll(y, l)[300:-300]) for l in lags]))]
print(f"audio: lag {lag} samples, corr {np.corrcoef(a[:n], b[:n])[0, 1]:.4f}")

raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", mp4, "-vf", "scale=135:240,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
v = np.frombuffer(raw, np.uint8).reshape(-1, 240, 135).astype(np.float32)
d = np.abs(np.diff(v, axis=0)).mean(axis=(1, 2))
top = np.argsort(d)[-5:][::-1]
print(f"motion: avg {d.mean():.2f}  p99 {np.percentile(d, 99):.2f}  max {d.max():.2f}")
print("  biggest:", ", ".join(f"f{i} ({i / 30:.1f}s) {d[i]:.1f}" for i in top))
br = v.mean(axis=(1, 2))
med = np.median(br)
dark = np.where(br < med * 0.45)[0]
print(f"dark frames (<45% of median {med:.1f}): {len(dark)}" + (f" e.g. {dark[:8].tolist()}" if len(dark) else ""))
print(f"loop seam (first vs last): {np.abs(v[0] - v[-1]).mean():.2f}")
if out:
    i = int(top[0])
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", mp4, "-vf", f"select='between(n,{max(0, i - 6)},{i + 5})',scale=150:-1,tile=12x1", "-frames:v", "1", "-update", "1", f"{out}/spikes.png"])
    print(f"spike strip: {out}/spikes.png")
