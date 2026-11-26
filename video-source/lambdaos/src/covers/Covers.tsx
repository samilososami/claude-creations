import React from "react";
import { AbsoluteFill } from "remotion";
import { Phone } from "../device/Phone";
import { OperatorHome } from "../ui/Screens";
import { C, F } from "../theme";
import { DotGrid, Grain, Vignette } from "../fx/Fx";
import { Wordmark } from "../brand/Brand";
import { Cable } from "lucide-react";
import { Cursor, DesktopChrome, LambWin, NetWin, OperatorWin, TerminalWin } from "../lex/Desktop";
import { Landscape, Touchpad } from "../social/LexExplainer";
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

/** `plain`: pure black, no glow, dots, vignette or grain (like the explainer cover). */
const Frame: React.FC<{ children: React.ReactNode; plain?: boolean }> = ({ children, plain }) => (
  <AbsoluteFill style={{ background: plain ? "#000" : "#070707" }}>
    {!plain && <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 44%, rgba(241,240,236,0.09) 0%, transparent 46%)" }} />}
    {!plain && <DotGrid gap={32} opacity={0.1} mask="radial-gradient(ellipse 70% 45% at 50% 45%, #000 0%, transparent 75%)" />}
    {children}
    <div style={{ position: "absolute", bottom: 330, width: "100%", display: "flex", justifyContent: "center", opacity: 0.55 }}>
      <Wordmark width={260} color={C.mist} />
    </div>
    {!plain && <Vignette strength={0.5} />}
    {!plain && <Grain opacity={0.05} />}
  </AbsoluteFill>
);

export const Cover: React.FC<{ id: CoverId }> = ({ id }) => {
  if (id === "explainer")
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <div style={{ position: "absolute", top: 880, width: "100%", display: "flex", justifyContent: "center" }}>
          <Wordmark width={860} />
        </div>
        <div style={{ position: "absolute", top: 1070, width: "100%", textAlign: "center", fontFamily: F.ui, fontSize: 52, color: C.mist, letterSpacing: 0.3 }}>
          The system for hacking systems.
        </div>
      </AbsoluteFill>
    );
  if (id === "lamb")
    return (
      <Frame plain>
        <div style={{ position: "absolute", top: 470, width: "100%", display: "flex", justifyContent: "center" }}>
          <Lamb size={620} face="main" />
        </div>
        <Title t="Lamb" s="On-device AI agent" y={1010} />
      </Frame>
    );
  if (id === "operator")
    return (
      <Frame>
        <div style={{ position: "absolute", top: 215, left: 540 - 225 }}>
          <Phone width={450} ry={-10} rx={4} glare={0.55}>
            <OperatorHome hi={{ wifi: 1 }} />
          </Phone>
        </div>
        <Title t="Operator" s="One target. One tap." y={1225} />
      </Frame>
    );
  // LEX: the real desktop on a monitor, the S10 lying on the desk with its cable
  const S = { x: 90, y: 430, w: 900, h: 506 };
  return (
    <Frame plain>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1022, height: 2, background: "linear-gradient(90deg, transparent, rgba(241,240,236,0.2), transparent)" }} />
      <div style={{ position: "absolute", left: S.x - 14, top: S.y - 14, width: S.w + 28, height: S.h + 28, borderRadius: 20, background: "#0A0A0B", border: "2px solid #2a2d30", boxShadow: "0 50px 120px rgba(0,0,0,0.9)" }} />
      <div style={{ position: "absolute", left: S.x, top: S.y, width: S.w, height: S.h, overflow: "hidden", borderRadius: 6 }}>
        <div style={{ width: 1920, height: 1080, transform: `scale(${S.w / 1920})`, transformOrigin: "0 0" }}>
          <DesktopChrome f={600} dockIn={1} activeApp={1}>
            <OperatorWin f={600} p={1} start={0} />
            <TerminalWin f={600} p={1} start={0} active />
            <LambWin f={600} p={1} start={0} />
            <NetWin f={600} p={1} start={0} />
            <Cursor x={820} y={820} />
          </DesktopChrome>
        </div>
      </div>
      <div style={{ position: "absolute", left: 515, top: 950, width: 50, height: 60, background: "linear-gradient(90deg,#141516,#2b2e31,#141516)" }} />
      <div style={{ position: "absolute", left: 370, top: 1008, width: 340, height: 14, borderRadius: 7, background: "#232527" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M 312 1080 C 420 1080, 430 1012, 522 1006" stroke="rgba(241,240,236,0.4)" strokeWidth={4} fill="none" />
      </svg>
      <div style={{ position: "absolute", left: 205 - 50, top: 1080 - 106 }}>
        <Phone width={100} rz={-90} glare={0.4}>
          <Landscape>
            <Touchpad label="Connected" icon={<Cable size={260} strokeWidth={1.4} />} />
          </Landscape>
        </Phone>
      </div>
      <Title t="LEX" s="Your S10, as a full desktop." y={1150} />
    </Frame>
  );
};
