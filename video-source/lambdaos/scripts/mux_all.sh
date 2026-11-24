#!/usr/bin/env bash
# Mux every rendered silent video with its mastered audio (AAC 256k), into final/.
set -euo pipefail
cd "$(dirname "$0")/.."
m() { if [ -f "out/$1-silent.mp4" ]; then ffmpeg -hide_banner -v error -y -i "out/$1-silent.mp4" -i "public/audio/$2-mix.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "final/$3.mp4"; echo "muxed $3"; fi; }
m explainer explainer lambdaos-explainer
m lamb lamb lambdaos-lamb
m lex lex lambdaos-lex-mode
m lexv lexv lambdaos-lex-mode-vertical
m boot boot lambdaos-boot-animation
m operator operator lambdaos-operator
m sting sting lambdaos-logo-sting
m stingsq sting lambdaos-logo-sting-square
