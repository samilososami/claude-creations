#!/usr/bin/env bash
# Sequential renders (silent video) + mux with the mastered audio.
set -euo pipefail
cd "$(dirname "$0")/.."
r() { # id out [extra flags]
  local id=$1 out=$2; shift 2
  echo "[$(date +%T)] render $id"
  npx remotion render "$id" "$out" --codec=h264 --crf=17 --concurrency=4 --muted --log=error "$@"
}
mux() { # video audio out
  ffmpeg -hide_banner -v error -y -i "$1" -i "$2" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$3"
}
for job in "$@"; do
  case $job in
    lamb) r Lamb out/lamb-silent.mp4 && mux out/lamb-silent.mp4 public/audio/lamb-mix.wav final/lambdaos-lamb.mp4 ;;
    lexv) r LexVertical out/lexv-silent.mp4 && mux out/lexv-silent.mp4 public/audio/lexv-mix.wav final/lambdaos-lex-mode-vertical.mp4 ;;
    lex) r Lex out/lex-silent.mp4 && mux out/lex-silent.mp4 public/audio/lex-mix.wav final/lambdaos-lex-mode.mp4 ;;
    boot) r Boot out/boot-silent.mp4 --scale=0.75 && mux out/boot-silent.mp4 public/audio/boot-mix.wav final/lambdaos-boot-animation.mp4 ;;
    sting) r Sting out/sting-silent.mp4 && mux out/sting-silent.mp4 public/audio/sting-mix.wav final/lambdaos-logo-sting.mp4 ;;
    stingsq) r StingSquare out/stingsq-silent.mp4 && mux out/stingsq-silent.mp4 public/audio/sting-mix.wav final/lambdaos-logo-sting-square.mp4 ;;
    wallpaper) r LiveWallpaper final/lambdaos-live-wallpaper.mp4 ;;
    operator) r OperatorFlow out/operator-silent.mp4 && mux out/operator-silent.mp4 public/audio/operator-mix.wav final/lambdaos-operator.mp4 ;;
    lambstates) r LambStates final/lambdaos-lamb-states.mp4 ;;
  esac
  echo "[$(date +%T)] done $job"
done
echo ALLDONE
