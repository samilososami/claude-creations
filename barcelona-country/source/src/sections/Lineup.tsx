import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type RefObject } from 'react';
import { artistsFor, pad, res, useLang, type Artist } from '../i18n';
import { finePointer, gsap, lockScroll, reduced, useReveal } from '../lib/motion';
import { Arrow, Close, Instagram, Neon } from '../components/ui';

function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}
export { useInView };

function GalleryIcon() {
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
      <path d="M3.5 16l4.6-4.6 3.4 3.4 2.6-2.6 6.4 6.3" />
      <circle cx="15.5" cy="9.2" r="1.4" />
    </svg>
  );
}

/** One autoplay timer, active only while the rail is visible and nobody is using it. */
function useAutoplay(rail: RefObject<HTMLDivElement | null>, step: (dir: number) => void) {
  const [paused, setPaused] = useState(() => reduced());
  const dir = useRef(1);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let visible = false;
    let hovered = false;
    // a finger on the rail stops the autoplay until the rail leaves the screen
    let touched = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sync = () => {
      clearTimeout(timer);
      if (paused || document.hidden || !visible || hovered || touched || el.querySelector('details[open]') || el.contains(document.activeElement)) return;
      timer = setTimeout(() => {
        const max = el.scrollWidth - el.clientWidth;
        if (max <= 1) return;
        if (el.scrollLeft >= max - 4) dir.current = -1;
        if (el.scrollLeft <= 4) dir.current = 1;
        step(dir.current);
        sync();
      }, 4200);
    };
    const enter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        hovered = true;
        sync();
      }
    };
    const touch = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') {
        touched = true;
        sync();
      }
    };
    const leave = () => {
      hovered = false;
      sync();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && e.intersectionRatio >= 0.3;
      if (!e.isIntersecting) touched = false;
      sync();
    }, { threshold: 0.3 });
    io.observe(el);
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerdown', touch);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('focusout', sync);
    el.addEventListener('toggle', sync, true);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearTimeout(timer);
      io.disconnect();
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerdown', touch);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('focusout', sync);
      el.removeEventListener('toggle', sync, true);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [rail, paused, step]);
  return { paused, setPaused };
}

