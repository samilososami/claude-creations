"""Edit the social narrations without regenerating them.

usage: python3 scripts/edit_narration.py lex|lamb|operator

- removes the "still in development / open source / follow along" sentence,
  leaving a 1.1 s pause before the closing tagline;
- operator: splices "And much more, still in development." (take A, generated in
  the same sentence context) right after "CAN.", loudness-matched to the original.

Every cut lands on digital silence (checked by RMS). Writes public/audio/<v>-voice.wav,
src/social/edit-<v>.json (segments: original start, original end, new start) and
re-transcribes the edited voice into src/social/words-<v>.json for the captions.
"""
import json
import subprocess
import sys

import numpy as np
import pyloudnorm as pyln

sys.path.insert(0, "scripts")
from sfx import SR, load  # noqa: E402

meter = pyln.Meter(SR)
v = sys.argv[1]
src = load(f"audio-src/narration-{v}.mp3")
sil = lambda s: np.zeros((int(round(s * SR)), 2), np.float32)
cut = lambda x, a, b=None: x[int(round(a * SR)): None if b is None else int(round(b * SR))]

# (keep until, resume at) around the removed status sentence; both points are inside silence
STATUS = {"lex": (32.55, 38.15), "lamb": (39.42, 45.10), "operator": (29.92, 35.95)}[v]
GAP = 0.75  # + 0.35 s of the kept silence = 1.1 s pause before "LambdaOS,"

pieces, segs, t = [], [], 0.0


def keep(a, b):
    global t
    x = cut(src, a, b)
    pieces.append(x)
    segs.append([a, b if b is not None else len(src) / SR, round(t, 4)])
    t += len(x) / SR


def add(x):
    global t
    pieces.append(x)
    t += len(x) / SR


if v == "operator":
    INS = 17.05  # silence between "CAN." and "Each"
    more = load("audio-src/narration-operator-more-a.mp3")
    phrase = cut(more, 5.95, 8.32)  # "And much more, still in development."
    ref = meter.integrated_loudness(cut(src, 17.2, 21.3).astype(np.float64))
    phrase = phrase * 10 ** ((ref - meter.integrated_loudness(phrase.astype(np.float64))) / 20)
    keep(0, INS)
    add(sil(0.15))
    add(phrase.astype(np.float32))
    add(sil(0.3))
    keep(INS, STATUS[0])
else:
    keep(0, STATUS[0])
add(sil(GAP))
keep(STATUS[1], None)

out = np.concatenate(pieces).astype(np.float32)
wav = f"public/audio/{v}-voice.wav"
pcm = (np.clip(out, -1, 1) * 32767).astype("<i2")
import wave  # noqa: E402

with wave.open(wav, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
json.dump({"segments": segs, "duration": round(len(out) / SR, 3)}, open(f"src/social/edit-{v}.json", "w"), indent=1)
print(v, "edited duration", round(len(out) / SR, 2), "s  segments", segs)


# captions: the clean words of the original take, moved to their new times (words in the cut are dropped)
def fixed(words_json, tmp):
    subprocess.run(["python3", "scripts/fix_words.py", words_json, tmp], check=True, capture_output=True)
    return json.load(open(tmp))


def remap(x):
    for a, b, n in segs:
        if a <= x < b:
            return n + (x - a)
    return None


words = []
for s0, s1, w in fixed(f"audio-src/narration-{v}.words.json", f"qa/words-{v}-orig.json"):
    n0 = remap(s0)
    if n0 is not None:
        words.append([round(n0, 2), round(n0 + (s1 - s0), 2), w])
if v == "operator":
    subprocess.run(["python3", "scripts/words.py", "audio-src/narration-operator-more-a.mp3", "qa/words-more-a.json"], check=True, capture_output=True)
    ins = [[round(INS + 0.15 + (s0 - 5.95), 2), round(INS + 0.15 + (s1 - 5.95), 2), w] for s0, s1, w in fixed("qa/words-more-a.json", "qa/words-more-a-fix.json") if 5.95 <= s0 < 8.32]
    ins[0][2] = ins[0][2].capitalize()
    ins = [[a, b, 'more,' if w == 'more' else w] for a, b, w in ins]
    words = sorted(words + ins)
json.dump(words, open(f"src/social/words-{v}.json", "w"))
print(" ".join(w[2] for w in words))
print("tagline at", [w[0] for w in words if w[2].startswith("LambdaOS")][-1])
