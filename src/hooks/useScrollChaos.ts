import { useEffect } from 'react';
import { clamp } from '@/lib/math';

/**
 * Tulis --chaos (0..1) & --mood (0..1) ke :root. Satu-satunya penulis variabel
 * global ini, sehingga semua turunan CSS (.chaos-panel dll.) cukup membacanya.
 */
export function setChaos(chaos: number, mood?: number) {
  const s = document.documentElement.style;
  s.setProperty('--chaos', clamp(chaos).toFixed(3));
  if (mood !== undefined) s.setProperty('--mood', clamp(mood).toFixed(3));
}

/** Set tingkat kekacauan statis untuk sebuah halaman. Halaman /baca menimpanya per babak. */
export function useScrollChaos(chaos: number, mood = chaos) {
  useEffect(() => {
    setChaos(chaos, mood);
    return () => setChaos(0, 0);
  }, [chaos, mood]);
}
