export type Quality = 'high' | 'medium' | 'low';

export const QUALITIES: readonly Quality[] = ['high', 'medium', 'low'];

let webglCache: boolean | null = null;

export function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    webglCache = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglCache = false;
  }
  return webglCache;
}

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

/** Tebakan awal dari petunjuk perangkat, sebelum benchmark berjalan. */
export function heuristicQuality(): Quality {
  const nav = navigator as NavigatorHints;
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  if (nav.connection?.saveData) return 'low';
  if (cores <= 2 || mem <= 2) return 'low';
  if (cores <= 4 || mem <= 4 || window.matchMedia('(pointer: coarse)').matches) return 'medium';
  return 'high';
}

/**
 * Ukur median frame time selama `frames` frame. Median tahan terhadap
 * lonjakan tunggal (GC, decode font) di awal load.
 */
export function benchmarkFrameTime(frames = 45): Promise<number> {
  return new Promise((resolve) => {
    const samples: number[] = [];
    let last = performance.now();
    let warm = 8;
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      if (warm > 0) warm--;
      else samples.push(dt);
      if (samples.length >= frames) {
        samples.sort((a, b) => a - b);
        resolve(samples[Math.floor(samples.length / 2)]);
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

export function qualityFromFrameTime(ms: number, heuristic: Quality): Quality {
  const byTime: Quality = ms < 18.5 ? 'high' : ms < 26 ? 'medium' : 'low';
  // Ambil yang paling konservatif dari dua sinyal.
  const rank = (q: Quality) => QUALITIES.indexOf(q);
  return rank(byTime) > rank(heuristic) ? byTime : heuristic;
}

export function downgrade(q: Quality): Quality {
  return q === 'high' ? 'medium' : 'low';
}
