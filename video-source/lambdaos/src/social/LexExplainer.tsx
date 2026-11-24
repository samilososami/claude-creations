import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Briefcase, Cable, Cast, Cpu, Globe, HardDrive, Lock, Monitor, RefreshCw, Tv } from "lucide-react";
import { C, F, ease, env, kf, lerp, prog } from "../theme";
import { Wordmark } from "../brand/Brand";
import { Phone } from "../device/Phone";
import { LockScreen, OperatorHome } from "../ui/Screens";
import { Tag, TypeOn } from "../ui/Kinetic";
import { Cursor, DesktopChrome, LambWin, OperatorWin, TerminalWin } from "../lex/Desktop";
import { Card, Head, Mono, Outro, Scene, Shell, Status, Word, at, camera } from "./Kit";
import words from "./words-lex.json";

export const LEXX_DURATION = 1365; // 45.5 s

/* narration times (s) */
const N = {
  lex: 0.6, desktop: 1.44, lambdaos: 2.4, it: 3.78, phone: 4.26, full: 5.08, real: 6.92, taskbar: 7.82, keyboard: 8.64, mouse: 9.26,
  operator: 10.42, terminal: 10.88, lamb: 11.54, side: 12.18, big: 13.3, and: 14.38, three: 14.9, wired: 16.54, plug: 16.94, monitor: 19.02,
  wireless: 20.22, cast: 20.84, tv: 21.46, noCables: 22.74, web: 24.16, open: 24.86, browser: 25.9, becomes: 26.68, bridge: 27.12, shows: 27.66,
  everything: 28.76, runs: 29.96, bigger: 31.92, screen2: 31.2, lex2: 33.18, dev: 33.86, os: 35.64, follow: 36.8, outro: 38.46,
  tag: [39.56, 39.72, 40.1, 40.42, 40.74],
};

type Rect = { x: number; y: number; w: number; h: number };
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

/** Landscape content inside a portrait-authored Phone screen (phone rotated rz = -90). */
const Landscape: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 2280, height: 1080, transformOrigin: "0 0", transform: "translateX(1080px) rotate(90deg)", overflow: "hidden" }}>
    {children}
  </div>
);

/** 1920 × 1080 content fitted into a rect. */
const Fit: React.FC<{ r: Rect; children: React.ReactNode; radius?: number; style?: React.CSSProperties }> = ({ r, children, radius = 6, style }) => (
  <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, overflow: "hidden", borderRadius: radius, background: "#000", ...style }}>
    <div style={{ width: 1920, height: 1080, transform: `scale(${r.w / 1920}, ${r.h / 1080})`, transformOrigin: "0 0" }}>{children}</div>
  </div>
);

/** Desktop with windows opening at given frames. */
const Desk: React.FC<{ f: number; op: number; term: number; lamb?: number; dock: number; cursor?: { x: number; y: number; on: number; press?: number }; active?: number }> = ({
  f,
  op,
  term,
  lamb,
  dock,
  cursor,
  active,
}) => (
  <DesktopChrome f={f} dockIn={prog(f, dock, dock + 16)} activeApp={active ?? 0}>
    {f >= op && <OperatorWin f={f} p={prog(f, op, op + 12, ease.out)} start={op} active={active === 0} />}
    {f >= term && <TerminalWin f={f} p={prog(f, term, term + 12, ease.out)} start={term} active={active === 1} />}
    {lamb !== undefined && f >= lamb && <LambWin f={f} p={prog(f, lamb, lamb + 12, ease.out)} start={lamb} />}
    {cursor && cursor.on > 0 && (
      <div style={{ opacity: cursor.on }}>
        <Cursor x={cursor.x} y={cursor.y} press={cursor.press} />
      </div>
    )}
  </DesktopChrome>
);

