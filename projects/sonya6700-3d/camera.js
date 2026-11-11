// Sony α6700 — modelo procedural. Unidades: milímetros.
// Ejes: +X derecha (vista frontal), +Y arriba, +Z hacia el sujeto. La pantalla está en z≈0.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const TAU = Math.PI * 2;
const MOUNT = { x: 13, y: 31.5 };          // eje óptico
const FRONT = 40;                          // cara frontal del cuerpo
const TOP = 64;                            // placa superior

/* ───────────── texturas procedurales ───────────── */
function canvas(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h); return c;
}
function tex(c, { srgb = false, rx = 1, ry = 1 } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const _n = new Map();
function nmap(src, strength, { rx = 1, ry = 1 } = {}) {
  const key = src.width + ':' + src.height + ':' + strength + ':' + [...src.getContext('2d').getImageData(0, 0, 2, 2).data].join('');
  if (!_n.has(key)) {
    const w = src.width, h = src.height, s = src.getContext('2d').getImageData(0, 0, w, h).data;
    const H = (x, y) => s[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
    _n.set(key, canvas(w, h, g => {
      const d = g.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const dx = (H(x + 1, y) - H(x - 1, y)) * strength, dy = (H(x, y + 1) - H(x, y - 1)) * strength, l = Math.hypot(dx, dy, 1), i = (y * w + x) * 4;
        d.data[i] = (-dx / l * .5 + .5) * 255; d.data[i + 1] = (dy / l * .5 + .5) * 255; d.data[i + 2] = (1 / l * .5 + .5) * 255; d.data[i + 3] = 255;
      }
      g.putImageData(d, 0, 0);
    }));
  }
  return tex(_n.get(key), { rx, ry });
}
const V2 = s => new THREE.Vector2(s, s);
function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// moteado fino del magnesio pintado
const speckleC = canvas(256, 256, (g, w, h) => {
  const r = rnd(7), d = g.createImageData(w, h);
  for (let i = 0; i < d.data.length; i += 4) { const v = 118 + (r() - .5) * 90 + (r() < .035 ? 70 : 0); d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0);
});
// polipiel: celdas abombadas e irregulares
const leatherC = canvas(512, 512, (g, w, h) => {
  const r = rnd(11); g.fillStyle = '#3a3a3a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1500; i++) {
    const x = r() * w, y = r() * h, rad = 7 + r() * 13;
    for (const [ox, oy] of [[0, 0], [w, 0], [-w, 0], [0, h], [0, -h]]) {
      const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
      gr.addColorStop(0, 'rgba(235,235,235,.95)'); gr.addColorStop(.62, 'rgba(160,160,160,.7)'); gr.addColorStop(1, 'rgba(30,30,30,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(x + ox, y + oy, rad, rad * (.65 + r() * .5), r() * 3, 0, TAU); g.fill();
    }
  }
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(0,0,0,${.25 + r() * .4})`; g.beginPath(); g.arc(r() * w, r() * h, .6 + r() * 1.3, 0, TAU); g.fill(); }
});
// estriado de los diales
const knurlC = canvas(32, 8, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, 0);
  gr.addColorStop(0, '#111'); gr.addColorStop(.35, '#eee'); gr.addColorStop(.65, '#eee'); gr.addColorStop(1, '#111');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
// metal torneado: reflejos en abanico
const spunC = canvas(512, 512, (g, w, h) => {
  const r = rnd(3); g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
  g.translate(w / 2, h / 2);
  for (let i = 0; i < 720; i++) {
    const a = r() * TAU, v = 90 + r() * 110;
    g.strokeStyle = `rgba(${v},${v},${v},.35)`; g.lineWidth = .6 + r() * 1.6;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * w, Math.sin(a) * w); g.stroke();
  }
  for (let rr = 4; rr < w / 2; rr += 2.5) { const v = 100 + r() * 70; g.strokeStyle = `rgba(${v},${v},${v},.25)`; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, rr, 0, TAU); g.stroke(); }
});

// huellas y roces sutiles para las superficies brillantes (canal de rugosidad)
const smudgeC = canvas(512, 512, (g, w, h) => {
  const r = rnd(23); g.fillStyle = '#161616'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 46; i++) {
    const x = r() * w, y = r() * h, rad = 30 + r() * 90, gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, `rgba(120,120,120,${.1 + r() * .22})`); gr.addColorStop(1, 'rgba(120,120,120,0)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rad, rad * (.3 + r() * .5), r() * 3, 0, TAU); g.fill();
  }
  for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(170,170,170,${.05 + r() * .12})`; g.lineWidth = .5 + r(); const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 160, y + (r() - .5) * 60); g.stroke(); }
});

