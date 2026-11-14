import { useEffect, useRef, useState, type FormEvent, type MouseEvent as RMouseEvent } from 'react';
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
  ['https://www.pexels.com/photo/harley-davidson-motorcycle-on-new-mexico-road-31439816/', 'Dante Muñoz · Pexels']
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
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const d = dialog.current!;
    if (open && !d.open) {
      setSent(false);
      d.showModal();
      lockScroll(true);
    }
    if (!open && d.open) d.close();
  }, [open]);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // The client has not approved a recipient yet, so this remains frontend-only.
    setSent(true);
  };
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
      <div className="contact-inner">
        <button type="button" className="icon-btn contact-close" onClick={() => dialog.current?.close()} aria-label={t.ref.close}>
          <Close />
        </button>
        <p className="kicker">
          <Star /> Barcelona Country Festival
        </p>
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
          {sent && (
            <p className="form-feedback" role="status">
              {t.ui.preview}
            </p>
          )}
        </form>
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

