import { clamp, smoothstep } from '@/lib/math';

/**
 * Peta progres scroll (0..1) Babak 5 → seluruh parameter adegan.
 * Semua kurva dibangun dari smoothstep sehingga kontinu: tidak ada lompatan
 * saat masuk/keluar maupun saat scroll mundur.
 */
export const BEATS = {
  burn: [0.0, 0.08],
  power: [0.065, 0.13],
  hijack: [0.13, 0.3],
  stabilize: [0.3, 0.38],
  confession: [0.38, 0.58],
  morph: [0.58, 0.72],
  answer: [0.72, 0.86],
  off: [0.86, 0.97],
} as const;

const bump = (p: number, a: number, b: number, c: number, d: number) =>
  smoothstep(a, b, p) * (1 - smoothstep(c, d, p));

export interface SceneState {
  burn: number;
  power: number;
  off: number;
  flash: number;
  intensity: number;
  /** 0..1 di dalam beat masing-masing */
  hijack: number;
  face: number;
  confession: number;
  morph: number;
  answer: number;
  /** tema TV aktif */
  tv: boolean;
}

export function sceneAt(p: number): SceneState {
  const burn = smoothstep(BEATS.burn[0], BEATS.burn[1], p);
  const power = smoothstep(BEATS.power[0], BEATS.power[1], p);
  const off = smoothstep(BEATS.off[0], BEATS.off[1], p);
  const flash = bump(p, 0.085, 0.1, 0.1, 0.125) * 0.85;
  const confession = clamp((p - BEATS.confession[0]) / (BEATS.confession[1] - BEATS.confession[0]));
  // Intensitas: dasar rendah, puncak saat pembajakan, getar kecil tiap kalimat
  // pengakuan (ledakan emosi), naik lagi sedikit saat sinyal padam.
  const intensity = clamp(
    0.18 +
      bump(p, 0.1, 0.17, 0.27, 0.36) * 0.82 +
      bump(p, 0.4, 0.43, 0.45, 0.48) * 0.22 +
      bump(p, 0.46, 0.49, 0.51, 0.54) * 0.28 +
      bump(p, 0.52, 0.55, 0.57, 0.6) * 0.4 +
      bump(p, 0.6, 0.64, 0.68, 0.72) * 0.18 +
      smoothstep(0.86, 0.92, p) * 0.35,
  );
  return {
    burn,
    power,
    off,
    flash,
    intensity,
    hijack: clamp((p - BEATS.hijack[0]) / (BEATS.hijack[1] - BEATS.hijack[0])),
    face: smoothstep(0.3, 0.38, p) * (1 - smoothstep(0.58, 0.62, p)),
    confession,
    morph: clamp((p - BEATS.morph[0]) / (BEATS.morph[1] - BEATS.morph[0])),
    answer: clamp((p - BEATS.answer[0]) / (BEATS.answer[1] - BEATS.answer[0])),
    tv: p > 0.045 && p < 0.975,
  };
}
