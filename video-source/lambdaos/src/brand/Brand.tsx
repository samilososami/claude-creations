import React from "react";
import wm from "./wordmark.json";
import { C } from "../theme";

/** λ glyph from the LambdaOS icon (lambda-icon.svg), native box 14..78 × 24..84. */
export const LAMBDA_D = "M33 24h16l29 60H63L47 51 29 84H14l26-46-4-7h-3z";

export const LambdaGlyph: React.FC<{
  size: number;
  color?: string;
  /** 0..1 stroke draw progress; when set, renders as outline being drawn */
  draw?: number;
  /** 0..1 fill opacity */
  fill?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}> = ({ size, color = C.ink, draw, fill = 1, strokeWidth = 1.2, style }) => (
  <svg viewBox="12 22 68 64" width={size} height={(size * 64) / 68} style={{ overflow: "visible", ...style }}>
    {draw !== undefined && (
      <path
        d={LAMBDA_D}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="miter"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
    )}
    <path d={LAMBDA_D} fill={color} opacity={fill} />
  </svg>
);

type Letter = { d: string; bbox: number[] };
const W = wm as unknown as { w: number; h: number; transform: string; letters: Letter[] };

export const WM_BOX = { x: 850, y: 330, w: 2155, h: 345 };

/**
 * The LambdaOS wordmark, vectorised letter by letter from the brand banner.
 * `letter(i)` lets callers animate each of the 8 glyphs (L λ m b d a O S).
 */
export const Wordmark: React.FC<{
  width: number;
  color?: string;
  letter?: (i: number) => { opacity?: number; x?: number; y?: number; scale?: number; blur?: number; color?: string };
  style?: React.CSSProperties;
}> = ({ width, color = C.ink, letter, style }) => {
  const h = (width * WM_BOX.h) / WM_BOX.w;
  return (
    <svg
      viewBox={`${WM_BOX.x} ${WM_BOX.y} ${WM_BOX.w} ${WM_BOX.h}`}
      width={width}
      height={h}
      style={{ overflow: "visible", ...style }}
    >
      {W.letters.map((l, i) => {
        const a = letter ? letter(i) : {};
        const cx = (l.bbox[0] + l.bbox[2]) / 2;
        const cy = (l.bbox[1] + l.bbox[3]) / 2;
        const s = a.scale ?? 1;
        return (
          <g
            key={i}
            opacity={a.opacity ?? 1}
            transform={`translate(${(a.x ?? 0) + cx} ${(a.y ?? 0) + cy}) scale(${s}) translate(${-cx} ${-cy})`}
            style={a.blur ? { filter: `blur(${a.blur}px)` } : undefined}
          >
            <path d={l.d} transform={W.transform} fill={a.color ?? color} />
          </g>
        );
      })}
    </svg>
  );
};

/** Letter bboxes (in wordmark source units) for layout maths. */
export const WM_LETTERS = W.letters.map((l) => l.bbox);
