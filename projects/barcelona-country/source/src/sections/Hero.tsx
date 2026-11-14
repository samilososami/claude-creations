import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { res, useLang } from '../i18n';
import { finePointer, gsap, reduced, scrollToId } from '../lib/motion';
import { Arrow, Magnetic, Neon, Star } from '../components/ui';
import { Festoon } from './Festoon';

export function Hero({ onContact }: { onContact: () => void }) {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  const [lit, setLit] = useState(false);
  const [go, setGo] = useState(false);
  const word = 'BARCELONA';
  const ring = `${t.triad.join(' ★ ')} ★ ${t.triad.join(' ★ ')} ★ `;

  useLayoutEffect(() => {
    const el = root.current!;
    if (reduced()) {
      setGo(true);
      setLit(true);
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.call(() => setGo(true))
        .from('.hero-photo', { scale: 1.22, opacity: 0, duration: 2.6, ease: 'power3.out' }, 0)
        .from('.hero-title .ch', { yPercent: -130, rotate: (i) => (i % 2 ? 9 : -7), opacity: 0, duration: 1, ease: 'back.out(1.7)', stagger: 0.055 }, 0.45)
        .call(() => setLit(true), [], 1.25)
        .from('.hero-kicker > *', { y: 18, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 1.0)
        .from('.hero-festival', { letterSpacing: '0.1em', opacity: 0, duration: 1.4, ease: 'expo.out' }, 1.35)
        .from('.hero-bottom > *', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1 }, 1.45)
        .from('.ribbon', { yPercent: 120, duration: 1.2, ease: 'expo.out' }, 1.6);

      gsap.to('.hero-photo-wrap', { yPercent: 18, scale: 1.08, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-center', { yPercent: -28, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-dim', { opacity: 0.75, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  // depth on pointer move
  useEffect(() => {
    if (reduced() || !finePointer()) return;
    const el = root.current!;
    const photo = el.querySelector('.hero-photo') as HTMLElement;
    const title = el.querySelector('.hero-title-wrap') as HTMLElement;
    const px = gsap.quickTo(photo, 'x', { duration: 1.4, ease: 'power3.out' });
    const py = gsap.quickTo(photo, 'y', { duration: 1.4, ease: 'power3.out' });
    const tx = gsap.quickTo(title, 'x', { duration: 1.2, ease: 'power3.out' });
    const ty = gsap.quickTo(title, 'y', { duration: 1.2, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      px(nx * -26);
      py(ny * -18);
      tx(nx * 14);
      ty(ny * 10);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  return (
    <section id="home" className="hero" ref={root} aria-labelledby="hero-title">
      <div className="hero-photo-wrap" aria-hidden="true">
        <img
          className="hero-photo"
          src={res('img/hero-1672.webp')}
          srcSet={`${res('img/hero-900.webp')} 900w, ${res('img/hero-1672.webp')} 1672w`}
          sizes="(max-aspect-ratio: 1/1) 220vh, 110vw"
          alt=""
          fetchPriority="high"
        />
      </div>
      <div className="hero-grade" aria-hidden="true" />
      <div className="hero-dim" aria-hidden="true" />
      <Festoon start={go} />

      <div className="hero-center">
        <p className="hero-kicker">
          <span>
            <Star />
          </span>
          <span>{t.heroKicker}</span>
          <span>
            <Star />
          </span>
        </p>
        <div className="hero-title-wrap">
          <h1 id="hero-title" className="hero-title" aria-label="Barcelona Country Festival">
            <span className="hero-word" aria-hidden="true">
              {word.split('').map((c, i) => (
                <span className="ch" key={i}>
                  {c}
                </span>
              ))}
            </span>
            <Neon text="Country" lit={lit} className="hero-neon" />
            <span className="hero-festival" aria-hidden="true">
              Festival
            </span>
          </h1>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="hero-date" aria-label={`${t.date.days} ${t.date.month} ${t.date.year}, ${t.date.city}`}>
          <strong>{t.date.days.replace(/-/g, '·')}</strong>
          <span>
            {t.date.month} {t.date.year}
            <br />
            {t.date.city}
          </span>
        </div>
        <div className="hero-actions">
          <Magnetic>
            <button type="button" className="btn btn-gold" onClick={() => scrollToId('newsletter')}>
              <span>{t.cta}</span>
              <Arrow dir="down" />
            </button>
          </Magnetic>
          <Magnetic>
            <button type="button" className="btn btn-ghost" onClick={onContact}>
              <span>{t.ref.contact}</span>
              <Arrow dir="up-right" />
            </button>
          </Magnetic>
        </div>
        <button type="button" className="hero-badge" onClick={() => scrollToId('festival')} aria-label={t.festivalTitle} key={lang}>
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <text>
              <textPath href="#badge-circle" textLength="488">
                {ring}
              </textPath>
            </text>
          </svg>
          <img src={res('img/isotype.webp')} alt="" />
        </button>
      </div>

      <div className="ribbon" aria-hidden="true">
        <Ribbon words={[...t.triad, t.date.days.replace(/-/g, '·') + ' ' + t.date.month, t.date.city]} />
      </div>
    </section>
  );
}

/** Endless band of words whose speed follows the scroll. */
export function Ribbon({ words }: { words: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current!;
    if (reduced()) return;
    let x = 0;
    let dir = 1;
    let lastY = window.scrollY;
    let raf = 0;
    const loop = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (dy) dir = dy > 0 ? 1 : -1;
      const speed = 0.6 + Math.min(14, Math.abs(dy) * 0.25);
      x -= speed * dir;
      const half = el.scrollWidth / 2;
      if (half > 0) {
        if (x <= -half) x += half;
        if (x > 0) x -= half;
      }
      el.style.transform = `translate3d(${x}px,0,0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const seq = [...words, ...words, ...words];
  return (
    <div className="ribbon-track" ref={track}>
      {[0, 1].map((k) => (
        <div className="ribbon-set" key={k}>
          {seq.map((w, i) => (
            <span key={i}>
              {w}
              <Star />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
