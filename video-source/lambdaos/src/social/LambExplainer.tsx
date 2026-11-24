import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Check, CircleHelp, Cloud, CloudOff, MessageCircle, Mic, ShieldCheck, Wallet, Wifi, WifiOff, Workflow } from "lucide-react";
import { C, F, ease, env, kf, prog, rnd } from "../theme";
import { Lamb, LambFace } from "../lamb/Lamb";
import { Phone } from "../device/Phone";
import { OP, StatusBar } from "../ui/Screens";
import { MaskLine, Tag, TypeOn } from "../ui/Kinetic";
import { Card, Head, Mono, Outro, Scene, Shell, Word, at, remapN, remapper } from "./Kit";
import words from "./words-lamb.json";
import edit from "./edit-lamb.json";

export const LAMBX_DURATION = 1428; // 47.6 s

const N0 = {
  lamb: 0.34, ai: 1.28, built: 2.06, lambdaos: 2.8, lamb2: 4.66, local: 5.1, abl: 6.74, which: 7.62, unc: 8.26, refuse: 9.42, refuse2: 9.82,
  runs: 11.16, phone: 12.4, internet: 13.7, external: 14.9, data: 16.42, leaves: 17.08, completely: 18.96, free: 19.4, lamb3: 20.62, retrained: 21.18,
  adapted: 21.96, ground: 22.8, cover: 23.64, needs: 24.88, deep: 25.86, knowledge: 26.36, low: 27.24, thats: 27.88, ideal: 29.1, cyber: 29.82,
  and: 31.34, chatbot: 32.32, its: 33.2, agent: 33.54, chat: 34.54, ask: 35.24, automate: 36.38, let: 37.58, audit: 38.42,
  outro: 45.4, tag: [46.52, 46.7, 47.04, 47.38, 47.7],
};
/* the status sentence was cut from the narration: original times → edited times */
const N = remapN(N0, remapper(edit.segments));

/* ───────────── shared bits ───────────── */
const Bubble: React.FC<{ me?: boolean; p: number; children: React.ReactNode; size?: number }> = ({ me, p, children, size = 74 }) => (
  <div
    style={{
      alignSelf: me ? "flex-end" : "flex-start",
      maxWidth: "82%",
      padding: "34px 42px",
      borderRadius: me ? "56px 56px 16px 56px" : "56px 56px 56px 16px",
      background: me ? C.ink : OP.tile,
      color: me ? "#0B0B0B" : C.ink,
      fontSize: size,
      lineHeight: 1.25,
      opacity: p,
      transform: `translateY(${(1 - p) * 40}px)`,
    }}
  >
    {children}
  </div>
);

