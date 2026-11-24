import { Easing, interpolate } from "remotion";

/* LambdaOS palette: black and white, never absolute. */
export const C = {
  void: "#050505",
  bg: "#080808",
  raise: "#101112",
  card: "#1B1E21",
  card2: "#24282C",
  line: "rgba(241,240,236,0.14)",
  lineStrong: "rgba(241,240,236,0.32)",
  ink: "#F1F0EC",
  mist: "#D8D9D6",
  grey: "#8A9096",
  dim: "#5A6066",
  paper: "#F4F4F2",
};

export const F = {
  display: "Montserrat",
  ui: "Inter",
  mono: "JetBrains Mono",
};

/* Easings */
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  snap: Easing.bezier(0.2, 0.9, 0.1, 1),
  soft: Easing.bezier(0.33, 0, 0.2, 1),
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 progress between two frames with an easing. */
export const prog = (f: number, a: number, b: number, e = ease.out) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });

/** Map a frame through keyframes. */
export const kf = (f: number, inp: number[], out: number[], e = ease.inOut) =>
  interpolate(f, inp, out, { ...clamp, easing: e });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** In-and-out envelope: fades in over [a,a+i], holds, fades out over [b-o,b]. */
export const env = (f: number, a: number, b: number, i = 8, o = 8) =>
  Math.min(prog(f, a, a + i, ease.out), 1 - prog(f, b - o, b, ease.in));

/** Deterministic pseudo random in [0,1). */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
