import React from "react";

/**
 * Samsung Galaxy S10 (SM-G973F), front view, drawn from its proportions:
 * 70.4 × 149.9 mm body, 19:9 Infinity-O display with the camera hole
 * in the top-right corner. Not Samsung's official model.
 *
 * Screen content is authored at SCREEN_W × SCREEN_H (1080 × 2280, the S10's
 * default FHD+ resolution) and scaled to fit.
 */
export const SCREEN_W = 1080;
export const SCREEN_H = 2280;

export type PhoneProps = {
  width: number;
  children?: React.ReactNode;
  /** 3D rotation in degrees */
  rx?: number;
  ry?: number;
  rz?: number;
  /** screen brightness 0..1 (0 = off, black glass) */
  on?: number;
  /** extra glare position 0..1 sweeping across the glass */
  glare?: number;
  perspective?: number;
  depthLayers?: number;
  style?: React.CSSProperties;
  shadow?: boolean;
};

export const phoneHeight = (w: number) => w * (149.9 / 70.4);

export const Phone: React.FC<PhoneProps> = ({
  width,
  children,
  rx = 0,
  ry = 0,
  rz = 0,
  on = 1,
  glare,
  perspective = 2600,
  depthLayers = 14,
  style,
  shadow = true,
}) => {
  const w = width;
  const h = phoneHeight(w);
  const radius = w * 0.125;
  const bezelX = w * 0.022;
  const bezelTop = w * 0.052;
  const sw = w - bezelX * 2;
  const sh = sw * (SCREEN_H / SCREEN_W);
  const scale = sw / SCREEN_W;
  const depth = w * 0.11; // 7.8mm / 70.4mm
  const layers = Array.from({ length: depthLayers });

  return (
    <div style={{ width: w, height: h, perspective, ...style }}>
      <div
        style={{
          width: w,
          height: h,
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
        }}
      >
        {shadow && (
          <div
            style={{
              position: "absolute",
              left: w * 0.08,
              top: h * 0.06,
              width: w * 0.84,
              height: h * 0.92,
              borderRadius: radius,
              background: "rgba(0,0,0,0.85)",
              filter: `blur(${w * 0.09}px)`,
              transform: `translateZ(${-depth - 2}px) translate(${ry * 1.2}px, ${w * 0.08}px)`,
            }}
          />
        )}
        {/* extruded frame: stacked slices give the body real thickness */}
        {layers.map((_, i) => {
          const t = i / (layers.length - 1);
          const lightness = 10 + 16 * Math.sin(t * Math.PI);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: radius,
                background: `hsl(210 4% ${lightness}%)`,
                transform: `translateZ(${-depth * t}px)`,
              }}
            />
          );
        })}
        {/* front glass */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            background: "linear-gradient(135deg,#2a2c2e 0%,#0c0d0e 40%,#050505 100%)",
            boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.18), inset 0 0 0 4px rgba(0,0,0,0.9)",
            transform: "translateZ(0.5px)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: bezelX,
              top: bezelTop,
              width: sw,
              height: sh,
              borderRadius: w * 0.095,
              overflow: "hidden",
              background: "#000",
            }}
          >
            <div
              style={{
                width: SCREEN_W,
                height: SCREEN_H,
                transform: `scale(${scale})`,
                transformOrigin: "0 0",
                opacity: on,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {children}
            </div>
            {/* Infinity-O camera hole */}
            <div
              style={{
                position: "absolute",
                right: sw * 0.075,
                top: sw * 0.03,
                width: sw * 0.058,
                height: sw * 0.058,
                borderRadius: "50%",
                background: "radial-gradient(circle at 40% 38%, #2b3440 0%, #07090b 55%, #000 100%)",
                boxShadow: "0 0 0 2px #050505",
              }}
            />
            {/* curved-edge sheen */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 3.5%, rgba(255,255,255,0) 96.5%, rgba(255,255,255,0.10) 100%)",
                pointerEvents: "none",
              }}
            />
          </div>
          {glare !== undefined && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(115deg, rgba(255,255,255,0) ${glare * 140 - 40}%, rgba(255,255,255,0.10) ${glare * 140 - 25}%, rgba(255,255,255,0) ${glare * 140 - 10}%)`,
                pointerEvents: "none",
              }}
            />
          )}
        </div>
        {/* side buttons (right: power; left: volume + Bixby) */}
        <div style={{ position: "absolute", right: -w * 0.012, top: h * 0.27, width: w * 0.014, height: h * 0.07, borderRadius: 4, background: "#2a2c2f", transform: `translateZ(${-depth / 2}px)` }} />
        <div style={{ position: "absolute", left: -w * 0.012, top: h * 0.2, width: w * 0.014, height: h * 0.12, borderRadius: 4, background: "#2a2c2f", transform: `translateZ(${-depth / 2}px)` }} />
      </div>
    </div>
  );
};
