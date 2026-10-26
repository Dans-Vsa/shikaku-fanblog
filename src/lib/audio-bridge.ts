import type { AmbienceName, SfxName } from './audio-manager';

/**
 * Jembatan sinkron ke modul audio yang di-lazy-load.
 * Setelah modul dimuat, `playSfx` memanggil engine langsung (tanpa await)
 * sehingga suara terjadwal di frame yang sama dengan input.
 */
type AudioModule = typeof import('./audio-manager');

let loader: Promise<AudioModule> | null = null;
let engine: AudioModule['audio'] | null = null;
let pendingAmbience: AmbienceName = 'none';

export function loadAudio() {
  loader ??= import('./audio-manager').then((m) => {
    engine = m.audio;
    engine.setAmbience(pendingAmbience);
    return m;
  });
  return loader;
}

export function playSfx(name: SfxName, opts?: { volume?: number; pitchJitter?: number }) {
  engine?.play(name, opts);
}

export function setAmbience(name: AmbienceName) {
  pendingAmbience = name;
  engine?.setAmbience(name);
}

/** Redam semua suara sesaat — "tahan napas" sebelum regenerasi. */
export function duckAudio(seconds: number, depth?: number) {
  engine?.duck(seconds, depth);
}

export function muteEngine(muted: boolean) {
  if (muted) engine?.setMuted(true);
  else void loadAudio().then((m) => m.audio.setMuted(false));
}
