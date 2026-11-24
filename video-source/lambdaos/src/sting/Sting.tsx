import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, ease, env, kf, prog } from "../theme";
import { Grain, Vignette } from "../fx/Fx";
import { Wordmark, WM_BOX, WM_LETTERS } from "../brand/Brand";

/**
 * Logo sting: the λ is split into its two strokes, which fly in as slabs with
 * motion trails and lock together on the sound logo; then the wordmark resolves.
 * Works for any aspect (16:9, 1:1, 9:16) since layout is centre-based.
 */
const LONG = "M33 24H49L78 84H63L47 51L40 38L36 31H33Z"; // flag + long stroke
const SHORT = "M40 38L47 51L29 84H14Z"; // short leg

export const STING_SECONDS = 5;

export const LogoSting: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60; // author in 60 fps units
  const lock = 62; // impact frame (≈1.03 s)
  const fa = prog(f, 14, lock, ease.in);
  const unit = Math.min(width, height) / 108 * 0.42; // px per glyph unit
  const cx = width / 2;
  const cy = height / 2;
  const toWm = prog(f, 120, 170, ease.inOut);
  const wmW = Math.min(width * 0.62, 1100);
  const sc = wmW / WM_BOX.w;
  const lam = WM_LETTERS[1];
  const lamCx = cx - wmW / 2 + ((lam[0] + lam[2]) / 2 - WM_BOX.x) * sc;
  const lamCy = cy - (WM_BOX.h * sc) / 2 + ((lam[1] + lam[3]) / 2 - WM_BOX.y) * sc;
  const lamH = (lam[3] - lam[1]) * sc;
  const gScale = kf(toWm, [0, 1], [1, lamH / (60 * unit)]);
  const gx = kf(toWm, [0, 1], [cx, lamCx]);
  const gy = kf(toWm, [0, 1], [cy, lamCy]);
  const shock = prog(f, lock, lock + 40, ease.out);
  const flash = env(f, lock, lock + 10, 1, 9);
  const out = prog(f, 268, 300, ease.in);
  const tag = prog(f, 186, 214, ease.out);
  const glyphVis = toWm >= 1 ? 0 : 1;

  // slab offsets (glyph units): long from top-right, short from bottom-left
  const off = (dx: number, dy: number, rot: number, k = 0) => {
    const p = Math.min(1, fa + k * 0.06);
    const q = 1 - p;
    return `translate(${dx * q * q} ${dy * q * q}) rotate(${rot * q * q} 46 54)`;
  };
  const trail = (d: string, dx: number, dy: number, rot: number) =>
    [5, 4, 3, 2, 1].map((k) => (
      <path key={k} d={d} transform={off(dx, dy, rot, -k * 0.9)} fill={C.ink} opacity={fa < 1 ? 0.08 * (6 - k) * (1 - fa * 0.6) : 0} />
    ));

  return (
    <AbsoluteFill style={{ background: "#050505", opacity: 1 - out }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(241,240,236,${0.12 * flash + 0.05 * prog(f, lock, lock + 30)}) 0%, transparent ${30 + 20 * shock}%)` }} />
      {/* shock ring */}
      <div
        style={{
          position: "absolute",
          left: cx - 40 - shock * Math.min(width, height) * 0.45,
          top: cy - 40 - shock * Math.min(width, height) * 0.45,
          width: 80 + shock * Math.min(width, height) * 0.9,
          height: 80 + shock * Math.min(width, height) * 0.9,
          borderRadius: "50%",
          border: `2px solid rgba(241,240,236,${0.5 * (1 - shock)})`,
          opacity: f >= lock ? 1 : 0,
        }}
      />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${gx} ${gy}) scale(${unit * gScale}) translate(-46 -54)`} opacity={glyphVis}>
          {trail(LONG, 70, -60, 25)}
          {trail(SHORT, -60, 60, -30)}
          <path d={LONG} transform={off(70, -60, 25)} fill={C.ink} opacity={prog(f, 14, 24)} />
          <path d={SHORT} transform={off(-60, 60, -30)} fill={C.ink} opacity={prog(f, 14, 24)} />
          {/* seam glint on lock */}
          <line x1={40} y1={38} x2={47} y2={51} stroke="#fff" strokeWidth={1.2} opacity={env(f, lock, lock + 18, 1, 16)} />
        </g>
      </svg>
      {f >= 120 && (
        <div style={{ position: "absolute", left: cx - wmW / 2, top: cy - (WM_BOX.h * sc) / 2 }}>
          <Wordmark
            width={wmW}
            letter={(i) => {
              if (i === 1) return { opacity: toWm >= 1 ? 1 : 0 };
              const d = i === 0 ? 0 : i - 1;
              const p = prog(f, 140 + d * 3.5, 176 + d * 3.5, ease.out);
              return { opacity: p, x: (i === 0 ? -80 : 80) * (1 - p) * (1 + d * 0.15), blur: (1 - p) * 18 };
            }}
          />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: cy + (WM_BOX.h * sc) / 2 + Math.min(width, height) * 0.05,
          width: "100%",
          textAlign: "center",
          fontFamily: F.ui,
          fontSize: Math.round(Math.min(width, height) * 0.034),
          color: C.mist,
          letterSpacing: 0.4,
          opacity: tag,
          transform: `translateY(${(1 - tag) * 16}px)`,
        }}
      >
        The system for hacking systems.
      </div>
      <Vignette strength={0.55} />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
