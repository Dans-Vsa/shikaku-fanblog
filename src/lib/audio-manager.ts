import { Howler } from 'howler';
import { jitter, randRange } from './math';

/**
 * Audio manager: semua SFX disintesis real-time dengan Web Audio API.
 * Howler dipakai sebagai hub global (AudioContext bersama, master gain, mute,
 * auto-unlock iOS) sehingga file CC0 opsional (Howl) dan SFX sintetis
 * keluar dari bus yang sama.
 */
export type SfxName =
  | 'shot'
  | 'slash'
  | 'explosion'
  | 'regen'
  | 'static'
  | 'heartbeat'
  | 'paper'
  | 'tick'
  | 'click'
  | 'powerOn'
  | 'powerOff';

export type AmbienceName = 'hush' | 'tv' | 'none';

interface PlayOptions {
  /** 0..1 */
  volume?: number;
  /** variasi pitch acak (default 0.06) */
  pitchJitter?: number;
}

class AudioManager {
  private ctx: AudioContext | null = null;
  private bus: GainNode | null = null;
  private duckGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private ambience: { name: AmbienceName; stop: () => void } | null = null;
  private muted = true;
  private ambienceWanted: AmbienceName = 'none';

  /** Dipanggil hanya setelah gesture pengguna (kebijakan autoplay browser). */
  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      Howler.volume(0.9); // memicu Howler membuat AudioContext + masterGain
      const ctx = Howler.ctx;
      if (!ctx || !Howler.masterGain) return null;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 12;
      comp.ratio.value = 4;
      comp.attack.value = 0.003;
      comp.release.value = 0.2;
      this.duckGain = ctx.createGain();
      this.bus = ctx.createGain();
      this.bus.gain.value = 0.85;
      this.bus.connect(this.duckGain).connect(comp).connect(Howler.masterGain);
      this.noiseBuffer = this.makeNoise(ctx, 2);
      this.ctx = ctx;
      Howler.mute(this.muted);
    } catch {
      this.ctx = null;
    }
    return this.ctx;
  }

  private makeNoise(ctx: AudioContext, seconds: number) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  isMuted() {
    return this.muted;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!muted) {
      const ctx = this.ensure();
      if (ctx && ctx.state === 'suspended') void ctx.resume();
      if (this.ambienceWanted !== 'none') this.setAmbience(this.ambienceWanted);
    } else {
      this.ambience?.stop();
      this.ambience = null;
    }
    if (this.ctx) Howler.mute(muted);
  }

  /** Mainkan SFX. Tidak melakukan apa pun saat mute (hemat CPU). */
  play(name: SfxName, opts: PlayOptions = {}) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx || !this.bus) return;
    if (ctx.state === 'suspended') void ctx.resume();
    const vol = (opts.volume ?? 1) * (1 + jitter(0.12));
    const pitch = 1 + jitter(opts.pitchJitter ?? 0.06);
    const t = ctx.currentTime;
    switch (name) {
      case 'shot':
        return this.shot(ctx, t, vol, pitch);
      case 'slash':
        return this.slash(ctx, t, vol, pitch);
      case 'explosion':
        return this.explosion(ctx, t, vol, pitch);
      case 'regen':
        return this.regen(ctx, t, vol, pitch);
      case 'static':
        return this.noiseBurst(ctx, t, 0.35, 'bandpass', 2600 * pitch, 0.4 * vol, 0.6);
      case 'heartbeat':
        this.thump(ctx, t, 62 * pitch, 0.9 * vol, 0.16);
        this.thump(ctx, t + 0.22, 54 * pitch, 0.65 * vol, 0.2);
        return;
      case 'paper':
        for (let i = 0; i < 7; i++) {
          this.noiseBurst(
            ctx,
            t + randRange(0, 0.28),
            randRange(0.015, 0.05),
            'highpass',
            2400,
            0.22 * vol,
            1,
          );
        }
        return;
      case 'tick':
        return this.blip(ctx, t, 1800 * pitch, 0.04, 0.12 * vol);
      case 'click':
        this.blip(ctx, t, 900 * pitch, 0.05, 0.16 * vol);
        return this.noiseBurst(ctx, t, 0.02, 'highpass', 3000, 0.12 * vol, 1);
      case 'powerOn':
        this.sweep(ctx, t, 60, 15000, 0.5, 0.18 * vol);
        return this.noiseBurst(ctx, t + 0.05, 0.4, 'highpass', 5000, 0.2 * vol, 0.5);
      case 'powerOff':
        return this.sweep(ctx, t, 9000, 40, 0.6, 0.2 * vol);
    }
  }

  /** Redam semua bus sesaat — "tahan napas" sebelum regenerasi. */
  duck(seconds: number, depth = 0.06) {
    if (!this.ctx || !this.duckGain) return;
    const g = this.duckGain.gain;
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(depth, t + 0.04);
    g.setValueAtTime(depth, t + seconds);
    g.linearRampToValueAtTime(1, t + seconds + 0.08);
  }

  setAmbience(name: AmbienceName) {
    this.ambienceWanted = name;
    if (this.muted) return;
    if (this.ambience?.name === name) return;
    this.ambience?.stop();
    this.ambience = null;
    if (name === 'none') return;
    const ctx = this.ensure();
    if (!ctx || !this.bus || !this.noiseBuffer) return;
    const out = ctx.createGain();
    out.gain.value = 0;
    out.gain.linearRampToValueAtTime(name === 'tv' ? 0.06 : 0.09, ctx.currentTime + 1.5);
    out.connect(this.bus);
    const nodes: AudioScheduledSourceNode[] = [];
    if (name === 'hush') {
      // drone rendah dua sinus yang sedikit detune: kastil sunyi
      [55, 55.35, 82.4].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = i === 2 ? 0.25 : 0.5;
        o.connect(g).connect(out);
        o.start();
        nodes.push(o);
      });
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuffer;
      n.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 380;
      const g = ctx.createGain();
      g.gain.value = 0.22;
      n.connect(lp).connect(g).connect(out);
      n.start();
      nodes.push(n);
    } else {
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuffer;
      n.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 3200;
      bp.Q.value = 0.6;
      const hum = ctx.createOscillator();
      hum.frequency.value = 50;
      const hg = ctx.createGain();
      hg.gain.value = 0.18;
      n.connect(bp).connect(out);
      hum.connect(hg).connect(out);
      n.start();
      hum.start();
      nodes.push(n, hum);
    }
    this.ambience = {
      name,
      stop: () => {
        const t = ctx.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(out.gain.value, t);
        out.gain.linearRampToValueAtTime(0, t + 0.6);
        nodes.forEach((n) => n.stop(t + 0.65));
      },
    };
  }

  // ---------- primitif sintesis ----------

  private noiseBurst(
    ctx: AudioContext,
    t: number,
    dur: number,
    type: BiquadFilterType,
    freq: number,
    vol: number,
    q: number,
  ) {
    if (!this.noiseBuffer || !this.bus) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = randRange(0.85, 1.15);
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.bus);
    src.start(t, Math.random());
    src.stop(t + dur + 0.02);
  }

  private thump(ctx: AudioContext, t: number, freq: number, vol: number, dur: number) {
    if (!this.bus) return;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq * 2.2, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.04);
    o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.bus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private blip(ctx: AudioContext, t: number, freq: number, dur: number, vol: number) {
    if (!this.bus) return;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.bus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private sweep(ctx: AudioContext, t: number, from: number, to: number, dur: number, vol: number) {
    if (!this.bus) return;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + dur);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 6000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g).connect(this.bus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private shot(ctx: AudioContext, t: number, vol: number, pitch: number) {
    // crack (noise tajam) + body (thump) + ekor ruangan pendek
    this.noiseBurst(ctx, t, 0.09, 'bandpass', 2200 * pitch, 0.9 * vol, 0.8);
    this.noiseBurst(ctx, t, 0.012, 'highpass', 6000, 0.6 * vol, 1);
    this.thump(ctx, t, 70 * pitch, 0.8 * vol, 0.12);
    this.noiseBurst(ctx, t + 0.03, 0.35, 'lowpass', 900, 0.12 * vol, 0.5);
  }

  private slash(ctx: AudioContext, t: number, vol: number, pitch: number) {
    if (!this.noiseBuffer || !this.bus) return;
    // whoosh: bandpass menyapu naik
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.4;
    f.frequency.setValueAtTime(600 * pitch, t);
    f.frequency.exponentialRampToValueAtTime(4200 * pitch, t + 0.16);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7 * vol, t + 0.07);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    src.connect(f).connect(g).connect(this.bus);
    src.start(t, Math.random());
    src.stop(t + 0.22);
    // hantaman basah
    this.thump(ctx, t + 0.12, 48 * pitch, 0.9 * vol, 0.3);
    this.noiseBurst(ctx, t + 0.12, 0.08, 'lowpass', 1400, 0.5 * vol, 0.7);
  }

  private explosion(ctx: AudioContext, t: number, vol: number, pitch: number) {
    if (!this.noiseBuffer || !this.bus) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    src.playbackRate.value = 0.7 * pitch;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(5200, t);
    lp.frequency.exponentialRampToValueAtTime(140, t + 1.8);
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * 2 - 1;
      curve[i] = Math.tanh(x * 3);
    }
    shaper.curve = curve;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1.1 * vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    src.connect(shaper).connect(lp).connect(g).connect(this.bus);
    src.start(t);
    src.stop(t + 2.5);
    this.thump(ctx, t, 36 * pitch, 1.2 * vol, 1.3);
    // puing berjatuhan
    for (let i = 0; i < 6; i++) {
      this.noiseBurst(
        ctx,
        t + 0.4 + i * randRange(0.08, 0.2),
        0.05,
        'bandpass',
        randRange(800, 2400),
        0.18 * vol,
        2,
      );
    }
  }

  private regen(ctx: AudioContext, t: number, vol: number, pitch: number) {
    if (!this.bus) return;
    // percikan basah lalu kilau naik (daging menyatu kembali)
    this.noiseBurst(ctx, t, 0.18, 'lowpass', 900, 0.5 * vol, 1.2);
    [523, 659, 784, 1046].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(f * 0.5 * pitch, t + 0.08 + i * 0.05);
      o.frequency.exponentialRampToValueAtTime(f * pitch, t + 0.5 + i * 0.05);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + 0.08 + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.06 * vol, t + 0.2 + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7 + i * 0.05);
      o.connect(g).connect(this.bus!);
      o.start(t + 0.08 + i * 0.05);
      o.stop(t + 0.75 + i * 0.05);
    });
  }
}

export const audio = new AudioManager();
