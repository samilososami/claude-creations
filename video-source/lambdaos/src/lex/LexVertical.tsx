import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Cable, Cast } from "lucide-react";
import { C, F, ease, env, kf, prog } from "../theme";
import { DotGrid, Grain, Vignette } from "../fx/Fx";
import { LambdaGlyph, Wordmark } from "../brand/Brand";
import { Lamb } from "../lamb/Lamb";
import { Phone, phoneHeight } from "../device/Phone";
import { OperatorHome } from "../ui/Screens";
import { Chip, MaskLine, Tag } from "../ui/Kinetic";
import { Cursor, DesktopChrome, LambWin, NetWin, OperatorWin, TerminalWin } from "./Desktop";
import { T, Toast, Trackpad, LEX_DURATION } from "./Lex";

/**
 * Lex mode, vertical cut (1080 × 1920) for TikTok / Reels.
 * Same timeline as the 16:9 version, so it shares its audio mix.
 */
export const LEXV_DURATION = LEX_DURATION;

const W = 1080;
/* monitor (stage space) */
const MON = { x: 40, y: 470, w: 1000, h: 580, bez: 14 };
const SCR = { x: MON.x + MON.bez, y: MON.y + MON.bez, w: MON.w - MON.bez * 2, h: MON.h - MON.bez * 2 };
const DS = SCR.w / 1920; // desktop scale inside the screen

/** camera keyframes: [frame, stage scale, focus x (desktop px), focus y (desktop px)] */
const CAM: [number, number, number, number][] = [
  [T.push, 1, -1, -1],
  [T.pushEnd, 1.2 / DS, 488, 470],
  [T.term - 4, 1.2 / DS, 488, 470],
  [T.term + 26, 1.2 / DS, 1416, 470],
  [T.net + 60, 1.2 / DS, 1416, 560],
  [760, W / SCR.w, 960, 540],
  [T.pull, W / SCR.w, 960, 540],
  [T.pullEnd, 1, -1, -1],
];

const camera = (f: number) => {
  // -1 focus means "identity" (stage centred as authored)
  const toStage = (fx: number, fy: number, s: number) => {
    if (fx < 0) return { s: 1, tx: 0, ty: 0 };
    const sx = SCR.x + fx * DS;
    const sy = SCR.y + fy * DS;
    return { s, tx: 540 - sx * s, ty: 960 - sy * s };
  };
  if (f <= CAM[0][0]) return toStage(-1, -1, 1);
  for (let i = 0; i < CAM.length - 1; i++) {
    const [a, sa, xa, ya] = CAM[i];
    const [b, sb, xb, yb] = CAM[i + 1];
    if (f <= b) {
      const p = prog(f, a, b, ease.inOut);
      const A = toStage(xa, ya, sa);
      const B = toStage(xb, yb, sb);
      // interpolate in log-scale for a natural zoom
      const s = Math.exp(Math.log(A.s) + (Math.log(B.s) - Math.log(A.s)) * p);
      return { s, tx: A.tx + (B.tx - A.tx) * p, ty: A.ty + (B.ty - A.ty) * p };
    }
  }
  return toStage(-1, -1, 1);
};

const LABELS: [number, string, string][] = [
  [T.op, "Operator", "Wi-Fi on the big screen"],
  [T.term + 20, "Terminal", "Same operations, typed"],
  [T.lamb, "Lamb", "On-device assistant"],
  [T.net, "Network map", "Passive, LAB-NET only"],
  [760, "Lex", "1920×1080 from your S10"],
];

