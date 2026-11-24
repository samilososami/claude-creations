import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { C, F, ease, env, kf, prog } from "../theme";
import { LAMBDA_D, Wordmark, WM_BOX, WM_LETTERS } from "../brand/Brand";

/**
 * LambdaOS boot animation, authored at the S10's native 1440 × 3040, 60 fps.
 *
 * Timeline (frames @60):
 *   part0  intro    [0, 210)    construction of the λ
 *   part1  loop     [210, 330)  seamless 2 s loop while Android boots
 *   part2  outro    [330, 600)  λ joins the wordmark, fades to black
 *
 * `loops` repeats part1 so the showcase video can play it more than once.
 */
export const BOOT = { W: 1440, H: 3040, FPS: 60, P0: 210, LOOP: 120, P2: 270 };
export const bootDuration = (loops: number) => BOOT.P0 + BOOT.LOOP * loops + BOOT.P2;

const CX = 720;
const CY = 1440;
const U = 6; // px per glyph unit
const GC = { x: 46, y: 54 }; // glyph centre in icon units
const VERTS: [number, number][] = [
  [33, 24], [49, 24], [78, 84], [63, 84], [47, 51], [29, 84], [14, 84], [40, 38], [36, 31], [33, 31],
];

/** map timeline frame → base frame (folding repeated loops). */
const fold = (f: number, loops: number) => {
  const loopEnd = BOOT.P0 + BOOT.LOOP * loops;
  if (f < BOOT.P0) return { base: f, loopPhase: 0 };
  if (f < loopEnd) return { base: BOOT.P0 + ((f - BOOT.P0) % BOOT.LOOP), loopPhase: (f - BOOT.P0) % BOOT.LOOP };
  return { base: f - loopEnd + BOOT.P0 + BOOT.LOOP, loopPhase: 0 };
};

