import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ArrowLeft, Check, FileCheck2, Fingerprint, Lock, ShieldCheck, Wifi } from "lucide-react";
import { C, F, ease, env, kf, prog } from "../theme";
import { DotGrid, Glow, Grain, Vignette } from "../fx/Fx";
import { Wordmark } from "../brand/Brand";
import { Phone } from "../device/Phone";
import { OP, OperatorHome, StatusBar } from "../ui/Screens";
import { MaskLine, Tag } from "../ui/Kinetic";

export const OPFLOW_DURATION = 22 * 30;

const T = {
  title: 6,
  phone: 56,
  tap: 118,
  list: 132,
  pick: 226,
  target: 240,
  hold: 300,
  holdEnd: 334,
  cap: 336,
  capDone: 450,
  verify: 462,
  verDone: 520,
  receipt: 530,
  end: 600,
};

const WORDS: [number, string][] = [
  [T.list, "Scan."],
  [T.target, "Target."],
  [T.hold, "Confirm."],
  [T.cap, "Capture."],
  [T.verify, "Verify."],
  [T.receipt, "Receipt."],
];

const NETS = [
  { s: "LAB-NET", ch: 6, sig: 4, mine: true },
  { s: "••••••••", ch: 11, sig: 3 },
  { s: "••••••", ch: 1, sig: 3 },
  { s: "•••••••••", ch: 6, sig: 2 },
  { s: "•••••", ch: 36, sig: 1 },
];

const Radar: React.FC<{ f: number; size: number }> = ({ f, size }) => {
  const a = (f * 6) % 360;
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200">
      {[30, 55, 80].map((r) => (
        <circle key={r} r={r} fill="none" stroke="rgba(241,240,236,0.16)" strokeWidth={1} />
      ))}
      <line x1={-95} y1={0} x2={95} y2={0} stroke="rgba(241,240,236,0.08)" />
      <line x1={0} y1={-95} x2={0} y2={95} stroke="rgba(241,240,236,0.08)" />
      <path d={`M0 0 L ${80 * Math.cos(((a - 40) * Math.PI) / 180)} ${80 * Math.sin(((a - 40) * Math.PI) / 180)} A 80 80 0 0 1 ${80 * Math.cos((a * Math.PI) / 180)} ${80 * Math.sin((a * Math.PI) / 180)} Z`} fill="rgba(241,240,236,0.12)" />
      <line x1={0} y1={0} x2={80 * Math.cos((a * Math.PI) / 180)} y2={80 * Math.sin((a * Math.PI) / 180)} stroke={C.ink} strokeWidth={1.5} />
      {[
        [40, -30],
        [-50, 20],
        [20, 55],
        [-25, -60],
        [65, 30],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 0 ? 5 : 3.2} fill={C.ink} opacity={i === 0 ? 1 : 0.55} />
      ))}
    </svg>
  );
};

