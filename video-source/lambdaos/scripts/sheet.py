"""Contact sheet from a folder of rendered frames: python3 scripts/sheet.py dir out.jpg cols width"""
import sys, glob, os, re
from PIL import Image, ImageDraw, ImageFont
d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 300
fs = sorted(glob.glob(os.path.join(d, "*.jpeg")) + glob.glob(os.path.join(d, "*.png")) + glob.glob(os.path.join(d, "*.jpg")),
            key=lambda p: int(re.findall(r"(\d+)", os.path.basename(p))[-1]))
ims = [Image.open(f).convert("RGB") for f in fs]
w, h = ims[0].size
th = int(h * tw / w)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * (th + 22)), (40, 40, 40))
dr = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, fs)):
    x, y = (i % cols) * tw, (i // cols) * (th + 22)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + 22))
    n = int(re.findall(r"(\d+)", os.path.basename(f))[-1])
    dr.text((x + 6, y + 4), f"f{n}  {n/30:.2f}s", fill=(255, 255, 0))
sheet.save(out, quality=88)
print(out, sheet.size)
