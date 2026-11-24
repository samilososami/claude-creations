"""Masks for the live wallpaper, derived from the LambdaOS dark wallpaper.

wp-sheen-mask.png : alpha follows the lit paper (brighter fold edges → stronger)
wp-lambda-mask.png: alpha covers only the grey λ behind the fold
"""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

src = Image.open("public/img/lambda-dark-s10.png").convert("L")
a = np.asarray(src).astype(np.float32)
h, w = a.shape
sheen = np.clip((a - 38) / 150, 0, 1) ** 1.6
Image.fromarray(np.zeros((h, w), np.uint8)).save("/dev/null", "PNG") if False else None
rgba = np.zeros((h, w, 4), np.uint8)
rgba[..., :3] = 255
rgba[..., 3] = (sheen * 255).astype(np.uint8)
Image.fromarray(rgba, "RGBA").save("public/img/wp-sheen-mask.png")

# λ: flat grey shape in the upper half (lum ~ 28-48), largest component above the fold crest
band = (a > 24) & (a < 52)
band[int(h * 0.52):, :] = False
band = ndimage.binary_opening(band, iterations=2)
lab, n = ndimage.label(band)
sizes = ndimage.sum(band, lab, range(1, n + 1))
lam = lab == (np.argmax(sizes) + 1)
lam = ndimage.binary_closing(lam, iterations=3)
lam = ndimage.binary_erosion(lam, iterations=1)
lam[840:, :] = False  # drop speckle where the λ meets the fold crest
ys, xs = np.nonzero(lam)
print("lambda bbox", xs.min(), ys.min(), xs.max(), ys.max(), "area", lam.sum(), "img", w, h)
m = Image.fromarray((lam * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
rgba2 = np.zeros((h, w, 4), np.uint8)
rgba2[..., :3] = 255
rgba2[..., 3] = np.asarray(m)
Image.fromarray(rgba2, "RGBA").save("public/img/wp-lambda-mask.png")
