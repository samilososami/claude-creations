"""Sound design toolkit for the LambdaOS videos.

Every effect is synthesised from scratch with numpy (no samples), so the
sound is original and every hit can be placed on an exact frame.
All functions return float32 stereo arrays (n, 2) at SR.
"""
from __future__ import annotations

import subprocess

import numpy as np

SR = 48000
rng = np.random.default_rng(1234)


# ───────────── helpers ─────────────
def t_(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def st(x: np.ndarray, width: float = 0.0, seed: int = 0) -> np.ndarray:
    """Mono → stereo, optional decorrelated width."""
    if width <= 0:
        return np.stack([x, x], 1).astype(np.float32)
    d = int(SR * 0.011 * width) + 1
    r = np.concatenate([np.zeros(d), x[:-d]])
    return np.stack([x * (1 - width * 0.2) + r * width * 0.2, r * (1 - width * 0.2) + x * width * 0.2], 1).astype(np.float32)


def env_ad(n: int, a: float, d: float, curve: float = 4.0) -> np.ndarray:
    """Attack (s) then exponential decay (s) envelope of length n."""
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-4), 0, 1)
    dec = np.exp(-np.maximum(t - a, 0) * curve / max(d, 1e-4))
    return att * dec


def onepole_lp(x: np.ndarray, fc) -> np.ndarray:
    """One-pole low-pass; fc may be scalar or per-sample array."""
    fc = np.broadcast_to(np.asarray(fc, dtype=np.float64), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x, dtype=np.float64)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def svf(x: np.ndarray, fc, q: float = 0.7, mode: str = "bp") -> np.ndarray:
    """Chamberlin state-variable filter with per-sample cutoff."""
    fc = np.broadcast_to(np.asarray(fc, dtype=np.float64), x.shape)
    f = 2 * np.sin(np.pi * np.clip(fc, 10, SR / 6) / SR)
    damp = 1.0 / q
    lp = bp = 0.0
    out = np.empty(len(x))
    for i in range(len(x)):
        hp = x[i] - lp - damp * bp
        bp += f[i] * hp
        lp += f[i] * bp
        out[i] = bp if mode == "bp" else lp if mode == "lp" else hp
    return out


def noise(n: int) -> np.ndarray:
    return rng.standard_normal(n)


def norm(x: np.ndarray, peak: float = 0.9) -> np.ndarray:
    m = np.max(np.abs(x)) + 1e-9
    return x * (peak / m)


def reverb(x: np.ndarray, size: float = 1.6, mix: float = 0.25, damp: float = 6000, seed: int = 3) -> np.ndarray:
    """Convolution reverb with a synthetic decaying-noise IR (stereo)."""
    r = np.random.default_rng(seed)
    n = int(size * SR)
    tt = np.arange(n) / SR
    out = np.zeros((len(x) + n, 2))
    for ch in range(2):
        ir = r.standard_normal(n) * np.exp(-tt * 6.9 / size)
        ir = onepole_lp_fast(ir, damp)
        ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        ir /= np.sqrt((ir ** 2).sum())
        src = x[:, ch] if x.ndim == 2 else x
        conv = fftconv(src, ir)
        out[: len(conv), ch] = conv[: len(out)]
    dry = np.zeros_like(out)
    dry[: len(x)] = x if x.ndim == 2 else np.stack([x, x], 1)
    return (dry * (1 - mix) + out * mix * 1.6).astype(np.float32)


def fftconv(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    n = len(a) + len(b) - 1
    N = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(a, N) * np.fft.rfft(b, N), N)[:n]


def onepole_lp_fast(x: np.ndarray, fc: float) -> np.ndarray:
    """Scalar-cutoff one-pole LP via lfilter-like recursion in numpy (FFT free)."""
    a = np.exp(-2 * np.pi * fc / SR)
    # use scipy if available for speed
    try:
        from scipy.signal import lfilter

        return lfilter([1 - a], [1, -a], x)
    except Exception:  # pragma: no cover
        return onepole_lp(x, fc)