const Screen: React.FC<{ f: number }> = ({ f }) => {
  const toList = prog(f, T.tap + 4, T.tap + 18, ease.inOut);
  const toTarget = prog(f, T.pick + 6, T.target + 6, ease.inOut);
  const toReceipt = prog(f, T.receipt, T.receipt + 16, ease.out);
  const holdP = prog(f, T.hold, T.holdEnd, (x) => x);
  const capP = prog(f, T.cap, T.capDone, (x) => x);
  const verP = prog(f, T.verify, T.verDone, ease.inOut);
  const ringR = 300;
  const circ = 2 * Math.PI * ringR;
  const running = f >= T.cap && f < T.capDone;
  const btnLabel = f < T.hold ? "Hold to capture" : f < T.cap ? "Confirming…" : f < T.capDone ? "Capturing" : f < T.verDone ? "Verifying" : "Verified";
  const ring = f < T.cap ? holdP : f < T.capDone ? capP : f < T.verify ? 1 : verP;
  const pressed = f >= T.hold && f < T.holdEnd + 4;
  return (
    <AbsoluteFill style={{ background: OP.bg, fontFamily: F.ui, color: C.ink, overflow: "hidden" }}>
      {/* home */}
      <AbsoluteFill style={{ transform: `translateX(${-toList * 100}%)` }}>
        <OperatorHome press={{ wifi: env(f, T.tap - 6, T.tap + 6, 3, 6) }} hi={{ wifi: env(f, T.tap - 4, T.tap + 14, 3, 8) }} tileIn={(i) => prog(f, T.phone + 4 + i * 3, T.phone + 18 + i * 3)} />
      </AbsoluteFill>
      {/* list */}
      <AbsoluteFill style={{ transform: `translateX(${(1 - toList) * 100 - toTarget * 100}%)`, background: OP.bg }}>
        <StatusBar time="23:15" />
        <div style={{ position: "absolute", left: 52, top: 150, display: "flex", alignItems: "center", gap: 28 }}>
          <ArrowLeft size={70} strokeWidth={1.8} />
          <span style={{ fontSize: 76, fontWeight: 600 }}>Wi-Fi</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 280, display: "grid", placeItems: "center" }}>
          <Radar f={f} size={520} />
        </div>
        <div style={{ position: "absolute", left: 52, right: 52, top: 840, fontFamily: F.mono, fontSize: 30, color: C.grey, letterSpacing: "0.12em" }}>INTERNAL · MONITOR · PASSIVE</div>
        <div style={{ position: "absolute", left: 52, right: 52, top: 910, display: "flex", flexDirection: "column", gap: 22 }}>
          {NETS.map((n, i) => {
            const p = prog(f, T.list + 16 + i * 10, T.list + 30 + i * 10);
            const sel = n.mine && f >= T.pick;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 30, padding: "40px 40px", borderRadius: 40, background: sel ? C.ink : OP.tile, color: sel ? "#0B0B0B" : C.ink, opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${sel ? 1 - env(f, T.pick, T.pick + 8, 2, 6) * 0.04 : 1})` }}>
                <Wifi size={56} strokeWidth={1.8} />
                <span style={{ flex: 1, fontSize: 50, fontFamily: n.mine ? F.ui : F.mono, fontWeight: n.mine ? 600 : 400, color: sel ? "#0B0B0B" : n.mine ? C.ink : C.grey }}>{n.s}</span>
                {n.mine && <span style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.12em", padding: "8px 16px", borderRadius: 10, border: `2px solid ${sel ? "#0B0B0B" : C.lineStrong}` }}>AUTHORIZED</span>}
                <span style={{ fontFamily: F.mono, fontSize: 36, opacity: 0.7 }}>ch {n.ch}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {/* target + big button */}
      <AbsoluteFill style={{ transform: `translateX(${(1 - toTarget) * 100}%) translateY(${-toReceipt * 8}%)`, background: OP.bg, opacity: 1 - toReceipt * 0.6 }}>
        <StatusBar time="23:16" />
        <div style={{ position: "absolute", left: 52, top: 150, display: "flex", alignItems: "center", gap: 28 }}>
          <ArrowLeft size={70} strokeWidth={1.8} />
          <span style={{ fontSize: 76, fontWeight: 600 }}>LAB-NET</span>
        </div>
        <div style={{ position: "absolute", left: 52, right: 52, top: 290, display: "flex", gap: 18 }}>
          {[
            [<ShieldCheck key="a" size={40} />, "Authorized"],
            [<Lock key="b" size={40} />, "WPA2 · ch 6"],
          ].map(([i, l], k) => (
            <span key={k} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 28px", borderRadius: 999, background: OP.tile, fontSize: 38, color: C.mist }}>
              {i}
              {l}
            </span>
          ))}
        </div>
        {/* the big button */}
        <div style={{ position: "absolute", left: 540 - 360, top: 560, width: 720, height: 720 }}>
          <svg width={720} height={720} viewBox="-360 -360 720 720" style={{ position: "absolute", inset: 0 }}>
            <circle r={ringR} fill="none" stroke="rgba(241,240,236,0.1)" strokeWidth={22} />
            <circle r={ringR} fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - ring)} transform="rotate(-90)" />
            {running &&
              Array.from({ length: 48 }).map((_, i) => {
                const a = (i / 48) * Math.PI * 2;
                const v = 0.3 + 0.7 * Math.abs(Math.sin(i * 1.3 + f * 0.35) * Math.cos(i * 0.7 - f * 0.12));
                return <line key={i} x1={Math.cos(a) * 330} y1={Math.sin(a) * 330} x2={Math.cos(a) * (330 + 26 * v)} y2={Math.sin(a) * (330 + 26 * v)} stroke="rgba(241,240,236,0.55)" strokeWidth={4} strokeLinecap="round" />;
              })}
          </svg>
          <div
            style={{
              position: "absolute",
              left: 360 - 250,
              top: 360 - 250,
              width: 500,
              height: 500,
              borderRadius: 250,
              background: f >= T.verDone ? C.ink : pressed ? "#D8D9D6" : "#F1F0EC",
              color: "#0B0B0B",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 22,
              transform: `scale(${pressed ? 0.94 : 1 + 0.02 * Math.sin(f / 8) * (f < T.hold ? 1 : 0)})`,
              boxShadow: `0 0 ${pressed || running ? 120 : 60}px rgba(241,240,236,${pressed || running ? 0.35 : 0.15})`,
            }}
          >
            {f >= T.verDone ? <Check size={170} strokeWidth={2.6} /> : f >= T.cap ? <Wifi size={150} strokeWidth={2} /> : <Fingerprint size={150} strokeWidth={1.6} />}
            <span style={{ fontSize: 46, fontWeight: 600 }}>{btnLabel}</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", fontFamily: F.mono, fontSize: 36, color: C.grey, letterSpacing: "0.08em" }}>
          {f < T.cap && "Active steps need your confirmation"}
          {f >= T.cap && f < T.capDone && `capturing · ${Math.floor(capP * 1880).toLocaleString("en-US")} frames`}
          {f >= T.capDone && f < T.verDone && `quick list · ${Math.floor(verP * 4800).toLocaleString("en-US")} / 4,800`}
          {f >= T.verDone && "candidate verified · offline"}
        </div>
        <div style={{ position: "absolute", left: 52, right: 52, top: 1500, display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            ["Handshake captured", T.capDone],
            ["Candidate verified", T.verDone],
          ].map(([l, at]) => {
            const p = prog(f, at as number, (at as number) + 10, ease.snap);
            return (
              <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 24, padding: "30px 36px", borderRadius: 34, background: OP.tile, opacity: p, transform: `translateY(${(1 - p) * 20}px)`, fontSize: 44 }}>
                <span style={{ width: 56, height: 56, borderRadius: 28, background: C.ink, display: "grid", placeItems: "center" }}>
                  <Check size={36} color="#111" strokeWidth={3} />
                </span>
                {l}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {/* receipt sheet */}
      <AbsoluteFill style={{ transform: `translateY(${(1 - toReceipt) * 100}%)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1500, borderRadius: "70px 70px 0 0", background: "#202427", padding: "60px 60px", boxShadow: "0 -30px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ width: 120, height: 10, borderRadius: 5, background: "rgba(241,240,236,0.25)", margin: "0 auto 50px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <FileCheck2 size={80} strokeWidth={1.6} />
            <div>
              <div style={{ fontSize: 64, fontWeight: 600 }}>Receipt</div>
              <div style={{ fontFamily: F.mono, fontSize: 30, color: C.grey, letterSpacing: "0.1em" }}>0x3F2A · SAVED ON DEVICE</div>
            </div>
          </div>
          <div style={{ marginTop: 50, fontFamily: F.mono, fontSize: 38, lineHeight: 2.0 }}>
            {[
              ["target", "LAB-NET"],
              ["scope", "authorized"],
              ["source", "internal · monitor"],
              ["channel", "6 · WPA2"],
              ["handshake", "captured ✓"],
              ["candidate", "verified ✓"],
              ["time", "23:16:42"],
            ].map(([k, v], i) => {
              const p = prog(f, T.receipt + 10 + i * 4, T.receipt + 20 + i * 4);
              return (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px dashed rgba(241,240,236,0.12)", opacity: p }}>
                  <span style={{ color: C.grey }}>{k}</span>
                  <span>{v}</span>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const OperatorFlow: React.FC = () => {
  const f = useCurrentFrame();
  const phoneIn = prog(f, T.phone - 10, T.phone + 20, ease.out);
  const introOut = prog(f, T.phone - 14, T.phone + 2, ease.in);
  const endP = prog(f, T.end, T.end + 18, ease.out);
  const fade = prog(f, 640, 660, ease.in);
  const wi = WORDS.findLastIndex(([at]) => f >= at);
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <Glow x="50%" y="45%" size="55%" opacity={0.08} />
      <DotGrid offsetY={-f * 0.5} opacity={0.12} mask="radial-gradient(ellipse 80% 60% at 50% 45%, #000 0%, transparent 75%)" />
      <AbsoluteFill style={{ opacity: 1 - fade }}>
        {/* intro type */}
        <div style={{ position: "absolute", left: 90, top: 640, opacity: 1 - introOut }}>
          <MaskLine p={prog(f, T.title, T.title + 12)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 120, color: C.ink, lineHeight: 1.02 }}>
            Pentesting,
          </MaskLine>
          <MaskLine p={prog(f, T.title + 12, T.title + 24)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 120, color: C.grey, lineHeight: 1.02 }}>
            without the
          </MaskLine>
          <MaskLine p={prog(f, T.title + 24, T.title + 36)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 120, color: C.ink, lineHeight: 1.02 }}>
            friction.
          </MaskLine>
        </div>
        {/* step word */}
        <div style={{ position: "absolute", left: 80, top: 130, opacity: (1 - endP) * prog(f, T.list, T.list + 8) }}>
          <Tag size={24}>Lambda Operator · Wi-Fi</Tag>
          <div style={{ position: "relative", height: 130, marginTop: 10 }}>
            {WORDS.map(([at, w], i) => {
              const p = prog(f, at + 4, at + 14, ease.out);
              const o = i < wi ? prog(f, WORDS[i + 1][0], WORDS[i + 1][0] + 4, ease.in) : 0;
              return (
                <div key={w} style={{ position: "absolute", left: 0, top: 0, fontFamily: F.display, fontWeight: 600, fontSize: 110, color: C.ink, opacity: p * (1 - o), transform: `translateY(${(1 - p) * 60 - o * 60}px)`, filter: `blur(${(1 - p) * 8}px)` }}>
                  {w}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            {WORDS.map(([at], i) => (
              <span key={i} style={{ width: 54, height: 6, borderRadius: 3, background: f >= at ? C.ink : "rgba(241,240,236,0.18)" }} />
            ))}
          </div>
        </div>
        {/* phone */}
        <div style={{ position: "absolute", left: (1080 - 640) / 2, top: 400 + (1 - phoneIn) * 1500 + endP * 1700, opacity: phoneIn }}>
          <Phone width={640} ry={kf(f, [T.phone, T.end], [-8, 6])} rx={3} glare={kf(f, [T.phone, T.phone + 60], [0, 1])}>
            <Screen f={f} />
          </Phone>
        </div>
        {/* end */}
        <div style={{ position: "absolute", top: 760, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 36, opacity: endP }}>
          <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 96, color: C.ink, textAlign: "center", lineHeight: 1.05 }}>
            One target.
            <br />
            One tap.
          </div>
          <div style={{ fontFamily: F.ui, fontSize: 44, color: C.grey }}>Every result on the record.</div>
          <div style={{ marginTop: 40 }}>
            <Wordmark width={460} color={C.mist} />
          </div>
          <Tag size={20} dot={false} color={C.dim}>
            Operator 0.2.0 · In development · Authorized targets only
          </Tag>
        </div>
      </AbsoluteFill>
      <Vignette strength={0.5} />
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