/** Lamb app screen, authored at 1080 × 2280. */
const LambScreen: React.FC<{ f: number; face?: LambFace; children?: React.ReactNode; big?: boolean }> = ({ f, face = "main", children, big }) => (
  <AbsoluteFill style={{ background: OP.bg, fontFamily: F.ui, color: C.ink }}>
    <StatusBar time="23:14" />
    <div style={{ position: "absolute", left: 56, top: 150, display: "flex", alignItems: "center", gap: 30 }}>
      <Lamb size={150} face={face} blink={env(f % 110, 96, 104, 2, 3)} />
      <div>
        <div style={{ fontSize: 76, fontWeight: 600 }}>Lamb</div>
        <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: "0.14em", color: C.grey, marginTop: 4 }}>ON-DEVICE · OFFLINE</div>
      </div>
    </div>
    {big && (
      <div style={{ position: "absolute", top: 640, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 60 }}>
        <Lamb size={620} face={face} blink={env(f % 90, 70, 78, 2, 3)} breathe={Math.sin(f / 14)} />
        <div style={{ fontSize: 70, color: C.mist }}>How can I help?</div>
      </div>
    )}
    <div style={{ position: "absolute", left: 50, right: 50, top: 420, display: "flex", flexDirection: "column", gap: 36 }}>{children}</div>
    <div style={{ position: "absolute", left: 50, right: 50, bottom: 90, height: 150, borderRadius: 75, background: OP.tile, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 56px", fontSize: 56, color: C.grey }}>
      Ask Lamb…
      <Mic size={64} />
    </div>
  </AbsoluteFill>
);

/* ───────────── 1 · meet ───────────── */
const Meet: React.FC<{ f: number }> = ({ f }) => {
  const pop = prog(f, at(N.lamb) - 6, at(N.lamb) + 12, ease.out);
  const out = prog(f, at(4.3), at(4.62), ease.in);
  const look = { x: kf(f, [70, 80, 110, 120], [0, -16, -16, 8]), y: 4 };
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 80}px)`, filter: `blur(${out * 10}px)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 36%, rgba(241,240,236,${0.1 * pop}) 0%, transparent 40%)` }} />
      <div style={{ position: "absolute", left: 540 - 290, top: 360, opacity: 1 - pop }}>
        <Lamb size={580} strokeOnly={{ width: 2.4, progress: prog(f, 0, at(N.lamb) - 2, ease.inOut) }} />
      </div>
      <div style={{ position: "absolute", left: 540 - 290, top: 360, opacity: pop, transform: `scale(${0.85 + 0.15 * pop})`, transformOrigin: "50% 60%" }}>
        <Lamb size={580} face={f > at(N.lambdaos) ? "success" : "main"} blink={Math.max(env(f, 60, 66, 2, 3), env(f, 108, 114, 2, 3))} look={look} breathe={Math.sin(f / 12)} />
      </div>
      <div style={{ position: "absolute", top: 880, width: "100%", textAlign: "center" }}>
        <MaskLine p={prog(f, at(N.lamb) - 2, at(N.lamb) + 12)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 170, color: C.ink, lineHeight: 1.05 }}>
          Lamb
        </MaskLine>
      </div>
      <div style={{ position: "absolute", top: 1110, width: "100%", display: "flex", justifyContent: "center", gap: 16 }}>
        {["AI agent", "Built into LambdaOS"].map((t, i) => {
          const p = prog(f, at(i ? N.built : N.ai) - 2, at(i ? N.built : N.ai) + 10, ease.snap);
          return (
            <span key={t} style={{ padding: "16px 30px", borderRadius: 999, border: `2px solid ${i ? C.ink : C.lineStrong}`, background: i ? C.ink : "rgba(241,240,236,0.06)", color: i ? "#0B0B0B" : C.ink, fontFamily: F.ui, fontWeight: 600, fontSize: 36, opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>
              {t}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 2 · local + abliterated ───────────── */
const SLABS = 6;
const Model: React.FC<{ f: number }> = ({ f }) => {
  const a = at(4.4);
  const b = at(10.85);
  const cut = prog(f, at(N.abl) - 2, at(N.abl) + 16, ease.inOut);
  const line = prog(f, at(N.local) + 6, at(N.local) + 26, ease.inOut);
  const cx = 540;
  const y0 = 500;
  const gap = 64;
  const hw = 260;
  const hh = 112;
  const lineTop = y0 - 70;
  const lineBot = y0 + (SLABS - 1) * gap + 70;
  const ghost = prog(f, at(N.refuse) - 2, at(N.refuse) + 8);
  const strike = prog(f, at(N.refuse) + 4, at(N.refuse) + 12, ease.inOut);
  const real = prog(f, at(N.refuse2) - 2, at(N.refuse2) + 8);
  return (
    <Scene f={f} a={a} b={b}>
      <div style={{ position: "absolute", left: 80, top: 150 }}>
        <MaskLine p={prog(f, a + 4, a + 16)}>
          <Tag size={26}>The model</Tag>
        </MaskLine>
        <div style={{ display: "flex", gap: 26, marginTop: 12 }}>
          <MaskLine p={prog(f, at(N.local) - 4, at(N.local) + 8)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 92, color: C.ink }}>
            Local.
          </MaskLine>
          <MaskLine p={prog(f, at(N.abl) - 2, at(N.abl) + 10)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 92, color: C.ink }}>
            Abliterated.
          </MaskLine>
        </div>
      </div>
      {/* layer stack */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: SLABS })
          .map((_, i) => SLABS - 1 - i)
          .map((i) => {
            const p = prog(f, a + 4 + (SLABS - 1 - i) * 3, a + 18 + (SLABS - 1 - i) * 3, ease.out);
            const y = y0 + i * gap - (1 - p) * 80;
            const flash = env(f, at(N.abl) + i * 2, at(N.abl) + 14 + i * 2, 3, 10);
            return (
              <g key={i} opacity={p}>
                <path
                  d={`M ${cx} ${y - hh} L ${cx + hw} ${y} L ${cx} ${y + hh} L ${cx - hw} ${y} Z`}
                  fill={`rgba(${28 + flash * 60},${31 + flash * 60},${34 + flash * 60},0.92)`}
                  stroke={`rgba(241,240,236,${0.28 + flash * 0.5})`}
                  strokeWidth={2}
                />
                <path d={`M ${cx - hw} ${y} L ${cx} ${y + hh} L ${cx + hw} ${y} L ${cx + hw} ${y + 12} L ${cx} ${y + hh + 12} L ${cx - hw} ${y + 12} Z`} fill="rgba(10,10,11,0.9)" />
              </g>
            );
          })}
        {/* refusal direction */}
        <line x1={cx} y1={lineTop + (lineBot - lineTop) * cut} x2={cx} y2={lineTop + (lineBot - lineTop) * line} stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={0.95} />
        {Array.from({ length: SLABS }).map((_, i) => {
          const y = y0 + i * gap;
          const vis = line * (y < lineTop + (lineBot - lineTop) * line ? 1 : 0) * (1 - prog(cut, (y - lineTop) / (lineBot - lineTop) - 0.05, (y - lineTop) / (lineBot - lineTop) + 0.05));
          return <circle key={i} cx={cx} cy={y} r={11} fill={C.ink} opacity={vis} />;
        })}
        {cut > 0 && cut < 1 && <circle cx={cx} cy={lineTop + (lineBot - lineTop) * cut} r={26} fill={C.ink} opacity={0.5} style={{ filter: "blur(8px)" }} />}
        {/* label */}
        <line x1={cx + 14} y1={y0 + 40} x2={cx + 200} y2={y0 - 40} stroke={C.ink} strokeOpacity={0.5 * prog(f, at(N.local) + 18, at(N.local) + 28)} strokeWidth={2} />
      </svg>
      <div style={{ position: "absolute", left: cx + 196, top: y0 - 74, opacity: prog(f, at(N.local) + 18, at(N.local) + 28) }}>
        <span style={{ position: "relative", fontFamily: F.mono, fontSize: 22, color: C.mist, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          refusal direction
          <span style={{ position: "absolute", left: -6, right: -6, top: "50%", height: 3, background: C.ink, transform: `scaleX(${prog(f, at(N.abl) + 6, at(N.abl) + 16, ease.inOut)})`, transformOrigin: "0 50%" }} />
        </span>
        <div style={{ marginTop: 6, opacity: prog(f, at(N.abl) + 14, at(N.abl) + 24) }}>
          <Mono size={22} color={C.ink}>
            removed
          </Mono>
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 470, display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { t: "On-device", k: N.local },
          { t: "Uncensored", k: N.unc, strong: true },
        ].map((c) => {
          const p = prog(f, at(c.k) - 2, at(c.k) + 10, ease.snap);
          return (
            <span key={c.t} style={{ alignSelf: "flex-start", padding: "12px 24px", borderRadius: 999, border: `2px solid ${c.strong ? C.ink : C.lineStrong}`, background: c.strong ? C.ink : "rgba(20,22,24,0.9)", color: c.strong ? "#0B0B0B" : C.ink, fontFamily: F.ui, fontWeight: 600, fontSize: 30, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: "0 50%" }}>
              {c.t}
            </span>
          );
        })}
      </div>
      {/* doesn't refuse */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1000, display: "flex", flexDirection: "column", gap: 18, fontFamily: F.ui }}>
        <div style={{ alignSelf: "flex-end", padding: "20px 30px", borderRadius: "34px 34px 10px 34px", background: C.ink, color: "#0B0B0B", fontSize: 36, opacity: prog(f, at(N.unc) + 4, at(N.unc) + 12), transform: `translateY(${(1 - prog(f, at(N.unc) + 4, at(N.unc) + 12)) * 20}px)` }}>
          Audit my own network.
        </div>
        <div style={{ position: "relative", height: 90 }}>
          <div style={{ position: "absolute", left: 0, top: 0, padding: "20px 30px", borderRadius: "34px 34px 34px 10px", background: "#1C1F22", color: C.grey, fontSize: 36, opacity: ghost * (1 - real) }}>
            <span style={{ position: "relative" }}>
              I can’t help with that.
              <span style={{ position: "absolute", left: -4, right: -4, top: "52%", height: 3, background: C.ink, transform: `scaleX(${strike})`, transformOrigin: "0 50%" }} />
            </span>
          </div>
          <div style={{ position: "absolute", left: 0, top: 0, padding: "20px 30px", borderRadius: "34px 34px 34px 10px", background: "#24282C", border: `2px solid ${C.lineStrong}`, color: C.ink, fontSize: 36, opacity: real }}>
            <TypeOn text="Sure. Starting with a scan." p={prog(f, at(N.refuse2), at(N.refuse2) + 22, ease.soft)} frame={f} cursor={false} />
          </div>
        </div>
      </div>
    </Scene>
  );
};

/* ───────────── 3 · benefits ───────────── */
const reflect = (x: number, lo: number, hi: number) => {
  const L = hi - lo;
  const p = (((x - lo) % (2 * L)) + 2 * L) % (2 * L);
  return lo + (p > L ? 2 * L - p : p);
};
const Benefits: React.FC<{ f: number }> = ({ f }) => {
  const a = at(10.85);
  const b = at(N.lamb3) - 2;
  const ph = { x: 390, y: 420, w: 300, h: 639 };
  const cards = [
    { k: N.internet, i: <WifiOff size={44} />, t: "No internet", s: "Works offline" },
    { k: N.external, i: <CloudOff size={44} />, t: "No providers", s: "No API, no account" },
    { k: N.data, i: <ShieldCheck size={44} />, t: "Data stays", s: "Never leaves the device" },
    { k: N.completely, i: <Wallet size={44} />, t: "Free", s: "$0, forever local" },
  ];
  const wifiCut = prog(f, at(N.internet) - 2, at(N.internet) + 8, ease.inOut);
  const cloudCut = prog(f, at(N.external) - 2, at(N.external) + 8, ease.inOut);
  const shield = env(f, at(N.data) - 2, at(N.completely) + 4, 8, 10);
  const t = f - at(N.data);
  return (
    <Scene f={f} a={a} b={b}>
      <Head f={f} kicker="On-device" title="Runs on the phone" tk={a + 2} tt={at(N.runs) - 4} size={88} />
      {/* side links */}
      {[
        { x: 150, cut: wifiCut, on: <Wifi size={70} strokeWidth={1.6} />, off: <WifiOff size={70} strokeWidth={1.6} />, l: "Internet", k: N.internet },
        { x: 930, cut: cloudCut, on: <Cloud size={70} strokeWidth={1.6} />, off: <CloudOff size={70} strokeWidth={1.6} />, l: "Cloud AI", k: N.external },
      ].map((s, i) => {
        const p = prog(f, a + 10 + i * 4, a + 22 + i * 4);
        const x2 = i ? ph.x + ph.w + 10 : ph.x - 10;
        return (
          <React.Fragment key={s.l}>
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: p }}>
              <line x1={i ? s.x - 60 : s.x + 60} y1={700} x2={x2} y2={700} stroke={C.ink} strokeOpacity={0.4 * (1 - s.cut)} strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={i ? f * 2 : -f * 2} />
              <line x1={(s.x + x2) / 2 - 22} y1={678} x2={(s.x + x2) / 2 + 22} y2={722} stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={s.cut} />
              <line x1={(s.x + x2) / 2 + 22} y1={678} x2={(s.x + x2) / 2 - 22} y2={722} stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={s.cut} />
            </svg>
            <div style={{ position: "absolute", left: s.x - 60, top: 640, width: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: p, color: s.cut > 0.5 ? C.grey : C.ink }}>
              {s.cut > 0.5 ? s.off : s.on}
              <Mono size={20}>{s.l}</Mono>
            </div>
          </React.Fragment>
        );
      })}
      {/* phone */}
      <div style={{ position: "absolute", left: ph.x, top: ph.y, opacity: prog(f, a + 4, a + 16), transform: `translateY(${(1 - prog(f, a + 4, a + 20, ease.out)) * 80}px)` }}>
        <Phone width={ph.w} glare={0.5}>
          <LambScreen f={f} face={f > at(N.completely) ? "success" : "main"} big />
        </Phone>
      </div>
      {/* data stays inside */}
      <div style={{ position: "absolute", left: ph.x - 12, top: ph.y - 12, width: ph.w + 24, height: ph.h + 24, borderRadius: 48, border: `3px solid rgba(241,240,236,${0.8 * shield})`, boxShadow: `0 0 ${60 * shield}px rgba(241,240,236,${0.25 * shield})` }} />
      {shield > 0 &&
        Array.from({ length: 16 }).map((_, i) => {
          const vx = (rnd(i * 3.1) - 0.5) * 22;
          const vy = (rnd(i * 5.7) - 0.5) * 22;
          const x = reflect(ph.x + 30 + rnd(i * 1.3) * (ph.w - 60) + vx * t, ph.x + 14, ph.x + ph.w - 14);
          const y = reflect(ph.y + 40 + rnd(i * 2.9) * (ph.h - 80) + vy * t, ph.y + 14, ph.y + ph.h - 14);
          return <div key={i} style={{ position: "absolute", left: x - 6, top: y - 6, width: 12, height: 12, borderRadius: 6, background: C.ink, opacity: shield * 0.9, boxShadow: "0 0 12px rgba(241,240,236,0.8)" }} />;
        })}
      {/* benefit cards */}
      <div style={{ position: "absolute", left: 70, right: 70, top: 1100, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {cards.map((c) => {
          const p = prog(f, at(c.k) - 4, at(c.k) + 8, ease.snap);
          const hi = env(f, at(c.k) - 4, at(c.k) + 30, 4, 14);
          return (
            <Card key={c.t} hi={hi * 0.8} style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 24px", opacity: 0.15 + 0.85 * p, transform: `translateY(${(1 - p) * 30}px)` }}>
              <span style={{ display: "flex" }}>{c.i}</span>
              <div>
                <div style={{ fontSize: 36, fontWeight: 600 }}>{c.t}</div>
                <div style={{ fontSize: 22, color: C.grey, marginTop: 2 }}>{c.s}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </Scene>
  );
};

/* ───────────── 4 · retrained ───────────── */
const RING = ["Operator", "Terminal", "Wi-Fi", "Bluetooth", "USB", "Radio", "Network", "Kernel"];
const Retrained: React.FC<{ f: number }> = ({ f }) => {
  const a = at(N.lamb3) - 4;
  const b = at(N.deep) - 2;
  const draw = prog(f, at(N.retrained) - 4, at(N.ground) + 6, ease.inOut);
  const pts = Array.from({ length: 41 }).map((_, i) => {
    const x = i / 40;
    const y = 0.12 + 0.78 * Math.exp(-x * 3.6) + 0.035 * Math.sin(i * 1.9) * (1 - x);
    return [120 + x * 760, 520 + (1 - y) * 240] as const;
  });
  const n = Math.max(2, Math.round(draw * 40) + 1);
  const d = pts.slice(0, n).map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const ring = prog(f, at(N.cover) - 4, at(N.cover) + 14, ease.out);
  const cx = 540;
  const cy = 1090;
  return (
    <Scene f={f} a={a} b={b}>
      <Head f={f} kicker="Trained for LambdaOS" title="Retrained, adapted" tk={a + 4} tt={at(N.retrained) - 4} size={88} />
      {/* chart */}
      <Card style={{ position: "absolute", left: 80, top: 420, width: 920, height: 360, opacity: prog(f, a + 6, a + 18) }}>
        <div style={{ position: "absolute", left: 30, top: 24, right: 30, display: "flex", justifyContent: "space-between" }}>
          <Mono size={22}>Fine-tuning · loss</Mono>
          <Mono size={22} color={C.ink}>{`epoch ${Math.min(3, 1 + Math.floor(draw * 3))}/3`}</Mono>
        </div>
        <svg width={920} height={360} style={{ position: "absolute", left: 0, top: 0 }} viewBox="80 420 920 360">
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={120} x2={880} y1={530 + i * 60} y2={530 + i * 60} stroke="rgba(241,240,236,0.08)" strokeWidth={2} />
          ))}
          <path d={d} stroke={C.ink} strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {draw > 0 && <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r={10} fill={C.ink} />}
        </svg>
        <div style={{ position: "absolute", left: 30, bottom: 20 }}>
          <Mono size={20}>Steps</Mono>
        </div>
      </Card>
      {/* ring */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: ring }}>
        {RING.map((_, i) => {
          const ang = (i / RING.length) * Math.PI * 2 - Math.PI / 2;
          const lp = prog(f, at(N.cover) + i * 2, at(N.cover) + 14 + i * 2, ease.inOut);
          const x2 = cx + Math.cos(ang) * 360 * ring;
          const y2 = cy + Math.sin(ang) * 230 * ring;
          return <line key={i} x1={cx} y1={cy} x2={cx + (x2 - cx) * lp} y2={cy + (y2 - cy) * lp} stroke={C.ink} strokeOpacity={0.3} strokeWidth={2} />;
        })}
      </svg>
      {RING.map((l, i) => {
        const ang = (i / RING.length) * Math.PI * 2 - Math.PI / 2;
        const p = prog(f, at(N.cover) + i * 2, at(N.cover) + 12 + i * 2, ease.snap);
        const lit = f >= at(N.needs) - 4;
        return (
          <span
            key={l}
            style={{
              position: "absolute",
              left: cx + Math.cos(ang) * 360 * ring,
              top: cy + Math.sin(ang) * 230 * ring,
              transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * p})`,
              padding: "12px 22px",
              borderRadius: 999,
              border: `2px solid ${lit ? C.ink : C.lineStrong}`,
              background: lit ? C.ink : "rgba(20,22,24,0.95)",
              color: lit ? "#0B0B0B" : C.ink,
              fontFamily: F.ui,
              fontWeight: 600,
              fontSize: 28,
              opacity: p,
              whiteSpace: "nowrap",
            }}
          >
            {l}
          </span>
        );
      })}
      <div style={{ position: "absolute", left: cx - 110, top: cy - 87, opacity: ring, transform: `scale(${0.7 + 0.3 * ring})` }}>
        <Lamb size={220} face="focused" blink={env(f, at(N.needs), at(N.needs) + 6, 2, 3)} />
      </div>
    </Scene>
  );
};