/* ───────────── materiales ───────────── */
const M = {
  body: new THREE.MeshStandardMaterial({ color: 0x151516, roughness: 1, metalness: .2, normalMap: nmap(speckleC, 1.6, { rx: 1 / 12, ry: 1 / 12 }), normalScale: V2(.5), roughnessMap: tex(speckleC, { rx: 1 / 12, ry: 1 / 12 }) }),
  plastic: new THREE.MeshStandardMaterial({ color: 0x121213, roughness: .46, metalness: .1, normalMap: nmap(speckleC, 1.6, { rx: 3, ry: 3 }), normalScale: V2(.18) }),
  gloss: new THREE.MeshPhysicalMaterial({ color: 0x070708, roughness: .9, roughnessMap: tex(smudgeC, { rx: .5, ry: .5 }), metalness: .1, clearcoat: .6, clearcoatRoughness: .25 }),
  leather: new THREE.MeshStandardMaterial({ color: 0x101011, roughness: .6, metalness: 0, normalMap: nmap(leatherC, 4, { rx: 1 / 15, ry: 1 / 15 }), normalScale: V2(1) }),
  leatherBox: new THREE.MeshStandardMaterial({ color: 0x101011, roughness: .6, metalness: 0, normalMap: nmap(leatherC, 4, { rx: 1.4, ry: 1.4 }), normalScale: V2(1) }),
  lamp: new THREE.MeshPhysicalMaterial({ color: 0x3a1206, roughness: .12, clearcoat: 1 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: .82, metalness: 0, normalMap: nmap(speckleC, 1.6, { rx: 1 / 9, ry: 1 / 9 }), normalScale: V2(.35) }),
  dark: new THREE.MeshStandardMaterial({ color: 0x030303, roughness: .9, metalness: 0, side: THREE.DoubleSide }),
  silver: new THREE.MeshStandardMaterial({ color: 0xd4d4d2, roughness: .26, metalness: 1, roughnessMap: tex(spunC), normalMap: nmap(spunC, 1.5), normalScale: V2(.22) }),
  steel: new THREE.MeshStandardMaterial({ color: 0x9a9a98, roughness: .35, metalness: 1 }),
  blackMetal: new THREE.MeshStandardMaterial({ color: 0x151516, roughness: .38, metalness: .85 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: .3, metalness: 1 }),
  red: new THREE.MeshStandardMaterial({ color: 0xc92a12, roughness: .4, metalness: .2 }),
  white: new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: .5 }),
  screen: new THREE.MeshPhysicalMaterial({ color: 0x020203, roughness: 1, roughnessMap: tex(smudgeC), metalness: 0, clearcoat: 1, clearcoatRoughness: .03, reflectivity: .5, envMapIntensity: .28 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x020305, roughness: .02, metalness: 0, clearcoat: 1, clearcoatRoughness: 0, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [180, 520], envMapIntensity: 1.6 }),
  sensor: new THREE.MeshPhysicalMaterial({ color: 0x0a2a3a, roughness: .14, metalness: .7, envMapIntensity: .6, iridescence: .7, iridescenceIOR: 1.5, iridescenceThicknessRange: [300, 460], clearcoat: 1, clearcoatRoughness: .02 }),
};
const knurlMat = (n, color = 0x131314) => new THREE.MeshStandardMaterial({ color, roughness: .42, metalness: .8, normalMap: nmap(knurlC, 5, { rx: n, ry: 1 }), normalScale: V2(1) });
const spunMat = (color = 0x1a1a1b) => new THREE.MeshStandardMaterial({ color, roughness: .32, metalness: .9, roughnessMap: tex(spunC), normalMap: nmap(spunC, 1.5), normalScale: V2(.2) });

/* ───────────── utilidades de geometría ───────────── */
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };
const rbox = (w, h, d, r, m, x, y, z, seg = 4) => mesh(new RoundedBoxGeometry(w, h, d, seg, r), m, x, y, z);
// cilindro con eje en Z (dir = +1 mira al frente, −1 atrás); base apoyada en z
function cylZ(r, h, m, x, y, z, dir = 1, seg = 48, rTop = r) {
  const g = new THREE.CylinderGeometry(rTop, r, h, seg); g.rotateX(dir * Math.PI / 2); g.translate(0, 0, dir * h / 2);
  return mesh(g, m, x, y, z);
}
const cylY = (r, h, m, x, y, z, seg = 48, rTop = r) => { const g = new THREE.CylinderGeometry(rTop, r, h, seg); g.translate(0, h / 2, 0); return mesh(g, m, x, y, z); };
function roundRect(s, x0, y0, x1, y1, r) {
  const rr = Array.isArray(r) ? r : [r, r, r, r];          // bl, br, tr, tl
  s.moveTo(x0 + rr[0], y0); s.lineTo(x1 - rr[1], y0); s.quadraticCurveTo(x1, y0, x1, y0 + rr[1]);
  s.lineTo(x1, y1 - rr[2]); s.quadraticCurveTo(x1, y1, x1 - rr[2], y1);
  s.lineTo(x0 + rr[3], y1); s.quadraticCurveTo(x0, y1, x0, y1 - rr[3]);
  s.lineTo(x0, y0 + rr[0]); s.quadraticCurveTo(x0, y0, x0 + rr[0], y0);
  return s;
}
// extruye hacia arriba un contorno definido en planta (x, z)
function extrudeY(build, y0, y1, bevel, m, seg = 3) {
  const s = new THREE.Shape(); build(s);                 // el contorno se dibuja con y = −z
  const g = new THREE.ExtrudeGeometry(s, { depth: y1 - y0 - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: seg, curveSegments: 24 });
  g.rotateX(-Math.PI / 2); g.translate(0, y0 + bevel, 0);
  return mesh(g, m);
}
// rótulo: plano con texto en canvas, orientado por dos ejes
const AX = { front: [[1, 0, 0], [0, 1, 0]], back: [[-1, 0, 0], [0, 1, 0]], top: [[-1, 0, 0], [0, 0, 1]] };
function orient(o, face) {
  const [x, y] = AX[face].map(a => new THREE.Vector3(...a)), z = new THREE.Vector3().crossVectors(x, y);
  o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); return o;
}
function decal(wmm, hmm, draw, face, x, y, z, { ppm = 28, shape = 'plane' } = {}) {
  const c = canvas(Math.ceil(wmm * ppm), Math.ceil(hmm * ppm), (g, w, h) => { g.translate(w / 2, h / 2); g.scale(ppm, ppm); draw(g); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const m = new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: .55, metalness: 0, polygonOffset: true, polygonOffsetFactor: -4, depthWrite: false });
  const g = shape === 'circle' ? new THREE.CircleGeometry(wmm / 2, 64) : new THREE.PlaneGeometry(wmm, hmm);
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.receiveShadow = true; return orient(o, face);
}
function label(text, size, face, x, y, z, { font = '700 1px Archivo', color = '#f1f1f1', track = 0, italic = false } = {}) {
  const f = font.replace('1px', size + 'px');
  const probe = document.createElement('canvas').getContext('2d'); probe.font = f;
  const w = probe.measureText(text).width + track * text.length + size * .5;
  return decal(w, size * 1.5, g => {
    g.font = f; g.fillStyle = color; g.textBaseline = 'middle'; g.textAlign = 'left';
    let cx = -w / 2 + size * .25;
    for (const ch of text) { g.fillText(ch, cx, size * .06); cx += g.measureText(ch).width + track; }
  }, face, x, y, z);
}

