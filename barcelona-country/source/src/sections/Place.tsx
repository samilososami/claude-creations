import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { res, useLang } from '../i18n';
import { gsap, reduced, useReveal } from '../lib/motion';
import { useConsent } from '../components/Consent';
import { Arrow, Magnetic, Neon, Star } from '../components/ui';
import { useInView } from './Lineup';

// Countdown to the calendar date in Barcelona, not an unconfirmed opening time.
const FESTIVAL_DATE = Date.parse('2027-10-22T00:00:00+02:00');

function Flap({ value }: { value: string }) {
  const prev = useRef(value);
  const [pair, setPair] = useState<[string, string]>([value, value]);
  useEffect(() => {
    if (value !== prev.current) {
      setPair([prev.current, value]);
      prev.current = value;
    }
  }, [value]);
  const [from, to] = pair;
  return (
    <span className="flap">
      <span className="flap-half flap-top">
        <b>{to}</b>
      </span>
      <span className="flap-half flap-bottom">
        <b>{from}</b>
      </span>
      {from !== to && (
        <>
          <span className="flap-half flap-top flap-leaf-out" key={`o${from}${to}`}>
            <b>{from}</b>
          </span>
          <span className="flap-half flap-bottom flap-leaf-in" key={`i${from}${to}`}>
            <b>{to}</b>
          </span>
        </>
      )}
    </span>
  );
}

function Countdown() {
  const { t } = useLang();
  const box = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let visible = false;
    const sync = () => {
      clearInterval(timer);
      if (!visible || document.hidden) return;
      setNow(Date.now());
      if (Date.now() < FESTIVAL_DATE) timer = setInterval(() => setNow(Date.now()), 1000);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    if (box.current) io.observe(box.current);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearInterval(timer);
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);
  const s = Math.max(0, Math.floor((FESTIVAL_DATE - now) / 1000));
  const values = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
  const label = `${t.ref.countdown} ${values.map((v, i) => `${v} ${t.ref.units[i]}`).join(', ')}`;
  return (
    <div className="countdown" ref={box} role="timer" aria-live="off" aria-label={label}>
      <p className="countdown-label">{s === 0 ? t.ref.started : t.ref.countdown}</p>
      <div className="countdown-row" aria-hidden="true">
        {values.map((v, i) => {
          const digits = String(v).padStart(i === 0 ? 3 : 2, '0').split('');
          return (
            <div className="countdown-unit" key={i}>
              <div className="countdown-digits">
                {digits.map((d, k) => (
                  <Flap value={d} key={k} />
                ))}
              </div>
              <small>{t.ref.units[i]}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MapBlock() {
  const { t, lang } = useLang();
  const { mapsAllowed, openPreferences } = useConsent();
  if (!mapsAllowed) {
    return (
      <div className="map-off" role="region" aria-label={t.mapTitle}>
        <div className="radar" aria-hidden="true">
          <span className="radar-sweep" />
          <span className="radar-pin">
            <Star />
          </span>
        </div>
        <div className="map-off-copy">
          <p className="map-eyebrow">Fira Cornellà · Barcelona</p>
          <h3>{t.reg.mapTitle}</h3>
          <p>{t.reg.mapDescription}</p>
          <button type="button" className="btn btn-gold btn-sm" onClick={openPreferences}>
            {t.reg.mapAction}
          </button>
        </div>
      </div>
    );
  }
  return (
    <iframe
      className="map-frame"
      src={`https://www.google.com/maps?q=Fira+de+Cornell%C3%A0&z=16&hl=${lang}&output=embed`}
      title={t.mapTitle}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}

export function Place() {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  const [yeeRef, yeeSeen] = useInView<HTMLDivElement>(0.5);
  useReveal(root, [lang]);
  const days = t.date.days.split('-');

  useLayoutEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.days', start: 'top 78%', once: true } });
      gsap.utils.toArray<HTMLElement>('.day').forEach((d, i) => {
        tl.fromTo(d, { yPercent: -70, scaleY: 1.25, opacity: 0 }, { yPercent: 0, scaleY: 1, opacity: 1, duration: 0.42, ease: 'power4.in' }, i * 0.34)
          .to(d, { scaleY: 0.86, scaleX: 1.06, duration: 0.08, ease: 'power1.out', transformOrigin: '50% 100%' })
          .to(d, { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
          .fromTo('.place-date', { x: 0 }, { x: i % 2 ? 4 : -4, duration: 0.05, repeat: 3, yoyo: true, ease: 'none' }, '<-0.5');
      });
      gsap.to('.venue-photo img', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.venue', start: 'top bottom', end: 'bottom top', scrub: true } });
    }, root);
    return () => ctx.revert();
  }, [lang]);

  return (
    <section id="location" className="place" ref={root} aria-labelledby="place-title">
      <div className="place-date">
        <div className="senyera" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="sec-head">
          <p className="kicker kicker-light" data-reveal>
            <span className="kicker-num">04</span>
            {t.locationKicker}
          </p>
        </div>
        <h2 id="place-title" className="sr-only">
          {t.date.city} · {t.date.days} {t.date.month} {t.date.year}
        </h2>
        <div className="days" aria-hidden="true">
          {days.map((d) => (
            <span className="day" key={d}>
              {d}
            </span>
          ))}
          <span className="days-meta">
            <b>{t.date.month}</b>
            <b>{t.date.year}</b>
          </span>
        </div>
        <div className="place-row">
          <div className="yee" ref={yeeRef}>
            <Neon text="Yeehaw!" lit={yeeSeen} className="yee-neon" />
            <p className="yee-where">{t.inBarcelona}</p>
          </div>
          <Countdown />
        </div>
      </div>

      <div className="venue dark">
        <figure className="venue-photo" data-reveal>
          <img src={res('img/fira.webp')} alt="Fira Cornellà" loading="lazy" />
          <figcaption>
            <h3>Fira Cornellà</h3>
            <p>
              Cornellà de Llobregat
              <br />
              Barcelona
            </p>
            <Magnetic>
              <a className="btn btn-gold btn-sm" href="https://www.google.com/maps/search/?api=1&query=Fira+Cornell%C3%A0" target="_blank" rel="noopener noreferrer">
                <span>{t.ref.directions}</span>
                <Arrow dir="up-right" />
              </a>
            </Magnetic>
          </figcaption>
        </figure>
        <div className="venue-map" data-reveal data-delay="0.1">
          <MapBlock />
        </div>
      </div>
    </section>
  );
}
