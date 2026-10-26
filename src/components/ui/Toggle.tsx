import { useRef, type ReactNode } from 'react';
import { playSfx } from '@/lib/audio-bridge';

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  /** teks state yang terbaca (mis. "Suara aktif") */
  stateLabel: string;
  children: ReactNode;
  className?: string;
}

/**
 * Toggle dasar (role="switch"). Mikro-animasi: tekan = mengecil, lepas = memantul,
 * plus cincin tinta yang meletup dari tengah sebagai umpan balik klik/sentuh.
 */
export function Toggle({
  checked,
  onChange,
  label,
  stateLabel,
  children,
  className = '',
}: ToggleProps) {
  const burst = useRef<HTMLSpanElement>(null);

  const fire = () => {
    const el = burst.current;
    if (el) {
      el.classList.remove('animate-ink-burst');
      // reflow terkontrol: hanya satu elemen kecil
      void el.offsetWidth;
      el.classList.add('animate-ink-burst');
    }
    playSfx('click', { volume: 0.6 });
    onChange(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={stateLabel}
      onClick={fire}
      className={`group relative inline-flex h-10 min-w-10 items-center justify-center gap-2 border-2 border-ink px-2 transition-[transform,background-color,color] duration-200 ease-snap active:scale-90 ${
        checked ? 'bg-ink text-paper' : 'bg-paper text-ink'
      } ${className}`}
    >
      <span
        ref={burst}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full border-2 border-ink opacity-0"
      />
      {children}
      <span className="sr-only">{stateLabel}</span>
    </button>
  );
}