/* ───────────── 5 · security profile ───────────── */
const Meter: React.FC<{ f: number; label: string; value: string; from: number; to: number; a: number; dim?: boolean }> = ({ f, label, value, from, to, a, dim }) => {
  const p = prog(f, a, a + 20, ease.inOut);
  const n = Math.round(from + (to - from) * p);
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <Mono size={26} color={C.mist}>
          {label}
        </Mono>
        <span style={{ fontFamily: F.display, fontWeight: 600, fontSize: 52, opacity: prog(f, a + 10, a + 20) }}>{value}</span>
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} style={{ flex: 1, height: 54, borderRadius: 6, background: i < n ? (dim ? C.grey : C.ink) : "rgba(241,240,236,0.08)" }} />
        ))}
      </div>
    </div>
  );
};
const Profile: React.FC<{ f: number }> = ({ f }) => {
  const a = at(N.deep) - 4;
  const b = at(N.and) - 1;
  const v = prog(f, at(N.ideal) - 6, at(N.ideal) + 10, ease.out);
  return (
    <Scene f={f} a={a} b={b}>
      <Head f={f} kicker="Security profile" title="Knows a lot" sub="refuses little" tk={a + 2} tt={at(N.knowledge) - 4} ts={at(N.low) - 2} size={88} />
      <Card style={{ position: "absolute", left: 80, right: 80, top: 470, padding: "46px 44px 10px" }}>
        <Meter f={f} label="Security knowledge" value="Deep" from={0} to={22} a={at(N.deep) - 2} />
        <Meter f={f} label="Restrictions" value="Low" from={24} to={3} a={at(N.low) - 2} dim />
      </Card>
      <Card hi={env(f, at(N.ideal) - 4, at(N.and), 10, 6) * 0.6} style={{ position: "absolute", left: 80, right: 80, top: 920, height: 400, opacity: v, transform: `translateY(${(1 - v) * 50}px)`, display: "flex", alignItems: "center", gap: 36, padding: "0 50px" }}>
        <Lamb size={230} face="focused" blink={env(f, at(N.cyber) + 10, at(N.cyber) + 16, 2, 3)} />
        <div>
          <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 62, lineHeight: 1.05 }}>
            Ideal for
            <br />
            cybersecurity
          </div>
          <div style={{ marginTop: 18 }}>
            <Tag size={20}>For authorized testing</Tag>
          </div>
        </div>
      </Card>
    </Scene>
  );
};

