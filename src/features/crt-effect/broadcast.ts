import { KANJI_FONT, type KanjiParticles } from '@/features/kanji-morph/particles';
import { clamp, smoothstep } from '@/lib/math';
import type { SceneState } from './timeline';

export interface BroadcastText {
  channel: string;
  lowerThird: string;
  signalLost: string;
  hijack: string;
  confession: string[];
  answer: string[];
  censored: string;
  morphNote: string;
}

const FG = '#e9fff3';
const DIM = 'rgba(233,255,243,0.55)';
const BG = '#050a08';
const BLOOD = '#ff3340';

/**
 * Menggambar isi siaran ke canvas 2D (sumber tekstur shader).
 * Konten: statis/“sinyal hilang”, wajah Shikaku menangis, teks pengakuan,
 * morph 刺客 → 資格, jawaban Yugeru, lower-third stasiun TV.
 */
export class BroadcastCanvas {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private W = 1;
  private H = 1;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false })!;
  }

  resize(w: number, h: number) {
    this.W = Math.max(2, Math.round(w));
    this.H = Math.max(2, Math.round(h));
    this.canvas.width = this.W;
    this.canvas.height = this.H;
  }

  draw(
    s: SceneState,
    time: number,
    text: BroadcastText,
    censored: boolean,
    morph: KanjiParticles | null,
    /** close-up resmi Shikaku dari Special PV; null = gambar wajah cadangan */
    faceImg: HTMLImageElement | null = null,
  ) {
    const { ctx, W, H } = this;
    // unit relatif; layar potret (HP) diberi skala lebih besar agar teks tetap terbaca
    const u = Math.min(W * 1.45, H * 1.6) / 100;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Kartu warna/test pattern tipis saat baru menyala, lalu pesan pembajakan
    if (s.hijack > 0 && s.hijack < 1) {
      const a = 1 - smoothstep(0.85, 1, s.hijack);
      ctx.globalAlpha = a;
      if (s.hijack < 0.45) {
        this.testBars(a);
        this.label(text.signalLost, W / 2, H * 0.5, u * 6, FG, '700', true);
      } else {
        const blink = Math.floor(time * 3) % 2 === 0 ? 1 : 0.4;
        ctx.globalAlpha = a * blink;
        this.label(text.hijack, W / 2, H * 0.5, u * 4.4, FG, '700', true);
      }
      ctx.globalAlpha = 1;
    }

    // Wajah Shikaku + pengakuan
    if (s.face > 0.001 && faceImg) {
      this.faceImage(faceImg, s.face, time, s.confession);
    } else if (s.face > 0.001) {
      this.face(W / 2, H * 0.33, Math.min(u * 12, W * 0.32, H * 0.17), s.face, time, s.confession);
    }
    if (s.confession > 0 && s.face > 0.05) {
      const lines = censored ? [text.censored] : text.confession;
      const per = 1 / lines.length;
      lines.forEach((line, i) => {
        const a = clamp((s.confession - i * per) / (per * 0.35)) * s.face;
        if (a <= 0) return;
        const last = !censored && i === lines.length - 1;
        // kalimat terakhir = ledakan emosi Shikaku: satu-satunya aksen --blood di siaran
        this.label(
          line,
          W / 2,
          H * (0.66 + i * 0.075),
          u * (last ? 4.6 : 3.2),
          last ? BLOOD : FG,
          '400',
          false,
          a,
        );
      });
    }

    // Morph 刺客 → 資格 di tengah layar
    if (s.morph > 0 && s.morph < 1.0001 && s.answer < 0.2) {
      const appear = smoothstep(0, 0.15, s.morph) * (1 - smoothstep(0.92, 1, s.morph));
      const t = smoothstep(0.15, 0.8, s.morph);
      if (morph) {
        ctx.globalAlpha = appear;
        const scale = Math.min(W / 2.6, H / 1.6);
        morph.draw(ctx, t, W / 2, H * 0.45, scale, FG, Math.max(2, scale / 46), 0.35);
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = appear * (1 - t);
        this.label('刺客', W / 2, H * 0.45, u * 24, FG, '400', false, 1, KANJI_FONT);
        ctx.globalAlpha = appear * t;
        this.label('資格', W / 2, H * 0.45, u * 24, FG, '400', false, 1, KANJI_FONT);
        ctx.globalAlpha = 1;
      }
      this.label(
        text.morphNote,
        W / 2,
        H * 0.82,
        u * 2.6,
        DIM,
        '500',
        false,
        appear * smoothstep(0.6, 0.85, s.morph),
      );
    }

    // Jawaban Yugeru (serif, tenang)
    if (s.answer > 0) {
      const lines = censored ? [text.censored] : text.answer;
      const fade = 1 - smoothstep(0.9, 1, s.answer);
      lines.forEach((line, i) => {
        const a = smoothstep(i * 0.3, i * 0.3 + 0.25, s.answer) * fade;
        this.label(
          line,
          W / 2,
          H * (0.42 + i * 0.13),
          u * (i === lines.length - 1 ? 7 : 5),
          '#ffffff',
          'italic 600',
          false,
          a,
          '"Cormorant Garamond", Georgia, serif',
        );
      });
    }

    // Lower third stasiun TV
    if (s.power > 0.9 && s.hijack > 0.4 && s.face < 0.05) {
      const y = H - u * 9;
      ctx.fillStyle = 'rgba(233,255,243,0.92)';
      ctx.fillRect(u * 5, y, W * 0.42, u * 5);
      ctx.fillStyle = BG;
      ctx.font = `700 ${u * 2.2}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(text.lowerThird, u * 7, y + u * 2.6);
      ctx.textAlign = 'right';
      ctx.fillStyle = FG;
      ctx.fillText(text.channel, W - u * 5, u * 6);
      ctx.textAlign = 'center';
    }
  }

  /** Frame PV resmi sebagai siaran: cover-fit di bagian atas layar, getar kecil saat terisak. */
  private faceImage(img: HTMLImageElement, alpha: number, time: number, sob: number) {
    const { ctx, W, H } = this;
    const boxH = H * 0.62;
    const boxW = Math.min(W * 0.92, boxH * (img.width / img.height));
    const scale = Math.max(boxW / img.width, boxH / img.height);
    const sw = boxW / scale;
    const sh = boxH / scale;
    const shake = Math.sin(time * 9) * H * 0.002 * (0.4 + sob);
    ctx.save();
    // sedikit diredam agar bloom shader tidak membuat wajah terlalu terang
    ctx.globalAlpha = alpha * 0.85;
    ctx.filter = 'brightness(0.82) contrast(1.1)';
    ctx.drawImage(
      img,
      (img.width - sw) / 2,
      (img.height - sh) / 2,
      sw,
      sh,
      (W - boxW) / 2 + shake,
      H * 0.04,
      boxW,
      boxH,
    );
    // tepi memudar ke latar agar menyatu dengan siaran
    const g = ctx.createLinearGradient(0, H * 0.04 + boxH * 0.7, 0, H * 0.04 + boxH);
    g.addColorStop(0, 'rgba(5,10,8,0)');
    g.addColorStop(1, 'rgba(5,10,8,1)');
    ctx.filter = 'none';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.fillRect((W - boxW) / 2 - 2, H * 0.04 + boxH * 0.7, boxW + 4, boxH * 0.3 + 1);
    ctx.restore();
  }

  private label(
    str: string,
    x: number,
    y: number,
    size: number,
    color: string,
    weight: string,
    mono: boolean,
    alpha = 1,
    family?: string,
  ) {
    const { ctx } = this;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px ${family ?? (mono ? '"IBM Plex Mono", monospace' : '"Permanent Marker", cursive')}`;
    // pecah baris otomatis bila terlalu lebar
    const maxW = this.W * 0.86;
    if (ctx.measureText(str).width <= maxW) ctx.fillText(str, x, y);
    else {
      const words = str.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (ctx.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = test;
      }
      lines.push(cur);
      lines.forEach((l, i) => ctx.fillText(l, x, y + (i - (lines.length - 1) / 2) * size * 1.15));
    }
    ctx.globalAlpha = 1;
  }

  private testBars(alpha: number) {
    const { ctx, W, H } = this;
    const shades = [0.9, 0.75, 0.6, 0.45, 0.3, 0.18, 0.08];
    const bw = W / shades.length;
    shades.forEach((s, i) => {
      ctx.globalAlpha = alpha * 0.55;
      ctx.fillStyle = `rgb(${Math.round(s * 233)},${Math.round(s * 255)},${Math.round(s * 243)})`;
      ctx.fillRect(i * bw, 0, bw + 1, H * 0.66);
    });
    ctx.globalAlpha = alpha;
  }

  /** Close-up Shikaku: rambut bob berponi, mata basah, air mata mengalir. */
  private face(cx: number, cy: number, r: number, alpha: number, time: number, sob: number) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    const shake = Math.sin(time * 9) * r * 0.006 * (0.4 + sob);
    ctx.translate(shake, Math.abs(shake) * 0.5);
    // rambut belakang
    ctx.fillStyle = '#0d1512';
    ctx.strokeStyle = FG;
    ctx.lineWidth = r * 0.025;
    ctx.beginPath();
    ctx.moveTo(-r * 1.05, -r * 0.2);
    ctx.bezierCurveTo(-r * 1.15, r * 0.7, -r * 0.9, r * 1.05, -r * 0.6, r * 1.1);
    ctx.lineTo(r * 0.6, r * 1.1);
    ctx.bezierCurveTo(r * 0.9, r * 1.05, r * 1.15, r * 0.7, r * 1.05, -r * 0.2);
    ctx.bezierCurveTo(r * 1.0, -r * 1.25, -r * 1.0, -r * 1.25, -r * 1.05, -r * 0.2);
    ctx.fill();
    ctx.stroke();
    // wajah
    ctx.fillStyle = '#c9d8cf';
    ctx.beginPath();
    ctx.moveTo(-r * 0.78, -r * 0.1);
    ctx.bezierCurveTo(-r * 0.8, r * 0.6, -r * 0.35, r * 0.98, 0, r * 1.0);
    ctx.bezierCurveTo(r * 0.35, r * 0.98, r * 0.8, r * 0.6, r * 0.78, -r * 0.1);
    ctx.bezierCurveTo(r * 0.7, -r * 0.8, -r * 0.7, -r * 0.8, -r * 0.78, -r * 0.1);
    ctx.fill();
    // poni rata
    ctx.fillStyle = '#0d1512';
    ctx.beginPath();
    ctx.moveTo(-r * 0.86, -r * 0.05);
    ctx.bezierCurveTo(-r * 0.9, -r * 1.0, r * 0.9, -r * 1.0, r * 0.86, -r * 0.05);
    for (let i = 0; i <= 8; i++) {
      const x = r * 0.86 - (i / 8) * r * 1.72;
      ctx.lineTo(x, -r * (i % 2 ? 0.1 : 0.2));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // mata: besar, basah, alis turun
    const blink = Math.sin(time * 0.9) > 0.985 ? 0.15 : 1;
    for (const side of [-1, 1]) {
      const ex = side * r * 0.34;
      const ey = r * 0.18;
      ctx.fillStyle = '#0d1512';
      ctx.beginPath();
      ctx.ellipse(ex, ey, r * 0.13, r * 0.17 * blink, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex - r * 0.04, ey - r * 0.06, r * 0.04, 0, Math.PI * 2);
      ctx.arc(ex + r * 0.05, ey + r * 0.05, r * 0.02, 0, Math.PI * 2);
      ctx.fill();
      // alis sedih
      ctx.strokeStyle = '#0d1512';
      ctx.lineWidth = r * 0.04;
      ctx.beginPath();
      ctx.moveTo(ex - side * r * 0.14, ey - r * 0.32);
      ctx.lineTo(ex + side * r * 0.12, ey - r * 0.24);
      ctx.stroke();
      // air mata mengalir (animasi)
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (let k = 0; k < 3; k++) {
        const ph = (time * 0.8 + k / 3 + (side > 0 ? 0.5 : 0)) % 1;
        const ty = ey + r * 0.18 + ph * r * 0.75;
        ctx.globalAlpha = alpha * (1 - ph) * (0.4 + sob);
        ctx.beginPath();
        ctx.ellipse(ex + side * r * 0.03, ty, r * 0.025, r * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = alpha;
    }
    // mulut bergetar
    ctx.strokeStyle = '#0d1512';
    ctx.lineWidth = r * 0.04;
    ctx.beginPath();
    const mw = r * (0.16 + sob * 0.06);
    ctx.moveTo(-mw, r * 0.66);
    for (let i = 1; i <= 6; i++) {
      ctx.lineTo(
        -mw + (i / 6) * mw * 2,
        r * 0.66 + (i % 2 ? -1 : 1) * r * 0.03 * (0.5 + Math.sin(time * 14 + i)),
      );
    }
    ctx.stroke();
    // kerah pelaut
    ctx.fillStyle = '#0d1512';
    ctx.beginPath();
    ctx.moveTo(-r * 1.2, r * 1.6);
    ctx.lineTo(-r * 0.5, r * 1.0);
    ctx.lineTo(0, r * 1.45);
    ctx.lineTo(r * 0.5, r * 1.0);
    ctx.lineTo(r * 1.2, r * 1.6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = FG;
    ctx.lineWidth = r * 0.02;
    ctx.beginPath();
    ctx.moveTo(-r * 0.42, r * 1.08);
    ctx.lineTo(0, r * 1.36);
    ctx.lineTo(r * 0.42, r * 1.08);
    ctx.stroke();
    ctx.restore();
  }
}
