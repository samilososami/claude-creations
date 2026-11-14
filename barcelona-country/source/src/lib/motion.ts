import { useLayoutEffect, type DependencyList, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const isSmall = () => window.matchMedia('(max-width: 760px)').matches;

let lenis: Lenis | null = null;
let lastY = 0;
let lastT = 0;
let vel = 0;

export function startMotion() {
  window.addEventListener(
    'scroll',
    () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = Math.max(16, now - lastT);
      vel = vel * 0.6 + ((y - lastY) / dt) * 16 * 0.4;
      lastY = y;
      lastT = now;
    },
    { passive: true }
  );
  if (reduced() || lenis) return;
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95, touchMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/** Scroll speed in px per frame, decays to 0 when idle. */
export function scrollVelocity() {
  if (performance.now() - lastT > 120) vel *= 0.9;
  return vel;
}

export function scrollToId(id: string, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.5, easing: (x: number) => 1 - Math.pow(1 - x, 4) });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduced() ? 'auto' : 'smooth' });
}

export function scrollTopNow() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

let locks = 0;
export function lockScroll(lock: boolean) {
  locks = Math.max(0, locks + (lock ? 1 : -1));
  const on = locks > 0;
  if (on) lenis?.stop();
  else lenis?.start();
  document.documentElement.classList.toggle('is-locked', on);
}

/** Generic entrance animations for [data-reveal] and [data-words] inside a scope. */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: DependencyList = []) {
  useLayoutEffect(() => {
    if (reduced() || !scope.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 56,
          opacity: 0,
          duration: 1.2,
          ease: 'expo.out',
          delay: Number(el.dataset.delay || 0),
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        });
      });
      gsap.utils.toArray<HTMLElement>('[data-words]').forEach((el) => {
        gsap.from(el.querySelectorAll('.w > i'), {
          yPercent: 115,
          rotate: 4,
          duration: 1.15,
          ease: 'expo.out',
          stagger: 0.035,
          delay: Number(el.dataset.delay || 0),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      });
    }, scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
