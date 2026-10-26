/**
 * Pool partikel berbasis typed array (tanpa alokasi per frame, tanpa GC spike).
 * Tipe: tinta (puing), darah (HANYA regenerasi), percikan api, asap, selongsong.
 */
export const P_INK = 0;
export const P_BLOOD = 1;
export const P_SPARK = 2;
export const P_SMOKE = 3;
export const P_SHELL = 4;

export class ParticlePool {
  readonly cap: number;
  count = 0;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  life: Float32Array;
  max: Float32Array;
  size: Float32Array;
  rot: Float32Array;
  vr: Float32Array;
  grav: Float32Array;
  type: Uint8Array;

  constructor(cap: number) {
    this.cap = cap;
    this.x = new Float32Array(cap);
    this.y = new Float32Array(cap);
    this.vx = new Float32Array(cap);
    this.vy = new Float32Array(cap);
    this.life = new Float32Array(cap);
    this.max = new Float32Array(cap);
    this.size = new Float32Array(cap);
    this.rot = new Float32Array(cap);
    this.vr = new Float32Array(cap);
    this.grav = new Float32Array(cap);
    this.type = new Uint8Array(cap);
  }

  spawn(
    type: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
    lifeMs: number,
    size: number,
    grav = 0,
    vr = 0,
  ) {
    // pool penuh: timpa partikel tertua (indeks 0) dengan swap
    let i = this.count;
    if (i >= this.cap) i = Math.floor(Math.random() * this.cap);
    else this.count++;
    this.type[i] = type;
    this.x[i] = x;
    this.y[i] = y;
    this.vx[i] = vx;
    this.vy[i] = vy;
    this.life[i] = lifeMs;
    this.max[i] = lifeMs;
    this.size[i] = size;
    this.rot[i] = Math.random() * Math.PI;
    this.vr[i] = vr;
    this.grav[i] = grav;
  }

  update(dtMs: number, floorY: number) {
    const dt = dtMs / 1000;
    let i = 0;
    while (i < this.count) {
      this.life[i] -= dtMs;
      if (this.life[i] <= 0) {
        this.kill(i);
        continue;
      }
      this.vy[i] += this.grav[i] * dt;
      if (this.type[i] === P_SMOKE) {
        this.vx[i] *= 1 - 1.8 * dt;
        this.vy[i] *= 1 - 1.8 * dt;
        this.size[i] += 26 * dt;
      }
      this.x[i] += this.vx[i] * dt;
      this.y[i] += this.vy[i] * dt;
      this.rot[i] += this.vr[i] * dt;
      if (this.grav[i] > 0 && this.y[i] > floorY) {
        this.y[i] = floorY;
        this.vy[i] *= -0.25;
        this.vx[i] *= 0.6;
        this.vr[i] *= 0.5;
      }
      i++;
    }
  }

  private kill(i: number) {
    const last = --this.count;
    if (i === last) return;
    this.type[i] = this.type[last];
    this.x[i] = this.x[last];
    this.y[i] = this.y[last];
    this.vx[i] = this.vx[last];
    this.vy[i] = this.vy[last];
    this.life[i] = this.life[last];
    this.max[i] = this.max[last];
    this.size[i] = this.size[last];
    this.rot[i] = this.rot[last];
    this.vr[i] = this.vr[last];
    this.grav[i] = this.grav[last];
  }

  clear() {
    this.count = 0;
  }

  draw(ctx: CanvasRenderingContext2D, colors: { ink: string; paper: string; blood: string }) {
    for (let i = 0; i < this.count; i++) {
      const a = this.life[i] / this.max[i];
      const s = this.size[i];
      switch (this.type[i]) {
        case P_INK:
          ctx.globalAlpha = Math.min(1, a * 2);
          ctx.fillStyle = colors.ink;
          ctx.save();
          ctx.translate(this.x[i], this.y[i]);
          ctx.rotate(this.rot[i]);
          ctx.fillRect(-s / 2, -s / 2, s, s * 0.7);
          ctx.restore();
          break;
        case P_BLOOD:
          ctx.globalAlpha = Math.min(1, a * 1.6);
          ctx.fillStyle = colors.blood;
          ctx.beginPath();
          ctx.arc(this.x[i], this.y[i], s * (0.5 + a * 0.5), 0, Math.PI * 2);
          ctx.fill();
          break;
        case P_SPARK:
          ctx.globalAlpha = a;
          ctx.strokeStyle = colors.ink;
          ctx.lineWidth = Math.max(1, s * 0.35);
          ctx.beginPath();
          ctx.moveTo(this.x[i], this.y[i]);
          ctx.lineTo(this.x[i] - this.vx[i] * 0.03, this.y[i] - this.vy[i] * 0.03);
          ctx.stroke();
          break;
        case P_SMOKE:
          ctx.globalAlpha = a * 0.55;
          ctx.fillStyle = colors.ink;
          ctx.beginPath();
          ctx.arc(this.x[i], this.y[i], s, 0, Math.PI * 2);
          ctx.fill();
          break;
        case P_SHELL:
          ctx.globalAlpha = Math.min(1, a * 3);
          ctx.fillStyle = colors.ink;
          ctx.save();
          ctx.translate(this.x[i], this.y[i]);
          ctx.rotate(this.rot[i]);
          ctx.fillRect(-s, -s / 2.5, s * 2, s / 1.25);
          ctx.restore();
          break;
      }
    }
    ctx.globalAlpha = 1;
  }
}
