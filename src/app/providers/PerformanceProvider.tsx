import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { featureFlags } from '@/config/feature-flags';
import { gsap } from '@/lib/gsap-setup';
import {
  benchmarkFrameTime,
  downgrade,
  hasWebGL,
  heuristicQuality,
  qualityFromFrameTime,
  QUALITIES,
  type Quality,
} from '@/lib/perf-detect';
import { perfStore } from '@/lib/perf-store';
import { PerformanceContext } from './contexts';

const forced = QUALITIES.find((q) => q === featureFlags.forcedQuality) ?? null;

/**
 * Level kualitas High/Medium/Low:
 * 1. tebakan heuristik (core, memori, pointer) saat boot,
 * 2. benchmark median frame time saat idle,
 * 3. mode performa otomatis: FPS < ambang dua jendela berturut-turut -> turun satu level.
 */
export function PerformanceProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [quality, setQualityState] = useState<Quality>(() => forced ?? heuristicQuality());
  const [measured, setMeasured] = useState(forced !== null);
  const [toast, setToast] = useState<string | null>(null);
  const manual = useRef(forced !== null);
  const qualityRef = useRef(quality);
  const webgl = useMemo(() => !featureFlags.disableWebGL && hasWebGL(), []);

  useEffect(() => {
    if (manual.current) return;
    let cancelled = false;
    const run = () =>
      benchmarkFrameTime().then((ms) => {
        if (cancelled || manual.current) return;
        setQualityState((h) => qualityFromFrameTime(ms, h));
        setMeasured(true);
      });
    const idle = typeof window.requestIdleCallback === 'function';
    const id = idle
      ? window.requestIdleCallback(() => void run(), { timeout: 2500 })
      : window.setTimeout(() => void run(), 1200);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  // Monitor FPS memakai gsap.ticker yang sama dengan Lenis (satu ticker global).
  useEffect(() => {
    let frames = 0;
    let acc = 0;
    let lowWindows = 0;
    const onTick = (_time: number, delta: number) => {
      if (document.visibilityState !== 'visible') return;
      frames++;
      acc += delta;
      if (acc < 2000) return;
      const fps = (frames * 1000) / acc;
      frames = 0;
      acc = 0;
      perfStore.publish(fps);
      if (manual.current) return;
      if (fps < featureFlags.lowFpsThreshold) lowWindows++;
      else lowWindows = 0;
      if (lowWindows >= 2) {
        lowWindows = 0;
        const q = qualityRef.current;
        if (q === 'low') return;
        const next = downgrade(q);
        qualityRef.current = next;
        setQualityState(next);
        setToast(next);
      }
    };
    gsap.ticker.add(onTick);
    return () => gsap.ticker.remove(onTick);
  }, []);

  useEffect(() => {
    qualityRef.current = quality;
    document.documentElement.dataset.quality = quality;
  }, [quality]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const setQuality = useCallback((q: Quality) => {
    manual.current = true;
    setQualityState(q);
    setMeasured(true);
  }, []);

  const value = useMemo(
    () => ({ quality, webgl, measured, setQuality, debug: featureFlags.debug }),
    [quality, webgl, measured, setQuality],
  );

  return (
    <PerformanceContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-4 left-1/2 z-[90] -translate-x-1/2 border-2 border-ink bg-paper px-4 py-2 font-mono text-xs transition-all duration-500 ease-out ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {toast ? t('perf.lowered', { q: toast.toUpperCase() }) : ''}
      </div>
    </PerformanceContext.Provider>
  );
}
