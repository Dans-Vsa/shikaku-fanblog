import { useEffect, type RefObject } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-setup';
import { useReducedMotion } from './useReducedMotion';

interface RevealOptions {
  y?: number;
  rotate?: number;
  stagger?: number;
  duration?: number;
  start?: string;
  selector?: string;
}

/**
 * Munculkan elemen [data-reveal] di dalam `scope` saat masuk viewport.
 * Hanya transform + opacity; ScrollTrigger.batch menggabungkan elemen yang
 * masuk bersamaan menjadi satu tween (lebih sedikit kerja per frame).
 * Reduced motion: konten langsung terlihat, tanpa animasi.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, opts: RevealOptions = {}) {
  const reduced = useReducedMotion();
  const {
    y = 28,
    rotate = 0,
    stagger = 0.08,
    duration = 0.8,
    start = 'top 85%',
    selector = '[data-reveal]',
  } = opts;

  useEffect(() => {
    const root = scope.current;
    if (!root || reduced) return;
    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray<HTMLElement>(selector, root);
      gsap.set(els, { opacity: 0, y, rotate });
      ScrollTrigger.batch(els, {
        start,
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            rotate: 0,
            duration,
            stagger,
            ease: 'expo.out',
            overwrite: true,
          }),
      });
    }, root);
    return () => ctx.revert();
  }, [scope, reduced, y, rotate, stagger, duration, start, selector]);
}
