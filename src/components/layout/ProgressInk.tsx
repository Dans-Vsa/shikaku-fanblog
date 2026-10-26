import { useEffect, useRef } from 'react';
import { chaosStore } from '@/hooks/useScrollChaos';
import { getLenis, onLenisScroll } from '@/lib/lenis-setup';

/** Garis tinta bergerigi; amplitudo naik mengikuti --chaos. */
function inkPath(chaos: number) {
  const steps = 80;
  let d = 'M0 5';
  let seed = 3;
  for (let i = 1; i <= steps; i++) {
    seed = (seed * 16807) % 2147483647;
    const r = seed / 2147483647 - 0.5;
    const amp = 0.6 + chaos * 3.6 * (0.4 + (i / steps) * 0.6);
    d += ` L${((i / steps) * 1000).toFixed(1)} ${(5 + r * amp * 2).toFixed(2)}`;
  }
  return d;
}

/**
 * Progress bar global berbentuk garis tinta. Progres = scaleX (compositor),
 * bentuk garis hanya dihitung ulang saat --chaos berubah berarti.
 */
export function ProgressInk() {
  const wrap = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    let lastChaos = -1;
    const redraw = (c: number) => {
      if (Math.abs(c - lastChaos) < 0.06) return;
      lastChaos = c;
      path.current?.setAttribute('d', inkPath(c));
      if (path.current) path.current.style.strokeWidth = String(3 + c * 3);
    };
    redraw(chaosStore.chaos);
    const offChaos = chaosStore.subscribe((c) => redraw(c));

    const update = (y: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (wrap.current) wrap.current.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const offLenis = onLenisScroll((y) => update(y));
    const onNative = () => {
      if (!getLenis()) update(window.scrollY);
    };
    window.addEventListener('scroll', onNative, { passive: true });
    update(window.scrollY);
    return () => {
      offChaos();
      offLenis();
      window.removeEventListener('scroll', onNative);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[10px]" aria-hidden="true">
      <div ref={wrap} className="h-full w-full origin-left" style={{ transform: 'scaleX(0)' }}>
        <svg
          viewBox="0 0 1000 10"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <path
            ref={path}
            fill="none"
            stroke="var(--ink)"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
