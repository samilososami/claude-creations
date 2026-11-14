import { useEffect, useRef } from 'react';
import { reduced, scrollVelocity } from '../lib/motion';

type Bulb = { t: number; on: number; at: number; angle: number; av: number; boost: number; hue: number };
type Wire = { ax: number; ay: number; bx: number; by: number; sag: number; sx: number; sy: number; vx: number; vy: number; bulbs: Bulb[] };
type Dust = { x: number; y: number; vx: number; vy: number; r: number; a: number; p: number };

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

/** Strings of festival bulbs that switch on one by one and sway with the pointer and the scroll. */
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
    const glow = sprite(160, [[0, 'rgba(255,196,110,0.75)'], [0.18, 'rgba(255,160,70,0.32)'], [0.5, 'rgba(255,120,40,0.08)'], [1, 'rgba(255,100,20,0)']]);
    const core = sprite(48, [[0, 'rgba(255,255,240,1)'], [0.35, 'rgba(255,226,160,1)'], [0.75, 'rgba(255,170,70,0.9)'], [1, 'rgba(255,140,40,0)']]);
    let W = 0, H = 0, dpr = 1, raf = 0, visible = true;
    let wires: Wire[] = [];
    let dust: Dust[] = [];
    const pointer = { x: -999, y: -999, px: -999, py: -999, vx: 0, vy: 0 };

    const build = () => {
      const r = cv.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, W < 760 ? 1.5 : 1.75);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      const small = W < 760;
      const spacing = small ? 52 : 84;
      const mk = (ax: number, ay: number, bx: number, by: number, sag: number): Wire => {
        const len = Math.hypot(bx - ax, by - ay);
        const n = Math.max(6, Math.round(len / spacing));
        return {
          ax, ay, bx, by, sag, sx: 0, sy: 0, vx: 0, vy: 0,
          bulbs: Array.from({ length: n }, (_, i) => ({
            t: (i + 1) / (n + 1), on: 0, at: 0, angle: 0, av: 0, boost: 0, hue: Math.random()
          }))
        };
      };
      wires = small
        ? [mk(-20, H * 0.05, W + 20, H * 0.02, H * 0.1), mk(-20, H * 0.13, W * 0.75, -10, H * 0.06)]
        : [mk(-30, H * 0.03, W + 30, H * 0.08, H * 0.12), mk(-30, H * 0.22, W * 0.62, -20, H * 0.07)];
      // light order: left to right across all wires
      const all = wires.flatMap((w) => w.bulbs.map((b) => ({ b, x: w.ax + (w.bx - w.ax) * b.t })));
      all.sort((a, b) => a.x - b.x).forEach(({ b }, i) => (b.at = 250 + i * (small ? 55 : 38) + Math.random() * 60));
      dust = Array.from({ length: small ? 22 : 46 }, () => ({
        x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.15, vy: -0.08 - Math.random() * 0.22,
        r: 0.5 + Math.random() * 1.6, a: Math.random(), p: Math.random() * Math.PI * 2
      }));
    };

    const point = (w: Wire, t: number) => {
      const cx = (w.ax + w.bx) / 2 + w.sx;
      const cy = (w.ay + w.by) / 2 + w.sag * 2 + w.sy;
      const u = 1 - t;
      return {
        x: u * u * w.ax + 2 * u * t * cx + t * t * w.bx,
        y: u * u * w.ay + 2 * u * t * cy + t * t * w.by
      };
    };

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;
      const since = started.current ? now - startAt.current : -1;
      const sv = still ? 0 : scrollVelocity();
      pointer.vx = pointer.x - pointer.px;
      pointer.vy = pointer.y - pointer.py;
      pointer.px = pointer.x;
      pointer.py = pointer.y;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // dust drifting through the light
      ctx.globalCompositeOperation = 'lighter';
      for (const d of dust) {
        if (!still) {
          d.x += d.vx * dt + Math.sin(now / 1800 + d.p) * 0.08;
          d.y += d.vy * dt - sv * 0.02;
          if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
          if (d.y > H + 10) d.y = -10;
        }
        const light = 1 - Math.min(1, d.y / (H * 0.9));
        const tw = 0.5 + 0.5 * Math.sin(now / 900 + d.p * 3);
        ctx.globalAlpha = (0.12 + 0.5 * light) * tw * Math.min(1, Math.max(0, since / 1500));
        ctx.fillStyle = '#ffd59a';
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      for (const w of wires) {
        if (!still) {
          // spring sway, pushed by pointer swipes and scroll speed
          const mid = point(w, 0.5);
          const near = Math.hypot(pointer.x - mid.x, pointer.y - mid.y) < W * 0.35;
          const fx = near ? pointer.vx * 0.05 : 0;
          const fy = (near ? pointer.vy * 0.03 : 0) + sv * 0.05;
          w.vx += (-w.sx * 0.02 - w.vx * 0.04 + fx) * dt;
          w.vy += (-w.sy * 0.025 - w.vy * 0.05 + fy) * dt;
          w.sx += w.vx * dt;
          w.sy += w.vy * dt;
          w.sx += Math.sin(now / 2400 + w.ax) * 0.04;
        }
        // wire
        const trace = () => {
          ctx.beginPath();
          for (let i = 0; i <= 40; i++) {
            const p = point(w, i / 40);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();
        };
        ctx.strokeStyle = 'rgba(14,10,7,0.95)';
        ctx.lineWidth = 2.2;
        trace();
        ctx.strokeStyle = `rgba(255,200,140,${0.08 + 0.14 * Math.min(1, Math.max(0, since / 1800))})`;
        ctx.lineWidth = 0.8;
        trace();

        for (const b of w.bulbs) {
          const p = point(w, b.t);
          // switch on with a short flicker
          let target = 0;
          if (since > b.at) {
            const k = since - b.at;
            target = k < 60 ? 1 : k < 120 ? 0.15 : k < 170 ? 1 : k < 210 ? 0.5 : 1;
          }
          if (still && started.current) target = 1;
          b.on += (target - b.on) * 0.5;
          const flick = 0.93 + 0.07 * Math.sin(now / (140 + b.hue * 90) + b.hue * 10);
          const dx = pointer.x - p.x;
          const dy = pointer.y - (p.y + 14);
          const close = Math.hypot(dx, dy) < 46;
          if (close && !still) {
            b.av += pointer.vx * 0.004;
            b.boost = Math.min(1, b.boost + 0.2);
          }
          b.boost *= 0.95;
          if (!still) {
            b.av += (-b.angle * 0.06 - b.av * 0.06 - w.vx * 0.003) * dt;
            b.angle += b.av * dt;
          }
          const len = 11;
          const bx = p.x + Math.sin(b.angle) * len;
          const by = p.y + Math.cos(b.angle) * len;
          const lvl = b.on * flick * (1 + b.boost * 0.5);
          // socket
          ctx.strokeStyle = 'rgba(25,18,12,0.95)';
          ctx.lineWidth = 3.4;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.sin(b.angle) * 6, p.y + Math.cos(b.angle) * 6);
          ctx.stroke();
          // glass
          ctx.fillStyle = `rgba(255,236,200,${0.12 + 0.1 * (1 - b.on)})`;
          ctx.beginPath();
          ctx.arc(bx, by, 6, 0, Math.PI * 2);
          ctx.fill();
          if (lvl > 0.02) {
            ctx.globalCompositeOperation = 'lighter';
            const g = 110 + b.boost * 70;
            ctx.globalAlpha = Math.min(1, lvl * 0.85);
            ctx.drawImage(glow, bx - g / 2, by - g / 2, g, g);
            ctx.globalAlpha = Math.min(1, lvl);
            ctx.drawImage(core, bx - 10, by - 10, 20, 20);
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
    const onResize = () => {
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
