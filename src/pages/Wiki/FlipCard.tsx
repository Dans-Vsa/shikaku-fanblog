import { useState, type ReactNode } from 'react';
import { playSfx } from '@/lib/audio-bridge';
import './flip-card.css';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  label: string;
  frontLabel: string;
  backLabel: string;
  className?: string;
}

/**
 * Kartu dua sisi (rotateY 3D, transform saja). Sisi yang tak terlihat dibuat
 * `inert` sehingga fokus keyboard & pembaca layar hanya membaca sisi aktif.
 */
export function FlipCard({
  front,
  back,
  label,
  frontLabel,
  backLabel,
  className = '',
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const flip = () => {
    playSfx('paper', { volume: 0.5 });
    setFlipped((f) => !f);
  };
  return (
    <div className={`flip-card ${flipped ? 'is-flipped' : ''} ${className}`}>
      {/* klik di area kartu (bukan tombol/tautan di dalamnya) juga membalik */}
      <div
        className="flip-inner"
        data-cursor="card"
        onClick={(e) => {
          if ((e.target as Element).closest('button, a')) return;
          flip();
        }}
      >
        <div className="flip-face flip-front" inert={flipped} aria-hidden={flipped || undefined}>
          {front}
        </div>
        <div className="flip-face flip-back" inert={!flipped} aria-hidden={!flipped || undefined}>
          {back}
        </div>
      </div>
      <button
        type="button"
        onClick={flip}
        aria-pressed={flipped}
        aria-label={`${label}: ${flipped ? frontLabel : backLabel}`}
        data-cursor="card"
        className="t-label group mt-4 inline-flex items-center gap-2 border-2 border-ink bg-paper px-3 py-2 transition-transform duration-200 ease-snap active:scale-95"
      >
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-500 ease-ink"
          style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}
        >
          ⟲
        </span>
        {flipped ? frontLabel : backLabel}
      </button>
    </div>
  );
}
