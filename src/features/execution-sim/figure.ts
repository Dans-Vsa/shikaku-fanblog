/**
 * Sprite Yugeru untuk canvas, dibangun dari path SVG yang sama dengan
 * ilustrasi di wiki (Path2D menerima data path SVG). Dirender sekali ke
 * canvas offscreen per tingkat kebosanan, lalu di-blit tiap frame (murah).
 */
const VIEW_W = 200;
const VIEW_H = 400;

const P = {
  cape: 'M100 112 C70 116 52 130 44 160 L16 392 L184 392 L156 160 C148 130 130 116 100 112 Z',
  inner: 'M100 126 L74 392 L126 392 Z',
  collar: 'M58 132 L66 92 L88 120 Z M142 132 L134 92 L112 120 Z',
  neck: 'M90 100 L110 100 L108 122 L92 122 Z',
  hairBack: 'M68 66 C64 110 70 140 74 152 L88 110 L112 110 L126 152 C130 140 136 110 132 66 Z',
  face: 'M78 58 C78 36 122 36 122 58 L120 84 C116 98 106 104 100 104 C94 104 84 98 80 84 Z',
  bangs: 'M74 60 C74 30 126 28 128 62 C118 50 108 48 100 56 C94 48 82 50 74 60 Z',
};

let cache: Record<string, Path2D> | null = null;
function paths() {
  cache ??= Object.fromEntries(Object.entries(P).map(([k, d]) => [k, new Path2D(d)]));
  return cache;
}

export interface FigureSprite {
  canvas: HTMLCanvasElement;
  /** ukuran tampilan (CSS px) */
  w: number;
  h: number;
}

/**
 * Sprite dari desain karakter resmi Yugeru (PNG transparan 3:4). Dipotong ke kotak 1:2
 * di tengah (sosok berada di ~30-70% lebar), lalu dibuat grayscale agar menyatu dengan
 * estetika tinta. Pemotongan tubuh (tebas/ledak) bekerja sama seperti sprite gambar.
 */
export function renderYugeruFromImage(
  img: HTMLImageElement,
  heightPx: number,
  dpr: number,
): FigureSprite {
  const h = heightPx;
  const w = h / 2;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * dpr));
  c.height = Math.max(1, Math.round(h * dpr));
  const ctx = c.getContext('2d')!;
  const srcH = img.height * 0.97;
  const srcW = srcH / 2;
  ctx.filter = 'grayscale(1) contrast(1.15)';
  ctx.drawImage(
    img,
    (img.width - srcW) / 2,
    img.height * 0.02,
    srcW,
    srcH,
    0,
    0,
    c.width,
    c.height,
  );
  return { canvas: c, w, h };
}

export function renderYugeru(
  heightPx: number,
  dpr: number,
  boredom: number,
  colors: { ink: string; paper: string },
): FigureSprite {
  const h = heightPx;
  const w = (h * VIEW_W) / VIEW_H;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * dpr));
  c.height = Math.max(1, Math.round(h * dpr));
  const ctx = c.getContext('2d')!;
  const s = (h * dpr) / VIEW_H;
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const p = paths();

  ctx.fillStyle = colors.ink;
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 3;
  ctx.fill(p.cape);
  // arsir tipis pada jubah (tekstur cetak)
  ctx.save();
  ctx.clip(p.cape);
  ctx.strokeStyle = colors.paper;
  ctx.globalAlpha = 0.16;
  ctx.lineWidth = 1.4;
  for (let y = 110; y < 400; y += 7) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(200, y - 70);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = colors.ink;
  ctx.fill(p.inner);
  ctx.fill(p.collar);
  ctx.fillStyle = colors.paper;
  ctx.fill(p.neck);
  ctx.stroke(p.neck);
  ctx.fillStyle = colors.ink;
  ctx.fill(p.hairBack);
  ctx.fillStyle = colors.paper;
  ctx.fill(p.face);
  ctx.lineWidth = 3;
  ctx.stroke(p.face);
  ctx.fillStyle = colors.ink;
  ctx.fill(p.bangs);

  // mata: kelopak makin turun seiring kebosanan
  const lid = 2 + boredom * 5;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(86, 70 + lid * 0.3);
  ctx.quadraticCurveTo(92, 67 + lid * 0.7, 98, 70 + lid * 0.3);
  ctx.moveTo(104, 70 + lid * 0.3);
  ctx.quadraticCurveTo(110, 67 + lid * 0.7, 116, 70 + lid * 0.3);
  ctx.stroke();
  const ry = Math.max(0.6, 2.6 - boredom * 1.8);
  ctx.beginPath();
  ctx.ellipse(92, 72 + lid * 0.35, 2.4, ry, 0, 0, Math.PI * 2);
  ctx.ellipse(110, 72 + lid * 0.35, 2.4, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  // mulut: datar → sedikit menguap saat sangat bosan
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  if (boredom > 0.8) {
    ctx.ellipse(100, 91, 4, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.moveTo(94, 90 + boredom);
    ctx.quadraticCurveTo(100, 91 - boredom, 106, 90 + boredom);
    ctx.stroke();
  }
  // bros
  ctx.fillStyle = colors.paper;
  ctx.beginPath();
  ctx.arc(100, 128, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.stroke();
  return { canvas: c, w, h };
}
