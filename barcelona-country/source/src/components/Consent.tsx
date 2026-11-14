import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLang } from '../i18n';
import { lockScroll } from '../lib/motion';
import { Close } from './ui';

// Same contract as shared/cookie-consent.mjs in the production repo: only an explicit
// Google Maps choice enables the third-party embed.
const KEY = 'bcf-cookie-consent';
const VERSION = 1;
const TTL = 180 * 24 * 60 * 60 * 1000;
type Choice = { version: number; maps: boolean; savedAt: number; expiresAt: number };

const create = (maps: boolean, now = Date.now()): Choice => ({ version: VERSION, maps, savedAt: now, expiresAt: now + TTL });

function parse(raw: string | null, now = Date.now()): Choice | null {
  if (typeof raw !== 'string' || raw.length > 1024) return null;
  try {
    const v = JSON.parse(raw);
    if (!v || typeof v !== 'object' || Array.isArray(v) || v.version !== VERSION || typeof v.maps !== 'boolean'
      || !Number.isSafeInteger(v.savedAt) || v.savedAt <= 0 || v.savedAt > now
      || v.expiresAt !== v.savedAt + TTL || now >= v.expiresAt) return null;
    return { version: v.version, maps: v.maps, savedAt: v.savedAt, expiresAt: v.expiresAt };
  } catch {
    return null;
  }
}

function read() {
  try {
    return { choice: parse(window.localStorage.getItem(KEY)), blocked: false };
  } catch {
    return { choice: null, blocked: true };
  }
}

type Ctx = { mapsAllowed: boolean; openPreferences: () => void };
const ConsentContext = createContext<Ctx>({ mapsAllowed: false, openPreferences: () => undefined });
export const useConsent = () => useContext(ConsentContext);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const { t, lang } = useLang();
  const c = t.cookie;
  const [initial] = useState(read);
  const [choice, setChoice] = useState<Choice | null>(initial.choice);
  const [blocked, setBlocked] = useState(initial.blocked);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const openPreferences = useCallback(() => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDraft(choice?.maps === true);
    setOpen(true);
  }, [choice]);

  const save = useCallback((maps: boolean) => {
    const next = create(maps);
    setChoice(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      setBlocked(false);
    } catch {
      setBlocked(true);
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      lockScroll(true);
    }
    if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY && e.key !== null) return;
      const next = parse(e.newValue);
      setChoice(next);
      setDraft(next?.maps === true);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!choice) return;
    let timer: ReturnType<typeof setTimeout>;
    const expire = () => {
      const left = choice.expiresAt - Date.now();
      if (left <= 0) {
        setChoice(null);
        setDraft(false);
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(expire, Math.min(left, 24 * 60 * 60 * 1000));
    };
    expire();
    document.addEventListener('visibilitychange', expire);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', expire);
    };
  }, [choice]);

  const value = useMemo(() => ({ mapsAllowed: choice?.maps === true, openPreferences }), [choice, openPreferences]);

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {!choice && (
        <section className="cookie-banner" aria-label={c.preferences} key={lang}>
          <div className="cookie-copy">
            <h2>{c.title}</h2>
            <p>{c.intro}</p>
          </div>
          <div className="cookie-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => save(false)}>
              {c.reject}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => save(true)}>
              {c.accept}
            </button>
          </div>
          <div className="cookie-foot">
            <button type="button" className="link" onClick={openPreferences}>
              {c.configure}
            </button>
            <a className="link" href="#/cookies">
              {c.policy}
            </a>
          </div>
        </section>
      )}
      {blocked && choice && (
        <div className="cookie-notice" role="status">
          {c.storage}{' '}
          <button type="button" className="link" onClick={openPreferences}>
            {c.configure}
          </button>
        </div>
      )}
      <dialog
        ref={dialog}
        className="cookie-dialog"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-details"
        data-lenis-prevent
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        onClose={() => {
          lockScroll(false);
          setOpen(false);
          if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
        }}
      >
        <header>
          <h2 id="cookie-title">{c.preferences}</h2>
          <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label={c.close}>
            <Close />
          </button>
        </header>
        <p id="cookie-details">{c.details}</p>
        <section className="cookie-cat">
          <div className="cookie-cat-head">
            <h3>{c.necessary}</h3>
            <span>{c.always}</span>
          </div>
          <p>{c.necessaryText}</p>
        </section>
        <section className="cookie-cat">
          <label className="cookie-switch">
            <span>{c.maps}</span>
            <input type="checkbox" role="switch" checked={draft} onChange={(e) => setDraft(e.target.checked)} aria-describedby="cookie-maps-desc" />
            <i aria-hidden="true" />
          </label>
          <p id="cookie-maps-desc">{c.mapsText}</p>
          <a className="link" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google · {c.privacy}
          </a>
        </section>
        {blocked && <p role="status">{c.storage}</p>}
        <div className="cookie-dialog-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => save(false)}>
            {choice?.maps ? c.revoke : c.reject}
          </button>
          <button type="button" className="btn btn-gold btn-sm" onClick={() => save(draft)}>
            {c.save}
          </button>
        </div>
        <nav className="cookie-links" aria-label={c.preferences}>
          <a className="link" href="#/cookies" onClick={() => setOpen(false)}>
            {c.policy}
          </a>
          <a className="link" href="#/privacidad" onClick={() => setOpen(false)}>
            {c.privacy}
          </a>
        </nav>
      </dialog>
    </ConsentContext.Provider>
  );
}

export function PreferencesButton() {
  const { t } = useLang();
  const { openPreferences } = useConsent();
  return (
    <button type="button" className="link" onClick={openPreferences}>
      {t.cookie.preferences}
    </button>
  );
}
