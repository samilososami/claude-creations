import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { pad, res, sentence, useLang } from '../i18n';
import { ScrollTrigger, gsap, reduced, useReveal } from '../lib/motion';
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
  useReveal(root, [lang]);
  const cards = t.find.cards;
  let counter = 0;

  useLayoutEffect(() => {
    if (reduced()) return;
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
  }, [lang]);

  return (
    <section id="program" className="chapters paper" ref={root} aria-labelledby="chapters-title">
      <div className="sec-head">
        <p className="kicker" data-reveal>
          <span className="kicker-num">03</span>
          {t.find.kicker}
        </p>
      </div>
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

        <div className="chapter-list">
          {cards.map((card, ci) => (
            <article className={`chapter ${ci === active ? 'is-active' : ''}`} key={card.title} aria-labelledby={`chapter-${ci}`}>
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
        </div>
      </div>
    </section>
  );
}
