import React from "react";
import { AbsoluteFill } from "remotion";
import { ArrowLeft, Check, FileCheck2, Radio, ShieldCheck, Wifi } from "lucide-react";
import { C, F, prog, ease } from "../theme";
import { OP, StatusBar } from "../ui/Screens";

/**
 * Operator Wi-Fi capture screen (illustrative, built in the Operator style).
 * Three stages: what it needs, what it is doing, what it found.
 */
export const WifiOp: React.FC<{ f: number; needs: number; doing: number; found: number }> = ({ f, needs, doing, found }) => {
  const pN = prog(f, needs, needs + 12);
  const pD = prog(f, doing, doing + 12);
  const pF = prog(f, found, found + 12);
  const run = Math.max(0, f - doing);
  const frames = Math.min(2400, Math.floor(run * 23.7));
  const sec = Math.floor(run / 30);
  const bar = Math.min(1, run / 34);
  const section = (p: number, label: string, active: boolean, children: React.ReactNode) => (
    <div
      style={{
        margin: "0 52px 30px",
        padding: "34px 40px",
        borderRadius: 44,
        background: active ? "#2A2F33" : OP.tile,
        border: `2px solid ${active ? "rgba(241,240,236,0.5)" : "transparent"}`,
        opacity: 0.42 + 0.58 * p,
        transform: `translateY(${(1 - p) * 40}px)`,
      }}
    >
      <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: "0.16em", color: C.grey, marginBottom: 22 }}>{label}</div>
      {children}
    </div>
  );
  const row = (icon: React.ReactNode, a: string, b: string, ok: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 44, marginTop: 16 }}>
      <span style={{ color: C.mist, display: "flex" }}>{icon}</span>
      <span style={{ flex: 1 }}>
        {a} <span style={{ color: C.grey }}>{b}</span>
      </span>
      <span
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          background: C.ink,
          display: "grid",
          placeItems: "center",
          transform: `scale(${ok})`,
        }}
      >
        <Check size={36} color="#111" strokeWidth={3} />
      </span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: OP.bg, fontFamily: F.ui, color: C.ink }}>
      <StatusBar time="11:02" />
      <div style={{ position: "absolute", left: 52, top: 150, display: "flex", alignItems: "center", gap: 30 }}>
        <ArrowLeft size={70} strokeWidth={1.8} />
        <span style={{ fontSize: 76, fontWeight: 600 }}>Wi-Fi</span>
        <span style={{ fontSize: 44, color: C.grey, marginTop: 10 }}>Capture</span>
      </div>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0 }}>
        {section(
          pN,
          "NEEDS",
          f >= needs && f < doing,
          <>
            {row(<Radio size={48} />, "Source", "internal · monitor", prog(f, needs + 6, needs + 14, ease.snap))}
            {row(<ShieldCheck size={48} />, "Target", "LAB-NET · authorized", prog(f, needs + 12, needs + 20, ease.snap))}
          </>,
        )}
        {section(
          pD,
          "DOING",
          f >= doing && f < found,
          <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 44, marginTop: 10 }}>
              <span>
                Capturing <span style={{ color: C.grey }}>ch 6</span>
              </span>
              <span style={{ fontFamily: F.mono, color: C.mist }}>00:{String(12 + sec).padStart(2, "0")}</span>
            </div>
            <div style={{ height: 14, borderRadius: 7, background: "#15181A", marginTop: 30, overflow: "hidden" }}>
              <div style={{ width: `${bar * 100}%`, height: "100%", background: C.ink, borderRadius: 7 }} />
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 30, height: 70, alignItems: "flex-end" }}>
              {Array.from({ length: 30 }).map((_, i) => {
                const v = 0.25 + 0.75 * Math.abs(Math.sin((i * 1.7 + run * 0.45) * 0.9) * Math.cos(i * 0.37 + run * 0.12));
                return <div key={i} style={{ flex: 1, height: `${v * 100 * Math.min(1, run / 8)}%`, background: i % 5 === 0 ? C.ink : "#5A6066", borderRadius: 3 }} />;
              })}
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 32, color: C.grey, marginTop: 22 }}>{frames.toLocaleString("en-US")} frames</div>
          </>,
        )}
        {section(
          pF,
          "FOUND",
          f >= found,
          <>
            {row(<Wifi size={48} />, "Handshake", "captured", prog(f, found + 4, found + 12, ease.snap))}
            {row(<ShieldCheck size={48} />, "Candidate", "verified", prog(f, found + 10, found + 18, ease.snap))}
            {row(<FileCheck2 size={48} />, "Receipt", "saved", prog(f, found + 16, found + 24, ease.snap))}
          </>,
        )}
      </div>
    </AbsoluteFill>
  );
};
