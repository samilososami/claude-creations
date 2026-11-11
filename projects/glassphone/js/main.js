/* GlassPhone · interacciones de la página */
import { createScene } from './scene.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wait = ms => new Promise(r => setTimeout(r, ms));
const body = document.body;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeMeta = $('meta[name="theme-color"]');

/* ───────── escena ───────── */

const scene = createScene($('#gl'), {
  onTone(dark) {
    body.classList.toggle('dark', dark);
    if (themeMeta) themeMeta.content = dark ? '#0b1530' : '#f3e4d6';
  },
});
if (!scene) document.documentElement.classList.add('no-gl');

const lift = () => body.classList.remove('is-loading');
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(lift, 120));
setTimeout(lift, 1800);

/* ───────── apariciones y contadores ───────── */

const fmt = (v, el) => {
  const dec = +el.dataset.dec || 0;
  let s = v.toFixed(dec).replace('.', ',');
  if (el.dataset.group) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return s + (el.dataset.suffix || '');
};

function count(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const to = +el.dataset.count;
  if (reduced || !to) return;
  const t0 = performance.now();
  const step = now => {
    const p = clamp((now - t0) / 1300, 0, 1);
    el.textContent = fmt(to * (1 - Math.pow(1 - p, 4)), el);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(count);
    io.unobserve(e.target);
  }
}, { threshold: .25 });

$$('.rv').forEach(el => {
  const sibs = $$(':scope > .rv', el.parentElement);
  el.style.setProperty('--i', Math.max(0, sibs.indexOf(el)));
  io.observe(el);
});
$$('.caption').forEach(el => io.observe(el));

/* ───────── las fichas entran y se van con el scroll ───────── */

const pins = $$('.pin').map(pin => ({ pin, cap: $('.caption', pin) }));
let ticking = false;

function onScroll() {
  ticking = false;
  const H = window.innerHeight;
  for (const { pin, cap } of pins) {
    const r = pin.getBoundingClientRect();
    if (r.bottom < -40 || r.top > H) continue;
    const enter = clamp(1 - r.top / (H * .3), 0, 1);
    const leave = clamp(-r.top / (H * .32), 0, 1);
    const k = 1 - Math.pow(1 - enter, 3);
    cap.style.opacity = (k * (1 - leave)).toFixed(3);
    cap.style.transform = `translate3d(0, ${((1 - k) * 46 - leave * 26).toFixed(1)}px, 0) scale(${(.955 + .045 * k).toFixed(4)})`;
    cap.style.pointerEvents = leave > .6 || enter < .5 ? 'none' : '';
  }
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(onScroll);
  }
}, { passive: true });
onScroll();

/* ───────── navegación ───────── */

const links = $$('.nav__links a');
const here = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    links.forEach(a => a.classList.toggle('is-here', a.getAttribute('href') === '#' + e.target.id));
  }
}, { rootMargin: '-45% 0px -45% 0px' });
$$('main > section[id]').forEach(s => here.observe(s));

/* ───────── gotas: física de los botones ─────────
   Cada botón es una gota con dos muelles (ancho y alto) desfasados: al pulsar
   se aplasta, al soltar tiembla conservando el volumen. Con ratón, además, la
   gota se estira hacia el cursor. */

const jellies = new Set();
let jellyOn = false, jellyLast = 0;

function jellyLoop(now) {
  const dt = Math.min(.032, (now - jellyLast) / 1000 || .016);
  jellyLast = now;
  for (const j of jellies) {
    let rest = true;
    for (const k of ['sx', 'sy', 'ox', 'oy']) {
      const stiff = k[0] === 's' ? 430 : 260, damp = k[0] === 's' ? 13 : 22;
      j.v[k] += ((j.t[k] - j.p[k]) * stiff - j.v[k] * damp) * dt;
      j.p[k] += j.v[k] * dt;
      if (Math.abs(j.v[k]) > .002 || Math.abs(j.t[k] - j.p[k]) > .0008) rest = false;
    }
    j.el.style.transform = `translate(${j.p.ox.toFixed(2)}px, ${j.p.oy.toFixed(2)}px) scale(${j.p.sx.toFixed(4)}, ${j.p.sy.toFixed(4)})`;
    if (rest) {
      jellies.delete(j);
      j.el.style.transform = '';
    }
  }
  if (jellies.size) requestAnimationFrame(jellyLoop);
  else jellyOn = false;
}

function wake(j) {
  jellies.add(j);
  if (!jellyOn) {
    jellyOn = true;
    jellyLast = performance.now();
    requestAnimationFrame(jellyLoop);
  }
}

