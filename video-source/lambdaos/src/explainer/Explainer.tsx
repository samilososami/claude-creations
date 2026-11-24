import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { Ban, Check, CircleDashed, CirclePause, Download, FileText, Folder, Lock, Star, Usb, Wifi } from "lucide-react";
import { C, F, ease, env, kf, prog, rnd } from "../theme";
import { DotGrid, Glow, Grain, Vignette, CropMarks } from "../fx/Fx";
import { LambdaGlyph, Wordmark, WM_BOX, WM_LETTERS } from "../brand/Brand";
import { Lamb } from "../lamb/Lamb";
import { Phone, phoneHeight } from "../device/Phone";
import { OperatorHome, LockScreen, Shot, TileIcon } from "../ui/Screens";
import { MaskLine, Tag, TypeOn, StaggerWord, Chip } from "../ui/Kinetic";
import { Captions } from "../ui/Captions";
import { WifiOp } from "./WifiOp";
import words from "./words.json";

export const EXPLAINER_FPS = 30;
export const EXPLAINER_DURATION = 65 * 30;
const NARR = 1.0; // narration starts at 1.0 s
/** narration time (s) → video frame */
const w = (s: number) => Math.round((s + NARR) * 30);
/** video seconds → frame */
const t = (s: number) => Math.round(s * 30);

const W = 1080;

/* ───────────────────────── A · Intro ───────────────────────── */
const Intro: React.FC<{ f: number }> = ({ f }) => {
  const wmW = 820;
  const sc = wmW / WM_BOX.w;
  const lam = WM_LETTERS[1];
  const lamCx = (W - wmW) / 2 + ((lam[0] + lam[2]) / 2 - WM_BOX.x) * sc;
  const wmTop = 960 - (WM_BOX.h * sc) / 2;
  const lamCy = wmTop + ((lam[1] + lam[3]) / 2 - WM_BOX.y) * sc;
  const draw = prog(f, 8, 34, ease.inOut);
  const fill = prog(f, 28, 40);
  const mv = prog(f, 44, 60, ease.inOut); // glyph moves into wordmark
  const big = 300;
  const gx = kf(mv, [0, 1], [540, lamCx], ease.inOut);
  const gy = kf(mv, [0, 1], [960, lamCy], ease.inOut);
  const gs = kf(mv, [0, 1], [1, 0.49], ease.inOut);
  const out = prog(f, 86, 100, ease.in);
  const cursorOn = f < 10 && Math.floor(f / 4) % 2 === 0;
  const lineW = kf(f, [0, 8], [0, 380], ease.out) * (1 - prog(f, 8, 14));
  const shine = prog(f, 62, 84, ease.inOut);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${1 + out * 0.25})`, filter: `blur(${out * 8}px)` }}>
      {cursorOn && <div style={{ position: "absolute", left: 528, top: 930, width: 24, height: 50, background: C.ink }} />}
      <div style={{ position: "absolute", left: 540 - lineW / 2, top: 958, width: lineW, height: 3, background: C.ink, boxShadow: "0 0 24px #fff" }} />
      {f < 62 && f >= 6 && (
        <div style={{ position: "absolute", left: gx - big / 2, top: gy - (big * 64) / 68 / 2, transform: `scale(${gs})`, transformOrigin: "50% 50%" }}>
          <LambdaGlyph size={big} draw={draw} fill={fill} strokeWidth={0.9} />
        </div>
      )}
      <div style={{ position: "absolute", left: (W - wmW) / 2, top: wmTop }}>
        <Wordmark
          width={wmW}
          letter={(i) => {
            if (i === 1) return { opacity: f >= 60 ? 1 : 0 };
            const d = i < 1 ? 0 : i - 1;
            const p = prog(f, 48 + d * 2, 64 + d * 2, ease.out);
            return { opacity: p, y: (1 - p) * 120, blur: (1 - p) * 12 };
          }}
        />
        {/* light sweep */}
        <div
          style={{
            position: "absolute",
            inset: -20,
            background: `linear-gradient(100deg, transparent ${shine * 140 - 30}%, rgba(255,255,255,0.55) ${shine * 140 - 18}%, transparent ${shine * 140 - 6}%)`,
            mixBlendMode: "overlay",
            opacity: shine > 0 && shine < 1 ? 1 : 0,
          }}
        />
      </div>
      <div style={{ position: "absolute", top: 1110, width: "100%", textAlign: "center", opacity: prog(f, 64, 76) }}>
        <Tag dot={false} size={24} color={C.grey}>
          Android · Pentesting · Galaxy S10
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── B · Pentesting ───────────────────────── */
const Pentest: React.FC<{ f: number }> = ({ f }) => {
  const out = prog(f, t(7.1), t(7.5), ease.in);
  const big = prog(f, w(5.34), w(5.34) + 10);
  const scan = prog(f, w(5.34), w(5.34) + 18, ease.inOut);
  const reticle = prog(f, w(5.34) + 4, w(5.34) + 16, ease.snap);
  const dim = prog(f, w(5.34), w(5.34) + 10);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 120}px)` }}>
      <div style={{ position: "absolute", left: 80, top: 470, color: C.ink, opacity: 1 - dim * 0.55 }}>
        <MaskLine p={prog(f, w(2.12), w(2.12) + 12)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 104, lineHeight: 1.02 }}>
          An Android
        </MaskLine>
        <MaskLine p={prog(f, w(2.6), w(2.6) + 12)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 104, lineHeight: 1.02 }}>
          operating system
        </MaskLine>
        <MaskLine p={prog(f, w(3.48), w(3.48) + 12)} style={{ fontFamily: F.ui, fontWeight: 400, fontSize: 60, color: C.grey, marginTop: 26 }}>
          built for one thing:
        </MaskLine>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 930, textAlign: "center", fontFamily: F.display, fontWeight: 600, fontSize: 150, color: C.ink, letterSpacing: 2 }}>
        <StaggerWord text="PENTESTING" frame={f} start={w(5.34)} per={1.2} dur={12} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 190,
            background: `linear-gradient(90deg, transparent ${scan * 120 - 20}%, rgba(241,240,236,0.9) ${scan * 120 - 19}%, transparent ${scan * 120 - 17}%)`,
            opacity: scan > 0 && scan < 1 ? 0.9 : 0,
          }}
        />
      </div>
      {big > 0 && (
        <div style={{ position: "absolute", inset: 0, transform: `scale(${1.25 - 0.25 * reticle})`, opacity: reticle, transformOrigin: "540px 1020px" }}>
          <CropMarks x={40} y={900} w={1000} h={250} len={46} opacity={0.75} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1190, textAlign: "center", opacity: prog(f, w(5.34) + 10, w(5.34) + 22) }}>
        <Tag size={24}>Wi-Fi · Bluetooth · USB · Network · Radio</Tag>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── C/D · The phone ───────────────────────── */