def lfilt_lp(x, fc):
    return onepole_lp_fast(x, fc)


def hp(x, fc):
    return x - onepole_lp_fast(x, fc)


def bp_sweep(x, f0, f1, q=2.0):
    fc = np.geomspace(f0, f1, len(x))
    return svf(x, fc, q, "bp")


# ───────────── effects ─────────────
def whoosh(dur=0.7, f0=300, f1=5000, peak=0.6, rev=True, width=1.0):
    n = int(dur * SR)
    x = bp_sweep(noise(n), f0, f1, q=1.4)
    e = np.sin(np.linspace(0, np.pi, n)) ** 1.6
    x = norm(x * e, peak)
    s = st(x, width)
    return reverb(s, 1.2, 0.25) if rev else s


def whoosh_down(dur=0.8, peak=0.6):
    return whoosh(dur, 4500, 180, peak)


def riser(dur=1.5, f0=200, f1=2400, peak=0.5):
    n = int(dur * SR)
    tt = t_(dur)
    ph = 2 * np.pi * np.cumsum(np.geomspace(f0 / 4, f1 / 4, n)) / SR
    saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
    nz = bp_sweep(noise(n), f0, f1 * 2, q=1.0)
    x = saw * 0.35 + nz * 0.8
    x = lfilt_lp(x, 9000)
    e = (tt / dur) ** 2.2
    x = norm(x * e, peak)
    return reverb(st(x, 1.0), 1.4, 0.3)


def reverse_swell(dur=1.2, peak=0.5, tone=110.0):
    """Reverse-cymbal style swell that sucks into the next hit."""
    n = int(dur * SR)
    nz = hp(noise(n), 2500) * 0.6
    tt = t_(dur)
    pad = sum(np.sin(2 * np.pi * tone * k * tt + k) / k for k in (1, 2, 3, 5)) * 0.25
    x = (nz + pad) * (tt / dur) ** 3
    return reverb(st(norm(x, peak), 1.0), 1.0, 0.2)


def impact(peak=0.95, depth=1.0, tail=1.8, bright=1.0):
    """Cinematic hit: sub drop + body + noise transient + reverb tail."""
    dur = tail + 0.4
    tt = t_(dur)
    n = len(tt)
    f = 38 + 70 * np.exp(-tt * 9)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.6 / depth)
    body = np.sin(2 * np.pi * np.cumsum(90 + 140 * np.exp(-tt * 30)) / SR) * np.exp(-tt * 11)
    crack = hp(noise(n), 1800) * np.exp(-tt * 38) * 0.55 * bright
    x = sub * 1.0 + body * 0.5 + crack
    x = np.tanh(x * 1.6) / np.tanh(1.6)
    s = reverb(st(norm(x, peak), 0.6), tail, 0.28, damp=4000)
    return s


def thud(peak=0.9):
    """Heavy stamp: short, dry, punchy."""
    tt = t_(0.6)
    x = np.sin(2 * np.pi * np.cumsum(55 + 160 * np.exp(-tt * 40)) / SR) * np.exp(-tt * 9)
    x += hp(noise(len(tt)), 900) * np.exp(-tt * 60) * 0.7
    x = np.tanh(x * 2.2)
    return reverb(st(norm(x, peak)), 0.6, 0.15)


def tick(peak=0.35, freq=3200, decay=0.03):
    tt = t_(0.09)
    x = np.sin(2 * np.pi * freq * tt) * np.exp(-tt / decay * 4) + hp(noise(len(tt)), 4000) * np.exp(-tt * 260) * 0.6
    return st(norm(x, peak))


def blip(freq=1320, peak=0.3, dur=0.14, second=None):
    tt = t_(dur)
    x = np.sin(2 * np.pi * freq * tt + 0.3 * np.sin(2 * np.pi * 7 * tt)) * env_ad(len(tt), 0.004, dur, 5)
    if second:
        x2 = np.zeros_like(x)
        d = int(0.06 * SR)
        x2[d:] = np.sin(2 * np.pi * second * tt[: len(tt) - d]) * env_ad(len(tt) - d, 0.004, dur, 5)
        x = x + x2
    return reverb(st(norm(x, peak), 0.4), 0.5, 0.18)


