import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import {
  BatteryCharging,
  Bluetooth,
  Briefcase,
  Folder,
  Globe,
  Lock,
  MousePointer2,
  Network,
  RadioTower,
  Search,
  Settings,
  SquareTerminal,
  Usb,
  Wifi,
} from "lucide-react";
import { C, F, ease, env, prog } from "../theme";
import { LambdaGlyph } from "../brand/Brand";
import { Lamb } from "../lamb/Lamb";
import { TypeOn } from "../ui/Kinetic";
import { TileIcon } from "../ui/Screens";

/** The Lex desktop, authored at 1920 × 1080. */
const glass = "rgba(17,18,20,0.84)";

const Win: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  icon: React.ReactNode;
  p: number;
  active?: boolean;
  children: React.ReactNode;
}> = ({ x, y, w, h, title, icon, p, active, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 18,
      background: glass,
      backdropFilter: "blur(22px)",
      border: `1.5px solid ${active ? "rgba(241,240,236,0.32)" : "rgba(241,240,236,0.13)"}`,
      boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
      overflow: "hidden",
      opacity: Math.min(1, p * 1.5),
      transform: `translateY(${(1 - p) * 40}px) scale(${0.92 + 0.08 * p})`,
      transformOrigin: "50% 80%",
      fontFamily: F.ui,
      color: C.ink,
    }}
  >
    <div style={{ height: 42, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", borderBottom: "1px solid rgba(241,240,236,0.1)", fontSize: 16, color: C.mist }}>
      <span style={{ display: "flex", gap: 7 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 11, height: 11, borderRadius: 6, background: active && i === 0 ? C.ink : "rgba(241,240,236,0.22)" }} />
        ))}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
        {icon}
        {title}
      </span>
    </div>
    <div style={{ position: "absolute", top: 42, left: 0, right: 0, bottom: 0 }}>{children}</div>
  </div>
);

const NETS = [
  { s: "LAB-NET", ch: 6, sig: 4, sec: "WPA2", mine: true },
  { s: "••••••••", ch: 11, sig: 3, sec: "WPA2" },
  { s: "••••••", ch: 1, sig: 3, sec: "WPA3" },
  { s: "•••••••••", ch: 6, sig: 2, sec: "WPA2" },
  { s: "•••••", ch: 36, sig: 2, sec: "WPA2" },
  { s: "••••••••", ch: 44, sig: 1, sec: "WPA3" },
];

const Bars: React.FC<{ n: number; f: number; seed: number }> = ({ n, f, seed }) => (
  <span style={{ display: "inline-flex", gap: 3, alignItems: "flex-end", height: 18 }}>
    {[0, 1, 2, 3].map((i) => {
      const flick = Math.sin(f / 7 + seed + i) > 0.85 && i === n - 1 ? 0.4 : 1;
      return <span key={i} style={{ width: 5, height: 6 + i * 4, borderRadius: 1, background: i < n ? C.ink : "rgba(241,240,236,0.18)", opacity: i < n ? flick : 1 }} />;
    })}
  </span>
);

