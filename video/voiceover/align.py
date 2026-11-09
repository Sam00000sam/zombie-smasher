"""Transcribe the narration back with Whisper (QA) and add word-level timings to narration.json."""
import json, re
from pathlib import Path
import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

HERE = Path(__file__).parent
wav = HERE.parent / "public" / "voice" / "narration.wav"
meta_path = HERE.parent / "src" / "v2" / "narration.json"
meta = json.loads(meta_path.read_text())

model = WhisperModel("small.en", device="cpu", compute_type="int8")
x, sr = sf.read(str(wav), dtype="float32")
if x.ndim > 1:
    x = x.mean(axis=1)
# linear resample to Whisper's 16 kHz (decoding ourselves avoids a PyAV version clash)
n = int(len(x) * 16000 / sr)
x16 = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)
segments, _ = model.transcribe(x16, word_timestamps=True, beam_size=5)
words = []
for s in segments:
    for w in s.words:
        words.append({"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3), "p": round(w.probability, 3)})

# Whisper can hallucinate text in trailing silence; keep only words inside the spoken lines.
last_end = meta["lines"][-1]["end"] + 0.25
dropped = [w["w"] for w in words if w["start"] > last_end]
if dropped:
    print("dropped hallucinated trailing words:", dropped)
words = [w for w in words if w["start"] <= last_end]
heard = " ".join(w["w"] for w in words)
expected = " ".join(l["text"] for l in meta["lines"])
norm = lambda s: re.sub(r"[^a-z' ]", "", s.lower().replace("-", " ")).split()
a, b = norm(expected), norm(heard)
print("EXPECTED:", " ".join(a)); print("HEARD:   ", " ".join(b))
missing = [x for x in a if x not in b]; extra = [x for x in b if x not in a]
print("word count expected/heard:", len(a), len(b), "| missing:", missing, "| extra:", extra)
low = [w for w in words if w["p"] < 0.6]
print("low-confidence words:", [(w["w"], w["p"]) for w in low])
meta["words"] = words
meta_path.write_text(json.dumps(meta, indent=2))
