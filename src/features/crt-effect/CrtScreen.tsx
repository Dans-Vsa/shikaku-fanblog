import { useEffect, useRef, useState, type RefObject } from 'react';
import { faceCloseupSrc } from '@/config/images';
import { createMorph, type KanjiParticles } from '@/features/kanji-morph/particles';
import { usePerformance } from '@/hooks/useProviders';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { gsap } from '@/lib/gsap-setup';
import { damp } from '@/lib/math';
import { BroadcastCanvas, type BroadcastText } from './broadcast';
import { DebugPanel } from './DebugPanel';
import { CrtPipeline } from './pipeline';
import { CRT_QUALITY } from './quality-levels';
import { sceneAt } from './timeline';
import './crt-fallback.css';

interface CrtScreenProps {
  /** progres scroll 0..1 (ditulis ScrollTrigger, dibaca tiap frame — tanpa re-render React) */
  progress: RefObject<number>;
  text: BroadcastText;
  censored: boolean;
}

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  return {
    paper: cs.getPropertyValue('--paper-print').trim() || '#efe8da',
    ink: cs.getPropertyValue('--ink').trim() || '#141210',
    crt: cs.getPropertyValue('--crt').trim() || '#5cffb0',
  };
}

/**
 * Layar TV Babak 5. Jalur utama: WebGL (OGL) satu pass shader.
 * Fallback: canvas konten yang sama + efek CSS (scanline, flicker, aberasi palsu).
 * Render hanya saat terlihat, lewat gsap.ticker (ticker global yang sama dengan Lenis).
 */
export function CrtScreen({ progress, text, censored }: CrtScreenProps) {
  const { quality, webgl, debug } = usePerformance();
  const reduced = useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const fallbackHost = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'gl' | 'css'>(webgl ? 'gl' : 'css');
  const live = useRef({ text, censored, reduced, quality });

  useEffect(() => {
    live.current = { text, censored, reduced, quality };
  }, [text, censored, reduced, quality]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    // Canvas WebGL dibuat baru tiap mount: context lama yang di-loseContext()
    // tidak pernah dipakai ulang (aman untuk StrictMode & HMR).
    const glEl = mode === 'gl' ? document.createElement('canvas') : null;
    if (glEl) {
      glEl.className = 'absolute inset-0 h-full w-full';
      el.prepend(glEl);
    }
    // Warna kertas dibaca saat masih tema "paper" (sebelum tema TV aktif)
    const colors = readColors();
    const broadcast = new BroadcastCanvas();
    let morph: KanjiParticles | null = null;
    void createMorph('刺客', '資格', 5).then((m) => (morph = m));
    // close-up resmi (same-origin, aman untuk tekstur WebGL)
    let faceImg: HTMLImageElement | null = null;
    const face = new Image();
    face.decoding = 'async';
    face.src = faceCloseupSrc;
    void face
      .decode()
      .then(() => (faceImg = face))
      .catch(() => undefined);

    let pipeline: CrtPipeline | null = null;
    if (mode === 'gl' && glEl) {
      try {
        pipeline = new CrtPipeline(glEl, broadcast.canvas, live.current.quality, colors);
      } catch {
        // WebGL gagal dibuat (driver/blocklist): pindah ke fallback CSS
        queueMicrotask(() => setMode('css'));
        return;
      }
    } else if (fallbackHost.current) {
      broadcast.canvas.className = 'crt-fallback-canvas';
      broadcast.canvas.setAttribute('aria-hidden', 'true');
      fallbackHost.current.prepend(broadcast.canvas);
    }

    const onLost = (e: Event) => {
      e.preventDefault();
      queueMicrotask(() => setMode('css'));
    };
    glEl?.addEventListener('webglcontextlost', onLost);

    let currentQuality = live.current.quality;
    const resize = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const q = CRT_QUALITY[currentQuality];
      const scale = Math.min(dpr * q.scale, q.maxWidth / Math.max(1, r.width));
      broadcast.resize(r.width * scale, r.height * scale);
      pipeline?.resize(r.width, r.height, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let shown = -1;
    let tvTheme = false;
    let p = progress.current ?? 0;
    const start = performance.now();
    const tick = (_t: number, deltaMs: number) => {
      const { text: tx, censored: cz, reduced: rd, quality: q } = live.current;
      if (q !== currentQuality) {
        currentQuality = q;
        pipeline?.setQuality(q, colors);
        resize();
      }
      p = damp(p, progress.current ?? 0, 12, Math.min(deltaMs, 50) / 1000);
      const s = sceneAt(p);
      // waktu dibekukan saat reduced motion: statis, tanpa flicker/roll
      const time = rd ? 1.7 : (performance.now() - start) / 1000;
      if (s.tv !== tvTheme) {
        tvTheme = s.tv;
        document.documentElement.dataset.theme = tvTheme ? 'tv' : 'paper';
      }
      broadcast.draw(s, time, tx, cz, morph, faceImg);
      if (pipeline) {
        pipeline.render({
          time,
          intensity: s.intensity,
          burn: s.burn,
          power: s.power,
          off: s.off,
          flash: s.flash,
          motion: rd ? 0 : 1,
        });
      } else if (fallbackHost.current) {
        const f = fallbackHost.current.style;
        f.setProperty('--crt-i', s.intensity.toFixed(3));
        f.setProperty('--crt-burn', s.burn.toFixed(3));
        f.setProperty('--crt-power', Math.max(0.004, s.power).toFixed(3));
        f.setProperty('--crt-off-v', Math.max(0.004, 1 - Math.min(1, s.off / 0.55)).toFixed(3));
        f.setProperty(
          '--crt-off-h',
          Math.max(0.004, 1 - Math.min(1, Math.max(0, s.off - 0.5) / 0.4)).toFixed(3),
        );
        f.setProperty('--crt-flash', s.flash.toFixed(3));
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      if (visible && shown !== 1) {
        shown = 1;
        gsap.ticker.add(tick);
      } else if (!visible && shown === 1) {
        shown = 0;
        gsap.ticker.remove(tick);
        if (tvTheme) {
          tvTheme = false;
          document.documentElement.dataset.theme = 'paper';
        }
      }
    });
    io.observe(el);

    return () => {
      io.disconnect();
      ro.disconnect();
      gsap.ticker.remove(tick);
      glEl?.removeEventListener('webglcontextlost', onLost);
      pipeline?.dispose();
      glEl?.remove();
      broadcast.canvas.remove();
      document.documentElement.dataset.theme = 'paper';
    };
  }, [mode, progress]);

  return (
    <div
      ref={host}
      className="crt-host absolute inset-0 overflow-hidden bg-black"
      aria-hidden="true"
      data-cursor="none"
    >
      {mode === 'css' && (
        <div
          ref={fallbackHost}
          className={`crt-fallback absolute inset-0 ${reduced ? 'is-reduced' : ''}`}
        >
          <div className="crt-fallback-fx" />
          <div className="crt-fallback-paper" />
          <div className="crt-fallback-flash" />
        </div>
      )}
      {debug && <DebugPanel />}
    </div>
  );
}
