import type { Quality } from '@/lib/perf-detect';

export interface CrtQuality {
  /** skala resolusi render relatif ukuran CSS × DPR */
  scale: number;
  /** batas lebar buffer (px) */
  maxWidth: number;
  /** jumlah tap bloom (0 = mati) */
  bloomTaps: number;
  /** pengali kekuatan shadow mask */
  mask: number;
  /** pengali noise */
  noise: number;
}

export const CRT_QUALITY: Record<Quality, CrtQuality> = {
  high: { scale: 1, maxWidth: 1920, bloomTaps: 8, mask: 1, noise: 1 },
  medium: { scale: 0.75, maxWidth: 1440, bloomTaps: 4, mask: 0.8, noise: 0.85 },
  low: { scale: 0.5, maxWidth: 960, bloomTaps: 0, mask: 0, noise: 0.6 },
};

/** Parameter shader (nilai final juga dicatat di docs/DESIGN.md). Diubah live via ?debug=1. */
export const crtParams = {
  curve: 0.085,
  scan: 0.22,
  mask: 0.14,
  aberr: 0.0016,
  noise: 0.11,
  roll: 1,
  jitter: 1,
  tear: 1,
  bloom: 0.7,
  flicker: 1,
  vignette: 0.28,
  /** -1 = ikuti scroll; 0..1 = paksa intensitas */
  intensityOverride: -1,
};

export type CrtParams = typeof crtParams;