export const OperatorWin: React.FC<{ f: number; p: number; start: number; active?: boolean; x?: number; y?: number; w?: number; h?: number }> = ({
  f,
  p,
  start,
  active,
  x = 48,
  y = 76,
  w = 880,
  h = 560,
}) => {
  const cats: { id: "wifi" | "bt" | "usb" | "can" | "net" | "radio"; l: string }[] = [
    { id: "wifi", l: "Wi-Fi" },
    { id: "bt", l: "Bluetooth" },
    { id: "usb", l: "USB" },
    { id: "can", l: "CAN" },
    { id: "net", l: "Network" },
    { id: "radio", l: "Radio" },
  ];
  const sel = f > start + 70;
  return (
    <Win x={x} y={y} w={w} h={h} title="Lambda Operator" icon={<Briefcase size={16} />} p={p} active={active}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ width: 210, borderRight: "1px solid rgba(241,240,236,0.1)", padding: "18px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          {cats.map((c, i) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 14px", borderRadius: 12, background: i === 0 ? "rgba(241,240,236,0.1)" : "transparent", fontSize: 18, color: i === 0 ? C.ink : C.grey }}>
              <TileIcon id={c.id} size={22} mono />
              {c.l}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: "20px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 26, fontWeight: 600 }}>Networks in range</span>
            <span style={{ fontFamily: F.mono, fontSize: 14, color: C.grey, letterSpacing: "0.1em" }}>WLAN1 · RTL8812AU · MONITOR</span>
          </div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 60px 70px 80px", fontFamily: F.mono, fontSize: 13, color: C.dim, letterSpacing: "0.12em", padding: "0 14px 8px" }}>
            <span>SSID</span>
            <span>CH</span>
            <span>SIG</span>
            <span>SEC</span>
          </div>
          {NETS.map((n, i) => {
            const rp = prog(f, start + 10 + i * 5, start + 22 + i * 5);
            const isSel = sel && n.mine;
            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 60px 70px 80px",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: isSel ? C.ink : i % 2 ? "transparent" : "rgba(241,240,236,0.03)",
                  color: isSel ? "#0B0B0B" : C.ink,
                  fontSize: 18,
                  opacity: rp,
                  transform: `translateX(${(1 - rp) * 20}px)`,
                }}
              >
                <span style={{ fontFamily: n.mine ? F.ui : F.mono, fontWeight: n.mine ? 600 : 400, display: "flex", alignItems: "center", gap: 10, color: isSel ? "#0B0B0B" : n.mine ? C.ink : C.grey }}>
                  {n.s}
                  {n.mine && (
                    <span style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.12em", padding: "3px 8px", borderRadius: 6, border: `1px solid ${isSel ? "#0B0B0B" : C.lineStrong}` }}>AUTHORIZED</span>
                  )}
                </span>
                <span style={{ fontFamily: F.mono }}>{n.ch}</span>
                <span style={{ filter: isSel ? "invert(1)" : undefined }}>
                  <Bars n={n.sig} f={f} seed={i} />
                </span>
                <span style={{ fontFamily: F.mono, fontSize: 14, display: "flex", gap: 6, alignItems: "center" }}>
                  <Lock size={13} />
                  {n.sec}
                </span>
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              right: 26,
              bottom: 22,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 26px",
              borderRadius: 999,
              background: sel ? C.ink : "rgba(241,240,236,0.1)",
              color: sel ? "#0B0B0B" : C.grey,
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            <Wifi size={18} /> Capture LAB-NET
          </div>
        </div>
      </div>
    </Win>
  );
};

const TERM = [
  { t: "lambda@s10:~$ lambda status", c: C.ink, d: 0 },
  { t: "kernel   4.14.356-lambdaos+", c: C.grey, d: 34 },
  { t: "wlan0    BCM4375B1   internal  monitor", c: C.grey, d: 38 },
  { t: "wlan1    RTL8812AU   usb       monitor", c: C.grey, d: 42 },
  { t: "hci0     bluetooth   up", c: C.grey, d: 46 },
  { t: "can0     socketcan   down", c: C.grey, d: 50 },
  { t: "lex      LEX display 1920x1080 @ 60", c: C.mist, d: 54 },
  { t: "lambda@s10:~$ lambda wifi capture --target LAB-NET", c: C.ink, d: 92 },
];

