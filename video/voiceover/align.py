"""Transcribe the narration back with Whisper (QA) and add word-level timings to narration.json."""
import json, re, sys
from pathlib import Path
import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

# Usage: .venv/bin/python align.py <script.json>   (same script file passed to make_voice.py)
HERE = Path(__file__).parent
cfg = json.loads(Path(sys.argv[1]).read_text())
wav = HERE.parent / cfg["wav"]
meta_path = HERE.parent / cfg["json"]
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

# Whisper writes spoken numbers as digits ("$3,000", "30"); expand them into words (time split evenly)
# so they can be matched against the script.
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def spell(n):
    if n < 20:
        return [ONES[n]]
    if n < 100:
        return [TENS[n // 10]] + (spell(n % 10) if n % 10 else [])
    if n < 1000:
        return spell(n // 100) + ["hundred"] + (spell(n % 100) if n % 100 else [])
    return spell(n // 1000) + ["thousand"] + (spell(n % 1000) if n % 1000 else [])
def speech_end_after(t, win=0.05, quiet=0.008, need=3):
    """First moment after t where the narration goes quiet for need*win seconds."""
    i, run = int(t * sr), 0
    step = int(win * sr)
    while i + step < len(x):
        run = run + 1 if np.sqrt(np.mean(x[i:i + step] ** 2)) < quiet else 0
        if run >= need:
            return (i - (need - 1) * step) / sr
        i += step
    return len(x) / sr
merged = []
for w in words:  # "$3" + ",000." -> "$3,000."
    if merged and re.fullmatch(r",[0-9]{3}[.,?!]*", w["w"].strip()) and re.search(r"[0-9]$", merged[-1]["w"]):
        merged[-1] = {**merged[-1], "w": merged[-1]["w"].strip() + w["w"].strip(), "end": w["end"]}
    else:
        merged.append({**w, "w": w["w"].strip()})
words = merged
expanded = []
for w in words:
    m = re.fullmatch(r"([$]?)([0-9][0-9,]*)([.,?!]*)", w["w"])
    if not m:
        expanded.append(w)
        continue
    toks = spell(int(m.group(2).replace(",", ""))) + (["dollars"] if m.group(1) else [])
    if len(toks) > 1 and toks[0] == "one" and toks[1] in ("hundred", "thousand"):
        toks[0] = "a"
    # Whisper squeezes numerals' timestamps; run the group on until the speech actually pauses.
    end = speech_end_after(w["start"])
    nxt = next((v["start"] for v in words if v["start"] > w["start"]), None)
    end = max(w["end"], min(end, nxt) if nxt is not None else end)
    d = (end - w["start"]) / len(toks)
    expanded += [{"w": t, "start": round(w["start"] + i * d, 3), "end": round(w["start"] + (i + 1) * d, 3), "p": w["p"]} for i, t in enumerate(toks)]
words = expanded

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

# Align the SCRIPT's words to Whisper's timings, so the timing data only ever contains words that are
# really in the narration (Whisper can hallucinate or drop words). Unmatched script words get times
# interpolated between their matched neighbours; words are kept inside their line's exact bounds.
import difflib
script_tokens = []  # (display token, line index)
for li, l in enumerate(meta["lines"]):
    for t in l["text"].split():
        script_tokens.append((t, li))
sn = [re.sub(r"[^a-z']", "", t.lower()) for t, _ in script_tokens]
wn = [re.sub(r"[^a-z']", "", w["w"].lower()) for w in words]
sm = difflib.SequenceMatcher(a=sn, b=wn, autojunk=False)
times = [None] * len(sn)
for blk in sm.get_matching_blocks():
    for k in range(blk.size):
        w = words[blk.b + k]
        times[blk.a + k] = (w["start"], w["end"])
out = []
for i, (tok, li) in enumerate(script_tokens):
    line = meta["lines"][li]
    if times[i] is None:
        prev = next((times[j][1] for j in range(i - 1, -1, -1) if times[j] and script_tokens[j][1] == li), line["start"])
        nxt = next((times[j][0] for j in range(i + 1, len(sn)) if times[j] and script_tokens[j][1] == li), line["end"])
        times[i] = (prev, max(prev + 0.05, nxt))
        print("interpolated:", tok)
    st, en = times[i]
    first_in_line = i == 0 or script_tokens[i - 1][1] != li
    if first_in_line:
        st = line["start"]  # generator's sentence start is exact
    st = min(max(st, line["start"]), line["end"])
    en = min(max(en, st + 0.05), line["end"])
    out.append({"w": tok, "start": round(st, 3), "end": round(en, 3)})
words = out
meta["words"] = words
meta_path.write_text(json.dumps(meta, indent=2))
