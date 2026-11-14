import { useEffect, useRef, type ReactNode } from 'react';
import { finePointer, gsap, reduced } from '../lib/motion';

/** Splits text into masked words so headings can rise line by line. */
export function Words({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        /^\s+$/.test(part) ? (
          ' '
        ) : (
          <span className={`w ${className ?? ''}`} key={i}>
            <i>{part}</i>
          </span>
        )
      )}
    </>
  );
}

export function Arrow({ dir = 'right' }: { dir?: 'right' | 'left' | 'up-right' | 'down' }) {
  const rot = { right: 0, left: 180, 'up-right': -45, down: 90 }[dir];
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${rot}deg)` }}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function Star({ className }: { className?: string }) {
  return (
    <svg className={`star ${className ?? ''}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.8l3 7.1 7.6.6-5.8 5 1.8 7.5L12 18l-6.6 4 1.8-7.5-5.8-5 7.6-.6z" />
    </svg>
  );
}

export function Instagram() {
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function Close() {
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Buttons that lean towards the pointer. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !finePointer()) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * strength);
      yTo((e.clientY - r.top - r.height / 2) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);
  return (
    <span className="magnetic" ref={ref}>
      {children}
    </span>
  );
}

/** Neon sign text: a dim glass tube plus a glowing copy that flickers on. */
export function Neon({ text, lit, className }: { text: string; lit: boolean; className?: string }) {
  return (
    <span className={`neon ${lit ? 'is-lit' : ''} ${className ?? ''}`}>
      <span className="neon-tube">{text}</span>
      <span className="neon-glow" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
