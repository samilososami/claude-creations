"""Operator flow audio: a section of the explainer bed + UI sound design."""
import json, sys
import numpy as np
sys.path.insert(0, "scripts")
from sfx import *  # noqa

FPS = 30
fr = lambda n: n / FPS
DUR = 660 / FPS
music = load("audio-src/music-explainer.mp3")
seg = music[int(16.87 * SR): int((16.87 + DUR) * SR)]  # starts on a beat (phase .537 + 27 beats)
seg = fade(seg, 0.4, 1.6)
mt = Track(DUR)
mt.add(0, seg, -6)
m = mt.out()
tt = np.arange(len(m)) / SR
duck = np.interp(tt, [0, 19.6, 20.0, 21.0, 22.0], [1, 1, 0.45, 0.45, 0.3]).astype(np.float32)
m = m * duck[:, None]
fx = Track(DUR)
for k, at in enumerate((6, 18, 30)):
    fx.add(fr(at), tick(0.3, 2600 + 300 * k), -12)
fx.add(fr(44), whoosh(1.0, 120, 2400, 0.5), -10)
fx.add(fr(118), click(0.5), -8)
fx.add(fr(122), whoosh(0.4, 1500, 300, 0.4), -14)
for i in range(4):
    fx.add(fr(140 + i * 18), blip(1568, 0.16, 0.08), -18)  # radar pings
for i in range(5):
    fx.add(fr(148 + i * 10), tick(0.2, 2200 + 150 * i), -17)
fx.add(fr(226), click(0.5), -8)
fx.add(fr(232), whoosh(0.4, 1500, 300, 0.4), -14)
fx.add(fr(300), riser(1.15, 200, 1600, 0.4), -10)
fx.add(fr(334), thud(0.8), -9)
fx.add(fr(334), ui_confirm(0.3), -10)
fx.add(fr(336), typing(3.6, 9, 0.12), -20)
fx.add(fr(450), ui_confirm(0.35), -8)
fx.add(fr(520), ui_confirm(0.35), -8)
fx.add(fr(522), shimmer(1.2, 0.22, 2093), -15)
fx.add(fr(530), whoosh(0.6, 300, 3000, 0.4), -12)
for i in range(7):
    fx.add(fr(540 + i * 4), tick(0.18, 2000 + 120 * i), -18)
fx.add(fr(600) - 0.55, lambda_logo(0.9), -4)
mix = m + fx.out() * 10 ** (-2 / 20)
mix = fade(mix, 0, 0.7)
print(json.dumps(master(mix, "public/audio/operator-mix.wav", lufs=-14.0, tp=-3.0)))
