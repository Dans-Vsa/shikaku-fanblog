import { clamp, smoothstep } from '@/lib/math';

/**
 * Morph partikel tinta antar dua kata kanji.
 * Titik diambil (sample) dari teks yang dirender ke canvas offscreen, lalu tiap
 * partikel bergerak dari glyph A ke glyph B dengan sapuan kiri→kanan seperti kuas.
 * Dipakai di /wiki/kanji (canvas 2D biasa) dan di Babak 5 (dirender ke tekstur shader).
 */
export interface Sampled {
  /** x,y berpasangan, satuan = ukuran font (0,0 = tengah teks) */
  pts: Float32Array;
  count: number;
}

export async function ensureFont(font: string, text: string) {
  try {
    await document.fonts.load(font, text);
  } catch {
    /* font gagal dimuat: fallback serif tetap bisa disample */
  }
}

export function sampleText(text: string, family: string, step = 5, size = 160): Sampled {
  const w = Math.ceil(size * text.length * 1.08);
  const h = Math.ceil(size * 1.25);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px ${family}`;
  ctx.fillText(text, w / 2, h / 2);
  const data = ctx.getImageData(0, 0, w, h).data;
  const out: number[] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const jx = x + ((y / step) % 2) * (step / 2); // grid zig-zag: lebih organik
      const a = data[(y * w + Math.min(w - 1, Math.floor(jx))) * 4 + 3];
      if (a > 120) out.push((jx - w / 2) / size, (y - h / 2) / size);
    }
  }
  return { pts: new Float32Array(out), count: out.length / 2 };
}

/** Urutkan per kolom lalu baris → partikel bertukar posisi secara lokal (刺→資, 客→格). */
function sortedIndices(s: Sampled) {
  const idx = Array.from({ length: s.count }, (_, i) => i);
  idx.sort((a, b) => {
    const ax = Math.round(s.pts[a * 2] * 6);
    const bx = Math.round(s.pts[b * 2] * 6);
    return ax - bx || s.pts[a * 2 + 1] - s.pts[b * 2 + 1];
  });
  return idx;
}

export class KanjiParticles {
  readonly n: number;
  private from: Float32Array;
  private to: Float32Array;
  private seed: Float32Array;
  private minX = 0;
  private spanX = 1;

  constructor(a: Sampled, b: Sampled) {
    this.n = Math.max(a.count, b.count);
    this.from = new Float32Array(this.n * 2);
    this.to = new Float32Array(this.n * 2);
    this.seed = new Float32Array(this.n * 3);
    const ia = sortedIndices(a);
    const ib = sortedIndices(b);
    for (let i = 0; i < this.n; i++) {
      const pa = ia[Math.floor((i / this.n) * a.count)];
      const pb = ib[Math.floor((i / this.n) * b.count)];
      this.from[i * 2] = a.pts[pa * 2];
      this.from[i * 2 + 1] = a.pts[pa * 2 + 1];
      this.to[i * 2] = b.pts[pb * 2];
      this.to[i * 2 + 1] = b.pts[pb * 2 + 1];
      const ang = Math.random() * Math.PI * 2;
      this.seed[i * 3] = Math.cos(ang);
      this.seed[i * 3 + 1] = Math.sin(ang);
      this.seed[i * 3 + 2] = 0.4 + Math.random() * 0.9;
    }
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < this.n; i++) {
      min = Math.min(min, this.from[i * 2]);
      max = Math.max(max, this.from[i * 2]);
    }
    this.minX = min;
    this.spanX = Math.max(0.001, max - min);
  }

  /**
   * Gambar ke ctx. `t` 0..1 progres morph, `scale` px per satuan font,
   * `scatter` besar hamburan tinta di tengah morph, `dot` ukuran partikel (px).
   */
  draw(
    ctx: CanvasRenderingContext2D,
    t: number,
    cx: number,
    cy: number,
    scale: number,
    color: string,
    dot: number,
    scatter = 0.35,
  ) {
    ctx.fillStyle = color;
    const { from, to, seed, n } = this;
    for (let i = 0; i < n; i++) {
      const fx = from[i * 2];
      const xNorm = (fx - this.minX) / this.spanX;
      // sapuan kuas kiri→kanan: partikel kiri berangkat lebih dulu
      const local = smoothstep(0, 1, clamp(t * 1.7 - xNorm * 0.7));
      const bulge = Math.sin(local * Math.PI) * scatter * seed[i * 3 + 2];
      const x = fx + (to[i * 2] - fx) * local + seed[i * 3] * bulge;
      const y =
        from[i * 2 + 1] + (to[i * 2 + 1] - from[i * 2 + 1]) * local + seed[i * 3 + 1] * bulge;
      const s = dot * (1 + bulge * 0.7);
      ctx.fillRect(cx + x * scale - s / 2, cy + y * scale - s / 2, s, s);
    }
  }
}

export const KANJI_FONT = '"Zen Antique", "Yu Mincho", "Hiragino Mincho ProN", serif';

/** Siapkan partikel 刺客 → 資格 (atau pasangan lain). */
export async function createMorph(a = '刺客', b = '資格', step = 5) {
  await ensureFont(`160px ${KANJI_FONT}`, a + b);
  return new KanjiParticles(sampleText(a, KANJI_FONT, step), sampleText(b, KANJI_FONT, step));
}
