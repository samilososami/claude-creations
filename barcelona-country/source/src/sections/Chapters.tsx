import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { pad, res, sentence, useLang } from '../i18n';
import { ScrollTrigger, gsap, reduced, scrollToId, useReveal } from '../lib/motion';
import { Arrow } from '../components/ui';
import { Words } from '../components/ui';

const PHOTOS = ['img/ch-music.webp', 'img/ch-shop.webp', 'img/ch-food.webp', 'img/ch-community.webp'];

/** Renders "&" in the script face so chapter titles read like painted signs. */
function Amp({ text }: { text: string }) {
  const { lang } = useLang();
  const parts = sentence(text, lang).split('&');
  const out: ReactNode[] = [];
  parts.forEach((p, i) => {
    out.push(<span key={`p${i}`}>{p.trim()}</span>);
    if (i < parts.length - 1) out.push(<em key={`a${i}`} className="amp">&amp;</em>);
  });
  return <>{out}</>;
}

export function Chapters() {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  // phones get the stops one at a time, like the production site; desktop keeps the scroll-driven stage
  const [stepper, setStepper] = useState(() => window.matchMedia('(max-width: 900px)').matches);
  const [step, setStep] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  useReveal(root, [lang]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const on = () => setStepper(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const cards = t.find.cards;
  let counter = 0;

  useLayoutEffect(() => {
    if (reduced() || stepper) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.chapter').forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i)
        });
        gsap.from(el.querySelectorAll('.stop'), {
          x: 40,
          opacity: 0,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: 'top 75%', once: true }
        });
      });
      gsap.utils.toArray<HTMLElement>('.chapter-photo img').forEach((img) => {
        gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }, root);
    return () => ctx.revert();
  }, [lang, stepper]);

  // each new stop slides in from the side it was asked from
  const dir = useRef(1);
  useLayoutEffect(() => {
    if (!stepper || reduced()) return;
    const el = root.current?.querySelector('.chapter.is-active');
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelector('.chapter-photo'), { xPercent: 18 * dir.current, opacity: 0, duration: 0.8, ease: 'expo.out' });
      gsap.from(el.querySelectorAll('.chapter-index, .chapter-title, .chapter-quote, .stop'), { x: 36 * dir.current, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05, delay: 0.05 });
    }, root);
    return () => ctx.revert();
  }, [step, stepper]);

  const go = (next: number) => {
    if (next < 0 || next >= cards.length || next === step) return;
    dir.current = next > step ? 1 : -1;
    setStep(next);
    const list = document.getElementById('program-stops');
    if (list && list.getBoundingClientRect().top < 0) scrollToId('program-stops', -90);
  };

  return (
    <section id="program" className="chapters paper" ref={root} aria-labelledby="chapters-title">
      <h2 id="chapters-title" className="chapters-title" data-words>
        <Words text={sentence(t.find.title, lang)} />
      </h2>
      <p className="chapters-intro" data-reveal>
        {t.find.intro}
      </p>

      <div className="chapters-body">
        <div className="stage" aria-hidden="true">
          <div className="stage-frame">
            {PHOTOS.map((src, i) => (
              <img key={src} src={res(src)} alt="" loading="lazy" className={i < active ? 'is-past' : i === active ? 'is-active' : 'is-next'} />
            ))}
            <div className="stage-lights" />
          </div>
          <div className="stage-num">
            <span key={active}>{pad(active + 1)}</span>
            <small>/ {pad(cards.length)}</small>
          </div>
          <ol className="stage-dots">
            {cards.map((c, i) => (
              <li key={c.title} className={i === active ? 'is-active' : ''} />
            ))}
          </ol>
        </div>

        <div
          className={`chapter-list ${stepper ? 'is-stepper' : ''}`}
          id="program-stops"
          aria-label={stepper ? t.ui.festivalStops : undefined}
          onTouchStart={(e) => stepper && (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
          onTouchEnd={(e) => {
            const s0 = touch.current;
            touch.current = null;
            if (!stepper || !s0) return;
            const dx = e.changedTouches[0].clientX - s0.x;
            const dy = e.changedTouches[0].clientY - s0.y;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(step + (dx < 0 ? 1 : -1));
          }}
        >
          {cards.map((card, ci) => (
            <article
              className={`chapter ${(stepper ? ci === step : ci === active) ? 'is-active' : ''}`}
              key={card.title}
              aria-labelledby={`chapter-${ci}`}
              hidden={stepper && ci !== step}
            >
              <figure className="chapter-photo" aria-hidden="true">
                <img src={res(PHOTOS[ci])} alt="" loading="lazy" />
              </figure>
              <p className="chapter-index">{pad(ci + 1)}</p>
              <h3 id={`chapter-${ci}`} className="chapter-title">
                <Amp text={card.title} />
              </h3>
              {ci < 2 && <p className="chapter-quote">«{t.find.quotes[ci]}»</p>}
              <ol className="stops">
                {card.items.map(([h, b]) => {
                  counter += 1;
                  return (
                    <li className="stop" key={h}>
                      <span className="stop-n">{pad(counter)}</span>
                      <div>
                        <h4>{h.replace(/\s*:\s*$/, '')}</h4>
                        <p>{b}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </article>
          ))}
          {stepper && (
            <nav className="stepper" aria-label={t.ui.festivalStops}>
              <div className="stepper-dots">
                {cards.map((c, i) => (
                  <button type="button" key={c.title} className={i === step ? 'is-active' : ''} aria-current={i === step ? 'step' : undefined} aria-label={`${t.ui.stop} ${pad(i + 1)}`} onClick={() => go(i)} />
                ))}
                <span className="stepper-count">
                  {pad(step + 1)} <small>/ {pad(cards.length)}</small>
                </span>
              </div>
              <div className="stepper-btns">
                <button type="button" className="btn btn-sm stepper-prev" onClick={() => go(step - 1)} disabled={step === 0}>
                  <Arrow dir="left" />
                  <span>{t.x.prevStop}</span>
                </button>
                <button type="button" className="btn btn-gold btn-sm" onClick={() => go(step + 1)} disabled={step === cards.length - 1}>
                  <span>{t.x.nextStop}</span>
                  <Arrow />
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
