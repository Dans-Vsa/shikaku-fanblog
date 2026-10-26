import { duckAudio, playSfx, setAmbience } from '@/lib/audio-bridge';
import { clamp, damp, lerp, pickFresh, randRange } from '@/lib/math';
import type { Quality } from '@/lib/perf-detect';
import { renderYugeru, type FigureSprite } from './figure';
import { P_BLOOD, P_INK, P_SHELL, P_SMOKE, P_SPARK, ParticlePool } from './particles';
import { Trauma } from './shake';

export type Weapon = 'shoot' | 'slash' | 'explode';
type Phase = 'idle' | 'damaged' | 'breath' | 'regen' | 'complain';
type Damage = 'none' | 'shot' | 'slash' | 'explode';

export interface SimProgress {
  attempts: number;
  boredom: number;
  unlocked: Record<Weapon, boolean>;
  ready: boolean;
}

export interface SimEvents {
  onComplaint: (text: string) => void;
  onProgress: (p: SimProgress) => void;
  onUnlock: (w: Weapon) => void;
  onWeapon: (w: Weapon) => void;
}

export interface SimOptions {
  reduced: boolean;
  quality: Quality;
  complaints: string[][];
}

interface Hole {
  x: number;
  y: number;
  r: number;
}
interface Frag {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  va: number;
  ox: number;
  oy: number;
  oa: number;
}
interface Tracer {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
}
interface Stroke {
  pts: { x: number; y: number }[];
  hit: boolean;
  life: number;
}

/** Durasi fase (ms) per jenis kerusakan: [rusak, tahan napas, pulih] */
const TIMING: Record<Exclude<Damage, 'none'>, [number, number, number]> = {
  shot: [230, 360, 300],
  slash: [620, 520, 430],
  explode: [1150, 680, 560],
};
const SEVERITY: Record<Damage, number> = { none: 0, shot: 1, slash: 2, explode: 3 };
const COMPLAIN_MS = 2100;
const HIT_STOP = { shot: 45, slash: 75, explode: 90 };

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* diabaikan */
    }
  }
}

/**
 * Mesin simulasi "Eksekusi Target". SATU loop requestAnimationFrame, SATU canvas.
 * Input diproses sinkron di handler pointer: state + suara + render terjadi
 * di frame yang sama dengan input (nol input lag).
 */
export class ExecutionEngine {
  private ctx: CanvasRenderingContext2D;
  private W = 0;
  private H = 0;
  private dpr = 1;
  private raf = 0;
  private running = false;
  private visible = false;
  private last = 0;
  private time = 0;

  private colors = { ink: '#141210', paper: '#efe8da', blood: '#b3121b' };
  private bg: HTMLCanvasElement | null = null;
  private ruinLayer: HTMLCanvasElement | null = null;
  private sprite: FigureSprite | null = null;
  private spriteBoredom = -1;
  private fig = { cx: 0, footY: 0, h: 0, w: 0, left: 0, top: 0 };

  private particles: ParticlePool;
  private trauma = new Trauma();
  private hitStop = 0;
  private slowMo = 0;
  private timeScale = 1;
  private impactFrame = 0;

  private phase: Phase = 'idle';
  private phaseT = 0;
  private damage: Damage = 'none';
  private holes: Hole[] = [];
  private cut = { px: 0, py: 0, angle: 0, sep: 0, max: 30 };
  private frags: Frag[] = [];
  private ruin = 0;
  private flash = 0;
  private shock: { x: number; y: number; t: number } | null = null;
  private tracers: Tracer[] = [];
  private wallHoles: { x: number; y: number }[] = [];
  private muzzle = [0, 0];
  private recoil = [0, 0];
  private nextGun = 0;
  private stroke: Stroke | null = null;
  private trails: Stroke[] = [];
  private cross = { x: -100, y: -100, visible: false, spread: 0, kick: 0 };

  private weapon: Weapon = 'shoot';
  private unlocked: Record<Weapon, boolean> = { shoot: true, slash: false, explode: false };
  private attempts = 0;
  private slashes = 0;
  private explosions = 0;
  private lastComplaint = -1;
  private ready = false;

