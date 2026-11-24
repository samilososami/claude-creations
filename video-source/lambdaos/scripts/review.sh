#!/usr/bin/env bash
# usage: scripts/review.sh <composition> <outdir> <from> <to> <step> [cols] [thumbW]
set -euo pipefail
comp=$1; out=$2; a=$3; b=$4; step=$5; cols=${6:-6}; tw=${7:-260}
mkdir -p "$out"
find "$out" -maxdepth 1 -name '*.jpeg' -delete
npx remotion render "$comp" "$out" --sequence --image-format=jpeg --frames="$a-$b" --every-nth-frame="$step" --log=error >/dev/null
cd "$out"
for f in element-*.jpeg; do n=${f#element-}; n=${n%.jpeg}; mv "$f" "fr-$(printf %05d $((a + 10#$n * step))).jpeg"; done
cd - >/dev/null
python3 scripts/sheet.py "$out" "$out.jpg" "$cols" "$tw"
