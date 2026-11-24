"""Audio for the narrated social explainers (LEX, Lamb, Operator).

usage: python3 scripts/mix_social.py lex|lamb|operator

Voice (ElevenLabs) + music bed (ElevenLabs Music) + quiet synthesised UI sounds.
The effects stay under the voice: no big impacts or risers, just ticks, soft
whooshes and confirmations placed on the frame where things happen.
Times below are narration seconds unless written as V(...) (video seconds).
"""
import json
import sys

import numpy as np
import pyloudnorm as pyln

sys.path.insert(0, "scripts")
from sfx import *  # noqa: E402,F403
from sfx import hp as _hp  # noqa: E402

NARR = 1.0
R = lambda s: s  # original-take seconds → edited-narration seconds (set per video below)
W = lambda s: R(s) + NARR  # narration → video seconds
E = lambda s: s + NARR  # edited-narration seconds → video seconds
meter = pyln.Meter(SR)


def lufs_norm(x, target):
    return x * 10 ** ((target - meter.integrated_loudness(x.astype(np.float64))) / 20)


def printer(dur=1.4, peak=0.25):
    """Thermal receipt printer: gated band-passed noise with a stepper whine."""
    tt = t_(dur)
    gate = (np.sin(2 * np.pi * 38 * tt) > 0.2).astype(np.float32)
    x = svf(noise(len(tt)), 3200, 1.2, "bp") * gate + 0.15 * np.sin(2 * np.pi * 760 * tt) * gate
    x *= np.minimum(1, tt / 0.03) * np.minimum(1, (dur - tt) / 0.08)
    return st(norm(x, peak), 0.3)


def tail_pitch(music, start, length=2.0):
    """Strongest pitch in a slice of the music, folded to octave 5 (for a bell that fits the key)."""
    seg = music[int(start * SR): int((start + length) * SR)].mean(1)
    sp = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
    fr = np.fft.rfftfreq(len(seg), 1 / SR)
    m = (fr > 80) & (fr < 1000)
    f0 = fr[m][np.argmax(sp[m])]
    while f0 < 520:
        f0 *= 2
    while f0 > 1040:
        f0 /= 2
    return float(f0)


def common_end(fx, ev, music, m_off):
    """Outro shared by all three: a soft swell into a bell tuned to the music's last chord."""
    o = W(ev["outro"])
    fx.add(o - 0.9, reverse_swell(0.9, 0.4, 110), -20)
    fx.add(o - 0.1, sub_swell(0.5, 0.5), -18)
    bf = tail_pitch(music, max(0.0, o - m_off - 0.5))
    fx.add(o, bell(bf, 3.2, 0.32), -15)
    fx.add(o + 0.05, bell(bf * 1.5, 2.6, 0.2), -22)
    fx.add(o, shimmer(2.4, 0.25, bf * 2), -24)
    print("outro bell", round(bf, 1), "Hz")