export function makeJelly(el) {
  if (el.jelly || reduced) return;
  const j = { el, p: { sx: 1, sy: 1, ox: 0, oy: 0 }, v: { sx: 0, sy: 0, ox: 0, oy: 0 }, t: { sx: 1, sy: 1, ox: 0, oy: 0 } };
  el.jelly = j;
  el.addEventListener('pointerdown', () => {
    j.t.sx = 1.07; j.t.sy = .89;
    wake(j);
  });
  const release = kick => () => {
    if (j.t.sx !== 1 && kick) { j.v.sx -= 2.4; j.v.sy += 3; }
    j.t.sx = 1; j.t.sy = 1; j.t.ox = 0; j.t.oy = 0;
    wake(j);
  };
  el.addEventListener('pointerup', release(true));
  el.addEventListener('pointerleave', release(false));
  el.addEventListener('pointercancel', release(false));
  el.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width - .5, my = (e.clientY - r.top) / r.height - .5;
    j.t.ox = mx * Math.min(18, r.width * .12);
    j.t.oy = my * Math.min(12, r.height * .2);
    if (j.t.sx === 1) { j.t.sx = 1 + Math.abs(mx) * .05; j.t.sy = 1 + Math.abs(my) * .06; }
    el.style.setProperty('--mx', mx.toFixed(3));
    el.style.setProperty('--my', my.toFixed(3));
    wake(j);
  });
  el.addEventListener('pointerenter', e => {
    if (e.pointerType !== 'mouse') return;
    j.v.sx += .5; j.v.sy -= .5;
    wake(j);
  });
}

$$('.drop, .nav__os, .nav__i, .nav__brand, .viewer__close').forEach(makeJelly);

document.addEventListener('click', e => {
  const d = e.target.closest('.drop');
  if (!d || !scene) return;
  const r = d.getBoundingClientRect();
  scene.splash(r.left + r.width / 2, r.top + r.height / 2, 6);
});

/* ───────── visor 3D ───────── */

const viewer = $('#viewer');
let viewing = false;

function openViewer() {
  if (viewing) return;
  viewing = true;
  body.classList.add('is-away', 'is-locked');
  viewer.hidden = false;
  if (scene) scene.setViewer(true);
  else $('#viewerHint').textContent = 'Este navegador no tiene WebGL activo, así que el modelo 3D no puede dibujarse aquí.';
  if (scene) setTimeout(() => $('#viewerHint').classList.add('is-gone'), 5200);
}

function closeViewer() {
  if (!viewing) return;
  viewing = false;
  viewer.hidden = true;
  if (scene) scene.setViewer(false);
  body.classList.remove('is-away', 'is-locked');
  $('#viewerHint').classList.remove('is-gone');
}

if (scene) {
  scene.bindStage($('#inlineStage'), false);
  scene.bindStage($('#viewerStage'), true);
  $('#viewerStage').addEventListener('pointerdown', () => $('#viewerHint').classList.add('is-gone'));
}

$$('[data-toggle]').forEach(btn => {
  btn.addEventListener('click', () => {
    const k = btn.dataset.toggle;
    if (!scene) {
      const on = btn.classList.toggle('is-on');
      btn.setAttribute('aria-pressed', on);
      return;
    }
    if (k === 'day') {
      scene.view.day = (scene.view.day + 1) % 5;
      $('#dayName').textContent = scene.dayName(scene.view.day);
      return;
    }
    scene.view[k] = !scene.view[k];
    btn.classList.toggle('is-on', scene.view[k]);
    btn.setAttribute('aria-pressed', scene.view[k]);
  });
});

/* ───────── GlassOS ───────── */

let osModule = null, simOpen = false;
const loadOS = () => osModule || (osModule = import('./os.js'));
if ('requestIdleCallback' in window) requestIdleCallback(loadOS, { timeout: 4000 });
else setTimeout(loadOS, 2500);

async function openSim() {
  if (simOpen) return;
  simOpen = true;
  if (viewing) closeViewer();
  const root = document.documentElement;
  if (root.requestFullscreen && window.matchMedia('(pointer: coarse)').matches) {
    root.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  }
  body.classList.add('is-away', 'is-locked');
  if (scene) scene.setDive(true);
  const [mod] = await Promise.all([loadOS(), wait(scene && !reduced ? 820 : 0)]);
  if (themeMeta) themeMeta.content = '#000000';
  mod.GlassOS.open($('#os'), { onExit: closeSim });
  await wait(500);
  if (scene && simOpen) scene.paused = true;
}

function closeSim() {
  if (!simOpen) return;
  simOpen = false;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  if (scene) {
    scene.paused = false;
    scene.setDive(false);
  }
  if (themeMeta) themeMeta.content = body.classList.contains('dark') ? '#0b1530' : '#f3e4d6';
  body.classList.remove('is-away', 'is-locked');
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act === 'sim') openSim();
  else if (act === 'viewer') openViewer();
  else if (act === 'viewer-close') closeViewer();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && viewing) closeViewer();
});
