import Lenis from 'lenis';
import { gsap, ScrollTrigger, setupGsap } from './gsap-setup';

/**
 * Satu-satunya sumber scroll halus. Lenis digerakkan oleh gsap.ticker sehingga
 * seluruh animasi scroll (ScrollTrigger, shader, peta emosi) berjalan di SATU ticker.
 */
let lenis: Lenis | null = null;
const listeners = new Set<(scroll: number, velocity: number) => void>();

function tick(time: number) {
  lenis?.raf(time * 1000);
}

export function startLenis() {
  setupGsap();
  if (lenis) return lenis;
  lenis = new Lenis({
    lerp: 0.11,
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.4,
  });
  lenis.on('scroll', (l: Lenis) => {
    ScrollTrigger.update();
    listeners.forEach((fn) => fn(l.scroll, l.velocity));
  });
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function stopLenis() {
  if (!lenis) return;
  gsap.ticker.remove(tick);
  lenis.destroy();
  lenis = null;
}

export const getLenis = () => lenis;

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

export function scrollToElement(el: HTMLElement | string) {
  if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.4 });
  else {
    const node = typeof el === 'string' ? document.querySelector<HTMLElement>(el) : el;
    node?.scrollIntoView({ behavior: 'smooth' });
  }
}

/** Langganan posisi scroll tanpa menambah listener scroll ke window. */
export function onLenisScroll(fn: (scroll: number, velocity: number) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
