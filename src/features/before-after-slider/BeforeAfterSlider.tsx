import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { clamp } from '@/lib/math';

interface BeforeAfterSliderProps {
  before: ReactNode;
  after: ReactNode;
  beforeLabel: string;
  afterLabel: string;
  label: string;
  initial?: number;
  className?: string;
  /** atribusi hak cipta untuk gambar resmi */
  credit?: string;
}

/**
 * Slider before/after. Lapisan "after" dipotong dengan clip-path inset;
 * pegangan bergerak dengan transform. Aksesibel: role="slider", panah, Home/End.
 */
export function BeforeAfterSlider({
  before,
  after,
  beforeLabel,
  afterLabel,
  label,
  initial = 0.5,
  className = '',
  credit,
}: BeforeAfterSliderProps) {
  const [v, setV] = useState(initial);
  const box = useRef<HTMLDivElement>(null);

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setV(clamp((e.clientX - r.left) / r.width));
  };

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.03;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setV((x) => clamp(x - step));
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setV((x) => clamp(x + step));
    else if (e.key === 'Home') setV(0);
    else if (e.key === 'End') setV(1);
    else return;
    e.preventDefault();
  };

  const slider = (
    <div
      ref={box}
      className={`relative select-none overflow-hidden border-[3px] border-ink touch-none ${className}`}
      data-cursor="drag"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e);
      }}
    >
      <div className="relative">{before}</div>
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${v * 100}%)` }}
        aria-hidden="true"
      >
        {after}
      </div>
      <span className="t-label pointer-events-none absolute left-2 top-2 bg-ink px-2 py-1 text-paper">
        {beforeLabel}
      </span>
      <span className="t-label pointer-events-none absolute right-2 top-2 border-2 border-ink bg-paper px-2 py-1">
        {afterLabel}
      </span>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ transform: `translateX(${v * 100}%)` }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(v * 100)}
          aria-valuetext={`${beforeLabel} ${Math.round(v * 100)}% · ${afterLabel} ${Math.round((1 - v) * 100)}%`}
          onKeyDown={onKey}
          className="pointer-events-auto absolute inset-y-0 left-0 w-[3px] -translate-x-1/2 bg-ink outline-none focus-visible:shadow-[0_0_0_4px_var(--paper),0_0_0_7px_var(--ink)]"
        >
          <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-ink bg-paper font-mono text-sm">
            ⟷
          </span>
        </div>
      </div>
    </div>
  );
  if (!credit) return slider;
  return (
    <figure className="flex flex-col gap-2">
      {slider}
      <figcaption className="t-label text-[0.6rem] text-ink-soft">{credit}</figcaption>
    </figure>
  );
}
