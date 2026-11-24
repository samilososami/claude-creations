import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { ArrowUp, Check, FileCheck2, Loader, Mic, Radar, ShieldCheck, WifiOff } from "lucide-react";
import { C, F, ease, env, kf, prog } from "../theme";
import { DotGrid, Glow, Grain, Vignette } from "../fx/Fx";
import { Lamb, LambFace } from "../lamb/Lamb";
import { Phone } from "../device/Phone";
import { StatusBar } from "../ui/Screens";
import { Chip, MaskLine, Tag, TypeOn } from "../ui/Kinetic";
import { Wordmark } from "../brand/Brand";

export const LAMB_DURATION = 33 * 30;

/* ── chat screen (1080 × 2280) ── */
const Bubble: React.FC<{ p: number; me?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, me, children, style }) => (
  <div
    style={{
      alignSelf: me ? "flex-end" : "flex-start",
      maxWidth: 820,
      padding: "34px 40px",
      borderRadius: me ? "48px 48px 14px 48px" : "48px 48px 48px 14px",
      background: me ? C.ink : "#1C1F22",
      color: me ? "#0B0B0B" : C.ink,
      fontFamily: F.ui,
      fontSize: 46,
      lineHeight: 1.32,
      opacity: p,
      transform: `translateY(${(1 - p) * 40}px) scale(${0.96 + 0.04 * p})`,
      transformOrigin: me ? "100% 100%" : "0% 100%",
      ...style,
    }}
  >
    {children}
  </div>
);

const STEPS = [
  { icon: <Radar size={50} strokeWidth={1.7} />, a: "Scan", b: "internal adapter · passive" },
  { icon: <ShieldCheck size={50} strokeWidth={1.7} />, a: "Capture", b: "LAB-NET · authorized" },
  { icon: <FileCheck2 size={50} strokeWidth={1.7} />, a: "Verify", b: "quick list · offline" },
];

