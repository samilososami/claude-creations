import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Check } from "lucide-react";
import { C, F, ease, env, prog } from "../theme";
import { Lamb, LambFace } from "../lamb/Lamb";
import { Grain } from "../fx/Fx";

/** Seamless 8 s loop of Lamb's assistant states, for UI and social use (1:1). */
export const LAMB_STATES_DURATION = 240;
const STATES: { id: string; face: LambFace }[] = [
  { id: "Idle", face: "main" },
  { id: "Listening", face: "curious" },
  { id: "Thinking", face: "focused" },
  { id: "Working", face: "waiting" },
  { id: "Done", face: "success" },
];
const SEG = 48;

export const LambStates: React.FC = () => {
  const f = useCurrentFrame();
  const si = Math.min(4, Math.floor(f / SEG));
  const local = f - si * SEG;
  const st = STATES[si];
  const R = 330;
  const circ = 2 * Math.PI * R;
  const swap = env(f, si * SEG - 2, si * SEG + 5, 2, 5) * (si > 0 ? 1 : 0);
  const look =
    st.id === "Listening" ? { x: 0, y: -12 } : st.id === "Thinking" ? { x: -16 * Math.min(1, local / 8), y: -4 } : { x: 0, y: 0 };
  const blink = env(f, 20, 26, 2, 3) + env(f, 220, 226, 2, 3);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: F.ui }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 44%, rgba(241,240,236,0.08) 0%, transparent 45%)" }} />
      <svg width={1080} height={1080} viewBox="-540 -475 1080 1080" style={{ position: "absolute", inset: 0 }}>
        <circle r={R} fill="none" stroke="rgba(241,240,236,0.1)" strokeWidth={3} />
        {st.id === "Listening" &&
          [0, 1, 2].map((k) => {
            const p = ((local + k * 16) % 48) / 48;
            return <circle key={k} r={R + p * 90} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5 * (1 - p)} />;
          })}
        {st.id === "Thinking" &&
          [0, 1, 2].map((k) => {
            const a = (local / 48) * Math.PI * 2 + k * 0.45 - Math.PI / 2;
            return <circle key={k} cx={Math.cos(a) * R} cy={Math.sin(a) * R} r={13 - k * 3} fill={C.ink} opacity={1 - k * 0.25} />;
          })}
        {st.id === "Working" && (
          <circle r={R} fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${circ * 0.22} ${circ}`} transform={`rotate(${(local / 48) * 360 - 90})`} />
        )}
        {st.id === "Done" && (
          <circle r={R} fill="none" stroke={C.ink} strokeWidth={8} strokeDasharray={circ} strokeDashoffset={circ * (1 - prog(local, 0, 14, ease.out))} transform="rotate(-90)" opacity={1 - prog(local, 34, 48)} />
        )}
      </svg>
      <div style={{ position: "absolute", left: 540 - 260, top: 335, transform: `scale(${1 + swap * 0.05}, ${1 - swap * 0.05})` }}>
        <Lamb size={520} face={st.face} blink={blink} look={look} breathe={Math.sin((f / 240) * Math.PI * 4)} />
      </div>
      {st.id === "Done" && (
        <div style={{ position: "absolute", left: 540 + 200, top: 190, width: 96, height: 96, borderRadius: 48, background: C.ink, display: "grid", placeItems: "center", transform: `scale(${prog(local, 4, 14, ease.snap) * (1 - prog(local, 36, 46))})` }}>
          <Check size={60} color="#111" strokeWidth={3} />
        </div>
      )}
      <div style={{ position: "absolute", top: 905, width: "100%", display: "flex", justifyContent: "center", gap: 34 }}>
        {STATES.map((s, i) => (
          <span key={s.id} style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.14em", textTransform: "uppercase", color: i === si ? C.ink : "rgba(241,240,236,0.25)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 9, height: 9, borderRadius: 5, background: i === si ? C.ink : "rgba(241,240,236,0.2)" }} />
            {s.id}
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", top: 64, width: "100%", textAlign: "center", fontFamily: F.display, fontWeight: 600, fontSize: 56, color: C.ink }}>Lamb</div>
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
