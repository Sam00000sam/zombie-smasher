"""Generate a female narration with Kokoro-82M (open-source, runs locally on ONNX).

Usage:  .venv/bin/python make_voice.py <script.json> [voice] [speed] [--preview DIR]
The script JSON lists the lines (key, text, pause-after) and where to write:
  wav  — narration only (24 kHz mono PCM)        relative to the video/ folder
  json — per-line start/end in seconds, used by the Remotion composition to sync scenes
Each line is synthesised separately so pauses are exact and timings are known.
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).parent
VIDEO = HERE.parent
MODELS = HERE / "models"

args = [a for a in sys.argv[1:] if not a.startswith("--")]
SCRIPT = Path(args[0])
VOICE = args[1] if len(args) > 1 else "af_heart"
SPEED = float(args[2]) if len(args) > 2 else 1.0
PREVIEW = Path(sys.argv[sys.argv.index("--preview") + 1]) if "--preview" in sys.argv else None
if PREVIEW is not None:
    args = [a for a in args if a != str(PREVIEW)]

cfg = json.loads(SCRIPT.read_text())

# Kokoro-onnx wants an npz of voice-style tensors; build one from the raw .bin voice packs.
voices_npz = MODELS / "voices.npz"
packs = {p.stem: np.fromfile(p, dtype=np.float32).reshape(-1, 1, 256) for p in MODELS.glob("*.bin")}
np.savez(voices_npz, **packs)
kokoro = Kokoro(str(MODELS / "model.onnx"), str(voices_npz))


def trim(x: np.ndarray, sr: int, thresh: float = 0.004) -> np.ndarray:
    """Trim leading/trailing near-silence so our own pauses are the only gaps."""
    idx = np.where(np.abs(x) > thresh)[0]
    if len(idx) == 0:
        return x
    pad = int(0.03 * sr)
    return x[max(0, idx[0] - pad): min(len(x), idx[-1] + pad)]


sr_out = 24000
chunks, timeline = [], []
t = cfg["lead_in"]
for key, text, pause in cfg["lines"]:
    samples, sr_out = kokoro.create(text, voice=VOICE, speed=SPEED, lang="en-us")
    samples = trim(np.asarray(samples, dtype=np.float32), sr_out)
    dur = len(samples) / sr_out
    timeline.append({"key": key, "text": text, "start": round(t, 3), "end": round(t + dur, 3)})
    chunks += [samples, np.zeros(int(pause * sr_out), dtype=np.float32)]
    t += dur + pause

z = lambda s: np.zeros(int(s * sr_out), dtype=np.float32)
audio = np.concatenate([z(cfg["lead_in"]), *chunks, z(cfg["tail"])])
audio = audio / max(1e-6, np.abs(audio).max()) * 0.89  # peak-normalise to -1 dBFS, no other processing

meta = {"voice": VOICE, "speed": SPEED, "sampleRate": sr_out, "duration": round(len(audio) / sr_out, 3), "lines": timeline}
if PREVIEW is not None:
    PREVIEW.mkdir(parents=True, exist_ok=True)
    sf.write(PREVIEW / "narration.wav", audio, sr_out, subtype="PCM_16")
else:
    wav = VIDEO / cfg["wav"]
    wav.parent.mkdir(parents=True, exist_ok=True)
    sf.write(wav, audio, sr_out, subtype="PCM_16")
    out = VIDEO / cfg["json"]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(meta, indent=2))
print(json.dumps({k: meta[k] for k in ("voice", "speed", "duration")}))
for line in timeline:
    print(f'{line["start"]:6.2f}-{line["end"]:6.2f}  {line["key"]}')
