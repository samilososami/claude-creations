import React from "react";
import { interpolate } from "remotion";
import { C, F, ease, prog } from "../theme";

/** Line of text revealed by sliding up out of a mask. */
export const MaskLine: React.FC<{
  p: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  out?: number;
}> = ({ p, children, style, out = 0 }) => (
  <div style={{ overflow: "hidden", paddingBottom: "0.08em", ...style }}>
    <div
      style={{
        transform: `translateY(${(1 - p) * 110 - out * 110}%)`,
        opacity: Math.min(1, p * 1.4) * (1 - out),
      }}
    >
      {children}
    </div>
  </div>
);

/** Typewriter. `p` 0..1 over the string. */
export const TypeOn: React.FC<{
  text: string;
  p: number;
  cursor?: boolean;
  frame?: number;
  style?: React.CSSProperties;
  cursorColor?: string;
}> = ({ text, p, cursor = true, frame = 0, style, cursorColor = C.ink }) => {
  const n = Math.round(text.length * Math.max(0, Math.min(1, p)));
  const blink = Math.floor(frame / 8) % 2 === 0 || (p > 0 && p < 1);
  return (
    <span style={{ whiteSpace: "pre-wrap", ...style }}>
      {text.slice(0, n)}
      {cursor && (
        <span style={{ display: "inline-block", width: "0.55em", height: "1.05em", verticalAlign: "-0.15em", background: cursorColor, opacity: blink ? 1 : 0, marginLeft: 2 }} />
      )}
    </span>
  );
};

/** Small mono label with a leading dot. */
export const Tag: React.FC<{ children: React.ReactNode; size?: number; color?: string; dot?: boolean; style?: React.CSSProperties }> = ({
  children,
  size = 26,
  color = C.grey,
  dot = true,
  style,
}) => (
  <span
    style={{
      fontFamily: F.mono,
      fontSize: size,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color,
      display: "inline-flex",
      alignItems: "center",
      gap: "0.7em",
      fontWeight: 500,
      ...style,
    }}
  >
    {dot && <span style={{ width: size * 0.34, height: size * 0.34, borderRadius: "50%", background: C.ink, display: "inline-block" }} />}
    {children}
  </span>
);

/** Letters that drop in one by one (for big display words). */
export const StaggerWord: React.FC<{
  text: string;
  frame: number;
  start: number;
  per?: number;
  dur?: number;
  style?: React.CSSProperties;
  from?: number;
}> = ({ text, frame, start, per = 1.6, dur = 14, style, from = 0.9 }) => (
  <span style={{ display: "inline-flex", ...style }}>
    {[...text].map((ch, i) => {
      const p = prog(frame, start + i * per, start + i * per + dur, ease.out);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            transform: `translateY(${(1 - p) * from}em)`,
            opacity: p,
            filter: `blur(${(1 - p) * 10}px)`,
            whiteSpace: "pre",
          }}
        >
          {ch}
        </span>
      );
    })}
  </span>
);

/** Number counter. */
export const Count: React.FC<{ from: number; to: number; p: number; pad?: number; decimals?: number }> = ({
  from,
  to,
  p,
  pad = 0,
  decimals = 0,
}) => {
  const v = interpolate(p, [0, 1], [from, to]);
  return <>{v.toFixed(decimals).padStart(pad, "0")}</>;
};

/** A chip/pill label. */
export const Chip: React.FC<{ children: React.ReactNode; p: number; style?: React.CSSProperties; strong?: boolean }> = ({
  children,
  p,
  style,
  strong,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 18,
      padding: "18px 30px",
      borderRadius: 999,
      border: `2px solid ${strong ? C.ink : C.lineStrong}`,
      background: strong ? C.ink : "rgba(16,17,18,0.72)",
      color: strong ? "#0B0B0B" : C.ink,
      fontFamily: F.mono,
      fontSize: 32,
      fontWeight: 500,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      transform: `translateY(${(1 - p) * 40}px) scale(${0.92 + 0.08 * p})`,
      opacity: p,
      ...style,
    }}
  >
    {children}
  </div>
);
