"""Vectorise the LambdaOS wordmark letter by letter.

Source: assets/brand/lambdaos-banner.png from the LambdaOS repo (white
wordmark on black). Each connected white shape (L, λ, m, b, d, a, O, S) is
traced with potrace into its own path so the video can animate the letters
independently.

Output: src/brand/wordmark.json  {w, h, transform, letters: [{d, bbox}]}
"""
import json
import pathlib
import re
import subprocess
import tempfile

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "img" / "lambdaos-banner.png"
OUT = ROOT / "src" / "brand" / "wordmark.json"


def trace(mask):
    with tempfile.TemporaryDirectory() as tmp:
        pbm = pathlib.Path(tmp) / "m.pbm"
        svg = pathlib.Path(tmp) / "m.svg"
        Image.fromarray((~mask).astype(np.uint8) * 255).convert("1").save(pbm)
        subprocess.run(["potrace", str(pbm), "-s", "--flat", "-a", "0.9", "-O", "0.3",
                        "-t", "4", "-o", str(svg)], check=True)
        text = svg.read_text()
    tr = re.search(r'<g transform="([^"]+)"', text).group(1)
    d = " ".join(x.replace("\n", " ") for x in re.findall(r' d="([^"]+)"', text))
    return tr, d


def main():
    a = np.asarray(Image.open(SRC).convert("L"))
    # upsample 3x for smoother curves before tracing
    big = np.asarray(Image.fromarray(a).resize((a.shape[1] * 3, a.shape[0] * 3), Image.LANCZOS))
    white = big > 120
    lab, n = ndimage.label(white)
    letters = []
    transform = ""
    for cid in range(1, n + 1):
        comp = lab == cid
        if comp.sum() < 400:
            continue
        ys, xs = np.nonzero(comp)
        transform, d = trace(comp)
        letters.append({"d": d, "bbox": [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]})
    letters.sort(key=lambda l: l["bbox"][0])
    out = {"w": big.shape[1], "h": big.shape[0], "transform": transform, "letters": letters}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out))
    print(len(letters), "letters", [l["bbox"] for l in letters])


if __name__ == "__main__":
    main()
