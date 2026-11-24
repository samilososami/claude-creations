import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { Check, CircleDashed, GitBranch, Lock, Plus } from "lucide-react";
import { C, F, ease, env, kf, prog } from "../theme";
import { DotGrid, Glow, Grain, Vignette } from "../fx/Fx";
import { Wordmark } from "../brand/Brand";
import { Captions } from "../ui/Captions";
import { MaskLine, Tag, TypeOn } from "../ui/Kinetic";

/**
 * Shared kit for the narrated social explainers (LEX, Lamb, Operator).
 * 1080 × 1920 @ 30 fps. Content lives between y 150 and 1390 so TikTok/Reels UI
 * and the captions (y 1440) never cover it.
 */
export type Word = [number, number, string];
export const FPS = 30;
export const NARR = 1.0;

/** narration seconds → video frame */
export const at = (s: number) => Math.round((s + NARR) * FPS);
/** video seconds → frame */
export const sec = (s: number) => Math.round(s * FPS);

/** Find the narration time of the n-th occurrence of a word (prefix match, case-insensitive). */
export const wordAt = (words: Word[], text: string, n = 0) => {
  const hits = words.filter((w) => w[2].toLowerCase().replace(/[.,:?!]/g, "").startsWith(text.toLowerCase()));
  if (!hits[n]) throw new Error(`word not found: ${text} #${n}`);
  return hits[n][0];
};

/**
 * Scene transition: fades/slides/blur in over [a, a+i] and out over [b-o, b].
 * Returns a style for the wrapper and the in/out progress.
 */
export const sceneStyle = (f: number, a: number, b: number, i = 14, o = 12, dir = 1): React.CSSProperties => {
  const pin = prog(f, a, a + i, ease.out);
  const pout = prog(f, b - o, b, ease.in);
  return {
    opacity: Math.min(pin, 1 - pout),
    transform: `translateY(${(1 - pin) * 90 * dir - pout * 90 * dir}px) scale(${1 + (1 - pin) * 0.03 + pout * 0.04})`,
    filter: `blur(${(1 - pin) * 10 + pout * 12}px)`,
  };
};

export const Scene: React.FC<{ f: number; a: number; b: number; i?: number; o?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  f,
  a,
  b,
  i,
  o,
  children,
  style,
}) => {
  if (f < a - 1 || f > b + 1) return null;
  return <AbsoluteFill style={{ ...sceneStyle(f, a, b, i, o), ...style }}>{children}</AbsoluteFill>;
};

/** Kicker tag + headline, masked in. Optional second line in grey. */
export const Head: React.FC<{
  f: number;
  kicker: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  tk: number;
  tt: number;
  ts?: number;
  out?: number;
  top?: number;
  size?: number;
  align?: "left" | "center";
}> = ({ f, kicker, title, sub, tk, tt, ts, out = 0, top = 150, size = 96, align = "left" }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top, textAlign: align }}>
    <MaskLine p={prog(f, tk, tk + 12)} out={out}>
      <Tag size={26}>{kicker}</Tag>
    </MaskLine>
    <MaskLine p={prog(f, tt, tt + 13)} out={out} style={{ fontFamily: F.display, fontWeight: 600, fontSize: size, color: C.ink, marginTop: 12, lineHeight: 1.04 }}>
      {title}
    </MaskLine>
    {sub !== undefined && ts !== undefined && (
      <MaskLine p={prog(f, ts, ts + 12)} out={out} style={{ fontFamily: F.ui, fontSize: 48, color: C.grey, marginTop: 8 }}>
        {sub}
      </MaskLine>
    )}
  </div>
);

/** Rounded card used across scenes. */
export const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode; hi?: number }> = ({ style, children, hi = 0 }) => (
  <div
    style={{
      borderRadius: 34,
      background: `rgba(${20 + hi * 14},${22 + hi * 14},${24 + hi * 14},0.92)`,
      border: `2px solid rgba(241,240,236,${0.13 + hi * 0.3})`,
      boxShadow: `0 30px 70px rgba(0,0,0,0.55)${hi > 0 ? `, 0 0 ${70 * hi}px rgba(241,240,236,${0.12 * hi})` : ""}`,
      color: C.ink,
      fontFamily: F.ui,
      ...style,
    }}
  >
    {children}
  </div>
);

