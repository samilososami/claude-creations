"""Per-band energy (dB, relative to total) of a media file's audio."""
import subprocess, sys
import numpy as np
for path in sys.argv[1:]:
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "48000", "-f", "f32le", "-"], capture_output=True).stdout
    a = np.frombuffer(pcm, dtype=np.float32)
    sp = np.abs(np.fft.rfft(a)) ** 2
    fr = np.fft.rfftfreq(len(a), 1 / 48000)
    tot = sp.sum()
    bands = [(0, 30), (30, 80), (80, 250), (250, 2000), (2000, 8000), (8000, 24000)]
    out = " ".join(f"{lo}-{hi}:{10*np.log10(sp[(fr>=lo)&(fr<hi)].sum()/tot):6.1f}" for lo, hi in bands)
    print(f"{path.split('/')[-1]:34s} {out}")
