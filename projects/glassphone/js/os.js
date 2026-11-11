/* GlassOS · núcleo
   Arranque, bloqueo, inicio, centro de control y el "mundo" que se ve a través
   del teléfono: un cielo desenfocado dibujado en canvas o, si se activa la
   transparencia real, la cámara trasera del dispositivo. */
import { DAYS } from './scene.js';
import { $, $$, el, ico, clamp, pad, slider } from './ui.js';
import { APPS, HOME, DOCK, makeStore } from './apps.js';

const rgb = a => a.map(v => Math.round(v * 255)).join(',');
const WORLDS = DAYS.map((d, i) => ({ name: d.name, top: rgb(d.top), bot: rgb(d.bot), a: rgb(d.a), b: rgb(d.b), hi: rgb(d.light), light: i < 3 }));
const TINTS = [
  { name: 'Ninguno', c: '' },
  { name: 'Agua', c: '#8fe9d6' },
  { name: 'Ámbar', c: '#ffc77d' },
  { name: 'Rosa', c: '#ffa3c6' },
  { name: 'Lila', c: '#c0adff' },
];

const st = {
  root: null, built: false, open: false, phase: 'off', app: null, onExit: null,
  world: 3, live: false, zoom: 1, frost: .5, tint: 0, bright: 1, vol: .6,
  wifi: true, bt: true, air: false, dnd: false, torch: false, calm: false,
};
let screen, home, appEl, lock, cc, callEl, boot, bar, worldEl, cv, cx, video, dim;
let store = null, raf = 0, clockT = 0, lumaT = 0, cleanups = [], lastFrom = null, callT = 0, curCtx = null;

const discs = Array.from({ length: 18 }, (_, i) => ({
  x: Math.random(), y: Math.random(), r: .06 + Math.random() * .13, c: i % 3,
  p: Math.random() * 6.28, s: .04 + Math.random() * .07, a: .14 + Math.random() * .2,
}));

/* ───────── el mundo ───────── */

