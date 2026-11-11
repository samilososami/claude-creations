/* GlassPhone · escena WebGL
   Un único canvas fijo dibuja el "mundo" (el cielo a distintas horas), las palabras
   gigantes que viven en él, las gotas de agua sobre el cristal de la página y el
   teléfono. El sombreador del teléfono vuelve a evaluar ese mismo mundo desplazado,
   así que la refracción es real: lo que se ve a través del cristal es lo que hay detrás. */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t * t * (3 - 2 * t);
const hex = h => [(h >> 16 & 255) / 255, (h >> 8 & 255) / 255, (h & 255) / 255];
const P = Math.PI;

/* Las cinco horas del día. Cada capítulo de la página ocurre en una. */
export const DAYS = [
  { name: 'alba', top: 0xbcd7ee, bot: 0xf7dfcc, a: 0xffc8a6, b: 0xe6d3f2, ink: 0x0d1524, light: [1, .93, .84], sun: [.2, .3, .7], tint: 0x8fdcc6, gy: 0 },
  { name: 'mediodía', top: 0x86c6ea, bot: 0xe6f4ee, a: 0xf6fbf4, b: 0xa2e2cf, ink: 0x0a1522, light: [1, 1, 1], sun: [.72, .86, 1], tint: 0x7fd8c0, gy: .16 },
  { name: 'hora dorada', top: 0xf0c39b, bot: 0xf8e6c2, a: 0xff9a62, b: 0xf5b6c6, ink: 0x2a140a, light: [1, .8, .55], sun: [.84, .34, 1], tint: 0xd9d68f, gy: -.1 },
  { name: 'crepúsculo', top: 0x100f30, bot: 0x5f2a58, a: 0xc65c4a, b: 0x44308a, ink: 0xfff1e8, light: [1, .62, .7], sun: [.5, .04, .55], tint: 0xb9a7e8, gy: -.42 },
  { name: 'noche', top: 0x03050b, bot: 0x0b1530, a: 0x0f3d55, b: 0x1b1d55, ink: 0xeaf2ff, light: [.62, .78, 1], sun: [.78, .82, .22], tint: 0x8fd6e6, gy: -.3 },
].map(d => ({ ...d, top: hex(d.top), bot: hex(d.bot), a: hex(d.a), b: hex(d.b), ink: hex(d.ink), tint: hex(d.tint) }));

const KEYS = ['x', 'y', 's', 'rx', 'ry', 'rz', 'scr', 'ui', 'xr', 'day', 'lens'];

/* Coreografía: [selector, punto del elemento, estado en móvil, ajustes en escritorio].
   x / y son fracciones de pantalla desde el centro, s es la altura del teléfono
   respecto a la pantalla. Cada parada hereda lo que no redefine. */
const STOPS = [
  ['#hero', .5, { x: 0, y: -.03, s: .44, rx: -.16, ry: .55, rz: -.12, scr: 0, ui: 0, xr: 0, day: 0, lens: 0 }, { y: -.02, s: .6 }],
  ['#nada .chapter__title', .5, { y: 0, s: .5, rx: .12, ry: P * .5 - .12, rz: .06, day: .8 }, { x: 0, s: .62 }],
  ['#nada .chapter__stage', .55, { y: .2, s: .4, rx: .22, ry: P * .5 + .4, rz: .28, day: 1 }, { x: .2, y: 0, s: .6 }],
  ['#cristal .chapter__title', .5, { y: 0, s: .5, rx: -.1, ry: P + .35, rz: -.08, day: 1.2 }, { x: 0, s: .62 }],
  ['#cristal .chapter__stage', .55, { y: .2, s: .42, rx: -.2, ry: P - .4, rz: -.14, day: 1.5 }, { x: -.2, y: 0, s: .62 }],
  ['#luz .chapter__title', .5, { y: 0, s: .52, rx: 0, ry: 2 * P - .5, rz: .05, scr: .15, day: 1.9 }, { x: 0, s: .64 }],
  ['#luz .chapter__stage', .55, { y: .2, s: .44, rx: -.06, ry: 2 * P + .22, rz: .04, scr: 1, day: 2 }, { x: .2, y: 0, s: .66 }],
  ['#gota .chapter__title', .5, { y: -.26, s: .95, rx: .1, ry: 3 * P - .3, rz: 0, scr: .25, lens: 1, day: 2.1 }, { x: 0, y: -.34, s: 1.25 }],
  ['#gota .chapter__stage', .55, { y: -.02, s: .8, rx: .16, ry: 3 * P + .3, rz: -.1, scr: 0, lens: 1, day: 2.3 }, { x: -.2, y: -.3, s: 1.2 }],
  ['#glassos .chapter__title', .5, { y: 0, s: .52, rx: 0, ry: 4 * P - .35, rz: .04, scr: 1, ui: 1, lens: 0, day: 3 }, { x: 0, y: 0, s: .64 }],
  ['#os-a', .55, { y: .2, s: .44, ry: 4 * P + .2, ui: 1, day: 3 }, { x: .2, y: 0, s: .66 }],
  ['#os-b', .55, { y: .2, s: .44, ry: 4 * P - .22, ui: 2, day: 3.1 }, { x: .2, y: 0, s: .66 }],
  ['#ficha', .5, { x: .3, y: .02, s: .95, rx: .25, ry: 4 * P + .9, rz: .3, scr: 0, xr: 1, day: 3.5 }, { x: .32, y: 0, s: 1.15 }],
  ['#tocalo', .5, { x: 0, y: .12, s: .44, rx: -.08, ry: 4 * P + .45, rz: 0, scr: 1, ui: 1, xr: 0, day: 4 }, { y: .1, s: .5 }],
  ['#simulador', .5, { y: .2, s: .38, rx: -.04, ry: 4 * P + .12, scr: 1, ui: 0, day: 4 }, { x: -.2, y: 0, s: .6 }],
  ['#info', .35, { y: .95, s: .3, ry: 4 * P + .8, scr: 0, day: 4 }, { x: 0, y: .95, s: .3 }],
];

/* ───────────────────────── GLSL ───────────────────────── */

