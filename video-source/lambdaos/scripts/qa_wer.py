"""Transcribe a final mp4 (voice + music + effects) and compare it with the clean narration.

usage: python3 scripts/qa_wer.py final.mp4 audio-src/narration-x.words.json
Prints the word error rate and any words that differ.
"""
import difflib
import json
import re
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

video, ref = sys.argv[1], sys.argv[2]
norm = lambda ws: [re.sub(r"[^a-z0-9]", "", w.lower()) for w in ws if re.sub(r"[^a-z0-9]", "", w.lower())]
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
m = WhisperModel("small.en", device="cpu", compute_type="int8")
segs, _ = m.transcribe(np.frombuffer(pcm, dtype=np.float32), word_timestamps=True, beam_size=5)
hyp = norm([w.word for s in segs for w in s.words])
r = norm([w[2] for w in json.load(open(ref))])
sm = difflib.SequenceMatcher(a=r, b=hyp, autojunk=False)
errs = sum(max(i2 - i1, j2 - j1) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal")
print(f"WER {errs / len(r) * 100:.1f}%  ({errs}/{len(r)} words)")
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op != "equal":
        print(f"  {op}: {' '.join(r[i1:i2])!r} -> {' '.join(hyp[j1:j2])!r}")