const ChatScreen: React.FC<{ f: number; T: Record<string, number> }> = ({ f, T }) => {
  const userTyped = prog(f, T.typeA, T.typeB, ease.soft);
  const sent = f >= T.send;
  const thinking = f >= T.send + 12 && f < T.plan;
  const stepState = (i: number) => {
    const a = T.run + i * 50;
    if (f < T.run) return "idle";
    if (f < a) return "queued";
    if (f < a + 44) return "running";
    return "done";
  };
  const scroll = kf(f, [T.done - 10, T.done + 14], [0, -520], ease.inOut);
  const runPress = env(f, T.run - 10, T.run + 2, 3, 6);
  return (
    <AbsoluteFill style={{ background: "#0B0C0D", fontFamily: F.ui, color: C.ink }}>
      <StatusBar time="23:14" />
      {/* header */}
      <div style={{ position: "absolute", top: 130, left: 52, right: 52, display: "flex", alignItems: "center", gap: 26, paddingBottom: 34, borderBottom: `2px solid ${C.line}` }}>
        <div style={{ width: 120, height: 120, borderRadius: 60, background: "#161819", display: "grid", placeItems: "center", overflow: "hidden" }}>
          <Lamb size={104} face="main" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 58, fontWeight: 600 }}>Lamb</div>
          <div style={{ fontFamily: F.mono, fontSize: 28, color: C.grey, letterSpacing: "0.08em", marginTop: 4, display: "flex", alignItems: "center", gap: 12 }}>
            <WifiOff size={28} /> ON-DEVICE · OFFLINE
          </div>
        </div>
      </div>
      {/* messages */}
      <div style={{ position: "absolute", top: 340, left: 52, right: 52, bottom: 260, overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 30, transform: `translateY(${scroll}px)` }}>
          <Bubble p={prog(f, T.hello, T.hello + 10)}>
            <TypeOn text="Hey. What are we testing today?" p={prog(f, T.hello, T.hello + 26, ease.soft)} cursor={false} />
          </Bubble>
          {sent && <Bubble me p={prog(f, T.send, T.send + 10)}>Audit my lab Wi-Fi.</Bubble>}
          {thinking && (
            <Bubble p={prog(f, T.send + 12, T.send + 20)} style={{ padding: "30px 40px" }}>
              <span style={{ display: "inline-flex", gap: 14 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 18, height: 18, borderRadius: 9, background: C.ink, opacity: 0.3 + 0.7 * Math.max(0, Math.sin((f - i * 4) / 5)) }} />
                ))}
              </span>
            </Bubble>
          )}
          {f >= T.plan && (
            <Bubble p={prog(f, T.plan, T.plan + 10)} style={{ width: 860, maxWidth: 860 }}>
              <TypeOn text="Here's the plan. Everything stays on this phone." p={prog(f, T.plan, T.plan + 30, ease.soft)} cursor={false} />
              <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 18 }}>
                {STEPS.map((st, i) => {
                  const sp = prog(f, T.plan + 18 + i * 6, T.plan + 30 + i * 6);
                  const state = stepState(i);
                  const runP = state === "running" ? (f - (T.run + i * 50)) / 44 : state === "done" ? 1 : 0;
                  return (
                    <div key={st.a} style={{ display: "flex", alignItems: "center", gap: 24, padding: "24px 28px", borderRadius: 30, background: state === "running" ? "#2A2F33" : "#141618", border: `2px solid ${state === "running" ? "rgba(241,240,236,0.45)" : "transparent"}`, opacity: sp, position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: 0, bottom: 0, height: 6, width: `${runP * 100}%`, background: C.ink, opacity: state === "done" ? 0 : 1 }} />
                      <span style={{ color: C.mist, display: "flex" }}>{st.icon}</span>
                      <span style={{ flex: 1, fontSize: 42 }}>
                        <b style={{ fontWeight: 600 }}>{st.a}</b> <span style={{ color: C.grey }}>{st.b}</span>
                      </span>
                      {state === "running" && <Loader size={46} style={{ transform: `rotate(${f * 12}deg)` }} />}
                      {state === "done" && (
                        <span style={{ width: 52, height: 52, borderRadius: 26, background: C.ink, display: "grid", placeItems: "center", transform: `scale(${prog(f, T.run + i * 50 + 44, T.run + i * 50 + 52, ease.snap)})` }}>
                          <Check size={34} color="#111" strokeWidth={3} />
                        </span>
                      )}
                      {(state === "idle" || state === "queued") && <span style={{ fontFamily: F.mono, fontSize: 30, color: C.grey }}>0{i + 1}</span>}
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  marginTop: 26,
                  height: 110,
                  borderRadius: 55,
                  background: f >= T.run ? "#2A2F33" : C.ink,
                  color: f >= T.run ? C.mist : "#0B0B0B",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 600,
                  fontSize: 44,
                  opacity: prog(f, T.plan + 36, T.plan + 46),
                  transform: `scale(${1 - runPress * 0.05})`,
                }}
              >
                {f >= T.run ? (f >= T.done ? "Completed" : "Running…") : "Run plan"}
              </div>
            </Bubble>
          )}
          {f >= T.done && (
            <Bubble p={prog(f, T.done, T.done + 10)}>
              <TypeOn text="Done. LAB-NET's passphrase is in a common wordlist. Change it." p={prog(f, T.done, T.done + 36, ease.soft)} cursor={false} />
              <div style={{ marginTop: 22, display: "flex", gap: 14, opacity: prog(f, T.done + 34, T.done + 44) }}>
                <span style={{ fontFamily: F.mono, fontSize: 28, color: C.grey, border: `2px solid ${C.line}`, borderRadius: 999, padding: "8px 20px" }}>RECEIPT 0x3F2A</span>
                <span style={{ fontFamily: F.mono, fontSize: 28, color: C.grey, border: `2px solid ${C.line}`, borderRadius: 999, padding: "8px 20px" }}>VERIFIED</span>
              </div>
            </Bubble>
          )}
        </div>
      </div>
      {/* input */}
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 90, height: 140, borderRadius: 70, background: "#17191B", border: `2px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 20px 0 48px", gap: 20 }}>
        <span style={{ flex: 1, fontSize: 44, color: userTyped > 0 && !sent ? C.ink : C.dim }}>
          {userTyped > 0 && !sent ? <TypeOn text="Audit my lab Wi-Fi." p={userTyped} frame={f} /> : "Ask Lamb…"}
        </span>
        <Mic size={50} color={C.grey} />
        <span style={{ width: 100, height: 100, borderRadius: 50, background: C.ink, display: "grid", placeItems: "center", transform: `scale(${1 - env(f, T.send - 6, T.send + 4, 2, 4) * 0.12})` }}>
          <ArrowUp size={52} color="#0B0B0B" strokeWidth={2.4} />
        </span>
      </div>
    </AbsoluteFill>
  );
};

const FACES: { face: LambFace; label: string }[] = [
  { face: "curious", label: "Curious" },
  { face: "focused", label: "Focused" },
  { face: "waiting", label: "Working" },
  { face: "reassuring", label: "Reassuring" },
  { face: "success", label: "Done" },
];

export const LambVideo: React.FC<{ withAudio?: boolean }> = ({ withAudio = false }) => {
  const f = useCurrentFrame();
  const T = { phoneIn: 222, hello: 262, typeA: 300, typeB: 350, send: 362, plan: 404, run: 478, done: 640 };

  /* intro: eyes in the dark → wool lights up */
  const eyes = prog(f, 6, 26);
  const wool = prog(f, 44, 70, ease.out);
  const introBlink = env(f, 30, 37, 2, 3);
  const titleP = prog(f, 58, 72);
  const subP = prog(f, 70, 84);

  /* hero → corner peek */
  const toCorner = prog(f, 205, 238, ease.inOut);
  const heroSize = kf(toCorner, [0, 1], [620, 250]);
  const heroX = kf(toCorner, [0, 1], [540, 870]);
  const heroY = kf(toCorner, [0, 1], [820, 300]);
  const outPhone = prog(f, 706, 730, ease.in);

  // idle look-around for hero
  const look = {
    x: kf(f, [96, 104, 132, 140, 168, 176, 300, 306, 410, 416, 470, 476], [0, -18, -18, 16, 16, 0, 0, -16, -16, 10, 10, 0]),
    y: kf(f, [96, 104, 300, 306, 470, 476], [0, 4, 4, 10, 10, 0]),
  };
  const blink = Math.max(introBlink, env(f, 150, 156, 2, 3), env(f, 280, 286, 2, 3), env(f, 560, 566, 2, 3));
  let face: LambFace = "main";
  if (f >= T.hello) face = "curious";
  if (f >= T.send + 6) face = "focused";
  if (f >= T.run) face = "waiting";
  if (f >= T.done) face = "success";
  if (f >= T.done + 44) face = "reassuring";
  const faceSwap = (at: number) => env(f, at - 3, at + 5, 3, 5);
  const squash = [T.hello, T.send + 6, T.run, T.done, T.done + 44].reduce((m, a) => Math.max(m, faceSwap(a)), 0);
  const tilt = Math.sin(f / 22) * 3 * (1 - toCorner) + (f > 240 ? Math.sin(f / 18) * 4 : 0);

  /* phone */
  const phoneP = prog(f, T.phoneIn - 20, T.phoneIn + 14, ease.out);

  /* faces strip */
  const stripIn = (i: number) => prog(f, 728 + i * 5, 748 + i * 5, ease.out);
  const stripOut = prog(f, 860, 880, ease.in);
  const hiIdx = Math.min(4, Math.max(0, Math.floor((f - 760) / 20)));

  /* end card */
  const endIn = prog(f, 872, 892);
  const laughIdx = Math.min(10, Math.max(1, 1 + Math.floor((f - 884) / 3)));
  const fadeOut = prog(f, 960, 990, ease.in);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <Glow x="50%" y="38%" size="55%" opacity={0.09} />
      <DotGrid offsetY={-f * 0.5} opacity={0.12} mask="radial-gradient(ellipse 80% 60% at 50% 40%, #000 0%, transparent 75%)" />
      <AbsoluteFill style={{ opacity: 1 - fadeOut }}>
        {/* intro titles */}
        <div style={{ position: "absolute", top: 1200, width: "100%", textAlign: "center", opacity: 1 - prog(f, 196, 214) }}>
          <MaskLine p={titleP} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 150, color: C.ink }}>
            Lamb
          </MaskLine>
          <MaskLine p={subP} style={{ fontFamily: F.ui, fontSize: 50, color: C.grey, marginTop: 6 }}>
            the local AI assistant for LambdaOS
          </MaskLine>
        </div>
        <div style={{ position: "absolute", top: 1480, width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, padding: "0 90px", opacity: 1 - prog(f, 196, 214) }}>
          <Chip p={prog(f, 104, 114, ease.snap)} strong>
            On-device
          </Chip>
          <Chip p={prog(f, 122, 132, ease.snap)}>Offline</Chip>
          <Chip p={prog(f, 140, 150, ease.snap)}>Typed operations</Chip>
          <Chip p={prog(f, 158, 168, ease.snap)}>You approve every step</Chip>
        </div>

        {/* phone with chat */}
        <div style={{ position: "absolute", left: (1080 - 620) / 2, top: 400 + (1 - phoneP) * 1600 + outPhone * 1600, opacity: phoneP }}>
          <Phone width={620} ry={-6} rx={3} glare={kf(f, [T.phoneIn - 10, T.phoneIn + 40], [0, 1])}>
            <ChatScreen f={f} T={T} />
          </Phone>
        </div>
        <div style={{ position: "absolute", left: 80, top: 160, opacity: prog(f, T.phoneIn, T.phoneIn + 14) * (1 - prog(f, 700, 712)) }}>
          <Tag size={24}>Concept demo</Tag>
          <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 80, color: C.ink, marginTop: 10, lineHeight: 1.05 }}>
            Ask. Plan.
            <br />
            Approve. Done.
          </div>
        </div>

        {/* the character (hero → peeking over the phone) */}
        {f < 735 && (
          <div
            style={{
              position: "absolute",
              left: heroX - heroSize / 2,
              top: heroY - (heroSize * 0.79) / 2 - outPhone * 400,
              transform: `scale(${1 + squash * 0.05}, ${1 - squash * 0.05})`,
              opacity: 1 - outPhone,
            }}
          >
            <Lamb size={heroSize} face={face} blink={blink} look={look} breathe={Math.sin(f / 10)} tilt={tilt} woolOpacity={f < 70 ? wool : 1} style={{ opacity: f < 26 ? eyes : 1 }} />
          </div>
        )}

        {/* expressions strip */}
        {f >= 720 && f < 885 && (
          <AbsoluteFill style={{ opacity: 1 - stripOut }}>
            <div style={{ position: "absolute", left: 80, top: 230 }}>
              <MaskLine p={prog(f, 728, 740)}>
                <Tag size={24}>Expressions</Tag>
              </MaskLine>
              <MaskLine p={prog(f, 732, 746)} style={{ fontFamily: F.display, fontWeight: 600, fontSize: 92, color: C.ink, marginTop: 10 }}>
                Many moods.
              </MaskLine>
            </div>
            <div style={{ position: "absolute", left: 60, right: 60, top: 520, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 30px" }}>
              {FACES.map((x, i) => {
                const p = stripIn(i);
                const on = i === hiIdx && f >= 760;
                return (
                  <div
                    key={x.face}
                    style={{
                      gridColumn: i === 4 ? "1 / span 2" : undefined,
                      height: 300,
                      borderRadius: 40,
                      border: `2px solid ${on ? C.ink : C.line}`,
                      background: on ? "#1C1F22" : "rgba(20,22,24,0.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 22,
                      opacity: p,
                      transform: `translateY(${(1 - p) * 60}px) scale(${on ? 1.03 : 1})`,
                    }}
                  >
                    <Lamb size={210} face={x.face} blink={env(f, 800 + i * 9, 806 + i * 9, 2, 3)} />
                    <span style={{ fontFamily: F.mono, fontSize: 26, letterSpacing: "0.1em", color: on ? C.ink : C.grey, textTransform: "uppercase" }}>{x.label}</span>
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>
        )}

        {/* end card */}
        {f >= 870 && (
          <AbsoluteFill style={{ opacity: endIn }}>
            <div style={{ position: "absolute", left: 540 - 330, top: 470, transform: `scale(${0.9 + 0.1 * endIn})` }}>
              <Lamb size={660} face={`laugh${laughIdx}` as LambFace} />
            </div>
            <div style={{ position: "absolute", top: 1080, width: "100%", textAlign: "center" }}>
              <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 130, color: C.ink }}>Lamb</div>
              <div style={{ fontFamily: F.ui, fontSize: 46, color: C.grey, marginTop: 8 }}>Coming back to LambdaOS.</div>
            </div>
            <div style={{ position: "absolute", top: 1380, width: "100%", display: "flex", justifyContent: "center", opacity: prog(f, 900, 915) }}>
              <Wordmark width={380} color={C.mist} />
            </div>
            <div style={{ position: "absolute", top: 1500, width: "100%", textAlign: "center", opacity: prog(f, 906, 920) }}>
              <Tag size={20} dot={false} color={C.dim}>
                Research checkpoint · development paused
              </Tag>
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
      <Vignette strength={0.5} />
      <Grain opacity={0.06} />
      {withAudio && <Audio src={staticFile("audio/lamb-mix.wav")} />}
    </AbsoluteFill>
  );
};