/* ───────────── piezas ───────────── */
function buildBody(G) {
  // bloque principal: alzado con el hueco de la montura, extruido en profundidad
  const s = roundRect(new THREE.Shape(), -61, 0, 61, 58, [6, 5, 1.5, 1.5]);
  const hole = new THREE.Path(); hole.absarc(MOUNT.x, MOUNT.y, 24.6, 0, TAU, true); s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: FRONT - 2 - 2.4, bevelEnabled: true, bevelThickness: 1.2, bevelSize: 1.2, bevelOffset: -1.2, bevelSegments: 4, curveSegments: 48 });
  g.translate(0, 0, 2 + 1.2);
  G.add(mesh(g, M.body));

  // placa superior (pieza aparte, con el faldón frontal donde va el logotipo)
  G.add(extrudeY(s2 => roundRect(s2, -59.5, -(FRONT + .35), 61, -14, [2.5, 2.5, 3.5, 3.5]), 56.2, TOP, 1.1, M.body));

  // empuñadura en polipiel
  const gripShape = s2 => {
    s2.moveTo(-26.5, -30); s2.lineTo(-26.5, -47);
    s2.bezierCurveTo(-26.5, -58, -33, -63.6, -41, -63.6);
    s2.lineTo(-48, -63.6);
    s2.bezierCurveTo(-57, -63.6, -61.6, -57, -61.6, -47);
    s2.lineTo(-61.6, -6); s2.quadraticCurveTo(-61.6, -1.2, -57, -1.2); s2.lineTo(-54, -1.2);
    s2.lineTo(-54, -30); s2.closePath();
  };
  G.add(extrudeY(gripShape, .8, 55.5, 2.6, M.leather, 5));
  // meseta del disparador, lisa
  const deck = s2 => {
    s2.moveTo(-26.2, -36); s2.lineTo(-26.2, -47);
    s2.bezierCurveTo(-26.2, -58.5, -33, -64, -41, -64);
    s2.lineTo(-48, -64);
    s2.bezierCurveTo(-57.3, -64, -61.9, -57.5, -61.9, -47);
    s2.lineTo(-61.9, -36); s2.closePath();
  };
  G.add(extrudeY(deck, 54.6, 60.6, 1.5, M.plastic, 4));

  // apoyo del pulgar
  G.add(rbox(20, 19.5, 7.5, 3.2, M.leatherBox, -51.4, 47, 2.6, 6));
  // base
  G.add(cylY(4.6, .5, M.steel, MOUNT.x, -.25, 21, 40));
  G.add(cylY(3.1, .52, M.dark, MOUNT.x, -.26, 21, 32));
  G.add(rbox(30, .5, 30, .2, M.plastic, -42, -.05, 28));          // tapa de batería

  // tapas de conectores en el lateral derecho
  G.add(rbox(.7, 24, 15, .3, M.plastic, 61.05, 36, 21));
  G.add(rbox(.7, 15, 15, .3, M.plastic, 61.05, 14.5, 21));
  G.add(rbox(.75, 6.5, 2.2, .3, M.dark, 61.1, 30, 21));

  // enganches de correa
  for (const sx of [-1, 1]) {
    const lug = cylZ(2.1, 2.2, M.steel, sx * 61.6, 55, 30, 1, 24); lug.rotation.y = sx * Math.PI / 2; lug.position.set(sx * 60.4, 55, 30); G.add(lug);
    const ring = mesh(new THREE.TorusGeometry(3.6, .55, 12, 3), M.steel, sx * 64.2, 52.4, 30); ring.rotation.set(0, Math.PI / 2, Math.PI / 2 + sx * .25); G.add(ring);
    const eye = mesh(new THREE.TorusGeometry(1.5, .5, 10, 24), M.steel, sx * 63, 55, 30); eye.rotation.y = Math.PI / 2; G.add(eye);
  }

  // frontal: iluminador AF, botón de liberación, micrófonos, rótulos
  G.add(cylZ(1.75, .5, M.steel, -21.7, 51.5, FRONT - .05, 1, 24));
  G.add(mesh(new THREE.SphereGeometry(1.35, 24, 12, 0, TAU, 0, Math.PI / 2).rotateX(Math.PI / 2), M.lamp, -21.7, 51.5, FRONT + .2));
  G.add(cylZ(4.1, 3.4, M.plastic, -15.2, 16.2, FRONT - .4, 1, 32));
  G.add(cylZ(3.4, 3.8, M.gloss, -15.2, 16.2, FRONT - .4, 1, 32));
  for (const mx of [3, 30.5]) G.add(decal(2.6, 1.2, g => { g.fillStyle = '#000'; g.beginPath(); g.roundRect(-1.1, -.42, 2.2, .84, .42); g.fill(); }, 'front', mx, 58.6, FRONT + .42));
  G.add(label('SONY', 3.7, 'front', -11.2, 60.3, FRONT + .42, { font: '700 1px "Zilla Slab"', track: .32 }));
  G.add(label('α', 6.6, 'front', 48.2, 60.5, FRONT + .42, { font: 'italic 500 1px "EB Garamond"', color: '#d9d9d6' }));
}

