"""Word-level timestamps for a narration file (local faster-whisper).

usage: python3 scripts/words.py audio.mp3 out.json [model]
"""
import json
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

src, dst = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else "small.en"
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, dtype=np.float32)
m = WhisperModel(model, device="cpu", compute_type="int8")
segs, _ = m.transcribe(audio, word_timestamps=True, beam_size=5)
out = [[round(w.start, 2), round(w.end, 2), w.word.strip()] for s in segs for w in s.words]
json.dump(out, open(dst, "w"))
print(" ".join(f"{w}@{a}" for a, b, w in out))
