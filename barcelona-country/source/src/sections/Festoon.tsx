import { useEffect, useRef } from 'react';
import { reduced, scrollVelocity } from '../lib/motion';

type Node = { x: number; y: number; px: number; py: number; pin: boolean };
type Bulb = { i: number; on: number; at: number; angle: number; av: number; boost: number; hue: number; lvx: number };
type Wire = { nodes: Node[]; seg: number; bulbs: Bulb[] };
type Dust = { x: number; y: number; vx: number; vy: number; r: number; p: number };

function sprite(size: number, stops: [number, string][]) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

const GRAVITY = 0.32;
const DAMP = 0.985;
const ITER = 8;

/** Strings of festival bulbs: a verlet rope that hangs under gravity, switches on bulb by bulb and only stirs where the pointer brushes it. */
export function Festoon({ start }: { start: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const started = useRef(false);
  const startAt = useRef(0);

  useEffect(() => {
    if (start && !started.current) {
      started.current = true;
      startAt.current = performance.now();
    }
  }, [start]);

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext('2d')!;
    const still = reduced();
    const glow = sprite(128, [[0, 'rgba(255,200,120,0.6)'], [0.2, 'rgba(255,165,80,0.24)'], [0.55, 'rgba(255,125,45,0.05)'], [1, 'rgba(255,100,20,0)']]);
    const core = sprite(40, [[0, 'rgba(255,255,240,1)'], [0.35, 'rgba(255,228,165,1)'], [0.75, 'rgba(255,172,72,0.85)'], [1, 'rgba(255,140,40,0)']]);
    let W = 0, H = 0, dpr = 1, raf = 0, visible = true;
    let wires: Wire[] = [];
    let dust: Dust[] = [];
    const pointer = { x: -999, y: -999, px: -999, py: -999, vx: 0, vy: 0 };

    /** Rope from a to b whose rest length gives the requested sag (parabolic approximation). */
    const mk = (ax: number, ay: number, bx: number, by: number, sag: number, bulbGap: number): Wire => {
      const chord = Math.hypot(bx - ax, by - ay);
      const length = chord + (8 * sag * sag) / (3 * chord);
      const per = 3; // rope nodes between bulbs
      const bulbsN = Math.max(6, Math.round(length / bulbGap));
      const n = (bulbsN + 1) * per;
      const nodes: Node[] = Array.from({ length: n + 1 }, (_, i) => {
        const t = i / n;
        const x = ax + (bx - ax) * t;
        const y = ay + (by - ay) * t + 4 * sag * t * (1 - t);
        return { x, y, px: x, py: y, pin: i === 0 || i === n };
      });
      const bulbs: Bulb[] = Array.from({ length: bulbsN }, (_, k) => ({
        i: (k + 1) * per, on: 0, at: 0, angle: 0, av: 0, boost: 0, hue: Math.random(), lvx: 0
      }));
      return { nodes, seg: length / n, bulbs };
    };

    function step(w: Wire, dt: number, now: number, live: boolean) {
      const sv = live ? Math.max(-14, Math.min(14, scrollVelocity())) : 0;
      const pSpeed = Math.hypot(pointer.vx, pointer.vy);
      for (const n of w.nodes) {
        if (n.pin) continue;
        let vx = (n.x - n.px) * DAMP;
        let vy = (n.y - n.py) * DAMP;
        if (live) {
          // a light breeze and a small lift from fast scrolling
          vx += Math.sin(now / 2600 + n.x * 0.004) * 0.006 * dt;
          vy += sv * 0.004 * dt;
          if (pSpeed > 0.5) {
            const d = Math.hypot(pointer.x - n.x, pointer.y - n.y);
            if (d < 70) {
              const f = (1 - d / 70) * 0.07;
              vx += Math.max(-1.6, Math.min(1.6, pointer.vx * f));
              vy += Math.max(-1.6, Math.min(1.6, pointer.vy * f));
            }
          }
        }
        n.px = n.x;
        n.py = n.y;
        n.x += vx;
        n.y += vy + GRAVITY * dt * dt;
      }
      for (let k = 0; k < ITER; k++) {
        for (let i = 0; i < w.nodes.length - 1; i++) {
          const a = w.nodes[i], b = w.nodes[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 0.0001;
          const diff = (d - w.seg) / d;
          const wa = a.pin ? 0 : b.pin ? 1 : 0.5;
          const wb = b.pin ? 0 : a.pin ? 1 : 0.5;
          a.x += dx * diff * wa;
          a.y += dy * diff * wa;
          b.x -= dx * diff * wb;
          b.y -= dy * diff * wb;
        }
      }
    }

    const build = () => {
      const r = cv.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, W < 760 ? 1.5 : 1.75);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      const small = W < 760;
      const gap = small ? 54 : 86;
      wires = small
        ? [mk(-20, H * 0.05, W + 20, H * 0.02, H * 0.09, gap), mk(-20, H * 0.14, W * 0.75, -10, H * 0.05, gap)]
        : [mk(-30, H * 0.03, W + 30, H * 0.08, H * 0.1, gap), mk(-30, H * 0.22, W * 0.62, -20, H * 0.06, gap)];
      // settle the rope before it is shown so it starts at rest
      for (let k = 0; k < 120; k++) wires.forEach((w) => step(w, 1, 0, false));
      wires.forEach((w) => w.nodes.forEach((n) => { n.px = n.x; n.py = n.y; }));
      const all = wires.flatMap((w) => w.bulbs.map((b) => ({ b, x: w.nodes[b.i].x })));
      all.sort((a, b) => a.x - b.x).forEach(({ b }, i) => (b.at = 250 + i * (small ? 55 : 38) + Math.random() * 60));
      dust = Array.from({ length: small ? 16 : 32 }, () => ({
        x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.12, vy: -0.06 - Math.random() * 0.16,
        r: 0.5 + Math.random() * 1.3, p: Math.random() * Math.PI * 2
      }));
    };

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(2, (now - last) / 16.67);
      last = now;
      const since = started.current ? now - startAt.current : -1;
      pointer.vx = pointer.x - pointer.px;
      pointer.vy = pointer.y - pointer.py;
      pointer.px = pointer.x;
      pointer.py = pointer.y;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // dust drifting through the light
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = '#ffd59a';
      for (const d of dust) {
        if (!still) {
          d.x += d.vx * dt + Math.sin(now / 1800 + d.p) * 0.06;
          d.y += d.vy * dt;
          if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
        }
        const light = 1 - Math.min(1, d.y / (H * 0.9));
        const tw = 0.5 + 0.5 * Math.sin(now / 900 + d.p * 3);
        ctx.globalAlpha = (0.08 + 0.36 * light) * tw * Math.min(1, Math.max(0, since / 1500));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      for (const w of wires) {
        if (!still) step(w, dt, now, true);
        const trace = () => {
          ctx.beginPath();
          const ns = w.nodes;
          ctx.moveTo(ns[0].x, ns[0].y);
          for (let i = 1; i < ns.length - 1; i++) {
            const mx = (ns[i].x + ns[i + 1].x) / 2;
            const my = (ns[i].y + ns[i + 1].y) / 2;
            ctx.quadraticCurveTo(ns[i].x, ns[i].y, mx, my);
          }
          ctx.lineTo(ns[ns.length - 1].x, ns[ns.length - 1].y);
          ctx.stroke();
        };
        ctx.strokeStyle = 'rgba(14,10,7,0.95)';
        ctx.lineWidth = 2;
        trace();
        ctx.strokeStyle = `rgba(255,200,140,${0.06 + 0.1 * Math.min(1, Math.max(0, since / 1800))})`;
        ctx.lineWidth = 0.7;
        trace();

        for (const b of w.bulbs) {
          const p = w.nodes[b.i];
          let target = 0;
          if (since > b.at) {
            const k = since - b.at;
            target = k < 60 ? 1 : k < 120 ? 0.2 : k < 170 ? 1 : k < 210 ? 0.6 : 1;
          }
          if (still && started.current) target = 1;
          b.on += (target - b.on) * 0.5;
          const flick = 0.96 + 0.04 * Math.sin(now / (160 + b.hue * 90) + b.hue * 10);
          if (!still) {
            // the bulb is a short damped pendulum driven by how its socket accelerates
            const vx = p.x - p.px;
            const ax = vx - b.lvx;
            b.lvx = vx;
            b.av += (-ax * 0.05 - b.angle * 0.05 - b.av * 0.1) * dt;
            b.angle = Math.max(-0.45, Math.min(0.45, b.angle + b.av * dt));
            const close = Math.hypot(pointer.x - p.x, pointer.y - (p.y + 12)) < 34;
            if (close) b.boost = Math.min(1, b.boost + 0.12);
          }
          b.boost *= 0.94;
          const len = 10;
          const bx = p.x + Math.sin(b.angle) * len;
          const by = p.y + Math.cos(b.angle) * len;
          const lvl = b.on * flick * (1 + b.boost * 0.3);
          ctx.strokeStyle = 'rgba(25,18,12,0.95)';
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.sin(b.angle) * 5.5, p.y + Math.cos(b.angle) * 5.5);
          ctx.stroke();
          ctx.fillStyle = `rgba(255,236,200,${0.12 + 0.1 * (1 - b.on)})`;
          ctx.beginPath();
          ctx.arc(bx, by, 5.5, 0, Math.PI * 2);
          ctx.fill();
          if (lvl > 0.02) {
            ctx.globalCompositeOperation = 'lighter';
            const g = 72 + b.boost * 24;
            ctx.globalAlpha = Math.min(1, lvl * 0.8);
            ctx.drawImage(glow, bx - g / 2, by - g / 2, g, g);
            ctx.globalAlpha = Math.min(1, lvl);
            ctx.drawImage(core, bx - 8.5, by - 8.5, 17, 17);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
          }
        }
      }
      if (!still && visible) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      if (pointer.px < -900) { pointer.px = pointer.x; pointer.py = pointer.y; }
    };
    let lastW = 0;
    const onResize = () => {
      // mobile URL bars change the height while scrolling: only rebuild when the width changes
      if (Math.abs(window.innerWidth - lastW) < 2) return;
      lastW = window.innerWidth;
      build();
      if (still) requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting && !document.hidden;
      if (visible && !was && !still) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });
    const onVis = () => {
      const was = visible;
      visible = !document.hidden;
      if (visible && !was && !still) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    lastW = window.innerWidth;
    build();
    io.observe(cv);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    raf = requestAnimationFrame(frame);
    let stillTimer = 0;
    if (still) stillTimer = window.setInterval(() => requestAnimationFrame(frame), 400);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(stillTimer);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={canvas} className="festoon" aria-hidden="true" />;
}
