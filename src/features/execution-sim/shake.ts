import { clamp, noise1 } from '@/lib/math';

/**
 * Screen shake berbasis "trauma" (pola GDC Squirrel Eiserloh):
 * offset = maks * trauma² * noise(t). Trauma meluruh linear, sehingga
 * guncangan besar mereda halus tanpa berhenti mendadak.
 */
export class Trauma {
  value = 0;
  private t = 0;
  constructor(
    private maxOffset = 26,
    private maxAngle = 0.045,
    private decayPerSec = 1.35,
    private frequency = 22,
  ) {}

  add(amount: number) {
    this.value = clamp(this.value + amount);
  }

  update(dtMs: number) {
    this.t += dtMs / 1000;
    this.value = Math.max(0, this.value - (this.decayPerSec * dtMs) / 1000);
  }

  sample() {
    const s = this.value * this.value;
    const f = this.t * this.frequency;
    return {
      x: this.maxOffset * s * noise1(f, 1),
      y: this.maxOffset * s * noise1(f, 2),
      angle: this.maxAngle * s * noise1(f, 3),
    };
  }
}
