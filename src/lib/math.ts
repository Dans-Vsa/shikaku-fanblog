export const clamp = (v: number, min = 0, max = 1) => (v < min ? min : v > max ? max : v);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const invLerp = (a: number, b: number, v: number) => clamp((v - a) / (b - a));

export const smoothstep = (a: number, b: number, v: number) => {
  const t = invLerp(a, b, v);
  return t * t * (3 - 2 * t);
};

/** Nilai acak simetris di sekitar 0: jitter(0.1) -> [-0.1, 0.1] */
export const jitter = (amount: number) => (Math.random() * 2 - 1) * amount;

export const randRange = (min: number, max: number) => min + Math.random() * (max - min);

export const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Ambil elemen acak yang berbeda dari indeks sebelumnya agar tidak repetitif. */
export function pickFresh<T>(arr: readonly T[], lastIndex: number): [T, number] {
  if (arr.length < 2) return [arr[0], 0];
  let i = Math.floor(Math.random() * arr.length);
  if (i === lastIndex) i = (i + 1 + Math.floor(Math.random() * (arr.length - 1))) % arr.length;
  return [arr[i], i];
}

/** Interpolasi frame-rate independent: damp(a, b, lambda, dt) */
export const damp = (a: number, b: number, lambda: number, dt: number) =>
  lerp(a, b, 1 - Math.exp(-lambda * dt));

/** Noise 1D halus (value noise) untuk shake yang tidak "bergetar acak kasar". */
export function noise1(x: number, seed = 0): number {
  const i = Math.floor(x);
  const f = x - i;
  const h = (n: number) => {
    const s = Math.sin((n + seed * 57.13) * 127.1) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  };
  const u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u);
}
