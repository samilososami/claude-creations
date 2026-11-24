"""Assemble projects/lambdaos/ in claude-creations: page, videos, posters, downloads.

usage: python3 scripts/build_page.py "<time text>"
Run from video-source/lambdaos after the finals are rendered.
"""
import html
import pathlib
import re
import shutil
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parents[1]
REPO = HERE.parents[1]
DST = REPO / "projects" / "lambdaos"
FINAL = HERE / "final"

time_text = sys.argv[1] if len(sys.argv) > 1 else "No medido con precisión."

(DST / "videos").mkdir(parents=True, exist_ok=True)
(DST / "img").mkdir(exist_ok=True)
(DST / "downloads").mkdir(exist_ok=True)

NEW = {
    "lambdaos-explainer.mp4": ("poster-explainer.jpg", 30.9),
    "lambdaos-boot-animation.mp4": ("poster-boot.jpg", 2.25),
    "lambdaos-lex-mode.mp4": ("poster-lex.jpg", 22.5),
    "lambdaos-lamb.mp4": ("poster-lamb.jpg", 5.4),
    "lambdaos-operator.mp4": ("poster-operator.jpg", 12.6),
    "lambdaos-lamb-states.mp4": ("poster-lambstates.jpg", 5.2),
    "lambdaos-logo-sting.mp4": ("poster-sting.jpg", 3.6),
    "lambdaos-logo-sting-square.mp4": ("poster-stingsq.jpg", 3.6),
    "lambdaos-live-wallpaper.mp4": ("poster-wallpaper.jpg", 3.0),
}


def poster(video: pathlib.Path, out: pathlib.Path, t: float, width: int = 720):
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-ss", str(t), "-i", str(video), "-frames:v", "1",
                    "-vf", f"scale='min({width},iw)':-2", "-q:v", "3", str(out)], check=True)


for name, (pname, t) in NEW.items():
    src = FINAL / name
    if not src.exists():
        print("missing", name)
        continue
    shutil.copy2(src, DST / "videos" / name)
    poster(src, DST / "img" / pname, t)
    print("copied", name)

# og image (1200×630) from the 16:9 sting
sting = FINAL / "lambdaos-logo-sting.mp4"
if sting.exists():
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-ss", "3.6", "-i", str(sting), "-frames:v", "1",
                    "-vf", "scale=1200:-2,crop=1200:630", "-q:v", "3", str(DST / "img" / "og.jpg")], check=True)

lex = FINAL / "lambdaos-lex-mode.mp4"
if lex.exists():  # hub card (16:10)
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-ss", "22.5", "-i", str(lex), "-frames:v", "1",
                    "-vf", "crop=1728:1080,scale=1600:1000", "-q:v", "3", str(DST / "img" / "card.jpg")], check=True)

if (FINAL / "bootanimation.zip").exists():
    shutil.copy2(FINAL / "bootanimation.zip", DST / "downloads" / "bootanimation.zip")

# the two earlier videos, moved in from their old folders (git mv keeps history)
OLD = [
    (REPO / "projects" / "lambdaos-trailer", "trailer.mp4", "lambdaos-trailer.mp4", "poster-trailer.jpg"),
    (REPO / "projects" / "lambdaospromo", "lambdaos-promo.mp4", "lambdaos-promo.mp4", "poster-promo.jpg"),
]
prompts = {}
for folder, vid, newname, pname in OLD:
    if (folder / "index.html").exists():
        page = (folder / "index.html").read_text()
        prompts[newname] = re.search(r'<p class="prompt">(.*?)</p>', page, re.S).group(1)
        (DST / "prompts").mkdir(exist_ok=True)
        (DST / "prompts" / (newname.replace(".mp4", ".txt"))).write_text(html.unescape(prompts[newname]) + "\n")
        subprocess.run(["git", "-C", str(REPO), "mv", "-f", str(folder / vid), str(DST / "videos" / newname)], check=True)
        subprocess.run(["git", "-C", str(REPO), "mv", "-f", str(folder / "img" / "poster.jpg"), str(DST / "img" / pname)], check=True)
    else:
        txt = (DST / "prompts" / newname.replace(".mp4", ".txt")).read_text().strip()
        prompts[newname] = html.escape(txt, quote=False)

new_prompt = (HERE / "PROMPT.txt").read_text().strip()
import json

wm = json.loads((HERE / "src" / "brand" / "wordmark.json").read_text())
paths = "".join(f'<path d="{l["d"]}"/>' for l in wm["letters"])
wordmark_svg = (f'<svg class="wm" viewBox="850 330 2155 345" role="img" aria-label="LambdaOS">'
                f'<g transform="{wm["transform"]}" fill="currentColor">{paths}</g></svg>')
tpl = (HERE / "web" / "index.template.html").read_text().replace("{{WORDMARK_SVG}}", wordmark_svg)
out = (tpl.replace("{{COUNT}}", "11")
          .replace("{{MODEL}}", "Claude Opus 5.5 (modelo de la sesión)")
          .replace("{{TIME}}", html.escape(time_text, quote=False))
          .replace("{{PROMPT_NEW}}", html.escape(new_prompt, quote=False))
          .replace("{{PROMPT_PROMO}}", prompts["lambdaos-promo.mp4"])
          .replace("{{PROMPT_TRAILER}}", prompts["lambdaos-trailer.mp4"]))
(DST / "index.html").write_text(out)
print("wrote", DST / "index.html")
