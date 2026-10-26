import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { playSfx } from '@/lib/audio-bridge';
import { gsap } from '@/lib/gsap-setup';
import { clamp } from '@/lib/math';
import { createMorph, type KanjiParticles } from './particles';

interface KanjiMorphProps {
  label: string;
  hint: string;
  playLabel: string;
  pauseLabel: string;
  from?: string;
  to?: string;
}

/**
 * Morph 刺客 → 資格 interaktif. Canvas digambar ulang hanya saat progres berubah
 * (tanpa loop permanen). Slider aksesibel (role="slider", panah, Home/End).
 * Reduced motion: crossfade teks, tanpa hamburan partikel.
 */
export function KanjiMorph({
  label,
  hint,
  playLabel,
  pauseLabel,
  from = '刺客',
  to = '資格',
}: KanjiMorphProps) {
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const morph = useRef<KanjiParticles | null>(null);
  const state = useRef({ t: 0 });
  const tween = useRef<gsap.core.Tween | null>(null);
  const [t, setT] = useState(0);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  const draw = (value: number) => {
    const c = canvas.current;
    const m = morph.current;
    if (!c || !m) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    const scale = Math.min(c.width / 2.4, c.height / 1.25);
    const ink =
      getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#141210';
    m.draw(ctx, value, c.width / 2, c.height / 2, scale, ink, Math.max(2, scale / 44), 0.3);
  };
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    let alive = true;
    void createMorph(from, to, 4).then((m) => {
      if (!alive) return;
      morph.current = m;
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [from, to]);

  // Ukuran canvas mengikuti kontainer (DPR dibatasi 2).
  useEffect(() => {
    const el = wrap.current;
    const c = canvas.current;
    if (!el || !c) return;
    const ro = new ResizeObserver(([entry]) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.round(entry.contentRect.width * dpr);
      c.height = Math.round(entry.contentRect.height * dpr);
      drawRef.current(state.current.t);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (ready) drawRef.current(t);
  }, [ready, t]);

  useEffect(() => () => void tween.current?.kill(), []);

  const set = (v: number) => {
    const next = clamp(v);
    state.current.t = next;
    setT(next);
  };

  const togglePlay = () => {
    if (playing) {
      tween.current?.kill();
      setPlaying(false);
      return;
    }
    playSfx('paper', { volume: 0.4 });
    setPlaying(true);
    const target = state.current.t > 0.5 ? 0 : 1;
    tween.current = gsap.to(state.current, {
      t: target,
      duration: 2.4,
      ease: 'power2.inOut',
      onUpdate: () => setT(state.current.t),
      onComplete: () => setPlaying(false),
    });
  };

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    set((e.clientX - r.left) / r.width);
  };

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.04;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') set(state.current.t + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') set(state.current.t - step);
    else if (e.key === 'Home') set(0);
    else if (e.key === 'End') set(1);
    else return;
    e.preventDefault();
  };

  return (
    <div className="flex flex-col gap-5">
      <div ref={wrap} className="relative aspect-[2.3/1] w-full">
        <canvas
          ref={canvas}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          style={{ opacity: ready && !reduced ? 1 : 0, transition: 'opacity .4s' }}
        />
        {(!ready || reduced) && (
          <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <span
              lang="ja"
              className="jp col-start-1 row-start-1 text-[clamp(5rem,18vw,13rem)] leading-none"
              style={{ opacity: 1 - t }}
            >
              {from}
            </span>
            <span
              lang="ja"
              className="jp col-start-1 row-start-1 text-[clamp(5rem,18vw,13rem)] leading-none"
              style={{ opacity: t }}
            >
              {to}
            </span>
          </div>
        )}
        <p className="sr-only" aria-live="polite">
          {t < 0.5 ? from : to}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          className="t-label border-[3px] border-ink bg-ink px-4 py-3 text-paper transition-transform duration-200 ease-snap active:scale-95"
        >
          {playing ? pauseLabel : playLabel}
        </button>
        <div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(t * 100)}
          aria-valuetext={`${from} ${Math.round((1 - t) * 100)}% · ${to} ${Math.round(t * 100)}%`}
          data-cursor="drag"
          onKeyDown={onKey}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            tween.current?.kill();
            setPlaying(false);
            fromPointer(e);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e);
          }}
          className="relative h-12 min-w-[220px] flex-1 touch-none border-[3px] border-ink bg-paper"
        >
          <span
            lang="ja"
            className="jp pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl"
          >
            {from}
          </span>
          <span
            lang="ja"
            className="jp pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl"
          >
            {to}
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 origin-left bg-ink/15"
            style={{ width: '100%', transform: `scaleX(${t})` }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ transform: `translateX(${t * 100}%)` }}
          >
            <span className="absolute left-0 top-[-9px] h-[calc(100%+18px)] w-3 -translate-x-1/2 border-[3px] border-ink bg-paper" />
          </span>
        </div>
      </div>
      <p className="t-label text-ink-soft">{hint}</p>
    </div>
  );
}