def lex_fx(fx):
    for i, s in enumerate((0.4, 0.57, 0.73)):
        fx.add(s, tick(0.3, 2200 + 260 * i), -20)
    fx.add(0.05, reverse_swell(0.7, 0.35, 98), -22)
    fx.add(W(1.44), tick(0.25, 3400), -24)
    fx.add(W(3.25) - 0.1, whoosh(0.6, 300, 3500, 0.4), -21)
    fx.add(W(4.26), whoosh(0.5, 1200, 400, 0.35, rev=False), -23)
    fx.add(W(5.08) + 0.15, whoosh(0.9, 200, 2500, 0.4), -20)
    fx.add(W(5.08) + 0.7, power_on(0.4), -22)
    fx.add(W(5.08) + 0.8, shimmer(1.2, 0.22, 1320), -26)
    for k, s in enumerate((6.92, 7.82, 8.64, 9.26)):
        fx.add(W(s), tick(0.32, 2800 + 220 * k), -19)
    fx.add(W(6.92) + 0.1, blip(880, 0.22, 0.1), -24)
    fx.add(W(6.92) + 0.3, blip(1100, 0.22, 0.1), -24)
    fx.add(W(10.42) - 0.25, whoosh(0.5, 400, 3000, 0.35), -22)
    for s in (10.42, 10.88, 11.54):
        fx.add(W(s) + 0.07, click(0.4), -21)
    fx.add(W(10.88) - 0.1, whoosh(0.4, 600, 2600, 0.3), -25)
    fx.add(W(11.54) - 0.1, whoosh(0.4, 600, 2600, 0.3), -25)
    fx.add(W(12.18), whoosh(0.7, 2500, 300, 0.35, rev=False), -22)
    fx.add(W(14.38) - 0.15, whoosh(0.6, 300, 4000, 0.4), -20)
    for i in range(3):
        fx.add(W(14.9) + (2 + i * 4) / 30, tick(0.26, 2400 + 300 * i), -22)
    for s in (16.54, 20.22, 24.16):
        fx.add(W(s) - 0.2, tick(0.35, 3000), -19)
    fx.add(W(16.94), whoosh(1.9, 200, 1200, 0.25), -26)
    fx.add(W(19.02) - 0.15, plug(0.5), -18)
    fx.add(W(19.02), power_on(0.4), -20)
    for i in range(4):
        fx.add(W(20.84) + i * 0.3, blip(1320 + 110 * i, 0.15, 0.12), -27)
    fx.add(W(21.46), power_on(0.4), -20)
    fx.add(W(20.22) - 0.2, whoosh(0.5, 500, 2500, 0.3), -24)
    fx.add(W(24.16) - 0.2, whoosh(0.5, 500, 2500, 0.3), -24)
    fx.add(W(24.86), typing(1.0, 22, 0.18), -24)
    fx.add(W(26.68), ui_confirm(0.3), -19)
    fx.add(W(27.12), blip(990, 0.2, 0.18, second=1320), -24)
    fx.add(W(28.76) - 0.15, whoosh(0.6, 300, 4000, 0.4), -20)
    for i in range(4):
        fx.add(W(29.96) + i * 0.1, tick(0.24, 2300 + 200 * i), -23)
    fx.add(W(31.92) - 0.35, whoosh(0.8, 200, 3000, 0.45), -19)
    fx.add(W(31.92), sub_swell(0.5, 0.45), -22)
    fx.add(W(31.92) + 0.2, shimmer(1.4, 0.22, 1568), -24)


def operator_fx(fx):
    fx.add(0.0, whoosh(0.8, 200, 3000, 0.4), -21)
    for i in range(6):
        fx.add(0.33 + i * 0.1, tick(0.22, 2200 + 180 * i), -25)
    fx.add(W(0.68), tick(0.28, 3200), -22)
    fx.add(W(4.3) - 0.1, whoosh(0.6, 300, 3000, 0.35), -21)
    for k, s in enumerate((6.0, 6.92, 7.72)):
        fx.add(W(s) - 0.05, blip(990 + 140 * k, 0.22, 0.12), -21)
    for s in (6.92, 7.72):
        fx.add(W(s) - 0.07, click(0.45), -20)
    fx.add(W(8.36), whoosh(0.6, 2500, 300, 0.35, rev=False), -21)
    fx.add(W(8.9), ui_confirm(0.28), -21)
    fx.add(W(10.2) - 0.05, whoosh(0.9, 200, 2500, 0.45), -19)
    for k, s in enumerate((12.46, 13.54, 13.94, 14.84, 16.0, 16.62)):
        fx.add(W(s) - 0.05, blip(660 * 2 ** (k * 2 / 12), 0.22, 0.12), -20)
    fx.add(W(16.62) + 0.3, shimmer(1.0, 0.2, 1760), -25)
    fx.add(W(17.24) - 0.2, whoosh(0.6, 300, 3500, 0.4), -20)
    for i in range(5):
        fx.add(W(17.24) + (8 + i * 3) / 30, tick(0.2, 2400 + 150 * i), -25)
    for k, s in enumerate((19.88, 19.88 + 11 / 30, 19.88 + 22 / 30, 21.78 - 14 / 30)):
        fx.add(W(s), tick(0.32, 3000 + 200 * k), -20)
    fx.add(W(22.04) - 0.06, click(0.5), -17)
    fx.add(W(22.56) - 0.2, whoosh(0.5, 400, 3000, 0.3), -23)
    fx.add(W(22.96) - 0.06, click(0.5), -17)
    fx.add(W(23.5), whoosh(0.4, 1500, 500, 0.3, rev=False), -24)
    fx.add(W(24.6), ui_confirm(0.28), -20)
    for j in range(3):
        fx.add(W(24.6) + (2 + j * 4) / 30, tick(0.22, 2800), -25)
    fx.add(W(25.44), blip(740, 0.22, 0.16), -21)
    fx.add(W(25.44) + 0.1, typing(1.0, 14, 0.12, seed=8), -28)
    fx.add(W(26.64), ui_confirm(0.32), -18)
    fx.add(W(26.64) + 0.2, shimmer(1.0, 0.2, 2093), -25)
    fx.add(W(27.24) - 0.15, whoosh(0.5, 300, 3000, 0.35), -22)
    fx.add(W(27.3), printer(1.5, 0.25), -23)
    fx.add(W(29.28), ui_confirm(0.3), -19)
    # "And much more, still in development." (spliced line, edited-narration seconds)
    fx.add(E(17.39) - 0.1, whoosh(0.6, 2200, 500, 0.3, rev=False), -23)
    fx.add(E(17.39) + 0.1, blip(988, 0.2, 0.12, second=1319), -22)
    fx.add(E(18.91), tick(0.26, 2600), -23)


