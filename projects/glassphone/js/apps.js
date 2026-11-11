/* GlassOS · las apps
   Cada app recibe un contexto (ctx) con lo que puede pedirle al sistema: crear
   vistas, apilarlas, llamar, cambiar el mundo, etc. Ninguna tapa del todo lo que
   hay detrás: todas son la misma lámina de cristal, más o menos esmerilada. */
import { $, $$, el, ico, esc, pad, slider, initials } from './ui.js';

export const HOME = ['calendar', 'clock', 'weather', 'notes', 'calc', 'contacts', 'music', 'settings'];
export const DOCK = ['phone', 'messages', 'camera', 'photos'];

const head = (title, action = '') => `
  <div class="vh">
    <button class="press" data-back aria-label="Atrás">${ico('back')}</button>
    <span class="vh__t">${title}</span>
    ${action || '<span></span>'}
  </div>`;
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
const bubble = m => `<div class="bub ${m.me ? 'me' : 'them g0'}">${esc(m.t)}</div>`;

const PEOPLE = [
  ['Abril Soler', '611 20 45 78'], ['Bruno Marín', '622 31 09 12'], ['Carla Vidal', '633 87 54 01'], ['Dani Ferrer', '644 12 66 30'],
  ['Elena Ruiz', '655 40 18 92'], ['Hugo Navarro', '666 73 21 05'], ['Irene Costa', '677 05 39 44'], ['Lucía Prats', '688 14 70 26'],
  ['Marc Oliva', '699 58 02 17'], ['Nora Gil', '600 91 33 68'], ['Pau Serra', '610 27 84 59'], ['Sara Molina', '620 66 15 73'],
];

/* ───────── datos que sobreviven mientras GlassOS está encendido ───────── */

export function makeStore() {
  const store = {
    photos: [],
    track: 0,
    tracks: [
      { t: 'Mediodía', a: 'Vidrio', d: 214, f: [196, 246.94, 293.66, 392] },
      { t: 'Hora dorada', a: 'Vidrio', d: 187, f: [174.61, 220, 261.63, 349.23] },
      { t: 'Marea baja', a: 'Sal', d: 243, f: [146.83, 220, 277.18, 329.63] },
      { t: 'Niebla', a: 'Lente', d: 201, f: [164.81, 196, 246.94, 293.66] },
    ],
    notes: [
      { t: 'El canto', b: 'A contraluz el borde se ve verde. No es un fallo, es el cristal. Enseñarlo siempre de lado en las fotos.' },
      { t: 'Compra', b: 'Limones\nCafé en grano\nPan del bueno\nUna planta para la ventana' },
      { t: 'Frases', b: '«Lo que no está no se puede romper.»\n«El mejor marco es no tener marco.»' },
    ],
    chats: [
      { name: 'Lucía', unread: true, n: 0, msgs: [{ t: 'Ya lo tengo en la mano' }, { t: 'No me acostumbro a verme los dedos a través del móvil' }, { me: 1, t: 'jajaja ¿y qué tal la pantalla?' }, { t: '¿Has visto ya el canto verde a contraluz?' }], pool: ['Es que parece que no hay nada', 'Te lo enseño el viernes', 'Vale, pero trae tú el postre', 'Ahora no puedo, luego te llamo', 'Eso mismo pensé yo'] },
      { name: 'Marc', n: 0, msgs: [{ me: 1, t: '¿Cena el viernes en tu casa?' }, { t: 'Hecho. A las 20:30' }, { t: 'Trae el teléfono ese que no se ve' }], pool: ['Perfecto', 'Yo pongo el vino', 'Avisa cuando salgas', 'Ni idea, pregúntale a Nora'] },
      { name: 'Nora', n: 0, msgs: [{ t: 'Te has dejado las gafas en la óptica' }, { me: 1, t: 'Paso mañana a por ellas' }], pool: ['Cierran a las ocho', 'Vale', 'Te las guardo yo si quieres', 'No tardes'] },
      { name: 'Mamá', n: 0, msgs: [{ t: '¿Cómo se enciende esto?' }, { me: 1, t: 'Tócalo dos veces' }, { t: 'Ya. Qué bonito' }], pool: ['Llámame cuando puedas', 'Qué cosas inventan', 'Un beso', '¿Y si se me cae?'] },
    ],
  };
  let ac = null, out = null, lp = null, nodes = [];
  store.audio = {
    playing: false,
    chord() {
      nodes.forEach(n => { try { n.stop(); } catch (e) { /* ya parado */ } });
      nodes = [];
      store.tracks[store.track].f.forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain(), l = ac.createOscillator(), lg = ac.createGain();
        o.type = i % 2 ? 'sine' : 'triangle';
        o.frequency.value = f;
        o.detune.value = (i - 1.5) * 7;
        g.gain.value = .14;
        l.frequency.value = .06 + i * .045;
        lg.gain.value = .09;
        l.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(lp);
        o.start(); l.start();
        nodes.push(o, l);
      });
    },
    play(vol) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.playing = true;
      if (!AC) return;
      if (!ac) {
        ac = new AC();
        out = ac.createGain();
        out.gain.value = 0;
        lp = ac.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1100;
        lp.connect(out);
        out.connect(ac.destination);
      }
      ac.resume();
      this.chord();
      this.volume(vol);
    },
    pause() {
      if (ac) out.gain.setTargetAtTime(0, ac.currentTime, .15);
      this.playing = false;
    },
    volume(v) {
      if (ac && this.playing) out.gain.setTargetAtTime(v * .5, ac.currentTime, .4);
    },
    toggle(vol) {
      if (this.playing) this.pause();
      else this.play(vol);
    },
  };
  return store;
}

