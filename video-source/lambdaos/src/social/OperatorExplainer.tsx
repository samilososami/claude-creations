import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  Briefcase,
  Check,
  ChevronRight,
  CircleDashed,
  FileCheck2,
  Fingerprint,
  Folder,
  KeyRound,
  Lock,
  Radar,
  ScanLine,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { C, F, ease, env, kf, lerp, prog } from "../theme";
import { LambdaGlyph } from "../brand/Brand";
import { Phone } from "../device/Phone";
import { OP, OperatorHome, StatusBar, TileIcon, TileId } from "../ui/Screens";
import { WifiOp } from "../explainer/WifiOp";
import { Card, Head, Leader, Mono, Outro, Scene, Shell, Tap, Word, at, remapN, remapper } from "./Kit";
import words from "./words-operator.json";
import edit from "./edit-operator.json";

export const OPX_DURATION = 1232; // 41.1 s

const N0 = {
  lambda: 0.68, control: 2.02, everything: 4.3, preferences: 6.0, settings: 6.92, tools: 7.72, all: 8.36, and: 10.2, every: 10.48, pentesting: 11.0,
  wifi: 12.46, bt: 13.54, usb: 13.94, radio: 14.84, net: 16.0, can: 16.62, each: 17.24, catalog: 18.34, built: 19.88, interface: 20.68,
  pick: 21.78, tool: 22.04, choose: 22.56, target: 22.96, operator2: 23.5, needs: 24.6, doing: 25.44, found: 26.64, every2: 27.24, result: 27.98,
  saved: 28.64, receipt: 29.28, outro: 36.28, tag: [37.4, 37.58, 37.94, 38.3, 38.64],
};
/* narration edit: "And much more, still in development." spliced in after "CAN.", status sentence cut.
   N0 is in original-take seconds; `more`/`development` are already in edited seconds. */
const N = { ...remapN(N0, remapper(edit.segments)), more: 17.39, development: 18.91 };

type Rect = { x: number; y: number; w: number; h: number };
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

/** Screen-space position of a point authored on the 1080 × 2280 phone screen. */
const onScreen = (cx: number, top: number, w: number, sx: number, sy: number) => {
  const k = (w * 0.956) / 1080;
  return { x: cx - w / 2 + w * 0.022 + sx * k, y: top + w * 0.052 + sy * k };
};

const Toggle: React.FC<{ on: boolean }> = ({ on }) => (
  <span style={{ width: 58, height: 32, borderRadius: 16, background: on ? C.ink : "rgba(241,240,236,0.14)", position: "relative", display: "inline-block" }}>
    <span style={{ position: "absolute", top: 4, left: on ? 30 : 4, width: 24, height: 24, borderRadius: 12, background: on ? "#111" : C.grey }} />
  </span>
);

const Row: React.FC<{ a: string; b: React.ReactNode }> = ({ a, b }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 27, padding: "9px 0", borderTop: "1px solid rgba(241,240,236,0.08)" }}>
    <span style={{ color: C.mist }}>{a}</span>
    <span style={{ fontFamily: F.mono, fontSize: 22, color: C.ink, letterSpacing: "0.04em" }}>{b}</span>
  </div>
);

const PANELS = [
  {
    k: N.preferences,
    t: "Preferences",
    i: <SlidersHorizontal size={36} />,
    rows: [
      ["Theme", "Dark"],
      ["Haptics", <Toggle key="h" on />],
      ["Language", "English"],
    ],
  },
  {
    k: N.settings,
    t: "Settings",
    i: <Settings2 size={36} />,
    rows: [
      ["Wi-Fi source", "Internal"],
      ["Adapter", "RTL8812AU"],
      ["Developer mode", <Toggle key="d" on={false} />],
    ],
  },
  {
    k: N.tools,
    t: "Tools",
    i: <Briefcase size={36} />,
    rows: [
      ["Wordlists", "203,109"],
      ["Sessions", "3 saved"],
      ["Receipts", "12"],
    ],
  },
] as const;