function drawWorld(c, W, H, wi, t, z) {
  const w = WORLDS[wi];
  c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgb(${w.top})`);
  g.addColorStop(1, `rgb(${w.bot})`);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  c.setTransform(z, 0, 0, z, W / 2 * (1 - z), H / 2 * (1 - z));
  const M = Math.max(W, H);
  const blob = (x, y, r, col, a) => {
    const q = c.createRadialGradient(x, y, 0, x, y, r);
    q.addColorStop(0, `rgba(${col},${a})`);
    q.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = q;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  };
  blob(W * (.5 + .3 * Math.sin(t * .05 + 1)), H * (.74 + .08 * Math.cos(t * .04)), M * .62, w.a, .7);
  blob(W * (.3 - .2 * Math.cos(t * .037)), H * (.28 + .1 * Math.sin(t * .05)), M * .5, w.b, .6);
  for (const d of discs) {
    const x = (d.x + Math.sin(t * d.s + d.p) * .07) * W, y = (d.y + Math.cos(t * d.s * .8 + d.p) * .05) * H;
    const r = d.r * Math.min(W, H) * 1.5, col = [w.a, w.b, w.hi][d.c], a = d.a * (w.light ? 1.25 : 1);
    const q = c.createRadialGradient(x, y, 0, x, y, r);
    q.addColorStop(0, `rgba(${col},${a * .7})`);
    q.addColorStop(.8, `rgba(${col},${a})`);
    q.addColorStop(.93, `rgba(${col},${a * 1.45})`);
    q.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = q;
    c.beginPath();
    c.arc(x, y, r, 0, 6.2832);
    c.fill();
  }
}

let frameN = 0;
function loop(now) {
  raf = requestAnimationFrame(loop);
  if (st.live || (frameN++ & 1)) return;
  drawWorld(cx, cv.width, cv.height, st.world, st.calm ? 40 : now / 1000, 1);
}

function snap() {
  const c = document.createElement('canvas');
  const r = screen.getBoundingClientRect();
  c.width = 360;
  c.height = Math.round(360 * r.height / r.width);
  const k = c.getContext('2d');
  const src = st.live ? video : cv;
  const sw = st.live ? video.videoWidth : cv.width, sh = st.live ? video.videoHeight : cv.height;
  if (!sw || !sh) return '';
  const ar = c.width / c.height;
  let w = sw / st.zoom, h = w / ar;
  if (h > sh / st.zoom) { h = sh / st.zoom; w = h * ar; }
  k.drawImage(src, (sw - w) / 2, (sh - h) / 2, w, h, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', .84);
}

function setTone(light) {
  screen.dataset.tone = light ? 'light' : 'dark';
}

function setWorld(i) {
  st.world = i;
  if (!st.live) setTone(WORLDS[i].light);
}

function setZoom(z) {
  st.zoom = z;
  cv.style.transform = video.style.transform = `scale(${z})`;
}

async function setLive(on) {
  clearInterval(lumaT);
  if (!on) {
    if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
    video.srcObject = null;
    st.live = false;
    worldEl.classList.remove('is-live');
    setTone(WORLDS[st.world].light);
    return false;
  }
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('sin cámara');
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false });
    video.srcObject = stream;
    await video.play();
    st.live = true;
    worldEl.classList.add('is-live');
    const probe = document.createElement('canvas');
    probe.width = probe.height = 8;
    const pc = probe.getContext('2d', { willReadFrequently: true });
    const check = () => {
      if (!st.live || !video.videoWidth) return;
      pc.drawImage(video, 0, 0, 8, 8);
      const d = pc.getImageData(0, 0, 8, 8).data;
      let s = 0;
      for (let i = 0; i < d.length; i += 4) s += d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11;
      setTone(s / 64 > 150);
    };
    lumaT = setInterval(check, 1200);
    setTimeout(check, 400);
    toast('Transparencia real activada');
    return true;
  } catch (e) {
    st.live = false;
    toast('No se pudo abrir la cámara. Revisa el permiso del navegador.');
    return false;
  }
}

/* ───────── sistema ───────── */

function toast(msg) {
  $$('.os-toast', screen).forEach(t => t.remove());
  const t = el(`<div class="os-toast g" role="status">${msg}</div>`);
  screen.append(t);
  setTimeout(() => t.remove(), 3500);
}

function apply() {
  screen.style.setProperty('--frost', (3 + st.frost * 38).toFixed(1) + 'px');
  const t = TINTS[st.tint];
  if (t.c) {
    screen.style.setProperty('--acc', t.c);
    screen.style.setProperty('--acc-ink', '#10131f');
  } else {
    screen.style.removeProperty('--acc');
    screen.style.removeProperty('--acc-ink');
  }
  screen.classList.toggle('has-tint', !!t.c);
  screen.classList.toggle('is-airplane', st.air);
  screen.classList.toggle('is-nowifi', !st.wifi || st.air);
  screen.classList.toggle('is-torch', st.torch);
  st.root.classList.toggle('is-calm', st.calm);
  dim.style.opacity = ((1 - st.bright) * .62).toFixed(2);
  if (store.audio) store.audio.volume(st.vol);
}

function tick() {
  const d = new Date();
  const hm = d.getHours() + ':' + pad(d.getMinutes());
  $('.os-clock', bar).textContent = hm;
  const lt = $('.lock-time', lock);
  if (lt) {
    lt.textContent = hm;
    const date = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    $('.lock-date', lock).textContent = date.charAt(0).toUpperCase() + date.slice(1);
  }
}

function layout() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const framed = vw > 560;
  st.root.classList.toggle('is-framed', framed);
  const dev = $('.os-device', st.root);
  if (framed) {
    dev.style.cssText = '';
    dev.style.setProperty('--k', Math.min((vh - 40) / 844, (vw - 40) / 390, 1.3).toFixed(4));
  } else {
    const vv = window.visualViewport;
    dev.style.cssText = `left:0;top:${vv ? vv.offsetTop : 0}px;width:${vw}px;height:${vv ? vv.height : vh}px;transform:none`;
  }
  const w = Math.max(160, Math.round(vw * .42)), h = Math.max(160, Math.round(vh * .42));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
}

/* ───────── arranque ───────── */

function startBoot() {
  st.phase = 'boot';
  bar.style.opacity = 0;
  lock.hidden = true;
  home.className = 'os-home is-locked';
  boot.hidden = false;
  boot.style.cssText = '';
  boot.innerHTML = `
    <div class="os-boot__in">
      <div class="boot-drop"><i></i><i></i><b></b></div>
      <div class="boot-name">Glass<em>OS</em></div>
      <div class="boot-line"><u></u></div>
    </div>
    <div class="boot-ver">Versión 1.0 · GlassPhone</div>`;
  const bootAt = performance.now();
  let done = false;
  const reveal = () => {
    if (done || st.phase !== 'boot') return;
    done = true;
    lock.hidden = false;
    lock.style.cssText = '';
    bar.style.opacity = 1;
    lock.animate([{ transform: 'scale(1.1)', filter: 'blur(14px)', opacity: 0 }, { transform: 'none', filter: 'blur(0)', opacity: 1 }], { duration: 1300, easing: 'cubic-bezier(.16,1,.3,1)' });
    $('.os-boot__in', boot).animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(1.15)' }], { duration: 420, fill: 'forwards' });
    const r = screen.getBoundingClientRect(), R = Math.hypot(screen.offsetWidth, screen.offsetHeight) * .62;
    const t0 = performance.now();
    const step = now => {
      const p = clamp((now - t0) / 1150, 0, 1), e = p * p * (3 - 2 * p), rad = e * R;
      const m = `radial-gradient(circle at 50% 46%, transparent ${rad.toFixed(1)}px, #000 ${(rad + 70).toFixed(1)}px)`;
      boot.style.webkitMaskImage = m;
      boot.style.maskImage = m;
      if (p < 1 && r.width) requestAnimationFrame(step);
      else { boot.hidden = true; st.phase = 'lock'; }
    };
    requestAnimationFrame(step);
  };
  setTimeout(reveal, st.calm ? 600 : 3900);
  boot.onclick = () => { if (performance.now() - bootAt > 900) reveal(); };
}

