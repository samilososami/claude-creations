import { useEffect, useLayoutEffect, useRef } from 'react';
import { res, useLang } from '../i18n';
import { gsap, lockScroll, reduced } from '../lib/motion';
import { Star } from './ui';

/**
 * Subscription celebration: a press prints the first issue of Barcelona Country News,
 * the festival stamp lands on it and a confirmation card rises underneath.
 */
export function Press({ open, name, onClose }: { open: boolean; name: string; onClose: () => void }) {
  const { t, lang } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const d = dialog.current!;
    if (open && !d.open) {
      d.showModal();
      lockScroll(true);
    }
    if (!open && d.open) d.close();
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const d = dialog.current!;
    const q = gsap.utils.selector(d);
    if (reduced()) {
      gsap.set(q('.press-bg, .press-card'), { opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      const t1 = gsap.timeline();
      tl.current = t1;
      t1.set(q('.ink'), { clipPath: 'inset(0 100% 0 0)' })
        .set(q('.np-stamp'), { opacity: 0 })
        .set(q('.press-card'), { opacity: 0, yPercent: 60 })
        .fromTo(q('.press-bg'), { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' })
        .fromTo(q('.press-machine'), { yPercent: -160 }, { yPercent: 0, duration: 0.7, ease: 'back.out(1.6)' }, 0.1)
        .add(() => d.classList.add('is-rolling'), 0.65)
        // the sheet feeds out of the slot while the type is laid down line by line
        .fromTo(q('.np-sheet'), { yPercent: -101 }, { yPercent: 0, duration: 2.1, ease: 'power1.inOut' }, 0.7)
        .to(q('.ink'), { clipPath: 'inset(0 0% 0 0)', duration: 0.4, ease: 'power2.out', stagger: 0.09 }, 0.95)
        .add(() => d.classList.remove('is-rolling'), 2.8)
        // stamp
        .fromTo(q('.np-stamp'), { scale: 2.8, rotate: -40, opacity: 0 }, { scale: 1, rotate: -13, opacity: 0.92, duration: 0.3, ease: 'power4.in' }, 2.95)
        .fromTo(q('.np-sheet'), { x: 0, y: 0 }, { x: 4, y: 3, duration: 0.045, repeat: 5, yoyo: true, ease: 'none' }, 3.25)
        .fromTo(q('.np-splat i'), { scale: 0, opacity: 0.9 }, { scale: 1, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.02 }, 3.25)
        // the issue comes free and the card rises
        .to(q('.press-machine'), { yPercent: -170, duration: 0.6, ease: 'power3.in' }, 3.7)
        .to(q('.np-wrap'), { y: () => (window.innerHeight < 760 ? -20 : -36), rotate: -2.5, scale: 0.9, duration: 1, ease: 'expo.out' }, 3.8)
        .to(q('.press-card'), { opacity: 1, yPercent: 0, duration: 0.9, ease: 'back.out(1.4)' }, 4.0)
        .fromTo(q('.press-stars i'), { y: -40, opacity: 0, rotate: 0 }, { y: () => 160 + Math.random() * 260, x: () => (Math.random() - 0.5) * 260, rotate: () => (Math.random() - 0.5) * 540, opacity: 1, duration: 1.8, ease: 'power2.out', stagger: 0.03 }, 3.3)
        .to(q('.press-stars i'), { opacity: 0, duration: 0.6, stagger: 0.03 }, 4.6)
        .add(() => (q('.press-card button')[0] as HTMLElement | undefined)?.focus(), 4.4);
    }, d);
    return () => {
      d.classList.remove('is-rolling');
      ctx.revert();
    };
  }, [open]);

  const close = () => {
    const d = dialog.current!;
    if (reduced()) return d.close();
    tl.current?.kill();
    gsap.to(d, { opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: () => { d.close(); gsap.set(d, { clearProps: 'opacity' }); } });
  };

  const today = new Date().toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
  const head = name ? t.x.headline.replace('{name}', name) : t.x.headlineAnon;

  return (
    <dialog
      ref={dialog}
      className="press"
      aria-labelledby="press-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClose={() => {
        lockScroll(false);
        onClose();
      }}
    >
      <div className="press-bg" aria-hidden="true" />
      <div className="press-stage">
        <div className="press-machine" aria-hidden="true">
          <span className="press-roller" />
          <span className="press-slot" />
          <span className="press-roller" />
        </div>
        <div className="np-wrap">
          <div className="np-clip">
            <article className="np-sheet" aria-hidden="true">
              <header className="np-mast">
                <span className="ink np-meta">
                  <span>{t.x.edition}</span>
                  <span>{today}</span>
                </span>
                <span className="ink np-brand">
                  <img src={res('img/isotype.webp')} alt="" />
                  <b>Barcelona Country News</b>
                </span>
              </header>
              <p className="ink np-rule">
                {t.date.days.replace(/-/g, '·')} {t.date.month} {t.date.year} · {t.date.city}
              </p>
              <h3 className="ink np-head">{head}</h3>
              <div className="np-body">
                <figure className="ink np-photo">
                  <img src={res('img/dance.webp')} alt="" />
                </figure>
                <div className="np-text">
                  <p className="ink">{t.x.column}</p>
                  <span className="ink np-line" />
                  <span className="ink np-line" />
                  <span className="ink np-line np-line-s" />
                  <span className="ink np-line" />
                  <span className="ink np-line np-line-s" />
                </div>
              </div>
              <img className="np-stamp" src={res('img/stamp.webp')} alt="" />
              <span className="np-splat">
                {Array.from({ length: 9 }, (_, i) => (
                  <i key={i} style={{ rotate: `${i * 40}deg` }} />
                ))}
              </span>
            </article>
          </div>
        </div>
        <span className="press-stars" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} className={i % 3 ? '' : 'is-red'}>
              <Star />
            </i>
          ))}
        </span>
        <div className="press-card">
          <h2 id="press-title">{t.x.newsTitle}</h2>
          <p>{t.x.newsBody}</p>
          <p className="press-note">{t.ui.preview}</p>
          <button type="button" className="btn btn-gold" onClick={close}>
            <span>{t.x.done}</span>
            <Star />
          </button>
        </div>
      </div>
    </dialog>
  );
}