const GLSL_WORLD = `
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uTop;
uniform vec3 uBot;
uniform vec3 uGlowA;
uniform vec3 uGlowB;
uniform vec3 uInk;
uniform vec3 uSun;
uniform float uGlowY;
uniform float uStars;
uniform sampler2D uWords;
uniform vec4 uWordRect[3];
uniform vec4 uWordUV[3];
uniform float uWordA[3];

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 world(vec2 uv) {
  float asp = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - .5) * asp, uv.y - .5);
  float t = uTime;
  float g = uv.y + .07 * sin(uv.x * 2.4 + t * .11) + .035 * sin(uv.x * 5.1 - t * .07);
  vec3 c = mix(uBot, uTop, smoothstep(-.05, 1.05, g));
  vec2 a = vec2(.36 * asp * sin(t * .05 + 1.3), uGlowY + .1 * cos(t * .043));
  vec2 b = vec2(-.34 * asp * cos(t * .037 + .5), .12 - .2 * sin(t * .052 + 2.));
  c = mix(c, uGlowA, .62 * exp(-dot(p - a, p - a) * 2.4));
  c = mix(c, uGlowB, .5 * exp(-dot(p - b, p - b) * 3.));
  vec2 s = vec2((uSun.x - .5) * asp, uSun.y - .5);
  float sd = length(p - s);
  c += uSun.z * (vec3(1., .95, .86) * exp(-sd * sd * 10.) * .5 + exp(-sd * 2.4) * .1);
  if (uStars > .01) {
    vec2 q = vec2(uv.x * asp, uv.y) * 80.;
    vec2 id = floor(q);
    float h = hash12(id);
    vec2 o = vec2(hash12(id + 7.3), hash12(id + 13.1)) - .5;
    float st = step(.955, h) * smoothstep(.11, 0., length(fract(q) - .5 - o * .6));
    c += uStars * st * (.45 + .55 * sin(t * (1. + h * 2.) + h * 40.));
  }
  return c;
}

float wordMask(vec2 uv) {
  float m = 0.;
  for (int i = 0; i < 3; i++) {
    vec2 q = (uv - uWordRect[i].xy) / uWordRect[i].zw;
    if (q.x > 0. && q.x < 1. && q.y > 0. && q.y < 1.) {
      m = max(m, texture2D(uWords, uWordUV[i].xy + q * uWordUV[i].zw).r * uWordA[i]);
    }
  }
  return m;
}

vec3 scene(vec2 uv) {
  return mix(world(uv), uInk, wordMask(uv));
}
`;

const BG_VERT = `
void main() {
  gl_Position = vec4(position.xy, 0., 1.);
}
`;

const bgFrag = n => `
#define NDROPS ${n}
${GLSL_WORLD}
uniform vec3 uDrops[NDROPS];
uniform vec4 uPh;
uniform float uPhRot;
uniform float uShadow;
uniform float uDark;
uniform vec3 uLight;

float sdRound(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes;
  float asp = uRes.x / uRes.y;
  vec3 col = scene(uv);

  // sombra blanda y cáustica del teléfono sobre la pared
  vec2 sp = vec2((uv.x - uPh.x) * asp, uv.y - uPh.y) - vec2(.035, -.05) * uPh.w * 2.;
  float cr = cos(uPhRot), sr = sin(uPhRot);
  sp = vec2(cr * sp.x + sr * sp.y, -sr * sp.x + cr * sp.y);
  float sdv = sdRound(sp, uPh.zw, min(uPh.z, uPh.w) * .6);
  float sh = (1. - smoothstep(-.02, .12, sdv)) * uShadow;
  float ca = exp(-pow((sdv - .03) / .03, 2.)) * uShadow;
  col *= 1. - sh * .11 * (1. - uDark);
  col += uLight * (ca * .05 * (1. - uDark) + sh * .05 * uDark);

  // gotas: metabolas con normal de casquete
  float f = 0.;
  float ra = 0.;
  vec2 g = vec2(0.);
  for (int i = 0; i < NDROPS; i++) {
    vec3 d = uDrops[i];
    vec2 v = frag - d.xy;
    float d2 = dot(v, v) + .001;
    float w = d.z * d.z / d2;
    f += w;
    ra += w * d.z;
    g += w / d2 * v;
  }
  if (f > .7) {
    vec2 n2 = normalize(g + vec2(.00001));
    float lit = dot(n2, normalize(vec2(-.6, .8)));
    if (f > 1.) {
      float rho = inversesqrt(f);
      float h = sqrt(max(0., 1. - rho * rho));
      float rl = ra / f;
      vec2 off = -n2 * rho * rho * rl * 1.15;
      vec3 c = scene((frag + off) / uRes) * 1.03;
      c *= 1. - .3 * rho * rho * max(lit, 0.);
      c += uLight * .34 * pow(rho, 3.) * max(-lit, 0.);
      vec3 N = normalize(vec3(n2 * rho * rho, .55 + h));
      float spc = pow(max(dot(N, normalize(vec3(-.42, .58, .7))), 0.), 70.);
      c += spc * .95;
      col = mix(col, c, smoothstep(1., 1.1, f));
    } else {
      col *= 1. - .2 * smoothstep(.72, 1., f) * (.35 + .65 * max(-lit, 0.)) * (1. - uDark * .5);
    }
  }

  col += (hash12(frag + fract(uTime) * 91.7) - .5) * (2. / 255.);
  gl_FragColor = vec4(col, 1.);
}
`;

const GLASS_VERT = `
varying vec3 vN;
varying vec3 vV;
varying vec3 vObjN;
varying vec3 vObjP;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  vN = normalize(normalMatrix * normal);
  vV = -mv.xyz;
  vObjN = normal;
  vObjP = position;
  gl_Position = projectionMatrix * mv;
}
`;

const GLASS_FRAG = `
${GLSL_WORLD}
uniform float uBackPass;
uniform float uLens;
uniform float uRefFace;
uniform float uRefEdge;
uniform float uDisp;
uniform float uTintAmt;
uniform float uDark;
uniform vec3 uTint;
uniform vec3 uLight;
varying vec3 vN;
varying vec3 vV;
varying vec3 vObjN;
varying vec3 vObjP;

// estudio procedural. Con fondo claro la habitación es oscura (el canto del cristal
// se dibuja en negro, como en fotografía de campo claro); de noche manda la luz.
vec3 envMap(vec3 r, float e) {
  vec3 room = mix(uBot, uTop, smoothstep(-.6, .8, r.y)) * mix(mix(.85, .34, e), .8, uDark);
  float soft = smoothstep(.4, .56, r.y) * (1. - smoothstep(.78, .92, r.y)) * smoothstep(-.6, .2, r.z) * e;
  float strip = smoothstep(.9, .985, abs(r.x)) * smoothstep(-.7, 0., r.y) * (1. - smoothstep(.6, .9, r.y));
  float win = smoothstep(.5, .68, r.x) * (1. - smoothstep(.8, .92, r.x)) * smoothstep(-.3, -.05, r.y) * (1. - smoothstep(.45, .7, r.y));
  float bar = 1. - .5 * smoothstep(.02, .0, abs(r.y - .2)) - .5 * smoothstep(.015, .0, abs(r.x - .74));
  return room + uLight * mix(.4, 1., uDark) * (soft * 2.4 + strip * 5. + win * bar * 6.);
}

void main() {
  // three invierte el sentido de las caras con BackSide, así que gl_FrontFacing no
  // sirve para la pasada trasera: ahí la normal se voltea siempre.
  vec3 N = normalize(vN);
  if (uBackPass > .5 || !gl_FrontFacing) N = -N;
  vec3 V = normalize(vV);
  float ndv = clamp(dot(N, V), 0., 1.);
  float F = .04 + .96 * pow(1. - ndv, 5.);
  float edge = mix(1. - smoothstep(.5, .995, abs(normalize(vObjN).z)), 1., uLens);
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;

  vec2 dir = N.xy * (uBackPass > .5 ? 1. : -1.);
  vec2 off = dir * mix(uRefFace, uRefEdge, edge);
  off.x /= asp;
  float ds = uDisp * (.3 + .7 * edge);
  vec3 refr = vec3(
    scene(uv + off * (1. - ds)).r,
    scene(uv + off).g,
    scene(uv + off * (1. + ds)).b
  );
  refr *= mix(vec3(1.), uTint, .09 + uTintAmt * edge) * mix(.955, 1., max(edge, uDark));

  vec3 R = reflect(-V, N);
  vec3 env = envMap(R, edge);
  // un brillo diagonal que recorre la cara al girar el teléfono
  float sw = dot(vObjP.xy, vec2(.82, .46)) - (R.x * 1.7 + R.y * .9);
  float sheen = (exp(-sw * sw * 26.) + .5 * exp(-(sw - .34) * (sw - .34) * 160.)) * (1. - edge) * (1. - uLens);
  float rim = pow(1. - ndv, 3.) * edge;
  vec3 Hv = normalize(normalize(vec3(-.5, .75, .6)) + V);
  float glint = pow(max(dot(N, Hv), 0.), 180.) * edge;
  vec3 col;
  float a;
  if (uBackPass > .5) {
    col = refr * (1. - .3 * edge * (1. - .6 * uDark)) + env * F * .25 + uLight * rim * .14 * uDark;
    a = 1.;
  } else {
    float m = edge;
    col = refr * m * (1. - F) + env * F + uLight * (rim * .3 * uDark + glint * 1.1 + sheen * mix(.1, .085, uDark));
    a = m + (1. - m) * clamp(F + .02 + sheen * .06, 0., 1.);
  }
  col += (hash12(gl_FragCoord.xy + 3.7) - .5) * (2. / 255.) * a;
  gl_FragColor = vec4(col, a);
}
`;