const PHONE_W = 540;
const PHONE_L = 90;
const PHONE_T = 300;

const PhoneScreen: React.FC<{ f: number }> = ({ f }) => {
  // 11.9 boot → 14.6 setup welcome → 16.4 lock (dark) → wipe to light and back
  if (f < w(10.9)) return <AbsoluteFill style={{ background: "#000" }} />;
  const bootP = prog(f, w(10.9), w(10.9) + 14);
  const toSetup = prog(f, w(13.6), w(13.6) + 12, ease.inOut);
  const toLock = prog(f, w(15.42), w(15.42) + 12, ease.inOut);
  const wipe = env(f, w(16.1), w(17.5), 10, 10);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* boot */}
      <AbsoluteFill style={{ opacity: bootP * (1 - toSetup), display: "grid", placeItems: "center" }}>
        <div style={{ transform: `scale(${0.9 + 0.1 * bootP})`, opacity: 0.85 + 0.15 * Math.sin(f / 6) }}>
          <LambdaGlyph size={230} />
        </div>
        <div style={{ position: "absolute", bottom: 210, opacity: prog(f, w(11.5), w(11.5) + 10) }}>
          <Wordmark width={520} color={C.mist} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: toSetup * (1 - toLock), transform: `translateY(${(1 - toSetup) * 80}px)` }}>
        <Shot src="img/setup-welcome.png" />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: toLock }}>
        <LockScreen />
        <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${(1 - wipe) * 100}%)` }}>
          <LockScreen wallpaper="img/lambda-light-s10.png" />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Callout: React.FC<{ f: number; at: number; y: number; title: string; sub: string; fromX: number }> = ({ f, at, y, title, sub, fromX }) => {
  const p = prog(f, at, at + 12);
  const l = prog(f, at, at + 9, ease.inOut);
  const x0 = fromX;
  const x1 = 700;
  return (
    <>
      <div style={{ position: "absolute", left: x0, top: y + 22, width: (x1 - x0 - 16) * l, height: 2, background: C.lineStrong }} />
      <div style={{ position: "absolute", left: x0 - 7, top: y + 16, width: 14, height: 14, borderRadius: 7, background: C.ink, transform: `scale(${l})` }} />
      <div style={{ position: "absolute", left: x1, top: y, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
        <div style={{ fontFamily: F.mono, fontSize: 30, color: C.ink, letterSpacing: "0.08em" }}>{title}</div>
        <div style={{ fontFamily: F.mono, fontSize: 22, color: C.grey, letterSpacing: "0.12em", marginTop: 8, textTransform: "uppercase" }}>{sub}</div>
      </div>
    </>
  );
};

const PhoneScenes: React.FC<{ f: number }> = ({ f }) => {
  const rise = prog(f, t(7.2), t(8.9), ease.out);
  const out = prog(f, w(18.2), w(18.75), ease.in);
  const ry = kf(f, [t(7.2), t(9.2), w(18.2)], [-40, -16, -10], ease.out);
  const rx = kf(f, [t(7.2), t(9.2)], [16, 5], ease.out);
  const y = (1 - rise) * 1500;
  const ph = phoneHeight(PHONE_W);
  // outro: phone tilts flat & recedes into the stack
  const exitRx = out * 58;
  const exitRz = out * -32;
  const chips: [number, React.ReactNode, boolean?][] = [
    [w(10.94), <>Android 15</>],
    [w(12.4), <>LineageOS 22.2</>],
    [w(13.7), <><Ban size={30} strokeWidth={2.4} />Google apps</>],
    [w(15.42), <>Monochrome</>, true],
  ];
  const calloutsOut = prog(f, w(10.6), w(10.9), ease.in);
  return (
    <AbsoluteFill>
      {/* headline */}
      <div style={{ position: "absolute", left: 80, top: 150, opacity: 1 - out }}>
        <MaskLine p={prog(f, w(6.38), w(6.38) + 12)} out={prog(f, w(10.6), w(10.9), ease.in)}>
          <Tag size={26}>Designed around one phone</Tag>
        </MaskLine>
        <MaskLine
          p={prog(f, w(8.56), w(8.56) + 12)}
          out={prog(f, w(10.6), w(10.9), ease.in)}
          style={{ fontFamily: F.display, fontWeight: 600, fontSize: 96, color: C.ink, marginTop: 14 }}
        >
          Galaxy S10
        </MaskLine>
      </div>
      <div style={{ position: "absolute", left: 80, top: 150, opacity: 1 - out }}>
        <MaskLine p={prog(f, w(10.94), w(10.94) + 12)} out={out}>
          <Tag size={26}>The system</Tag>
        </MaskLine>
        <MaskLine p={prog(f, w(10.94) + 4, w(10.94) + 16)} out={out} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 96, color: C.ink, marginTop: 14 }}>
          From first boot
        </MaskLine>
      </div>
      {/* phone */}
      <div
        style={{
          position: "absolute",
          left: PHONE_L,
          top: PHONE_T + y + out * 120,
          transform: `scale(${1 - out * 0.35})`,
          opacity: 1 - prog(f, w(18.5), w(18.75)),
        }}
      >
        <Phone width={PHONE_W} ry={ry} rx={rx + exitRx} rz={exitRz} glare={kf(f, [t(7.6), t(9.6)], [0, 1])} on={1}>
          <PhoneScreen f={f} />
        </Phone>
      </div>
      {/* callouts */}
      <div style={{ opacity: 1 - calloutsOut }}>
        <Callout f={f} at={w(8.56)} y={PHONE_T + 70} title="SM-G973F" sub="Model" fromX={PHONE_L + PHONE_W - 60} />
        <Callout f={f} at={w(8.96)} y={PHONE_T + ph * 0.36} title="Exynos 9820" sub="SoC · beyond1lte" fromX={PHONE_L + PHONE_W - 30} />
        <Callout f={f} at={w(9.4)} y={PHONE_T + ph * 0.68} title="3040 × 1440" sub="6.1″ Infinity-O" fromX={PHONE_L + PHONE_W - 40} />
      </div>
      {/* system chips */}
      <div style={{ position: "absolute", left: 690, top: PHONE_T + 120, display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-start", opacity: 1 - out }}>
        {chips.map(([at, label, strong], i) => (
          <Chip key={i} p={prog(f, at, at + 10, ease.snap)} strong={strong}>
            {label}
          </Chip>
        ))}
      </div>
      {/* dark / light pair */}
      <div style={{ position: "absolute", left: 690, top: PHONE_T + 560, display: "flex", gap: 22, opacity: env(f, w(15.42) + 6, w(18.5), 10, 8) }}>
        {["img/lambda-dark-s10.png", "img/lambda-light-s10.png"].map((src, i) => (
          <div key={src} style={{ width: 150, height: 316, borderRadius: 22, overflow: "hidden", border: `2px solid ${C.line}`, transform: `translateY(${(1 - prog(f, w(15.42) + 6 + i * 4, w(15.42) + 20 + i * 4)) * 50}px)` }}>
            <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 690, top: PHONE_T + 900, opacity: env(f, w(15.42) + 14, w(18.5), 10, 8) }}>
        <Tag size={22}>Dark · Light</Tag>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── E · Kernel stack ───────────────────────── */
const PLATES = [
  { t: "Lambda Operator", s: "App · control centre" },
  { t: "Lambda Core", s: "Typed operations" },
  { t: "Android 15", s: "LineageOS 22.2" },
  { t: "Kernel", s: "4.14.356-lambdaos+" },
  { t: "Exynos 9820", s: "BCM4375B1 · Galaxy S10" },
];

const LOG = [
  "[    0.000000] Linux version 4.14.356-lambdaos+",
  "[    0.412207] exynos-pmu: Exynos9820 PMU initialized",
  "[    3.118904] dhd: BCM4375B1 firmware loaded",
  "[   21.402118] wlan0: set type → monitor",
  "[   22.917560] usb 1-1: RTL8812AU adapter attached",
  "[   24.104221] can: controller area network core",
  "[   25.009874] rtl2832_sdr: SDR registered",
];

const Kernel: React.FC<{ f: number }> = ({ f }) => {
  const inP = prog(f, w(18.6), w(19.6), ease.out);
  const spread = prog(f, w(19.6), w(20.4), ease.inOut);
  const out = prog(f, w(25.75), w(26.15), ease.in);
  const gap = 62 + 34 * spread;
  const caps: { at: number; icon: React.ReactNode; a: string; b: string }[] = [
    { at: w(20.82), icon: <Wifi size={54} strokeWidth={1.6} />, a: "Monitor mode", b: "internal Wi-Fi" },
    { at: w(22.88), icon: <Usb size={54} strokeWidth={1.6} />, a: "External adapters", b: "over USB" },
    { at: w(24.52), icon: <TileIcon id="can" size={54} mono />, a: "CAN", b: "SocketCAN" },
    { at: w(25.44), icon: <TileIcon id="radio" size={54} mono />, a: "Radio", b: "SDR" },
  ];
  const logN = Math.floor(kf(f, [w(18.7), w(25.5)], [0, LOG.length], ease.out));
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {/* kernel log */}
      <div style={{ position: "absolute", left: 70, top: 110, fontFamily: F.mono, fontSize: 23, lineHeight: 1.6, color: C.grey, opacity: inP }}>
        {LOG.slice(0, Math.max(1, logN)).slice(-4).map((l, i, arr) => (
          <div key={l} style={{ color: i === arr.length - 1 ? C.mist : C.dim, whiteSpace: "pre" }}>
            {l}
          </div>
        ))}
      </div>
      {/* stack */}
      <div style={{ position: "absolute", left: 540 - 330, top: 900 - 330 - out * 260, width: 660, height: 660, perspective: 2400, opacity: inP }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(58deg) rotateZ(-38deg) scale(${0.7 + 0.06 * inP})` }}>
          {PLATES.map((pl, i) => {
            const k = PLATES.length - 1 - i; // bottom plate = index 4 → z 0
            const pin = prog(f, w(18.6) + k * 4, w(18.6) + k * 4 + 18, ease.out);
            const isK = i === 3;
            const lit = isK ? spread : 0;
            const dim = !isK ? spread * 0.7 : 0;
            return (
              <div
                key={pl.t}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 46,
                  background: lit > 0.5 ? C.ink : "rgba(30,33,36,0.94)",
                  border: `3px solid ${lit > 0.5 ? C.ink : "rgba(241,240,236,0.35)"}`,
                  transform: `translateZ(${(k * gap) - (1 - pin) * 500}px)`,
                  opacity: pin * (1 - dim),
                  boxShadow: lit > 0.5 ? "0 0 120px rgba(241,240,236,0.45)" : "0 30px 60px rgba(0,0,0,0.6)",
                  padding: 50,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  color: lit > 0.5 ? "#0B0B0B" : C.ink,
                }}
              >
                <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 64, opacity: isK ? 1 : 1 - spread * 0.75 }}>{pl.t}</div>
                <div style={{ fontFamily: F.mono, fontSize: 30, marginTop: 10, opacity: isK ? 0.8 : 0.75 * (1 - spread * 0.8) }}>{pl.s}</div>
                {i === 0 && (
                  <div style={{ position: "absolute", top: 50, left: 50, display: "flex", gap: 26, opacity: 0.8 }}>
                    {(["wifi", "bt", "usb", "can", "net", "radio"] as const).map((id) => (
                      <TileIcon key={id} id={id} size={58} mono />
                    ))}
                  </div>
                )}
                {i === 1 && (
                  <div style={{ position: "absolute", top: 50, left: 50 }}>
                    <LambdaGlyph size={110} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* kernel label */}
      <div style={{ position: "absolute", left: 80, top: 300 }}>
        <MaskLine p={prog(f, w(18.72), w(18.72) + 12)}>
          <Tag size={26}>Underneath</Tag>
        </MaskLine>
        <MaskLine p={prog(f, w(19.6), w(19.6) + 12)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 88, color: C.ink, marginTop: 10 }}>
          Custom kernel
        </MaskLine>
      </div>
      {/* capabilities */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1130, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 26px" }}>
        {caps.map((c) => {
          const p = prog(f, c.at, c.at + 10, ease.snap);
          return (
            <div
              key={c.a}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "26px 28px",
                borderRadius: 30,
                border: `2px solid ${C.line}`,
                background: "rgba(20,22,24,0.85)",
                color: C.ink,
                opacity: p,
                transform: `translateY(${(1 - p) * 40}px)`,
              }}
            >
              {c.icon}
              <div>
                <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 38 }}>{c.a}</div>
                <div style={{ fontFamily: F.mono, fontSize: 24, color: C.grey, marginTop: 4, letterSpacing: "0.06em" }}>{c.b}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── F · Operator ───────────────────────── */
const OP_W = 600;
const Operator: React.FC<{ f: number }> = ({ f }) => {
  const inP = prog(f, w(25.95), w(26.9), ease.out);
  const toOp = prog(f, w(32.86) + 4, w(32.86) + 18, ease.inOut);
  const toCore = prog(f, w(36.8), w(37.5), ease.inOut);
  const pulse = (at: number) => Math.max(0, prog(f, at, at + 4, ease.snap) - prog(f, at + 18, at + 30, ease.inOut) * 0.85);
  const hi = { wifi: pulse(w(29.76)), bt: pulse(w(30.48)), usb: pulse(w(31.14)), net: pulse(w(31.9)) };
  const press = { wifi: env(f, w(32.86), w(32.86) + 10, 3, 6) };
  const titleOut = prog(f, w(32.9), w(33.3), ease.in);
  const steps = [
    ["Needs", w(34.4)],
    ["Doing", w(35.34)],
    ["Found", w(36.3)],
  ] as const;
  // phone geometry: centre → left-small for terminal part
  const pw = kf(toCore, [0, 1], [OP_W, 360]);
  const pl = kf(toCore, [0, 1], [(W - OP_W) / 2, 70]);
  const pt = kf(toCore, [0, 1], [440, 380]) + (1 - inP) * 1100;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 80, top: 150, opacity: 1 - titleOut }}>
        <MaskLine p={prog(f, w(26.36), w(26.36) + 12)}>
          <Tag size={26}>On top</Tag>
        </MaskLine>
        <MaskLine p={prog(f, w(27.3), w(27.3) + 12)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 96, color: C.ink, marginTop: 12 }}>
          Lambda Operator
        </MaskLine>
        <MaskLine p={prog(f, w(28.44), w(28.44) + 12)} style={{ fontFamily: F.ui, fontSize: 52, color: C.grey, marginTop: 4 }}>
          the control center
        </MaskLine>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center", gap: 30, opacity: prog(f, w(33.0), w(33.4)) * (1 - prog(f, w(36.62), w(36.9), ease.in)) }}>
        {steps.map(([label, at], i) => {
          const on = f >= at;
          const p = prog(f, at, at + 8, ease.snap);
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 30 }}>
              <span
                style={{
                  fontFamily: F.display,
                  fontWeight: 600,
                  fontSize: 76,
                  color: on ? C.ink : "rgba(241,240,236,0.18)",
                  transform: `scale(${1 + 0.08 * p - 0.08 * prog(f, at + 8, at + 16)})`,
                  display: "inline-block",
                }}
              >
                {label}
              </span>
              {i < 2 && <span style={{ width: 16, height: 16, borderRadius: 8, background: "rgba(241,240,236,0.3)" }} />}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: pl, top: pt, opacity: 1 - prog(f, w(40.5), w(40.95)) }}>
        <Phone width={pw} ry={kf(f, [w(26), w(33)], [-12, 8])} rx={4} glare={kf(f, [w(26.4), w(28.4)], [0, 1])}>
          <AbsoluteFill style={{ transform: `translateX(${-toOp * 100}%)` }}>
            <OperatorHome hi={hi} press={press} tileIn={(i) => prog(f, w(26.4) + i * 3, w(26.4) + i * 3 + 14)} />
          </AbsoluteFill>
          <AbsoluteFill style={{ transform: `translateX(${(1 - toOp) * 100}%)` }}>
            <WifiOp f={f} needs={w(34.4)} doing={w(35.34)} found={w(36.3)} />
          </AbsoluteFill>
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── G · Terminal + Core ───────────────────────── */
const Core: React.FC<{ f: number }> = ({ f }) => {
  const inP = prog(f, w(36.95), w(37.6), ease.out);
  const out = prog(f, w(40.5), w(40.95), ease.in);
  const lines = [
    { at: w(37.04), txt: "$ lambda wifi capture \\", c: C.ink },
    { at: w(37.5), txt: "    --source internal \\", c: C.ink },
    { at: w(37.9), txt: "    --target LAB-NET", c: C.ink },
    { at: w(38.6), txt: "● capturing  ch 6", c: C.grey },
    { at: w(39.3), txt: "✓ handshake verified", c: C.mist },
    { at: w(39.6), txt: "✓ receipt saved", c: C.mist },
  ];
  const flow = prog(f, w(38.12), w(39.4), ease.inOut);
  const coreOn = prog(f, w(39.86), w(39.86) + 10, ease.snap);
  const dash = (f * 4) % 60;
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - out) }}>
      <div style={{ position: "absolute", left: 80, top: 150 }}>
        <Tag size={26}>Same operations</Tag>
        <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 88, color: C.ink, marginTop: 10 }}>App or terminal</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 470,
          top: 380,
          width: 540,
          height: 520,
          borderRadius: 34,
          background: "#0D0F10",
          border: `2px solid ${C.lineStrong}`,
          boxShadow: "0 40px 90px rgba(0,0,0,0.7)",
          overflow: "hidden",
          transform: `translateX(${(1 - inP) * 200}px)`,
        }}
      >
        <div style={{ height: 64, borderBottom: `2px solid ${C.line}`, display: "flex", alignItems: "center", gap: 12, padding: "0 26px" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 16, height: 16, borderRadius: 8, background: "rgba(241,240,236,0.25)" }} />
          ))}
          <span style={{ fontFamily: F.mono, fontSize: 22, color: C.grey, marginLeft: 16 }}>lambda@s10 ~</span>
        </div>
        <div style={{ padding: "26px 28px", fontFamily: F.mono, fontSize: 27, lineHeight: 1.75 }}>
          {lines.map((l, i) => {
            const p = prog(f, l.at, l.at + Math.max(4, l.txt.length * 0.5), ease.soft);
            if (f < l.at) return null;
            const isLast = i === lines.findLastIndex((x) => f >= x.at);
            return (
              <div key={i} style={{ color: l.c }}>
                <TypeOn text={l.txt} p={p} frame={f} cursor={isLast} />
              </div>
            );
          })}
        </div>
      </div>
      {/* connections */}
      <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M 250 1170 C 250 1200, 420 1160, 470 1165" stroke={C.lineStrong} strokeWidth={3} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - flow} />
        <path d="M 740 900 C 740 1000, 660 1060, 610 1100" stroke={C.lineStrong} strokeWidth={3} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - flow} />
        {flow >= 1 && (
          <>
            <path d="M 250 1170 C 250 1200, 420 1160, 470 1165" stroke={C.ink} strokeWidth={4} fill="none" strokeDasharray="10 50" strokeDashoffset={-dash} />
            <path d="M 740 900 C 740 1000, 660 1060, 610 1100" stroke={C.ink} strokeWidth={4} fill="none" strokeDasharray="10 50" strokeDashoffset={-dash} />
          </>
        )}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 540 - 85,
          top: 1080,
          width: 170,
          height: 170,
          borderRadius: 48,
          background: coreOn > 0.5 ? C.ink : "#181B1D",
          border: `3px solid ${C.ink}`,
          display: "grid",
          placeItems: "center",
          transform: `scale(${0.8 + 0.2 * prog(f, w(38.6), w(39.2), ease.snap) + 0.08 * Math.sin(coreOn * Math.PI)})`,
          boxShadow: `0 0 ${140 * coreOn}px rgba(241,240,236,${0.5 * coreOn})`,
          opacity: prog(f, w(38.6), w(39.0)),
        }}
      >
        <LambdaGlyph size={104} color={coreOn > 0.5 ? "#101112" : C.ink} />
      </div>
      <div style={{ position: "absolute", top: 1280, width: "100%", textAlign: "center", opacity: coreOn }}>
        <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 64, color: C.ink }}>Lambda Core</div>
        <div style={{ marginTop: 10 }}>
          <Tag size={22} dot={false}>Shared state · Cancellation · Receipts</Tag>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── H · Lamb ───────────────────────── */