export const BootAnimation: React.FC<{ loops?: number; withAudio?: boolean; compact?: boolean }> = ({ loops = 1, withAudio = false, compact = false }) => {
  const frame = useCurrentFrame();
  const { base: f } = fold(frame, loops);
  const L0 = BOOT.P0; // loop start (base)
  const L1 = BOOT.P0 + BOOT.LOOP; // outro start (base)
  const inLoop = f >= L0 && f < L1;
  const lp = inLoop ? (f - L0) / BOOT.LOOP : 0; // 0..1 loop phase
  const TAU = Math.PI * 2;

  /* ── intro ── */
  const dot = env(f, 18, 70, 10, 12);
  const line = prog(f, 28, 62, ease.inOut);
  const lineOut = prog(f, 62, 96, ease.inOut);
  const draw = prog(f, 52, 136, ease.inOut);
  const guides = prog(f, 56, 120, ease.out) * (1 - prog(f, 160, 200, ease.inOut));
  const fill = prog(f, 128, 168, ease.inOut);
  const settle = prog(f, 160, 210, ease.out);
  const outline = draw * (1 - prog(f, 168, 196));

  /* ── loop: periodic only ── */
  const breathe = inLoop ? 0.5 - 0.5 * Math.cos(lp * TAU) : 0;
  const orbitA = inLoop ? lp * TAU - Math.PI / 2 : -Math.PI / 2;
  const ringIn = prog(f, 186, 210, ease.out) * (1 - prog(f, L1, L1 + 40, ease.inOut));

  /* ── outro ── */
  const o = f - L1;
  const wmW = 1040;
  const sc = wmW / WM_BOX.w;
  const lam = WM_LETTERS[1];
  const wmLeft = (BOOT.W - wmW) / 2;
  const wmTop = CY - (WM_BOX.h * sc) / 2;
  const lamCx = wmLeft + ((lam[0] + lam[2]) / 2 - WM_BOX.x) * sc;
  const lamCy = wmTop + ((lam[1] + lam[3]) / 2 - WM_BOX.y) * sc;
  const lamH = (lam[3] - lam[1]) * sc;
  const toWm = prog(o, 10, 56, ease.inOut);
  const gScale = kf(toWm, [0, 1], [1, lamH / (60 * U)]);
  const gx = kf(toWm, [0, 1], [CX, lamCx]);
  const gy = kf(toWm, [0, 1], [CY, lamCy]);
  const tagP = prog(o, 70, 110, ease.out);
  const sweep = prog(o, 96, 150, ease.inOut);
  const fadeAll = prog(o, 200, 262, ease.inOut);

  // glyph group transform: center at (gx, gy) and scale
  const glyphTransform = `translate(${gx} ${gy}) scale(${U * gScale * (1 + 0.04 * (1 - settle) * fill)}) translate(${-GC.x} ${-GC.y})`;
  const glyphVis = o >= 0 && toWm >= 1 ? 0 : 1;
  const glow = 0.18 + 0.22 * breathe + (o >= 0 ? -0.18 * toWm : 0);

  return (
    <AbsoluteFill style={{ background: "#000", opacity: 1 - fadeAll }}>
      {withAudio && <Audio src={staticFile("audio/boot-mix.wav")} />}
      {/* soft radial ambience */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% ${(CY / BOOT.H) * 100}%, rgba(241,240,236,${0.07 * fill + 0.04 * breathe}) 0%, rgba(0,0,0,0) 38%)`,
        }}
      />
      <svg width={BOOT.W} height={BOOT.H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="fillclip">
            <rect x={0} y={84 - 62 * fill} width={120} height={70} />
          </clipPath>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={28} />
          </filter>
        </defs>
        {/* origin dot + hairline */}
        <circle cx={CX} cy={CY + 30 * U - 2} r={5} fill={C.ink} opacity={dot * (1 - line)} />
        <rect x={CX - 280 * line * (1 - lineOut)} y={CY + 30 * U - 2} width={560 * line * (1 - lineOut)} height={2.5} fill={C.ink} opacity={line > 0 ? 0.9 : 0} />
        {/* construction guides */}
        <g opacity={guides * 0.55} stroke={C.ink} strokeWidth={1.4} fill="none">
          <circle cx={CX} cy={CY} r={330} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - guides} opacity={0.5} />
          <line x1={CX + (49 - GC.x) * U - 18 * U * 0.5} y1={CY + (24 - GC.y) * U - 18 * U} x2={CX + (78 - GC.x) * U + 9 * U * 0.5} y2={CY + (84 - GC.y) * U + 18 * U} opacity={0.35} />
          <line x1={CX + (40 - GC.x) * U + 13 * U * 0.56} y1={CY + (38 - GC.y) * U - 23 * U * 0.56} x2={CX + (14 - GC.x) * U - 13 * U * 0.4} y2={CY + (84 - GC.y) * U + 23 * U * 0.4} opacity={0.35} />
          <line x1={CX - 420} y1={CY + 30 * U} x2={CX + 420} y2={CY + 30 * U} opacity={0.3} />
          <line x1={CX - 420} y1={CY - 30 * U} x2={CX + 420} y2={CY - 30 * U} opacity={0.18} />
        </g>
        {/* vertex markers */}
        {VERTS.map(([vx, vy], i) => {
          const p = env(f, 60 + i * 6, 170, 6, 22);
          const x = CX + (vx - GC.x) * U;
          const y = CY + (vy - GC.y) * U;
          return (
            <g key={i} opacity={p * 0.85}>
              <rect x={x - 7} y={y - 7} width={14} height={14} fill="none" stroke={C.ink} strokeWidth={1.6} />
            </g>
          );
        })}
        {/* glow behind glyph */}
        <g transform={glyphTransform} filter="url(#glow)" opacity={fill * glow * glyphVis}>
          <path d={LAMBDA_D} fill={C.ink} />
        </g>
        {/* outline being drawn */}
        <g transform={glyphTransform} opacity={glyphVis}>
          <path d={LAMBDA_D} fill="none" stroke={C.ink} strokeWidth={0.32} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} opacity={outline} strokeLinejoin="miter" />
          {/* fill rising */}
          <path d={LAMBDA_D} fill={C.ink} clipPath="url(#fillclip)" />
          {/* fill front edge */}
          {fill > 0 && fill < 1 && <rect x={10} y={84 - 62 * fill - 0.2} width={72} height={0.45} fill="#fff" opacity={0.9} clipPath="url(#fillclip)" />}
        </g>
        {/* orbit ring + satellite (loop) */}
        <g opacity={ringIn}>
          <circle cx={CX} cy={CY} r={330} fill="none" stroke="rgba(241,240,236,0.10)" strokeWidth={2} />
          <circle cx={CX + Math.cos(orbitA) * 330} cy={CY + Math.sin(orbitA) * 330} r={7} fill={C.ink} />
          {Array.from({ length: 14 }).map((_, k) => {
            const a = orbitA - (k + 1) * 0.045;
            return <circle key={k} cx={CX + Math.cos(a) * 330} cy={CY + Math.sin(a) * 330} r={6 - k * 0.38} fill={C.ink} opacity={0.5 * (1 - k / 14)} />;
          })}
        </g>
      </svg>
      {/* wordmark letters (outro) */}
      {o >= 0 && (
        <div style={{ position: "absolute", left: wmLeft, top: wmTop }}>
          <Wordmark
            width={wmW}
            letter={(i) => {
              if (i === 1) return { opacity: toWm >= 1 ? 1 : 0 };
              const d = i === 0 ? 0 : i - 1;
              const p = prog(o, 40 + d * 3, 70 + d * 3, ease.out);
              return { opacity: p, x: (i === 0 ? -1 : 1) * (1 - p) * 60, blur: (1 - p) * 16 };
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: -30,
              background: `linear-gradient(100deg, transparent ${sweep * 140 - 30}%, rgba(255,255,255,0.6) ${sweep * 140 - 18}%, transparent ${sweep * 140 - 6}%)`,
              mixBlendMode: "overlay",
              opacity: sweep > 0 && sweep < 1 ? 1 : 0,
            }}
          />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: CY + 170,
          width: "100%",
          textAlign: "center",
          fontFamily: F.ui,
          fontSize: 50,
          letterSpacing: 0.5,
          color: C.mist,
          opacity: tagP,
          transform: `translateY(${(1 - tagP) * 24}px)`,
        }}
      >
        the system for hacking systems.
      </div>
      {/* version */}
      <div
        style={{
          position: "absolute",
          ...(compact ? { top: CY + 540 } : { bottom: 260 }),
          width: "100%",
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 30,
          letterSpacing: "0.3em",
          color: C.grey,
          opacity: 0.55 * prog(f, 180, 220) * (1 - prog(o, 10, 40)),
        }}
      >
        0.1.0-ALPHA.2
      </div>
      {/* loader hairline under the glyph (periodic in the loop) */}
      <div
        style={{
          position: "absolute",
          left: CX - 140,
          top: CY + 470,
          width: 280,
          height: 3,
          background: "rgba(241,240,236,0.12)",
          overflow: "hidden",
          opacity: prog(f, 190, 210) * (1 - prog(f, L1, L1 + 20)),
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${(inLoop ? lp : 0) * 160 - 60}%`,
            width: "60%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, #F1F0EC, transparent)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
