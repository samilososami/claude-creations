"""Audio mix for the Explainer: narration + ElevenLabs music bed + synthesised SFX.

Times are video seconds. Narration starts at NARR (1.0 s); word times come
from the transcription in src/explainer/words.json.
"""
import json
import sys

import numpy as np

sys.path.insert(0, "scripts")
from sfx import *  # noqa: E402,F403

DUR = 65.0
NARR = 1.0
W = lambda s: s + NARR  # narration time → video time

voice = load("audio-src/narration-explainer.mp3")
music = load("audio-src/music-explainer.mp3")

# ── voice ──
vt = Track(DUR)
vt.add(NARR, voice, gain_db=0)

# ── music: enters on the wordmark hit (1.67 s), source starts on a beat at 5.97 s ──
M_IN = 1.67
SRC0 = 5.97
mseg = music[int(SRC0 * SR):]
mseg = mseg[: int((DUR - M_IN) * SR)]
mseg = low_shelf(fade(mseg, fin=0.05, fout=3.0), 80, -3.0)
mt = Track(DUR)
mt.add(M_IN, mseg, gain_db=-12.0)
m = mt.out()
# tame the sub: gentle low cut on the bed so the voice owns the mix on phone speakers
from sfx import hp as _hp
m = np.stack([_hp(m[:, 0], 70) * 0.55 + m[:, 0] * 0.45, _hp(m[:, 1], 70) * 0.55 + m[:, 1] * 0.45], 1).astype(np.float32)
# duck under the voice
duck = sidechain_env(vt.out(), depth_db=7.5, attack=0.05, release=0.45)
m = m * duck[:, None]
# extra dip for the "And then..." beat (41.6 → 43.6 video) and recover on Lamb
tt = np.arange(len(m)) / SR
dip = np.interp(tt, [41.7, 42.2, 43.5, 43.75], [1.0, 0.35, 0.35, 1.0])
m = m * dip[:, None].astype(np.float32)

# ── SFX ──
fx = Track(DUR)
fx.add(0.0, drone(2.2, 0.35, 55.0), -15)
fx.add(0.26, crt_zip(0.4), -8)
fx.add(0.35, riser(1.3, 150, 1800, 0.5), -12)
fx.add(1.67 - 0.6, reverse_swell(0.6, 0.4, 110), -14)
fx.add(1.67, impact(0.9, 1.2, 2.2), -8)
fx.add(1.67, shimmer(1.8, 0.3, 1320), -14)
fx.add(2.95, whoosh(0.6, 400, 6000, 0.6), -9)
for s in (2.12, 2.6, 3.48):
    fx.add(W(s), tick(0.3, 2600), -12)
fx.add(W(5.34) - 0.9, reverse_swell(0.9, 0.5, 98), -10)
fx.add(W(5.34), impact(0.85, 0.8, 1.4, 1.4), -10)
fx.add(W(5.34), glitch(0.3, 0.5), -13)
fx.add(W(5.34) + 0.17, tick(0.4, 4200, 0.02), -8)
fx.add(7.15, whoosh(1.3, 120, 2600, 0.6), -8)
for k, s in enumerate((8.56, 8.96, 9.4)):
    fx.add(W(s), blip(1100 + k * 220, 0.3, 0.12), -13)
fx.add(W(10.94), power_on(0.5), -9)
for k, s in enumerate((10.94, 12.4, 13.7, 15.42)):
    fx.add(W(s), tick(0.32, 3000 + 300 * k), -11)
fx.add(W(13.6), whoosh(0.45, 800, 5000, 0.4), -15)
fx.add(W(16.1), whoosh(0.5, 2000, 400, 0.45), -14)
fx.add(W(18.2) - 0.1, whoosh_down(0.9, 0.6), -8)
fx.add(W(18.72), impact(0.8, 1.4, 1.8, 0.6), -11)
fx.add(W(19.6), shimmer(1.2, 0.3, 880), -14)
fx.add(W(19.6), bass_pulse(0.6, 44), -14)
for s in (20.82, 22.88, 24.52, 25.44):
    fx.add(W(s), ui_confirm(0.3), -12)
