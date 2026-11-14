import { useEffect, type ReactNode } from 'react';
import legal from '../data/legal.json';
import { res, useLang } from '../i18n';
import { PreferencesButton } from '../components/Consent';
import { Arrow, Star } from '../components/ui';

type Block = { type: 'paragraph' | 'heading'; text: string } | { type: 'list'; items: string[] };
type Doc = { title: string; updatedAt: string; updatedLabel: string; sections: { id: string; title: string; blocks: Block[] }[] };
const DOCS = legal as Record<string, Doc>;

// Links existing words without adding or rewriting the approved document text.
const LINKS: Record<string, string> = {
  'privacidad@barcelonacountryfest.com': 'mailto:privacidad@barcelonacountryfest.com',
  'https://www.barcelonacountry.com/': 'https://www.barcelonacountry.com/',
  'Política de Privacidad': '#/privacidad',
  'Política de Cookies': '#/cookies'
};
function LegalText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(privacidad@barcelonacountryfest\.com|https:\/\/www\.barcelonacountry\.com\/|Política de Privacidad|Política de Cookies)/g).map((part, i) =>
        LINKS[part] ? (
          <a key={i} href={LINKS[part]}>
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
}

function PageShell({ children, onHome }: { children: ReactNode; onHome: (target?: string) => void }) {
  const { t } = useLang();
  return (
    <div className="page paper">
      <header className="page-head">
        <a href="#/" onClick={(e) => { e.preventDefault(); onHome(); }} aria-label="Barcelona Country Festival">
          <img src={res('img/logo.webp')} alt="Barcelona Country Festival" />
        </a>
        <a className="btn btn-ink btn-sm" href="#/" onClick={(e) => { e.preventDefault(); onHome(); }}>
          <Arrow dir="left" />
          <span>{t.news.back}</span>
        </a>
      </header>
      <main className="page-main">{children}</main>
      <footer className="page-foot">
        <span>Barcelona Country Festival · {t.date.days} {t.date.month.toUpperCase()} {t.date.year}</span>
        <a href="#/privacidad">{t.news.privacy}</a>
        <a href="#/aviso-legal">{t.news.legal}</a>
        <a href="#/cookies">{t.news.cookies}</a>
        <a href="mailto:privacidad@barcelonacountryfest.com">privacidad@barcelonacountryfest.com</a>
        <PreferencesButton />
      </footer>
    </div>
  );
}

export function LegalPage({ slug, onHome }: { slug: string; onHome: (target?: string) => void }) {
  const { t, lang } = useLang();
  const doc = DOCS[slug];
  useEffect(() => {
    document.title = `${doc?.title ?? t.news.legal} | Barcelona Country Festival`;
  }, [doc, t]);
  return (
    <PageShell onHome={onHome}>
      <nav className="legal-tabs" aria-label={t.news.legal}>
        {[
          ['privacidad', t.news.privacy],
          ['aviso-legal', t.news.legal],
          ['cookies', t.news.cookies]
        ].map(([k, label]) => (
          <a key={k} href={`#/${k}`} aria-current={k === slug ? 'page' : undefined}>
            {label}
          </a>
        ))}
      </nav>
      {doc ? (
        <article className="legal" lang="es">
          <h1 className="legal-title">{doc.title}</h1>
          <p className="legal-updated">
            <time dateTime={doc.updatedAt}>{doc.updatedLabel}</time>
          </p>
          {lang !== 'es' && (
            <p className="legal-note" lang={lang}>
              {t.reg.spanishDocument}
            </p>
          )}
          {slug === 'cookies' && (
            <div className="legal-prefs">
              <PreferencesButton />
            </div>
          )}
          <div className="legal-grid">
            <nav className="legal-index" aria-label="Contenido del documento">
              <ol>
                {doc.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#/${slug}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }}>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="legal-body">
              {doc.sections.map((s) => (
                <section key={s.id} id={s.id}>
                  <h2>{s.title}</h2>
                  {s.blocks.map((b, i) =>
                    b.type === 'list' ? (
                      <ul key={i}>
                        {b.items.map((item, k) => (
                          <li key={k}>
                            <LegalText text={item} />
                          </li>
                        ))}
                      </ul>
                    ) : b.type === 'heading' ? (
                      <h3 key={i}>{b.text}</h3>
                    ) : (
                      <p key={i}>
                        <LegalText text={b.text} />
                      </p>
                    )
                  )}
                </section>
              ))}
            </div>
          </div>
        </article>
      ) : (
        <p>{t.news.pending}</p>
      )}
    </PageShell>
  );
}

export function BlogPage({ onHome }: { onHome: (target?: string) => void }) {
  const { t } = useLang();
  useEffect(() => {
    document.title = 'Barcelona Country News | Barcelona Country Festival';
  }, []);
  return (
    <PageShell onHome={onHome}>
      <div className="blog-mast">
        <p className="kicker">
          <Star /> {t.news.archive}
        </p>
        <h1>
          Barcelona Country <em>News</em>
        </h1>
        <p>{t.news.archiveIntro}</p>
      </div>
      <section className="blog-empty">
        <span className="blog-num" aria-hidden="true">
          01
        </span>
        <div>
          <p className="kicker">Barcelona Country News</p>
          <h2>{t.news.empty}</h2>
          <p>{t.news.emptyBody}</p>
          <a className="btn btn-gold" href="#/" onClick={(e) => { e.preventDefault(); onHome('newsletter'); }}>
            <span>{t.news.subscribe}</span>
            <Arrow dir="up-right" />
          </a>
        </div>
      </section>
    </PageShell>
  );
}