/* ───────── bloqueo ───────── */

function buildLock() {
  const fine = window.matchMedia('(pointer: fine)').matches;
  lock.innerHTML = `
    <div class="lock-date"></div>
    <div class="lock-time"></div>
    <div class="lock-notes">
      <button class="note g press" data-note="live">
        <span class="note__ic g0">${ico('eye')}</span>
        <span><b>Transparencia real <small>ahora</small></b><span>Usa la cámara para ver a través del teléfono. Toca para activarla.</span></span>
      </button>
      <button class="note g press" data-note="chat">
        <span class="note__ic g0">${ico('messages')}</span>
        <span><b>Lucía <small>hace 2 min</small></b><span>¿Has visto ya el canto verde a contraluz?</span></span>
      </button>
    </div>
    <div class="lock-foot">
      <button class="round g press" data-lock="torch" aria-label="Linterna">${ico('torch')}</button>
      <button class="lock-hint" data-lock="open"><span>${fine ? 'Desliza o pulsa para abrir' : 'Desliza hacia arriba'}</span></button>
      <button class="round g press" data-lock="cam" aria-label="Cámara">${ico('camera')}</button>
    </div>`;

  let y0 = null, dy = 0, dragged = false;
  lock.addEventListener('pointerdown', e => {
    y0 = e.clientY; dy = 0; dragged = false;
  });
  lock.addEventListener('pointermove', e => {
    if (y0 === null) return;
    dy = Math.min(0, e.clientY - y0);
    if (dy < -8) dragged = true;
    if (dragged) {
      lock.style.transition = 'none';
      lock.style.transform = `translateY(${dy}px)`;
      lock.style.opacity = clamp(1 + dy / 420, 0, 1);
    }
  });
  const end = () => {
    if (y0 === null) return;
    y0 = null;
    if (dragged && dy < -110) unlock();
    else if (dragged) {
      lock.style.transition = 'transform .5s var(--spring), opacity .3s';
      lock.style.transform = '';
      lock.style.opacity = '';
    }
  };
  lock.addEventListener('pointerup', end);
  lock.addEventListener('pointercancel', end);
  lock.addEventListener('click', e => {
    if (dragged) { dragged = false; return; }
    const b = e.target.closest('[data-lock], [data-note]');
    if (!b) return;
    if (b.dataset.lock === 'torch') { st.torch = !st.torch; b.classList.toggle('is-on', st.torch); apply(); }
    else if (b.dataset.lock === 'open') unlock();
    else if (b.dataset.lock === 'cam') unlock(() => openApp('camera'));
    else if (b.dataset.note === 'live') setLive(true).then(ok => { if (ok) b.remove(); });
    else if (b.dataset.note === 'chat') unlock(() => openApp('messages', null, { chat: 'Lucía' }));
  });
}