export function Lineup() {
  const { t, lang } = useLang();
  const artists = artistsFor(t);
  const n = artists.length;
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const drag = useRef({ on: false, x: 0, left: 0, moved: false });
  const [first, setFirst] = useState(1);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [gallery, setGallery] = useState<number | null>(null);
  const [titleRef, titleSeen] = useInView<HTMLHeadingElement>(0.6);
  useReveal(root, [lang]);
  const [lead, ...restWords] = t.artistsTitle.split(' ');

  const stepSize = () => {
    const el = rail.current;
    if (!el || el.children.length < 2) return el?.clientWidth ?? 0;
    return (el.children[1] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft;
  };

  const step = useCallback((dir: number) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * stepSize(), behavior: reduced() ? 'auto' : 'smooth' });
  }, []);
  const { paused, setPaused } = useAutoplay(rail, step);

  // progress, counter and the slow inner parallax of each portrait
  const update = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = Math.max(1, el.scrollWidth - el.clientWidth);
    const s = stepSize() || 1;
    setFirst(Math.min(n, Math.round(el.scrollLeft / s) + 1));
    setEdges((prev) => {
      const next = { start: el.scrollLeft < 4, end: max - el.scrollLeft < 4 };
      return prev.start === next.start && prev.end === next.end ? prev : next;
    });
    if (bar.current) {
      bar.current.style.width = `${(el.clientWidth / el.scrollWidth) * 100}%`;
      bar.current.style.transform = `translateX(${(el.scrollLeft / el.clientWidth) * 100}%)`;
    }
    if (reduced()) return;
    const box = el.getBoundingClientRect();
    const mid = box.left + box.width / 2;
    for (const card of Array.from(el.children) as HTMLElement[]) {
      const r = card.getBoundingClientRect();
      const off = Math.max(-1.2, Math.min(1.2, (r.left + r.width / 2 - mid) / box.width));
      card.style.setProperty('--px', off.toFixed(3));
    }
  }, [n]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [update, lang]);

  useLayoutEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap.from('.card', {
        x: 120,
        opacity: 0,
        duration: 1.3,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.rail', start: 'top 85%', once: true }
      });
    }, root);
    return () => ctx.revert();
  }, [lang]);

  // mouse drag to scroll; touch keeps native momentum
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !finePointer()) return;
    const el = rail.current!;
    drag.current = { on: true, x: e.clientX, left: el.scrollLeft, moved: false };
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.on) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      setPaused(true);
      rail.current!.classList.add('is-dragging');
    }
    if (d.moved) rail.current!.scrollLeft = d.left - dx;
  };
  const up = () => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    const el = rail.current!;
    el.classList.remove('is-dragging');
    if (d.moved) {
      const s = stepSize();
      el.scrollTo({ left: Math.round(el.scrollLeft / s) * s, behavior: 'smooth' });
    }
  };

  return (
    <section id="artists" className="lineup dark" ref={root} aria-labelledby="artists-title">
      <div className="lineup-head">
        <p className="kicker" data-reveal>
          <span className="kicker-num">02</span>
          {t.nav[2]}
        </p>
        <h2 id="artists-title" className="lineup-title" ref={titleRef}>
          <span className="lineup-lead" data-words>
            <span className="w">
              <i>{lead}</i>
            </span>
          </span>{' '}
          <Neon text={restWords.join(' ')} lit={titleSeen} className="lineup-neon" />
        </h2>
        <p className="lineup-intro" data-reveal>
          {t.lineupIntro}
        </p>
      </div>

      <div className="rail-stage">
        <button type="button" className="rail-edge rail-prev" disabled={edges.start} aria-label={t.site.previous} onClick={() => { setPaused(true); step(-1); }}>
          <Arrow dir="left" />
        </button>
        <button type="button" className="rail-edge rail-next" disabled={edges.end} aria-label={t.site.next} onClick={() => { setPaused(true); step(1); }}>
          <Arrow />
        </button>
        <div
          ref={rail}
          className="rail"
          tabIndex={0}
          aria-label={t.artistsTitle}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          onClickCapture={(e) => {
            if (drag.current.moved) {
              e.preventDefault();
              e.stopPropagation();
              drag.current.moved = false;
            }
          }}
          onFocus={() => setPaused(true)}
        >
          {artists.map((a, i) => {
            const photo = (
              <>
                <span className="card-frame">
                  <img src={res(`art/${a.img}.webp`)} alt={a.name} loading="lazy" draggable={false} />
                </span>
                <span className="card-num">{pad(i + 1)}</span>
                {a.ig && (
                  <span className="card-ig" aria-hidden="true">
                    <Instagram />
                  </span>
                )}
              </>
            );
            return (
              <article className="card" key={a.name}>
                {a.ig ? (
                  <a className="card-photo" href={a.ig} target="_blank" rel="noopener noreferrer" aria-label={`Instagram: ${a.name}`} data-cursor="Instagram" draggable={false}>
                    {photo}
                  </a>
                ) : (
                  <figure className="card-photo">{photo}</figure>
                )}
                <div className="card-head">
                  <div>
                    <p className="card-role">{a.role}</p>
                    <h3 className="card-name">{a.name}</h3>
                  </div>
                  <button type="button" className="card-gallery" aria-label={`${t.ref.gallery}: ${a.name}`} onClick={() => setGallery(i)} data-cursor={t.ref.gallery}>
                    <GalleryIcon />
                  </button>
                </div>
                {a.body && (
                  <details className="card-bio">
                    <summary>
                      {t.site.bio}
                      <i aria-hidden="true" />
                    </summary>
                    <p>{a.body}</p>
                  </details>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <div className="rail-foot">
        <span className="rail-count">
          {pad(first)} <i>/ {pad(n)}</i>
        </span>
        <div className="rail-progress" aria-hidden="true">
          <span ref={bar} />
        </div>
        <button type="button" className="rail-play" onClick={() => setPaused(!paused)} aria-pressed={!paused}>
          <i className={paused ? 'is-paused' : 'is-playing'} aria-hidden="true" />
          {paused ? t.ref.play : t.ref.pause}
        </button>
      </div>

      <p className="lineup-more" data-reveal>
        <span>{t.mystery.title}</span>
        <img src={res('img/isotype.webp')} alt="" />
      </p>

      <GalleryDialog artist={gallery !== null ? artists[gallery] : null} onClose={() => setGallery(null)} />
    </section>
  );
}

function GalleryDialog({ artist, onClose }: { artist: Artist | null; onClose: () => void }) {
  const { t } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const last = useRef(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const images = artist?.gallery ?? [];
  const many = images.length > 1;

  useEffect(() => {
    const d = dialog.current!;
    if (artist && !d.open) {
      setIndex(0);
      last.current = 0;
      d.showModal();
      lockScroll(true);
    }
    if (!artist && d.open) d.close();
  }, [artist]);

  const go = useCallback((dir: number) => {
    if (!many) return;
    setIndex((i) => (i + dir + images.length) % images.length);
  }, [many, images.length]);

  useEffect(() => {
    if (!artist) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [artist, go]);

  // direction-aware wipe between photos
  useLayoutEffect(() => {
    if (!artist || reduced() || !stage.current) return;
    const prev = last.current;
    last.current = index;
    const dir = index === prev ? 0 : (index - prev + images.length) % images.length === 1 ? 1 : -1;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gal-photo',
        { clipPath: dir > 0 ? 'inset(0 0 0 100%)' : dir < 0 ? 'inset(0 100% 0 0)' : 'inset(100% 0 0 0)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.out' }
      );
      gsap.fromTo('.gal-photo img', { scale: 1.12 }, { scale: 1, duration: 1.2, ease: 'expo.out' });
    }, stage);
    return () => ctx.revert();
  }, [index, artist, images.length]);

  return (
    <dialog
      ref={dialog}
      className="gal"
      aria-labelledby="gal-title"
      data-lenis-prevent
      onClose={() => {
        lockScroll(false);
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
    >
      {artist && (
        <div className="gal-shell">
          <header className="gal-head">
            <div>
              <p>Barcelona Country Festival</p>
              <h2 id="gal-title">{artist.name}</h2>
            </div>
            <p className="gal-count" aria-live="polite">
              <span>{pad(index + 1)}</span>
              <i>/</i>
              <span>{pad(images.length)}</span>
            </p>
            <button type="button" className="gal-close" onClick={() => dialog.current?.close()} aria-label={t.gallery.close} autoFocus>
              <Close />
            </button>
          </header>
          <div
            className="gal-stage"
            ref={stage}
            onPointerDown={(e) => (touch.current = { x: e.clientX, y: e.clientY })}
            onPointerUp={(e) => {
              const s = touch.current;
              touch.current = null;
              if (!s) return;
              const dx = e.clientX - s.x;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(dx < 0 ? 1 : -1);
            }}
          >
            <figure className="gal-photo" key={images[index]}>
              <img src={res(images[index])} alt={`${artist.name} · ${t.gallery.photo} ${index + 1}`} decoding="async" draggable={false} />
            </figure>
            {many && (
              <>
                <button type="button" className="gal-arrow gal-prev" onClick={() => go(-1)} aria-label={t.gallery.previous}>
                  <Arrow dir="left" />
                </button>
                <button type="button" className="gal-arrow gal-next" onClick={() => go(1)} aria-label={t.gallery.next}>
                  <Arrow />
                </button>
              </>
            )}
          </div>
          {many && (
            <div className="gal-thumbs" aria-label={`${artist.name} · ${images.length}`}>
              {images.map((src, i) => (
                <button type="button" key={src} className={i === index ? 'is-active' : ''} aria-label={`${t.gallery.photo} ${i + 1}`} aria-pressed={i === index} onClick={() => setIndex(i)}>
                  <img src={res(src)} alt="" loading="lazy" decoding="async" />
                  <span>{pad(i + 1)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
