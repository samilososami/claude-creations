"""Logo sting audio (5 s): slab whooshes from opposite sides, lock on the sound logo, wordmark ticks."""
import json, sys
sys.path.insert(0, "scripts")
from sfx import *  # noqa

DUR = 5.0
s = lambda f60: f60 / 60
tr = Track(DUR)
tr.add(0.0, riser(1.0, 120, 2600, 0.5), -12)
tr.add(s(14), whoosh(0.85, 300, 6000, 0.6, width=0.4), -8, pan=0.6)
tr.add(s(18), whoosh(0.8, 250, 5000, 0.6, width=0.4), -9, pan=-0.6)
tr.add(s(62) - 0.55, lambda_logo(0.95), 0)
tr.add(s(62), impact(0.8, 1.2, 2.2, 1.0), -7)
tr.add(s(62), glitch(0.12, 0.3, 3), -18)
tr.add(s(118), whoosh(0.7, 800, 5000, 0.35), -15)
for i in range(7):
    tr.add(s(140 + i * 3.5), tick(0.2, 2400 + 220 * i, 0.02), -16)
tr.add(s(186), shimmer(1.6, 0.25, 1760), -15)
mix = fade(tr.out(), 0, 0.5)
print(json.dumps(master(mix, "public/audio/sting-mix.wav", lufs=-14.0, tp=-3.0)))