function unlock(then) {
  if (st.phase !== 'lock') return;
  st.phase = 'home';
  lock.style.transition = 'transform .55s cubic-bezier(.3,0,.2,1), opacity .45s';
  lock.style.transform = 'translateY(-100%)';
  lock.style.opacity = 0;
  home.classList.remove('is-locked');
  home.classList.add('is-in');
  setTimeout(() => { lock.hidden = true; home.classList.remove('is-in'); }, 1100);
  if (then) setTimeout(then, 520);
}

function lockNow() {
  closeCC();
  if (st.app) closeApp(true);
  callEl.hidden = true;
  clearInterval(callT);
  st.phase = 'lock';
  lock.hidden = false;
  lock.style.transition = 'none';
  lock.style.transform = 'translateY(-100%)';
  lock.style.opacity = 0;
  home.classList.add('is-locked');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    lock.style.transition = 'transform .6s var(--ease), opacity .4s';
    lock.style.transform = '';
    lock.style.opacity = '';
  }));
}

/* ───────── inicio ───────── */

function buildHome() {
  const d = new Date();
  const icon = (id, i) => `
    <button class="icon press" data-open="${id}" style="--i:${i}" aria-label="${APPS[id].name}">
      <span class="icon__g g0">${APPS[id].glyph ? APPS[id].glyph(d) : ico(APPS[id].icon)}</span>
      <span>${APPS[id].name}</span>
    </button>`;
  home.innerHTML = `
    <div class="widgets">
      <button class="widget g press" data-open="weather" style="--i:0" aria-label="Tiempo">
        <span class="widget__k">${ico('sun')} Fuera</span>
        <span class="widget__big">21°</span>
        <span class="widget__s">Despejado · máx. 24°</span>
      </button>
      <button class="widget g press" data-open="calendar" style="--i:1" aria-label="Calendario">
        <span class="widget__k">${ico('calendar')} ${d.toLocaleDateString('es-ES', { weekday: 'long' })}</span>
        <span class="widget__big">${d.getDate()}</span>
        <span class="widget__ev">Comida con Lucía<span>13:30 · La Pubilla</span></span>
      </button>
    </div>
    <div class="grid">${HOME.map((id, i) => icon(id, i + 2)).join('')}</div>
    <div class="dock g" style="--i:11; margin-top:auto">${DOCK.map((id, i) => icon(id, i + 11)).join('')}</div>`;
  home.addEventListener('click', e => {
    const b = e.target.closest('[data-open]');
    if (b && st.phase === 'home') openApp(b.dataset.open, b.querySelector('.icon__g') || b);
  });
}

/* ───────── apps ───────── */

function originOf(from) {
  const s = screen.getBoundingClientRect(), k = s.width / screen.offsetWidth || 1;
  const r = from && from.isConnected ? from.getBoundingClientRect() : { left: s.left + s.width * .4, top: s.top + s.height * .42, width: s.width * .2, height: s.height * .12 };
  return `translate(${((r.left - s.left) / k).toFixed(1)}px, ${((r.top - s.top) / k).toFixed(1)}px) scale(${(r.width / s.width).toFixed(4)}, ${(r.height / s.height).toFixed(4)})`;
}

