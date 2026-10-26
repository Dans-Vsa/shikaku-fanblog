import { useEffect } from 'react';
import { clamp } from '@/lib/math';

type Listener = (chaos: number, mood: number) => void;
const listeners = new Set<Listener>();
let chaosValue = 0;
let moodValue = 0;

/**
 * Tulis --chaos (0..1) & --mood (0..1) ke :root. Satu-satunya penulis variabel
 * global ini, sehingga semua turunan CSS (.chaos-panel dll.) cukup membacanya.
 */
export function setChaos(chaos: number, mood?: number) {
  const c = clamp(chaos);
  const m = mood === undefined ? moodValue : clamp(mood);
  if (Math.abs(c - chaosValue) < 0.002 && Math.abs(m - moodValue) < 0.002) return;
  chaosValue = c;
  moodValue = m;
  const s = document.documentElement.style;
  s.setProperty('--chaos', c.toFixed(3));
  s.setProperty('--mood', m.toFixed(3));
  listeners.forEach((l) => l(c, m));
}

export const chaosStore = {
  get chaos() {
    return chaosValue;
  },
  get mood() {
    return moodValue;
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

/** Set tingkat kekacauan statis untuk sebuah halaman. Halaman /baca menimpanya per babak. */
export function useScrollChaos(chaos: number, mood = chaos) {
  useEffect(() => {
    setChaos(chaos, mood);
    return () => setChaos(0, 0);
  }, [chaos, mood]);
}