export const TerminalWin: React.FC<{ f: number; p: number; start: number; x?: number; y?: number; w?: number; h?: number; active?: boolean }> = ({
  f,
  p,
  start,
  x = 960,
  y = 76,
  w = 912,
  h = 390,
  active,
}) => (
  <Win x={x} y={y} w={w} h={h} title="Terminal" icon={<SquareTerminal size={16} />} p={p} active={active}>
    <div style={{ padding: "18px 22px", fontFamily: F.mono, fontSize: 18, lineHeight: 1.7, background: "rgba(5,5,6,0.5)", height: "100%" }}>
      {TERM.map((l, i) => {
        const at = start + l.d;
        if (f < at) return null;
        const isCmd = l.t.startsWith("lambda@");
        const pp = isCmd ? prog(f, at, at + l.t.length * 0.9, ease.soft) : 1;
        const last = TERM.filter((x) => f >= start + x.d).length - 1 === i;
        return (
          <div key={i} style={{ color: l.c, whiteSpace: "pre" }}>
            {isCmd ? <TypeOn text={l.t} p={pp} frame={f} cursor={last} /> : l.t}
          </div>
        );
      })}
    </div>
  </Win>
);

export const LambWin: React.FC<{ f: number; p: number; start: number; x?: number; y?: number; w?: number; h?: number }> = ({ f, p, start, x = 960, y = 490, w = 440, h = 500 }) => (
  <Win x={x} y={y} w={w} h={h} title="Lamb" icon={<span style={{ fontSize: 14 }}>●</span>} p={p}>
    <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Lamb size={86} face={f > start + 60 ? "success" : "curious"} blink={env(f, start + 40, start + 46, 2, 3)} />
        <div style={{ fontFamily: F.mono, fontSize: 13, color: C.grey, letterSpacing: "0.12em" }}>ON-DEVICE · OFFLINE</div>
      </div>
      <div style={{ background: "#1C1F22", borderRadius: "20px 20px 20px 6px", padding: "14px 18px", fontSize: 19, lineHeight: 1.35, opacity: prog(f, start + 12, start + 22) }}>
        <TypeOn text="LEX is on. I put the capture on the big screen." p={prog(f, start + 12, start + 44, ease.soft)} cursor={false} />
      </div>
      <div style={{ alignSelf: "flex-end", background: C.ink, color: "#0B0B0B", borderRadius: "20px 20px 6px 20px", padding: "14px 18px", fontSize: 19, opacity: prog(f, start + 54, start + 62) }}>Nice. Keep it running.</div>
      <div style={{ background: "#1C1F22", borderRadius: "20px 20px 20px 6px", padding: "14px 18px", fontSize: 19, lineHeight: 1.35, opacity: prog(f, start + 70, start + 80) }}>
        <TypeOn text="On it." p={prog(f, start + 70, start + 80)} cursor={false} />
      </div>
    </div>
  </Win>
);

const NODES = [
  { x: 230, y: 70, l: "gateway", big: true },
  { x: 90, y: 200, l: "s10" },
  { x: 230, y: 250, l: "nas" },
  { x: 370, y: 200, l: "cam-01" },
  { x: 130, y: 330, l: "tv" },
  { x: 330, y: 330, l: "laptop" },
];
export const NetWin: React.FC<{ f: number; p: number; start: number; x?: number; y?: number }> = ({ f, p, start, x = 1424, y = 490 }) => (
  <Win x={x} y={y} w={448} h={500} title="Network map" icon={<Network size={16} />} p={p}>
    <svg width={448} height={458}>
      {NODES.slice(1).map((n, i) => {
        const lp = prog(f, start + 8 + i * 5, start + 24 + i * 5, ease.inOut);
        return <line key={i} x1={NODES[0].x} y1={NODES[0].y + 20} x2={NODES[0].x + (n.x - NODES[0].x) * lp} y2={NODES[0].y + 20 + (n.y - NODES[0].y - 20) * lp} stroke="rgba(241,240,236,0.35)" strokeWidth={1.5} />;
      })}
      {NODES.map((n, i) => {
        const np = prog(f, start + 4 + i * 5, start + 16 + i * 5, ease.snap);
        const pulse = i === 1 ? 0.5 + 0.5 * Math.sin(f / 6) : 0;
        return (
          <g key={n.l} opacity={np} transform={`translate(${n.x} ${n.y}) scale(${np})`}>
            {i === 1 && <circle r={26 + 10 * pulse} fill="none" stroke={C.ink} opacity={0.4 * (1 - pulse)} />}
            <circle r={n.big ? 20 : 14} fill={i === 1 ? C.ink : "#24282C"} stroke={C.ink} strokeWidth={1.5} />
            <text y={n.big ? 46 : 38} textAnchor="middle" fill={C.grey} fontFamily={F.mono} fontSize={14}>
              {n.l}
            </text>
          </g>
        );
      })}
      <text x={24} y={432} fill={C.dim} fontFamily={F.mono} fontSize={13} letterSpacing="0.12em">
        LAB-NET · 6 HOSTS · PASSIVE
      </text>
    </svg>
  </Win>
);

