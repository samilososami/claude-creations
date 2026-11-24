"""Clean whisper word timings for on-screen captions (brand spellings, merged tokens).

usage: python3 scripts/fix_words.py in.json out.json
"""
import json
import sys

src, dst = sys.argv[1], sys.argv[2]
w = [list(x) for x in json.load(open(src))]
out = []
i = 0
while i < len(w):
    a, b, t = w[i]
    nxt = w[i + 1][2] if i + 1 < len(w) else ""
    # merge split tokens: "Wi" "-Fi", "USB" "-C"
    if nxt.startswith("-"):
        out.append([a, w[i + 1][1], t + nxt]); i += 2; continue
    # "Lambda" "OS," -> "LambdaOS,"
    if t == "Lambda" and nxt.rstrip(".,").upper() == "OS":
        out.append([a, w[i + 1][1], "LambdaOS" + nxt[2:]]); i += 2; continue
    # "pen" "testing" -> "pentesting"
    if t.lower() == "pen" and nxt.startswith("testing"):
        out.append([a, w[i + 1][1], "pen" + nxt]); i += 2; continue
    # "an" "operator" -> "and Operator"
    if t == "an" and nxt.lower().startswith("operator"):
        out.append([a, b, "and"]); out.append([w[i + 1][0], w[i + 1][1], "Operator" + nxt[8:]]); i += 2; continue
    core = t.rstrip(".,:?!")
    tail = t[len(core):]
    fix = {"LAM": "Lamb", "lamb": "Lamb", "Lex": "LEX", "obliterated": "abliterated", "operator": "Operator"}.get(core)
    out.append([a, b, (fix or core) + tail])
    i += 1
json.dump(out, open(dst, "w"))
print(" ".join(x[2] for x in out))
