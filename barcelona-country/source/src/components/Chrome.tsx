import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type MouseEvent as RMouseEvent } from 'react';
import { LANGS, T, res, sentence, useLang, type Lang } from '../i18n';
import { finePointer, gsap, lockScroll, reduced, scrollToId, useReveal } from '../lib/motion';
import { PreferencesButton } from './Consent';
import { Arrow, Close, Neon, Star } from './ui';

const TARGETS = ['home', 'festival', 'artists', 'program', 'location'];

export function Header({ onContact, onNavigate }: { onContact: () => void; onNavigate: (hash: string) => void }) {
  const { t, lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const langBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > window.innerHeight * 0.6);
      if (Math.abs(y - last) > 6) setHidden(y > last && y > window.innerHeight);
      last = y;
      let idx = 0;
      TARGETS.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) idx = i;
      });
      setCurrent(idx);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const away = (e: PointerEvent) => !langBox.current?.contains(e.target as Node) && setLangOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setLangOpen(false);
    document.addEventListener('pointerdown', away);
    window.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      window.removeEventListener('keydown', esc);
    };
  }, [langOpen]);

  useEffect(() => {
    if (!menu) return;
    lockScroll(true);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', esc);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', esc);
    };
  }, [menu]);

  const go = (id: string) => {
    setMenu(false);
    setTimeout(() => scrollToId(id), menu ? 350 : 0);
  };
  const pick = (l: Lang) => {
    setLang(l);
    setLangOpen(false);
  };
  const links = [1, 2, 3, 4].map((i) => ({ id: TARGETS[i], label: t.nav[i], idx: i }));

  return (
    <>
      <header className={`header ${scrolled ? 'is-scrolled' : ''} ${hidden && !menu ? 'is-hidden' : ''} ${menu ? 'is-menu' : ''}`}>
        <nav className="header-nav header-left" aria-label="Principal">
          {links.slice(0, 3).map((l) => (
            <button type="button" key={l.id} className={current === l.idx ? 'is-current' : ''} onClick={() => go(l.id)}>
              {sentence(l.label, lang)}
            </button>
          ))}
        </nav>
        <a
          className="header-logo"
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            go('home');
          }}
          aria-label="Barcelona Country Festival"
        >
          <img src={res('img/logo.webp')} alt="Barcelona Country Festival" width="720" height="494" />
        </a>
        <div className="header-right">
        <nav className="header-nav" aria-label={t.nav[0]}>
          <button type="button" className={current === links[3].idx ? 'is-current' : ''} onClick={() => go(links[3].id)}>
            {sentence(links[3].label, lang)}
          </button>
          <a href="#/blog" onClick={(e) => { e.preventDefault(); onNavigate('#/blog'); }}>
            Blog
          </a>
          <button type="button" onClick={onContact}>
            {t.ref.contact}
          </button>
        </nav>
        <div className="header-tools">
          <div className="lang" ref={langBox}>
            <button type="button" className="lang-btn" aria-label={t.ui.changeLanguage} aria-expanded={langOpen} onClick={() => setLangOpen(!langOpen)}>
              <span>{lang.toUpperCase()}</span>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="m3 6 5 5 5-5" />
              </svg>
            </button>
            {langOpen && (
              <ul className="lang-menu">
                {LANGS.map((l) => (
                  <li key={l}>
                    <button type="button" aria-pressed={l === lang} onClick={() => pick(l)} lang={l}>
                      <b>{l.toUpperCase()}</b>
                      {T[l].name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" className={`burger ${menu ? 'is-open' : ''}`} aria-label={menu ? t.ui.closeMenu : t.ui.menu} aria-expanded={menu} aria-controls="menu" onClick={() => setMenu(!menu)}>
            <span />
            <span />
          </button>
        </div>
        </div>
      </header>

      <div id="menu" className={`menu ${menu ? 'is-open' : ''}`} aria-hidden={!menu} data-lenis-prevent>
        <ol className="menu-links">
          {links.map((l, i) => (
            <li key={l.id} style={{ transitionDelay: menu ? `${0.08 + i * 0.05}s` : '0s' }}>
              <button type="button" onClick={() => go(l.id)} tabIndex={menu ? 0 : -1}>
                <small>0{i + 1}</small>
                {sentence(l.label, lang)}
              </button>
            </li>
          ))}
          <li style={{ transitionDelay: menu ? '0.3s' : '0s' }}>
            <a href="#/blog" tabIndex={menu ? 0 : -1} onClick={(e) => { e.preventDefault(); setMenu(false); onNavigate('#/blog'); }}>
              <small>05</small>Blog
            </a>
          </li>
          <li style={{ transitionDelay: menu ? '0.35s' : '0s' }}>
            <button type="button" tabIndex={menu ? 0 : -1} onClick={() => { setMenu(false); onContact(); }}>
              <small>06</small>
              {t.ref.contact}
            </button>
          </li>
        </ol>
        <div className="menu-foot">
          <div className="menu-langs" role="group" aria-label={t.ui.changeLanguage}>
            {LANGS.map((l) => (
              <button type="button" key={l} aria-pressed={l === lang} onClick={() => setLang(l)} tabIndex={menu ? 0 : -1} lang={l}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-gold" tabIndex={menu ? 0 : -1} onClick={() => go('newsletter')}>
            <span>{t.cta}</span>
            <Arrow dir="down" />
          </button>
        </div>
      </div>
    </>
  );
}

export function Sponsors({ onContact }: { onContact: () => void }) {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  useReveal(root, [lang]);
  return (
    <section id="sponsors" className="sponsors dark" ref={root} aria-labelledby="sponsors-title">
      <div className="sponsors-head" data-reveal>
        <h2 id="sponsors-title">{t.site.sponsors}</h2>
        <button type="button" className="sponsor-invite" onClick={onContact}>
          <span>{t.sponsorInvite}</span>
          <Arrow dir="up-right" />
        </button>
      </div>
      <a className="sponsor" href="https://wowmycity.com/" target="_blank" rel="noopener noreferrer" aria-label="Wow My City" data-reveal>
        <img src={res('img/wowmycity.webp')} width="320" height="86" alt="Wow My City" loading="lazy" />
        <Arrow dir="up-right" />
      </a>
    </section>
  );
}

const CREDITS: [string, string][] = [
  ['https://commons.wikimedia.org/wiki/File:BUCKLE_N_BOOTS_performing_live_at_The_British_Country_Music_Festival_2025.jpg', 'BeeMusicUK · CC BY-SA 4.0'],
  ['https://commons.wikimedia.org/wiki/File:Ballymore_Country_Music_Festival_2014.jpg', 'Lizheen · CC BY-SA 4.0'],
  ['https://commons.wikimedia.org/wiki/File:Main_Stage_at_Harvest_Country_Music_Festival_2017_at_Westport_House.jpg', 'Bambography · CC BY-SA 4.0'],
  ['https://commons.wikimedia.org/wiki/File:Crowds_going_to_George_Strait_Country_Music_Festival_in_Tampa_Florida.jpg', 'ckramer · CC BY 2.0'],
  ['https://commons.wikimedia.org/wiki/File:Country_Music_Festival_1,_Mirande,_Gers,_France.jpg', 'Jamiecat · CC BY 2.0'],
  ['https://commons.wikimedia.org/wiki/File:George_Strait_Country_Music_Festival_in_Tampa_Florida.jpg', 'ckramer · CC BY 2.0'],
  ['https://commons.wikimedia.org/wiki/File:Cornell%C3%A1_de_Llobregat_-_Fira_de_Cornell%C3%A1_1.jpg', 'Zarateman · CC0 · Fira de Cornellà'],
  ['https://www.pexels.com/photo/market-stall-with-cowboy-boots-and-cowboy-hats-9216217/', 'Noé Villalta · Pexels']
];

export function Footer({ onContact, onNavigate }: { onContact: () => void; onNavigate: (hash: string) => void }) {
  const { t } = useLang();
  const wordRef = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLit(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const nav = (hash: string) => (e: RMouseEvent) => {
    e.preventDefault();
    onNavigate(hash);
  };
  return (
    <footer className="footer dark">
      <div className="footer-top">
        <img className="footer-logo" src={res('img/logo.webp')} alt="Barcelona Country Festival" loading="lazy" />
        <div className="footer-cols">
          <nav aria-label={t.news.legal}>
            <a href="#/blog" onClick={nav('#/blog')}>Blog</a>
            <button type="button" className="link" onClick={() => scrollToId('newsletter')}>
              {t.ref.newsletter}
            </button>
            <button type="button" className="link" onClick={onContact}>
              {t.ref.contact}
            </button>
          </nav>
          <nav aria-label={t.news.legal}>
            <a href="#/privacidad" onClick={nav('#/privacidad')}>{t.news.privacy}</a>
            <a href="#/aviso-legal" onClick={nav('#/aviso-legal')}>{t.news.legal}</a>
            <a href="#/cookies" onClick={nav('#/cookies')}>{t.news.cookies}</a>
            <PreferencesButton />
          </nav>
        </div>
      </div>
      <div className="footer-word" ref={wordRef} aria-hidden="true">
        <span className="footer-wood">Barcelona</span>
        <Neon text="Country" lit={lit} className="footer-neon" />
      </div>
      <div className="footer-bottom">
        <p>{t.footer}</p>
        <details className="credits">
          <summary>Créditos fotográficos</summary>
          <ul>
            {CREDITS.map(([href, label]) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noreferrer">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </footer>
  );
}

export function ContactDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'form' | 'sending' | 'sent'>('form');
  const [letter, setLetter] = useState({ name: '', message: '' });
  useEffect(() => {
    const d = dialog.current!;
    if (open && !d.open) {
      setPhase('form');
      d.showModal();
      lockScroll(true);
    }
    if (!open && d.open) d.close();
  }, [open]);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // The client has not approved a recipient yet, so this remains frontend-only.
    const data = new FormData(e.currentTarget);
    setLetter({ name: String(data.get('name') ?? '').trim(), message: String(data.get('message') ?? '').trim() });
    setPhase(reduced() ? 'sent' : 'sending');
  };

  // the message is folded into an airmail envelope, sealed with the festival star and posted
  useLayoutEffect(() => {
    const el = inner.current;
    if (phase !== 'sending' || !el) return;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      gsap
        .timeline({ onComplete: () => setPhase('sent') })
        .from(q('.mail'), { opacity: 0, scale: 0.92, duration: 0.45, ease: 'expo.out' })
        .from(q('.mail-letter'), { yPercent: -30, rotate: -4, opacity: 0, duration: 0.6, ease: 'expo.out' }, 0.05)
        .to(q('.mail-letter'), { yPercent: 67, rotate: 0, duration: 0.85, ease: 'power2.inOut' }, 0.75)
        .fromTo(q('.mail-flap'), { rotateX: 180 }, { rotateX: 0, duration: 0.55, ease: 'power2.in' }, 1.55)
        .set(q('.mail-flap'), { zIndex: 4 }, 1.82)
        .fromTo(q('.mail-seal'), { scale: 2.6, opacity: 0, rotate: -50 }, { scale: 1, opacity: 1, rotate: -8, duration: 0.28, ease: 'power4.in' }, 2.15)
        .to(q('.mail-env'), { scaleY: 0.95, scaleX: 1.03, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.out' }, 2.43)
        .fromTo(q('.mail-postmark'), { scale: 1.8, opacity: 0, rotate: 30 }, { scale: 1, opacity: 0.85, rotate: 12, duration: 0.24, ease: 'power4.in' }, 2.75)
        .to(q('.mail-env'), { y: -26, rotate: -4, duration: 0.45, ease: 'power2.out' }, 3.15)
        .to(q('.mail-env'), { x: () => window.innerWidth * 0.75, y: -320, rotate: 24, scale: 0.55, opacity: 0, duration: 0.75, ease: 'power3.in' }, 3.55)
        .fromTo(q('.mail-trail i'), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, x: () => 80 + Math.random() * 220, y: () => -40 - Math.random() * 160, duration: 0.7, ease: 'power2.out', stagger: 0.04 }, 3.6)
        .to(q('.mail-trail i'), { opacity: 0, duration: 0.4, stagger: 0.04 }, 4.0);
    }, el);
    return () => ctx.revert();
  }, [phase]);

  useLayoutEffect(() => {
    const el = inner.current;
    if (phase !== 'sent' || !el) return;
    (el.querySelector('.sent button') as HTMLElement | null)?.focus();
    if (reduced()) return;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      gsap.from(q('.sent-mark'), { scale: 0, rotate: -120, duration: 0.9, ease: 'back.out(2)' });
      gsap.from(q('.sent > :not(.sent-mark)'), { y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08, delay: 0.15 });
    }, el);
    return () => ctx.revert();
  }, [phase]);

  return (
    <dialog
      ref={dialog}
      className="contact-dialog"
      aria-labelledby="contact-title"
      data-lenis-prevent
      onClose={() => {
        lockScroll(false);
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
    >
      <div className="contact-inner" ref={inner}>
        <button type="button" className="icon-btn contact-close" onClick={() => dialog.current?.close()} aria-label={t.ref.close}>
          <Close />
        </button>
        {phase === 'form' && (
          <>
            <h2 id="contact-title">{t.ref.contactTitle}</h2>
            <p className="contact-msg">{t.ref.message}</p>
            <form className="form" onSubmit={submit}>
              <label className="field">
                <span>{t.formName}</span>
                <input name="name" autoComplete="name" required maxLength={160} />
              </label>
              <label className="field">
                <span>{t.formEmail}</span>
                <input name="email" type="email" autoComplete="email" required maxLength={320} />
              </label>
              <label className="field">
                <span>{t.ref.message}</span>
                <textarea name="message" rows={4} required maxLength={5000} />
              </label>
              <p className="preview-note" id="contact-note">
                {t.ui.preview}
              </p>
              <button type="submit" className="btn btn-gold" aria-describedby="contact-note">
                <span>{t.ref.send}</span>
                <Arrow />
              </button>
            </form>
          </>
        )}
        {phase === 'sending' && (
          <div className="mail" aria-hidden="true">
            <div className="mail-env">
              <span className="mail-back" />
              <span className="mail-flap" />
              <div className="mail-letter">
                <img src={res('img/isotype.webp')} alt="" />
                <b>{letter.name}</b>
                <p>{letter.message.slice(0, 160)}</p>
                <i />
                <i />
                <i />
              </div>
              <span className="mail-front">
                <small>{t.x.sealed}</small>
              </span>
              <span className="mail-seal">
                <Star />
              </span>
              <img className="mail-postmark" src={res('img/stamp.webp')} alt="" />
            </div>
            <span className="mail-trail">
              {Array.from({ length: 8 }, (_, i) => (
                <i key={i}>
                  <Star />
                </i>
              ))}
            </span>
          </div>
        )}
        {phase === 'sent' && (
          <div className="sent" role="status">
            <span className="sent-mark" aria-hidden="true">
              <img src={res('img/stamp.webp')} alt="" />
            </span>
            <h2 id="contact-title">{t.x.contactTitle}</h2>
            <p className="contact-msg">{t.x.contactBody}</p>
            <p className="preview-note">{t.ui.preview}</p>
            <button type="button" className="btn btn-gold" onClick={() => dialog.current?.close()}>
              <span>{t.x.done}</span>
              <Star />
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}

/** Star cursor with a trailing ring that shows short labels. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [active, setActive] = useState(false);
  const [on, setOn] = useState(false);
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    if (!finePointer() || reduced()) return;
    setOn(true);
    document.documentElement.classList.add('has-cursor');
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08 });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08 });
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3.out' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      setMoved(true);
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      const target = (e.target as HTMLElement)?.closest?.('a, button, label, select, input, textarea, summary, [data-cursor]') as HTMLElement | null;
      setActive(!!target);
      setLabel(target?.dataset.cursor ?? '');
    };
    const out = () => setActive(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', out);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', out);
    };
  }, []);
  return (
    <div className={`cursor ${on && moved ? 'is-on' : ''} ${active ? 'is-active' : ''} ${label ? 'has-label' : ''}`} aria-hidden="true">
      <div className="cursor-ring" ref={ring}>
        <span>{label}</span>
      </div>
      <div className="cursor-dot" ref={dot}>
        <Star />
      </div>
    </div>
  );
}

