import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isBool, readStore, writeStore } from '@/lib/storage';
import { SpoilerContext } from './contexts';

const KEY = 'spoilers-hidden';

/** Mode "belum baca" (default) menyensor semua konten spoiler di seluruh situs. */
export function SpoilerProvider({ children }: { children: ReactNode }) {
  const [hidden, setHiddenState] = useState<boolean>(() => readStore(KEY, true, isBool));

  useEffect(() => {
    writeStore(KEY, hidden);
    document.documentElement.dataset.spoilers = hidden ? 'hidden' : 'shown';
  }, [hidden]);

  const setHidden = useCallback((v: boolean) => setHiddenState(v), []);
  const toggle = useCallback(() => setHiddenState((v) => !v), []);

  const value = useMemo(() => ({ hidden, setHidden, toggle }), [hidden, setHidden, toggle]);
  return <SpoilerContext.Provider value={value}>{children}</SpoilerContext.Provider>;
}