/* ───────── apps ───────── */

export const APPS = {

  phone: {
    name: 'Teléfono', icon: 'phone',
    render(ctx) {
      const K = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']];
      const v = ctx.view(`
        <div class="dial-num is-empty" aria-live="polite">Marca un número</div>
        <div class="keys">
          ${K.map(([d, l]) => `<button class="key g0 press" data-k="${d}">${d}<small>${l}</small></button>`).join('')}
          <span></span>
          <button class="key key--call press" data-call disabled aria-label="Llamar">${ico('phone')}</button>
          <button class="key key--ghost press" data-del aria-label="Borrar">${ico('back')}</button>
        </div>`);
      let num = '';
      const out = $('.dial-num', v), callBtn = $('[data-call]', v);
      v.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.k && num.length < 12) num += b.dataset.k;
        else if ('del' in b.dataset) num = num.slice(0, -1);
        else if ('call' in b.dataset && num) ctx.call(out.textContent, 'móvil');
        out.classList.toggle('is-empty', !num);
        out.textContent = num ? num.replace(/(.{3})(?=.)/g, '$1 ') : 'Marca un número';
        callBtn.disabled = !num;
      });
    },
  },

  messages: {
    name: 'Mensajes', icon: 'messages',
    render(ctx, opts) {
      const chats = ctx.store.chats;
      const v = ctx.view('<div class="scroll"><h2 class="vt">Mensajes</h2><div class="list g0" data-list></div></div>');
      const paint = () => {
        $('[data-list]', v).innerHTML = chats.map((c, i) => {
          const last = c.msgs[c.msgs.length - 1];
          return `
            <button class="row chatrow press" data-chat="${i}">
              <span class="avatar g0">${initials(c.name)}</span>
              <span class="row__l"><b>${c.name}</b><small>${last ? (last.me ? 'Tú: ' : '') + esc(last.t) : 'Sin mensajes'}</small></span>
              ${c.unread ? '<span class="dot" aria-label="Sin leer"></span>' : ''}
            </button>`;
        }).join('');
      };
      const openChat = i => {
        const c = chats[i];
        c.unread = false;
        const w = ctx.push(`
          ${head(c.name)}
          <div class="scroll"><div class="bubbles">${c.msgs.map(bubble).join('')}</div></div>
          <form class="composer g">
            <input type="text" placeholder="Mensaje" aria-label="Mensaje" autocomplete="off" enterkeyhint="send" maxlength="240">
            <button class="fab press" type="submit" disabled aria-label="Enviar">${ico('send')}</button>
          </form>`);
        const box = $('.bubbles', w), sc = $('.scroll', w), input = $('input', w), btn = $('.fab', w);
        const down = () => { sc.scrollTop = sc.scrollHeight; };
        input.addEventListener('input', () => { btn.disabled = !input.value.trim(); });
        $('form', w).addEventListener('submit', e => {
          e.preventDefault();
          const t = input.value.trim();
          if (!t) return;
          input.value = '';
          btn.disabled = true;
          c.msgs.push({ me: 1, t });
          box.append(el(bubble({ me: 1, t })));
          down();
          const typing = el('<div class="bub them g0 typing" aria-label="Escribiendo"><i></i><i></i><i></i></div>');
          setTimeout(() => { if (w.isConnected) { box.append(typing); down(); } }, 700);
          setTimeout(() => {
            typing.remove();
            const r = c.pool[c.n++ % c.pool.length];
            c.msgs.push({ t: r });
            if (w.isConnected) { box.append(el(bubble({ t: r }))); down(); }
          }, 2200 + Math.random() * 900);
        });
        w.onleave = paint;
        setTimeout(down, 30);
      };
      paint();
      v.addEventListener('click', e => {
        const r = e.target.closest('[data-chat]');
        if (r) openChat(+r.dataset.chat);
      });
      if (opts.chat) {
        let i = chats.findIndex(c => c.name === opts.chat);
        if (i < 0) {
          chats.unshift({ name: opts.chat, n: 0, msgs: [], pool: ['Ahora te escribo', 'Vale', 'Luego hablamos', 'Perfecto'] });
          i = 0;
          paint();
        }
        setTimeout(() => openChat(i), 380);
      }
    },
  },

  camera: {
    name: 'Cámara', icon: 'camera', clear: true,
    render(ctx) {
      const v = ctx.view(`
        <div class="cam">
          <div class="cam-grid"></div>
          <div class="cam-top">
            <button class="round g press" data-c="flash" aria-label="Flash" aria-pressed="false">${ico('bolt')}</button>
            <button class="round g press" data-c="grid" aria-label="Cuadrícula" aria-pressed="false">${ico('grid')}</button>
          </div>
          <div style="display:flex;flex-direction:column">
            <div class="cam-zoom g">
              <button data-z="1">0,5</button><button data-z="1.35" class="is-on">1×</button><button data-z="2.6">3</button>
            </div>
            <div class="cam-modes"><span>Vídeo</span><span class="is-on">Foto</span><span>Retrato</span></div>
            <div class="cam-row">
              <button class="cam-thumb g press" data-c="roll" aria-label="Abrir Fotos"></button>
              <button class="shutter g" data-c="shot" aria-label="Disparar"><i></i></button>
              <button class="round g press ${ctx.st.live ? 'is-on' : ''}" data-c="live" style="justify-self:end" aria-label="Transparencia real">${ico('eye')}</button>
            </div>
          </div>
          <div class="cam-flash"></div>
        </div>`);
      const cam = $('.cam', v), thumb = $('.cam-thumb', v), flash = $('.cam-flash', v);
      const paintThumb = () => { thumb.style.backgroundImage = ctx.store.photos[0] ? `url(${ctx.store.photos[0]})` : ''; };
      paintThumb();
      ctx.setZoom(1.35);
      v.addEventListener('click', e => {
        const z = e.target.closest('[data-z]'), b = e.target.closest('[data-c]');
        if (z) {
          $$('[data-z]', v).forEach(q => q.classList.toggle('is-on', q === z));
          ctx.setZoom(+z.dataset.z);
        } else if (b) {
          const a = b.dataset.c;
          if (a === 'shot') {
            flash.classList.remove('go');
            void flash.offsetWidth;
            flash.classList.add('go');
            const url = ctx.snap();
            if (url) { ctx.store.photos.unshift(url); paintThumb(); }
          } else if (a === 'roll') ctx.open('photos');
          else if (a === 'live') ctx.setLive(!ctx.st.live).then(() => b.classList.toggle('is-on', ctx.st.live));
          else {
            const on = b.classList.toggle('is-on');
            b.setAttribute('aria-pressed', on);
            if (a === 'grid') cam.classList.toggle('has-grid', on);
          }
        } else if (e.target === cam || e.target.classList.contains('cam-grid')) {
          const r = cam.getBoundingClientRect(), k = r.width / cam.offsetWidth || 1;
          const f = el('<span class="cam-focus"></span>');
          f.style.left = (e.clientX - r.left) / k + 'px';
          f.style.top = (e.clientY - r.top) / k + 'px';
          cam.append(f);
          setTimeout(() => f.remove(), 900);
        }
      });
    },
  },

  photos: {
    name: 'Fotos', icon: 'photos',
    render(ctx) {
      const p = ctx.store.photos;
      const v = ctx.view(`
        <div class="scroll">
          <h2 class="vt">Fotos</h2>
          <p class="sub">${p.length} ${p.length === 1 ? 'imagen' : 'imágenes'} · lo que se veía a través del cristal</p>
          ${p.length ? `<div class="pgrid">${p.map((u, i) => `<button data-p="${i}" style="background-image:url(${u})" aria-label="Foto ${i + 1}"></button>`).join('')}</div>` : '<p class="empty">Aún no hay fotos. Abre la cámara y dispara.</p>'}
        </div>`);
      v.addEventListener('click', e => {
        const b = e.target.closest('[data-p]');
        if (b) {
          const pv = el(`<div class="pview" style="background-image:url(${p[+b.dataset.p]})"><button class="round g press" aria-label="Cerrar foto">${ico('close')}</button></div>`);
          v.append(pv);
          $('button', pv).addEventListener('click', ev => { ev.stopPropagation(); pv.remove(); });
        }
      });
    },
  },

  calendar: {
    name: 'Calendario',
    glyph: d => `<span style="text-align:center"><small>${d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}</small><span class="serif">${d.getDate()}</span></span>`,
    render(ctx) {
      const now = new Date(), y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
      const first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
      const EV = {
        '-2': [['18:00', 'Recoger las gafas', 'Óptica del centro']],
        0: [['10:00', 'Revisión de diseño', 'Sala Prisma'], ['13:30', 'Comida con Lucía', 'La Pubilla'], ['19:00', 'Pádel', 'Pista 3']],
        1: [['09:30', 'Dentista', 'Dra. Vidal']],
        3: [['11:00', 'Entrega del prototipo', 'Taller'], ['20:30', 'Cena en casa de Marc', 'Llevar postre']],
        6: [['Día', 'Cumpleaños de Nora', 'No olvidar']],
      };
      const evOf = d => EV[d - today] || (d % 6 === 0 ? [['17:00', 'Entreno', 'Gimnasio']] : []);
      let sel = today;
      const v = ctx.view(`
        <div class="scroll">
          <h2 class="vt">${cap1(now.toLocaleDateString('es-ES', { month: 'long' }))}</h2>
          <p class="sub">${y}</p>
          <div class="cal g0">
            ${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(w => `<b>${w}</b>`).join('')}
            ${'<span></span>'.repeat(first)}
            ${Array.from({ length: days }, (_, i) => `<button data-d="${i + 1}" class="${i + 1 === today ? 'is-today is-on' : ''} ${evOf(i + 1).length ? 'has' : ''}">${i + 1}</button>`).join('')}
          </div>
          <h3 class="cap" data-cap></h3>
          <div class="list g0" data-ev></div>
        </div>`);
      const paint = () => {
        const ev = evOf(sel);
        $('[data-cap]', v).textContent = sel === today ? 'Hoy' : cap1(new Date(y, m, sel).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' }));
        $('[data-ev]', v).innerHTML = ev.length
          ? ev.map(([t, n, s]) => `<div class="ev"><time>${t}</time><div><b>${n}</b><span>${s}</span></div></div>`).join('')
          : '<div class="ev"><time>—</time><div><b>Nada</b><span>Un día transparente.</span></div></div>';
      };
      paint();
      v.addEventListener('click', e => {
        const b = e.target.closest('[data-d]');
        if (!b) return;
        sel = +b.dataset.d;
        $$('[data-d]', v).forEach(q => q.classList.toggle('is-on', q === b));
        paint();
      });
    },
  },

  clock: {
    name: 'Reloj', icon: 'clock',
    render(ctx) {
      const cities = [['Tokio', 'Asia/Tokyo'], ['Nueva York', 'America/New_York'], ['Londres', 'Europe/London']];
      const v = ctx.view(`
        <div class="seg g0" role="tablist"><button class="is-on" data-tab="0">Reloj</button><button data-tab="1">Cronómetro</button></div>
        <div class="scroll" data-pane="0">
          <div class="face g0">
            ${Array.from({ length: 12 }, (_, i) => `<i style="transform:rotate(${i * 30}deg) translateY(-111px)"></i>`).join('')}
            <span class="hand h"></span><span class="hand m"></span><span class="hand s"></span>
          </div>
          <div class="list g0 cities">${cities.map(([n], i) => `<div class="row plain"><span class="row__l">${n}</span><span class="row__v" data-city="${i}"></span></div>`).join('')}</div>
        </div>
        <div class="scroll" data-pane="1" hidden>
          <div class="bigtime" data-sw>00:00,00</div>
          <div class="pair">
            <button class="fab g0 press" data-sw-reset>Reiniciar</button>
            <button class="fab g0 press go" data-sw-go>Iniciar</button>
          </div>
        </div>`);
      const hands = $$('.hand', v);
      const tick = () => {
        const d = new Date(), s = d.getSeconds(), mi = d.getMinutes() + s / 60, h = d.getHours() % 12 + mi / 60;
        hands[0].style.transform = `rotate(${h * 30}deg)`;
        hands[1].style.transform = `rotate(${mi * 6}deg)`;
        hands[2].style.transform = `rotate(${s * 6}deg)`;
        cities.forEach(([, tz], i) => {
          $(`[data-city="${i}"]`, v).textContent = d.toLocaleTimeString('es-ES', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
        });
      };
      tick();
      const iv = setInterval(tick, 1000);
      let run = false, acc = 0, t0 = 0, raf = 0;
      const out = $('[data-sw]', v), go = $('[data-sw-go]', v);
      const show = () => {
        const ms = acc + (run ? performance.now() - t0 : 0);
        out.textContent = `${pad(Math.floor(ms / 60000))}:${pad(Math.floor(ms / 1000) % 60)},${pad(Math.floor(ms / 10) % 100)}`;
        if (run) raf = requestAnimationFrame(show);
      };
      v.addEventListener('click', e => {
        const tab = e.target.closest('[data-tab]');
        if (tab) {
          $$('[data-tab]', v).forEach(q => q.classList.toggle('is-on', q === tab));
          $$('[data-pane]', v).forEach(q => { q.hidden = q.dataset.pane !== tab.dataset.tab; });
        } else if (e.target.closest('[data-sw-go]')) {
          run = !run;
          if (run) { t0 = performance.now(); show(); }
          else { acc += performance.now() - t0; cancelAnimationFrame(raf); }
          go.textContent = run ? 'Parar' : 'Iniciar';
        } else if (e.target.closest('[data-sw-reset]')) {
          acc = 0;
          t0 = performance.now();
          show();
        }
      });
      ctx.onClose(() => { clearInterval(iv); cancelAnimationFrame(raf); });
    },
  },

  weather: {
    name: 'Tiempo', icon: 'weather',
    render(ctx) {
      const h = new Date().getHours();
      const hours = [['Ahora', 'sun', 21], [1, 'sun', 22], [2, 'weather', 22], [3, 'cloud', 20], [4, 'moon', 18], [5, 'moon', 17]];
      const week = [['Jueves', 'sun', 15, 24], ['Viernes', 'cloud', 14, 22], ['Sábado', 'rain', 13, 19], ['Domingo', 'weather', 12, 20], ['Lunes', 'sun', 14, 23]];
      ctx.view(`
        <div class="scroll">
          <div class="wx">
            <p class="wx__d">Fuera, ahora mismo</p>
            <p class="wx__t">21°</p>
            <p class="wx__d">Despejado</p>
            <p class="wx__m">Máx. 24° · mín. 15° · viento suave del sur</p>
          </div>
          <div class="hours g0">${hours.map(([t, i, g]) => `<div><span>${typeof t === 'number' ? pad((h + t) % 24) + ' h' : t}</span>${ico(i)}<b>${g}°</b></div>`).join('')}</div>
          <h3 class="cap">Próximos días</h3>
          <div class="list g0 days">
            ${week.map(([d, i, lo, hi]) => `
              <div class="row">
                <span class="row__ic">${ico(i)}</span><span class="row__l">${d}</span>
                <span class="t" style="opacity:.6">${lo}°</span>
                <span class="rng"><i style="left:${(lo - 10) * 6}%;right:${(26 - hi) * 6}%"></i></span>
                <span class="t">${hi}°</span>
              </div>`).join('')}
          </div>
          <h3 class="cap">Detalles</h3>
          <div class="list g0">
            <div class="row plain"><span class="row__l">Humedad</span><span class="row__v">48 %</span></div>
            <div class="row plain"><span class="row__l">Índice UV</span><span class="row__v">4 · moderado</span></div>
            <div class="row plain"><span class="row__l">Puesta de sol</span><span class="row__v">17:52</span></div>
          </div>
        </div>`);
    },
  },

  notes: {
    name: 'Notas', icon: 'notes',
    render(ctx) {
      const notes = ctx.store.notes;
      const v = ctx.view(`
        <div class="vh"><span></span><span></span><button class="press" data-new aria-label="Nueva nota">${ico('plus')}</button></div>
        <div class="scroll"><h2 class="vt">Notas</h2><div data-list></div></div>`);
      const paint = () => {
        $('[data-list]', v).innerHTML = notes.length
          ? `<div class="list g0">${notes.map((n, i) => `
              <button class="row plain press" data-n="${i}">
                <span class="row__l"><b>${esc(n.t || 'Sin título')}</b><small>${esc(n.b.split('\n')[0] || 'Vacía')}</small></span>
                <span class="row__v">${ico('chev')}</span>
              </button>`).join('')}</div>`
          : '<p class="empty">No hay notas. Pulsa + para escribir la primera.</p>';
      };
      const edit = n => {
        const w = ctx.push(`
          ${head('Nota', `<button class="press" data-del aria-label="Eliminar nota">${ico('trash')}</button>`)}
          <div class="editor">
            <input type="text" placeholder="Título" aria-label="Título" maxlength="60" value="${esc(n.t)}">
            <textarea placeholder="Escribe aquí…" aria-label="Texto de la nota">${esc(n.b)}</textarea>
          </div>`);
        $('input', w).addEventListener('input', e => { n.t = e.target.value; });
        $('textarea', w).addEventListener('input', e => { n.b = e.target.value; });
        $('[data-del]', w).addEventListener('click', () => {
          notes.splice(notes.indexOf(n), 1);
          ctx.pop();
        });
        w.onleave = () => {
          const i = notes.indexOf(n);
          if (i >= 0 && !n.t.trim() && !n.b.trim()) notes.splice(i, 1);
          paint();
        };
      };
      paint();
      v.addEventListener('click', e => {
        const r = e.target.closest('[data-n]');
        if (r) edit(notes[+r.dataset.n]);
        else if (e.target.closest('[data-new]')) {
          const n = { t: '', b: '' };
          notes.unshift(n);
          edit(n);
        }
      });
    },
  },

  calc: {
    name: 'Calculadora', icon: 'calc',
    render(ctx) {
      const keys = [['AC', 'fn'], ['±', 'fn'], ['%', 'fn'], ['÷', 'op'], ['7'], ['8'], ['9'], ['×', 'op'], ['4'], ['5'], ['6'], ['−', 'op'], ['1'], ['2'], ['3'], ['+', 'op'], ['0', 'w2'], [','], ['=', 'op']];
      const v = ctx.view(`
        <div class="calc-out" aria-live="polite"><small data-ex></small><span data-out>0</span></div>
        <div class="calc">${keys.map(([k, c]) => `<button class="g0 press ${c || ''}" data-k="${k}">${k}</button>`).join('')}</div>`);
      let cur = '0', prev = null, op = null, fresh = true;
      const out = $('[data-out]', v), ex = $('[data-ex]', v);
      const num = () => parseFloat(cur.replace(',', '.'));
      const fmt = n => Number.isFinite(n) ? String(+n.toPrecision(10)).replace('.', ',') : 'Error';
      const compute = () => {
        const a = prev, b = num();
        const r = op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : b === 0 ? NaN : a / b;
        cur = fmt(r);
        prev = null;
        op = null;
        fresh = true;
      };
      v.addEventListener('click', e => {
        const b = e.target.closest('[data-k]');
        if (!b) return;
        const k = b.dataset.k;
        if (cur === 'Error' && k !== 'AC') cur = '0';
        if (/^\d$/.test(k)) {
          if (fresh) { cur = k; fresh = false; }
          else if (cur.replace(/\D/g, '').length < 9) cur = cur === '0' ? k : cur + k;
        } else if (k === ',') {
          if (fresh) { cur = '0,'; fresh = false; }
          else if (!cur.includes(',')) cur += ',';
        } else if (k === 'AC') { cur = '0'; prev = null; op = null; fresh = true; }
        else if (k === '±') cur = cur.startsWith('-') ? cur.slice(1) : cur === '0' ? cur : '-' + cur;
        else if (k === '%') { cur = fmt(num() / 100); fresh = true; }
        else if (k === '=') { if (op !== null && prev !== null) compute(); }
        else {
          if (op !== null && prev !== null && !fresh) compute();
          prev = num();
          op = k;
          fresh = true;
        }
        out.textContent = cur;
        out.style.fontSize = cur.length > 7 ? Math.max(40, 78 - (cur.length - 7) * 7) + 'px' : '';
        ex.textContent = op !== null && prev !== null ? `${fmt(prev)} ${op}` : '';
      });
    },
  },

  contacts: {
    name: 'Contactos', icon: 'contacts',
    render(ctx) {
      const v = ctx.view(`
        <div class="scroll">
          <h2 class="vt">Contactos</h2>
          <label class="field g0">${ico('search')}<input type="search" placeholder="Buscar" aria-label="Buscar contacto" autocomplete="off"></label>
          <div data-list></div>
        </div>`);
      const paint = q => {
        const hit = PEOPLE.map((p, i) => [p, i]).filter(([p]) => p[0].toLowerCase().includes(q.toLowerCase()));
        $('[data-list]', v).innerHTML = hit.length
          ? `<div class="list g0">${hit.map(([p, i]) => `
              <button class="row crow press" data-p="${i}">
                <span class="avatar g0">${initials(p[0])}</span>
                <span class="row__l"><b>${p[0]}</b><small>${p[1]}</small></span>
              </button>`).join('')}</div>`
          : `<p class="empty">Nadie se llama «${esc(q)}».</p>`;
      };
      paint('');
      $('input', v).addEventListener('input', e => paint(e.target.value.trim()));
      v.addEventListener('click', e => {
        const r = e.target.closest('[data-p]');
        if (!r) return;
        const [name, tel] = PEOPLE[+r.dataset.p];
        const w = ctx.push(`
          ${head('Contacto')}
          <div class="scroll">
            <div class="card">
              <span class="avatar g0">${initials(name)}</span>
              <h3>${name}</h3>
              <div class="acts">
                <button class="g0 press" data-a="call">${ico('phone')}Llamar</button>
                <button class="g0 press" data-a="msg">${ico('messages')}Mensaje</button>
                <button class="g0 press" data-a="mail">${ico('mail')}Correo</button>
              </div>
            </div>
            <div class="list g0">
              <div class="row plain"><span class="row__l"><small>móvil</small>${tel}</span></div>
              <div class="row plain"><span class="row__l"><small>correo</small>${name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}@correo.glass</span></div>
            </div>
          </div>`);
        w.addEventListener('click', ev => {
          const a = ev.target.closest('[data-a]');
          if (!a) return;
          if (a.dataset.a === 'call') ctx.call(name, 'móvil');
          else if (a.dataset.a === 'msg') ctx.open('messages', { chat: name.split(' ')[0] });
          else ctx.toast('El correo llega en GlassOS 1.1');
        });
      });
    },
  },

  music: {
    name: 'Música', icon: 'music',
    render(ctx) {
      const s = ctx.store, au = s.audio;
      const time = t => `${Math.floor(t / 60)}:${pad(Math.floor(t % 60))}`;
      const v = ctx.view(`
        <div class="scroll">
          <div class="cover g0"><b></b></div>
          <div class="track"><h3 data-t></h3><p data-a></p></div>
          <div class="prog"><span data-pos>0:00</span><div class="sl" data-seek><div class="sl__t"><div class="sl__f"></div></div><div class="sl__k"></div></div><span data-dur></span></div>
          <div class="ctrl">
            <button class="fab g0 press" data-m="prev" aria-label="Anterior">${ico('prev')}</button>
            <button class="fab main press" data-m="play" aria-label="Reproducir o pausar"></button>
            <button class="fab g0 press" data-m="next" aria-label="Siguiente">${ico('next')}</button>
          </div>
          <h3 class="cap">A continuación</h3>
          <div class="list g0 queue" data-q></div>
        </div>`);
      let pos = s.pos || 0;
      const seek = slider($('[data-seek]', v), 0, p => { pos = p * s.tracks[s.track].d; paintPos(); });
      const paintPos = () => {
        $('[data-pos]', v).textContent = time(pos);
        seek(pos / s.tracks[s.track].d);
      };
      const paint = () => {
        const tr = s.tracks[s.track];
        $('[data-t]', v).textContent = tr.t;
        $('[data-a]', v).textContent = tr.a;
        $('[data-dur]', v).textContent = time(tr.d);
        $('[data-m="play"]', v).innerHTML = ico(au.playing ? 'pause' : 'play');
        v.classList.toggle('is-playing', au.playing);
        $('[data-q]', v).innerHTML = s.tracks.map((q, i) => `
          <button class="row plain press" data-tr="${i}">
            <span class="row__l"><b>${q.t}</b><small>${q.a}</small></span>
            <span class="row__v">${i === s.track ? (au.playing ? 'sonando' : 'en pausa') : time(q.d)}</span>
          </button>`).join('');
        paintPos();
      };
      const go = i => {
        s.track = (i + s.tracks.length) % s.tracks.length;
        pos = 0;
        if (au.playing) au.play(ctx.st.vol);
        paint();
      };
      paint();
      const iv = setInterval(() => {
        if (!au.playing) return;
        pos += 1;
        if (pos >= s.tracks[s.track].d) go(s.track + 1);
        else paintPos();
      }, 1000);
      v.addEventListener('click', e => {
        const m = e.target.closest('[data-m]'), tr = e.target.closest('[data-tr]');
        if (tr) { go(+tr.dataset.tr); if (!au.playing) { au.play(ctx.st.vol); paint(); } }
        else if (!m) return;
        else if (m.dataset.m === 'play') { au.toggle(ctx.st.vol); paint(); }
        else go(s.track + (m.dataset.m === 'next' ? 1 : -1));
      });
      ctx.onClose(() => { clearInterval(iv); s.pos = pos; });
    },
  },

  settings: {
    name: 'Ajustes', icon: 'settings',
    render(ctx) {
      const st = ctx.st;
      const tog = (k, label) => `<button class="tog ${st[k] ? 'is-on' : ''}" data-set="${k}" role="switch" aria-checked="${st[k]}" aria-label="${label}"></button>`;
      const row = (icon, label, k, small = '') => `<div class="row"><span class="row__ic">${ico(icon)}</span><span class="row__l">${label}${small ? `<small>${small}</small>` : ''}</span>${tog(k, label)}</div>`;
      const frostName = v => v < .25 ? 'claro' : v < .6 ? 'medio' : 'denso';
      const v = ctx.view(`
        <div class="scroll">
          <h2 class="vt">Ajustes</h2>
          <div class="me g0"><span class="avatar g0">${ico('drop')}</span><span><b>Tu GlassPhone</b><span>GlassOS 1.0 · al día</span></span></div>

          <h3 class="cap">Cristal</h3>
          <div class="blk g0">
            <div class="blk__h">Transparencia real ${tog('live', 'Transparencia real')}</div>
            <p>Usa la cámara trasera como fondo: tu teléfono se vuelve de cristal y la interfaz elige sola tinta clara u oscura.</p>
          </div>
          <div class="blk g0">
            <div class="blk__h">Esmerilado <span data-frost-n>${frostName(st.frost)}</span></div>
            <div class="sl" data-frost aria-label="Esmerilado"><div class="sl__t"><div class="sl__f"></div></div><div class="sl__k"></div></div>
          </div>
          <div class="blk g0">
            <div class="blk__h">Tinte</div>
            <div class="chips" data-tints></div>
          </div>
          <div class="blk g0">
            <div class="blk__h">Mundo</div>
            <div class="chips" data-worlds></div>
            <p>Lo que se ve detrás cuando la transparencia real está apagada.</p>
          </div>

          <h3 class="cap">Conexiones</h3>
          <div class="list g0">
            ${row('wifi', 'Wi‑Fi', 'wifi', 'Casa · 5 GHz')}
            ${row('bluetooth', 'Bluetooth', 'bt')}
            ${row('plane', 'Modo avión', 'air')}
          </div>

          <h3 class="cap">Sistema</h3>
          <div class="list g0">
            ${row('moon', 'No molestar', 'dnd')}
            ${row('motion', 'Reducir movimiento', 'calm')}
            <button class="row press" data-about><span class="row__ic">${ico('info')}</span><span class="row__l">Acerca de</span><span class="row__v">${ico('chev')}</span></button>
          </div>
          <button class="danger g0 press" data-off>Apagar GlassOS</button>
        </div>`);
      const chips = () => {
        $('[data-tints]', v).innerHTML = ctx.TINTS.map((t, i) => `<button class="chipx ${i === st.tint ? 'is-on' : ''}" data-tint="${i}"><i style="background:${t.c || 'transparent'}"></i>${t.name}</button>`).join('');
        $('[data-worlds]', v).innerHTML = ctx.WORLDS.map((w, i) => `<button class="chipx ${i === st.world && !st.live ? 'is-on' : ''}" data-world="${i}"><i style="background:linear-gradient(rgb(${w.top}),rgb(${w.bot}))"></i>${w.name.charAt(0).toUpperCase() + w.name.slice(1)}</button>`).join('');
      };
      chips();
      slider($('[data-frost]', v), st.frost, f => {
        st.frost = f;
        $('[data-frost-n]', v).textContent = frostName(f);
        ctx.apply();
      });
      const sync = k => {
        const b = $(`[data-set="${k}"]`, v);
        b.classList.toggle('is-on', st[k]);
        b.setAttribute('aria-checked', st[k]);
      };
      v.addEventListener('click', e => {
        const s = e.target.closest('[data-set]'), t = e.target.closest('[data-tint]'), w = e.target.closest('[data-world]');
        if (s) {
          const k = s.dataset.set;
          if (k === 'live') {
            ctx.setLive(!st.live).then(() => { sync('live'); chips(); });
          } else {
            st[k] = !st[k];
            sync(k);
            ctx.apply();
          }
        } else if (t) {
          st.tint = +t.dataset.tint;
          ctx.apply();
          chips();
        } else if (w) {
          const done = () => { ctx.setWorld(+w.dataset.world); sync('live'); chips(); };
          if (st.live) ctx.setLive(false).then(done);
          else done();
        } else if (e.target.closest('[data-off]')) ctx.exit();
        else if (e.target.closest('[data-about]')) {
          ctx.push(`
            ${head('Acerca de')}
            <div class="scroll">
              <div class="about-top"><div class="boot-drop"><b></b></div><h3>Glass<em>OS</em></h3><p>Versión 1.0 · compilación 26A11</p></div>
              <div class="list g0">
                ${[['Modelo', 'GlassPhone GP‑01'], ['Pantalla', '6,9″ microLED transparente'], ['Chip', 'Prisma P1'], ['Capacidad', '512 GB'], ['Batería', '5.200 mAh de vidrio sólido'], ['Número de serie', 'G0‑TA‑2026‑0001']].map(([a, b]) => `<div class="row plain"><span class="row__l">${a}</span><span class="row__v">${b}</span></div>`).join('')}
              </div>
              <p class="sub" style="margin:18px 6px 0">GlassPhone es un concepto. Este sistema funciona entero en tu navegador.</p>
            </div>`);
        }
      });
    },
  },
};
