"""Lamb video audio: ElevenLabs music bed with a filter-sweep reveal + UI/character SFX."""
import json, sys
import numpy as np
sys.path.insert(0, "scripts")
from sfx import *  # noqa

FPS = 30
fr = lambda n: n / FPS
DUR = 990 / FPS
music = load("audio-src/music-lamb.mp3")[: int(DUR * SR)]
# reveal: low-pass sweep opens as the wool lights up (0 → 2.4 s)
n = int(2.6 * SR)
cut = np.concatenate([np.geomspace(260, 16000, n), np.full(len(music) - n, 16000.0)])
head = int(3.0 * SR)
for ch in range(2):
    music[:head, ch] = svf(music[:head, ch].astype(np.float64), cut[:head], 0.8, "lp").astype(np.float32)
music = high_shelf(low_shelf(hpf(fade(music, 0.8, 1.5), 32), 90, -3.0), 3000, 3.0)
mt = Track(DUR)
mt.add(0, music, -4)

fx = Track(DUR)
fx.add(fr(8), shimmer(1.2, 0.2, 2093), -16)
fx.add(fr(30), blip(1760, 0.15, 0.07), -18)
fx.add(fr(42), whoosh(0.9, 200, 3000, 0.4), -12)
fx.add(fr(50), power_on(0.45), -10)
fx.add(fr(58), tick(0.25, 2600), -14)
fx.add(fr(70), tick(0.2, 3000), -16)
for k, at in enumerate((104, 122, 140, 158)):
    fx.add(fr(at), tick(0.3, 2800 + 250 * k), -12)
fx.add(fr(203), whoosh(1.1, 120, 2600, 0.5), -10)
def pop(peak=0.3):
    return blip(1046, peak, 0.12, second=1568)
fx.add(fr(262), pop(), -10)
fx.add(fr(300), typing(1.6, 14, 0.18), -14)
fx.add(fr(358), whoosh(0.3, 1500, 6000, 0.3, rev=False), -16)
fx.add(fr(362), click(0.45), -10)
for i in range(4):
    fx.add(fr(376 + i * 7), tick(0.12, 2200, 0.02), -20)
fx.add(fr(404), pop(), -10)
fx.add(fr(468), click(0.5), -9)
for i in range(3):
    a = 478 + i * 50
    fx.add(fr(a), blip(660, 0.18, 0.1), -16)
    fx.add(fr(a + 44), ui_confirm(0.3), -10)
fx.add(fr(640), bell(1318.5, 1.6, 0.25), -14)
fx.add(fr(640), sparkle(0.25, 8, 0.8, 11), -14)
for at in (262, 368, 478, 640, 684):  # face swaps
    fx.add(fr(at), blip(2349, 0.1, 0.05), -22)
fx.add(fr(704), whoosh(0.8, 3000, 200, 0.45), -11)
for i in range(5):
    fx.add(fr(728 + i * 5), tick(0.25, 2400 + 200 * i), -13)
for k in range(5):
    fx.add(fr(760 + k * 20), blip(880 * 2 ** (k * 2 / 12), 0.18, 0.1), -17)
fx.add(fr(868), whoosh(0.6, 400, 4000, 0.4), -13)
fx.add(fr(872), impact(0.5, 1.0, 1.8, 0.3), -14)
# the "evil laugh": mischievous staccato synth giggle on the laugh frames
for i, semis in enumerate((7, 4, 7, 4, 9, 5, 12)):
    fx.add(fr(884 + i * 4), blip(392 * 2 ** (semis / 12), 0.28, 0.09), -9)
fx.add(fr(906), shimmer(1.6, 0.2, 1568), -16)
mix = mt.out() + fx.out() * 10 ** (-2 / 20)
mix = fade(mix, 0, 0.9)
print(json.dumps(master(mix, "public/audio/lamb-mix.wav", lufs=-14.0, tp=-3.0)))
