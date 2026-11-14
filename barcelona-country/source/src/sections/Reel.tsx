import { useEffect, useRef, useState } from 'react';
import { res, useLang } from '../i18n';
import { finePointer, gsap, reduced } from '../lib/motion';

/** The festival reel playing inside a phone: it loads when it scrolls near, plays muted while visible and can be unmuted. */
export function Reel() {
  const { t } = useLang();
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [load, setLoad] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = box.current!;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setLoad(true), { rootMargin: '600px 0px' });
    const seen = new IntersectionObserver(
      ([e]) => {
        const v = video.current;
        if (!v) return;
        if (e.isIntersecting && !reduced()) v.play().catch(() => undefined);
        else v.pause();
      },
      { threshold: 0.35 }
    );
    near.observe(el);
    seen.observe(el);
    return () => {
      near.disconnect();
      seen.disconnect();
    };
  }, []);

  // the phone leans towards the pointer
  useEffect(() => {
    const el = box.current?.querySelector('.phone') as HTMLElement | null;
    if (!el || reduced() || !finePointer()) return;
    const rx = gsap.quickTo(el, 'rotateX', { duration: 1, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotateY', { duration: 1, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      rx(((e.clientY - r.top) / r.height - 0.5) * -7);
      ry(((e.clientX - r.left) / r.width - 0.5) * 9);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => undefined);
  };

  return (
    <div className="reel" ref={box} data-reveal>
      <div className="phone">
        <span className="phone-btn phone-btn-a" aria-hidden="true" />
        <span className="phone-btn phone-btn-b" aria-hidden="true" />
        <span className="phone-btn phone-btn-c" aria-hidden="true" />
        <div className="phone-screen">
          <video
            ref={video}
            src={load ? res('video/reel.mp4') : undefined}
            poster={res('video/reel-poster.webp')}
            muted
            loop
            playsInline
            preload="none"
            aria-label={t.x.reel}
            onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
          />
          <span className="phone-island" aria-hidden="true" />
          <span className="phone-progress" aria-hidden="true">
            <i style={{ transform: `scaleX(${progress})` }} />
          </span>
          <button type="button" className={`phone-sound ${muted ? '' : 'is-on'}`} onClick={toggle} aria-pressed={!muted} aria-label={muted ? t.x.unmute : t.x.mute}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
              {muted ? <path d="M16 9.5l5 5M21 9.5l-5 5" /> : <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />}
            </svg>
            <span>{muted ? t.x.unmute : t.x.mute}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