/* ───────────── 6 · agent ───────────── */
const CAPS = [
  { k: N.chat, i: <MessageCircle size={42} />, t: "Chat", s: "Talk it through" },
  { k: N.ask, i: <CircleHelp size={42} />, t: "Ask", s: "Answers on the spot" },
  { k: N.automate, i: <Workflow size={42} />, t: "Automate", s: "Tasks on a schedule" },
  { k: N.let, i: <ShieldCheck size={42} />, t: "Audit", s: "Full audits, step by step" },
];
const STEPS = ["Discover hosts", "Scan services", "Check Wi-Fi", "Write report"];
const Agent: React.FC<{ f: number }> = ({ f }) => {
  const a = at(N.and) - 2;
  const b = at(N.outro) - 2;
  const swap = prog(f, at(N.its) - 6, at(N.its) + 2, ease.in);
  const strike = prog(f, at(N.chatbot) + 2, at(N.chatbot) + 12, ease.inOut);
  let mode = -1;
  CAPS.forEach((c, i) => {
    if (f >= at(c.k) - 4) mode = i;
  });
  const since = mode >= 0 ? at(CAPS[mode].k) - 4 : 0;
  const mp = prog(f, since, since + 10, ease.out);
  const phoneIn = prog(f, at(N.and) + 6, at(N.and) + 24, ease.out);
  const face: LambFace = mode === 3 ? "focused" : mode === 2 ? "reassuring" : mode === 1 ? "curious" : "main";
  return (
    <Scene f={f} a={a} b={b}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 150 }}>
        <MaskLine p={prog(f, a + 8, a + 20)} out={swap}>
          <Tag size={26}>Lamb is</Tag>
        </MaskLine>
        <MaskLine p={prog(f, at(N.and) + 6, at(N.and) + 18)} out={swap} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 88, color: C.ink, marginTop: 12 }}>
          Not just a{" "}
          <span style={{ position: "relative", color: strike > 0.5 ? C.grey : C.ink }}>
            chatbot
            <span style={{ position: "absolute", left: -6, right: -6, top: "54%", height: 8, background: C.ink, transform: `scaleX(${strike})`, transformOrigin: "0 50%" }} />
          </span>
        </MaskLine>
      </div>
      <Head f={f} kicker="Lamb is" title="An agent." tk={at(N.its) - 2} tt={at(N.agent) - 4} size={88} />
      {/* phone */}
      <div style={{ position: "absolute", left: 60, top: 400, opacity: phoneIn, transform: `translateX(${(1 - phoneIn) * -80}px)` }}>
        <Phone width={420} ry={12} rx={3} glare={0.6}>
          <LambScreen f={f} face={face} big={mode < 0}>
            {mode === 0 && (
              <>
                <Bubble me p={mp}>
                  Hey Lamb, what’s on LAB-NET?
                </Bubble>
                <Bubble p={prog(f, since + 8, since + 16)}>6 devices. Want a map?</Bubble>
              </>
            )}
            {mode === 1 && (
              <>
                <Bubble me p={mp}>
                  What is WPA3-SAE?
                </Bubble>
                <Bubble p={prog(f, since + 8, since + 16)}>A handshake built to resist offline guessing.</Bubble>
              </>
            )}
            {mode === 2 && (
              <>
                <Bubble me p={mp}>
                  Scan LAB-NET every night.
                </Bubble>
                <Bubble p={prog(f, since + 8, since + 16)}>
                  <span style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <Check size={60} strokeWidth={3} /> Scheduled · 02:00
                  </span>
                </Bubble>
              </>
            )}
            {mode === 3 && (
              <>
                <Bubble me p={mp}>
                  Audit LAB-NET.
                </Bubble>
                <div style={{ padding: "36px 42px", borderRadius: 56, background: OP.tile, opacity: prog(f, since + 6, since + 14) }}>
                  {STEPS.map((s, i) => {
                    const done = f >= at(N.audit) + i * 9;
                    const cur = !done && f >= at(N.audit) + (i - 1) * 9;
                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 60, padding: "16px 0", color: done ? C.ink : C.grey }}>
                        <span style={{ width: 70, height: 70, borderRadius: 35, display: "grid", placeItems: "center", background: done ? C.ink : "transparent", border: `5px solid ${done ? C.ink : cur ? C.mist : "rgba(241,240,236,0.2)"}` }}>
                          {done && <Check size={44} color="#111" strokeWidth={3.4} />}
                        </span>
                        {s}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </LambScreen>
        </Phone>
      </div>
      {/* capabilities */}
      <div style={{ position: "absolute", left: 530, right: 60, top: 430, display: "flex", flexDirection: "column", gap: 22 }}>
        {CAPS.map((c, i) => {
          const p = prog(f, at(N.agent) + i * 3, at(N.agent) + 12 + i * 3, ease.out);
          const on = mode === i;
          const done = mode > i;
          return (
            <div
              key={c.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "26px 28px",
                borderRadius: 30,
                background: on ? C.ink : "rgba(20,22,24,0.92)",
                border: `2px solid ${on ? C.ink : done ? "rgba(241,240,236,0.3)" : C.line}`,
                color: on ? "#0B0B0B" : C.ink,
                opacity: p * (on || done ? 1 : mode < 0 ? 1 : 0.55),
                transform: `translateX(${(1 - p) * 50}px) scale(${on ? 1 + 0.03 * env(f, at(c.k) - 4, at(c.k) + 12, 4, 8) : 1})`,
                fontFamily: F.ui,
              }}
            >
              {c.i}
              <div>
                <div style={{ fontSize: 40, fontWeight: 600 }}>{c.t}</div>
                <div style={{ fontSize: 24, color: on ? "#333" : C.grey, marginTop: 2 }}>{c.s}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

export const LambExplainer: React.FC<{ withAudio?: boolean }> = ({ withAudio = false }) => {
  const f = useCurrentFrame();
  return (
    <Shell words={words as Word[]} audio="audio/lambx-mix.wav" withAudio={withAudio} hideAfter={N.outro - 0.2}>
      {f < at(4.7) && <Meet f={f} />}
      <Model f={f} />
      <Benefits f={f} />
      <Retrained f={f} />
      <Profile f={f} />
      <Agent f={f} />
      <Outro f={f} a={at(N.outro) - 4} end={LAMBX_DURATION} lambdaos={at(N.outro)} tag={N.tag.map(at)} />
    </Shell>
  );
};
