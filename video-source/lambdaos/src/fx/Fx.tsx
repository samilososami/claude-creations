import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, rnd } from "../theme";

/** Animated film grain from pre-baked noise tiles. */
export const Grain: React.FC<{ opacity?: number; every?: number }> = ({ opacity = 0.07, every = 2 }) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / every);
  const i = step % 8;
  const ox = Math.floor(rnd(step * 3.1) * 512);
  const oy = Math.floor(rnd(step * 7.7) * 512);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`fx/grain-${i}.png`)})`,
        backgroundPosition: `${ox}px ${oy}px`,
        backgroundSize: "512px 512px",
        mixBlendMode: "overlay",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 40%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** The dot grid texture used by the LambdaOS setup screens. */
export const DotGrid: React.FC<{ gap?: number; opacity?: number; offsetY?: number; mask?: string }> = ({
  gap = 34,
  opacity = 0.16,
  offsetY = 0,
  mask = "radial-gradient(ellipse 70% 55% at 30% 20%, #000 0%, transparent 75%)",
}) => (
  <AbsoluteFill
    style={{
      backgroundImage: `radial-gradient(circle, rgba(241,240,236,${opacity}) 1.3px, transparent 1.6px)`,
      backgroundSize: `${gap}px ${gap}px`,
      backgroundPosition: `0 ${offsetY}px`,
      WebkitMaskImage: mask,
      maskImage: mask,
    }}
  />
);

/** Soft top-left glow like the setup background. */
export const Glow: React.FC<{ x?: string; y?: string; size?: string; opacity?: number }> = ({
  x = "20%",
  y = "10%",
  size = "70%",
  opacity = 0.12,
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at ${x} ${y}, rgba(241,240,236,${opacity}) 0%, rgba(241,240,236,0) ${size})`,
    }}
  />
);

export const Backdrop: React.FC<{ children?: React.ReactNode; color?: string }> = ({ children, color = C.bg }) => (
  <AbsoluteFill style={{ backgroundColor: color }}>{children}</AbsoluteFill>
);

/** Thin hairline that draws from one side. */
export const Hairline: React.FC<{
  x: number;
  y: number;
  w: number;
  p: number;
  color?: string;
  vertical?: boolean;
  thickness?: number;
}> = ({ x, y, w, p, color = C.lineStrong, vertical, thickness = 2 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: vertical ? thickness : w * p,
      height: vertical ? w * p : thickness,
      background: color,
    }}
  />
);

/** Corner crop marks / registration frame (technical look). */
export const CropMarks: React.FC<{ x: number; y: number; w: number; h: number; len?: number; opacity?: number }> = ({
  x,
  y,
  w,
  h,
  len = 26,
  opacity = 0.5,
}) => {
  const s: React.CSSProperties = { position: "absolute", borderColor: `rgba(241,240,236,${opacity})`, borderStyle: "solid", width: len, height: len };
  return (
    <>
      <div style={{ ...s, left: x, top: y, borderWidth: "2px 0 0 2px" }} />
      <div style={{ ...s, left: x + w - len, top: y, borderWidth: "2px 2px 0 0" }} />
      <div style={{ ...s, left: x, top: y + h - len, borderWidth: "0 0 2px 2px" }} />
      <div style={{ ...s, left: x + w - len, top: y + h - len, borderWidth: "0 2px 2px 0" }} />
    </>
  );
};

/** Hook: seconds → frames. */
export const useSec = () => {
  const { fps } = useVideoConfig();
  return (s: number) => Math.round(s * fps);
};

export const Image: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => (
  <Img src={staticFile(src)} style={style} />
);