fx.add(W(18.7), typing(6.6, 7, 0.16), -22)
fx.add(W(25.95) - 0.1, whoosh(0.8, 200, 4000, 0.55), -9)
fx.add(W(27.3), impact(0.55, 0.6, 1.0, 0.5), -12)
for k, s in enumerate((29.76, 30.48, 31.14, 31.9)):
    fx.add(W(s), blip(880 * 2 ** (k * 3 / 12), 0.28, 0.13), -11)
fx.add(W(32.86), click(0.5), -8)
fx.add(W(32.86) + 0.12, whoosh(0.45, 1500, 300, 0.4), -15)
fx.add(W(34.4), ui_confirm(0.3), -11)
fx.add(W(35.34), blip(660, 0.3, 0.2), -11)
fx.add(W(36.3), ui_confirm(0.34), -9)
fx.add(W(36.3) + 0.25, shimmer(0.9, 0.22, 2093), -16)
fx.add(W(36.85), whoosh(0.6, 300, 5000, 0.5), -12)
fx.add(W(37.04), typing(2.7, 15, 0.2), -15)
fx.add(W(38.12), riser(1.6, 300, 2000, 0.35), -18)
fx.add(W(39.86), bass_pulse(0.7, 46, 0.8), -12)
fx.add(W(39.86), shimmer(1.4, 0.3, 1568), -13)
fx.add(W(40.5), whoosh_down(0.6, 0.4), -15)
fx.add(W(41.04), heartbeat_tone(110, 0.5, 0.35), -12)
fx.add(W(42.6) - 1.0, reverse_swell(1.0, 0.55, 110), -9)
fx.add(W(42.6), impact(0.8, 1.0, 1.6, 0.8), -10)
fx.add(W(42.6), sparkle(0.3, 8, 0.9), -14)
for s in (43.38, 44.78, 45.62):
    fx.add(W(s), tick(0.32, 3400), -11)
fx.add(W(45.0), blip(1760, 0.18, 0.08), -20)  # blink
fx.add(W(46.4), whoosh(0.7, 300, 5000, 0.5), -11)
for i in range(9):
    fx.add(W(47.4) + i * 2 / 30, tick(0.2, 2200 + 120 * i), -20)
fx.add(W(50.04), thud(0.95), -8)
fx.add(W(50.04), glitch(0.2, 0.3, 21), -16)
fx.add(W(51.0), whoosh(0.25, 3000, 800, 0.3, rev=False), -14)
fx.add(W(51.74) - 0.1, whoosh(0.6, 200, 3000, 0.4), -14)
for i in range(5):
    fx.add(W(51.74) + i * 3 / 30, tick(0.22, 2600 + 160 * i), -17)
fx.add(W(53.78), heartbeat_tone(330, 0.4, 0.25), -15)
fx.add(W(54.84), sparkle(0.35, 12, 1.0, 7), -9)
fx.add(W(54.84), shimmer(1.6, 0.3, 1760), -12)
fx.add(W(55.0), typing(0.8, 26, 0.15), -18)
fx.add(W(56.3) - 1.4, riser(1.4, 160, 3000, 0.55), -9)
fx.add(W(56.3), impact(1.0, 1.6, 3.0, 1.0), -7)
fx.add(W(56.3), shimmer(2.5, 0.3, 1046), -12)
for k, s in enumerate((57.42, 58.54)):
    fx.add(W(s), tick(0.25, 2800 + 400 * k), -16)
fx.add(W(57.42) + 1.6, drone(4.0, 0.3, 82.0), -20)

import pyloudnorm as pyln
_meter = pyln.Meter(SR)
for name, stem in (("voice", vt.out()), ("music", m), ("fx", fx.out())):
    print(name, "LUFS", round(_meter.integrated_loudness(stem.astype(np.float64)), 1))
mix = vt.out() + m + fx.out() * 10 ** (-4.5 / 20)
mix = fade(mix, 0, 0.8)
info = master(mix, "public/audio/explainer-mix.wav", lufs=-14.0, tp=-3.0)
print(json.dumps(info))
