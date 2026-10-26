import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { playSfx } from '@/lib/audio-bridge';
import { gsap, ScrollTrigger } from '@/lib/gsap-setup';
import { scrollToTop } from '@/lib/lenis-setup';
import { transitionStore } from './transition-store';

/** Tepi sobek acak (deterministik per seed) untuk dua lembar tirai tinta. */
function tornSheet(seed: number, top: boolean) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const pts: string[] = [];
  const steps = 30;
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    const depth = rnd() * (i % 4 === 0 ? 16 : 7);
    const y = top ? 84 + depth : 16 - depth;
    pts.push(`L${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return top ? `M0 0 L100 0 ${pts.join(' ')} Z` : `M0 100 L100 100 ${pts.join(' ')} Z`;
}

const TOP = tornSheet(7, true);
const BOTTOM = tornSheet(13, false);

/**
 * Tirai tinta dua lembar dengan tepi sobek. Menutup sebelum navigasi,
 * membuka setelah halaman baru ter-render (useLayoutEffect = sebelum paint).
 */
export function PageTransition() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const covered = useRef(false);
  const first = useRef(true);
  const reducedRef = useRef(reduced);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    const cover = () =>
      new Promise<void>((resolve) => {
        if (reducedRef.current || !top.current || !bottom.current || !root.current) {
          resolve();
          return;
        }
        playSfx('paper', { volume: 0.7 });
        root.current.style.visibility = 'visible';
        gsap.killTweensOf([top.current, bottom.current]);
        gsap
          .timeline({
            onComplete: () => {
              covered.current = true;
              resolve();
            },
          })
          .fromTo(
            top.current,
            { yPercent: -105, rotate: -2 },
            { yPercent: 0, rotate: 0, duration: 0.42, ease: 'power3.in' },
            0,
          )
          .fromTo(
            bottom.current,
            { yPercent: 105, rotate: 2 },
            { yPercent: 0, rotate: 0, duration: 0.42, ease: 'power3.in' },
            0.03,
          );
      });
    return transitionStore.register(cover, (to) => navigate(to));
  }, [navigate]);

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    scrollToTop();
    const r = root.current;
    const a = top.current;
    const b = bottom.current;
    if (!r || !a || !b) return;
    if (reducedRef.current) {
      r.style.visibility = 'hidden';
      covered.current = false;
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return;
    }
    // Navigasi back/forward: tutup instan sebelum paint lalu buka.
    if (!covered.current) {
      r.style.visibility = 'visible';
      gsap.set([a, b], { yPercent: 0, rotate: 0 });
    }
    covered.current = false;
    const tl = gsap
      .timeline({
        delay: 0.08,
        onComplete: () => {
          r.style.visibility = 'hidden';
          ScrollTrigger.refresh();
        },
      })
      .to(a, { yPercent: -108, rotate: -3, duration: 0.7, ease: 'expo.inOut' }, 0)
      .to(b, { yPercent: 108, rotate: 3, duration: 0.7, ease: 'expo.inOut' }, 0.04);
    return () => {
      tl.progress(1).kill();
    };
  }, [pathname]);

  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-[80]"
      style={{ visibility: 'hidden' }}
      aria-hidden="true"
    >
      <div ref={top} className="absolute inset-x-[-6%] top-0 h-[58%] will-change-transform">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full text-ink">
          <path d={TOP} fill="currentColor" />
        </svg>
        <span className="t-label absolute bottom-[26%] left-1/2 -translate-x-1/2 text-paper">
          {t('common.loading')}
        </span>
      </div>
      <div ref={bottom} className="absolute inset-x-[-6%] bottom-0 h-[58%] will-change-transform">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full text-ink">
          <path d={BOTTOM} fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
