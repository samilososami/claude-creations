import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Cable, Cast, Keyboard, MonitorSmartphone, Unplug } from "lucide-react";
import { C, F, ease, env, kf, prog } from "../theme";
import { DotGrid, Grain, Vignette, CropMarks } from "../fx/Fx";
import { LambdaGlyph, Wordmark } from "../brand/Brand";
import { Lamb } from "../lamb/Lamb";
import { Phone, phoneHeight } from "../device/Phone";
import { OperatorHome } from "../ui/Screens";
import { Chip, MaskLine, Tag } from "../ui/Kinetic";
import { Cursor, DesktopChrome, LambWin, NetWin, OperatorWin, TerminalWin } from "./Desktop";

export const LEX_FPS = 30;
export const LEX_DURATION = 1095;

const W = 1920;
const H = 1080;
/* monitor geometry (stage space) */
const MON = { x: 480, y: 112, w: 1180, h: 680, bez: 16 };
const SCR = { x: MON.x + MON.bez, y: MON.y + MON.bez, w: MON.w - MON.bez * 2, h: MON.h - MON.bez * 2 };

/* timeline */
export const T = {
  plug: 200,
  toast: 212,
  tap: 240,
  widen: 270,
  widenEnd: 345,
  monIn: 300,
  line: 372,
  drop: 390,
  desk: 414,
  push: 420,
  pushEnd: 470,
  op: 450,
  term: 505,
  lamb: 560,
  net: 615,
  pull: 810,
  pullEnd: 870,
  end: 900,
};

/** Phone's landscape screen: Lex touchpad. Authored 2280 × 1080, rotated into the portrait screen. */
export const Trackpad: React.FC<{ f: number; touch: { x: number; y: number; on: number } }> = ({ f, touch }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 2280, height: 1080, transform: "translate(1080px,0) rotate(90deg)", transformOrigin: "0 0", background: "#0B0C0D", fontFamily: F.ui, color: C.ink }}>
    <div style={{ position: "absolute", left: 90, top: 70, display: "flex", alignItems: "center", gap: 22 }}>
      <LambdaGlyph size={60} />
      <span style={{ fontSize: 56, fontWeight: 600 }}>Lex</span>
      <span style={{ fontFamily: F.mono, fontSize: 30, color: C.grey, letterSpacing: "0.12em", marginLeft: 20 }}>1920×1080 · USB-C</span>
    </div>
    <div style={{ position: "absolute", right: 90, top: 60, display: "flex", gap: 26 }}>
      {[<Keyboard key="k" size={56} strokeWidth={1.6} />, <MonitorSmartphone key="m" size={56} strokeWidth={1.6} />, <Unplug key="u" size={56} strokeWidth={1.6} />].map((i, k) => (
        <span key={k} style={{ width: 110, height: 110, borderRadius: 30, background: "#1B1E21", display: "grid", placeItems: "center", color: C.mist }}>
          {i}
        </span>
      ))}
    </div>
    <div style={{ position: "absolute", left: 90, right: 90, top: 220, bottom: 90, borderRadius: 60, background: "#121416", border: "3px solid rgba(241,240,236,0.08)" }}>
      <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontFamily: F.mono, fontSize: 34, color: C.dim, letterSpacing: "0.2em" }}>TOUCHPAD</span>
      <div style={{ position: "absolute", left: touch.x * 2100 - 70, top: touch.y * 770 - 70, width: 140, height: 140, borderRadius: 70, background: "rgba(241,240,236,0.18)", border: "3px solid rgba(241,240,236,0.5)", opacity: touch.on }} />
    </div>
    <div style={{ display: "none" }}>{f}</div>
  </div>
);

