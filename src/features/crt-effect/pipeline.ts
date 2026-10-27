import { Mesh, Program, Renderer, Texture, Triangle } from 'ogl';
import type { Quality } from '@/lib/perf-detect';
import { CRT_QUALITY, crtParams } from './quality-levels';
import { fragmentBody, vertex } from './shaders';

export interface CrtFrame {
  time: number;
  intensity: number;
  burn: number;
  power: number;
  off: number;
  flash: number;
  motion: number;
}

function hexToVec3(color: string): [number, number, number] {
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.fillStyle = color;
  const v = ctx.fillStyle; // dinormalisasi ke #rrggbb
  const n = parseInt(v.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Satu pipeline WebGL (OGL): tekstur = canvas konten 2D, satu triangle layar penuh,
 * satu fragment shader. Konten (teks, morph kanji) ikut terdistorsi karena
 * dirender di dalam pipeline, bukan ditumpuk sebagai DOM.
 */
export class CrtPipeline {
  private renderer: Renderer;
  private program!: Program;
  private mesh!: Mesh;
  private geometry: Triangle;
  private texture: Texture;
  private quality: Quality;

  constructor(
    private canvas: HTMLCanvasElement,
    private source: HTMLCanvasElement,
    quality: Quality,
    colors: { paper: string; ink: string; crt: string },
  ) {
    this.quality = quality;
    this.renderer = new Renderer({
      canvas,
      dpr: 1,
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
    });
    const gl = this.renderer.gl;
    this.geometry = new Triangle(gl);
    this.texture = new Texture(gl, {
      image: source,
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    });
    this.build(colors);
  }

  private build(colors: { paper: string; ink: string; crt: string }) {
    const gl = this.renderer.gl;
    const q = CRT_QUALITY[this.quality];
    const defines = q.bloomTaps > 0 ? `#define BLOOM\n#define BLOOM_TAPS ${q.bloomTaps}\n` : '';
    const fragment = `precision highp float;\n${defines}${fragmentBody}`;
    this.program?.remove();
    this.program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        tMap: { value: this.texture },
        uRes: { value: [1, 1] },
        uTime: { value: 0 },
        uIntensity: { value: 0 },
        uBurn: { value: 0 },
        uPower: { value: 0 },
        uOff: { value: 0 },
        uFlash: { value: 0 },
        uMotion: { value: 1 },
        uCurve: { value: crtParams.curve },
        uScan: { value: crtParams.scan },
        uMask: { value: crtParams.mask },
        uAberr: { value: crtParams.aberr },
        uNoise: { value: crtParams.noise },
        uRoll: { value: crtParams.roll },
        uJitter: { value: crtParams.jitter },
        uTear: { value: crtParams.tear },
        uBloom: { value: crtParams.bloom },
        uFlicker: { value: crtParams.flicker },
        uVignette: { value: crtParams.vignette },
        uPaper: { value: hexToVec3(colors.paper) },
        uInk: { value: hexToVec3(colors.ink) },
        uTint: { value: hexToVec3(colors.crt) },
      },
    });
    this.mesh = new Mesh(gl, { geometry: this.geometry, program: this.program });
  }

  setQuality(q: Quality, colors: { paper: string; ink: string; crt: string }) {
    if (q === this.quality) return;
    this.quality = q;
    this.build(colors);
  }

  /** Ukuran CSS → buffer = CSS × skala kualitas (dibatasi maxWidth). */
  resize(cssW: number, cssH: number, dpr: number) {
    const q = CRT_QUALITY[this.quality];
    const scale = Math.min(dpr * q.scale, q.maxWidth / Math.max(1, cssW));
    this.renderer.dpr = scale;
    this.renderer.setSize(cssW, cssH);
    this.program.uniforms.uRes.value = [Math.round(cssW * scale), Math.round(cssH * scale)];
    return scale;
  }

  render(f: CrtFrame) {
    const u = this.program.uniforms;
    const q = CRT_QUALITY[this.quality];
    u.uTime.value = f.time;
    u.uIntensity.value =
      crtParams.intensityOverride >= 0 ? crtParams.intensityOverride : f.intensity;
    u.uBurn.value = f.burn;
    u.uPower.value = f.power;
    u.uOff.value = f.off;
    u.uFlash.value = f.flash;
    u.uMotion.value = f.motion;
    u.uCurve.value = crtParams.curve;
    u.uScan.value = crtParams.scan;
    u.uMask.value = crtParams.mask * q.mask;
    u.uAberr.value = crtParams.aberr;
    u.uNoise.value = crtParams.noise * q.noise;
    u.uRoll.value = crtParams.roll;
    u.uJitter.value = crtParams.jitter;
    u.uTear.value = crtParams.tear;
    u.uBloom.value = crtParams.bloom;
    u.uFlicker.value = crtParams.flicker;
    u.uVignette.value = crtParams.vignette;
    this.texture.image = this.source;
    this.texture.needsUpdate = true;
    this.renderer.render({ scene: this.mesh });
  }

  /** Bersihkan semua resource GPU + lepas context (tanpa kebocoran memori). */
  dispose() {
    const gl = this.renderer.gl;
    this.program?.remove();
    this.geometry.remove();
    if (this.texture.texture) gl.deleteTexture(this.texture.texture);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    this.canvas.width = 1;
    this.canvas.height = 1;
  }
}
