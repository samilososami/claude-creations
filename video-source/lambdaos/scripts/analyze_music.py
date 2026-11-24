"""Print tempo, beat phase and a 0.5 s loudness envelope for a music file."""
import subprocess, sys
import numpy as np
path = sys.argv[1]
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "22050", "-f", "f32le", "-"], capture_output=True).stdout
a = np.frombuffer(pcm, dtype=np.float32); sr = 22050; hop = 256
fr = np.lib.stride_tricks.sliding_window_view(a, 1024)[::hop]
sp = np.abs(np.fft.rfft(fr * np.hanning(1024), axis=1))
flux = np.maximum(0, np.diff(np.log1p(sp), axis=0)).sum(1)
flux = (flux - flux.mean()) / flux.std()
seg = flux[int(2 * sr / hop):]
ac = np.correlate(seg, seg, "full")[len(seg) - 1:]
lags = np.arange(len(ac)) * hop / sr
m = (lags > 0.35) & (lags < 1.2)
per = lags[m][np.argmax(ac[m])]
offs = np.linspace(0, per, 100, endpoint=False)
sc = [sum(flux[min(len(flux) - 1, int((o + k * per) * sr / hop))] for k in range(2, int(len(a) / sr / per) - 1)) for o in offs]
print(f"beat {per:.4f}s  bpm {60/per:.1f}  phase {offs[int(np.argmax(sc))]:.3f}s  dur {len(a)/sr:.2f}s")
step = 0.5
for t in np.arange(0, len(a) / sr, step):
    s = a[int(t * sr):int((t + step) * sr)]
    r = 20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9)
    print(f"{t:5.1f} {r:6.1f} " + "#" * int(max(0, r + 50)))