def lamb_fx(fx):
    fx.add(0.0, reverse_swell(1.2, 0.35, 110), -22)
    fx.add(W(0.34) - 0.05, bell(987.77, 2.2, 0.25), -21)
    fx.add(W(0.34), sparkle(0.25, 7, 0.9), -25)
    fx.add(W(1.28), tick(0.28, 2800), -22)
    fx.add(W(2.06), tick(0.28, 3300), -22)
    fx.add(2.75, blip(1760, 0.14, 0.06), -28)  # blink
    fx.add(W(4.3) - 0.05, whoosh(0.6, 300, 3500, 0.35), -21)
    for i in range(6):
        fx.add(5.4 + i * 0.1, tick(0.2, 2000 + 150 * i), -26)
    fx.add(W(5.1) + 0.2, whoosh(0.7, 300, 1800, 0.25), -27)
    fx.add(W(6.74) - 0.05, glitch(0.25, 0.3, 13), -24)
    fx.add(W(6.74), whoosh(0.6, 3000, 300, 0.35, rev=False), -21)
    fx.add(W(8.26), tick(0.3, 3000), -21)
    fx.add(W(8.26) + 0.13, blip(1175, 0.2, 0.1), -24)
    fx.add(W(9.42), blip(587, 0.18, 0.12), -25)
    fx.add(W(9.42) + 0.15, whoosh(0.3, 3000, 1000, 0.25, rev=False), -26)
    fx.add(W(9.82), blip(1175, 0.22, 0.1, second=1568), -21)
    fx.add(W(9.82) + 0.05, typing(0.7, 20, 0.14), -27)
    fx.add(W(10.85) - 0.15, whoosh(0.6, 300, 3500, 0.4), -20)
    for s in (13.7, 14.9):
        fx.add(W(s) - 0.05, glitch(0.15, 0.25, 31), -25)
        fx.add(W(s), tick(0.3, 2400), -21)
    fx.add(W(16.42), sparkle(0.22, 10, 1.6, 5), -24)
    fx.add(W(18.96), ui_confirm(0.3), -19)
    fx.add(W(20.62) - 0.15, whoosh(0.6, 300, 3500, 0.4), -20)
    fx.add(W(21.1), riser(2.6, 300, 1400, 0.2), -28)
    for i in range(8):
        fx.add(W(23.64) + (i * 2) / 30, tick(0.2, 2000 + 140 * i), -25)
    fx.add(W(24.88), shimmer(1.2, 0.22, 1568), -24)
    fx.add(W(25.86) - 0.15, whoosh(0.6, 300, 3500, 0.4), -20)
    for i in range(22):
        fx.add(W(25.86) - 2 / 30 + i * 0.03, tick(0.14, 1800 + 60 * i, 0.015), -28)
    for i in range(21):
        fx.add(W(27.24) - 2 / 30 + i * 0.032, tick(0.12, 3000 - 60 * i, 0.015), -29)
    fx.add(W(29.1) - 0.1, ui_confirm(0.32), -18)
    fx.add(W(29.1), bell(783.99, 1.8, 0.2), -25)
    fx.add(W(31.34) - 0.1, whoosh(0.6, 300, 3500, 0.4), -20)
    fx.add(W(32.32) + 0.07, whoosh(0.35, 2500, 800, 0.25, rev=False), -24)
    fx.add(W(33.54) - 0.1, sub_swell(0.4, 0.4), -22)
    fx.add(W(33.54), blip(880, 0.22, 0.12, second=1320), -21)
    for k, s in enumerate((34.54, 35.24, 36.38, 37.58)):
        fx.add(W(s) - 0.13, blip(784 * 2 ** (k * 2 / 12), 0.22, 0.12), -20)
    for i in range(4):
        fx.add(W(38.42) + i * 0.3, tick(0.28, 2600 + 200 * i), -21)
    fx.add(W(38.42) + 0.9, ui_confirm(0.28), -21)