/** Phone touchpad UI (landscape). */
const Touchpad: React.FC<{ label: string; icon: React.ReactNode }> = ({ label, icon }) => (
  <AbsoluteFill style={{ background: "#0C0D0E", fontFamily: F.ui, color: C.ink }}>
    <div style={{ position: "absolute", inset: 60, borderRadius: 60, border: "4px solid rgba(241,240,236,0.14)" }} />
    <div style={{ position: "absolute", left: 160, top: 300, display: "flex", alignItems: "center", gap: 70 }}>
      <span style={{ display: "flex", color: C.ink }}>{icon}</span>
      <div>
        <div style={{ fontFamily: F.mono, fontSize: 70, letterSpacing: "0.18em", color: C.grey }}>LEX</div>
        <div style={{ fontSize: 150, fontWeight: 600, marginTop: 10 }}>{label}</div>
      </div>
    </div>
  </AbsoluteFill>
);

/* ───────────── 1 · title ───────────── */
const Title: React.FC<{ f: number }> = ({ f }) => {
  const out = prog(f, at(3.25), at(3.65), ease.in);
  const line = prog(f, 4, 26, ease.inOut);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${1 + out * 0.3})`, filter: `blur(${out * 10}px)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, rgba(241,240,236,${0.08 * line}) 0%, transparent 42%)` }} />
      <div style={{ position: "absolute", top: 640, width: "100%", display: "flex", justifyContent: "center", gap: 34 }}>
        {"LEX".split("").map((ch, i) => {
          const p = prog(f, 12 + i * 5, 34 + i * 5, ease.out);
          return (
            <div key={ch} style={{ overflow: "hidden", height: 330 }}>
              <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 320, lineHeight: 1, color: C.ink, transform: `translateY(${(1 - p) * 105}%)`, letterSpacing: 0 }}>{ch}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1000, left: 540 - 310 * line, width: 620 * line, height: 3, background: C.ink, opacity: 0.85 }} />
      <div style={{ position: "absolute", top: 1046, width: "100%", textAlign: "center", opacity: prog(f, at(N.desktop) - 4, at(N.desktop) + 8) }}>
        <Tag size={30} dot={false} color={C.mist}>
          Desktop mode
        </Tag>
      </div>
      <div style={{ position: "absolute", top: 1120, width: "100%", display: "flex", justifyContent: "center", opacity: prog(f, at(N.lambdaos) - 4, at(N.lambdaos) + 8) * 0.8 }}>
        <Wordmark width={300} color={C.mist} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 2 · phone → computer ───────────── */
const S: Rect = { x: 60, y: 330, w: 960, h: 540 };
const dsk = (x: number, y: number) => ({ x: S.x + x * 0.5, y: S.y + y * 0.5 }); // desktop px → screen

const Keyboard: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ position: "absolute", left: 390, top: 1000 + (1 - p) * 60, width: 470, height: 160, opacity: p, borderRadius: 18, background: "#16181A", border: "2px solid rgba(241,240,236,0.16)", padding: 14, display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 6 }}>
    {Array.from({ length: 14 * 4 }).map((_, i) => (
      <span key={i} style={{ borderRadius: 4, background: "rgba(241,240,236,0.08)", gridColumn: i === 14 * 4 - 10 ? "span 1" : undefined }} />
    ))}
  </div>
);

const MouseShape: React.FC<{ p: number; dx: number; dy: number }> = ({ p, dx, dy }) => (
  <div style={{ position: "absolute", left: 900 + dx, top: 1015 + dy + (1 - p) * 60, width: 70, height: 110, opacity: p, borderRadius: "35px 35px 32px 32px", background: "#16181A", border: "2px solid rgba(241,240,236,0.2)" }}>
    <div style={{ position: "absolute", left: 33, top: 10, width: 4, height: 26, borderRadius: 2, background: "rgba(241,240,236,0.35)" }} />
  </div>
);

const FOCUS: { k: number; r: Rect; l: string }[] = [
  { k: N.real, r: { x: 70, y: 354, w: 940, h: 308 }, l: "Windows" },
  { k: N.taskbar, r: { x: 398, y: 808, w: 284, h: 64 }, l: "Taskbar" },
  { k: N.keyboard, r: { x: 378, y: 988, w: 494, h: 184 }, l: "Keyboard" },
  { k: N.mouse, r: { x: 888, y: 1003, w: 94, h: 134 }, l: "Mouse" },
];

const Focus: React.FC<{ f: number }> = ({ f }) => {
  let r = FOCUS[0].r;
  let label = FOCUS[0].l;
  for (let i = 1; i < FOCUS.length; i++) {
    const t = prog(f, at(FOCUS[i].k) - 4, at(FOCUS[i].k) + 8, ease.inOut);
    if (t > 0) {
      r = lerpRect(FOCUS[i - 1].r, FOCUS[i].r, t);
      if (t > 0.5) label = FOCUS[i].l;
    }
  }
  const o = env(f, at(N.real), at(N.operator) - 2, 8, 8);
  const grow = prog(f, at(N.real), at(N.real) + 10, ease.out);
  const pad = (1 - grow) * 40;
  const L = 26;
  const corner = (x: number, y: number, sx: number, sy: number) => (
    <path d={`M ${x} ${y + sy * L} L ${x} ${y} L ${x + sx * L} ${y}`} stroke={C.ink} strokeWidth={4} fill="none" />
  );
  const R = { x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2 };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {corner(R.x, R.y, 1, 1)}
        {corner(R.x + R.w, R.y, -1, 1)}
        {corner(R.x, R.y + R.h, 1, -1)}
        {corner(R.x + R.w, R.y + R.h, -1, -1)}
      </svg>
      <div style={{ position: "absolute", left: R.x, top: R.y - 54, padding: "6px 14px", borderRadius: 8, background: C.ink, color: "#0B0B0B", fontFamily: F.mono, fontSize: 24, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
};

const Setup: React.FC<{ f: number }> = ({ f }) => {
  const a = at(3.66);
  const b = at(14.45);
  const rise = prog(f, a, a + 18, ease.out);
  const rot = prog(f, at(N.phone) - 2, at(N.phone) + 18, ease.inOut);
  const lift = prog(f, at(N.full) + 2, at(N.full) + 28, ease.inOut);
  const move = prog(f, at(N.full) - 2, at(N.full) + 18, ease.inOut);
  // phone: centre & width (drops to the desk slightly ahead of the projection)
  const pw = kf(move, [0, 1], [360, 130]);
  const pcx = kf(move, [0, 1], [540, 215]);
  const pcy = kf(move, [0, 1], [940, 1080]) + (1 - rise) * 500;
  const ph = pw * (149.9 / 70.4);
  // projected screen rect: phone screen (landscape) → monitor
  const start: Rect = { x: 540 - 363, y: 940 - 172, w: 726, h: 344 };
  const r = lerpRect(start, S, lift);
  const showProj = lift > 0.001;
  const monitor = prog(lift, 0.55, 1);
  // desktop timeline
  const op = at(N.real);
  const term = at(N.real) + 6;
  const lambW = at(N.lamb);
  // cursor path (desktop px)
  const cx = kf(f, [at(N.mouse), at(N.operator), at(N.terminal), at(N.lamb), at(N.side)], [1300, 520, 1380, 1160, 1250]);
  const cy = kf(f, [at(N.mouse), at(N.operator), at(N.terminal), at(N.lamb), at(N.side)], [760, 300, 250, 720, 820]);
  const cursorOn = prog(f, at(N.mouse), at(N.mouse) + 8);
  const press = Math.max(env(f, at(N.operator) + 2, at(N.operator) + 10, 2, 4), env(f, at(N.terminal) + 2, at(N.terminal) + 10, 2, 4), env(f, at(N.lamb) - 6, at(N.lamb) + 2, 2, 4));
  const kb = prog(f, at(N.keyboard) - 6, at(N.keyboard) + 10, ease.out);
  const ms = prog(f, at(N.mouse) - 6, at(N.mouse) + 10, ease.out);
  // camera tour over the windows
  const z = 1.7;
  const focusOn = (sx: number, sy: number, s = z, ty = 800): [number, number] => [-(sx - 540) * s, ty - 960 - (sy - 960) * s];
  const o1 = focusOn(dsk(488, 356).x, dsk(488, 356).y);
  const o2 = focusOn(dsk(1416, 271).x, dsk(1416, 271).y);
  const o3 = focusOn(dsk(1180, 740).x, dsk(1180, 740).y);
  const cam = camera(f, [
    [at(N.operator) - 8, 1, 0, 0],
    [at(N.operator) + 6, z, o1[0], o1[1]],
    [at(N.terminal) - 2, z, o1[0], o1[1]],
    [at(N.terminal) + 10, z, o2[0], o2[1]],
    [at(N.lamb) - 2, z, o2[0], o2[1]],
    [at(N.lamb) + 10, z, o3[0], o3[1]],
    [at(N.lamb) + 16, z, o3[0], o3[1]],
    [at(N.side) + 10, 1, 0, 90],
    [at(N.big), 1, 0, 90],
    [at(N.big) + 24, 0.94, 0, 80],
  ]);
  const head1Out = prog(f, at(N.operator) - 10, at(N.operator) - 2, ease.in);
  const head2 = at(N.side);
  return (
    <Scene f={f} a={a} b={b} i={2} o={14}>
      <div style={{ position: "absolute", inset: 0, ...cam }}>
        {/* desk line */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 962, height: 2, background: "linear-gradient(90deg, transparent, rgba(241,240,236,0.18), transparent)", opacity: monitor }} />
        {/* monitor bezel + stand */}
        <div style={{ position: "absolute", left: S.x - 14, top: S.y - 14, width: S.w + 28, height: S.h + 28, borderRadius: 20, background: "#0A0A0B", border: "2px solid #2a2d30", opacity: monitor, boxShadow: "0 50px 120px rgba(0,0,0,0.75)" }} />
        <div style={{ position: "absolute", left: 515, top: 884, width: 50, height: 66, background: "linear-gradient(90deg,#141516,#2b2e31,#141516)", opacity: monitor }} />
        <div style={{ position: "absolute", left: 370, top: 948, width: 340, height: 14, borderRadius: 7, background: "#232527", opacity: monitor }} />
        {showProj && (
          <Fit r={r} radius={kf(lift, [0, 1], [20, 6])} style={{ boxShadow: `0 0 0 2px rgba(241,240,236,${0.5 * Math.sin(lift * Math.PI)}), 0 0 ${90 * Math.sin(lift * Math.PI)}px rgba(241,240,236,0.18)` }}>
            <Desk f={f} op={op} term={term} lamb={lambW} dock={at(N.taskbar) - 8} cursor={{ x: cx, y: cy, on: cursorOn, press }} active={f >= at(N.terminal) ? 1 : 0} />
          </Fit>
        )}
        {/* cable phone → monitor */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: monitor }}>
          <path d="M 354 1080 C 430 1080, 420 960, 520 950" stroke="rgba(241,240,236,0.35)" strokeWidth={4} fill="none" />
        </svg>
        <Keyboard p={kb} />
        <MouseShape p={ms} dx={(cx - 1300) * 0.02} dy={(cy - 760) * 0.02} />
        {/* phone */}
        <div style={{ position: "absolute", left: pcx - pw / 2, top: pcy - ph / 2, opacity: rise }}>
          <Phone width={pw} rz={-90 * rot} ry={(1 - rot) * -12} rx={(1 - rot) * 6} glare={0.5}>
            <AbsoluteFill style={{ opacity: 1 - prog(rot, 0.35, 0.6) }}>
              <LockScreen time="23:14" />
            </AbsoluteFill>
            <AbsoluteFill style={{ opacity: prog(rot, 0.35, 0.6) }}>
              <Landscape>
                {move < 0.5 ? (
                  <div style={{ position: "absolute", left: 180, top: 0, width: 1920, height: 1080 }}>
                    <Desk f={f} op={op} term={term} dock={at(N.taskbar) - 8} />
                  </div>
                ) : (
                  <Touchpad label="Touchpad" icon={<Cable size={260} strokeWidth={1.4} />} />
                )}
              </Landscape>
            </AbsoluteFill>
          </Phone>
        </div>
        <Focus f={f} />
      </div>
      <Head f={f} kicker="LEX · desktop mode" title="A full computer" tk={a + 4} tt={at(N.full) - 4} out={head1Out} />
      <Head f={f} kicker="Operator · Terminal · Lamb" title="Side by side" sub="on a big screen" tk={head2 + 4} tt={head2 + 8} ts={at(N.big) - 2} />
    </Scene>
  );
};

/* ───────────── 3 · three ways ───────────── */
const MODES = [
  { k: N.wired, n: "01", t: "Wired", d: "USB-C into any monitor", s: "USB-C → HDMI · DisplayPort", icon: <Cable size={40} strokeWidth={2} /> },
  { k: N.wireless, n: "02", t: "Wireless", d: "Cast to a smart TV or display", s: "No cables at all", icon: <Cast size={40} strokeWidth={2} /> },
  { k: N.web, n: "03", t: "Web", d: "Any browser becomes a bridge", s: "Open a link · see your phone", icon: <Globe size={40} strokeWidth={2} /> },
];
const R_MON: Rect = { x: 330, y: 560, w: 640, h: 360 };
const R_TV: Rect = { x: 270, y: 545, w: 760, h: 428 };
const R_WEB: Rect = { x: 270, y: 545, w: 760, h: 500 };

const Ways: React.FC<{ f: number }> = ({ f }) => {
  const a = at(N.and) - 4;
  const b = at(N.everything) + 2;
  const m = kf(f, [at(N.wireless) - 6, at(N.wireless) + 8, at(N.web) - 6, at(N.web) + 8], [0, 1, 1, 2]);
  const mi = m < 0.5 ? 0 : m < 1.5 ? 1 : 2;
  const r = m <= 1 ? lerpRect(R_MON, R_TV, m) : lerpRect(R_TV, R_WEB, m - 1);
  const chromeH = 62 * Math.max(0, Math.min(1, m - 1));
  const content: Rect = { x: r.x + 10, y: r.y + 10 + chromeH, w: r.w - 20, h: r.h - 20 - chromeH };
  const power =
    mi === 0 ? prog(f, at(N.monitor) - 4, at(N.monitor) + 8) : mi === 1 ? prog(f, at(N.tv) - 2, at(N.tv) + 10) : prog(f, at(N.becomes), at(N.becomes) + 12);
  const morphDip = 1 - env(f, at(N.wireless) - 8, at(N.wireless) + 10, 4, 4) - env(f, at(N.web) - 8, at(N.web) + 10, 4, 4);
  const stageIn = prog(f, at(N.wired) - 14, at(N.wired) + 4, ease.out);
  // cable (wired)
  const cable = prog(f, at(N.plug), at(N.monitor) - 2, ease.inOut);
  const cableOut = prog(f, at(N.wireless) - 8, at(N.wireless) + 4, ease.in);
  const cablePath = "M 380 1075 C 470 1075, 470 990, 560 968";
  // web url
  const url = "https://lambda.local/lex";
  const urlP = prog(f, at(N.open), at(N.browser), ease.soft);
  // phone
  const phoneP = prog(f, at(N.wired) - 12, at(N.wired) + 6, ease.out);
  const phoneLabel = ["Connected", "Casting", "Bridge on"][mi];
  const phoneIcon = [<Cable key="c" size={260} strokeWidth={1.4} />, <Cast key="t" size={260} strokeWidth={1.4} />, <Globe key="g" size={260} strokeWidth={1.4} />][mi];
  const dash = (f * 3) % 40;
  return (
    <Scene f={f} a={a} b={b} i={14} o={12}>
      <Head f={f} kicker="Connect" title="Three ways" tk={a + 2} tt={at(N.three) - 4} />
      {/* segmented control */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 360, display: "flex", gap: 16 }}>
        {MODES.map((md, i) => {
          const p = prog(f, at(N.three) + 2 + i * 4, at(N.three) + 14 + i * 4, ease.snap);
          const on = mi === i && f >= at(md.k) - 6;
          const done = f >= at(md.k) - 6;
          return (
            <div
              key={md.t}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "20px 24px",
                borderRadius: 999,
                background: on ? C.ink : "rgba(241,240,236,0.06)",
                border: `2px solid ${on ? C.ink : done ? "rgba(241,240,236,0.3)" : "rgba(241,240,236,0.12)"}`,
                color: on ? "#0B0B0B" : done ? C.ink : C.grey,
                fontFamily: F.ui,
                fontWeight: 600,
                fontSize: 34,
                opacity: p,
                transform: `translateY(${(1 - p) * 30}px) scale(${on ? 1 + 0.04 * env(f, at(md.k) - 6, at(md.k) + 10, 4, 8) : 1})`,
              }}
            >
              <span style={{ fontFamily: F.mono, fontSize: 22, opacity: 0.6 }}>{md.n}</span>
              {md.t}
            </div>
          );
        })}
      </div>
      <div style={{ opacity: stageIn }}>
        {/* screen object */}
        <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 16 + 8 * Math.min(1, m), background: "#0A0A0B", border: "2px solid #2c2f32", boxShadow: "0 40px 100px rgba(0,0,0,0.7)" }} />
        {/* stand (monitor) */}
        <div style={{ opacity: 1 - Math.min(1, m) }}>
          <div style={{ position: "absolute", left: r.x + r.w / 2 - 22, top: r.y + r.h, width: 44, height: 50, background: "linear-gradient(90deg,#141516,#2b2e31,#141516)" }} />
          <div style={{ position: "absolute", left: r.x + r.w / 2 - 140, top: r.y + r.h + 48, width: 280, height: 12, borderRadius: 6, background: "#232527" }} />
        </div>
        {/* legs (TV) */}
        <div style={{ opacity: Math.max(0, 1 - Math.abs(m - 1) * 1.6) }}>
          <div style={{ position: "absolute", left: r.x + 80, top: r.y + r.h, width: 10, height: 26, background: "#2a2d30", transform: "skewX(-14deg)" }} />
          <div style={{ position: "absolute", left: r.x + r.w - 90, top: r.y + r.h, width: 10, height: 26, background: "#2a2d30", transform: "skewX(14deg)" }} />
        </div>
        {/* browser chrome */}
        {m > 1 && (
          <div style={{ position: "absolute", left: r.x + 10, top: r.y + 10, width: r.w - 20, height: chromeH, overflow: "hidden", display: "flex", alignItems: "center", gap: 16, padding: "0 18px", borderBottom: "1px solid rgba(241,240,236,0.1)", opacity: m - 1 }}>
            <span style={{ display: "flex", gap: 8 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 13, height: 13, borderRadius: 7, background: "rgba(241,240,236,0.25)" }} />
              ))}
            </span>
            <RefreshCw size={20} color={C.grey} />
            <div style={{ flex: 1, height: 38, borderRadius: 19, background: "rgba(241,240,236,0.07)", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", fontFamily: F.mono, fontSize: 21, color: C.mist }}>
              <Lock size={16} />
              <TypeOn text={url} p={urlP} frame={f} cursor={urlP > 0 && urlP < 1} />
            </div>
          </div>
        )}
        {/* content */}
        <div style={{ position: "absolute", left: content.x, top: content.y, width: content.w, height: content.h, overflow: "hidden", borderRadius: 6, background: "#000", opacity: morphDip }}>
          <div style={{ position: "absolute", inset: 0, opacity: power, clipPath: `inset(${(1 - prog(power, 0, 0.6)) * 49.5}% 0 ${(1 - prog(power, 0, 0.6)) * 49.5}% 0)` }}>
            <Fit r={{ x: 0, y: 0, w: content.w, h: content.h }} radius={0}>
              <Desk f={f} op={at(N.wired)} term={at(N.wired) + 4} lamb={at(N.wired) + 8} dock={at(N.wired)} active={1} />
            </Fit>
          </div>
          {mi === 2 && power < 1 && urlP >= 1 && (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: 1 - power }}>
              <Mono size={22} color={C.grey}>
                Connecting to your phone…
              </Mono>
            </div>
          )}
        </div>
        {/* wired cable */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - cableOut }}>
          <path d={cablePath} stroke="rgba(241,240,236,0.7)" strokeWidth={6} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cable} />
          {cable >= 1 && <path d={cablePath} stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none" strokeDasharray="4 36" strokeDashoffset={-dash} />}
        </svg>
        {/* wireless waves */}
        {mi === 1 &&
          [0, 1, 2, 3].map((k) => {
            const t = ((f - at(N.cast) + k * 9) % 36) / 36;
            const on = f >= at(N.cast) ? 1 : 0;
            const rad = 40 + t * 300;
            const ox = 330;
            const oy = 1000;
            return (
              <svg key={k} width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: on * Math.min(1, (1 - t) * 1.4) * 0.85 }}>
                <path d={`M ${ox + Math.cos(-1.55) * rad} ${oy + Math.sin(-1.55) * rad} A ${rad} ${rad} 0 0 1 ${ox + Math.cos(-0.25) * rad} ${oy + Math.sin(-0.25) * rad}`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
              </svg>
            );
          })}
        {/* web bridge */}
        {mi === 2 && (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: prog(f, at(N.becomes) - 4, at(N.becomes) + 8) }}>
            <path id="br" d="M 250 1000 Q 255 900 330 870" stroke="rgba(241,240,236,0.5)" strokeWidth={4} fill="none" strokeDasharray="10 12" strokeDashoffset={-dash} />
            <circle cx={250} cy={1000} r={9} fill={C.ink} />
            <circle cx={330} cy={870} r={9} fill={C.ink} />
          </svg>
        )}
        {mi === 2 && (
          <div style={{ position: "absolute", left: 120, top: 860, opacity: prog(f, at(N.bridge) - 2, at(N.bridge) + 8), transform: `translateY(${(1 - prog(f, at(N.bridge) - 2, at(N.bridge) + 8)) * 14}px)` }}>
            <span style={{ padding: "6px 14px", borderRadius: 8, background: C.ink, color: "#0B0B0B", fontFamily: F.mono, fontSize: 22, letterSpacing: "0.14em" }}>BRIDGE</span>
          </div>
        )}
        {/* phone (landscape) */}
        <div style={{ position: "absolute", left: 220 - 75, top: 1075 - 160, opacity: phoneP, transform: `translateY(${(1 - phoneP) * 60}px)` }}>
          <Phone width={150} rz={-90} glare={0.4}>
            <Landscape>
              <Touchpad label={phoneLabel} icon={phoneIcon} />
            </Landscape>
          </Phone>
        </div>
        {/* mode info */}
        {MODES.map((md, i) => {
          const p = prog(f, at(md.k) - 4, at(md.k) + 10, ease.out) * (1 - prog(f, (MODES[i + 1] ? at(MODES[i + 1].k) : 99999) - 10, (MODES[i + 1] ? at(MODES[i + 1].k) : 99999) - 2, ease.in));
          if (p <= 0) return null;
          return (
            <div key={md.t} style={{ position: "absolute", left: 430, top: 1150, right: 70, opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: F.display, fontWeight: 600, fontSize: 64, color: C.ink }}>
                {md.icon}
                {md.t}
              </div>
              <div style={{ fontFamily: F.ui, fontSize: 36, color: C.mist, marginTop: 10 }}>{md.d}</div>
              <div style={{ marginTop: 14 }}>
                <Mono size={22}>{md.s}</Mono>
              </div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

/* ───────────── 4 · runs on the phone ───────────── */
const OUTS = [
  { x: 80, l: "Monitor", i: <Monitor size={50} strokeWidth={1.6} /> },
  { x: 410, l: "TV", i: <Tv size={50} strokeWidth={1.6} /> },
  { x: 740, l: "Browser", i: <Globe size={50} strokeWidth={1.6} /> },
];
const Runs: React.FC<{ f: number }> = ({ f }) => {
  const a = at(N.everything) - 2;
  const b = at(N.lex2) + 2;
  const big = prog(f, at(N.bigger) - 10, at(N.bigger) + 12, ease.inOut);
  const phone: Rect = { x: 400, y: 690, w: 280, h: 596 };
  const scr: Rect = { x: phone.x + 7, y: phone.y + 16, w: 266, h: 562 };
  const target: Rect = { x: 30, y: 470, w: 1020, h: 574 };
  const rr = lerpRect(scr, target, big);
  const dash = (f * 3) % 40;
  const chips = [
    { x: 70, y: 820, l: "Exynos 9820", i: <Cpu size={34} />, k: 0 },
    { x: 70, y: 920, l: "Kernel & tools", i: <Briefcase size={34} />, k: 1 },
    { x: 720, y: 820, l: "Your files", i: <HardDrive size={34} />, k: 2 },
    { x: 720, y: 920, l: "Your sessions", i: <Lock size={34} />, k: 3 },
  ];
  return (
    <Scene f={f} a={a} b={b}>
      <Head f={f} kicker="Under the hood" title="All on the phone" sub="The screen is just bigger." tk={a + 2} tt={at(N.runs) - 6} ts={at(N.screen2) - 4} />
      <div style={{ opacity: 1 - big }}>
        {OUTS.map((o, i) => {
          const p = prog(f, a + 6 + i * 4, a + 18 + i * 4, ease.out);
          return (
            <div key={o.l}>
              <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: p }}>
                <path d={`M ${o.x + 130} 610 C ${o.x + 130} 660, 540 640, 540 ${phone.y}`} stroke="rgba(241,240,236,0.3)" strokeWidth={3} fill="none" />
                <path d={`M ${o.x + 130} 610 C ${o.x + 130} 660, 540 640, 540 ${phone.y}`} stroke={C.ink} strokeWidth={4} fill="none" strokeDasharray="4 36" strokeDashoffset={dash} />
              </svg>
              <Card style={{ position: "absolute", left: o.x, top: 460, width: 260, height: 150, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
                {o.i}
                <Mono size={22} color={C.mist}>
                  {o.l}
                </Mono>
              </Card>
            </div>
          );
        })}
        {chips.map((c) => {
          const p = prog(f, at(N.runs) + c.k * 3, at(N.runs) + 12 + c.k * 3, ease.snap);
          return (
            <div key={c.l} style={{ position: "absolute", left: c.x, top: c.y, width: 290, display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 999, border: `2px solid ${C.line}`, background: "rgba(20,22,24,0.9)", color: C.ink, fontFamily: F.ui, fontWeight: 600, fontSize: 28, opacity: p, transform: `scale(${0.9 + 0.1 * p})` }}>
              {c.i}
              {c.l}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: phone.x, top: phone.y, opacity: 1 - big * 0.7 }}>
        <Phone width={phone.w} glare={0.5}>
          <OperatorHome />
        </Phone>
      </div>
      {big > 0 && (
        <div style={{ position: "absolute", left: rr.x, top: rr.y, width: rr.w, height: rr.h, borderRadius: kf(big, [0, 1], [30, 26]), border: `3px solid ${C.ink}`, overflow: "hidden", background: "#000", boxShadow: `0 0 ${120 * big}px rgba(241,240,236,0.18)` }}>
          <div style={{ position: "absolute", inset: 0, opacity: prog(big, 0.3, 1) }}>
            <Fit r={{ x: 0, y: (rr.h - (rr.w * 1080) / 1920) / 2, w: rr.w, h: (rr.w * 1080) / 1920 }} radius={0}>
              <Desk f={f} op={0} term={0} lamb={0} dock={0} active={0} />
            </Fit>
          </div>
        </div>
      )}
    </Scene>
  );
};

/* ───────────── root ───────────── */
export const LexExplainer: React.FC<{ withAudio?: boolean }> = ({ withAudio = false }) => {
  const f = useCurrentFrame();
  return (
    <Shell words={words as Word[]} audio="audio/lexx-mix.wav" withAudio={withAudio} hideAfter={N.outro - 0.2}>
      {f < at(3.8) && <Title f={f} />}
      <Setup f={f} />
      <Ways f={f} />
      <Runs f={f} />
      <Status f={f} a={at(N.lex2) - 2} b={at(N.outro) + 4} dev={at(N.dev)} os={at(N.os)} follow={at(N.follow)} what="LEX" />
      <Outro f={f} a={at(N.outro) - 4} end={LEXX_DURATION} lambdaos={at(N.outro)} tag={N.tag.map(at)} />
    </Shell>
  );
};
