"""Lex mode audio: ElevenLabs music bed (drop at 13.0 s) + synthesised SFX."""
import json, sys
import numpy as np
sys.path.insert(0, "scripts")
from sfx import *  # noqa

FPS = 30
fr = lambda n: n / FPS
DUR = 1095 / FPS
music = load("audio-src/music-lex.mp3")
mt = Track(DUR)
mt.add(0.0, high_shelf(low_shelf(hpf(fade(music[: int(DUR * SR)], 0.0, 1.2), 34), 85, -4.5), 3500, 2.5), -1)
fx = Track(DUR)
fx.add(fr(30), tick(0.25, 2600), -14)
fx.add(fr(40), tick(0.2, 3000), -16)
fx.add(fr(160), tick(0.3, 2800), -12)
fx.add(fr(172), tick(0.3, 3200), -12)
fx.add(fr(150), whoosh(0.7, 200, 1800, 0.35), -16)
fx.add(fr(200), plug(0.8), -4)
fx.add(fr(200), bass_pulse(0.5, 60, 0.3), -14)
fx.add(fr(212), ui_confirm(0.3), -10)
fx.add(fr(240), click(0.5), -8)
fx.add(fr(268), whoosh(2.4, 150, 3500, 0.6), -7)
fx.add(fr(282), whoosh(0.9, 3000, 400, 0.4), -14)
fx.add(fr(300), whoosh(1.4, 80, 900, 0.5), -12)
fx.add(fr(372), crt_zip(0.45), -6)
fx.add(fr(382), degauss(0.6), -8)
fx.add(fr(390), impact(0.9, 1.4, 2.4, 0.8), -6)
fx.add(fr(390), shimmer(1.8, 0.3, 1318), -14)
fx.add(fr(414), power_on(0.4), -14)
for k, at in enumerate((450, 505, 560, 615)):
    fx.add(fr(at), blip(740 * 2 ** (k * 2 / 12), 0.3, 0.16), -10)
    fx.add(fr(at) - 0.05, whoosh(0.35, 600, 4000, 0.3, rev=False), -18)
fx.add(fr(514), click(0.5), -9)
fx.add(fr(505), typing(0.9, 18, 0.18), -16)
fx.add(fr(597), typing(1.6, 18, 0.18, seed=8), -16)
fx.add(fr(566), blip(1568, 0.2, 0.1), -16)
fx.add(fr(616), blip(1318, 0.2, 0.1), -16)
fx.add(fr(630), blip(1568, 0.2, 0.1), -18)
fx.add(fr(808), whoosh(1.2, 4000, 200, 0.5), -10)
fx.add(fr(900), impact(0.6, 1.2, 2.2, 0.4), -12)
fx.add(fr(904), shimmer(2.2, 0.28, 1046), -13)
for k, at in enumerate((930, 936, 942)):
    fx.add(fr(at), tick(0.25, 2600 + 300 * k), -14)
VERT = len(sys.argv) > 1 and sys.argv[1] == "vertical"
if VERT:  # extra hits for the vertical cut: L-E-X slams, kinetic words, beat-synced window punches
    for at in (15, 31, 48):
        fx.add(fr(at), impact(0.7, 0.8, 1.2, 1.0), -9)
        fx.add(fr(at), glitch(0.12, 0.3, at), -18)
    fx.add(fr(52), whoosh(0.9, 120, 3000, 0.5), -10)
    for at in (200, 270, 300, 368):
        fx.add(fr(at), thud(0.8), -12)
    fx.add(fr(390), impact(1.0, 1.6, 2.6, 1.2), -4)
    fx.add(fr(404), whoosh(0.5, 3000, 300, 0.4), -12)
    for at in (450, 505, 560, 615):
        fx.add(fr(at), thud(0.6), -16)
    fx.add(fr(868), impact(0.6, 1.0, 1.4, 0.8), -12)
    for i, at in enumerate((904, 908, 912)):
        fx.add(fr(at), impact(0.6, 0.6, 1.0, 1.0), -12)
mix = mt.out() + fx.out() * 10 ** (-3 / 20)
mix = fade(mix, 0.02, 0.8)
print(json.dumps(master(mix, "public/audio/lexv-mix.wav" if VERT else "public/audio/lex-mix.wav", lufs=-14.0, tp=-3.0)))