function makeCtx() {
  const views = [];
  const ctx = {
    st, store, WORLDS, TINTS, toast, apply, setWorld, setZoom, setLive, snap,
    view(html, cls = '') {
      const v = el(`<div class="view ${cls}">${html}</div>`);
      appEl.append(v);
      views.push(v);
      return v;
    },
    push(html, cls = '') {
      const under = views[views.length - 1];
      const v = ctx.view(html, 'is-sub ' + cls);
      if (under) under.classList.add('is-under');
      return v;
    },
    pop() {
      if (views.length < 2) return;
      const v = views.pop();
      v.classList.add('is-out');
      views[views.length - 1].classList.remove('is-under');
      if (v.onleave) v.onleave();
      setTimeout(() => v.remove(), 380);
    },
    onClose(fn) { cleanups.push(fn); },
    call: startCall,
    open(id, opts) { closeApp(true); setTimeout(() => openApp(id, null, opts), 60); },
    exit: close,
    lock: lockNow,
  };
  return ctx;
}

function openApp(id, from, opts) {
  if (st.app || !APPS[id]) return;
  st.app = id;
  lastFrom = from || null;
  const app = APPS[id];
  appEl.hidden = false;
  appEl.className = 'os-app' + (app.clear ? ' is-clear' : '');
  appEl.dataset.app = id;
  appEl.style.cssText = '';
  appEl.innerHTML = '';
  appEl.getAnimations().forEach(a => a.cancel());
  curCtx = makeCtx();
  app.render(curCtx, opts || {});
  home.classList.add('is-behind');
  appEl.animate(
    [{ transform: originOf(from), opacity: .2, borderRadius: '80px' }, { transform: 'none', opacity: 1, borderRadius: '0px' }],
    { duration: st.calm ? 1 : 560, easing: 'cubic-bezier(.2,.9,.25,1)' }
  );
}

function closeApp(instant) {
  if (!st.app) return;
  st.app = null;
  cleanups.splice(0).forEach(fn => fn());
  setZoom(1);
  home.classList.remove('is-behind');
  const done = () => { if (!st.app) { appEl.hidden = true; appEl.innerHTML = ''; appEl.style.cssText = ''; } };
  if (instant === true) return done();
  const a = appEl.animate(
    [{ transform: appEl.style.transform || 'none', opacity: 1 }, { transform: originOf(lastFrom), opacity: 0, borderRadius: '80px' }],
    { duration: st.calm ? 1 : 420, easing: 'cubic-bezier(.4,0,.2,1)' }
  );
  appEl.style.opacity = 0;
  a.onfinish = done;
  a.oncancel = done;
}