const SUBS: Record<TileId, string> = { wifi: "wlan · monitor", bt: "hci0 · BLE", usb: "OTG host", can: "can0", net: "LAN hosts", radio: "SDR" };
const LIGHT: [TileId, number][] = [
  ["wifi", N.wifi],
  ["bt", N.bt],
  ["usb", N.usb],
  ["radio", N.radio],
  ["net", N.net],
  ["can", N.can],
];

/* ───────────── 1–3 · the hub (one continuous phone) ───────────── */
const Hub: React.FC<{ f: number }> = ({ f }) => {
  const T = [0, 24, at(N.everything) - 4, at(N.everything) + 14, at(N.all) - 2, at(N.all) + 16, at(N.and) - 2, at(N.and) + 24, at(N.more) - 4, at(N.more) + 14];
  const cx = kf(f, T, [540, 540, 540, 290, 290, 540, 540, 540, 540, 540]);
  const top = kf(f, T, [1500, 450, 450, 420, 420, 450, 450, 56, 56, 16]);
  const w = kf(f, T, [430, 430, 430, 400, 400, 430, 430, 760, 760, 680]);
  const maskTop = kf(f, [at(N.more) - 4, at(N.more) + 14], [250, 200]);
  const maskTopW = kf(f, [at(N.more) - 4, at(N.more) + 14], [80, 55]);
  const maskBot = kf(f, [at(N.more) - 4, at(N.more) + 14], [1360, 1212]);
  const maskBotW = kf(f, [at(N.more) - 4, at(N.more) + 14], [80, 30]);
  const morePill = prog(f, at(N.more) + 2, at(N.more) + 14, ease.snap);
  const ry = kf(f, [0, 30, T[3], T[5], T[7]], [-22, -10, -14, -8, 0]);
  const rx = kf(f, [0, 30, T[7]], [10, 4, 0]);
  const expand = prog(f, at(N.each) - 4, at(N.each) + 14, ease.inOut);
  const a = 0;
  const b = at(N.each) + 16;
  if (f > b) return null;
  // highlights
  const hi: Partial<Record<TileId, number>> = {};
  const sub: Partial<Record<TileId, [string, number]>> = {};
  LIGHT.forEach(([id, t]) => {
    const s = at(t);
    const v = Math.max(prog(f, s - 2, s + 4, ease.snap) - prog(f, s + 12, s + 18, ease.inOut) * 0.75, 0);
    const all = env(f, at(N.can) + 8, at(N.each), 6, 8);
    hi[id] = Math.max(v, all * 0.9);
    sub[id] = [SUBS[id], prog(f, s - 2, s + 8)];
  });
  const pressSet = { wifi: env(f, at(N.each) - 8, at(N.each) - 2, 2, 3) };
  const gear = onScreen(cx, top, w, 1024 - 48, 220);
  const toolsNav = onScreen(cx, top, w, 180, 2075);
  const cardOut = prog(f, at(N.all) - 2, at(N.all) + 14, ease.inOut);
  const head1Out = prog(f, at(N.everything) - 8, at(N.everything) - 2, ease.in);
  const head2Out = prog(f, at(N.and) - 8, at(N.and) - 2, ease.in);
  return (
    <AbsoluteFill style={{ opacity: Math.min(prog(f, a, a + 6), 1 - prog(f, b - 6, b)) }}>
      <Head f={f} kicker="LambdaOS" title="Lambda Operator" sub="The control center" tk={4} tt={at(N.lambda) - 6} ts={at(N.control) - 2} out={head1Out} />
      <Head f={f} kicker="Control" title="Everything" sub="starts here" tk={at(N.everything) - 2} tt={at(N.everything) + 2} ts={at(N.everything) + 8} out={head2Out} size={88} />
      <Head f={f} kicker="Pentesting" title="Every tab" tk={at(N.and) + 20} tt={at(N.and) + 24} out={prog(f, at(N.each) - 6, at(N.each) + 2, ease.in)} size={84} top={112} />
      {/* phone */}
      <div
        style={{
          position: "absolute",
          left: cx - w / 2,
          top,
          opacity: 1 - prog(expand, 0.4, 0.9),
          WebkitMaskImage: `linear-gradient(180deg, transparent ${maskTop - top}px, #000 ${maskTop + maskTopW - top}px, #000 ${maskBot - top}px, transparent ${maskBot + maskBotW - top}px)`,
          maskImage: `linear-gradient(180deg, transparent ${maskTop - top}px, #000 ${maskTop + maskTopW - top}px, #000 ${maskBot - top}px, transparent ${maskBot + maskBotW - top}px)`,
        }}
      >
        <Phone width={w} ry={ry} rx={rx} glare={kf(f, [10, 60], [0, 1])}>
          <OperatorHome hi={hi} press={pressSet} sub={sub} tileIn={(i) => prog(f, 10 + i * 3, 26 + i * 3)} />
        </Phone>
      </div>
      {/* settings + tools presses on the phone */}
      <Tap f={f} a={at(N.settings) - 2} x={gear.x} y={gear.y} size={80} />
      <Tap f={f} a={at(N.tools) - 2} x={toolsNav.x} y={toolsNav.y} size={80} />
      {/* panels */}
      {PANELS.map((p, i) => {
        const pin = prog(f, at(p.k) - 4, at(p.k) + 12, ease.out);
        if (pin <= 0) return null;
        const y = 440 + i * 300;
        const src = i === 2 ? toolsNav : gear;
        const tx = lerp(0, src.x - 520, cardOut);
        const ty = lerp(0, src.y - y, cardOut);
        const s = 1 - cardOut * 0.85;
        return (
          <React.Fragment key={p.t}>
            <div style={{ opacity: 1 - cardOut }}>
              <Leader x1={src.x} y1={src.y} x2={520} y2={y + 40} p={prog(f, at(p.k) - 4, at(p.k) + 8, ease.inOut)} opacity={0.45} />
            </div>
            <Card
              hi={env(f, at(p.k) - 2, at(p.k) + 26, 4, 14) * 0.7}
              style={{
                position: "absolute",
                left: 520,
                top: y,
                width: 490,
                padding: "26px 30px 18px",
                opacity: pin * (1 - prog(cardOut, 0.6, 1)),
                transform: `translate(${tx + (1 - pin) * 60}px, ${ty}px) scale(${s})`,
                transformOrigin: "0 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40, fontWeight: 600, marginBottom: 12 }}>
                {p.i}
                {p.t}
              </div>
              {p.rows.map(([k, v], j) => (
                <div key={j} style={{ opacity: prog(f, at(p.k) + 2 + j * 3, at(p.k) + 12 + j * 3) }}>
                  <Row a={k as string} b={v} />
                </div>
              ))}
            </Card>
          </React.Fragment>
        );
      })}
      {/* more tabs on the way */}
      <div style={{ position: "absolute", top: 1226, width: "100%", display: "flex", justifyContent: "center", opacity: morePill * (1 - prog(f, at(N.each) - 6, at(N.each) + 2)), transform: `translateY(${(1 - morePill) * 40}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 40px", borderRadius: 999, border: `3px dashed rgba(241,240,236,${0.4 + 0.4 * env(f, at(N.more), at(N.development) + 10, 6, 10)})`, background: "rgba(20,22,24,0.9)", fontFamily: F.ui, color: C.ink }}>
          <CircleDashed size={42} strokeWidth={2.2} style={{ transform: `rotate(${f * 3}deg)` }} />
          <span style={{ fontSize: 40, fontWeight: 600 }}>{"+ More tabs"}</span>
          <span style={{ opacity: prog(f, at(N.development) - 4, at(N.development) + 6) }}>
            <Mono size={24} color={C.mist}>
              in development
            </Mono>
          </span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1300, width: "100%", textAlign: "center", opacity: env(f, at(N.all) + 6, at(N.and) - 2, 8, 8) }}>
        <Mono size={26} color={C.mist}>
          All in one place
        </Mono>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 4 · catalogs ───────────── */
type Tool = [React.ReactNode, string, string];
const CATS: { id: TileId; t: string; s: string; tools: Tool[] }[] = [
  {
    id: "wifi",
    t: "Wi-Fi",
    s: "wlan0 · wlan1 · monitor mode",
    tools: [
      [<Radar key="a" size={40} />, "Network scan", "Access points & clients"],
      [<KeyRound key="b" size={40} />, "Handshake capture", "WPA/WPA2 · target-bound"],
      [<Fingerprint key="c" size={40} />, "WPS audit", "Pixie Dust · PIN"],
      [<ShieldCheck key="d" size={40} />, "Key verification", "Offline · verified result"],
      [<ScanLine key="e" size={40} />, "Channel map", "2.4 & 5 GHz"],
    ],
  },
  {
    id: "bt",
    t: "Bluetooth",
    s: "hci0 · classic & LE",
    tools: [
      [<Radar key="a" size={40} />, "Device discovery", "Classic & BLE"],
      [<ScanLine key="b" size={40} />, "BLE explorer", "Services & characteristics"],
      [<KeyRound key="c" size={40} />, "Paired devices", "Trust & keys"],
      [<Fingerprint key="d" size={40} />, "Signal tracker", "RSSI over time"],
    ],
  },
  {
    id: "usb",
    t: "USB",
    s: "OTG · host mode",
    tools: [
      [<Radar key="a" size={40} />, "Adapters", "Detect & configure"],
      [<ScanLine key="b" size={40} />, "Interfaces", "Serial · HID · network"],
      [<KeyRound key="c" size={40} />, "Serial console", "UART over USB"],
    ],
  },
  {
    id: "radio",
    t: "Radio",
    s: "SDR · RTL2832",
    tools: [
      [<ScanLine key="a" size={40} />, "Spectrum view", "Live waterfall"],
      [<Radar key="b" size={40} />, "Frequency sweep", "Scan bands"],
      [<FileCheck2 key="c" size={40} />, "Signal capture", "Record IQ samples"],
    ],
  },
];
const SWITCH = [
  [0, 0],
  [1, at(N.built)],
  [2, at(N.built) + 11],
  [3, at(N.built) + 22],
  [0, at(N.pick) - 14],
] as const;

const Catalog: React.FC<{ f: number }> = ({ f }) => {
  const a = at(N.each) - 4;
  const b = at(N.choose) + 2;
  if (f < a || f > b + 1) return null;
  const expand = prog(f, at(N.each) - 4, at(N.each) + 14, ease.inOut);
  const from: Rect = { x: 246, y: 261, w: 284, h: 301 }; // Wi-Fi tile at the "and much more" framing (phone 680 wide, top 16)
  const to: Rect = { x: 60, y: 330, w: 960, h: 1040 };
  const r = lerpRect(from, to, expand);
  const out = prog(f, b - 10, b, ease.in);
  let cur = 0;
  let since = 0;
  SWITCH.forEach(([i, t]) => {
    if (f >= t) {
      cur = i;
      since = t;
    }
  });
  const cat = CATS[cur];
  const sw = prog(f, since, since + 8, ease.out);
  const railY = (id: TileId) => ["wifi", "bt", "usb", "can", "net", "radio"].indexOf(id) * 132;
  const si = SWITCH.findIndex((x) => x[1] === since && x[0] === cur);
  const prevId = si > 0 ? CATS[SWITCH[si - 1][0]].id : cat.id;
  const selY = lerp(railY(prevId), railY(cat.id), prog(f, since, since + 8, ease.out));
  const pickRow = 1;
  const pick = prog(f, at(N.tool) - 2, at(N.tool) + 6, ease.snap);
  const content = prog(expand, 0.55, 1);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${1 - out * 0.04})`, filter: `blur(${out * 8}px)` }}>
      <Head f={f} kicker="Catalogs" title={<>Tools per tab</>} tk={at(N.each) + 4} tt={at(N.catalog) - 6} out={out} size={84} top={130} />
      <div
        style={{
          position: "absolute",
          left: r.x,
          top: r.y,
          width: r.w,
          height: r.h,
          borderRadius: lerp(52 * 0.67, 40, expand),
          background: `color-mix(in srgb, ${OP.tile} ${100 - expand * 100}%, #151719 ${expand * 100}%)`,
          border: `2px solid rgba(241,240,236,${0.06 + 0.1 * expand})`,
          boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
          overflow: "hidden",
          fontFamily: F.ui,
          color: C.ink,
        }}
      >
        <div style={{ opacity: content, position: "absolute", inset: 0 }}>
          {/* rail */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 150, borderRight: "1px solid rgba(241,240,236,0.08)", paddingTop: 40 }}>
            <div style={{ position: "absolute", left: 22, top: 40 + selY, width: 106, height: 106, borderRadius: 30, background: C.ink }} />
            {(["wifi", "bt", "usb", "can", "net", "radio"] as TileId[]).map((id, i) => (
              <div key={id} style={{ position: "relative", height: 132, display: "flex", justifyContent: "center", paddingTop: 26 }}>
                <TileIcon id={id} size={54} mono color={id === cat.id ? "#111" : C.grey} />
              </div>
            ))}
          </div>
          {/* list */}
          <div style={{ position: "absolute", left: 190, right: 40, top: 46 }}>
            <div style={{ opacity: sw, transform: `translateY(${(1 - sw) * 30}px)` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
                <span style={{ fontFamily: F.display, fontWeight: 600, fontSize: 72 }}>{cat.t}</span>
              </div>
              <div style={{ marginTop: 6 }}>
                <Mono size={24}>{cat.s}</Mono>
              </div>
            </div>
            <div style={{ marginTop: 34 }}>
              {cat.tools.map(([icon, name, desc], j) => {
                const p = cur === 0 && since === 0 ? prog(f, at(N.each) + 8 + j * 3, at(N.each) + 20 + j * 3, ease.out) : prog(f, since + 1 + j * 1.5, since + 9 + j * 1.5, ease.out);
                const isPick = cur === 0 && j === pickRow && f >= at(N.pick) - 14;
                const hl = isPick ? pick : 0;
                return (
                  <div
                    key={name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 26,
                      padding: "26px 26px",
                      marginBottom: 16,
                      borderRadius: 30,
                      background: hl > 0 ? `rgba(241,240,236,${0.06 + 0.88 * hl})` : "rgba(241,240,236,0.04)",
                      color: hl > 0.5 ? "#0B0B0B" : C.ink,
                      opacity: p,
                      transform: `translateY(${(1 - p) * 40}px) scale(${1 - 0.03 * env(f, at(N.tool) - 2, at(N.tool) + 6, 2, 4) * (isPick ? 1 : 0)})`,
                    }}
                  >
                    <span style={{ width: 76, height: 76, borderRadius: 22, display: "grid", placeItems: "center", background: hl > 0.5 ? "rgba(0,0,0,0.08)" : "rgba(241,240,236,0.07)" }}>{icon}</span>
                    <span style={{ flex: 1 }}>
                      <div style={{ fontSize: 40, fontWeight: 600 }}>{name}</div>
                      <div style={{ fontSize: 26, color: hl > 0.5 ? "#333" : C.grey, marginTop: 4 }}>{desc}</div>
                    </span>
                    <ChevronRight size={36} color={hl > 0.5 ? "#111" : C.grey} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Tap f={f} a={at(N.tool) - 2} x={560} y={330 + 46 + 72 + 40 + 34 + 140 + 60} size={140} />
    </AbsoluteFill>
  );
};

/* ───────────── 5 · run: target → needs / doing / found ───────────── */
const NETS = [
  { s: "LAB-NET", ch: 6, sec: "WPA2", mine: true },
  { s: "••••••••", ch: 11, sec: "WPA2" },
  { s: "••••••", ch: 1, sec: "WPA3" },
  { s: "•••••••••", ch: 6, sec: "WPA2" },
  { s: "•••••", ch: 36, sec: "WPA2" },
];
const TargetScreen: React.FC<{ f: number; sel: number }> = ({ f, sel }) => (
  <AbsoluteFill style={{ background: OP.bg, fontFamily: F.ui, color: C.ink }}>
    <StatusBar time="23:14" />
    <div style={{ position: "absolute", left: 56, top: 170, fontSize: 70, fontWeight: 600 }}>Handshake capture</div>
    <div style={{ position: "absolute", left: 56, top: 268, fontFamily: F.mono, fontSize: 34, letterSpacing: "0.14em", color: C.grey }}>CHOOSE A TARGET</div>
    <div style={{ position: "absolute", left: 40, right: 40, top: 370 }}>
      {NETS.map((n, i) => {
        const on = n.mine && sel > 0.5;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 30,
              padding: "44px 40px",
              marginBottom: 22,
              borderRadius: 44,
              background: on ? C.ink : OP.tile,
              color: on ? "#0B0B0B" : C.ink,
              opacity: prog(f, 0, 1),
            }}
          >
            <TileIcon id="wifi" size={64} mono color={on ? "#111" : C.mist} />
            <span style={{ flex: 1, fontFamily: n.mine ? F.ui : F.mono, fontSize: 50, fontWeight: n.mine ? 600 : 400, color: on ? "#0B0B0B" : n.mine ? C.ink : C.grey }}>{n.s}</span>
            {n.mine && <span style={{ fontFamily: F.mono, fontSize: 26, letterSpacing: "0.12em", padding: "8px 16px", borderRadius: 12, border: `2px solid ${on ? "#0B0B0B" : C.lineStrong}` }}>AUTHORIZED</span>}
            <span style={{ fontFamily: F.mono, fontSize: 32, display: "flex", gap: 10, alignItems: "center", color: on ? "#222" : C.grey }}>
              <Lock size={30} /> {n.sec}
            </span>
          </div>
        );
      })}
    </div>
    <div style={{ position: "absolute", left: 56, right: 56, bottom: 120, height: 150, borderRadius: 75, background: sel > 0.5 ? C.ink : "rgba(241,240,236,0.1)", color: sel > 0.5 ? "#0B0B0B" : C.grey, display: "grid", placeItems: "center", fontSize: 50, fontWeight: 600 }}>
      Start capture
    </div>
  </AbsoluteFill>
);

const Run: React.FC<{ f: number }> = ({ f }) => {
  const a = at(N.choose) - 6;
  const b = at(N.every2) + 2;
  const sel = prog(f, at(N.target) - 2, at(N.target) + 4);
  const toOp = prog(f, at(N.operator2) - 2, at(N.operator2) + 12, ease.inOut);
  const cards = [
    { k: N.needs, l: "Needs", rows: ["Adapter in monitor mode", "Target · LAB-NET", "Your confirmation"] },
    { k: N.doing, l: "Doing", rows: [] as string[] },
    { k: N.found, l: "Found", rows: [] as string[] },
  ];
  const run = Math.max(0, f - at(N.doing));
  const bar = Math.min(1, run / 34);
  return (
    <Scene f={f} a={a} b={b}>
      <Head f={f} kicker="Every operation" title="Fully visible" tk={a + 2} tt={at(N.operator2) - 2} size={84} top={130} />
      <div style={{ position: "absolute", left: 60, top: 360 }}>
        <Phone width={410} ry={10} rx={3} glare={0.6}>
          <AbsoluteFill style={{ transform: `translateX(${-toOp * 100}%)` }}>
            <TargetScreen f={f} sel={sel} />
          </AbsoluteFill>
          <AbsoluteFill style={{ transform: `translateX(${(1 - toOp) * 100}%)` }}>
            <WifiOp f={f} needs={at(N.needs)} doing={at(N.doing)} found={at(N.found)} />
          </AbsoluteFill>
        </Phone>
      </div>
      <Tap f={f} a={at(N.target) - 2} x={260} y={360 + 22 + (370 + 70) * 0.363} size={100} />
      <div style={{ position: "absolute", left: 510, right: 60, top: 380, display: "flex", flexDirection: "column", gap: 24 }}>
        {cards.map((c, i) => {
          const p = prog(f, at(c.k) - 4, at(c.k) + 10, ease.out);
          const active = f >= at(c.k) - 4 && (i === 2 || f < at(cards[i + 1].k) - 4);
          return (
            <Card key={c.l} hi={active ? 0.7 : 0} style={{ padding: "26px 30px", minHeight: 230, opacity: 0.25 + 0.75 * p, transform: `translateX(${(1 - p) * 40}px)` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Mono size={26} color={active ? C.ink : C.grey}>
                  {`0${i + 1} · ${c.l}`}
                </Mono>
                {f >= at(c.k) + 8 && i < 2 && <Check size={30} strokeWidth={3} />}
              </div>
              {i === 0 && (
                <div style={{ marginTop: 14 }}>
                  {c.rows.map((r, j) => {
                    const rp = prog(f, at(c.k) + 2 + j * 4, at(c.k) + 10 + j * 4);
                    return (
                      <div key={r} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, marginTop: 10, opacity: rp }}>
                        <Check size={26} strokeWidth={3} color={C.mist} />
                        {r}
                      </div>
                    );
                  })}
                </div>
              )}
              {i === 1 && p > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 38, fontWeight: 600 }}>Capturing · ch 6</div>
                  <div style={{ marginTop: 18, height: 10, borderRadius: 5, background: "rgba(241,240,236,0.1)", overflow: "hidden" }}>
                    <div style={{ width: `${bar * 100}%`, height: "100%", background: C.ink }} />
                  </div>
                  <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between" }}>
                    <Mono size={22}>{`${Math.min(2400, Math.floor(run * 23.7)).toLocaleString("en-US")} frames`}</Mono>
                    <Mono size={22}>{`00:${String(12 + Math.floor(run / 30)).padStart(2, "0")}`}</Mono>
                  </div>
                </div>
              )}
              {i === 2 && p > 0 && (
                <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 22 }}>
                  <span style={{ width: 80, height: 80, borderRadius: 40, background: C.ink, display: "grid", placeItems: "center", transform: `scale(${prog(f, at(c.k), at(c.k) + 10, ease.snap)})` }}>
                    <Check size={48} color="#0B0B0B" strokeWidth={3} />
                  </span>
                  <div>
                    <div style={{ fontSize: 40, fontWeight: 600 }}>Handshake</div>
                    <Mono size={22}>Verified · LAB-NET</Mono>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </Scene>
  );
};

/* ───────────── 6 · receipt ───────────── */
const RECEIPT: [string, string][] = [
  ["DATE", "24 NOV 2026 · 23:14"],
  ["OPERATION", "Handshake capture"],
  ["TARGET", "LAB-NET (authorized)"],
  ["ADAPTER", "RTL8812AU · ch 6"],
  ["DURATION", "00:42"],
  ["RESULT", "VERIFIED"],
];
const Receipt: React.FC<{ f: number }> = ({ f }) => {
  const a = at(N.every2) - 4;
  const b = at(N.outro) - 2;
  const slotY = 420;
  const H = 880;
  const vis = kf(f, [at(N.every2), at(N.saved) + 20], [0, H], ease.out);
  const saved = prog(f, at(N.receipt) - 2, at(N.receipt) + 10, ease.snap);
  const zig = Array.from({ length: 23 })
    .map((_, i) => `${100 - (i / 22) * 100}% ${i % 2 ? 100 : 98.2}%`)
    .join(", ");
  return (
    <Scene f={f} a={a} b={b}>
      <Head f={f} kicker="Receipts" title="Every result, saved" tk={a + 4} tt={at(N.result) - 4} size={84} top={130} />
      <div style={{ position: "absolute", left: 150, top: slotY - 24, width: 780, height: 48, borderRadius: 24, background: "#1A1C1E", border: "2px solid rgba(241,240,236,0.16)", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", left: 50, right: 50, top: 21, height: 6, borderRadius: 3, background: "#000" }} />
      </div>
      <div style={{ position: "absolute", left: 190, top: slotY, width: 700, height: H + 40, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 20,
            top: vis - H,
            width: 660,
            height: H,
            background: "#ECEAE4",
            color: "#121212",
            fontFamily: F.mono,
            clipPath: `polygon(0 0, 100% 0, ${zig}, 0 100%)`,
            padding: "50px 50px",
            boxSizing: "border-box",
            transform: "rotate(-0.6deg)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <LambdaGlyph size={48} color="#121212" />
            <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.12em" }}>LAMBDA OPERATOR</span>
          </div>
          <div style={{ marginTop: 14, fontSize: 24, letterSpacing: "0.14em", color: "#555" }}>RECEIPT #0042</div>
          <div style={{ margin: "26px 0", borderTop: "3px dashed #999" }} />
          {RECEIPT.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 25, padding: "10px 0" }}>
              <span style={{ color: "#666", letterSpacing: "0.1em" }}>{k}</span>
              <span style={{ fontWeight: k === "RESULT" ? 700 : 500, display: "flex", alignItems: "center", gap: 10 }}>
                {v}
                {k === "RESULT" && <Check size={26} strokeWidth={3.4} />}
              </span>
            </div>
          ))}
          <div style={{ margin: "26px 0", borderTop: "3px dashed #999" }} />
          <div style={{ fontSize: 22, color: "#555", letterSpacing: "0.08em" }}>SHA-256 9f3c 1be0 77a2 … a71e</div>
          <div style={{ marginTop: 26, display: "flex", gap: 4, height: 70 }}>
            {Array.from({ length: 52 }).map((_, i) => (
              <span key={i} style={{ width: [2, 4, 3, 6, 2, 3][i % 6], background: "#121212", opacity: (i * 7) % 5 === 0 ? 0 : 1 }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, display: "flex", justifyContent: "center", opacity: saved, transform: `translateY(${(1 - saved) * 20}px)` }}>
        <span style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 28px", borderRadius: 999, background: C.ink, color: "#0B0B0B", fontFamily: F.ui, fontWeight: 600, fontSize: 30 }}>
          <Folder size={30} /> Saved to Files
        </span>
      </div>
    </Scene>
  );
};

export const OperatorExplainer: React.FC<{ withAudio?: boolean }> = ({ withAudio = false }) => {
  const f = useCurrentFrame();
  return (
    <Shell words={words as Word[]} audio="audio/opx-mix.wav" withAudio={withAudio} hideAfter={N.outro - 0.2}>
      <Hub f={f} />
      <Catalog f={f} />
      <Run f={f} />
      <Receipt f={f} />
      <Outro f={f} a={at(N.outro) - 4} end={OPX_DURATION} lambdaos={at(N.outro)} tag={N.tag.map(at)} />
    </Shell>
  );
};
