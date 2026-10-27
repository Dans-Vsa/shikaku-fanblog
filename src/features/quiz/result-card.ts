/**
 * Generator kartu hasil kuis (canvas 2D → PNG). Semua digambar sendiri:
 * kertas, bingkai panel, kanji besar, teks. Tanpa aset eksternal.
 */
export interface CardData {
  name: string;
  jp: string;
  tagline: string;
  body: string;
  scoreS: number;
  scoreY: number;
  title: string;
  footer: string;
}

const W = 1080;
const H = 1350;

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lh;
    } else line = test;
  }
  ctx.fillText(line, x, yy);
  return yy + lh;
}

export async function renderResultCard(d: CardData): Promise<Blob> {
  await Promise.all(
    [
      '400 220px "Zen Antique"',
      '400 80px "Permanent Marker"',
      'italic 500 44px "Cormorant Garamond"',
      '500 36px "Cormorant Garamond"',
      '500 26px "IBM Plex Mono"',
    ].map((f) => document.fonts.load(f, d.jp + d.name).catch(() => undefined)),
  );
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const ink = '#141210';
  const paper = '#efe8da';

  // kertas + serat acak
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(60,48,30,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, Math.random() * 3, Math.random() * 1.4);
  }
  // halftone sudut
  ctx.fillStyle = 'rgba(20,18,16,0.18)';
  for (let y = 0; y < 360; y += 14) {
    for (let x = W - 360; x < W; x += 14) {
      const r = ((x - (W - 360)) / 360) * ((360 - y) / 360) * 5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // bingkai panel miring
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.012);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 12;
  ctx.strokeRect(-W / 2 + 60, -H / 2 + 60, W - 120, H - 120);
  ctx.restore();

  ctx.fillStyle = ink;
  ctx.textBaseline = 'alphabetic';
  ctx.font = '500 26px "IBM Plex Mono", monospace';
  ctx.fillText(d.title.toUpperCase(), 110, 150);

  ctx.font = '400 260px "Zen Antique", serif';
  ctx.fillText(d.jp, 100, 440);

  ctx.font = '400 92px "Permanent Marker", cursive';
  ctx.fillText(d.name, 110, 590);

  ctx.font = 'italic 500 46px "Cormorant Garamond", serif';
  let y = wrap(ctx, d.tagline, 110, 670, W - 220, 56);

  ctx.font = '500 36px "Cormorant Garamond", serif';
  y = wrap(ctx, d.body, 110, y + 30, W - 220, 48);

  // meter Shikaku ↔ Yugeru
  const total = Math.max(1, d.scoreS + d.scoreY);
  const by = Math.max(y + 40, 1040);
  ctx.font = '500 24px "IBM Plex Mono", monospace';
  ctx.fillText('SHIKAKU', 110, by);
  ctx.textAlign = 'right';
  ctx.fillText('YUGERU', W - 110, by);
  ctx.textAlign = 'left';
  ctx.lineWidth = 6;
  ctx.strokeRect(110, by + 20, W - 220, 40);
  ctx.fillRect(110, by + 20, (W - 220) * (d.scoreS / total), 40);

  ctx.font = '500 24px "IBM Plex Mono", monospace';
  ctx.fillText(d.footer.toUpperCase(), 110, H - 110);

  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob gagal'))), 'image/png'),
  );
}
