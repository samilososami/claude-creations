import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Live wallpaper: the selected LambdaOS dark wallpaper ("λ behind the fold"),
 * animated as a seamless loop. Every motion is periodic over the clip length,
 * so the last frame flows into the first.
 */
export const WP_SECONDS = 12;

export const LiveWallpaper: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const t = frame / durationInFrames; // 0..1, loop phase
  const TAU = Math.PI * 2;

  // slow drift (closed orbit)
  const zoom = 1.035 + 0.012 * Math.sin(TAU * t);
  const dx = 10 * Math.sin(TAU * t);
  const dy = 8 * Math.sin(TAU * t + Math.PI / 2) - 8;

  // sheen band sweeps across once per loop, off-screen at both ends
  const band = -0.6 + 2.2 * t;
  // λ glow: breathes twice per loop
  const glow = 0.5 - 0.5 * Math.cos(TAU * 2 * t);

  const layer: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  };
  const mask = (src: string): React.CSSProperties => ({
    WebkitMaskImage: `url(${staticFile(src)})`,
    maskImage: `url(${staticFile(src)})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  });

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <div style={{ ...layer, transform: `translate(${dx}px, ${dy}px) scale(${zoom})` }}>
        <Img src={staticFile("img/lambda-dark-s10.png")} style={{ ...layer, objectFit: "cover" }} />
        {/* λ glow */}
        <div style={{ ...layer, ...mask("img/wp-lambda-mask.png"), background: `rgba(241,240,236,${0.035 + 0.07 * glow})` }} />
        {/* sheen travelling along the lit paper */}
        <div
          style={{
            ...layer,
            ...mask("img/wp-sheen-mask.png"),
            background: `linear-gradient(118deg, transparent ${(band - 0.22) * 100}%, rgba(255,255,255,0.55) ${band * 100}%, transparent ${(band + 0.22) * 100}%)`,
            mixBlendMode: "screen",
          }}
        />
        {/* faint secondary sheen, opposite phase */}
        <div
          style={{
            ...layer,
            ...mask("img/wp-sheen-mask.png"),
            background: `linear-gradient(62deg, transparent ${(1.6 - 2.2 * t - 0.3) * 100}%, rgba(255,255,255,0.18) ${(1.6 - 2.2 * t) * 100}%, transparent ${(1.6 - 2.2 * t + 0.3) * 100}%)`,
            mixBlendMode: "screen",
          }}
        />
      </div>
      <div style={{ display: "none" }}>
        {width}
        {height}
      </div>
    </AbsoluteFill>
  );
};
