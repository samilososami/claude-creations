import { useEffect, useRef, useState, type FormEvent } from 'react';
import { res, useLang } from '../i18n';
import { finePointer, gsap, reduced, useReveal } from '../lib/motion';
import { countryFlag, phoneCountries } from '../data/phoneCountries';
import { Arrow, Magnetic, Star } from '../components/ui';
import { Press } from '../components/Press';

function PhoneField() {
  const { t, lang } = useLang();
  const [iso, setIso] = useState(phoneCountries[0].iso);
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames([lang], { type: 'region' });
  } catch {
    names = null;
  }
  const countries = phoneCountries.map((c) => ({ ...c, name: names?.of(c.iso) ?? c.name }));
  const selected = countries.find((c) => c.iso === iso) ?? countries[0];
  return (
    <div className="field-row">
      <label className="field field-prefix">
        <span>{t.prefix}</span>
        <select value={iso} onChange={(e) => setIso(e.target.value)}>
          {countries.map((c) => (
            <option key={`${c.iso}-${c.dial}`} value={c.iso}>
              {countryFlag(c.iso)} {c.name} ({c.dial})
            </option>
          ))}
        </select>
        <b className="prefix-show" aria-hidden="true">
          {countryFlag(selected.iso)} {selected.dial}
        </b>
      </label>
      <input type="hidden" name="phonePrefix" value={selected.dial} />
      <input type="hidden" name="countryIso" value={selected.iso} />
      <label className="field">
        <span>{t.formPhone}</span>
        <input name="phone" type="tel" autoComplete="tel" required maxLength={32} />
      </label>
    </div>
  );
}

export function Newsletter() {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  const ticket = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<'idle' | 'done'>('idle');
  const [name, setName] = useState('');
  useReveal(root, [lang]);

  useEffect(() => setStatus('idle'), [lang]);

  // gentle 3D tilt of the ticket
  useEffect(() => {
    const el = ticket.current;
    if (!el || reduced() || !finePointer()) return;
    const rx = gsap.quickTo(el, 'rotateX', { duration: 0.9, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotateY', { duration: 0.9, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      rx(((e.clientY - r.top) / r.height - 0.5) * -4);
      ry(((e.clientX - r.left) / r.width - 0.5) * 5);
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

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== 'idle') return;
    const form = e.currentTarget;
    const data = new FormData(form);
    if (String(data.get('website') ?? '')) return;
    // Design preview only: nothing is sent or stored. Production keeps its own /api/newsletter flow.
    setName(String(data.get('name') ?? '').trim().split(/\s+/)[0].slice(0, 24));
    setStatus('done');
  };

  const closePress = () => {
    setStatus('idle');
    formRef.current?.reset();
    submitRef.current?.focus({ preventScroll: true });
  };

  return (
    <section id="newsletter" className="newsletter paper" ref={root} aria-labelledby="news-title">
      <div className="ticket-scene" data-reveal>
        <div className="ticket" ref={ticket}>
          <aside className="ticket-stub" aria-hidden="true">
            <img src={res('img/isotype.webp')} alt="" />
            <span className="stub-title">Barcelona Country News</span>
            <span className="stub-date">
              {t.date.days.replace(/-/g, '·')} {t.date.month} {t.date.year}
            </span>
            <span className="stub-code">
              {Array.from({ length: 34 }, (_, i) => (
                <i key={i} style={{ width: `${[1, 3, 1, 2, 4, 1, 2][i % 7]}px` }} />
              ))}
            </span>
          </aside>
          <div className="ticket-main">
            <h2 id="news-title" className="ticket-title">
              {t.news.title}
            </h2>
            <p className="ticket-intro">
              {t.news.introBefore} <strong>Barcelona Country News</strong>, {t.news.introAfter} <strong>Barcelona Country Festival.</strong>
            </p>
            <form className="form" aria-label={t.ui.form} onSubmit={submit} ref={formRef}>
              <label className="field">
                <span>{t.formName}</span>
                <input name="name" type="text" autoComplete="name" required maxLength={160} />
              </label>
              <PhoneField />
              <label className="field">
                <span>{t.formEmail}</span>
                <input name="email" type="email" autoComplete="email" required maxLength={320} />
              </label>
              <label className="field">
                <span>{t.formDance}</span>
                <input name="danceLocation" type="text" required maxLength={180} />
              </label>
              <div className="honeypot" aria-hidden="true">
                <label>
                  Website
                  <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <label className="consent">
                <input name="privacyAccepted" type="checkbox" required />
                <i aria-hidden="true">
                  <Star />
                </i>
                <span>
                  {t.reg.privacyBefore}{' '}
                  <a href="#/privacidad" target="_blank" rel="noopener noreferrer">
                    {t.news.privacy}
                  </a>{' '}
                  {t.reg.privacyAfter}
                </span>
              </label>
              <div className="form-submit">
                <Magnetic strength={0.25}>
                  <button className="btn btn-gold btn-lg" type="submit" ref={submitRef} aria-describedby="news-auth">
                    <span>{t.news.subscribe}</span>
                    <Arrow />
                  </button>
                </Magnetic>
                <p className="preview-note">{t.ui.preview}</p>
              </div>
              <p id="news-auth" className="auth">
                <b>{t.news.authorization}</b> {t.news.authorizationText}{' '}
                <a href="#/privacidad" target="_blank" rel="noopener noreferrer">
                  {t.news.privacy}
                </a>
                .
              </p>
            </form>
          </div>
        </div>
      </div>
      <Press open={status === 'done'} name={name} onClose={closePress} />
    </section>
  );
}
