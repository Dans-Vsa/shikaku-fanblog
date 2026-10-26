import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AmbienceName, SfxName } from '@/lib/audio-manager';
import { isBool, readStore, writeStore } from '@/lib/storage';
import { AudioCtx } from './contexts';

const KEY = 'muted';

type AudioModule = typeof import('@/lib/audio-manager');
let loader: Promise<AudioModule> | null = null;
/** Referensi sinkron setelah modul dimuat: SFX dipicu di frame yang sama dengan input. */
let engine: AudioModule['audio'] | null = null;
let pendingAmbience: AmbienceName = 'none';

function loadAudio() {
  loader ??= import('@/lib/audio-manager').then((m) => {
    engine = m.audio;
    engine.setAmbience(pendingAmbience);
    return m;
  });
  return loader;
}

/**
 * Default MUTE. Modul audio (Howler + sintesis) baru dimuat saat suara dinyalakan,
 * dan AudioContext baru dibuat setelah gesture pengguna.
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState<boolean>(() => readStore(KEY, true, isBool));

  useEffect(() => {
    writeStore(KEY, muted);
    if (muted) {
      engine?.setMuted(true);
      return;
    }
    const unlock = () => void loadAudio().then((m) => m.audio.setMuted(false));
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
  const play = useCallback((name: SfxName, opts?: { volume?: number; pitchJitter?: number }) => {
    engine?.play(name, opts);
  }, []);
  const setAmbience = useCallback((name: AmbienceName) => {
    pendingAmbience = name;
    engine?.setAmbience(name);
  }, []);

  const value = useMemo(
    () => ({ muted, toggle, setMuted, play, setAmbience }),
    [muted, toggle, setMuted, play, setAmbience],
  );
  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

/** Duck/“tahan napas” tanpa melewati React (dipanggil dari loop simulasi). */
export function duckAudio(seconds: number, depth?: number) {
  engine?.duck(seconds, depth);
}

export function playSfx(name: SfxName, opts?: { volume?: number; pitchJitter?: number }) {
  engine?.play(name, opts);
}
