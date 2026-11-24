"""Boot animation audio: showcase mix (loops=2) and per-part WAVs for bootanimation.zip."""
import json
import sys
import wave

import numpy as np

sys.path.insert(0, "scripts")
from sfx import *  # noqa: F401,F403

FPS = 60
P0, LOOP, P2 = 210, 120, 270
s = lambda fr: fr / FPS


def intro(tr: Track, at: float = 0.0):
    tr.add(at + s(18), blip(2637, 0.15, 0.1), -18)
    tr.add(at + s(26), whoosh(0.6, 2500, 9000, 0.35, width=1.0), -16)
    tr.add(at + s(50), pad([146.83, 220.0], 1.9, 0.3, attack=1.2, release=0.4, bright=900), -16)
    for i in range(10):
        tr.add(at + s(60 + i * 6), tick(0.18, 2200 + 140 * i, 0.02), -18)
    tr.add(at + s(128), lambda_logo(0.8), -3)


def loop_bed(tr: Track, at: float, loops: int):
    dur = s(LOOP) * loops
    tr.add(at, pad([73.42, 110.0, 164.81], dur + 0.6, 0.25, attack=0.4, release=0.6, bright=700), -20)
    for k in range(loops):
        tr.add(at + k * s(LOOP) + s(LOOP) * 0.75, tick(0.12, 3600, 0.015), -24)


def outro(tr: Track, at: float):
    tr.add(at + s(8), whoosh(0.7, 300, 4200, 0.4), -14)
    for i in range(7):
        tr.add(at + s(40 + i * 3), tick(0.15, 2000 + 180 * i, 0.02), -20)
    tr.add(at + s(62), pad([73.42, 110.0, 146.83, 220.0, 277.18], 3.4, 0.5, attack=0.05, release=2.4, bright=1500), -8)
    tr.add(at + s(62), impact(0.5, 1.2, 1.8, 0.2), -14)
    tr.add(at + s(66), bell(880.0, 2.6, 0.3), -14)
    tr.add(at + s(98), shimmer(1.4, 0.2, 2349), -20)


def write_wav(x, path):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# showcase (loops=2)
loops = 2
dur = s(P0 + LOOP * loops + P2)
tr = Track(dur)
intro(tr, 0)
loop_bed(tr, s(P0), loops)
outro(tr, s(P0 + LOOP * loops))
mix = fade(tr.out(), 0, 0.6)
info = master(mix, "public/audio/boot-mix.wav", lufs=-16.0, tp=-3.0)
print("showcase", json.dumps(info))

# zip parts (no audio in the loop part, so the loop stays seamless)
gain = 10 ** ((-16.0 - (-16.0)) / 20)
p0 = Track(s(P0) + 3.0)
intro(p0, 0)
p2 = Track(s(P2))
outro(p2, 0)
import pyloudnorm as pyln
meter = pyln.Meter(SR)
ref = meter.integrated_loudness(mix.astype(np.float64))
for name, x in (("part0", p0.out()), ("part2", fade(p2.out(), 0, 0.5))):
    # reuse the showcase normalisation gain so parts match the mp4
    g = 10 ** ((-16.0 - meter.integrated_loudness(tr.out().astype(np.float64))) / 20)
    y = np.clip(x * g, -0.89, 0.89)
    write_wav(y, f"out/boot-{name}.wav")
    print(name, round(len(y) / SR, 2), "s")
