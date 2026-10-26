import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import en from '@/content/en/sim.json';
import id from '@/content/id/sim.json';
import { useLocalized } from '@/hooks/useLocalized';
import { usePerformance } from '@/hooks/useProviders';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ExecutionEngine, type SimProgress, type Weapon } from './engine';
import './sim.css';

const WEAPONS: Weapon[] = ['shoot', 'slash', 'explode'];

interface ExecutionSimProps {
  /** Dipanggil saat isyarat "lanjut ke cerita" muncul */
  onContinue?: () => void;
  continueLabel?: string;
  className?: string;
  /** rasio tinggi; default 16/10 */
  aspect?: string;
}

/**
 * Pembungkus React untuk ExecutionEngine. React hanya mengurus HUD (tombol
 * senjata, gelembung keluhan, petunjuk); seluruh aksi berjalan di satu canvas.
 */
export function ExecutionSim({
  onContinue,
  continueLabel,
  className = '',
  aspect = 'aspect-[4/5] sm:aspect-[16/10]',
}: ExecutionSimProps) {
  const c = useLocalized({ id, en });
  const reduced = useReducedMotion();
  const { quality } = usePerformance();
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ExecutionEngine | null>(null);
  const [weapon, setWeapon] = useState<Weapon>('shoot');
  const [progress, setProgress] = useState<SimProgress>({
    attempts: 0,
    boredom: 0,
    unlocked: { shoot: true, slash: false, explode: false },
    ready: false,
  });
  const [bubble, setBubble] = useState('');
  const [toast, setToast] = useState('');
  const [started, setStarted] = useState(false);

  // Engine dibuat sekali; opsi diperbarui tanpa membuat ulang.
  const initial = useRef({ reduced, quality, complaints: c.complaints });
  const unlockText = useRef(c.unlocked);
  useEffect(() => {
    unlockText.current = c.unlocked;
  }, [c.unlocked]);

  useEffect(() => {
    const cv = canvas.current;
    const el = wrap.current;
    if (!cv || !el) return;
    const e = new ExecutionEngine(cv, initial.current, {
      onComplaint: setBubble,
      onProgress: (p) => {
        setProgress(p);
        if (p.attempts > 0) setStarted(true);
      },
      onUnlock: (w) => {
        if (w !== 'shoot') setToast(unlockText.current[w]);
      },
      onWeapon: setWeapon,
    });
    engine.current = e;
    if (import.meta.env.DEV) (window as unknown as { __sim?: ExecutionEngine }).__sim = e;
    const ro = new ResizeObserver(([entry]) => {
      e.resize(entry.contentRect.width, entry.contentRect.height);
    });
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => e.setVisible(entry.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
      e.destroy();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    engine.current?.setOptions({ reduced, quality, complaints: c.complaints });
  }, [reduced, quality, c.complaints]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const eng = engine.current;
    if (!eng) return;
    if (e.key === '1') eng.setWeapon('shoot');
    else if (e.key === '2') eng.setWeapon('slash');
    else if (e.key === '3') eng.setWeapon('explode');
    else if (e.key === 'e' || e.key === 'E') eng.fireKeyboard('explode');
    else if (e.key === ' ' || e.key === 'Enter') eng.fireKeyboard();
    else return;
    e.preventDefault();
  };

  return (
    <div className={`sim-root flex flex-col gap-3 ${className}`}>
      <div
        ref={wrap}
        className={`sim-stage relative w-full select-none overflow-hidden border-[3px] border-ink bg-paper ${aspect}`}
        role="application"
        aria-label={c.aria}
        aria-roledescription={c.title}
        tabIndex={0}
        onKeyDown={onKey}
        data-cursor="none"
        data-lenis-prevent
      >
        <canvas ref={canvas} className="absolute inset-0 h-full w-full touch-none" />

        {/* HUD atas: label target + meter */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
          <p className="t-label bg-paper/90 px-2 py-1">{c.target}</p>
          <dl className="t-label flex gap-3 bg-paper/90 px-2 py-1">
            <div className="flex gap-1">
              <dt>{c.attempts}</dt>
              <dd aria-live="polite">{progress.attempts}</dd>
            </div>
            <div className="flex items-center gap-1">
              <dt>{c.boredom}</dt>
              <dd
                className="relative h-2 w-14 border border-ink"
                aria-label={`${Math.round(progress.boredom * 100)}%`}
              >
                <span
                  className="absolute inset-0 origin-left bg-ink transition-transform duration-500"
                  style={{ transform: `scaleX(${progress.boredom})` }}
                />
              </dd>
            </div>
          </dl>
        </div>

        {/* gelembung keluhan Yugeru */}
        <div
          className={`sim-bubble pointer-events-none absolute right-[3%] top-[13%] w-[min(44%,300px)] ${bubble ? 'is-on' : ''}`}
          aria-live="polite"
        >
          {bubble && <p className="t-yugeru text-lg leading-snug md:text-xl">{bubble}</p>}
        </div>

        {!started && (
          <p className="t-shikaku pointer-events-none absolute inset-x-0 bottom-[14%] text-center text-xl md:text-2xl">
            <span className="bg-paper px-2">{c.intro}</span>
          </p>
        )}

        <div
          role="status"
          className={`sim-toast t-label pointer-events-none absolute bottom-[22%] left-1/2 max-w-[90%] -translate-x-1/2 border-2 border-ink bg-ink px-3 py-2 text-center text-paper ${toast ? 'is-on' : ''}`}
        >
          {toast}
        </div>
      </div>

      {/* pemilih senjata */}
      <div className="flex flex-wrap items-stretch gap-2" role="group" aria-label={c.title}>
        {WEAPONS.map((w, i) => {
          const locked = !progress.unlocked[w];
          return (
            <button
              key={w}
              type="button"
              disabled={locked}
              aria-pressed={weapon === w}
              onClick={() => {
                engine.current?.setWeapon(w);
                if (w === 'explode') engine.current?.fireKeyboard('explode');
              }}
              className={`group flex min-w-[7.5rem] flex-1 flex-col items-start gap-0.5 border-[3px] border-ink px-3 py-2 text-left transition-[transform,background-color,color] duration-200 ease-snap active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                weapon === w ? 'bg-ink text-paper' : 'bg-paper text-ink'
              }`}
            >
              <span className="t-shikaku text-lg leading-tight">
                {i + 1}. {c.weapons[w]}
              </span>
              <span className="t-label text-[0.6rem] opacity-80">
                {locked ? c.locked : c.keys[w]}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => engine.current?.reset()}
          className="t-label border-[3px] border-transparent px-3 py-2 underline hover:border-ink"
        >
          {c.reset}
        </button>
      </div>
      <p className="t-label text-ink-soft">{c.keyboardHint}</p>

      {progress.ready && (
        <div className="sim-ready flex flex-col items-start gap-3 border-l-[6px] border-ink pl-4">
          <p className="t-yugeru text-2xl">{c.ready}</p>
          {onContinue && (
            <button
              type="button"
              onClick={onContinue}
              className="t-label animate-hint-bob border-[3px] border-ink bg-ink px-5 py-3 text-paper"
            >
              {continueLabel ?? c.readyCta} ↓
            </button>
          )}
        </div>
      )}
    </div>
  );
}
