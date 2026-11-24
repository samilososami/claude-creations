import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, prog, ease } from "../theme";

type Word = [number, number, string];

/** Group words into short caption phrases, breaking on punctuation or length. */
const group = (words: Word[], max = 5): Word[][] => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const gap = next ? next[0] - w[1] : 9;
    if (/[.,:?!]$/.test(w[2]) || cur.length >= max || gap > 0.45) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out;
};

/** Word-highlight captions, minimal. `offset` shifts narration time into video time. */
export const Captions: React.FC<{ words: Word[]; offset: number; y: number; size?: number; hideAfter?: number }> = ({
  words,
  offset,
  y,
  size = 44,
  hideAfter = 9999,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - offset;
  const groups = React.useMemo(() => group(words), [words]);
  const gi = groups.findIndex((g, i) => {
    const start = g[0][0] - 0.12;
    const end = groups[i + 1] ? groups[i + 1][0][0] - 0.12 : g[g.length - 1][1] + 0.6;
    return t >= start && t < end;
  });
  if (gi < 0 || t > hideAfter) return null;
  const g = groups[gi];
  const appear = prog(frame, Math.round((g[0][0] - 0.12 + offset) * fps), Math.round((g[0][0] + 0.1 + offset) * fps), ease.out);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: y,
        textAlign: "center",
        fontFamily: F.ui,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.25,
        letterSpacing: -0.2,
        transform: `translateY(${(1 - appear) * 12}px)`,
        opacity: appear,
        
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "14px 30px 16px",
          borderRadius: 22,
          background: "rgba(8,8,8,0.62)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 0 0 1px rgba(241,240,236,0.08)",
        }}
      >
        {g.map(([s, , w], i) => {
          const spoken = t >= s - 0.05;
          return (
            <span key={i} style={{ color: spoken ? C.ink : "rgba(241,240,236,0.38)" }}>
              {w.replace(/[,:]$/, "")}
              {i < g.length - 1 ? " " : ""}
            </span>
          );
        })}
      </span>
    </div>
  );
};
