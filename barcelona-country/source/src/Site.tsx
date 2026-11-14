import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LANG_KEY, LangContext, T, initialLang, type Lang } from './i18n';
import { ScrollTrigger, gsap, reduced, scrollToId, scrollTopNow, startMotion } from './lib/motion';
import { ConsentProvider } from './components/Consent';
import { ContactDialog, Cursor, Footer, Header, Sponsors } from './components/Chrome';
import { Hero } from './sections/Hero';
import { Festival } from './sections/Festival';
import { Lineup } from './sections/Lineup';
import { Chapters } from './sections/Chapters';
import { Place } from './sections/Place';
import { Newsletter } from './sections/Newsletter';

const BlogPage = lazy(() => import('./pages/Pages').then((m) => ({ default: m.BlogPage })));
const LegalPage = lazy(() => import('./pages/Pages').then((m) => ({ default: m.LegalPage })));

const PAGES = ['privacidad', 'aviso-legal', 'cookies', 'blog', 'newsletters'];
const routeOf = () => {
  const h = window.location.hash.replace(/^#\/?/, '').split(/[?#]/)[0].toLowerCase();
  return PAGES.includes(h) ? h : '';
};

function Site() {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [route, setRoute] = useState(routeOf);
  const [contact, setContact] = useState(false);
  const curtain = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      /* the choice still applies to this visit */
    }
  }, []);
  const ctx = useMemo(() => ({ lang, t: T[lang], setLang }), [lang, setLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    startMotion();
  }, []);

  // page transitions: striped curtain wipes across, route swaps underneath
  const swap = useCallback((apply: () => void) => {
    const el = curtain.current;
    if (!el || reduced()) {
      apply();
      return;
    }
    gsap
      .timeline()
      .set(el, { display: 'block' })
      .fromTo(el.children, { yPercent: 101 }, { yPercent: 0, duration: 0.55, ease: 'expo.inOut', stagger: 0.05 })
      .call(apply)
      .to(el.children, { yPercent: -101, duration: 0.7, ease: 'expo.inOut', stagger: 0.05, delay: 0.1 })
      .set(el, { display: 'none' });
  }, []);

  useEffect(() => {
    const onHash = () => {
      const next = routeOf();
      swap(() => {
        setRoute(next);
        scrollTopNow();
      });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [swap]);

  const navigate = useCallback((hash: string) => {
    if (window.location.hash === hash) return;
    window.location.hash = hash;
  }, []);

  const goHome = useCallback((target?: string) => {
    pending.current = target ?? null;
    if (window.location.hash && window.location.hash !== '#/') window.location.hash = '#/';
  }, []);

  useLayoutEffect(() => {
    if (route) {
      if (window.location.hash.startsWith('#/')) scrollTopNow();
      return;
    }
    document.title = 'Barcelona Country Festival · 22–24 Oct 2027 · Fira Cornellà';
    const target = pending.current;
    pending.current = null;
    const id = window.setTimeout(() => {
      ScrollTrigger.refresh();
      if (target) scrollToId(target);
    }, 120);
    return () => window.clearTimeout(id);
  }, [route]);

  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => window.clearTimeout(id);
  }, [lang]);

  return (
    <LangContext.Provider value={ctx}>
      <ConsentProvider>
        <div className="grain" aria-hidden="true" />
        <Cursor />
        {route === '' ? (
          <>
            <a className="skip" href="#/" onClick={(e) => { e.preventDefault(); scrollToId('festival'); }}>
              {T[lang].festivalTitle}
            </a>
            <Header onContact={() => setContact(true)} onNavigate={navigate} />
            <main>
              <Hero onContact={() => setContact(true)} />
              <Festival />
              <Lineup />
              <Chapters />
              <Place />
              <Newsletter />
              <Sponsors onContact={() => setContact(true)} />
            </main>
            <Footer onContact={() => setContact(true)} onNavigate={navigate} />
          </>
        ) : (
          <Suspense fallback={<div className="page paper" />}>
            {route === 'blog' || route === 'newsletters' ? <BlogPage onHome={goHome} /> : <LegalPage slug={route} onHome={goHome} />}
          </Suspense>
        )}
        <ContactDialog open={contact} onClose={() => setContact(false)} />
        <div className="curtain" ref={curtain} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </ConsentProvider>
    </LangContext.Provider>
  );
}

export default Site;
