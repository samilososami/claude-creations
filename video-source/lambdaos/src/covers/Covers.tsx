import React from "react";
import { AbsoluteFill } from "remotion";
import { Phone } from "../device/Phone";
import { OperatorHome } from "../ui/Screens";
import { C, F } from "../theme";
import { DotGrid, Grain, Vignette } from "../fx/Fx";
import { Wordmark } from "../brand/Brand";
import { DesktopChrome } from "../lex/Desktop";
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
  // LEX: just the empty desktop on a monitor and the S10 plugged in. Nothing else.
  const S = { x: 160, y: 520, w: 760, h: 428 };
  return (
    <Frame plain>
      <div style={{ position: "absolute", left: S.x - 12, top: S.y - 12, width: S.w + 24, height: S.h + 24, borderRadius: 18, background: "#0A0A0B", border: "2px solid #26292c" }} />
      <div style={{ position: "absolute", left: S.x, top: S.y, width: S.w, height: S.h, overflow: "hidden", borderRadius: 6 }}>
        <div style={{ width: 1920, height: 1080, transform: `scale(${S.w / 1920})`, transformOrigin: "0 0" }}>
          <DesktopChrome f={600} dockIn={1} activeApp={-1} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 518, top: S.y + S.h + 12, width: 44, height: 52, background: "linear-gradient(90deg,#121314,#26292c,#121314)" }} />
      <div style={{ position: "absolute", left: 400, top: S.y + S.h + 62, width: 280, height: 12, borderRadius: 6, background: "#1f2123" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M 386 1078 C 450 1078, 470 1036, 528 1030" stroke="rgba(241,240,236,0.28)" strokeWidth={3} fill="none" />
      </svg>
      <div style={{ position: "absolute", left: 300 - 40, top: 1078 - 85 }}>
        <Phone width={80} rz={-90} glare={0.35}>
          <AbsoluteFill style={{ background: "#050505" }} />
        </Phone>
      </div>
      <Title t="LEX" s="Your S10, as a full desktop." y={1150} />
    </Frame>
  );
};