const UI_VERT = `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  vN = normalize(normalMatrix * normal);
  vV = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const UI_FRAG = `
uniform sampler2D uUiA;
uniform sampler2D uUiB;
uniform float uUiMix;
uniform float uScreen;
uniform float uDark;
uniform vec3 uInk;
uniform vec3 uTop;
uniform vec2 uSize;
varying vec2 vUv;
void main() {
  vec3 m = mix(texture2D(uUiA, vUv).rgb, texture2D(uUiB, vUv).rgb, uUiMix);
  float pa = m.r * mix(.46, .17, uDark);
  float ga = m.g * .96;
  vec3 frost = mix(vec3(1.), uTop, .12);
  vec3 col = mix(frost * pa, uInk, ga);
  float a = pa + ga * (1. - pa);
  vec2 q = abs(vUv - .5) * uSize - (uSize * .5 - .1);
  float d = length(max(q, 0.)) - .1;
  float k = uScreen * (1. - smoothstep(-.004, .004, d)) * (gl_FrontFacing ? 1. : .62);
  gl_FragColor = vec4(col * k, a * k);
}
`;

const MASK_FRAG = `
uniform sampler2D uMask;
uniform float uAmt;
uniform float uDark;
uniform float uTime;
uniform vec3 uInk;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  float m = texture2D(uMask, vUv).r;
  float ndv = abs(dot(normalize(vN), normalize(vV)));
  vec3 irid = .5 + .5 * cos(6.2831 * (vec3(0., .33, .67) + ndv * 1.6 + vUv.y * .9 + uTime * .04));
  vec3 col = mix(mix(uInk, irid * .55, .45), mix(vec3(1.), irid, .55), uDark);
  float a = m * uAmt * mix(.55, .8, uDark);
  gl_FragColor = vec4(col * a, a);
}
`;

/* ───────────────────── geometría ───────────────────── */

/* Losa de esquinas y cantos redondeados, con normales analíticas. */
function slabGeometry(THREE, w, h, d, R, r, cs = 14, ps = 8) {
  const hw = w / 2, hh = h / 2;
  R = Math.min(R, hw, hh);
  r = Math.min(r, d / 2, R * .98);
  const outline = [];
  const corners = [[hw - R, hh - R, 0], [-(hw - R), hh - R, P / 2], [-(hw - R), -(hh - R), P], [hw - R, -(hh - R), P * 1.5]];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= cs; i++) {
      const a = a0 + (i / cs) * P / 2;
      outline.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, nx: Math.cos(a), ny: Math.sin(a) });
    }
  }
  const zf = d / 2 - r;
  const prof = [];
  for (let j = 0; j <= ps; j++) {
    const th = P / 2 * (1 - j / ps);
    prof.push({ c: Math.cos(th), s: Math.sin(th), z: zf + Math.sin(th) * r });
  }
  for (let j = 0; j <= ps; j++) {
    const th = -P / 2 * (j / ps);
    prof.push({ c: Math.cos(th), s: Math.sin(th), z: -zf + Math.sin(th) * r });
  }
  const n = outline.length, m = prof.length;
  const pos = [], nor = [], uv = [], idx = [];
  for (const p of prof) {
    for (const o of outline) {
      const x = o.x - o.nx * r * (1 - p.c), y = o.y - o.ny * r * (1 - p.c);
      pos.push(x, y, p.z);
      nor.push(o.nx * p.c, o.ny * p.c, p.s);
      uv.push(x / w + .5, y / h + .5);
    }
  }
  for (let j = 0; j < m - 1; j++) {
    for (let i = 0; i < n; i++) {
      const a = j * n + i, b = j * n + (i + 1) % n, c = (j + 1) * n + i, e = (j + 1) * n + (i + 1) % n;
      idx.push(a, c, b, b, c, e);
    }
  }
  const cf = pos.length / 3;
  pos.push(0, 0, d / 2); nor.push(0, 0, 1); uv.push(.5, .5);
  const cb = cf + 1;
  pos.push(0, 0, -d / 2); nor.push(0, 0, -1); uv.push(.5, .5);
  const last = (m - 1) * n;
  for (let i = 0; i < n; i++) {
    idx.push(cf, i, (i + 1) % n);
    idx.push(cb, last + (i + 1) % n, last + i);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

/* Casquete esférico: la lente gota. */
function capGeometry(THREE, radius, height, rings = 16, segs = 48) {
  const Rs = (radius * radius + height * height) / (2 * height);
  const phiMax = Math.asin(Math.min(1, radius / Rs));
  const pos = [], nor = [], idx = [];
  for (let k = 0; k <= rings; k++) {
    const ph = phiMax * k / rings;
    for (let i = 0; i < segs; i++) {
      const th = i / segs * P * 2;
      const nx = Math.sin(ph) * Math.cos(th), ny = Math.sin(ph) * Math.sin(th), nz = Math.cos(ph);
      pos.push(Rs * nx, Rs * ny, Rs * nz - (Rs - height));
      nor.push(nx, ny, nz);
    }
  }
  for (let k = 0; k < rings; k++) {
    for (let i = 0; i < segs; i++) {
      const a = k * segs + i, b = k * segs + (i + 1) % segs, c = (k + 1) * segs + i, e = (k + 1) * segs + (i + 1) % segs;
      idx.push(a, c, b, b, c, e);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/* ───────────────────── texturas dibujadas ───────────────────── */

const rr = (c, x, y, w, h, r) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};

/* Canal rojo = paneles esmerilados, canal verde = tinta (texto e iconos). */
function drawUI(kind) {
  const W = 512, H = 1108;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  c.fillStyle = '#000';
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'lighter';
  const panel = (x, y, w, h, r, a = 1) => { c.fillStyle = `rgba(255,0,0,${a})`; rr(c, x, y, w, h, r); c.fill(); };
  const ink = (a = 1) => { c.fillStyle = `rgba(0,255,0,${a})`; c.strokeStyle = `rgba(0,255,0,${a})`; };
  const bar = (x, y, w, h, a = 1) => { ink(a); rr(c, x, y, w, h, h / 2); c.fill(); };
  const text = (s, x, y, font, a = 1, align = 'center') => { ink(a); c.font = font; c.textAlign = align; c.fillText(s, x, y); };
  const glyph = (x, y, s, i) => {
    ink(.95); c.lineWidth = s * .09; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath();
    const k = i % 8;
    if (k === 0) { c.arc(x, y, s * .26, 0, P * 2); c.moveTo(x, y - s * .13); c.lineTo(x, y); c.lineTo(x + s * .1, y + s * .06); }
    else if (k === 1) { rr(c, x - s * .26, y - s * .2, s * .52, s * .4, s * .1); c.moveTo(x - s * .1, y + s * .2); c.lineTo(x - s * .16, y + s * .3); }
    else if (k === 2) { rr(c, x - s * .28, y - s * .18, s * .56, s * .4, s * .09); c.moveTo(x + s * .11, y + s * .02); c.arc(x, y + s * .02, s * .11, 0, P * 2); }
    else if (k === 3) { c.arc(x - s * .06, y - s * .04, s * .13, 0, P * 2); c.moveTo(x - s * .28, y + s * .26); c.quadraticCurveTo(x - s * .06, y + s * .02, x + s * .16, y + s * .26); }
    else if (k === 4) { rr(c, x - s * .24, y - s * .24, s * .48, s * .48, s * .1); c.moveTo(x - s * .24, y - s * .08); c.lineTo(x + s * .24, y - s * .08); }
    else if (k === 5) { c.arc(x, y, s * .12, 0, P * 2); for (let q = 0; q < 8; q++) { const a = q * P / 4; c.moveTo(x + Math.cos(a) * s * .2, y + Math.sin(a) * s * .2); c.lineTo(x + Math.cos(a) * s * .28, y + Math.sin(a) * s * .28); } }
    else if (k === 6) { c.moveTo(x - s * .2, y - s * .18); c.lineTo(x + s * .2, y - s * .18); c.moveTo(x - s * .2, y); c.lineTo(x + s * .2, y); c.moveTo(x - s * .2, y + s * .18); c.lineTo(x + s * .06, y + s * .18); }
    else { c.moveTo(x - s * .1, y + s * .2); c.lineTo(x - s * .1, y - s * .2); c.lineTo(x + s * .2, y - s * .26); c.lineTo(x + s * .2, y + s * .12); c.moveTo(x - s * .1, y + s * .2); c.arc(x - s * .18, y + s * .2, s * .08, 0, P * 2); }
    c.stroke();
  };
  const SER = '300 ', SANS = 'Geist, system-ui, sans-serif';
  const now = new Date();
  const hhmm = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');

  if (kind === 0) {
    const date = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    text(date, W / 2, 168, `500 27px ${SANS}`, .85);
    text(hhmm, W / 2, 356, `${SER}196px Fraunces, serif`, 1);
    for (let i = 0; i < 2; i++) {
      const y = 628 + i * 132;
      panel(32, y, 448, 114, 36);
      panel(54, y + 27, 60, 60, 20);
      glyph(84, y + 57, 60, i + 1);
      bar(134, y + 34, 150 - i * 30, 13, .95);
      bar(134, y + 62, 270 + i * 30, 11, .5);
      bar(410, y + 34, 44, 10, .4);
    }
    panel(46, 968, 84, 84, 42);
    panel(382, 968, 84, 84, 42);
    glyph(88, 1010, 84, 5);
    glyph(424, 1010, 84, 2);
    bar(171, 1076, 170, 7, .9);
  } else if (kind === 1) {
    text(hhmm, 62, 58, `600 24px ${SANS}`, 1, 'left');
    bar(396, 40, 26, 14, .9); bar(430, 40, 26, 14, .9); bar(464, 40, 20, 14, .5);
    panel(32, 96, 214, 214, 44);
    text('21°', 62, 196, `${SER}84px Fraunces, serif`, 1, 'left');
    bar(62, 232, 110, 12, .8); bar(62, 258, 74, 10, .45);
    panel(266, 96, 214, 214, 44);
    text(now.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase(), 296, 152, `600 22px ${SANS}`, .7, 'left');
    text(String(now.getDate()), 296, 232, `${SER}84px Fraunces, serif`, 1, 'left');
    bar(296, 262, 130, 10, .45);
    for (let r = 0; r < 2; r++) {
      for (let q = 0; q < 4; q++) {
        const x = 40 + q * 116, y = 356 + r * 154;
        panel(x, y, 84, 84, 26);
        glyph(x + 42, y + 42, 84, r * 4 + q + 3);
        bar(x + 12, y + 100, 60, 9, .55);
      }
    }
    bar(206, 890, 100, 30, .14);
    panel(32, 948, 448, 116, 46);
    for (let q = 0; q < 4; q++) {
      panel(54 + q * 106, 964, 84, 84, 26);
      glyph(96 + q * 106, 1006, 84, q);
    }
    bar(171, 1082, 170, 7, .9);
  } else {
    text(hhmm, 62, 58, `600 24px ${SANS}`, 1, 'left');
    bar(430, 40, 26, 14, .9); bar(464, 40, 20, 14, .5);
    ink(.95); c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(56, 118); c.lineTo(40, 136); c.lineTo(56, 154); c.stroke();
    panel(84, 106, 60, 60, 30);
    text('Lucía', 162, 146, `600 30px ${SANS}`, 1, 'left');
    const rows = [[0, 250, 2], [1, 190, 1], [0, 300, 3], [1, 270, 2], [0, 150, 1], [1, 220, 1]];
    let y = 214;
    for (const [me, w, lines] of rows) {
      const h = 34 + lines * 26;
      const x = me ? W - 32 - w : 32;
      panel(x, y, w, h, 28, me ? 1 : .8);
      if (me) { ink(.26); rr(c, x, y, w, h, 28); c.fill(); }
      for (let l = 0; l < lines; l++) bar(x + 22, y + 22 + l * 26, (l === lines - 1 ? .55 : 1) * (w - 44), 11, .85);
      y += h + 18;
    }
    panel(32, 986, 372, 72, 36);
    bar(60, 1016, 150, 11, .45);
    ink(.95); c.beginPath(); c.arc(446, 1022, 36, 0, P * 2); c.fill();
    bar(171, 1082, 170, 7, .9);
  }
  return cv;
}

/* Circuitos transparentes: solo se ven al inclinar el cristal o en modo interior. */
function drawTraces() {
  const W = 512, H = 1056;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  c.fillStyle = '#000';
  c.fillRect(0, 0, W, H);
  c.strokeStyle = '#fff'; c.fillStyle = '#fff'; c.lineCap = 'round'; c.lineJoin = 'round';
  const line = (pts, w = 2, a = 1) => {
    c.globalAlpha = a; c.lineWidth = w; c.beginPath();
    pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.stroke();
  };
  // batería de vidrio
  c.globalAlpha = .9; c.lineWidth = 2.5; rr(c, 84, 420, 344, 470, 34); c.stroke();
  c.globalAlpha = .35; c.lineWidth = 1.5;
  for (let i = 1; i < 12; i++) { c.beginPath(); c.moveTo(104, 420 + i * 39); c.lineTo(408, 420 + i * 39); c.stroke(); }
  // bobina de carga
  for (let i = 0; i < 7; i++) { c.globalAlpha = .75 - i * .06; c.lineWidth = 2; c.beginPath(); c.arc(256, 655, 58 + i * 13, 0, P * 2); c.stroke(); }
  // chip Prisma y su malla
  c.globalAlpha = 1; c.lineWidth = 2.5; rr(c, 300, 196, 128, 128, 16); c.stroke();
  c.globalAlpha = .5; rr(c, 322, 218, 84, 84, 8); c.stroke();
  for (let i = 0; i < 9; i++) {
    const o = 208 + i * 13;
    line([[300, o], [262, o], [240 - i * 5, o + 22 + i * 4], [240 - i * 5, 420]], 1.6, .75);
    line([[428, o], [452, o], [470, o + 16], [470, 900 - i * 20], [428, 900 - i * 20 + 14]], 1.4, .5);
    line([[o + 100, 324], [o + 100, 360 + i * 3], [o + 60, 390], [o + 60, 420]], 1.4, .6);
  }
  // sensor impreso bajo la lente
  c.globalAlpha = .8; c.lineWidth = 2; rr(c, 196, 150, 120, 90, 12); c.stroke();
  for (let i = 0; i < 7; i++) line([[206 + i * 17, 240], [206 + i * 17, 268], [130 + i * 9, 300], [130 + i * 9, 420]], 1.3, .55);
  // antenas en el perímetro
  line([[40, 120], [40, 60], [80, 34], [432, 34], [472, 60], [472, 150]], 2, .7);
  line([[40, 940], [40, 996], [80, 1022], [432, 1022], [472, 996], [472, 940]], 2, .7);
  line([[58, 200], [58, 400]], 1.5, .45);
  // háptico y micrófonos
  c.globalAlpha = .7; c.lineWidth = 2; rr(c, 150, 930, 212, 54, 22); c.stroke();
  for (const x of [110, 402]) { c.beginPath(); c.arc(x, 958, 9, 0, P * 2); c.stroke(); }
  c.globalAlpha = 1;
  return cv;
}

function drawRing() {
  const S = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const c = cv.getContext('2d');
  c.fillStyle = '#000';
  c.fillRect(0, 0, S, S);
  c.strokeStyle = '#fff';
  c.lineWidth = 2.5; c.beginPath(); c.arc(128, 128, 120, 0, P * 2); c.stroke();
  c.globalAlpha = .6; c.lineWidth = 1.5; c.beginPath(); c.arc(128, 128, 84, 0, P * 2); c.stroke();
  c.globalAlpha = .9;
  for (let i = 0; i < 8; i++) {
    const a = i * P / 4 + .2;
    c.beginPath();
    c.moveTo(128 + Math.cos(a) * 84, 128 + Math.sin(a) * 84);
    c.lineTo(128 + Math.cos(a + .9) * 34, 128 + Math.sin(a + .9) * 34);
    c.stroke();
  }
  c.beginPath(); c.arc(128, 128, 34, 0, P * 2); c.stroke();
  return cv;
}

/* Atlas de palabras gigantes. Recta = Glass, cursiva = lo demás. */
const WORDS = {
  glass: [['Glass', 0]], phone: [['Phone', 1]], luz: [['luz', 1]], nada: [['nada', 1]], cristal: [['cristal', 1]],
  gota: [['gota', 1]], tocalo: [['tócalo', 1]], glassos: [['Glass', 0], ['OS', 1]],
};

function drawAtlas(big) {
  const W = big ? 4096 : 2048, F = big ? 430 : 280;
  const rowH = Math.round(F * 1.34), padX = Math.round(F * .14);
  const meas = document.createElement('canvas').getContext('2d');
  const font = it => `${it ? 'italic ' : ''}300 ${F}px Fraunces, 'Iowan Old Style', Georgia, serif`;
  const cells = {};
  let x = 0, y = 0;
  for (const [key, runs] of Object.entries(WORDS)) {
    let w = padX * 2;
    for (const [t, it] of runs) { meas.font = font(it); w += meas.measureText(t).width; }
    w = Math.ceil(w);
    if (x + w > W) { x = 0; y += rowH; }
    cells[key] = { x, y, w, h: rowH, runs };
    x += w;
  }
  const H = y + rowH;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  c.fillStyle = '#000';
  c.fillRect(0, 0, W, H);
  c.fillStyle = '#fff';
  c.textBaseline = 'alphabetic';
  for (const cell of Object.values(cells)) {
    let cx = cell.x + padX;
    for (const [t, it] of cell.runs) {
      c.font = font(it);
      c.fillText(t, cx, cell.y + F * 1.02);
      cx += c.measureText(t).width;
    }
    cell.uv = [cell.x / W, 1 - (cell.y + cell.h) / H, cell.w / W, cell.h / H];
    cell.ar = cell.w / cell.h;
  }
  return { canvas: cv, cells };
}

/* ───────────────────────── escena ───────────────────────── */

export function createScene(canvas, hooks = {}) {
  const THREE = window.THREE;
  if (!THREE) return null;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  const gl = renderer.getContext();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const NDROPS = coarse ? 14 : 20;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 1, H = 1, mobile = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, .1, 60);
  const DIST = 12;
  camera.position.set(0, 0, DIST);
  let viewH = 2 * DIST * Math.tan(14 * P / 180), viewW = viewH;

  const v3 = a => new THREE.Vector3(a[0], a[1], a[2]);
  const U = {
    uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uTop: { value: v3(DAYS[0].top) }, uBot: { value: v3(DAYS[0].bot) },
    uGlowA: { value: v3(DAYS[0].a) }, uGlowB: { value: v3(DAYS[0].b) },
    uInk: { value: v3(DAYS[0].ink) }, uSun: { value: v3(DAYS[0].sun) },
    uLight: { value: v3(DAYS[0].light) }, uTint: { value: v3(DAYS[0].tint) },
    uGlowY: { value: 0 }, uStars: { value: 0 }, uDark: { value: 0 },
    uWords: { value: null },
    uWordRect: { value: new Float32Array(12) },
    uWordUV: { value: new Float32Array(12) },
    uWordA: { value: new Float32Array(3) },
  };
  const world = k => { const o = {}; for (const n of k) o[n] = U[n]; return o; };
  const WORLD_U = ['uRes', 'uTime', 'uTop', 'uBot', 'uGlowA', 'uGlowB', 'uInk', 'uSun', 'uGlowY', 'uStars', 'uWords', 'uWordRect', 'uWordUV', 'uWordA'];

  // fondo
  const bgU = {
    ...world(WORLD_U), uDark: U.uDark, uLight: U.uLight,
    uDrops: { value: new Float32Array(NDROPS * 3) },
    uPh: { value: new THREE.Vector4(.5, .5, .1, .2) }, uPhRot: { value: 0 }, uShadow: { value: 1 },
  };
  const bg = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ uniforms: bgU, vertexShader: BG_VERT, fragmentShader: bgFrag(NDROPS), depthTest: false, depthWrite: false })
  );
  bg.frustumCulled = false;
  bg.renderOrder = -10;
  scene.add(bg);

  // teléfono
  const PW = .966, PH = 2, PD = .112;
  const phone = new THREE.Group();
  phone.rotation.order = 'ZXY';
  scene.add(phone);

  const glassMat = (side, back, lens, strength = 1, tint = .5) => new THREE.ShaderMaterial({
    uniforms: {
      ...world(WORLD_U), uDark: U.uDark, uLight: U.uLight, uTint: U.uTint,
      uBackPass: { value: back ? 1 : 0 }, uLens: { value: lens ? 1 : 0 },
      uRefFace: { value: .03 }, uRefEdge: { value: .15 * strength }, uDisp: { value: .14 }, uTintAmt: { value: tint },
    },
    vertexShader: GLASS_VERT, fragmentShader: GLASS_FRAG, side,
    transparent: true, depthTest: false, depthWrite: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  const premult = { transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor };

  const slabGeo = slabGeometry(THREE, PW, PH, PD, .15, PD * .5);
  const slabBack = new THREE.Mesh(slabGeo, glassMat(THREE.BackSide, true, false));
  const slabFront = new THREE.Mesh(slabGeo, glassMat(THREE.FrontSide, false, false));
  phone.add(slabBack, slabFront);

  const tex = cv => {
    const t = new THREE.CanvasTexture(cv);
    t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
    return t;
  };
  let uiTex = [0, 1, 2].map(k => tex(drawUI(k)));
  const DW = PW - .07, DH = PH - .07;
  const uiU = {
    uUiA: { value: uiTex[0] }, uUiB: { value: uiTex[1] }, uUiMix: { value: 0 }, uScreen: { value: 0 },
    uDark: U.uDark, uInk: U.uInk, uTop: U.uTop, uSize: { value: new THREE.Vector2(DW, DH) },
  };
  const display = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), new THREE.ShaderMaterial({ uniforms: uiU, vertexShader: UI_VERT, fragmentShader: UI_FRAG, ...premult }));
  display.position.z = PD / 2 - .014;
  phone.add(display);

  const maskMat = (cv, amt) => new THREE.ShaderMaterial({
    uniforms: { uMask: { value: tex(cv) }, uAmt: amt, uDark: U.uDark, uTime: U.uTime, uInk: U.uInk },
    vertexShader: UI_VERT, fragmentShader: MASK_FRAG, ...premult,
  });
  const xrayU = { value: 0 }, ringU = { value: 0 };
  const traces = new THREE.Mesh(new THREE.PlaneGeometry(PW - .05, PH - .05), maskMat(drawTraces(), xrayU));
  traces.position.z = -.01;
  phone.add(traces);

  const LENS_Y = .6, LENS_R = .19;
  const lens = new THREE.Mesh(capGeometry(THREE, LENS_R, .075), glassMat(THREE.DoubleSide, false, true, 2.3, .16));
  lens.rotation.y = P;
  lens.position.set(0, LENS_Y, -PD / 2 + .004);
  phone.add(lens);
  const ring = new THREE.Mesh(new THREE.PlaneGeometry(LENS_R * 1.7, LENS_R * 1.7), maskMat(drawRing(), ringU));
  ring.position.set(0, LENS_Y, -PD / 2 + .02);
  phone.add(ring);

  const btnMat = glassMat(THREE.FrontSide, false, false, .3, .35);
  const mkBtn = (x, y, len) => {
    const b = new THREE.Mesh(slabGeometry(THREE, .03, len, .05, .015, .013, 5, 4), btnMat);
    b.position.set(x, y, 0);
    phone.add(b);
    return b;
  };
  const buttons = [mkBtn(PW / 2 + .006, .3, .26), mkBtn(-PW / 2 - .006, .46, .15), mkBtn(-PW / 2 - .006, .26, .15)];

  // palabras
  let atlas = null, anchors = [];
  function buildAtlas() {
    const big = window.innerWidth > 900 && gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096;
    atlas = drawAtlas(big);
    if (U.uWords.value) U.uWords.value.dispose();
    const t = tex(atlas.canvas);
    t.format = THREE.LuminanceFormat;
    U.uWords.value = t;
    document.querySelectorAll('.gword').forEach(el => {
      const cell = atlas.cells[el.dataset.word];
      if (cell) el.style.setProperty('--ar', cell.ar.toFixed(4));
    });
  }

  // paradas
  let stops = [];
  function measure() {
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    mobile = W < 820;
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    renderer.getDrawingBufferSize(U.uRes.value);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    viewW = viewH * camera.aspect;
    const sy = window.scrollY;
    let st = {};
    stops = [];
    for (const [sel, at, m, d] of STOPS) {
      const el = document.querySelector(sel);
      if (!el) continue;
      st = { ...st, ...m, ...(mobile ? {} : d) };
      const r = el.getBoundingClientRect();
      stops.push({ sel, pos: r.top + sy + r.height * at, st });
    }
    anchors = [...document.querySelectorAll('.gword')].map(el => {
      const r = el.getBoundingClientRect();
      return { key: el.dataset.word, x: r.left, y: r.top + sy, w: r.width, h: r.height };
    }).filter(a => atlas && atlas.cells[a.key] && a.w > 0);
  }

  // ── gotas ──
  const drops = [];
  const MAXD = NDROPS;
  function spawn(x, y, r, vx = 0, vy = 0) {
    if (drops.length >= MAXD) {
      let k = 0;
      for (let i = 1; i < drops.length; i++) if (drops[i].r < drops[k].r) k = i;
      if (drops[k].r > r) return;
      drops.splice(k, 1);
    }
    drops.push({ x, y, r, vx, vy, trail: 0, stick: Math.random() * 1.5 });
  }
  let nextAmbient = 1.2;
  function stepDrops(dt, t) {
    if (!reduced && t > nextAmbient) {
      nextAmbient = t + 1.4 + Math.random() * 2.6;
      if (drops.length < MAXD - 5) spawn(Math.random() * W, H * (.06 + Math.random() * .5), 8 + Math.random() * 8);
    }
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      if (d.r > 11) {
        d.stick -= dt;
        const target = d.stick > 0 ? 0 : (d.r - 10) * 15;
        d.vy += (target - d.vy) * Math.min(1, dt * 3);
        if (d.stick < -1.2 - Math.random() * 2) d.stick = Math.random() * .7;
        d.vx += (Math.sin(t * 2.3 + i * 1.7) * 7 - d.vx) * Math.min(1, dt * 2);
        d.trail += d.vy * dt;
        if (d.trail > 30 && d.r > 12) {
          d.trail = 0;
          const b = 2.6 + Math.random() * 2;
          d.r = Math.sqrt(Math.max(1, d.r * d.r - b * b * 1.6));
          spawn(d.x + (Math.random() - .5) * 4, d.y - d.r * .8, b);
        }
      } else {
        d.vx *= Math.exp(-dt * 5);
        d.vy *= Math.exp(-dt * 5);
        d.r -= dt * (d.r < 7 ? 1.3 : .35);
      }
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.r < 1.2 || d.y - d.r > H + 20) drops.splice(i, 1);
    }
    for (let i = 0; i < drops.length; i++) {
      for (let j = drops.length - 1; j > i; j--) {
        const a = drops[i], b = drops[j];
        const dx = a.x - b.x, dy = a.y - b.y, rs = (a.r + b.r) * .8;
        if (dx * dx + dy * dy < rs * rs) {
          const wa = a.r * a.r, wb = b.r * b.r;
          a.x = (a.x * wa + b.x * wb) / (wa + wb);
          a.y = (a.y * wa + b.y * wb) / (wa + wb);
          a.vy = Math.max(a.vy, b.vy);
          a.r = Math.min(30, Math.sqrt(wa + wb));
          drops.splice(j, 1);
        }
      }
    }
    const arr = bgU.uDrops.value;
    const k = U.uRes.value.y / H;
    arr.fill(0);
    for (let i = 0; i < drops.length && i < NDROPS; i++) {
      arr[i * 3] = drops[i].x * k;
      arr[i * 3 + 1] = (H - drops[i].y) * k;
      arr[i * 3 + 2] = drops[i].r * k;
    }
  }
  let lpx = -99, lpy = -99;
  const trail = (x, y, step, r) => {
    if (Math.hypot(x - lpx, y - lpy) < step) return;
    lpx = x; lpy = y;
    spawn(x, y, r + Math.random() * 3);
  };
  const ptr = { x: 0, y: 0 };
  window.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    ptr.x = e.clientX / W - .5;
    ptr.y = e.clientY / H - .5;
    if (!api.paused && !reduced) trail(e.clientX, e.clientY, 24, 4);
  }, { passive: true });
  window.addEventListener('touchstart', e => {
    const t = e.touches[0];
    if (t && !api.paused) { lpx = t.clientX; lpy = t.clientY; spawn(t.clientX, t.clientY, 11 + Math.random() * 3); }
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    const t = e.touches[0];
    if (t && !api.paused) trail(t.clientX, t.clientY, 36, 5);
  }, { passive: true });

  // ── órbita del visor ──
  const orbit = { yaw: 0, pitch: 0, vy: 0, vp: 0, zoom: 1, px: 0, py: 0, drag: false, spin: 0 };
  const view = { on: false, screen: true, xray: false, spin: true, day: 4 };
  let dive = 0, diveT = 0;

  function bindStage(el, full) {
    const pts = new Map();
    let pinch = 0, mid = null, lastTap = 0;
    el.addEventListener('pointerdown', e => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      orbit.drag = true;
      orbit.vy = orbit.vp = 0;
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
        mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      }
      const now = performance.now();
      if (full && pts.size === 1 && now - lastTap < 300) reset();
      lastTap = now;
    });
    el.addEventListener('pointermove', e => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (pts.size === 1) {
        const k = 5.2 / Math.min(W, 900);
        orbit.yaw += dx * k;
        orbit.vy = dx * k * 60;
        if (full || e.pointerType === 'mouse') {
          orbit.pitch = clamp(orbit.pitch + dy * k * .8, -1.35, 1.35);
          orbit.vp = dy * k * 48;
        }
      } else if (pts.size === 2 && full) {
        const [a, b] = [...pts.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        if (pinch > 0) orbit.zoom = clamp(orbit.zoom * dist / pinch, .5, 3.2);
        if (mid) { orbit.px += (m.x - mid.x) / W; orbit.py -= (m.y - mid.y) / H; }
        pinch = dist; mid = m;
      }
    });
    const up = e => {
      pts.delete(e.pointerId);
      if (pts.size < 2) { pinch = 0; mid = null; }
      if (!pts.size) orbit.drag = false;
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    if (full) {
      el.addEventListener('wheel', e => {
        e.preventDefault();
        orbit.zoom = clamp(orbit.zoom * Math.exp(-e.deltaY * .0014), .5, 3.2);
      }, { passive: false });
    }
  }
  function reset() {
    orbit.zoom = 1; orbit.px = orbit.py = 0; orbit.pitch = 0; orbit.vy = orbit.vp = 0;
    orbit.yaw = Math.round(orbit.yaw / (2 * P)) * 2 * P;
    orbit.spin = Math.round(orbit.spin / (2 * P)) * 2 * P;
  }

  // ── bucle ──
  const cur = {}, tgt = {};
  let time = 0, last = performance.now(), dark = null, slow = 0, frames = 0, started = false, lastSy = 0, lastMin = -1;
  const tmpN = new THREE.Vector3(), tmpC = new THREE.Vector3();
  const mixDay = (k, i, f) => DAYS[i][k].map((v, n) => lerp(v, DAYS[Math.min(4, i + 1)][k][n], f));

  function sample(yc) {
    const S = stops;
    if (!S.length) return;
    let a = S[0], b = S[0], t = 0;
    if (yc >= S[S.length - 1].pos) a = b = S[S.length - 1];
    else if (yc > S[0].pos) {
      let i = 0;
      while (yc > S[i + 1].pos) i++;
      a = S[i]; b = S[i + 1];
      t = ease((yc - a.pos) / Math.max(1, b.pos - a.pos));
    }
    for (const k of KEYS) tgt[k] = lerp(a.st[k], b.st[k], t);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    if (api.paused || !stops.length) return;
    time += dt;
    const sy = window.scrollY;
    sample(sy + H * .5);

    // cerca de la sección 3D el teléfono obedece a la mano
    const touchStop = stops.find(q => q.sel === '#tocalo') || stops[0];
    const near = view.on ? 1 : clamp(1 - Math.abs(sy + H * .5 - touchStop.pos) / (H * .55), 0, 1);
    if (!orbit.drag) {
      orbit.yaw += orbit.vy * dt; orbit.pitch = clamp(orbit.pitch + orbit.vp * dt, -1.35, 1.35);
      orbit.vy *= Math.exp(-dt * 2.6); orbit.vp *= Math.exp(-dt * 4);
      if (near > .5 && (view.on ? view.spin : true) && !reduced) orbit.spin += dt * .32;
    }
    if (near <= 0 && !view.on) { orbit.pitch *= Math.exp(-dt * 4); }
    tgt.ry += (orbit.yaw + orbit.spin) * near;
    tgt.rx += orbit.pitch * near;
    if (view.on) {
      tgt.x = orbit.px; tgt.y = .03 + orbit.py;
      tgt.s = (mobile ? .56 : .66) * orbit.zoom;
      tgt.scr = view.screen ? 1 : 0; tgt.xr = view.xray ? 1 : 0; tgt.day = view.day; tgt.lens = view.xray ? 1 : 0;
    }
    diveT += (dive - diveT) * (1 - Math.exp(-dt * 3.2));
    if (diveT > .001) {
      const k = ease(diveT);
      tgt.x = lerp(tgt.x, 0, k); tgt.y = lerp(tgt.y, 0, k);
      tgt.s = lerp(tgt.s, mobile ? 1.5 : 1.9, k * k);
      tgt.rx = lerp(tgt.rx, 0, k); tgt.rz = lerp(tgt.rz, 0, k);
      tgt.ry = lerp(tgt.ry, Math.round(tgt.ry / (2 * P)) * 2 * P, k);
      tgt.scr = 1;
    }

    const first = !started;
    for (const k of KEYS) {
      const rate = k === 'day' ? 3 : view.on || orbit.drag ? 14 : 6.5;
      cur[k] = first ? tgt[k] : cur[k] + (tgt[k] - cur[k]) * (1 - Math.exp(-dt * rate));
    }
    started = true;

    // la hora del día
    const d = clamp(cur.day, 0, 4), di = Math.min(3, Math.floor(d)), df = d - di;
    U.uTop.value.fromArray(mixDay('top', di, df));
    U.uBot.value.fromArray(mixDay('bot', di, df));
    U.uGlowA.value.fromArray(mixDay('a', di, df));
    U.uGlowB.value.fromArray(mixDay('b', di, df));
    U.uSun.value.fromArray(mixDay('sun', di, df));
    U.uLight.value.fromArray(mixDay('light', di, df));
    U.uTint.value.fromArray(mixDay('tint', di, df));
    U.uGlowY.value = lerp(DAYS[di].gy, DAYS[di + 1].gy, df);
    const flip = di === 2 ? ease(clamp((df - .38) / .24, 0, 1)) : df;
    U.uInk.value.fromArray(mixDay('ink', di, di === 2 ? flip : df));
    const dk = d > 2.5;
    U.uDark.value = clamp((d - 2.3) / .4, 0, 1);
    U.uStars.value = clamp(d - 3.2, 0, 1);
    U.uTime.value = time;
    if (dk !== dark) { dark = dk; if (hooks.onTone) hooks.onTone(dk); }

    // teléfono
    const idle = reduced ? 0 : 1;
    const px = coarse ? 0 : ptr.x, py = coarse ? 0 : ptr.y;
    const sc = cur.s * viewH / PH;
    phone.position.set(cur.x * viewW, (cur.y + Math.sin(time * .8) * .006 * idle) * viewH, 0);
    phone.scale.setScalar(sc);
    phone.rotation.set(
      cur.rx + Math.sin(time * .37) * .035 * idle + py * .12,
      cur.ry + Math.sin(time * .5) * .09 * idle * (1 - near) + px * .22,
      cur.rz + Math.sin(time * .29) * .012 * idle
    );
    phone.updateMatrixWorld();
    tmpN.set(0, 0, 1).transformDirection(phone.matrixWorld);
    tmpC.copy(camera.position).sub(phone.position);
    const front = tmpN.dot(tmpC) > 0;
    const order = front
      ? [slabBack, lens, ring, traces, display, slabFront]
      : [slabBack, display, traces, ring, slabFront, lens];
    order.forEach((m, i) => { m.renderOrder = i + 1; });
    buttons.forEach(b => { b.renderOrder = 9; });

    uiU.uScreen.value = cur.scr;
    const ui = clamp(cur.ui, 0, 1.999), ua = Math.floor(ui);
    uiU.uUiA.value = uiTex[ua]; uiU.uUiB.value = uiTex[ua + 1]; uiU.uUiMix.value = ease(ui - ua);
    xrayU.value = Math.max(cur.xr, .05);
    ringU.value = Math.max(cur.lens, cur.xr * .6) * (.75 + .25 * Math.sin(time * 2.2));
    lens.scale.z = 1 + cur.lens * .3 * Math.sin(time * 1.4);

    // sombra
    const cy = Math.cos(phone.rotation.y), sY = Math.sin(phone.rotation.y), cx = Math.cos(phone.rotation.x), sX = Math.sin(phone.rotation.x);
    bgU.uPh.value.set(
      .5 + cur.x, .5 + cur.y,
      (PW / 2 * Math.abs(cy) + PD / 2 * Math.abs(sY)) * sc / viewH,
      (PH / 2 * Math.abs(cx) + PD / 2 * Math.abs(sX)) * sc / viewH
    );
    bgU.uPhRot.value = phone.rotation.z;
    bgU.uShadow.value = clamp(1.6 - cur.s, .25, 1) * (1 - diveT);

    // palabras visibles
    const rect = U.uWordRect.value, uvs = U.uWordUV.value, al = U.uWordA.value;
    let n = 0;
    al.fill(0);
    for (const a of anchors) {
      if (n >= 3) break;
      const top = a.y - sy;
      if (top > H || top + a.h < 0) continue;
      const cell = atlas.cells[a.key];
      let dw = a.w, dh = a.w / cell.ar;
      if (dh > a.h) { dh = a.h; dw = a.h * cell.ar; }
      const x = a.x + (a.w - dw) / 2, y = top + (a.h - dh) / 2;
      rect.set([x / W, 1 - (y + dh) / H, dw / W, dh / H], n * 4);
      uvs.set(cell.uv, n * 4);
      al[n] = 1 - diveT;
      n++;
    }

    // inercia de las gotas al hacer scroll
    const dv = sy - lastSy;
    lastSy = sy;
    if (dv) for (const dr of drops) dr.y -= dv * (dr.r > 9 ? .55 : .9);
    stepDrops(dt, time);

    // la hora de la pantalla del teléfono
    const min = new Date().getMinutes();
    if (min !== lastMin && document.fonts.status === 'loaded') {
      lastMin = min;
      uiTex.forEach((t, k) => { t.image = drawUI(k); t.needsUpdate = true; });
    }

    renderer.render(scene, camera);

    // si el equipo no llega, bajamos resolución antes que fluidez
    frames++;
    if (frames > 40) {
      slow = dt > .024 ? slow + 1 : Math.max(0, slow - 1);
      if (slow > 24 && dpr > 1) {
        dpr = Math.max(1, dpr - .25);
        slow = 0; frames = 0;
        measure();
      }
    }
  }

  const api = {
    paused: false,
    orbit, view,
    bindStage,
    reset,
    measure,
    splash(x, y, n = 5) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * P * 2, r = 18 + Math.random() * 30;
        spawn(x + Math.cos(a) * r, y + Math.sin(a) * r, 3 + Math.random() * 4, Math.cos(a) * 60, Math.sin(a) * 60);
      }
    },
    setViewer(on) {
      view.on = on;
      if (!on) { orbit.zoom = 1; orbit.px = orbit.py = 0; }
    },
    setDive(on) { dive = on ? 1 : 0; },
    dayName: i => DAYS[i].name,
  };

  buildAtlas();
  measure();
  requestAnimationFrame(frame);

  // las tipografías llegan después: se redibujan atlas y pantallas
  const refont = () => {
    buildAtlas();
    uiTex.forEach((t, k) => { t.image = drawUI(k); t.needsUpdate = true; });
    measure();
  };
  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load('300 80px Fraunces'),
      document.fonts.load('italic 300 80px Fraunces'),
      document.fonts.load('500 20px Geist'),
    ]).then(refont).catch(() => {});
  }
  let rs = 0;
  const onResize = () => { clearTimeout(rs); rs = setTimeout(() => { if ((window.innerWidth > 900) !== (atlas.canvas.width > 2048)) buildAtlas(); measure(); }, 120); };
  window.addEventListener('resize', onResize);
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(document.body);

  return api;
}