export const Toast: React.FC<{ f: number }> = ({ f }) => {
  const p = prog(f, T.toast, T.toast + 12, ease.out) * (1 - prog(f, T.tap + 6, T.tap + 18, ease.in));
  const press = env(f, T.tap - 4, T.tap + 6, 3, 5);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 150 + (1 - p) * -260, padding: "44px 48px", borderRadius: 52, background: "#1C1F22", border: "2px solid rgba(241,240,236,0.14)", boxShadow: "0 30px 60px rgba(0,0,0,0.5)", opacity: p, fontFamily: F.ui, color: C.ink }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <MonitorSmartphone size={64} strokeWidth={1.6} />
        <div>
          <div style={{ fontSize: 50, fontWeight: 600 }}>Display connected</div>
          <div style={{ fontSize: 38, color: C.grey, marginTop: 6 }}>Start Lex on 1920×1080?</div>
        </div>
      </div>
      <div style={{ marginTop: 36, height: 112, borderRadius: 56, background: C.ink, color: "#0B0B0B", display: "grid", placeItems: "center", fontSize: 44, fontWeight: 600, transform: `scale(${1 - press * 0.06})` }}>Start Lex</div>
    </div>
  );
};

export const LexMode: React.FC = () => {
  const f = useCurrentFrame();

  /* window aspect: 9:16 → 16:9 */
  const widen = prog(f, T.widen, T.widenEnd, ease.inOut);
  const winW = kf(widen, [0, 1], [608, W]);
  const winX = (W - winW) / 2;

  /* phone: centred portrait → landscape at bottom-left */
  const rot = prog(f, T.widen + 6, T.widenEnd + 6, ease.inOut);
  const pW = kf(rot, [0, 1], [400, 210]);
  const pH = phoneHeight(pW);
  const pcx = kf(rot, [0, 1], [960, 330]);
  const pcy = kf(rot, [0, 1], [540, 930]);
  const rz = -90 * rot;
  const ry = kf(f, [0, T.widen, T.widenEnd], [-8, 0, 12]);
  const rx = kf(rot, [0, 1], [4, 16]);

  /* cable */
  const cableIn = prog(f, 150, T.plug, ease.out);
  const cableOut = prog(f, T.widen, T.widen + 20, ease.in);
  const portY = 540 + phoneHeight(400) / 2;
  const plugY = kf(cableIn, [0, 1], [1260, portY + 6]);

  /* monitor */
  const monP = prog(f, T.monIn, T.monIn + 50, ease.out);
  const lineP = prog(f, T.line, T.line + 10, ease.out);
  const openP = prog(f, T.line + 10, T.drop + 2, ease.inOut);
  const splash = env(f, T.drop, T.desk + 10, 4, 12);
  const deskP = prog(f, T.desk, T.desk + 16);
  const flash = env(f, T.drop, T.drop + 8, 1, 7);

  /* camera push into the screen and back out */
  const push = prog(f, T.push, T.pushEnd, ease.inOut) * (1 - prog(f, T.pull, T.pullEnd, ease.inOut));
  const s = kf(push, [0, 1], [1, W / SCR.w]);
  const tx = -SCR.x * (s - 1) * (push > 0 ? 1 : 0) - (SCR.x * s - SCR.x) * 0;
  const camX = kf(push, [0, 1], [0, -SCR.x * (W / SCR.w)]);
  const camY = kf(push, [0, 1], [0, -SCR.y * (W / SCR.w)]);

  /* cursor (desktop coords) */
  const cx = kf(f, [T.op + 6, T.op + 60, T.term + 30, T.term + 70, T.net + 20, T.net + 60, 760, 800], [1500, 520, 520, 1300, 1300, 1600, 1600, 760], ease.inOut);
  const cy = kf(f, [T.op + 6, T.op + 60, T.term + 30, T.term + 70, T.net + 20, T.net + 60, 760, 800], [700, 296, 296, 330, 330, 760, 760, 620], ease.inOut);
  const click = env(f, T.op + 64, T.op + 72, 2, 5);
  const activeWin = f < T.term ? 0 : f < T.term + 70 ? 0 : f < T.net + 60 ? 1 : 3;

  /* end card */
  const endP = prog(f, T.end, T.end + 24, ease.out);
  const fadeOut = prog(f, LEX_DURATION - 30, LEX_DURATION, ease.in);

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
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* side titles in the black margins (vertical phase) */}
      <AbsoluteFill style={{ opacity: 1 - prog(f, T.widen, T.widen + 26) }}>
        <div style={{ position: "absolute", left: 110, top: 330 }}>
          <MaskLine p={prog(f, 24, 40)}>
            <Tag size={22}>LambdaOS · Concept</Tag>
          </MaskLine>
          <MaskLine p={prog(f, 30, 48)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 190, color: C.ink, lineHeight: 1 }}>
            Lex
          </MaskLine>
          <MaskLine p={prog(f, 40, 56)} style={{ fontFamily: F.ui, fontSize: 40, color: C.grey, marginTop: 8 }}>
            desktop mode
          </MaskLine>
        </div>
        <div style={{ position: "absolute", left: 1340, top: 420, display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start" }}>
          <Chip p={prog(f, 160, 172, ease.snap)} strong>
            <Cable size={30} /> USB-C
          </Chip>
          <Chip p={prog(f, 172, 184, ease.snap)}>
            <Cast size={30} /> Wireless
          </Chip>
          <div style={{ fontFamily: F.mono, fontSize: 22, color: C.grey, letterSpacing: "0.12em", marginTop: 14, opacity: prog(f, 186, 200) }}>PLUG IN · OR CAST</div>
        </div>
      </AbsoluteFill>

      {/* the framed window */}
      <div style={{ position: "absolute", left: winX, top: 0, width: winW, height: H, overflow: "hidden", background: "#070707" }}>
        <div style={{ position: "absolute", left: -winX, top: 0, width: W, height: H }}>
          {/* stage with camera */}
          <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: `translate(${camX}px, ${camY}px) scale(${s})` }}>
            <DotGrid gap={30} opacity={0.12} mask="radial-gradient(ellipse 60% 70% at 50% 45%, #000 0%, transparent 80%)" />
            <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 50% at 56% 40%, rgba(241,240,236,${0.06 + 0.1 * openP}) 0%, transparent 70%)` }} />
            {/* monitor */}
            <div style={{ position: "absolute", left: MON.x, top: MON.y + (1 - monP) * 160, width: MON.w, height: MON.h + 160, opacity: monP }}>
              {/* stand */}
              <div style={{ position: "absolute", left: MON.w / 2 - 50, top: MON.h - 4, width: 100, height: 120, background: "linear-gradient(90deg,#141516,#2a2c2e,#141516)" }} />
              <div style={{ position: "absolute", left: MON.w / 2 - 230, top: MON.h + 112, width: 460, height: 18, borderRadius: 9, background: "linear-gradient(180deg,#2a2c2e,#101112)" }} />
              <div style={{ position: "absolute", inset: 0, height: MON.h, borderRadius: 20, background: "#0B0B0C", border: "2px solid #26282a", boxShadow: "0 40px 120px rgba(0,0,0,0.8)" }} />
              {/* screen */}
              <div style={{ position: "absolute", left: MON.bez, top: MON.bez, width: SCR.w, height: SCR.h, borderRadius: 6, overflow: "hidden", background: "#030303" }}>
                {/* desktop */}
                <div style={{ position: "absolute", inset: 0, clipPath: `inset(${(1 - openP) * 50}% 0 ${(1 - openP) * 50}% 0)` }}>
                  <div style={{ width: W, height: H, transform: `scale(${SCR.w / W})`, transformOrigin: "0 0" }}>
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
                {/* power-on line */}
                {f >= T.line && f < T.drop + 4 && (
                  <div style={{ position: "absolute", left: (SCR.w * (1 - lineP)) / 2, width: SCR.w * lineP, top: SCR.h / 2 - 2 - openP * (SCR.h / 2), height: 4 + openP * SCR.h, background: openP < 0.98 ? "rgba(255,255,255,0.0)" : "transparent", boxShadow: `0 0 ${30 + 60 * lineP}px rgba(255,255,255,${0.7 * (1 - openP)})`, borderTop: `3px solid rgba(255,255,255,${1 - openP})`, borderBottom: `3px solid rgba(255,255,255,${1 - openP})` }} />
                )}
                {/* glass reflection */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 40%)", pointerEvents: "none" }} />
                <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.5 }} />
              </div>
            </div>
            {/* cable */}
            {cableOut < 1 && (
              <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 1 - cableOut }}>
                <path d={`M 990 1200 C 990 ${plugY + 160}, 960 ${plugY + 120}, 960 ${plugY + 46}`} stroke="#1d1f21" strokeWidth={16} fill="none" strokeLinecap="round" />
                <path d={`M 990 1200 C 990 ${plugY + 160}, 960 ${plugY + 120}, 960 ${plugY + 46}`} stroke="rgba(241,240,236,0.18)" strokeWidth={2} fill="none" transform="translate(-4 0)" />
                <rect x={943} y={plugY} width={34} height={52} rx={8} fill="#2b2d30" stroke="rgba(241,240,236,0.25)" strokeWidth={1.5} />
                <rect x={951} y={plugY - 10} width={18} height={12} rx={3} fill="#8a8f94" />
              </svg>
            )}
            {/* phone */}
            <div style={{ position: "absolute", left: pcx - pW / 2, top: pcy - pH / 2 }}>
              <Phone width={pW} rz={rz} ry={ry} rx={rx} glare={kf(f, [10, 120], [0, 1])}>
                <div style={{ position: "absolute", inset: 0, opacity: 1 - prog(f, T.widen + 10, T.widen + 30) }}>
                  <OperatorHome />
                  <Toast f={f} />
                </div>
                <div style={{ position: "absolute", inset: 0, opacity: prog(f, T.widen + 10, T.widen + 30) }}>
                  <Trackpad
                    f={f}
                    touch={{
                      x: kf(cx, [0, 1920], [0.15, 0.85]),
                      y: kf(cy, [0, 1080], [0.15, 0.85]),
                      on: env(f, T.op + 6, 800, 6, 10),
                    }}
                  />
                </div>
              </Phone>
            </div>
          </div>
        </div>
      </div>
      {/* window frame marks while narrow */}
      <div style={{ opacity: 1 - prog(f, T.widen + 40, T.widenEnd) }}>
        <CropMarks x={winX - 18} y={18} w={winW + 36} h={H - 36} len={40} opacity={0.55} />
      </div>

      {/* end card */}
      {f >= T.end && (
        <AbsoluteFill>
          <AbsoluteFill style={{ background: `rgba(5,5,5,${0.78 * endP})`, backdropFilter: `blur(${14 * endP}px)` }} />
          <div style={{ position: "absolute", left: 160, top: 300, opacity: endP }}>
            <MaskLine p={prog(f, T.end + 4, T.end + 20)}>
              <Tag size={24}>LambdaOS · Concept</Tag>
            </MaskLine>
            <MaskLine p={prog(f, T.end + 8, T.end + 26)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 210, color: C.ink, lineHeight: 1 }}>
              Lex
            </MaskLine>
            <MaskLine p={prog(f, T.end + 16, T.end + 32)} style={{ fontFamily: F.ui, fontSize: 54, color: C.mist, marginTop: 14 }}>
              Your S10, as a full desktop.
            </MaskLine>
            <div style={{ display: "flex", gap: 18, marginTop: 44 }}>
              <Chip p={prog(f, T.end + 30, T.end + 40, ease.snap)} strong>
                <Cable size={30} /> USB-C
              </Chip>
              <Chip p={prog(f, T.end + 36, T.end + 46, ease.snap)}>
                <Cast size={30} /> Wireless
              </Chip>
              <Chip p={prog(f, T.end + 42, T.end + 52, ease.snap)}>Operator · Terminal · Lamb</Chip>
            </div>
          </div>
          <div style={{ position: "absolute", right: 160, bottom: 140, opacity: prog(f, T.end + 50, T.end + 66), display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 18 }}>
            <Wordmark width={420} color={C.mist} />
            <Tag size={20} dot={false} color={C.grey}>
              Exploratory · on the roadmap
            </Tag>
          </div>
          <div style={{ position: "absolute", right: 210, top: 250, opacity: prog(f, T.end + 40, T.end + 60) }}>
            <Lamb size={300} face="success" blink={env(f, T.end + 80, T.end + 86, 2, 3)} />
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />
      <Vignette strength={0.45} />
      <Grain opacity={0.05} />
      <div style={{ display: "none" }}>{tx}</div>
    </AbsoluteFill>
  );
};