CFG = {
    # music endings land right after "…hacking systems."; m_off = where the music starts in the video,
    # m_skip = seconds skipped from the start of the track
    "lex": dict(dur=40.65, music="music-lex2", m_off=0.5, m_skip=0.0, out="lexx-mix", fx=lex_fx, ev=dict(outro=38.46)),
    "operator": dict(dur=41.07, music="music-operator", m_off=0.0, m_skip=4.7, out="opx-mix", fx=operator_fx, ev=dict(outro=36.28)),
    "lamb": dict(dur=47.6, music="music-lamb2", m_off=0.5, m_skip=0.0, out="lambx-mix", fx=lamb_fx, ev=dict(outro=45.4)),
}

name = sys.argv[1]
c = CFG[name]
DUR = c["dur"]
voice = load(f"public/audio/{name}-voice.wav")  # edited take, see scripts/edit_narration.py
_segs = json.load(open(f"src/social/edit-{name}.json"))["segments"]


def R(s):  # noqa: F811
    for a, b, n in _segs:
        if a <= s < b:
            return n + (s - a)
    raise ValueError(f"{s} s falls in a cut")

music = load(f"audio-src/{c['music']}.mp3")

vt = Track(DUR)
vt.add(NARR, lufs_norm(voice, -16.0))
v = vt.out()

# music bed: loudness-matched, gentle low cut so the voice owns phone speakers, ducked under the voice
mseg = music[int(c["m_skip"] * SR):]
mseg = lufs_norm(mseg, -16.0)
mseg = fade(mseg[: int((DUR - c["m_off"]) * SR)], fin=0.25, fout=2.5)
mt = Track(DUR)
mt.add(c["m_off"], mseg, gain_db=-5.0)
m = mt.out()
m = np.stack([_hp(m[:, i], 70) * 0.5 + m[:, i] * 0.5 for i in range(2)], 1).astype(np.float32)
m = m * sidechain_env(v, depth_db=6.5, attack=0.05, release=0.5)[:, None]

fx = Track(DUR)
c["fx"](fx)
common_end(fx, c["ev"], music[int(c["m_skip"] * SR):], c["m_off"])
f = fx.out()

for nm, stem in (("voice", v), ("music", m), ("fx", f)):
    print(nm, "LUFS", round(meter.integrated_loudness(stem.astype(np.float64)), 1))
mix = v + m + f * 10 ** (4 / 20)
mix = fade(mix, 0, 1.0)
info = master(mix, f"public/audio/{c['out']}.wav", lufs=-14.0, tp=-3.0)
print(name, json.dumps(info))
