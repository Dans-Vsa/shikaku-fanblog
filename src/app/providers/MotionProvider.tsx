import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isOneOf, readStore, writeStore } from '@/lib/storage';
import { MotionContext, type MotionPref } from './contexts';

const KEY = 'motion-pref';
const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Preferensi gerak = preferensi sistem, kecuali pengguna memilih manual.
 * Saat "reduced": Lenis mati, shader statis, simulasi tanpa shake/slow-mo.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [systemReduced, setSystemReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );
  const [pref, setPrefState] = useState<MotionPref>(() =>
    readStore<MotionPref>(KEY, 'system', isOneOf<MotionPref>('system', 'full', 'reduced')),
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setSystemReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const reduced = pref === 'reduced' || (pref === 'system' && systemReduced);

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
  }, [reduced]);

  const setPref = useCallback((p: MotionPref) => {
    setPrefState(p);
    writeStore(KEY, p);
  }, []);

  const toggle = useCallback(() => {
    setPref(reduced ? 'full' : 'reduced');
  }, [reduced, setPref]);

  const value = useMemo(
    () => ({ reduced, systemReduced, pref, setPref, toggle }),
    [reduced, systemReduced, pref, setPref, toggle],
  );
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}
