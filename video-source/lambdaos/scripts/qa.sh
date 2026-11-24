#!/usr/bin/env bash
# QA for a final video: stream info, loudness (EBU R128), spectrogram and a contact sheet.
set -euo pipefail
cd "$(dirname "$0")/.."
f=$1; name=$(basename "$f" .mp4); out=qa/$name
mkdir -p qa
echo "== $name"
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_name,width,height,r_frame_rate,sample_rate,channels -of compact "$f"
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$f" | grep -q .; then
  ffmpeg -hide_banner -nostats -i "$f" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|LRA:|Peak:)" | tr -s ' ' | paste -sd' '
  ffmpeg -hide_banner -v error -y -i "$f" -lavfi "showspectrumpic=s=1400x480:legend=1:color=intensity:scale=log:fscale=log" "$out-spectrum.png"
fi
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
n=24
step=$(python3 -c "print(max(0.04, $dur/$n))")
w=$(ffprobe -v error -select_streams v -show_entries stream=width -of csv=p=0 "$f")
h=$(ffprobe -v error -select_streams v -show_entries stream=height -of csv=p=0 "$f")
tw=$(python3 -c "print(240 if $w<$h else (360 if $w>$h else 300))")
ffmpeg -hide_banner -v error -y -i "$f" -vf "fps=1/$step,scale=$tw:-2,tile=8x3:padding=4" -frames:v 1 "$out-sheet.jpg"
# black/frozen frame detection
ffmpeg -hide_banner -nostats -i "$f" -vf "freezedetect=n=0.0005:d=2.5" -map 0:v -f null - 2>&1 | grep -E "freeze_(start|duration)" | head -6 || true
echo "sheet: $out-sheet.jpg"