function startCall(name, sub) {
  clearInterval(callT);
  callEl.hidden = false;
  callEl.innerHTML = `
    <span class="avatar g0" style="width:112px;height:112px;font-size:44px">${name.replace(/[^A-Za-zÀ-ÿ ]/g, '').trim() ? name.split(' ').map(w => w[0]).slice(0, 2).join('') : ico('contacts')}</span>
    <div class="call-name">${name}</div>
    <div class="call-st">Llamando…</div>
    <div class="call-grid">
      <button class="press" data-t><span class="round g0">${ico('mic')}</span>Silenciar</button>
      <button class="press" data-t><span class="round g0">${ico('keypad')}</span>Teclado</button>
      <button class="press" data-t><span class="round g0">${ico('speaker')}</span>Altavoz</button>
    </div>
    <button class="fab call-end press" aria-label="Colgar">${ico('phone')}</button>`;
  let s = -3;
  callT = setInterval(() => {
    s++;
    const stt = $('.call-st', callEl);
    if (stt && s >= 0) stt.textContent = `${sub ? sub + ' · ' : ''}${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  }, 1000);
}

/* ───────── centro de control ───────── */

function openCC() {
  if (st.phase === 'boot') return;
  const tog = (k, icon, label) => `<button class="round g0 press ${st[k] ? 'is-on' : ''}" data-tog="${k}" aria-label="${label}" aria-pressed="${st[k]}">${ico(icon)}</button>`;
  const playing = store.audio && store.audio.playing;
  cc.hidden = false;
  cc.classList.remove('is-out');
  cc.innerHTML = `
    <div class="cc-grid">
      <div class="cc-conn g">${tog('air', 'plane', 'Modo avión')}${tog('wifi', 'wifi', 'Wi‑Fi')}${tog('bt', 'bluetooth', 'Bluetooth')}${tog('dnd', 'moon', 'No molestar')}</div>
      <button class="cc-now g press" data-cc="music">${ico(playing ? 'pause' : 'play')}<span><b>${store.tracks[store.track].t}</b><span>${store.tracks[store.track].a} · ${playing ? 'sonando' : 'en pausa'}</span></span></button>
      <div class="cc-v g" data-v="bright" aria-label="Brillo"><u></u>${ico('sun')}</div>
      <div class="cc-v g" data-v="vol" aria-label="Volumen"><u></u>${ico('speaker')}</div>
      <button class="cc-t g press ${st.torch ? 'is-on' : ''}" data-cc="torch" aria-label="Linterna">${ico('torch')}</button>
      <button class="cc-t g press" data-cc="camera" aria-label="Cámara">${ico('camera')}</button>
      <button class="cc-t g press" data-cc="calc" aria-label="Calculadora">${ico('calc')}</button>
      <button class="cc-t g press" data-cc="lock" aria-label="Bloquear">${ico('lock')}</button>
      <button class="cc-wide g press" data-cc="world">Mundo <span>${st.live ? 'cámara' : WORLDS[st.world].name}</span></button>
      <button class="cc-wide g press" data-cc="exit">Apagar y volver a la web ${ico('power')}</button>
    </div>`;
  $$('.cc-v', cc).forEach(n => slider(n, st[n.dataset.v], v => { st[n.dataset.v] = v; apply(); }, true));
}

function closeCC() {
  if (cc.hidden) return;
  cc.classList.add('is-out');
  setTimeout(() => { cc.hidden = true; }, 330);
}

function onCC(e) {
  if (e.target === cc || e.target.classList.contains('cc-grid')) return closeCC();
  const t = e.target.closest('[data-tog]');
  if (t) {
    const k = t.dataset.tog;
    st[k] = !st[k];
    t.classList.toggle('is-on', st[k]);
    t.setAttribute('aria-pressed', st[k]);
    return apply();
  }
  const b = e.target.closest('[data-cc]');
  if (!b) return;
  const a = b.dataset.cc;
  if (a === 'torch') { st.torch = !st.torch; b.classList.toggle('is-on', st.torch); apply(); }
  else if (a === 'world') {
    if (st.live) setLive(false);
    setWorld((st.world + 1) % 5);
    $('span', b).textContent = WORLDS[st.world].name;
  }
  else if (a === 'lock') lockNow();
  else if (a === 'exit') close();
  else if (a === 'music') { store.audio.toggle(st.vol); openCC(); }
  else if (st.phase === 'home') {
    closeCC();
    if (st.app) closeApp(true);
    setTimeout(() => openApp(a), 80);
  }
}

/* ───────── ciclo de vida ───────── */

function build(root) {
  st.root = root;
  root.innerHTML = `
    <div class="os-world"><canvas></canvas><video playsinline muted></video></div>
    <div class="os-device">
      <div class="os-screen" data-tone="dark">
        <div class="os-home is-locked"></div>
        <div class="os-app" hidden></div>
        <div class="os-torch"></div>
        <div class="os-lock" hidden></div>
        <div class="os-call" hidden></div>
        <div class="os-bar">
          <button class="os-back g press" data-sys="exit" aria-label="Salir de GlassOS y volver a la web">${ico('back')}Web</button>
          <span class="os-clock"></span>
          <button class="os-sys press" data-sys="cc" aria-label="Centro de control">
            <span class="sig"><i></i><i></i><i></i><i></i></span>${ico('wifi', 'wifi')}<span class="bat"></span>
          </button>
        </div>
        <div class="os-cc" hidden></div>
        <button class="os-homebar" aria-label="Ir a inicio"><i></i></button>
        <div class="os-dim"></div>
        <div class="os-boot"></div>
      </div>
    </div>`;
  worldEl = $('.os-world', root); cv = $('canvas', worldEl); cx = cv.getContext('2d'); video = $('video', worldEl);
  screen = $('.os-screen', root); home = $('.os-home', root); appEl = $('.os-app', root); lock = $('.os-lock', root);
  cc = $('.os-cc', root); callEl = $('.os-call', root); boot = $('.os-boot', root); bar = $('.os-bar', root); dim = $('.os-dim', root);
  store = makeStore();
  layout();
  buildLock();
  buildHome();

  bar.addEventListener('click', e => {
    const b = e.target.closest('[data-sys]');
    if (!b) return;
    if (b.dataset.sys === 'exit') close();
    else if (cc.hidden) openCC();
    else closeCC();
  });
  cc.addEventListener('click', onCC);
  appEl.addEventListener('click', e => {
    if (e.target.closest('[data-back]') && curCtx) curCtx.pop();
  });
  callEl.addEventListener('click', e => {
    const t = e.target.closest('[data-t]');
    if (t) $('.round', t).classList.toggle('is-on');
    if (e.target.closest('.call-end')) { clearInterval(callT); callEl.hidden = true; }
  });

  // barra de inicio: tocar o deslizar hacia arriba vuelve a casa
  const hb = $('.os-homebar', root);
  let y0 = null, dy = 0;
  const goHome = () => {
    if (!cc.hidden) closeCC();
    else if (!callEl.hidden) { clearInterval(callT); callEl.hidden = true; }
    else if (st.app) closeApp();
  };
  hb.addEventListener('pointerdown', e => {
    y0 = e.clientY; dy = 0;
    try { hb.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
  });
  hb.addEventListener('pointermove', e => {
    if (y0 === null || !st.app) return;
    dy = Math.min(0, e.clientY - y0);
    appEl.style.transformOrigin = '50% 100%';
    appEl.style.transform = `translateY(${dy * .35}px) scale(${Math.max(.6, 1 + dy / 700)})`;
    appEl.style.borderRadius = '48px';
  });
  const hbEnd = () => {
    if (y0 === null) return;
    y0 = null;
    if (dy < -70 || dy > -6) goHome();
    if (st.app) { appEl.style.transition = 'transform .4s var(--spring)'; appEl.style.transform = ''; setTimeout(() => { appEl.style.cssText = ''; }, 420); }
  };
  hb.addEventListener('pointerup', hbEnd);
  hb.addEventListener('pointercancel', () => { y0 = null; appEl.style.cssText = ''; });

  window.addEventListener('resize', () => { if (st.open) layout(); });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => { if (st.open) layout(); });
  document.addEventListener('keydown', e => {
    if (!st.open) return;
    const typing = /INPUT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName);
    if (e.key === 'Escape') {
      if (!cc.hidden) closeCC();
      else if (!callEl.hidden) { clearInterval(callT); callEl.hidden = true; }
      else if (st.app) closeApp();
      else close();
    } else if (st.phase === 'lock' && !typing && (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === ' ')) {
      e.preventDefault();
      unlock();
    }
  });
  st.built = true;
}

function close() {
  if (!st.open) return;
  st.open = false;
  setLive(false);
  if (store.audio) store.audio.pause();
  clearInterval(callT);
  st.root.classList.add('is-leaving');
  setTimeout(() => {
    cancelAnimationFrame(raf);
    clearInterval(clockT);
    if (st.app) closeApp(true);
    closeCC();
    callEl.hidden = true;
    st.root.hidden = true;
    st.root.classList.remove('is-leaving');
    st.phase = 'off';
  }, 480);
  if (st.onExit) st.onExit();
}

export const GlassOS = {
  open(root, { onExit } = {}) {
    if (st.open) return;
    if (!st.built) build(root);
    st.open = true;
    st.onExit = onExit;
    st.torch = false;
    root.hidden = false;
    layout();
    setWorld(st.world);
    apply();
    tick();
    clockT = setInterval(tick, 1000);
    drawWorld(cx, cv.width, cv.height, st.world, performance.now() / 1000, 1);
    raf = requestAnimationFrame(loop);
    if (!store.photos.length) {
      const c = document.createElement('canvas');
      c.width = 270; c.height = 360;
      const k = c.getContext('2d');
      [[1, 12, 1.3], [3, 40, 1], [0, 77, 1.6], [4, 120, 1.2], [2, 200, 1], [3, 310, 2]].forEach(([w, t, z]) => {
        drawWorld(k, 270, 360, w, t, z);
        store.photos.push(c.toDataURL('image/jpeg', .8));
      });
    }
    startBoot();
  },
  close,
};
