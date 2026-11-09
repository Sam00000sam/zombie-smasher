"""Generate the female narration with Kokoro-82M (open-source, runs locally on ONNX).

Usage:  .venv/bin/python make_voice.py [voice] [speed]
Writes: ../public/voice/narration.wav   (24 kHz mono, narration only)
        ../src/v2/narration.json        (per-line start/end in seconds, used to sync scenes)
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).parent
MODELS = HERE / "models"
VOICE = sys.argv[1] if len(sys.argv) > 1 else "af_heart"
SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
OUT_DIR = Path(sys.argv[3]) if len(sys.argv) > 3 else HERE.parent / "public" / "voice"

# Each line is synthesised separately so pauses are exact and timings are known.
# pause = silence AFTER the line (seconds).
LINES = [
    ("hook", "Why pay hundreds for a brand name, when a cheaper alternative might do the same job?", 0.45),
    ("compare", "Sometimes, you're paying more for the logo, the marketing, and the prestige. Not necessarily better performance.", 0.45),
    ("value", "Affordable alternatives can offer impressive quality and functionality, without the premium price tag.", 0.45),
    ("reality1", "Of course, counterfeits aren't always better.", 0.3),
    ("reality2", "Genuine products can offer safer materials, warranties, and better quality control.", 0.45),
    ("end1", "Think about what you're actually paying for.", 0.35),
    ("end2", "Buy smart. Not expensive.", 0.0),
]
LEAD_IN = 0.4  # silence before the first word (scene 1 opens on black)

# Kokoro-onnx wants an npz of voice-style tensors; build one from the raw .bin voice packs.
voices_npz = MODELS / "voices.npz"
packs = {p.stem: np.fromfile(p, dtype=np.float32).reshape(-1, 1, 256) for p in MODELS.glob("*.bin")}
np.savez(voices_npz, **packs)

kokoro = Kokoro(str(MODELS / "model.onnx"), str(voices_npz))

sr_out = None
chunks = []
timeline = []
t = LEAD_IN


def trim(x: np.ndarray, sr: int, thresh: float = 0.004) -> np.ndarray:
    """Trim leading/trailing near-silence so our own pauses are the only gaps."""
    idx = np.where(np.abs(x) > thresh)[0]
    if len(idx) == 0:
        return x
    pad = int(0.03 * sr)
    return x[max(0, idx[0] - pad): min(len(x), idx[-1] + pad)]


for key, text, pause in LINES:
    samples, sr = kokoro.create(text, voice=VOICE, speed=SPEED, lang="en-us")
    sr_out = sr
    samples = trim(np.asarray(samples, dtype=np.float32), sr)
    dur = len(samples) / sr
    timeline.append({"key": key, "text": text, "start": round(t, 3), "end": round(t + dur, 3)})
    chunks.append(samples)
    chunks.append(np.zeros(int(pause * sr), dtype=np.float32))
    t += dur + pause

TAIL = 1.0  # room for the fade to black
audio = np.concatenate([np.zeros(int(LEAD_IN * sr_out), dtype=np.float32), *chunks, np.zeros(int(TAIL * sr_out), dtype=np.float32)])

# gentle peak normalisation to -1 dBFS, no compression or effects
audio = audio / max(1e-6, np.abs(audio).max()) * 0.89

OUT_DIR.mkdir(parents=True, exist_ok=True)
wav = OUT_DIR / "narration.wav"
sf.write(wav, audio, sr_out, subtype="PCM_16")

meta = {"voice": VOICE, "speed": SPEED, "sampleRate": sr_out, "duration": round(len(audio) / sr_out, 3), "lines": timeline}
json_path = HERE.parent / "src" / "v2" / "narration.json"
if len(sys.argv) <= 3:
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(meta, indent=2))
print(json.dumps({k: meta[k] for k in ("voice", "speed", "duration")}))
for line in timeline:
    print(f'{line["start"]:6.2f}-{line["end"]:6.2f}  {line["key"]}')
