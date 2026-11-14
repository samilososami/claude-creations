import { useLayoutEffect, useRef } from 'react';
import { STATS, res, useLang } from '../i18n';
import { gsap, reduced, useReveal } from '../lib/motion';
import { Star, Words } from '../components/ui';

export function Festival() {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  useReveal(root, [lang]);

  const cut = t.heroCopy.indexOf('. ');
  const first = cut > -1 ? t.heroCopy.slice(0, cut + 1) : t.heroCopy;
  const second = cut > -1 ? t.heroCopy.slice(cut + 2) : '';
  const stats: [string, string][] = [
    [STATS.days, t.days],
    [STATS.artists, t.intlArtists],
    [STATS.dancers, t.dancers]
  ];

  useLayoutEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>('.statement .sw');
      gsap.set(words, { opacity: 0.13 });
      gsap.to(words, {
        opacity: 1,
        stagger: 0.12,
        ease: 'none',
        scrollTrigger: { trigger: '.statement', start: 'top 82%', end: 'bottom 52%', scrub: 0.6 }
      });
      gsap.from('.statement .pill', {
        scale: 0,
        rotate: -25,
        duration: 1,
        ease: 'back.out(2)',
        stagger: 0.2,
        scrollTrigger: { trigger: '.statement', start: 'top 60%', once: true }
      });
      gsap.to('.story-photo img', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.utils.toArray<HTMLElement>('.stat').forEach((stat, i) => {
        const num = stat.querySelector('.stat-fill') as HTMLElement;
        const out = stat.querySelectorAll<HTMLElement>('.stat-num span');
        const raw = stat.dataset.value || '0';
        const plus = raw.startsWith('+') ? '+' : '';
        const target = parseInt(raw.replace('+', ''), 10);
        const counter = { v: 0 };
        out.forEach((o) => (o.textContent = plus + '0'));
        gsap.fromTo(num, { clipPath: 'inset(100% 0 0 0)' }, {
          clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut', delay: i * 0.15,
          scrollTrigger: { trigger: stat, start: 'top 85%', once: true }
        });
        gsap.to(counter, {
          v: target, duration: 1.8, ease: 'expo.out', delay: i * 0.15,
          onUpdate: () => out.forEach((o) => (o.textContent = plus + Math.round(counter.v))),
          scrollTrigger: { trigger: stat, start: 'top 85%', once: true }
        });
      });
    }, root);
    return () => ctx.revert();
  }, [lang]);

  const split = (s: string, hl?: RegExp) =>
    s.split(/\s+/).map((w, i) => (
      <span className={`sw ${hl && hl.test(w) ? 'hl' : ''}`} key={i}>
        {w}{' '}
      </span>
    ));

  return (
    <section id="festival" className="festival paper" ref={root} aria-labelledby="festival-title">
      <div className="sec-head">
        <p className="kicker" data-reveal>
          <span className="kicker-num">01</span>
          {t.festivalTitle}
        </p>
        <span className="sec-stars" aria-hidden="true">
          <Star />
          <Star />
          <Star />
        </span>
      </div>

      <h2 id="festival-title" className="statement">
        {split(first, /Barcelon/i)}
        <span className="pill pill-a" aria-hidden="true">
          <img src={res('img/dance.webp')} alt="" loading="lazy" />
        </span>{' '}
        {split(second, /^(line|dance|country)/i)}
        <span className="pill pill-b" aria-hidden="true">
          <img src={res('img/isotype.webp')} alt="" loading="lazy" />
        </span>
      </h2>

      <div className="story">
        <figure className="story-photo" data-reveal>
          <img src={res('img/live.webp')} alt="" loading="lazy" />
          <figcaption aria-hidden="true">
            <Star /> {t.triad.join(' · ')}
          </figcaption>
        </figure>
        <div className="story-copy">
          <p className="lead" data-words>
            <Words text={t.festivalCopy} />
          </p>
          <p className="story-text" data-reveal>
            {t.ref.storyBefore}
            <strong>Barcelona Country Festival</strong>
            {t.ref.storyAfter}
          </p>
        </div>
      </div>

      <div className="stats">
        {stats.map(([value, label]) => (
          <div className="stat" key={label} data-value={value}>
            <div className="stat-num" aria-hidden="true">
              <span className="stat-outline">{value}</span>
              <span className="stat-fill">{value}</span>
            </div>
            <p className="stat-label">
              <span className="sr-only">{value} </span>
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