/** Top bar + dock + wallpaper. */
export const DesktopChrome: React.FC<{ f: number; dockIn: number; activeApp?: number; children?: React.ReactNode }> = ({ f, dockIn, activeApp = 0, children }) => {
  const apps = [
    <Briefcase key="o" size={30} strokeWidth={1.6} />,
    <SquareTerminal key="t" size={30} strokeWidth={1.6} />,
    <span key="l" style={{ display: "grid", placeItems: "center" }}>
      <Lamb size={40} />
    </span>,
    <Network key="n" size={30} strokeWidth={1.6} />,
    <Folder key="f" size={30} strokeWidth={1.6} />,
    <Globe key="g" size={30} strokeWidth={1.6} />,
    <Settings key="s" size={30} strokeWidth={1.6} />,
  ];
  return (
    <AbsoluteFill style={{ background: "#060606", overflow: "hidden" }}>
      <Img src={staticFile("img/fold-art.webp")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 70%", filter: "brightness(0.24) contrast(1.35) grayscale(1)" }} />
      <div style={{ position: "absolute", right: 250, top: 130, opacity: 0.07, WebkitMaskImage: "linear-gradient(180deg,#000 55%,transparent 85%)" }}>
        <LambdaGlyph size={620} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.45))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", background: "rgba(8,8,8,0.55)", backdropFilter: "blur(16px)", fontFamily: F.ui, fontSize: 17, color: C.ink, borderBottom: "1px solid rgba(241,240,236,0.08)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <LambdaGlyph size={22} />
          <b style={{ fontWeight: 600 }}>LEX</b>
          <span style={{ color: C.grey }}>Operator</span>
          <span style={{ color: C.grey }}>Window</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 18, color: C.mist }}>
          <Search size={17} />
          <Usb size={17} />
          <Bluetooth size={17} />
          <Wifi size={17} />
          <BatteryCharging size={19} />
          <span style={{ fontFamily: F.mono, fontSize: 16 }}>Mon 24 Nov · 23:14</span>
        </span>
      </div>
      {children}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 18,
          transform: `translate(-50%, ${(1 - dockIn) * 120}px)`,
          display: "flex",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 26,
          background: "rgba(14,15,16,0.72)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(241,240,236,0.12)",
        }}
      >
        {apps.map((a, i) => (
          <div key={i} style={{ width: 62, height: 62, borderRadius: 16, display: "grid", placeItems: "center", color: C.ink, background: i === activeApp ? "rgba(241,240,236,0.14)" : "rgba(241,240,236,0.04)", position: "relative", transform: `translateY(${(1 - prog(dockIn * 30, i * 2, i * 2 + 10)) * 30}px)` }}>
            {a}
            {i < 4 && <span style={{ position: "absolute", bottom: -6, width: 5, height: 5, borderRadius: 3, background: C.mist }} />}
          </div>
        ))}
      </div>
      <div style={{ display: "none" }}>{f}</div>
    </AbsoluteFill>
  );
};

export const Cursor: React.FC<{ x: number; y: number; press?: number }> = ({ x, y, press = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - press * 0.15})`, transformOrigin: "0 0", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}>
    <MousePointer2 size={34} color="#0B0B0B" fill={C.ink} strokeWidth={1.4} />
  </div>
);

export { RadioTower };