function buildTop(G) {
  const knob = (r, h, x, z, y0 = TOP, n = 70) => {
    const g = new THREE.Group();
    g.add(cylY(r, h - .7, knurlMat(n), 0, 0, 0, 64));
    g.add(cylY(r, .7, spunMat(), 0, h - .7, 0, 64, r - .7));
    g.position.set(x, y0, z); return g;
  };
  // dial de modos: anillo foto/vídeo/S&Q + dial
  const mx = -25.7, mz = 19.2;
  G.add(cylY(11.4, 1.6, M.plastic, mx, TOP - .1, mz, 64, 10.6));
  G.add(rbox(4.2, 1.5, 2.6, .5, M.plastic, mx - 9.6, TOP + .65, mz - 7.2));         // pestaña del selector
  G.add(knob(9.3, 6.6, mx, mz, TOP + 1.3, 64));
  G.add(decal(17, 17, g => {
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const put = (t, deg, size, color = '#f1f1f1') => {
      g.save(); g.rotate(deg * Math.PI / 180); g.translate(0, -5.6); g.font = `700 ${size}px Archivo`; g.fillStyle = color; g.fillText(t, 0, 0); g.restore();
    };
    // AUTO en su caja cian (a las 9)
    g.save(); g.rotate(-90 * Math.PI / 180); g.translate(0, -5.5);
    g.fillStyle = '#12a6b4'; g.beginPath(); g.roundRect(-3.1, -1.25, 6.2, 2.5, .35); g.fill();
    g.font = '700 1.75px Archivo'; g.fillStyle = '#fff'; g.fillText('AUTO', 0, .1); g.restore();
    put('P', -45, 2.7); put('A', 0, 2.7); put('S', 45, 2.7); put('M', 90, 2.7);
    // 1·2·3 dentro de un arco contorneado
    g.strokeStyle = '#f1f1f1'; g.lineWidth = .28; g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, 7.15, 28 * Math.PI / 180, 152 * Math.PI / 180); g.stroke();
    g.beginPath(); g.arc(0, 0, 4.0, 28 * Math.PI / 180, 152 * Math.PI / 180); g.stroke();
    for (const a of [28, 152]) { const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180); g.beginPath(); g.moveTo(c * 4.0, s * 4.0); g.lineTo(c * 7.15, s * 7.15); g.stroke(); }
    put('1', 135, 2.4); put('2', 180, 2.4); put('3', 225, 2.4);
  }, 'top', mx, TOP + 7.93, mz, { shape: 'circle', ppm: 40 }));
  G.add(decal(3.4, 1.2, g => { g.fillStyle = '#f1f1f1'; g.beginPath(); g.roundRect(-1.3, -.3, 2.6, .6, .3); g.fill(); }, 'top', -13.3, TOP + .03, 19.4));

  // dial trasero
  G.add(knob(8.9, 7.2, -47.4, 18.3, TOP - .2, 68));

  // C2 y botón de vídeo
  G.add(cylY(3.5, 1.1, M.gloss, -34.6, TOP - .1, 34.4, 32, 3.2));
  G.add(label('C2', 2.3, 'top', -34.6, TOP + 1.03, 34.4));
  G.add(cylY(3.7, .9, M.red, -46.7, TOP - .1, 34.4, 32));
  G.add(cylY(3.05, 1.25, M.gloss, -46.7, TOP - .1, 34.4, 32, 2.7));
  // altavoz
  for (let i = -1; i <= 1; i++) G.add(cylY(.38, .1, M.dark, -22 + i * 1.5, TOP - .04, 34.4, 12));

  // zapata multiinterfaz
  const sx = 16.6, sz = 25;
  G.add(rbox(21.4, 1.2, 19.5, .4, M.blackMetal, sx, TOP + .5, sz));
  for (const s of [-1, 1]) {
    G.add(rbox(1.7, 2.6, 18.6, .35, M.blackMetal, sx + s * 9.85, TOP + 2.2, sz - .4));
    G.add(rbox(4.6, .8, 18.6, .25, M.blackMetal, sx + s * 8.4, TOP + 3.35, sz - .4));
  }
  G.add(rbox(18, 2.6, 1.6, .3, M.blackMetal, sx, TOP + 2.2, sz + 8.9));
  G.add(rbox(12.5, .5, 14, .15, M.plastic, sx, TOP + 1.2, sz - 1.5));
  G.add(cylY(1.55, .35, M.gold, sx, TOP + 1.35, sz - 1.8, 24));
  for (const s of [-1, 1]) G.add(cylY(.9, .2, M.dark, sx + s * 4.6, TOP + 1.38, sz - 5, 16));

  // disparador con interruptor de encendido
  const bx = -40.3, bz = 53.7, by = 60.6;
  G.add(cylY(9.2, 1.3, M.plastic, bx, by - .1, bz, 64, 8.7));
  G.add(cylY(8.5, 2.5, knurlMat(54, 0x101011), bx, by + 1.1, bz, 64, 8.2));
  const tab = rbox(3.6, 2.4, 4.4, .7, M.plastic, bx + 8.4, by + 2.1, bz + 3.4); tab.rotation.y = -.4; G.add(tab);
  G.add(decal(1.6, 2.6, g => { g.fillStyle = '#f1f1f1'; g.beginPath(); g.roundRect(-.3, -1, .6, 2, .3); g.fill(); }, 'top', bx + 8.2, by + 3.33, bz + 3.3));
  G.add(cylY(6.2, 2.9, M.gloss, bx, by + 3.2, bz, 64, 5.9));
  G.add(cylY(5.3, .25, spunMat(0x0d0d0e), bx, by + 6.05, bz, 64));

  // dial frontal en su ranura
  G.add(rbox(15.5, 5.4, 5, 1.2, M.dark, -45.4, 50.6, 60.4));
  G.add(cylY(10.4, 3.7, knurlMat(84, 0x0f0f10), -45.4, 48.75, 55.3, 72));

  // rótulos de la placa
  G.add(decal(12.5, 3.6, g => {
    g.fillStyle = '#f1f1f1'; g.textBaseline = 'middle';
    g.font = 'italic 500 4.3px "EB Garamond"'; g.textAlign = 'left'; g.fillText('α', -6.1, -.1);
    g.font = '700 3px Archivo'; g.fillText('6700', -3.2, .15);
  }, 'top', 49.5, TOP + .03, 21));
  G.add(decal(6, 4, g => { g.strokeStyle = '#f1f1f1'; g.lineWidth = .38; g.beginPath(); g.arc(0, 0, 1.25, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(-2.6, 0); g.lineTo(2.6, 0); g.stroke(); }, 'top', 31.8, TOP + .03, 31));
  G.add(label('ON', 2.1, 'top', -43.9, 60.63, 44.3));
  G.add(label('OFF', 2.1, 'top', -50.4, 60.63, 46.6));
}

