import React, { useMemo } from "react";
import shapes from "./lambShapes.json";
import { C } from "../theme";

type Part = {
  kind: "wool" | "feature";
  area: number;
  bbox: number[];
  cx: number;
  cy: number;
  d: string;
  filled: string;
  holes: { d: string; cx: number; cy: number; area: number }[];
};
type Shape = { w: number; h: number; transform: string; silhouette: string; parts: Part[] };

const S = shapes as unknown as Record<string, Shape>;

export type LambFace =
  | "main"
  | "curious"
  | "focused"
  | "reassuring"
  | "success"
  | "waiting"
  | `laugh${number}`;

const keyOf = (f: LambFace) =>
  f === "main" ? "lamb-main" : f.startsWith("laugh") ? `frame-${String(Number(f.slice(5))).padStart(2, "0")}` : `face-${f}-v2`;

/** Pick eyes: the two largest features above the nose line. */
const eyeIdx = (parts: Part[]) => {
  const feats = parts.map((p, i) => ({ p, i })).filter((x) => x.p.kind === "feature");
  const top = [...feats].sort((a, b) => b.p.area - a.p.area).slice(0, 2);
  return new Set(top.filter((x) => x.p.cy < 760).map((x) => x.i));
};

export type LambProps = {
  face?: LambFace;
  /** 0 open, 1 closed */
  blink?: number;
  /** pupil offset in source px (approx -20..20) */
  look?: { x: number; y: number };
  size: number;
  ink?: string;
  faceColor?: string;
  /** optional subtle wool breathing scale */
  breathe?: number;
  /** tilt in degrees */
  tilt?: number;
  /** draw only the wool outline (for wireframe / draw-on effects) */
  strokeOnly?: { width: number; progress: number };
  /** wool/silhouette opacity (features stay visible) */
  woolOpacity?: number;
  style?: React.CSSProperties;
};

/** The Lamb mascot, vectorised from the LambdaOS design archive. */
export const Lamb: React.FC<LambProps> = ({
  face = "main",
  blink = 0,
  look = { x: 0, y: 0 },
  size,
  ink = C.ink,
  faceColor = "#070707",
  breathe = 0,
  tilt = 0,
  strokeOnly,
  woolOpacity = 1,
  style,
}) => {
  const sh = S[keyOf(face)];
  const eyes = useMemo(() => eyeIdx(sh.parts), [sh]);
  const id = "l" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const wool = sh.parts.find((p) => p.kind === "wool")!;

  return (
    <svg
      viewBox={`40 160 1174 930`}
      width={size}
      height={(size * 930) / 1174}
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        {sh.parts.map((p, i) =>
          p.holes.length ? (
            <clipPath id={`${id}-c${i}`} key={i}>
              <path d={p.filled} transform={sh.transform} />
            </clipPath>
          ) : null,
        )}
      </defs>
      <g transform={`rotate(${tilt} 626 640)`}>
        <g
          transform={`translate(626 620) scale(${1 + breathe * 0.012} ${1 - breathe * 0.008}) translate(-626 -620)`}
        >
          {strokeOnly ? (
            <path
              d={wool.d}
              transform={sh.transform}
              fill="none"
              stroke={ink}
              strokeWidth={strokeOnly.width * 10}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - strokeOnly.progress}
              strokeLinecap="round"
            />
          ) : (
            <g opacity={woolOpacity}>
              <path d={sh.silhouette} transform={sh.transform} fill={faceColor} />
              <path d={wool.d} transform={sh.transform} fill={ink} />
            </g>
          )}
        </g>
        {!strokeOnly &&
          sh.parts.map((p, i) => {
            if (p.kind === "wool") return null;
            const isEye = eyes.has(i);
            const sy = isEye ? Math.max(0.06, 1 - blink) : 1;
            const pcx = (p.bbox[0] + p.bbox[2]) / 2;
            const pcy = (p.bbox[1] + p.bbox[3]) / 2;
            return (
              <g key={i} transform={`translate(${pcx} ${pcy}) scale(1 ${sy}) translate(${-pcx} ${-pcy})`}>
                <path d={p.filled} transform={sh.transform} fill={ink} />
                {p.holes.length > 0 && (
                  <g clipPath={`url(#${id}-c${i})`}>
                    <g transform={isEye ? `translate(${look.x} ${look.y})` : undefined}>
                      {p.holes.map((h, j) => (
                        <path key={j} d={h.d} transform={sh.transform} fill={faceColor} />
                      ))}
                    </g>
                  </g>
                )}
              </g>
            );
          })}
      </g>
    </svg>
  );
};