const LambScene: React.FC<{ f: number }> = ({ f }) => {
  const at = w(42.6);
  const pop = prog(f, at, at + 16, ease.out);
  const out = prog(f, w(46.4), w(46.9), ease.in);
  const blink = env(f, at + 30, at + 36, 2, 3);
  const blink2 = env(f, w(45.0), w(45.0) + 6, 2, 3);
  const look = { x: kf(f, [w(44.2), w(44.5), w(45.4), w(45.7)], [0, -18, -18, 6]), y: 4 };
  const face = f > w(45.98) ? "success" : "main";
  const frame = prog(f, w(44.56), w(44.56) + 26, ease.inOut);
  const breathe = Math.sin(f / 12);
  const s = 0.6 + 0.4 * pop;
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Glow x="50%" y="42%" size="45%" opacity={0.14 * pop} />
      {/* phone outline drawing around Lamb */}
      <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect x={270} y={300} width={540} height={1150} rx={70} stroke={C.ink} strokeWidth={3} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - frame} opacity={0.8} />
        <circle cx={738} cy={350} r={14} fill={C.ink} opacity={frame} />
      </svg>
      {/* anticipation: "And then…" + Lamb outline drawing */}
      <div style={{ position: "absolute", top: 1080, width: "100%", textAlign: "center", opacity: env(f, w(41.04), w(42.6), 8, 4) }}>
        <MaskLine p={prog(f, w(41.04), w(41.04) + 12)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 120, color: C.ink }}>
          And then…
        </MaskLine>
      </div>
      <div style={{ position: "absolute", left: 540 - 300, top: 560, opacity: env(f, w(41.6), at + 4, 6, 4) * 0.9 }}>
        <Lamb size={600} strokeOnly={{ width: 2.2, progress: prog(f, w(41.6), at, ease.inOut) }} />
      </div>
      <div style={{ position: "absolute", left: 540 - 300, top: 560, transform: `scale(${s})`, transformOrigin: "50% 50%", opacity: pop }}>
        <Lamb size={600} face={face} blink={Math.max(blink, blink2)} look={look} breathe={breathe} />
      </div>
      <div style={{ position: "absolute", top: 1080, width: "100%", textAlign: "center" }}>
        <MaskLine p={prog(f, at + 1, at + 12)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 120, color: C.ink }}>
          Lamb
        </MaskLine>
      </div>
      <div style={{ position: "absolute", top: 1240, width: "100%", display: "flex", justifyContent: "center", gap: 18 }}>
        <Chip p={prog(f, w(43.38), w(43.38) + 10, ease.snap)}>AI assistant</Chip>
        <Chip p={prog(f, w(44.78), w(44.78) + 10, ease.snap)} strong>
          Local
        </Chip>
        <Chip p={prog(f, w(45.62), w(45.62) + 10, ease.snap)}>On-device</Chip>
      </div>
      <div style={{ position: "absolute", top: 1350, width: "100%", textAlign: "center", opacity: prog(f, w(45.9), w(46.2)) * 0.9 }}>
        <Tag size={20} dot={false} color={C.dim}>
          Research checkpoint · development paused
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── I · Open source / alpha ───────────────────────── */
const TREE = ["alpha/", "assets/", "docs/", "kernel/", "releases/", "scripts/", "README.md", "ROADMAP.md", "NOTICE.md"];
const ROAD = [
  { n: "01", t: "System foundation", s: "Implemented", k: "done" },
  { n: "02", t: "Kernel and hardware", s: "In validation", k: "wip" },
  { n: "03", t: "Core and Operator", s: "In development", k: "wip" },
  { n: "04", t: "Release", s: "Planned", k: "next" },
  { n: "05", t: "Lamb", s: "On hold", k: "hold" },
] as const;