  private down: {
    id: number;
    x: number;
    y: number;
    t: number;
    moved: boolean;
    touch: boolean;
  } | null = null;
  private longPress = 0;
  private activePointers = new Set<number>();

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: SimOptions,
    private events: SimEvents,
  ) {
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.particles = new ParticlePool(this.capFor(opts.quality));
    this.readColors();
    canvas.addEventListener('pointerdown', this.onDown);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerup', this.onUp);
    canvas.addEventListener('pointercancel', this.onUp);
    canvas.addEventListener('pointerleave', this.onLeave);
    canvas.addEventListener('contextmenu', this.onContext);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  // ------------------------------------------------------------------ lifecycle

  destroy() {
    this.stop();
    window.clearTimeout(this.longPress);
    const c = this.canvas;
    c.removeEventListener('pointerdown', this.onDown);
    c.removeEventListener('pointermove', this.onMove);
    c.removeEventListener('pointerup', this.onUp);
    c.removeEventListener('pointercancel', this.onUp);
    c.removeEventListener('pointerleave', this.onLeave);
    c.removeEventListener('contextmenu', this.onContext);
    document.removeEventListener('visibilitychange', this.onVisibility);
    setAmbience('none');
    this.bg = null;
    this.ruinLayer = null;
    this.sprite = null;
  }

  setVisible(v: boolean) {
    this.visible = v;
    setAmbience(v ? 'hush' : 'none');
    if (v && document.visibilityState === 'visible') this.start();
    else this.stop();
  }

  setOptions(o: Partial<SimOptions>) {
    const qualityChanged = o.quality && o.quality !== this.opts.quality;
    this.opts = { ...this.opts, ...o };
    if (qualityChanged) {
      this.particles = new ParticlePool(this.capFor(this.opts.quality));
      this.resize(this.W, this.H);
    }
    if (this.opts.reduced) this.trauma.value = 0;
  }

  setWeapon(w: Weapon) {
    if (!this.unlocked[w]) return;
    this.weapon = w;
    this.events.onWeapon(w);
    playSfx('tick');
  }

  reset() {
    this.attempts = 0;
    this.slashes = 0;
    this.explosions = 0;
    this.unlocked = { shoot: true, slash: false, explode: false };
    this.ready = false;
    this.weapon = 'shoot';
    this.events.onWeapon('shoot');
    this.clearDamage();
    this.phase = 'idle';
    this.wallHoles = [];
    this.ruin = 0;
    this.emitProgress();
    this.render();
  }

  resize(w: number, h: number) {
    if (w <= 0 || h <= 0) return;
    const q = this.opts.quality;
    const dprMax = q === 'high' ? 2 : q === 'medium' ? 1.5 : 1;
    this.dpr = Math.min(dprMax, window.devicePixelRatio || 1);
    this.W = w;
    this.H = h;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    const figH = Math.min(h * 0.74, w * 0.9);
    this.fig.h = figH;
    this.fig.w = figH / 2;
    this.fig.cx = w * 0.5;
    this.fig.footY = h * 0.9;
    this.fig.left = this.fig.cx - this.fig.w / 2;
    this.fig.top = this.fig.footY - figH;
    this.readColors();
    this.bg = this.buildBackground();
    this.ruinLayer = this.buildRuin();
    this.spriteBoredom = -1;
    this.ensureSprite();
    this.render();
  }

  private start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private onVisibility = () => {
    if (document.visibilityState === 'visible' && this.visible) this.start();
    else this.stop();
  };

  private capFor(q: Quality) {
    return q === 'high' ? 520 : q === 'medium' ? 300 : 160;
  }

  private readColors() {
    const cs = getComputedStyle(document.documentElement);
    this.colors = {
      ink: cs.getPropertyValue('--ink').trim() || '#141210',
      paper: cs.getPropertyValue('--paper').trim() || '#efe8da',
      blood: cs.getPropertyValue('--blood').trim() || '#b3121b',
    };
  }

  private get boredom() {
    return clamp(this.attempts / 14);
  }

  private ensureSprite() {
    const b = Math.round(this.boredom * 4) / 4;
    if (b === this.spriteBoredom && this.sprite) return;
    this.spriteBoredom = b;
    this.sprite = renderYugeru(this.fig.h, this.dpr, b, this.colors);
  }

  // ------------------------------------------------------------------ input

  private local(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private onContext = (e: Event) => e.preventDefault();

  private onDown = (e: PointerEvent) => {
    e.preventDefault();
    // preventDefault mencegah fokus otomatis: fokuskan stage agar tombol 1/2/3/Spasi langsung bekerja
    this.canvas.parentElement?.focus({ preventScroll: true });
    this.canvas.setPointerCapture(e.pointerId);
    this.activePointers.add(e.pointerId);
    const p = this.local(e);
    const touch = e.pointerType !== 'mouse';
    this.cross.x = p.x;
    this.cross.y = p.y;
    this.cross.visible = !touch;

    // dua jari = ledakan
    if (touch && this.activePointers.size >= 2 && this.unlocked.explode) {
      this.explode();
      return;
    }
    if (e.button === 2) {
      if (this.unlocked.slash) this.slashVertical(p.x);
      return;
    }
    this.down = { id: e.pointerId, x: p.x, y: p.y, t: performance.now(), moved: false, touch };

    if (this.weapon === 'shoot') {
      this.shoot(p.x, p.y);
      if (touch && this.unlocked.slash) {
        window.clearTimeout(this.longPress);
        this.longPress = window.setTimeout(() => {
          if (this.down && !this.down.moved) this.slashVertical(this.down.x);
        }, 380);
      }
    } else if (this.weapon === 'slash') {
      this.stroke = { pts: [p], hit: false, life: 1 };
    } else {
      this.explode();
    }
  };

  private onMove = (e: PointerEvent) => {
    const p = this.local(e);
    if (e.pointerType === 'mouse') {
      this.cross.x = p.x;
      this.cross.y = p.y;
      this.cross.visible = true;
    }
    const d = this.down;
    if (!d || d.id !== e.pointerId) return;
    const dist = Math.hypot(p.x - d.x, p.y - d.y);
    if (dist > 12) d.moved = true;
    // swipe cepat dalam mode tembak = tebasan (bila sudah terbuka)
    if (
      !this.stroke &&
      this.weapon === 'shoot' &&
      this.unlocked.slash &&
      dist > 50 &&
      performance.now() - d.t < 320
    ) {
      this.stroke = { pts: [{ x: d.x, y: d.y }], hit: false, life: 1 };
    }
    if (this.stroke) {
      const s = this.stroke;
      const prev = s.pts[s.pts.length - 1];
      s.pts.push(p);
      if (s.pts.length > 48) s.pts.shift();
      if (!s.hit && this.segmentHitsFigure(prev.x, prev.y, p.x, p.y)) {
        s.hit = true;
        const first = s.pts[0];
        this.slash(first.x, first.y, p.x, p.y, (prev.x + p.x) / 2, (prev.y + p.y) / 2);
        this.render();
      }
    }
  };

  private onUp = (e: PointerEvent) => {
    this.activePointers.delete(e.pointerId);
    window.clearTimeout(this.longPress);
    if (this.stroke) {
      const s = this.stroke;
      const a = s.pts[0];
      const b = s.pts[s.pts.length - 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      // ketukan tanpa seretan dalam mode tebas = tebasan vertikal di titik itu
      if (!s.hit && len < 12 && this.weapon === 'slash') {
        this.stroke = null;
        this.slashVertical(a.x);
        if (this.down?.id === e.pointerId) this.down = null;
        return;
      }
      if (!s.hit && len > 40) playSfx('slash', { volume: 0.35 });
      if (s.pts.length > 1) this.trails.push({ ...s, life: 1 });
      this.stroke = null;
    }
    if (this.down?.id === e.pointerId) this.down = null;
    if (e.pointerType !== 'mouse') this.cross.visible = false;
  };

  private onLeave = () => {
    this.cross.visible = false;
  };

  /** Serangan keyboard: dibidik ke tengah target. */
  fireKeyboard(w: Weapon = this.weapon) {
    if (!this.unlocked[w]) return;
    const cx = this.fig.cx + randRange(-8, 8);
    const cy = this.fig.top + this.fig.h * randRange(0.25, 0.6);
    if (w === 'shoot') this.shoot(cx, cy);
    else if (w === 'slash') this.slashVertical(cx, true);
    else this.explode();
  }

  // ------------------------------------------------------------------ attacks

  private shoot(x: number, y: number) {
    const gun = this.nextGun;
    this.nextGun = 1 - gun;
    const mx = gun === 0 ? this.W * 0.1 : this.W * 0.9;
    const my = this.H * 0.97;
    this.tracers.push({ x1: mx, y1: my - 34, x2: x, y2: y, life: 90 });
    this.muzzle[gun] = 1;
    this.recoil[gun] = 1;
    this.cross.spread = 1;
    this.cross.kick = 1;
    this.particles.spawn(
      P_SHELL,
      mx + (gun === 0 ? 20 : -20),
      my - 40,
      gun === 0 ? randRange(60, 160) : -randRange(60, 160),
      -randRange(260, 380),
      900,
      4,
      1400,
      randRange(-14, 14),
    );
    playSfx('shot');
    vibrate(12);
    if (!this.opts.reduced) this.trauma.add(0.16);

    if (this.pointHitsFigure(x, y)) {
      this.hitStop = Math.max(this.hitStop, HIT_STOP.shot);
      const ang = Math.atan2(y - my, x - mx);
      for (let i = 0; i < 10; i++) {
        const a = ang + randRange(-0.7, 0.7);
        const sp = randRange(140, 420);
        this.particles.spawn(
          P_INK,
          x,
          y,
          Math.cos(a) * sp,
          Math.sin(a) * sp,
          randRange(300, 650),
          randRange(3, 7),
          900,
          randRange(-12, 12),
        );
      }
      if (this.damage === 'none' || this.damage === 'shot') {
        this.holes.push({ x: x - this.fig.left, y: y - this.fig.top, r: randRange(5, 8) });
        if (this.holes.length > 14) this.holes.shift();
      }
      this.registerAttempt('shot');
    } else {
      this.wallHoles.push({ x, y });
      if (this.wallHoles.length > 26) this.wallHoles.shift();
      for (let i = 0; i < 6; i++) {
        this.particles.spawn(
          P_SPARK,
          x,
          y,
          randRange(-260, 260),
          randRange(-320, 60),
          randRange(120, 260),
          5,
          800,
        );
      }
    }
    this.render();
  }

  private slashVertical(x: number, centered = false) {
    const top = this.fig.top + this.fig.h * 0.05;
    const bottom = this.fig.top + this.fig.h * 0.95;
    const tilt = centered ? 0.35 : randRange(-0.5, 0.5);
    const x1 = x - tilt * this.fig.h * 0.5;
    const x2 = x + tilt * this.fig.h * 0.5;
    if (!this.segmentHitsFigure(x1, top, x2, bottom)) {
      playSfx('slash', { volume: 0.35 });
      this.trails.push({
        pts: [
          { x: x1, y: top },
          { x: x2, y: bottom },
        ],
        hit: false,
        life: 1,
      });
      return;
    }
    this.trails.push({
      pts: [
        { x: x1, y: top },
        { x: x2, y: bottom },
      ],
      hit: true,
      life: 1,
    });
    this.slash(x1, top, x2, bottom, (x1 + x2) / 2, this.fig.top + this.fig.h * 0.45);
    this.render();
  }

  private slash(x1: number, y1: number, x2: number, y2: number, hx: number, hy: number) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    this.cut = {
      px: hx - this.fig.left,
      py: hy - this.fig.top,
      angle,
      sep: 0,
      max: randRange(26, 40),
    };
    this.hitStop = Math.max(this.hitStop, HIT_STOP.slash);
    this.impactFrame = this.opts.reduced ? 0 : 2;
    if (!this.opts.reduced) this.trauma.add(0.42);
    playSfx('slash');
    vibrate([18, 30, 40]);
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    for (let i = 0; i < 26; i++) {
      const t = randRange(-0.5, 0.5);
      const px = hx + Math.cos(angle) * t * this.fig.h * 0.6;
      const py = hy + Math.sin(angle) * t * this.fig.h * 0.6;
      const side = Math.random() < 0.5 ? -1 : 1;
      const sp = randRange(120, 380);
      this.particles.spawn(
        P_INK,
        px,
        py,
        nx * sp * side + randRange(-60, 60),
        ny * sp * side - 120,
        randRange(400, 900),
        randRange(3, 8),
        1100,
        randRange(-14, 14),
      );
    }
    this.slashes++;
    this.holes = [];
    this.frags = [];
    this.registerAttempt('slash');
  }

  private explode() {
    if (!this.unlocked.explode) return;
    const { left, top, w, h } = this.fig;
    const cols = 4;
    const rows = 8;
    const ex = this.fig.cx;
    const ey = top + h * 0.7;
    this.frags = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = (c / cols) * w;
        const sy = (r / rows) * h;
        const fx = left + sx + w / cols / 2;
        const fy = top + sy + h / rows / 2;
        const ang = Math.atan2(fy - ey, fx - ex) + randRange(-0.4, 0.4);
        const sp = randRange(380, 900);
        this.frags.push({
          sx,
          sy,
          sw: w / cols,
          sh: h / rows,
          x: 0,
          y: 0,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - 260,
          a: 0,
          va: randRange(-9, 9),
          ox: 0,
          oy: 0,
          oa: 0,
        });
      }
    }
    this.holes = [];
    this.cut.sep = 0;
    this.ruin = 1;
    this.flash = this.opts.reduced ? 0.25 : 1;
    this.impactFrame = this.opts.reduced ? 0 : 3;
    this.shock = { x: ex, y: ey, t: 0 };
    this.hitStop = Math.max(this.hitStop, HIT_STOP.explode);
    if (!this.opts.reduced) {
      this.trauma.add(0.95);
      this.slowMo = 700;
    }
    for (let i = 0; i < 16; i++) {
      const a = randRange(0, Math.PI * 2);
      const sp = randRange(60, 260);
      this.particles.spawn(
        P_SMOKE,
        ex + randRange(-40, 40),
        ey + randRange(-60, 20),
        Math.cos(a) * sp,
        Math.sin(a) * sp - 80,
        randRange(900, 1800),
        randRange(18, 40),
      );
    }
    for (let i = 0; i < 46; i++) {
      const a = randRange(-Math.PI, 0);
      const sp = randRange(300, 1100);
      this.particles.spawn(
        i % 3 ? P_INK : P_SPARK,
        ex,
        ey,
        Math.cos(a) * sp,
        Math.sin(a) * sp,
        randRange(500, 1400),
        randRange(3, 12),
        1500,
        randRange(-18, 18),
      );
    }
    playSfx('explosion');
    vibrate([60, 40, 120]);
    this.explosions++;
    this.registerAttempt('explode');
    this.render();
  }

  private registerAttempt(kind: Exclude<Damage, 'none'>) {
    this.attempts++;
    const inSequence =
      this.phase === 'damaged' || this.phase === 'breath' || this.phase === 'regen';
    // kerusakan yang lebih berat selalu menang; tembakan saat tubuh terbelah tidak "menyembuhkan"
    if (!inSequence || SEVERITY[kind] >= SEVERITY[this.damage]) this.damage = kind;
    if (this.phase === 'complain' || this.phase === 'idle') this.events.onComplaint('');
    this.phase = 'damaged';
    this.phaseT = 0;

    if (!this.unlocked.slash && this.attempts >= 4) {
      this.unlocked.slash = true;
      this.events.onUnlock('slash');
    }
    if (!this.unlocked.explode && (this.slashes >= 2 || this.attempts >= 10)) {
      this.unlocked.explode = true;
      this.events.onUnlock('explode');
    }
    if (!this.ready && ((this.attempts >= 12 && this.explosions >= 1) || this.attempts >= 18))
      this.ready = true;
    this.ensureSprite();
    this.emitProgress();
  }

  private emitProgress() {
    this.events.onProgress({
      attempts: this.attempts,
      boredom: this.boredom,
      unlocked: { ...this.unlocked },
      ready: this.ready,
    });
  }

  private clearDamage() {
    this.damage = 'none';
    this.holes = [];
    this.frags = [];
    this.cut.sep = 0;
  }

  // ------------------------------------------------------------------ geometry

  private pointHitsFigure(x: number, y: number) {
    const { cx, top, h, w } = this.fig;
    const ey = top + h * 0.52;
    const dx = (x - cx) / (w * 0.46);
    const dy = (y - ey) / (h * 0.49);
    return dx * dx + dy * dy <= 1;
  }

  private segmentHitsFigure(x1: number, y1: number, x2: number, y2: number) {
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      if (this.pointHitsFigure(lerp(x1, x2, t), lerp(y1, y2, t))) return true;
    }
    return false;
  }

  // ------------------------------------------------------------------ loop

  private loop = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    const raw = Math.min(50, now - this.last);
    this.last = now;
    this.update(raw);
    this.render();
  };

  private update(raw: number) {
    this.time += raw;
    // sistem real-time (tidak ikut beku): shake, crosshair, flash, efek
    this.trauma.update(raw);
    this.cross.spread = damp(this.cross.spread, 0, 9, raw / 1000);
    this.cross.kick = damp(this.cross.kick, 0, 14, raw / 1000);
    this.flash = Math.max(0, this.flash - raw / 260);
    for (let g = 0; g < 2; g++) {
      this.muzzle[g] = Math.max(0, this.muzzle[g] - raw / 70);
      this.recoil[g] = damp(this.recoil[g], 0, 12, raw / 1000);
    }

    let dt: number;
    if (this.hitStop > 0) {
      this.hitStop -= raw;
      dt = 0;
    } else {
      if (this.slowMo > 0) {
        this.slowMo -= raw;
        this.timeScale = lerp(1, 0.28, clamp(this.slowMo / 500));
      } else this.timeScale = 1;
      dt = raw * this.timeScale;
    }
    if (dt === 0) return;

    this.particles.update(dt, this.fig.footY + 6);
    this.tracers = this.tracers.filter((t) => (t.life -= dt) > 0);
    this.trails = this.trails.filter((t) => (t.life -= dt / 380) > 0);
    if (this.shock) {
      this.shock.t += dt / 650;
      if (this.shock.t >= 1) this.shock = null;
    }
    this.updatePhase(dt);
  }

  private updatePhase(dt: number) {
    if (this.phase === 'idle') return;
    this.phaseT += dt;
    const [tDamaged, tBreath, tRegen] = this.damage === 'none' ? [0, 0, 0] : TIMING[this.damage];

    if (this.phase === 'damaged') {
      if (this.damage === 'slash')
        this.cut.sep = easeOutCubic(clamp(this.phaseT / 280)) * this.cut.max;
      if (this.damage === 'explode') this.stepFrags(dt);
      if (this.phaseT >= tDamaged) this.enter('breath');
    } else if (this.phase === 'breath') {
      if (this.damage === 'explode') this.stepFrags(dt);
      if (this.phaseT >= tBreath) this.enter('regen');
    } else if (this.phase === 'regen') {
      const t = clamp(this.phaseT / tRegen);
      const e = easeOutBack(t);
      if (this.damage === 'slash') this.cut.sep = this.cut.max * (1 - e);
      if (this.damage === 'explode') {
        for (const f of this.frags) {
          f.x = f.ox * (1 - e);
          f.y = f.oy * (1 - e);
          f.a = f.oa * (1 - e);
        }
      }
      for (const h of this.holes) h.r = Math.max(0, h.r * (1 - t * 0.2));
      this.ruin = Math.max(0, this.ruin - dt / 900);
      if (t >= 1) this.enter('complain');
    } else if (this.phase === 'complain') {
      this.ruin = Math.max(0, this.ruin - dt / 900);
      if (this.phaseT >= COMPLAIN_MS) this.enter('idle');
    }
  }

  private stepFrags(dt: number) {
    const s = dt / 1000;
    const floor = this.fig.footY - this.fig.top;
    for (const f of this.frags) {
      f.vy += 1800 * s;
      f.x += f.vx * s;
      f.y += f.vy * s;
      f.a += f.va * s;
      const bottom = f.sy + f.sh / 2 + f.y;
      if (bottom > floor) {
        f.y = floor - f.sy - f.sh / 2;
        f.vy *= -0.3;
        f.vx *= 0.55;
        f.va *= 0.5;
      }
      f.vx *= 1 - 0.6 * s;
    }
  }

  private enter(next: Phase) {
    this.phase = next;
    this.phaseT = 0;
    if (next === 'breath') {
      // tahan satu napas: dunia diam, audio diredam
      const tBreath = this.damage === 'none' ? 300 : TIMING[this.damage][1];
      duckAudio(tBreath / 1000, 0.04);
    } else if (next === 'regen') {
      for (const f of this.frags) {
        f.ox = f.x;
        f.oy = f.y;
        f.oa = f.a;
      }
      this.bloodBurst();
      playSfx('regen');
    } else if (next === 'complain') {
      this.clearDamage();
      const tier = this.boredom < 0.34 ? 0 : this.boredom < 0.7 ? 1 : 2;
      const pool = this.opts.complaints[tier] ?? this.opts.complaints[0];
      if (pool?.length) {
        const [text, idx] = pickFresh(pool, this.lastComplaint);
        this.lastComplaint = idx;
        this.events.onComplaint(text);
      }
    } else if (next === 'idle') {
      this.events.onComplaint('');
    }
  }

  /** Percikan merah — SATU-SATUNYA tempat --blood dipakai di simulasi. */
  private bloodBurst() {
    const { left, top, w, h } = this.fig;
    const origins: { x: number; y: number }[] = [];
    if (this.damage === 'shot')
      this.holes.forEach((hl) => origins.push({ x: left + hl.x, y: top + hl.y }));
    else if (this.damage === 'slash') origins.push({ x: left + this.cut.px, y: top + this.cut.py });
    else
      this.frags.forEach(
        (f, i) =>
          i % 3 === 0 &&
          origins.push({ x: left + f.sx + f.sw / 2 + f.x, y: top + f.sy + f.sh / 2 + f.y }),
      );
    if (!origins.length) origins.push({ x: left + w / 2, y: top + h / 2 });
    const per = Math.max(3, Math.floor(36 / origins.length));
    for (const o of origins) {
      for (let i = 0; i < per; i++) {
        const a = randRange(0, Math.PI * 2);
        const sp = randRange(80, 340);
        this.particles.spawn(
          P_BLOOD,
          o.x,
          o.y,
          Math.cos(a) * sp,
          Math.sin(a) * sp - 120,
          randRange(260, 620),
          randRange(2, 5.5),
          900,
        );
      }
    }
  }

  // ------------------------------------------------------------------ render

  render() {
    const ctx = this.ctx;
    const { W, H, dpr } = this;
    if (!W || !H) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    ctx.save();
    if (!this.opts.reduced) {
      const s = this.trauma.sample();
      ctx.translate(W / 2 + s.x, H / 2 + s.y);
      ctx.rotate(s.angle);
      ctx.translate(-W / 2, -H / 2);
    }
    if (this.bg) ctx.drawImage(this.bg, 0, 0, W, H);
    else {
      ctx.fillStyle = this.colors.paper;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.ruin > 0 && this.ruinLayer) {
      ctx.globalAlpha = this.ruin;
      ctx.drawImage(this.ruinLayer, 0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    this.drawWallHoles(ctx);
    this.drawFigure(ctx);
    this.particles.draw(ctx, this.colors);
    this.drawTracers(ctx);
    this.drawTrails(ctx);
    this.drawShock(ctx);
    this.drawGuns(ctx);
    ctx.restore();

    // impact frame manga: negatif sesaat saat hit-stop serangan berat
    if (this.impactFrame > 0 && this.hitStop > 0) {
      ctx.globalCompositeOperation = 'difference';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      this.impactFrame--;
    }
    if (this.flash > 0) {
      ctx.globalAlpha = this.flash;
      ctx.fillStyle = this.colors.paper;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    this.drawCrosshair(ctx);
  }

  private buildBackground() {
    const { W, H, dpr } = this;
    const c = document.createElement('canvas');
    c.width = Math.round(W * dpr);
    c.height = Math.round(H * dpr);
    const g = c.getContext('2d')!;
    g.scale(dpr, dpr);
    const { ink, paper } = this.colors;
    g.fillStyle = paper;
    g.fillRect(0, 0, W, H);
    // jendela lengkung gotik
    const floor = this.fig.footY;
    const winW = Math.min(110, W * 0.12);
    const winH = floor * 0.62;
    const gap = W / 4;
    g.lineWidth = 3;
    g.strokeStyle = ink;
    for (let i = 0; i < 3; i++) {
      const x = gap * (i + 1) - winW / 2;
      const y = floor * 0.12;
      g.beginPath();
      g.moveTo(x, y + winH);
      g.lineTo(x, y + winW / 2);
      g.arc(x + winW / 2, y + winW / 2, winW / 2, Math.PI, 0);
      g.lineTo(x + winW, y + winH);
      g.closePath();
      g.globalAlpha = 0.09;
      g.fillStyle = ink;
      g.fill();
      g.globalAlpha = 0.6;
      g.stroke();
      g.globalAlpha = 0.35;
      g.beginPath();
      g.moveTo(x + winW / 2, y);
      g.lineTo(x + winW / 2, y + winH);
      for (let k = 1; k < 4; k++) {
        g.moveTo(x, y + winW / 2 + (winH - winW / 2) * (k / 4));
        g.lineTo(x + winW, y + winW / 2 + (winH - winW / 2) * (k / 4));
      }
      g.stroke();
    }
    g.globalAlpha = 1;
    // lantai + garis perspektif
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(0, floor);
    g.lineTo(W, floor);
    g.stroke();
    g.lineWidth = 1.2;
    g.globalAlpha = 0.25;
    for (let i = -6; i <= 6; i++) {
      g.beginPath();
      g.moveTo(W / 2 + i * 30, floor);
      g.lineTo(W / 2 + i * W * 0.22, H);
      g.stroke();
    }
    // halftone tipis di bawah
    g.globalAlpha = 0.18;
    g.fillStyle = ink;
    for (let y = floor + 8; y < H; y += 7) {
      for (let x = (y % 14) / 2; x < W; x += 7) {
        g.beginPath();
        g.arc(x, y, ((y - floor) / (H - floor)) * 1.6, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.globalAlpha = 1;
    // bingkai panel
    g.lineWidth = 6;
    g.strokeRect(3, 3, W - 6, H - 6);
    return c;
  }

  private buildRuin() {
    const { W, H, dpr } = this;
    const c = document.createElement('canvas');
    c.width = Math.round(W * dpr);
    c.height = Math.round(H * dpr);
    const g = c.getContext('2d')!;
    g.scale(dpr, dpr);
    g.strokeStyle = this.colors.ink;
    g.fillStyle = this.colors.ink;
    // retakan
    g.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      let x = randRange(0, W);
      let y = randRange(0, H * 0.5);
      g.beginPath();
      g.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        x += randRange(-40, 40);
        y += randRange(10, 50);
        g.lineTo(x, y);
      }
      g.stroke();
    }
    // atap runtuh: langit-langit bergerigi
    g.beginPath();
    g.moveTo(0, 0);
    for (let x = 0; x <= W; x += 24) g.lineTo(x, randRange(10, 60));
    g.lineTo(W, 0);
    g.closePath();
    g.fill();
    // puing di lantai
    const floor = this.fig.footY;
    for (let i = 0; i < 40; i++) {
      const s = randRange(6, 22);
      g.save();
      g.translate(randRange(0, W), floor - randRange(0, 10));
      g.rotate(randRange(0, Math.PI));
      g.fillRect(-s / 2, -s / 2, s, s * 0.6);
      g.restore();
    }
    // garis kecepatan radial
    g.globalAlpha = 0.25;
    g.lineWidth = 1.5;
    for (let i = 0; i < 70; i++) {
      const a = (i / 70) * Math.PI * 2;
      g.beginPath();
      g.moveTo(W / 2 + Math.cos(a) * W * 0.35, H * 0.55 + Math.sin(a) * H * 0.35);
      g.lineTo(W / 2 + Math.cos(a) * W, H * 0.55 + Math.sin(a) * W);
      g.stroke();
    }
    return c;
  }

  private drawWallHoles(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.colors.ink;
    ctx.strokeStyle = this.colors.ink;
    ctx.lineWidth = 1;
    for (const h of this.wallHoles) {
      ctx.beginPath();
      ctx.arc(h.x, h.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = i * 1.7 + h.x;
        ctx.moveTo(h.x, h.y);
        ctx.lineTo(h.x + Math.cos(a) * 9, h.y + Math.sin(a) * 9);
      }
      ctx.stroke();
    }
  }

  private drawFigure(ctx: CanvasRenderingContext2D) {
    const sp = this.sprite;
    if (!sp) return;
    const { left, top, w, h, cx, footY } = this.fig;
    // bayangan lantai
    ctx.fillStyle = this.colors.ink;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.ellipse(cx, footY + 2, w * 0.55, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const breathe =
      this.opts.reduced || this.phase !== 'idle' ? 0 : Math.sin(this.time / 900) * 0.006;

    if (this.damage === 'slash' && this.cut.sep > 0.01) {
      const { px, py, angle, sep } = this.cut;
      const nx = -Math.sin(angle);
      const ny = Math.cos(angle);
      const big = h * 3;
      const dx = Math.cos(angle) * big;
      const dy = Math.sin(angle) * big;
      for (const side of [1, -1]) {
        ctx.save();
        const off = (sep / 2) * side;
        ctx.translate(left + nx * off, top + ny * off + (side === -1 ? sep * 0.25 : 0));
        ctx.translate(px, py);
        ctx.rotate(side * (sep / this.cut.max) * 0.05);
        ctx.translate(-px, -py);
        ctx.beginPath();
        ctx.moveTo(px - dx, py - dy);
        ctx.lineTo(px + dx, py + dy);
        ctx.lineTo(px + dx + nx * big * side, py + dy + ny * big * side);
        ctx.lineTo(px - dx + nx * big * side, py - dy + ny * big * side);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(sp.canvas, 0, 0, w, h);
        ctx.restore();
      }
    } else if (this.damage === 'explode' && this.frags.length) {
      const k = sp.canvas.width / w;
      for (const f of this.frags) {
        ctx.save();
        ctx.translate(left + f.sx + f.sw / 2 + f.x, top + f.sy + f.sh / 2 + f.y);
        ctx.rotate(f.a);
        ctx.drawImage(
          sp.canvas,
          f.sx * k,
          f.sy * k,
          f.sw * k,
          f.sh * k,
          -f.sw / 2,
          -f.sh / 2,
          f.sw + 0.6,
          f.sh + 0.6,
        );
        ctx.restore();
      }
    } else {
      ctx.save();
      ctx.translate(cx, footY);
      ctx.scale(1, 1 + breathe);
      ctx.translate(-cx, -footY);
      ctx.drawImage(sp.canvas, left, top, w, h);
      ctx.restore();
      // lubang peluru
      for (const hl of this.holes) {
        if (hl.r < 0.4) continue;
        ctx.fillStyle = this.colors.paper;
        ctx.strokeStyle = this.colors.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(left + hl.x, top + hl.y, hl.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // "……" manga saat menahan napas
    if (this.phase === 'breath') {
      const a = clamp(this.phaseT / 160);
      ctx.globalAlpha = a;
      ctx.fillStyle = this.colors.ink;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(cx + w * 0.55 + i * 11, top + h * 0.06, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  private drawTracers(ctx: CanvasRenderingContext2D) {
    for (const t of this.tracers) {
      const a = t.life / 90;
      ctx.globalAlpha = a;
      ctx.strokeStyle = this.colors.paper;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(t.x1, t.y1);
      ctx.lineTo(t.x2, t.y2);
      ctx.stroke();
      ctx.strokeStyle = this.colors.ink;
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  private drawTrails(ctx: CanvasRenderingContext2D) {
    const all = this.stroke ? [...this.trails, this.stroke] : this.trails;
    for (const s of all) {
      if (s.pts.length < 2) continue;
      ctx.globalAlpha = clamp(s.life);
      ctx.strokeStyle = this.colors.ink;
      ctx.lineCap = 'round';
      for (let i = 1; i < s.pts.length; i++) {
        const t = i / s.pts.length;
        ctx.lineWidth = (s.hit ? 16 : 7) * Math.sin(t * Math.PI) + 1;
        ctx.beginPath();
        ctx.moveTo(s.pts[i - 1].x, s.pts[i - 1].y);
        ctx.lineTo(s.pts[i].x, s.pts[i].y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  private drawShock(ctx: CanvasRenderingContext2D) {
    if (!this.shock) return;
    const { x, y, t } = this.shock;
    ctx.globalAlpha = 1 - t;
    ctx.strokeStyle = this.colors.ink;
    ctx.lineWidth = 10 * (1 - t) + 1;
    ctx.beginPath();
    ctx.arc(x, y, easeOutCubic(t) * Math.max(this.W, this.H) * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  private drawGuns(ctx: CanvasRenderingContext2D) {
    const size = Math.min(110, this.W * 0.16);
    for (let g = 0; g < 2; g++) {
      const dir = g === 0 ? 1 : -1;
      const bx = g === 0 ? this.W * 0.1 : this.W * 0.9;
      const by = this.H + 6 + this.recoil[g] * 16;
      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(dir, 1);
      ctx.rotate(-0.62 - this.recoil[g] * 0.3);
      // lengan seragam pelaut + tangan + pistol (siluet tinta)
      const ink = this.colors.ink;
      const paper = this.colors.paper;
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.roundRect(-size * 0.2, -size * 0.05, size * 0.42, size * 0.7, 8);
      ctx.fill();
      ctx.strokeStyle = paper;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-size * 0.18, size * 0.06);
      ctx.lineTo(size * 0.2, size * 0.06);
      ctx.moveTo(-size * 0.18, size * 0.12);
      ctx.lineTo(size * 0.2, size * 0.12);
      ctx.stroke();
      // tangan
      ctx.fillStyle = paper;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-size * 0.14, -size * 0.32, size * 0.3, size * 0.3, 10);
      ctx.fill();
      ctx.stroke();
      // pistol: gagang + laras
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.moveTo(-size * 0.06, -size * 0.2);
      ctx.lineTo(size * 0.06, -size * 0.2);
      ctx.lineTo(size * 0.1, -size * 0.5);
      ctx.lineTo(-size * 0.04, -size * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(-size * 0.06, -size * 0.64, size * 0.62, size * 0.16, 3);
      ctx.fill();
      ctx.fillStyle = paper;
      ctx.fillRect(size * 0.04, -size * 0.6, size * 0.4, 2);
      if (this.muzzle[g] > 0) {
        ctx.translate(size * 0.6, -size * 0.56);
        ctx.fillStyle = this.colors.paper;
        ctx.strokeStyle = this.colors.ink;
        ctx.lineWidth = 3;
        ctx.beginPath();
        const r = 26 * this.muzzle[g] + 8;
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          const rr = i % 2 ? r * 0.45 : r;
          ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawCrosshair(ctx: CanvasRenderingContext2D) {
    const c = this.cross;
    if (!c.visible) return;
    const x = c.x;
    const y = c.y - c.kick * 7;
    const r = 13 + c.spread * 16;
    const ring = (col: string, lw: number) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.moveTo(x - r - 9, y);
      ctx.lineTo(x - r + 5, y);
      ctx.moveTo(x + r - 5, y);
      ctx.lineTo(x + r + 9, y);
      ctx.moveTo(x, y - r - 9);
      ctx.lineTo(x, y - r + 5);
      ctx.moveTo(x, y + r - 5);
      ctx.lineTo(x, y + r + 9);
      ctx.stroke();
    };
    ring(this.colors.paper, 5);
    ring(this.colors.ink, 2);
    ctx.fillStyle = this.pointHitsFigure(c.x, c.y) ? this.colors.ink : this.colors.paper;
    ctx.strokeStyle = this.colors.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}
