"""Vectorise the Lamb mascot PNGs into separable SVG parts.

For every image the white shapes are split into connected components:
the largest one is the wool (head outline + ears + tuft) and the rest are
facial features (eyes, nose, mouth, teeth...). Each component is traced
separately with potrace so the video can animate them independently
(blinks, glances, expression swaps).

Output: src/lamb/lambShapes.json
usage: python3 scripts/trace_lamb.py /path/to/lambdaos-repo
"""
import json
import pathlib
import re
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "lamb" / "lambShapes.json"
# Source PNGs live in the LambdaOS repo: pass its path as the first argument.
LAMBDAOS = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parents[2] / "samilososami" / "lambdaos"
SOURCES = {
    "lamb-main": "assets/design/round-06/lamb/13-selected-no-mark.png",
    **{f"face-{k}-v2": f"assets/design/round-07-setup/assets/face-{k}-v2.png"
       for k in ("curious", "focused", "reassuring", "success", "waiting")},
    **{f"frame-{i:02d}": f"assets/design/lamb/evil-laugh-v1/frames/frame-{i:02d}.png" for i in range(1, 11)},
}

NAMES = [
    "lamb-main", "face-curious-v2", "face-focused-v2", "face-reassuring-v2",
    "face-success-v2", "face-waiting-v2",
] + [f"frame-{i:02d}" for i in range(1, 11)]


def trace(mask: np.ndarray) -> tuple[str, str]:
    """Trace a boolean mask (True = shape) and return (transform, d)."""
    h, w = mask.shape
    with tempfile.TemporaryDirectory() as tmp:
        pbm = pathlib.Path(tmp) / "m.pbm"
        svg = pathlib.Path(tmp) / "m.svg"
        Image.fromarray((~mask).astype(np.uint8) * 255).convert("1").save(pbm)
        subprocess.run(
            ["potrace", str(pbm), "-s", "--flat", "-a", "1.1", "-O", "0.4",
             "-t", "6", "-o", str(svg)],
            check=True,
        )
        text = svg.read_text()
    tr = re.search(r'<g transform="([^"]+)"', text)
    ds = re.findall(r' d="([^"]+)"', text)
    return (tr.group(1) if tr else ""), " ".join(d.replace("\n", " ") for d in ds)


def process(name: str) -> dict:
    im = Image.open(LAMBDAOS / SOURCES[name]).convert("L")
    a = np.asarray(im)
    white = a > 128
    lab, n = ndimage.label(white)
    sizes = ndimage.sum(white, lab, range(1, n + 1))
    order = np.argsort(sizes)[::-1]
    wool_id = order[0] + 1
    parts = []
    transform = ""
    for rank, idx in enumerate(order):
        cid = idx + 1
        size = int(sizes[idx])
        if size < 60:  # speckles
            continue
        comp = lab == cid
        # fill holes so pupils etc. become part of the traced shape's holes
        ys, xs = np.nonzero(comp)
        bbox = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
        transform, d = trace(comp)
        holes = []
        filled_d = d
        if cid != wool_id:
            filled = ndimage.binary_fill_holes(comp)
            hole_mask = filled & ~comp
            hlab, hn = ndimage.label(hole_mask)
            for h in range(1, hn + 1):
                hm = hlab == h
                if hm.sum() < 25:
                    continue
                hy, hx = np.nonzero(hm)
                _, hd = trace(hm)
                holes.append({"d": hd, "cx": float(hx.mean()), "cy": float(hy.mean()),
                              "area": int(hm.sum())})
            if holes:
                _, filled_d = trace(filled)
        parts.append({
            "filled": filled_d,
            "holes": holes,
            "kind": "wool" if cid == wool_id else "feature",
            "area": size,
            "bbox": bbox,
            "cx": float(xs.mean()),
            "cy": float(ys.mean()),
            "d": d,
        })
    sil = ndimage.binary_fill_holes(lab == wool_id)
    _, sil_d = trace(sil)
    return {"w": a.shape[1], "h": a.shape[0], "transform": transform,
            "silhouette": sil_d, "parts": parts}


def main() -> None:
    out = {}
    for name in NAMES:
        out[name] = process(name)
        feats = [p for p in out[name]["parts"] if p["kind"] == "feature"]
        print(name, "features:", len(feats), [p["bbox"] for p in feats][:6], file=sys.stderr)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out))
    print("wrote", OUT, OUT.stat().st_size, "bytes", file=sys.stderr)


if __name__ == "__main__":
    main()