const OpenSource: React.FC<{ f: number }> = ({ f }) => {
  const inP = prog(f, w(46.6), w(47.4), ease.out);
  const repoOut = prog(f, w(49.72), w(50.02), ease.in);
  const alphaIn = prog(f, w(50.04), w(50.04) + 8, ease.snap);
  const alphaOut = prog(f, w(51.6), w(52.0), ease.in);
  const roadIn = prog(f, w(51.74), w(52.3), ease.out);
  const roadOut = prog(f, w(54.6), w(54.84), ease.in);
  const starAt = w(54.84);
  const star = prog(f, starAt, starAt + 10, ease.snap);
  const out = prog(f, w(56.6), w(57.0), ease.in);
  const shake = alphaIn > 0 && alphaIn < 1 ? 0 : f < w(50.04) + 14 && f >= w(50.04) + 8 ? Math.sin(f * 2.4) * 6 * (1 - prog(f, w(50.04) + 8, w(50.04) + 14)) : 0;
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - out) }}>
      {/* repo */}
      <div style={{ opacity: 1 - repoOut, transform: `translateY(${-repoOut * 100}px)` }}>
        <div style={{ position: "absolute", left: 80, top: 150 }}>
          <MaskLine p={prog(f, w(47.32), w(47.32) + 12)}>
            <Tag size={26}>github.com</Tag>
          </MaskLine>
          <MaskLine p={prog(f, w(48.2), w(48.2) + 12)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 110, color: C.ink, marginTop: 10 }}>
            Open source
          </MaskLine>
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 470, borderRadius: 34, border: `2px solid ${C.lineStrong}`, background: "#0D0F10", overflow: "hidden" }}>
          <div style={{ padding: "30px 36px", borderBottom: `2px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: F.ui, fontSize: 40, color: C.ink }}>
              <span style={{ color: C.grey }}>samilososami / </span>
              <b>lambdaos</b>
            </span>
            <span style={{ fontFamily: F.mono, fontSize: 24, color: C.grey, border: `2px solid ${C.line}`, borderRadius: 999, padding: "8px 18px" }}>main</span>
          </div>
          {TREE.map((n, i) => {
            const p = prog(f, w(47.4) + i * 2, w(47.4) + i * 2 + 10);
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 22, padding: "18px 36px", borderBottom: i < TREE.length - 1 ? `1px solid ${C.line}` : "none", fontFamily: F.mono, fontSize: 30, color: C.mist, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
                {n.endsWith("/") ? <Folder size={34} strokeWidth={1.6} /> : <FileText size={34} strokeWidth={1.6} />}
                {n}
              </div>
            );
          })}
        </div>
      </div>
      {/* alpha + no build */}
      <div style={{ opacity: alphaIn * (1 - alphaOut), position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", top: 420, width: "100%", textAlign: "center", transform: `translateX(${shake}px) scale(${1.4 - 0.4 * alphaIn}) rotate(${-3 * (1 - alphaIn)}deg)` }}>
          <div style={{ display: "inline-block", border: `6px solid ${C.ink}`, borderRadius: 30, padding: "10px 60px 20px" }}>
            <span style={{ fontFamily: F.display, fontWeight: 600, fontSize: 180, color: C.ink, letterSpacing: 8 }}>ALPHA</span>
          </div>
          <div style={{ marginTop: 30 }}>
            <Tag size={28} dot={false}>LambdaOS 0.1.0-alpha.2</Tag>
          </div>
        </div>
        <div style={{ position: "absolute", top: 930, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 26, opacity: prog(f, w(50.58), w(50.58) + 10) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "30px 56px", borderRadius: 999, background: "#1A1C1E", border: `2px dashed ${C.lineStrong}`, color: C.dim, fontFamily: F.ui, fontWeight: 600, fontSize: 46 }}>
            <Download size={48} />
            <span style={{ position: "relative" }}>
              Download ROM
              <span style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 4, background: C.mist, transform: `scaleX(${prog(f, w(51.0), w(51.0) + 8, ease.inOut)})`, transformOrigin: "0 50%" }} />
            </span>
            <Lock size={40} />
          </div>
          <span style={{ fontFamily: F.ui, fontSize: 44, color: C.ink, opacity: prog(f, w(50.96), w(50.96) + 8) }}>No public build yet.</span>
        </div>
      </div>
      {/* roadmap */}
      <div style={{ opacity: roadIn * (1 - roadOut), position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", left: 80, top: 150 }}>
          <Tag size={26}>Hang tight</Tag>
          <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 96, color: C.ink, marginTop: 10 }}>In development</div>
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 430 }}>
          {ROAD.map((r, i) => {
            const p = prog(f, w(51.74) + i * 3, w(51.74) + i * 3 + 12);
            const ring = r.k === "next" ? 0.5 + 0.5 * Math.sin((f - w(53.78)) / 4) : 0;
            return (
              <div key={r.n} style={{ display: "flex", alignItems: "center", gap: 30, padding: "30px 0", borderTop: `2px solid ${C.line}`, opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
                <span style={{ fontFamily: F.mono, fontSize: 26, color: C.grey, width: 50 }}>{r.n}</span>
                <span style={{ flex: 1, fontFamily: F.ui, fontSize: 46, fontWeight: 600, color: r.k === "hold" ? C.grey : C.ink }}>{r.t}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: F.mono, fontSize: 26, color: r.k === "done" ? C.ink : C.grey, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {r.k === "done" && <Check size={32} strokeWidth={3} />}
                  {r.k === "wip" && <CircleDashed size={32} strokeWidth={2.2} />}
                  {r.k === "next" && (
                    <span style={{ width: 26, height: 26, borderRadius: 13, border: `3px solid ${C.ink}`, boxShadow: `0 0 0 ${10 * ring}px rgba(241,240,236,${0.25 * (1 - ring)})` }} />
                  )}
                  {r.k === "hold" && <CirclePause size={32} strokeWidth={2.2} />}
                  {r.s}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {/* star */}
      <div style={{ position: "absolute", inset: 0, opacity: prog(f, starAt - 4, starAt + 4) }}>
        <div style={{ position: "absolute", top: 520, width: "100%", display: "grid", placeItems: "center" }}>
          <div style={{ transform: `scale(${0.6 + 0.4 * star + 0.12 * Math.sin(star * Math.PI)}) rotate(${(1 - star) * -40}deg)` }}>
            <Star size={300} strokeWidth={1.2} color={C.ink} fill={star > 0.5 ? C.ink : "none"} />
          </div>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const r = 170 + 160 * prog(f, starAt + 2, starAt + 18, ease.out);
            const o = env(f, starAt + 2, starAt + 22, 2, 12);
            return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * r - 5, top: 150 + Math.sin(a) * r - 5, width: 10, height: 10, borderRadius: 5, background: C.ink, opacity: o }} />;
          })}
        </div>
        <div style={{ position: "absolute", top: 940, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 88, color: C.ink }}>Star the repo</div>
          <div style={{ fontFamily: F.mono, fontSize: 34, color: C.mist, marginTop: 24 }}>
            <TypeOn text="github.com/samilososami/lambdaos" p={prog(f, starAt + 6, starAt + 30, ease.soft)} frame={f} />
          </div>
          <div style={{ marginTop: 34, opacity: prog(f, w(55.72), w(55.72) + 10) }}>
            <Tag size={26}>Follow along</Tag>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── J · Outro ───────────────────────── */
const Outro: React.FC<{ f: number }> = ({ f }) => {
  const bg = prog(f, w(56.4), w(57.4), ease.out);
  const at = w(56.3);
  const tag = w(57.42);
  const fade = prog(f, t(63.8), t(65), ease.in);
  const words = ["The", "system", "for", "hacking", "systems."];
  const wt = [57.42, 57.54, 57.88, 58.22, 58.54];
  return (
    <AbsoluteFill style={{ opacity: 1 - fade }}>
      <AbsoluteFill style={{ opacity: bg * 0.55, transform: `scale(${1.12 - 0.1 * bg}) translateY(${(1 - bg) * 60}px)` }}>
        <Img src={staticFile("img/lambda-dark-s10.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 70%" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.25) 45%, rgba(8,8,8,0.9) 100%)" }} />
      <div style={{ position: "absolute", left: 110, top: 700 }}>
        <Wordmark
          width={860}
          letter={(i) => {
            const p = prog(f, at + i * 1.5, at + i * 1.5 + 14, ease.out);
            return { opacity: p, y: (1 - p) * -90, blur: (1 - p) * 14, scale: 1.2 - 0.2 * p };
          }}
        />
      </div>
      <div style={{ position: "absolute", top: 900, width: "100%", textAlign: "center", fontFamily: F.ui, fontSize: 54, color: C.mist, letterSpacing: -0.3 }}>
        {words.map((x, i) => {
          const p = prog(f, w(wt[i]), w(wt[i]) + 10);
          return (
            <span key={x} style={{ display: "inline-block", marginRight: 14, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
              {x}
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1180, width: "100%", textAlign: "center", opacity: prog(f, tag + 40, tag + 56) }}>
        <div style={{ fontFamily: F.mono, fontSize: 34, color: C.ink }}>lambdaos.samilososami.com</div>
        <div style={{ marginTop: 26, display: "flex", justifyContent: "center", gap: 34 }}>
          <Tag size={22}>Open source</Tag>
          <Tag size={22}>In development</Tag>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── Root ───────────────────────── */
const show = (f: number, a: number, b: number) => f >= a && f < b;

export const Explainer: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const gridY = -f * 0.6;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <Glow x="18%" y="8%" size="65%" opacity={0.1} />
      <DotGrid offsetY={gridY} opacity={0.14} />
      {show(f, 0, 101) && <Intro f={f} />}
      {show(f, 90, t(7.6)) && <Pentest f={f} />}
      {show(f, t(7.1), w(18.8)) && <PhoneScenes f={f} />}
      {show(f, w(18.5), w(26.5)) && <Kernel f={f} />}
      {show(f, w(25.8), w(41.0)) && <Operator f={f} />}
      {show(f, w(36.8), w(41.0)) && <Core f={f} />}
      {show(f, w(40.9), w(47.0)) && <LambScene f={f} />}
      {show(f, w(46.5), w(57.1)) && <OpenSource f={f} />}
      {show(f, w(56.2), t(65.1)) && <Outro f={f} />}
      <Captions words={words as [number, number, string][]} offset={NARR} y={1440} hideAfter={57.2} />
      <Vignette strength={0.55} />
      <Grain opacity={0.06} />
      {withAudio && <Audio src={staticFile("audio/explainer-mix.wav")} />}
      {/* deterministic tiny flicker on cuts */}
      <AbsoluteFill style={{ background: "#fff", opacity: [w(5.34), w(42.6), w(56.3)].some((c) => f === c) ? 0.08 : 0, pointerEvents: "none" }} />
      <div style={{ display: "none" }}>{rnd(f)}</div>
    </AbsoluteFill>
  );
};
