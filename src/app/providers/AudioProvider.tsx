import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AmbienceName, SfxName } from '@/lib/audio-manager';
import {
  loadAudio,
  muteEngine,
  playSfx,
  setAmbience as setEngineAmbience,
} from '@/lib/audio-bridge';
import { isBool, readStore, writeStore } from '@/lib/storage';
import { AudioCtx } from './contexts';

const KEY = 'muted';

/**
 * Default MUTE. Modul audio (Howler + sintesis) baru dimuat saat suara dinyalakan,
 * dan AudioContext baru dibuat setelah gesture pengguna.
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState<boolean>(() => readStore(KEY, true, isBool));

  useEffect(() => {
    writeStore(KEY, muted);
    if (muted) {
      muteEngine(true);
      return;
    }
    const unlock = () => muteEngine(false);
    const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } })
      .userActivation;
    if (!activation || activation.hasBeenActive) {
      unlock();
      return;
    }
    void loadAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [muted]);

  const setMuted = useCallback((m: boolean) => setMutedState(m), []);
  const toggle = useCallback(() => setMutedState((m) => !m), []);
  const play = useCallback(
    (name: SfxName, opts?: { volume?: number; pitchJitter?: number }) => playSfx(name, opts),
    [],
  );
  const setAmbience = useCallback((name: AmbienceName) => setEngineAmbience(name), []);

  const value = useMemo(
    () => ({ muted, toggle, setMuted, play, setAmbience }),
    [muted, toggle, setMuted, play, setAmbience],
  );
  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}