def ui_confirm(peak=0.32):
    return blip(988, peak, 0.2, second=1480)


def click(peak=0.4):
    tt = t_(0.05)
    x = hp(noise(len(tt)), 2500) * np.exp(-tt * 300) + np.sin(2 * np.pi * 1700 * tt) * np.exp(-tt * 140) * 0.6
    return st(norm(x, peak))


def typing(dur=1.0, rate=16, peak=0.22, seed=5):
    r = np.random.default_rng(seed)
    out = np.zeros((int(dur * SR) + SR // 10, 2), np.float32)
    tpos = 0.0
    while tpos < dur:
        c = click(peak * (0.6 + 0.4 * r.random()))
        i = int(tpos * SR)
        out[i : i + len(c)] += c
        tpos += 1.0 / rate * (0.6 + 0.8 * r.random())
    return out


def glitch(dur=0.35, peak=0.45, seed=9):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    x = np.zeros(n)
    pos = 0
    while pos < n:
        ln = int(SR * (0.008 + 0.03 * r.random()))
        kind = r.integers(0, 3)
        tt = np.arange(min(ln, n - pos)) / SR
        if kind == 0:
            seg = np.sign(np.sin(2 * np.pi * r.uniform(200, 2000) * tt))
        elif kind == 1:
            seg = np.round(noise(len(tt)) * 3) / 3
        else:
            seg = np.zeros(len(tt))
        x[pos : pos + len(tt)] = seg * r.uniform(0.3, 1)
        pos += ln
    x = lfilt_lp(x, 7000)
    return st(norm(x * np.linspace(1, 0.3, n), peak), 0.8)


def shimmer(dur=1.6, peak=0.25, base=1760):
    tt = t_(dur)
    x = np.zeros_like(tt)
    for k, m in enumerate((1, 1.5, 2, 2.5, 3, 4)):
        x += np.sin(2 * np.pi * base * m * tt + k) * np.exp(-tt * (2 + k * 0.7)) / (1 + k * 0.4)
    x *= np.clip(tt / 0.01, 0, 1)
    return reverb(st(norm(x, peak), 1.0), 2.0, 0.4)


def power_on(peak=0.5):
    """Screen wake: soft low bloom + airy top."""
    tt = t_(1.4)
    x = sum(np.sin(2 * np.pi * f * tt) for f in (110, 165, 220, 330)) / 4
    x *= env_ad(len(tt), 0.25, 1.1, 3)
    x += hp(noise(len(tt)), 6000) * env_ad(len(tt), 0.2, 0.6, 5) * 0.15
    return reverb(st(norm(x, peak), 1.0), 1.6, 0.35)


def drone(dur=3.0, peak=0.3, f0=55.0):
    tt = t_(dur)
    x = sum(np.sin(2 * np.pi * f0 * m * tt + 0.2 * np.sin(2 * np.pi * 0.3 * tt * m)) / m for m in (1, 2, 3, 4.01))
    x = lfilt_lp(x, 900)
    e = np.minimum(1, tt / (dur * 0.6)) * np.minimum(1, (dur - tt) / 0.3)
    return st(norm(x * e, peak), 0.6)


def crt_zip(peak=0.35):
    tt = t_(0.25)
    x = np.sin(2 * np.pi * np.cumsum(np.geomspace(400, 6000, len(tt))) / SR) * env_ad(len(tt), 0.01, 0.22, 3)
    x += hp(noise(len(tt)), 3000) * env_ad(len(tt), 0.005, 0.1, 6) * 0.5
    return reverb(st(norm(x, peak)), 0.6, 0.2)


def hum(dur=2.0, peak=0.2, f=50.0):
    tt = t_(dur)
    x = sum(np.sin(2 * np.pi * f * k * tt) / k ** 1.2 for k in range(1, 9))
    x += 0.15 * np.sign(np.sin(2 * np.pi * f * tt))
    e = np.minimum(1, tt / 0.05) * np.minimum(1, (dur - tt) / 0.2)
    return st(norm(lfilt_lp(x, 2000) * e, peak))


def degauss(peak=0.6):
    """CRT/TV power on: thump + buzz decaying."""
    tt = t_(1.2)
    buzz = np.sin(2 * np.pi * 60 * tt) * np.sin(2 * np.pi * 15.5 * tt) * np.exp(-tt * 3.5)
    th = np.sin(2 * np.pi * np.cumsum(45 + 80 * np.exp(-tt * 25)) / SR) * np.exp(-tt * 7)
    x = th + buzz * 0.6 + hp(noise(len(tt)), 2000) * np.exp(-tt * 40) * 0.3
    return reverb(st(norm(x, peak), 0.5), 0.8, 0.2)


def plug(peak=0.6):
    """USB-C plug-in: two mechanical clicks."""
    a = click(peak)
    b = click(peak * 0.8)
    out = np.zeros((int(0.2 * SR), 2), np.float32)
    out[: len(a)] += a
    d = int(0.055 * SR)
    out[d : d + len(b)] += b
    tt = t_(0.2)
    body = np.sin(2 * np.pi * 180 * tt) * np.exp(-tt * 60) * 0.4
    out += st(body.astype(np.float32))
    return reverb(out, 0.4, 0.15)


def sparkle(peak=0.25, n=9, dur=1.2, seed=4):
    r = np.random.default_rng(seed)
    out = np.zeros((int(dur * SR) + SR, 2), np.float32)
    for k in range(n):
        b = blip(r.uniform(2400, 5200), peak * r.uniform(0.4, 1), 0.12)
        i = int(r.uniform(0, dur * 0.8) * SR)
        pan = r.uniform(-0.7, 0.7)
        b = b * np.array([1 - max(pan, 0), 1 + min(pan, 0)], np.float32)
        out[i : i + len(b)] += b
    return out


def bass_pulse(peak=0.6, f=48.0, dur=0.6):
    tt = t_(dur)
    x = np.sin(2 * np.pi * f * tt) * env_ad(len(tt), 0.01, dur, 4)
    x = np.tanh(x * 1.8)
    return st(norm(x, peak))


def heartbeat_tone(freq=220.0, dur=0.35, peak=0.3):
    tt = t_(dur)
    x = (np.sin(2 * np.pi * freq * tt) + 0.4 * np.sin(4 * np.pi * freq * tt)) * env_ad(len(tt), 0.006, dur, 5)
    return reverb(st(norm(x, peak), 0.6), 1.0, 0.3)


# ───────────── IO / mixing ─────────────
def load(path: str, sr: int = SR) -> np.ndarray:
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(sr), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).reshape(-1, 2).copy()


class Track:
    def __init__(self, dur: float):
        self.buf = np.zeros((int(dur * SR) + SR * 4, 2), np.float32)
        self.dur = dur

    def add(self, at: float, x: np.ndarray, gain_db: float = 0.0, pan: float = 0.0):
        i = int(round(at * SR))
        if i < 0:
            x = x[-i:]
            i = 0
        g = 10 ** (gain_db / 20)
        if pan:
            x = x * np.array([min(1, 1 - pan), min(1, 1 + pan)], np.float32)
        end = min(len(self.buf), i + len(x))
        self.buf[i:end] += x[: end - i] * g
        return self

    def out(self) -> np.ndarray:
        return self.buf[: int(self.dur * SR)]


def sidechain_env(voice: np.ndarray, depth_db: float = 8.0, attack: float = 0.04, release: float = 0.35,
                  thresh_db: float = -38) -> np.ndarray:
    """Gain curve (linear) that ducks by depth_db wherever the voice is active."""
    mono = np.abs(voice).mean(1)
    win = int(0.02 * SR)
    rms = np.sqrt(np.convolve(mono ** 2, np.ones(win) / win, "same"))
    active = (20 * np.log10(rms + 1e-9) > thresh_db).astype(np.float64)
    # smooth with attack/release
    a_up = np.exp(-1 / (attack * SR))
    a_dn = np.exp(-1 / (release * SR))
    try:
        from scipy.signal import lfilter

        # asymmetric smoothing approximated by two passes
        up = lfilter([1 - a_up], [1, -a_up], active)
        g = np.maximum(up, lfilter([1 - a_dn], [1, -a_dn], active))
    except Exception:  # pragma: no cover
        g = active
    g = np.clip(g, 0, 1)
    return (10 ** (-depth_db * g / 20)).astype(np.float32)


def fade(x: np.ndarray, fin: float = 0.0, fout: float = 0.0) -> np.ndarray:
    x = x.copy()
    if fin > 0:
        n = int(fin * SR)
        x[:n] *= np.linspace(0, 1, n)[:, None] ** 2
    if fout > 0:
        n = int(fout * SR)
        x[-n:] *= np.linspace(1, 0, n)[:, None] ** 2
    return x


def master(x: np.ndarray, path: str, lufs: float = -14.0, tp: float = -2.0) -> dict:
    """Two-pass EBU R128 loudness normalisation with a true-peak limiter (ffmpeg loudnorm).

    Writes a 48 kHz 16-bit WAV and returns the measured result.
    """
    import json as _json
    import os
    import tempfile
    import wave

    # pre-gain to target loudness, then a 4x-oversampled look-ahead peak limiter so the
    # final loudnorm pass can stay linear (no pumping) and still meet the true-peak ceiling
    import pyloudnorm as pyln
    from scipy.ndimage import maximum_filter1d
    from scipy.signal import lfilter, resample_poly

    from scipy.signal import butter, sosfiltfilt

    # remove sub-sonic rumble (< 28 Hz): inaudible on phones, but it eats limiter headroom
    y = sosfiltfilt(butter(2, 28, "highpass", fs=SR, output="sos"), x.astype(np.float64), axis=0)
    for _ in range(3):  # gain → limit, repeated so limiting losses are made up
        L = pyln.Meter(SR).integrated_loudness(y)
        y = _limit(y * 10 ** ((lufs - L) / 20), 10 ** ((tp - 0.8) / 20))
    x = y.astype(np.float32)
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
    return _loudnorm(x, tmp, path, lufs, tp)


def _limit(y, ceil):
    from scipy.ndimage import maximum_filter1d
    from scipy.signal import resample_poly

    os_abs = np.abs(resample_poly(y, 4, 1, axis=0)).max(1)
    env = os_abs[: (len(os_abs) // 4) * 4].reshape(-1, 4).max(1)
    env = np.concatenate([env, np.abs(y[len(env):]).max(1) if len(env) < len(y) else []])[: len(y)]
    look = int(0.0015 * SR)
    env = maximum_filter1d(env, size=2 * look + 1)
    g = np.minimum(1.0, ceil / np.maximum(env, 1e-9))
    rel = np.exp(-1 / (0.08 * SR))
    gmin = -maximum_filter1d(-g, size=look * 2 + 1)
    gs = np.empty_like(gmin)
    acc = 1.0
    for i in range(len(gmin)):
        acc = gmin[i] if gmin[i] < acc else rel * acc + (1 - rel) * gmin[i]
        gs[i] = acc
    return y * gs[:, None]


def _loudnorm(x, tmp, path, lufs, tp):
    import json as _json
    import os
    import wave

    _unused = None
    pcm = (np.clip(x, -4, 4) / 4 * 32767).astype("<i2")  # headroom: 12 dB, restored by loudnorm
    with wave.open(tmp, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    target = f"I={lufs}:TP={tp}:LRA=11"
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", tmp, "-af", f"loudnorm={target}:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    js = r.stderr[r.stderr.rindex("{"): r.stderr.rindex("}") + 1]
    m = _json.loads(js)
    af = (f"loudnorm={target}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json")
    r2 = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", tmp, "-af", af, "-ar", str(SR), "-c:a", "pcm_s16le", path],
                        capture_output=True, text=True)
    js2 = r2.stderr[r2.stderr.rindex("{"): r2.stderr.rindex("}") + 1]
    m2 = _json.loads(js2)
    os.unlink(tmp)
    return {"in_I": m["input_i"], "out_I": m2["output_i"], "out_TP": m2["output_tp"], "mode": m2["normalization_type"]}


# ───────────── signature sounds ─────────────
def pad(freqs, dur=3.0, peak=0.4, attack=0.6, release=1.5, bright=2200.0, detune=0.004, seed=1):
    """Warm detuned-saw pad, low-passed."""
    tt = t_(dur)
    x = np.zeros_like(tt)
    r = np.random.default_rng(seed)
    for f in freqs:
        for d in (-detune, 0, detune):
            ph = r.random() * 2 * np.pi
            x += 2 * (((f * (1 + d) * tt) + ph / (2 * np.pi)) % 1) - 1
    x = lfilt_lp(lfilt_lp(x, bright), bright * 1.4)
    e = np.minimum(1, tt / attack) * np.minimum(1, np.maximum(0, (dur - tt)) / release)
    return reverb(st(norm(x * e, peak), 1.0), 2.4, 0.35)


def bell(freq=659.25, dur=2.6, peak=0.35):
    """FM bell."""
    tt = t_(dur)
    mod = np.sin(2 * np.pi * freq * 3.5 * tt) * 2.2 * np.exp(-tt * 3)
    x = np.sin(2 * np.pi * freq * tt + mod) * np.exp(-tt * 2.2)
    x += 0.35 * np.sin(2 * np.pi * freq * 2.01 * tt) * np.exp(-tt * 4)
    x *= np.clip(tt / 0.003, 0, 1)
    return reverb(st(norm(x, peak), 0.8), 2.8, 0.38)


def sub_swell(dur=1.2, peak=0.5, f=36.7):
    tt = t_(dur)
    x = np.sin(2 * np.pi * f * tt) * (tt / dur) ** 2 * np.minimum(1, (dur - tt) / 0.08)
    return st(norm(x, peak))


def lambda_logo(peak=0.8):
    """The LambdaOS sound logo: sub swell into an open D chord bloom with a bell on top."""
    out = Track(4.5)
    out.add(0.0, sub_swell(0.7, 0.5), -6)
    out.add(0.55, pad([73.42, 110.0, 164.81, 220.0], 3.6, 0.6, attack=0.04, release=2.6, bright=1800), -2)
    out.add(0.55, impact(0.6, 1.4, 2.0, 0.2), -10)
    out.add(0.62, bell(659.25, 3.2, 0.35), -9)
    out.add(0.70, bell(987.77, 2.6, 0.22), -15)
    return out.out() * peak


def low_shelf(x: np.ndarray, fc: float = 90.0, gain_db: float = -3.0) -> np.ndarray:
    """Simple low shelf: blend in a low-passed copy with negative gain."""
    from scipy.signal import butter, sosfiltfilt

    lo = sosfiltfilt(butter(2, fc, "lowpass", fs=SR, output="sos"), x.astype(np.float64), axis=0)
    return (x + lo * (10 ** (gain_db / 20) - 1)).astype(np.float32)


def high_shelf(x: np.ndarray, fc: float = 3000.0, gain_db: float = 2.0) -> np.ndarray:
    from scipy.signal import butter, sosfiltfilt

    hi = sosfiltfilt(butter(2, fc, "highpass", fs=SR, output="sos"), x.astype(np.float64), axis=0)
    return (x + hi * (10 ** (gain_db / 20) - 1)).astype(np.float32)


def hpf(x: np.ndarray, fc: float = 32.0, order: int = 4) -> np.ndarray:
    from scipy.signal import butter, sosfiltfilt

    return sosfiltfilt(butter(order, fc, "highpass", fs=SR, output="sos"), x.astype(np.float64), axis=0).astype(np.float32)