function buildBack(G) {
  const zB = 2;                                   // cara trasera del cuerpo
  // visor: carcasa + ocular de goma
  G.add(rbox(41, 19.5, 17.5, 2, M.body, 41.3, 53.2, 6.6));
  const cup = roundRect(new THREE.Shape(), -20.5, -11.5, 20.5, 11.5, 6.5);
  cup.holes.push(roundRect(new THREE.Path(), -14.5, -6.6, 14.5, 6.6, 3.6));
  const cg = new THREE.ExtrudeGeometry(cup, { depth: 7.4, bevelEnabled: true, bevelThickness: 1.3, bevelSize: 1.3, bevelOffset: -1.3, bevelSegments: 4, curveSegments: 20 });
  cg.rotateY(Math.PI); cg.translate(0, 0, -1);
  G.add(mesh(cg, M.rubber, 43.6, 56.2, 0));
  G.add(rbox(31, 15, 6, 1.2, M.dark, 43.6, 56.2, -3.4));
  const eye = decal(19, 10.4, g => { g.fillStyle = '#0b0d14'; g.beginPath(); g.roundRect(-9.5, -5.2, 19, 10.4, 1.4); g.fill(); }, 'back', 46.4, 56.2, -6.45);
  eye.material = M.glass.clone(); eye.material.envMapIntensity = .35; G.add(eye);
  G.add(rbox(3.2, 6.2, .6, .5, M.screen, 33.2, 56.2, -6.3));                     // sensor de proximidad
  const diop = cylZ(3.1, 3, knurlMat(26), 20.5, 55.5, 2.2, -1, 28); diop.rotation.z = .2; G.add(diop);

  // pantalla articulada
  G.add(rbox(77, 50.6, 4.4, 1.6, M.plastic, 14.6, 28, .8));
  G.add(rbox(68.6, 44.6, .3, .12, M.screen, 13.6, 28.2, -1.42, 2));
  G.add(rbox(7.6, 50.6, 4.6, 1.3, M.plastic, 57, 28, .9));
  for (const hy of [16, 40]) G.add(rbox(8, .35, 4.7, .1, M.dark, 57, hy, .9, 1));

  // botones
  const btn = (x, y, r, h = 1.5, m = M.gloss) => { G.add(cylZ(r + .55, .5, M.plastic, x, y, zB + .1, -1, 32)); G.add(cylZ(r, h, m, x, y, zB + .1, -1, 32, r - .25)); };
  btn(-31.4, 51, 4.5); G.add(label('AF-ON', 1.75, 'back', -31.4, 51, zB - 1.45));
  btn(-30.6, 39.6, 3.9); G.add(label('Fn', 2.3, 'back', -30.6, 39.6, zB - 1.45));
  btn(-32.6, 7.9, 3.6);
  G.add(decal(4, 3, g => { g.strokeStyle = '#f1f1f1'; g.lineWidth = .3; g.strokeRect(-1.5, -1.05, 3, 2.1); g.fillStyle = '#f1f1f1'; g.beginPath(); g.moveTo(-.45, -.6); g.lineTo(.7, 0); g.lineTo(-.45, .6); g.fill(); }, 'back', -32.6, 7.9, zB - 1.45));
  btn(-43.9, 7.9, 3.6);
  G.add(decal(3.4, 3.4, g => {
    g.strokeStyle = '#f1f1f1'; g.lineWidth = .3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-1.15, -.75); g.lineTo(1.15, -.75); g.moveTo(-.45, -1.15); g.lineTo(.45, -1.15); g.stroke();
    g.beginPath(); g.moveTo(-.9, -.4); g.lineTo(-.7, 1.2); g.lineTo(.7, 1.2); g.lineTo(.9, -.4); g.stroke();
    for (const x of [-.3, .3]) { g.beginPath(); g.moveTo(x, -.1); g.lineTo(x, .8); g.stroke(); }
  }, 'back', -43.9, 7.9, zB - 1.45));
  // botón MENU, en el escalón superior trasero
  const menu = rbox(9.6, 1.5, 4.6, .7, M.gloss, -4.3, 58.4, 7.4, 4); G.add(menu);
  G.add(label('MENU', 2.1, 'top', -4.3, 59.2, 7.4));

  // rueda de control
  const wx = -38, wy = 24.4;
  G.add(cylZ(10.5, .5, M.plastic, wx, wy, zB + .1, -1, 64));
  G.add(cylZ(9.8, 2, M.blackMetal, wx, wy, zB + .1, -1, 64, 9.2));
  G.add(decal(19.6, 19.6, g => {
    g.strokeStyle = '#8a8a8a'; g.lineWidth = .3;
    for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 5.7, Math.sin(a) * 5.7); g.lineTo(Math.cos(a) * 8.7, Math.sin(a) * 8.7); g.stroke(); }
    g.fillStyle = '#d8d8d8';
    for (let i = 0; i < 4; i++) { g.save(); g.rotate(i * Math.PI / 2); g.beginPath(); g.moveTo(0, -8.7); g.lineTo(-.9, -6.9); g.lineTo(.9, -6.9); g.fill(); g.restore(); }
  }, 'back', wx, wy, zB - 1.93, { shape: 'circle', ppm: 30 }));
  G.add(cylZ(4.7, 2.6, M.gloss, wx, wy, zB + .1, -1, 48, 4.4));
  G.add(label('DISP', 2.1, 'back', wx, wy + 12.6, zB - .03));
  G.add(label('ISO', 2.1, 'back', wx - 13.3, wy, zB - .03));
  G.add(label('C3', 1.9, 'back', -48.2, 13.4, zB - .03));
  G.add(decal(3.6, 3.6, g => { g.strokeStyle = '#f1f1f1'; g.lineWidth = .3; g.beginPath(); g.arc(0, .15, 1.1, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(0, .15); g.lineTo(0, -.55); g.moveTo(-.4, -1.35); g.lineTo(.4, -1.35); g.stroke(); }, 'back', wx + 12.6, wy + 1.9, zB - .03));
  G.add(decal(3.4, 2.6, g => { g.strokeStyle = '#f1f1f1'; g.lineWidth = .26; for (let i = 0; i < 3; i++) g.strokeRect(-1.2 + i * .35, -.2 - i * .35, 1.7, 1.2); }, 'back', wx + 12.6, wy - 1.9, zB - .03));
  G.add(decal(5.6, 2.4, g => {
    g.fillStyle = '#f1f1f1'; g.fillRect(-2.4, -.9, 1.9, 1.8); g.fillRect(.5, -.9, 1.9, 1.8);
    g.fillStyle = '#101011'; g.font = '700 1.5px Archivo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('±', -1.45, .05);
    g.fillRect(.75, -.65, .65, .6); g.fillRect(1.5, .05, .65, .6);
  }, 'back', wx, wy - 12.2, zB - .03));
  G.add(decal(3.4, 3.4, g => { g.strokeStyle = '#f1f1f1'; g.lineWidth = .3; g.beginPath(); g.arc(-.25, -.25, .95, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(.45, .45); g.lineTo(1.25, 1.25); g.moveTo(-.75, -.25); g.lineTo(.25, -.25); g.moveTo(-.25, -.75); g.lineTo(-.25, .25); g.stroke(); }, 'back', -24.6, 56, zB - .03));
  // foto / vídeo / S&Q junto al anillo del dial de modos
  G.add(label('S&Q', 1.8, 'top', -34.2, 58.03, 9.2));
  G.add(decal(3, 2.4, g => { g.fillStyle = '#f1f1f1'; g.beginPath(); g.roundRect(-1.1, -.55, 2.2, 1.3, .2); g.fill(); g.fillRect(-.45, -.85, .9, .4); g.fillStyle = '#101011'; g.beginPath(); g.arc(0, .1, .42, 0, TAU); g.fill(); }, 'top', -24.4, 58.03, 6.9));
  G.add(decal(3, 2.4, g => { g.fillStyle = '#f1f1f1'; g.fillRect(-1.1, -.55, 1.5, 1.1); g.beginPath(); g.moveTo(.5, 0); g.lineTo(1.2, -.55); g.lineTo(1.2, .55); g.fill(); }, 'top', -29.3, 58.03, 7.6));
}

function buildMount(G) {
  const g = new THREE.Group(); g.position.set(MOUNT.x, MOUNT.y, 0); G.add(g);
  const zF = FRONT + 2.9;                                        // plano de la bayoneta
  const collar = new THREE.CylinderGeometry(29.6, 30.2, 1.7, 96, 1, true); collar.rotateX(Math.PI / 2); g.add(mesh(collar, M.plastic, 0, 0, FRONT + .65));
  g.add(mesh(new THREE.RingGeometry(24.4, 29.6, 96, 1), M.plastic, 0, 0, FRONT + 1.5));
  // aro plateado: cara + canto
  const face = mesh(new THREE.RingGeometry(22.9, 28.4, 96, 1), M.silver, 0, 0, zF); g.add(face);
  const side = new THREE.CylinderGeometry(28.4, 28.4, 3.1, 96, 1, true); side.rotateX(Math.PI / 2); g.add(mesh(side, M.steel, 0, 0, zF - 1.55));
  const inner = new THREE.CylinderGeometry(22.9, 22.9, 3.4, 96, 1, true); inner.rotateX(Math.PI / 2); g.add(mesh(inner, new THREE.MeshStandardMaterial({ color: 0xbdbdbb, roughness: .3, metalness: 1, side: THREE.BackSide }), 0, 0, zF - 1.7));
  // lengüetas de la bayoneta
  for (const a of [95, 215, 335]) { const t = mesh(new THREE.RingGeometry(21.2, 23, 32, 1, a * Math.PI / 180, 62 * Math.PI / 180), M.silver, 0, 0, zF - 1.3); g.add(t); }
  for (const a of [45, 135, 225, 315]) {
    const c = Math.cos(a * Math.PI / 180) * 25.7, s = Math.sin(a * Math.PI / 180) * 25.7;
    g.add(cylZ(1.25, .18, M.steel, c, s, zF, 1, 20));
    const slot = decal(2.2, 2.2, x => { x.strokeStyle = '#3a3a3a'; x.lineWidth = .3; x.beginPath(); x.moveTo(-.75, 0); x.lineTo(.75, 0); x.moveTo(0, -.75); x.lineTo(0, .75); x.stroke(); }, 'front', c, s, zF + .2); slot.rotation.z = a; g.add(slot);
  }
  g.add(cylZ(.95, .12, M.white, Math.cos(.96) * 25.9, Math.sin(.96) * 25.9, zF, 1, 20));     // índice de montaje
  // cámara del obturador
  const tube = new THREE.CylinderGeometry(22.9, 24.4, 16.5, 72, 1, true); tube.rotateX(Math.PI / 2); g.add(mesh(tube, M.dark, 0, 0, zF - 3.4 - 8.25));
  g.add(mesh(new THREE.CircleGeometry(24.6, 64), M.dark, 0, 0, zF - 19.8));
  g.add(rbox(33, 24, 1.2, .6, new THREE.MeshStandardMaterial({ color: 0x1d1d1f, roughness: .55, metalness: .4 }), 0, .4, zF - 18.9));
  g.add(rbox(26.6, 18.6, 1.3, .3, M.dark, 0, .4, zF - 18.6));
  g.add(rbox(23.5, 15.6, .3, .05, M.sensor, 0, .4, zF - 17.9, 1));
  // contactos
  const shelf = mesh(new THREE.RingGeometry(16.5, 22.6, 48, 1, 222 * Math.PI / 180, 96 * Math.PI / 180), new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: .5, metalness: .3 }), 0, 0, zF - 8); g.add(shelf);
  for (let i = 0; i < 10; i++) { const a = (240 + i * 6.7) * Math.PI / 180; g.add(cylZ(.62, .3, M.gold, Math.cos(a) * 19.4, Math.sin(a) * 19.4, zF - 8, 1, 12)); }
}