export const LexVertical: React.FC = () => {
  const f = useCurrentFrame();

  /* phone: portrait centred → landscape under the monitor */
  const rot = prog(f, T.widen + 6, T.widenEnd + 6, ease.inOut);
  const pW = kf(rot, [0, 1], [520, 300]);
  const pH = phoneHeight(pW);
  const pcx = kf(rot, [0, 1], [540, 540]);
  const pcy = kf(rot, [0, 1], [980, 1400]);
  const rz = -90 * rot;
  const ry = kf(f, [0, T.widen, T.widenEnd], [-8, 0, 0]);
  const rx = kf(rot, [0, 1], [4, 18]);

  /* cable into the port */
  const cableIn = prog(f, 150, T.plug, ease.out);
  const cableOut = prog(f, T.widen, T.widen + 20, ease.in);
  const portY = 980 + phoneHeight(520) / 2;
  const plugY = kf(cableIn, [0, 1], [2050, portY + 6]);

  /* monitor */
  const monP = prog(f, T.monIn, T.monIn + 50, ease.out);
  const lineP = prog(f, T.line, T.line + 10, ease.out);
  const openP = prog(f, T.line + 10, T.drop + 2, ease.inOut);
  const splash = env(f, T.drop, T.desk + 10, 4, 12);
  const deskP = prog(f, T.desk, T.desk + 16);
  const flash = env(f, T.drop, T.drop + 8, 1, 7);

  /* camera */
  const cam = camera(f);
  const inDesk = prog(f, T.push, T.pushEnd, ease.inOut) * (1 - prog(f, T.pull, T.pullEnd, ease.inOut));

  /* cursor (desktop coords) */
  const cx = kf(f, [T.op + 6, T.op + 60, T.term + 30, T.term + 70, T.net + 20, T.net + 60, 760, 800], [1500, 520, 520, 1300, 1300, 1600, 1600, 760], ease.inOut);
  const cy = kf(f, [T.op + 6, T.op + 60, T.term + 30, T.term + 70, T.net + 20, T.net + 60, 760, 800], [700, 296, 296, 330, 330, 760, 760, 620], ease.inOut);
  const click = env(f, T.op + 64, T.op + 72, 2, 5);
  const activeWin = f < T.term + 70 ? 0 : f < T.net + 60 ? 1 : 3;

  const endP = prog(f, T.end, T.end + 24, ease.out);
  const fadeOut = prog(f, LEXV_DURATION - 30, LEXV_DURATION, ease.in);
  const li = LABELS.findLastIndex(([at]) => f >= at);

  const desktop = (
    <DesktopChrome f={f} dockIn={prog(f, T.desk + 6, T.desk + 24, ease.out)} activeApp={activeWin}>
      <OperatorWin f={f} p={prog(f, T.op, T.op + 14, ease.out)} start={T.op} active={activeWin === 0} />
      <TerminalWin f={f} p={prog(f, T.term, T.term + 14, ease.out)} start={T.term} active={activeWin === 1} />
      <LambWin f={f} p={prog(f, T.lamb, T.lamb + 14, ease.out)} start={T.lamb} />
      <NetWin f={f} p={prog(f, T.net, T.net + 14, ease.out)} start={T.net} />
      {f > T.op + 6 && <Cursor x={cx} y={cy} press={click} />}
    </DesktopChrome>
  );

  return (
    <AbsoluteFill style={{ background: "#060606", overflow: "hidden" }}>
      <DotGrid gap={30} opacity={0.12} mask="radial-gradient(ellipse 80% 60% at 50% 45%, #000 0%, transparent 80%)" />
      {/* stage with camera */}
      <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})` }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 40% at 50% 38%, rgba(241,240,236,${0.05 + 0.1 * openP}) 0%, transparent 70%)` }} />
        {/* monitor */}
        <div style={{ position: "absolute", left: MON.x, top: MON.y + (1 - monP) * 200, width: MON.w, height: MON.h + 150, opacity: monP }}>
          <div style={{ opacity: 1 - inDesk }}>
            <div style={{ position: "absolute", left: MON.w / 2 - 45, top: MON.h - 4, width: 90, height: 110, background: "linear-gradient(90deg,#141516,#2a2c2e,#141516)" }} />
            <div style={{ position: "absolute", left: MON.w / 2 - 200, top: MON.h + 102, width: 400, height: 16, borderRadius: 8, background: "linear-gradient(180deg,#2a2c2e,#101112)" }} />
          </div>
          <div style={{ position: "absolute", left: 0, top: 0, width: MON.w, height: MON.h, borderRadius: 18, background: "#0B0B0C", border: "2px solid #26282a", boxShadow: "0 40px 120px rgba(0,0,0,0.8)" }} />
          <div style={{ position: "absolute", left: MON.bez, top: MON.bez, width: SCR.w, height: SCR.h, borderRadius: 6, overflow: "hidden", background: "#030303" }}>
            <div style={{ position: "absolute", inset: 0, clipPath: `inset(${(1 - openP) * 50}% 0 ${(1 - openP) * 50}% 0)` }}>
              <div style={{ width: 1920, height: 1080, transform: `scale(${DS})`, transformOrigin: "0 0" }}>
                <AbsoluteFill style={{ background: "#000" }} />
                <AbsoluteFill style={{ opacity: deskP }}>{desktop}</AbsoluteFill>
                <AbsoluteFill style={{ display: "grid", placeItems: "center", opacity: splash }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50 }}>
                    <LambdaGlyph size={220} />
                    <Wordmark width={520} color={C.mist} />
                  </div>
                </AbsoluteFill>
              </div>
            </div>
            {f >= T.line && f < T.drop + 4 && (
              <div style={{ position: "absolute", left: (SCR.w * (1 - lineP)) / 2, width: SCR.w * lineP, top: SCR.h / 2 - 2 - openP * (SCR.h / 2), height: 4 + openP * SCR.h, boxShadow: `0 0 ${30 + 60 * lineP}px rgba(255,255,255,${0.7 * (1 - openP)})`, borderTop: `3px solid rgba(255,255,255,${1 - openP})`, borderBottom: `3px solid rgba(255,255,255,${1 - openP})` }} />
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 40%)", pointerEvents: "none" }} />
            <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.5 }} />
          </div>
        </div>
        {/* cable */}
        {cableOut < 1 && (
          <svg width={W} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - cableOut, overflow: "visible" }}>
            <path d={`M 570 2100 C 570 ${plugY + 200}, 540 ${plugY + 140}, 540 ${plugY + 56}`} stroke="#1d1f21" strokeWidth={20} fill="none" strokeLinecap="round" />
            <path d={`M 570 2100 C 570 ${plugY + 200}, 540 ${plugY + 140}, 540 ${plugY + 56}`} stroke="rgba(241,240,236,0.18)" strokeWidth={2.5} fill="none" transform="translate(-5 0)" />
            <rect x={519} y={plugY} width={42} height={64} rx={10} fill="#2b2d30" stroke="rgba(241,240,236,0.25)" strokeWidth={1.5} />
            <rect x={529} y={plugY - 12} width={22} height={14} rx={3} fill="#8a8f94" />
          </svg>
        )}
        {/* phone */}
        <div style={{ position: "absolute", left: pcx - pW / 2, top: pcy - pH / 2, opacity: 1 - inDesk }}>
          <Phone width={pW} rz={rz} ry={ry} rx={rx} glare={kf(f, [10, 120], [0, 1])}>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - prog(f, T.widen + 10, T.widen + 30) }}>
              <OperatorHome />
              <Toast f={f} />
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: prog(f, T.widen + 10, T.widen + 30) }}>
              <Trackpad f={f} touch={{ x: kf(cx, [0, 1920], [0.15, 0.85]), y: kf(cy, [0, 1080], [0.15, 0.85]), on: env(f, T.op + 6, 800, 6, 10) }} />
            </div>
          </Phone>
        </div>
      </div>

      {/* opening titles */}
      <AbsoluteFill style={{ opacity: 1 - prog(f, T.widen, T.widen + 24) }}>
        <div style={{ position: "absolute", left: 80, top: 150 }}>
          <MaskLine p={prog(f, 24, 40)}>
            <Tag size={24}>LambdaOS · Concept</Tag>
          </MaskLine>
          <MaskLine p={prog(f, 30, 48)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 150, color: C.ink, lineHeight: 1 }}>
            Lex
          </MaskLine>
          <MaskLine p={prog(f, 40, 56)} style={{ fontFamily: F.ui, fontSize: 44, color: C.grey, marginTop: 6 }}>
            desktop mode
          </MaskLine>
        </div>
        <div style={{ position: "absolute", right: 80, top: 210, display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-end" }}>
          <Chip p={prog(f, 160, 172, ease.snap)} strong>
            <Cable size={30} /> USB-C
          </Chip>
          <Chip p={prog(f, 172, 184, ease.snap)}>
            <Cast size={30} /> Wireless
          </Chip>
        </div>
      </AbsoluteFill>

      {/* "one phone → one desktop" line during the turn */}
      <div style={{ position: "absolute", left: 80, top: 170, opacity: env(f, T.widen + 10, T.push + 4, 12, 10) }}>
        <Tag size={24}>Vertical to horizontal</Tag>
        <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 88, color: C.ink, marginTop: 10, lineHeight: 1.05 }}>
          One phone.
          <br />
          One desktop.
        </div>
      </div>

      {/* desktop-phase labels top & bottom */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 120, opacity: inDesk * (1 - endP) }}>
        <Tag size={24}>Lex · on the big screen</Tag>
        <div style={{ position: "relative", height: 110, marginTop: 10 }}>
          {LABELS.map(([at, t], i) => {
            const p = prog(f, at + 3, at + 13, ease.out);
            const o = i < li ? prog(f, LABELS[i + 1][0], LABELS[i + 1][0] + 4, ease.in) : 0;
            return (
              <div key={t} style={{ position: "absolute", fontFamily: F.display, fontWeight: 600, fontSize: 92, color: C.ink, opacity: p * (1 - o), transform: `translateY(${(1 - p) * 50 - o * 50}px)` }}>
                {t}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 190, opacity: inDesk * (1 - endP), fontFamily: F.ui, fontSize: 44, color: C.mist }}>
        {li >= 0 && LABELS[li][2]}
      </div>

      {/* end card */}
      {f >= T.end && (
        <AbsoluteFill>
          <AbsoluteFill style={{ background: `rgba(5,5,5,${0.8 * endP})`, backdropFilter: `blur(${14 * endP}px)` }} />
          <div style={{ position: "absolute", top: 380, width: "100%", display: "flex", justifyContent: "center", opacity: prog(f, T.end + 30, T.end + 50) }}>
            <Lamb size={320} face="success" blink={env(f, T.end + 80, T.end + 86, 2, 3)} />
          </div>
          <div style={{ position: "absolute", top: 720, width: "100%", textAlign: "center", opacity: endP }}>
            <MaskLine p={prog(f, T.end + 4, T.end + 20)}>
              <Tag size={24}>LambdaOS · Concept</Tag>
            </MaskLine>
            <MaskLine p={prog(f, T.end + 8, T.end + 26)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 200, color: C.ink, lineHeight: 1 }}>
              Lex
            </MaskLine>
            <MaskLine p={prog(f, T.end + 16, T.end + 32)} style={{ fontFamily: F.ui, fontSize: 52, color: C.mist, marginTop: 14 }}>
              Your S10, as a full desktop.
            </MaskLine>
            <div style={{ display: "flex", gap: 16, marginTop: 44, justifyContent: "center", flexWrap: "wrap", padding: "0 60px" }}>
              <Chip p={prog(f, T.end + 30, T.end + 40, ease.snap)} strong>
                <Cable size={30} /> USB-C
              </Chip>
              <Chip p={prog(f, T.end + 36, T.end + 46, ease.snap)}>
                <Cast size={30} /> Wireless
              </Chip>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 300, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: prog(f, T.end + 50, T.end + 66) }}>
            <Wordmark width={420} color={C.mist} />
            <Tag size={20} dot={false} color={C.grey}>
              Exploratory · on the roadmap
            </Tag>
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />
      <Vignette strength={0.45} />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
