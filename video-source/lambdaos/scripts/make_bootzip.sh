#!/usr/bin/env bash
# Build an Android bootanimation.zip (1440x3040, 30 fps) from the BootZip composition.
#   part0  intro   played once, completes
#   part1  loop    repeats until Android finishes booting (seamless 2 s loop)
#   part2  outro   played once after boot completes
set -euo pipefail
cd "$(dirname "$0")/.."
W=out/bootzip
mkdir -p "$W"
find "$W" -mindepth 1 -delete
render_part() { # name from to
  local name=$1 a=$2 b=$3
  mkdir -p "$W/$name"
  npx remotion render BootZip "$W/$name" --sequence --image-format=png --frames="$a-$b" --every-nth-frame=2 --concurrency=4 --log=error
  # rename element-XXX.png → 00000.png in playback order
  local i=0
  for f in $(ls "$W/$name" | sort); do mv "$W/$name/$f" "$W/$name/$(printf %05d $i).png"; i=$((i+1)); done
  echo "$name: $i frames"
}
render_part part0 0 209
render_part part1 210 329
render_part part2 330 599
# Android draws each frame centred on a black screen, so frames only need the area
# with content: crop to 1440x1400 around the screen centre and store as 8-bit grey.
python3 - "$W" <<'PY'
import sys, pathlib
from PIL import Image
root = pathlib.Path(sys.argv[1])
for p in sorted(root.glob("part*/*.png")):
    im = Image.open(p).convert("L").crop((0, 820, 1440, 2220))
    im.save(p, optimize=True, compress_level=9)
PY
cp out/boot-part0.wav "$W/part0/audio.wav"
cp out/boot-part2.wav "$W/part2/audio.wav"
cat > "$W/desc.txt" <<DESC
1440 1400 30
c 1 0 part0
c 0 0 part1
c 1 0 part2
DESC
rm -f final/bootanimation.zip
(cd "$W" && zip -0 -q -r ../../final/bootanimation.zip desc.txt part0 part1 part2)
unzip -l final/bootanimation.zip | tail -1
ls -la final/bootanimation.zip
