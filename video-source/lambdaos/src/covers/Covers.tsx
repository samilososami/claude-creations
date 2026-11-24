import React from "react";
import { AbsoluteFill } from "remotion";
import { Fingerprint } from "lucide-react";
import { C, F } from "../theme";
import { DotGrid, Grain, Vignette } from "../fx/Fx";
import { LambdaMark, Wordmark } from "../brand/Brand";
import { Lamb } from "../lamb/Lamb";

/**
 * Covers for TikTok / Reels (1080 × 1920). Everything important sits in the
 * centre 1080 × 1350 so Instagram's 4:5 grid crop never cuts it.
 */
export type CoverId = "explainer" | "lamb" | "operator" | "lex";

const Title: React.FC<{ t: string; s: string; y: number }> = ({ t, s, y }) => (
  <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center" }}>
    <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 150, color: C.ink, lineHeight: 1, letterSpacing: 2 }}>{t}</div>
    <div style={{ fontFamily: F.ui, fontSize: 50, color: C.mist, marginTop: 26 }}>{s}</div>
  </div>
);

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "#070707" }}>
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 44%, rgba(241,240,236,0.09) 0%, transparent 46%)" }} />
    <DotGrid gap={32} opacity={0.1} mask="radial-gradient(ellipse 70% 45% at 50% 45%, #000 0%, transparent 75%)" />
    {children}
    <div style={{ position: "absolute", bottom: 330, width: "100%", display: "flex", justifyContent: "center", opacity: 0.55 }}>
      <Wordmark width={260} color={C.mist} />
    </div>
    <Vignette strength={0.5} />
    <Grain opacity={0.05} />
  </AbsoluteFill>
);

export const Cover: React.FC<{ id: CoverId }> = ({ id }) => {
  if (id === "explainer")
    return (
      <AbsoluteFill style={{ background: "#070707" }}>
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 48%, rgba(241,240,236,0.08) 0%, transparent 45%)" }} />
        <div style={{ position: "absolute", top: 880, width: "100%", display: "flex", justifyContent: "center" }}>
          <Wordmark width={860} />
        </div>
        <div style={{ position: "absolute", top: 1070, width: "100%", textAlign: "center", fontFamily: F.ui, fontSize: 52, color: C.mist, letterSpacing: 0.3 }}>
          The system for hacking systems.
        </div>
        <Vignette strength={0.45} />
        <Grain opacity={0.05} />
      </AbsoluteFill>
    );
  if (id === "lamb")
    return (
      <Frame>
        <div style={{ position: "absolute", top: 470, width: "100%", display: "flex", justifyContent: "center" }}>
          <Lamb size={620} face="main" />
        </div>
        <Title t="Lamb" s="On-device AI agent" y={1010} />
      </Frame>
    );
  if (id === "operator")
    return (
      <Frame>
        <div style={{ position: "absolute", top: 440, left: 540 - 270, width: 540, height: 540 }}>
          <svg width={540} height={540} viewBox="-270 -270 540 540" style={{ position: "absolute", inset: 0 }}>
            <circle r={250} fill="none" stroke="rgba(241,240,236,0.12)" strokeWidth={16} />
            <circle r={250} fill="none" stroke={C.ink} strokeWidth={16} strokeLinecap="round" strokeDasharray={2 * Math.PI * 250} strokeDashoffset={2 * Math.PI * 250 * 0.3} transform="rotate(-90)" />
          </svg>
          <div style={{ position: "absolute", left: 80, top: 80, width: 380, height: 380, borderRadius: 190, background: C.ink, display: "grid", placeItems: "center", boxShadow: "0 0 120px rgba(241,240,236,0.3)" }}>
            <Fingerprint size={190} strokeWidth={1.5} color="#0B0B0B" />
          </div>
        </div>
        <Title t="Operator" s="One target. One tap." y={1050} />
      </Frame>
    );
  return (
    <Frame>
      {/* monitor with the λ, phone underneath */}
      <div style={{ position: "absolute", top: 440, left: 90, width: 900, height: 520, borderRadius: 18, background: "#0B0B0C", border: "2px solid #2a2c2e", boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 140px rgba(241,240,236,0.08)" }}>
        <div style={{ position: "absolute", inset: 14, borderRadius: 6, background: "radial-gradient(circle at 50% 50%, #1a1b1c, #050505 70%)", display: "grid", placeItems: "center" }}>
          <LambdaMark size={170} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 958, left: 540 - 40, width: 80, height: 70, background: "linear-gradient(90deg,#141516,#2a2c2e,#141516)" }} />
      <div style={{ position: "absolute", top: 1024, left: 540 - 170, width: 340, height: 14, borderRadius: 7, background: "#232527" }} />
      <Title t="LEX" s="Your S10, as a full desktop." y={1100} />
    </Frame>
  );
};