/** A thin leader line from (x1,y1) to (x2,y2), drawn with p. */
export const Leader: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; opacity?: number }> = ({ x1, y1, x2, y2, p, opacity = 0.5 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={C.ink} strokeOpacity={opacity} strokeWidth={2} />
    <circle cx={x1} cy={y1} r={7 * Math.min(1, p * 3)} fill={C.ink} />
  </svg>
);

/** Tap ripple at x,y starting at frame a. */
export const Tap: React.FC<{ f: number; a: number; x: number; y: number; size?: number }> = ({ f, a, x, y, size = 110 }) => {
  if (f < a || f > a + 22) return null;
  const p = prog(f, a, a + 20, ease.out);
  const d = 30 + size * p;
  return (
    <>
      <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: "50%", border: `3px solid ${C.ink}`, opacity: 0.7 * (1 - p) }} />
      <div style={{ position: "absolute", left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, background: C.ink, opacity: 0.35 * (1 - prog(f, a + 4, a + 14)) }} />
    </>
  );
};

/** Background, captions, audio and finishing layers shared by the three videos. */
export const Shell: React.FC<{ words: Word[]; audio: string; withAudio: boolean; hideAfter: number; children: React.ReactNode; flashes?: number[] }> = ({
  words,
  audio,
  withAudio,
  hideAfter,
  children,
  flashes = [],
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <Glow x="18%" y="8%" size="65%" opacity={0.1} />
      <DotGrid offsetY={-f * 0.6} opacity={0.13} />
      {children}
      <Captions words={words} offset={NARR} y={1440} hideAfter={hideAfter} />
      <Vignette strength={0.55} />
      <Grain opacity={0.06} />
      <AbsoluteFill style={{ background: "#fff", opacity: flashes.some((c) => f === c) ? 0.06 : 0, pointerEvents: "none" }} />
      {withAudio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

/**
 * "Status" beat: in development / open source / no public build / follow along.
 * dev, os, follow are narration-derived frames.
 */
export const Status: React.FC<{ f: number; a: number; b: number; dev: number; os: number; follow: number; what: string; version?: string }> = ({
  f,
  a,
  b,
  dev,
  os,
  follow,
  what,
  version,
}) => {
  const rows: { at: number; icon: React.ReactNode; t: string; s: string }[] = [
    { at: dev, icon: <CircleDashed size={46} strokeWidth={2} style={{ transform: `rotate(${f * 3}deg)` }} />, t: "In development", s: version ?? "Being built right now" },
    { at: os, icon: <GitBranch size={46} strokeWidth={2} />, t: "Open source", s: "github.com/samilososami/lambdaos" },
    { at: os + 16, icon: <Lock size={44} strokeWidth={2} />, t: "No public build yet", s: "Not available to try" },
  ];
  const fp = prog(f, follow, follow + 10, ease.snap);
  const tapped = f >= follow + 12;
  return (
    <Scene f={f} a={a} b={b}>
      <Head f={f} kicker="Status" title={what} tk={a + 2} tt={a + 6} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 470, display: "flex", flexDirection: "column", gap: 26 }}>
        {rows.map((r) => {
          const p = prog(f, r.at, r.at + 12, ease.out);
          return (
            <Card key={r.t} hi={env(f, r.at, r.at + 30, 4, 16) * 0.6} style={{ display: "flex", alignItems: "center", gap: 34, padding: "34px 40px", opacity: p, transform: `translateX(${(1 - p) * 60}px)` }}>
              <span style={{ display: "flex", color: C.ink }}>{r.icon}</span>
              <div>
                <div style={{ fontSize: 50, fontWeight: 600 }}>{r.t}</div>
                <div style={{ fontFamily: F.mono, fontSize: 25, color: C.grey, marginTop: 6, letterSpacing: "0.04em" }}>
                  {r.t === "Open source" ? <TypeOn text={r.s} p={prog(f, r.at + 4, r.at + 34, ease.soft)} frame={f} cursor={false} /> : r.s}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {/* follow button */}
      <div style={{ position: "absolute", top: 1120, width: "100%", display: "flex", justifyContent: "center", opacity: fp, transform: `translateY(${(1 - fp) * 40}px)` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "26px 52px",
            borderRadius: 999,
            background: tapped ? "transparent" : C.ink,
            border: `3px solid ${C.ink}`,
            color: tapped ? C.ink : "#0B0B0B",
            fontFamily: F.ui,
            fontWeight: 600,
            fontSize: 46,
            transform: `scale(${1 - 0.06 * env(f, follow + 8, follow + 16, 3, 5)})`,
          }}
        >
          {tapped ? <Check size={46} strokeWidth={3} /> : <Plus size={46} strokeWidth={3} />}
          {tapped ? "Following" : "Follow along"}
        </div>
      </div>
      <Tap f={f} a={follow + 8} x={540} y={1170} size={160} />
    </Scene>
  );
};

/** Wordmark outro. `tag` = narration-derived frames of the five tagline words. */
export const Outro: React.FC<{ f: number; a: number; end: number; lambdaos: number; tag: number[] }> = ({ f, a, end, lambdaos, tag }) => {
  const bg = prog(f, a, a + 30, ease.out);
  const fade = prog(f, end - 36, end, ease.in);
  const words = ["The", "system", "for", "hacking", "systems."];
  if (f < a) return null;
  return (
    <AbsoluteFill style={{ opacity: Math.min(prog(f, a, a + 10), 1 - fade) }}>
      <AbsoluteFill style={{ background: C.bg }} />
      <AbsoluteFill style={{ opacity: bg * 0.55, transform: `scale(${1.12 - 0.1 * bg}) translateY(${(1 - bg) * 60}px)` }}>
        <Img src={staticFile("img/lambda-dark-s10.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 70%" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.25) 45%, rgba(8,8,8,0.9) 100%)" }} />
      <div style={{ position: "absolute", left: 110, top: 700 }}>
        <Wordmark
          width={860}
          letter={(i) => {
            const p = prog(f, lambdaos - 8 + i * 1.5, lambdaos + 6 + i * 1.5, ease.out);
            return { opacity: p, y: (1 - p) * -90, blur: (1 - p) * 14, scale: 1.2 - 0.2 * p };
          }}
        />
      </div>
      <div style={{ position: "absolute", top: 900, width: "100%", textAlign: "center", fontFamily: F.ui, fontSize: 54, color: C.mist, letterSpacing: -0.3 }}>
        {words.map((x, i) => {
          const p = prog(f, tag[i] - 2, tag[i] + 8);
          return (
            <span key={x} style={{ display: "inline-block", marginRight: 14, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
              {x}
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1180, width: "100%", textAlign: "center", opacity: prog(f, tag[4] + 18, tag[4] + 32) }}>
        <div style={{ fontFamily: F.mono, fontSize: 34, color: C.ink }}>lambdaos.samilososami.com</div>
        <div style={{ marginTop: 26, display: "flex", justifyContent: "center", gap: 34 }}>
          <Tag size={22}>Open source</Tag>
          <Tag size={22}>In development</Tag>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Camera: eased keyframes of [frame, scale, x, y] applied around (540, 960). */
export const camera = (f: number, keys: [number, number, number, number][]) => {
  const fr = keys.map((k) => k[0]);
  const s = kf(f, fr, keys.map((k) => k[1]), ease.inOut);
  const x = kf(f, fr, keys.map((k) => k[2]), ease.inOut);
  const y = kf(f, fr, keys.map((k) => k[3]), ease.inOut);
  return { transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: "540px 960px" } as React.CSSProperties;
};

/** Mono micro-label. */
export const Mono: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 24, color = C.grey, style }) => (
  <span style={{ fontFamily: F.mono, fontSize: size, color, letterSpacing: "0.1em", textTransform: "uppercase", ...style }}>{children}</span>
);