function buildLens() {
  const L = new THREE.Group(); L.position.set(MOUNT.x, MOUNT.y, FRONT + 2.9);
  const ring = (r0, r1, z0, z1, m, seg = 96) => { const g = new THREE.CylinderGeometry(r1, r0, z1 - z0, seg, 1, true); g.rotateX(Math.PI / 2); return mesh(g, m, 0, 0, (z0 + z1) / 2); };
  const matte = new THREE.MeshStandardMaterial({ color: 0x0d0d0e, roughness: .5, metalness: .35 });
  L.add(ring(29.6, 30.6, .05, 2.6, M.blackMetal));
  L.add(ring(30.6, 32.35, 2.6, 4.2, matte));
  L.add(ring(32.35, 32.35, 4.2, 10.5, matte));
  L.add(ring(32.6, 32.6, 10.5, 19.5, new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: .55, metalness: .3, normalMap: nmap(knurlC, 5, { rx: 150, ry: 1 }), normalScale: V2(.9) })));
  L.add(ring(32.35, 32.35, 19.5, 26, matte));
  L.add(ring(32.35, 30.9, 26, 28.2, matte));
  // frontal con las inscripciones
  const fc = canvas(1024, 1024, (g, w) => {
    g.translate(w / 2, w / 2); const k = w / 62;       // px por mm
    g.fillStyle = '#0b0b0c'; g.beginPath(); g.arc(0, 0, 31 * k, 0, TAU); g.fill();
    const arc = (text, r, mid, size, flip = false) => {
      g.font = `600 ${size * k}px Archivo`; g.fillStyle = '#e9e9e9'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const widths = [...text].map(c => g.measureText(c).width + .22 * k), total = widths.reduce((a, b) => a + b, 0);
      let a = mid * Math.PI / 180 - (flip ? -1 : 1) * total / (2 * r * k);
      [...text].forEach((c, i) => {
        const half = widths[i] / (2 * r * k); a += (flip ? -1 : 1) * half;
        g.save(); g.rotate(a); g.translate(0, (flip ? 1 : -1) * r * k); g.fillText(c, 0, 0); g.restore();
        a += (flip ? -1 : 1) * half;
      });
    };
    arc('E 3.5-5.6/PZ 16-50 OSS', 26.4, -8, 2.25);
    arc('0.25m/0.82ft-0.30m/0.98ft', 26.4, 96, 2.0, true);
    arc('Ø40.5', 26.4, 218, 2.0, true);
  });
  const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 8;
  L.add(mesh(new THREE.RingGeometry(21.6, 30.9, 96, 1), new THREE.MeshStandardMaterial({ map: ft, roughness: .45, metalness: .3 }), 0, 0, 28.2));
  // frontal escalonado: tres anillos que recogen la luz y el cristal al fondo
  const wall = (r, z0, z1) => { const g = new THREE.CylinderGeometry(r, r, z1 - z0, 96, 1, true); g.rotateX(Math.PI / 2); return mesh(g, new THREE.MeshStandardMaterial({ color: 0x0a0a0b, roughness: .5, metalness: .4, side: THREE.BackSide }), 0, 0, (z0 + z1) / 2); };
  const step = (r0, r1, z, rough) => mesh(new THREE.RingGeometry(r0, r1, 96, 1), new THREE.MeshStandardMaterial({ color: 0x0d0d0e, roughness: rough, metalness: .75, roughnessMap: tex(spunC) }), 0, 0, z);
  L.add(wall(21.6, 26.2, 28.2)); L.add(step(17.4, 21.6, 26.2, .5));
  L.add(wall(17.4, 22.6, 26.2)); L.add(step(13.2, 17.4, 22.6, .32));
  L.add(wall(13.2, 19.6, 22.6)); L.add(step(10, 13.2, 19.6, .22));
  const dome = new THREE.SphereGeometry(30, 48, 12, 0, TAU, 0, .34); dome.rotateX(Math.PI / 2); const lg = M.glass.clone(); lg.envMapIntensity = .55; lg.iridescenceThicknessRange = [120, 380]; L.add(mesh(dome, lg, 0, 0, 19.6 - 28.28 - .2));
  L.add(mesh(new THREE.CircleGeometry(10, 48), M.dark, 0, 0, 17.2));
  // palanca de zoom motorizado
  const lev = rbox(3.2, 9, 4.4, .9, matte, 0, 0, 0); lev.position.set(Math.cos(-.25) * 33.1, Math.sin(-.25) * 33.1, 15); lev.rotation.z = -.25; L.add(lev);
  return L;
}

export async function buildCamera() {
  await Promise.all(['700 20px "Zilla Slab"', '700 20px Archivo', '600 20px Archivo', 'italic 500 20px "EB Garamond"'].map(f => document.fonts.load(f, 'SONYα6700')));
  const cam = new THREE.Group(), lens = buildLens();
  buildBody(cam); buildTop(cam); buildBack(cam); buildMount(cam); cam.add(lens);
  let tris = 0, meshes = 0;
  cam.traverse(o => { if (o.isMesh) { meshes++; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
  return { camera: cam, lens, stats: { tris: Math.round(tris), meshes } };
}
