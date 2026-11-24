import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import {
  Bluetooth,
  Briefcase,
  Folder,
  Network,
  RadioTower,
  Settings,
  SquareTerminal,
  Usb,
  Wifi,
  BatteryCharging,
} from "lucide-react";
import { C, F } from "../theme";

/** Screens are authored at 1080 × 2280 (S10 FHD+). */

export const OP = {
  bg: "#191B1D",
  tile: "#23272A",
  tileHi: "#2E3337",
  nav: "#181A1C",
  divider: "#393D41",
  teal: "#519CA9",
  blue: "#588ECB",
};

export const StatusBar: React.FC<{ time?: string; color?: string; dim?: boolean }> = ({
  time = "22:40",
  color = C.ink,
  dim,
}) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 110,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 64px 0 56px",
      fontFamily: F.ui,
      fontSize: 38,
      fontWeight: 500,
      color,
      opacity: dim ? 0.7 : 1,
    }}
  >
    <span>{time}</span>
    <span style={{ display: "flex", gap: 22, alignItems: "center", marginRight: 90 }}>
      <Wifi size={40} strokeWidth={2.6} />
      <BatteryCharging size={44} strokeWidth={2.2} />
    </span>
  </div>
);

export type TileId = "wifi" | "bt" | "usb" | "can" | "net" | "radio";

const CanWave: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 16h3V8h4v8h3V8h4v8h3V8" />
    <path d="M19 8v8h3" />
  </svg>
);

export const TILES: { id: TileId; label: string }[] = [
  { id: "wifi", label: "Wi-Fi" },
  { id: "bt", label: "Bluetooth" },
  { id: "usb", label: "USB" },
  { id: "can", label: "CAN" },
  { id: "net", label: "Network" },
  { id: "radio", label: "Radio" },
];

export const TileIcon: React.FC<{ id: TileId; size: number; color?: string; mono?: boolean }> = ({
  id,
  size,
  color = C.ink,
  mono,
}) => {
  const sw = 1.6;
  switch (id) {
    case "wifi":
      return <Wifi size={size} color={mono ? color : OP.teal} strokeWidth={sw} />;
    case "bt":
      return <Bluetooth size={size} color={mono ? color : OP.blue} strokeWidth={sw} />;
    case "usb":
      return <Usb size={size} color={color} strokeWidth={sw} />;
    case "can":
      return <CanWave size={size} color={color} />;
    case "net":
      return <Network size={size} color={color} strokeWidth={sw} />;
    case "radio":
      return <RadioTower size={size} color={color} strokeWidth={sw} />;
  }
};

/**
 * Lambda Operator home (recreated from the 0.2.0-operator.4 screenshot, labels in English).
 * `hi` = per-tile highlight 0..1, `press` = per-tile press 0..1.
 */
export const OperatorHome: React.FC<{
  hi?: Partial<Record<TileId, number>>;
  press?: Partial<Record<TileId, number>>;
  tileIn?: (i: number) => number;
  mono?: boolean;
  /** optional small line under each tile label, with its opacity */
  sub?: Partial<Record<TileId, [string, number]>>;
}> = ({ hi = {}, press = {}, tileIn, mono, sub }) => (
  <AbsoluteFill style={{ background: OP.bg, fontFamily: F.ui, color: C.ink }}>
    <StatusBar time="11:01" />
    <div style={{ position: "absolute", left: 56, top: 168, fontSize: 92, fontWeight: 600, letterSpacing: -1 }}>Lambda</div>
    <div style={{ position: "absolute", right: 56, top: 172 }}>
      <Settings size={96} strokeWidth={1.5} color={C.ink} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 52,
        top: 348,
        width: 976,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 32,
      }}
    >
      {TILES.map((t, i) => {
        const h = hi[t.id] ?? 0;
        const p = press[t.id] ?? 0;
        const vin = tileIn ? tileIn(i) : 1;
        return (
          <div
            key={t.id}
            style={{
              height: 500,
              borderRadius: 52,
              background: h > 0 ? `color-mix(in srgb, ${OP.tile} ${100 - h * 100}%, #F1F0EC ${h * 100}%)` : OP.tile,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 56,
              transform: `scale(${(1 - p * 0.05) * (0.9 + 0.1 * vin)}) translateY(${(1 - vin) * 60}px)`,
              opacity: vin,
              color: h > 0.5 ? "#111" : C.ink,
              boxShadow: h > 0 ? `0 0 ${80 * h}px rgba(241,240,236,${0.25 * h})` : "none",
            }}
          >
            <TileIcon id={t.id} size={150} color={h > 0.5 ? "#111" : C.ink} mono={mono || h > 0.5} />
            <span style={{ fontSize: 62, fontWeight: 600 }}>{t.label}</span>
            {sub?.[t.id] && (
              <span style={{ fontFamily: F.mono, fontSize: 34, letterSpacing: "0.08em", marginTop: -36, opacity: sub[t.id]![1], color: h > 0.5 ? "#222" : C.mist }}>{sub[t.id]![0]}</span>
            )}
          </div>
        );
      })}
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 300,
        background: OP.nav,
        borderTop: `2px solid ${OP.divider}`,
        display: "flex",
        justifyContent: "space-around",
        paddingTop: 42,
        fontSize: 34,
      }}
    >
      {[
        { i: <Briefcase size={70} strokeWidth={1.5} />, l: "Tools", a: true },
        { i: <SquareTerminal size={70} strokeWidth={1.5} />, l: "Sessions", a: false },
        { i: <Folder size={70} strokeWidth={1.5} />, l: "Files", a: false },
      ].map((n) => (
        <div key={n.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, color: n.a ? C.ink : C.grey, fontWeight: n.a ? 600 : 400 }}>
          {n.i}
          <span>{n.l}</span>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

/** Real screenshot from the dev build, cover-fit to the screen. */
export const Shot: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => (
  <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} />
);

/** Lock screen recreated over the real wallpaper (clean, no SIM banner). */
export const LockScreen: React.FC<{ time?: string; date?: string; wallpaper?: string }> = ({
  time = "22:40",
  date = "Mon, 24 Nov",
  wallpaper = "img/lambda-dark-s10.png",
}) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Img src={staticFile(wallpaper)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <StatusBar time="" />
    <div style={{ position: "absolute", left: 70, top: 230, fontFamily: F.ui, fontSize: 44, color: C.ink }}>{date}</div>
    <div
      style={{
        position: "absolute",
        top: 470,
        width: "100%",
        textAlign: "center",
        fontFamily: F.display,
        fontWeight: 600,
        fontSize: 300,
        letterSpacing: 4,
        color: "#F4F4F2",
      }}
    >
      {time}
    </div>
    <div style={{ position: "absolute", bottom: 170, width: "100%", textAlign: "center", fontFamily: F.ui, fontSize: 40, color: C.ink }}>
      Swipe up to unlock
    </div>
  </AbsoluteFill>
);
