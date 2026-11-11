/* GlassOS · utilidades e iconos compartidos */

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const wait = ms => new Promise(r => setTimeout(r, ms));
export const pad = n => String(n).padStart(2, '0');
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const el = html => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

/* Iconos de trazo sobre rejilla de 24. Un solo grosor, cantos redondos. */
const I = {
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  messages: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5Z"/>',
  camera: '<path d="M4 9a2 2 0 0 1 2-2h2l1.5-2.5h5L16 7h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><circle cx="12" cy="13" r="3.5"/>',
  photos: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="3.5"/><path d="M4 10h16M8.5 3v4M15.5 3v4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  weather: '<circle cx="8" cy="8" r="3"/><path d="M8 2.5v1.2M2.5 8h1.2M4.1 4.1l.9.9M11.9 4.1l-.9.9M8.5 19.5H17a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6 1.3 3 3 0 0 0 .7 5.7Z"/>',
  notes: '<path d="M7 4h7l4 4v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M14 4v4h4M8.5 12.5h7M8.5 16h4.5"/>',
  calc: '<rect x="5" y="3.5" width="14" height="17" rx="3.5"/><path d="M8.5 8h7M9 12.5h.01M12 12.5h.01M15 12.5h.01M9 16h.01M12 16h.01M15 16h.01"/>',
  contacts: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5a7 7 0 0 1 14 0"/>',
  music: '<path d="M9 17.5V6l10-2v11.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
  settings: '<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
  wifi: '<path d="M3 9.5a13 13 0 0 1 18 0M6 13a8.5 8.5 0 0 1 12 0M9 16.5a4.2 4.2 0 0 1 6 0M12 19.5h.01"/>',
  bluetooth: '<path d="m7 7.5 10 9-5 4v-17l5 4-10 9"/>',
  torch: '<path d="M9 3h6v4l-1.5 3v10h-3V10L9 7Z"/>',
  moon: '<path d="M19.5 14A8 8 0 0 1 10 4.5a8 8 0 1 0 9.5 9.5Z"/>',
  plane: '<path d="m12 3 2 7 7 3v2l-7-1.5V18l2.5 2v1L12 20l-4.5 1v-1L10 18v-4.5L3 15v-2l7-3Z"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  chev: '<path d="m9 5 7 7-7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  send: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
  speaker: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5ZM15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
  keypad: '<path d="M7 7h.01M12 7h.01M17 7h.01M7 12h.01M12 12h.01M17 12h.01M7 17h.01M12 17h.01M17 17h.01"/>',
  play: '<path d="M8 5.5v13l11-6.5Z"/>',
  pause: '<path d="M8 5.5v13M16 5.5v13"/>',
  next: '<path d="M6 5.5v13l10-6.5ZM18 5.5v13"/>',
  prev: '<path d="M18 5.5v13L8 12ZM6 5.5v13"/>',
  trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 12.5h8L17 7"/>',
  grid: '<path d="M9 4v16M15 4v16M4 9h16M4 15h16"/>',
  bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6Z"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  cloud: '<path d="M7.5 18.5H17a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6 1.5 3.3 3.3 0 0 0 .6 6.5Z"/>',
  rain: '<path d="M7.5 15.5H17a4 4 0 0 0 .5-8A5.5 5.5 0 0 0 6.9 9a3.3 3.3 0 0 0 .6 6.5ZM9 18.5l-1 2M13 18.5l-1 2M17 18.5l-1 2"/>',
  eye: '<path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
  drop: '<path d="M12 3.5s6 6.2 6 10.5a6 6 0 0 1-12 0c0-4.3 6-10.5 6-10.5Z"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.5h.01"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  power: '<path d="M12 3v8M6.3 6.8a8 8 0 1 0 11.4 0"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="m4.5 8 7.5 5.5L19.5 8"/>',
  motion: '<path d="M3 12c3-6 6-6 9 0s6 6 9 0"/>',
};

export const ico = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[name] || ''}</svg>`;

/* Deslizador de cristal: una pista y una gota. Devuelve una función para fijar el valor. */
export function slider(node, value, onInput, vertical = false) {
  const set = v => {
    value = clamp(v, 0, 1);
    node.style.setProperty('--v', value.toFixed(3));
  };
  const from = e => {
    const r = node.getBoundingClientRect();
    return vertical ? 1 - (e.clientY - r.top) / r.height : (e.clientX - r.left - 14) / (r.width - 28);
  };
  let down = false;
  node.addEventListener('pointerdown', e => {
    down = true;
    try { node.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
    set(from(e));
    onInput(value);
  });
  node.addEventListener('pointermove', e => {
    if (!down) return;
    set(from(e));
    onInput(value);
  });
  const up = () => { down = false; };
  node.addEventListener('pointerup', up);
  node.addEventListener('pointercancel', up);
  set(value);
  return set;
}

export const initials = name => name.split(' ').map(w => w[0]).slice(0, 2).join('');
