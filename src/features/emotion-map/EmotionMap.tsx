import { useEffect, useRef, type RefObject } from 'react';
import { ScrollTrigger } from '@/lib/gsap-setup';
import { getLenis, onLenisScroll } from '@/lib/lenis-setup';

interface EmotionMapProps {
  sections: RefObject<HTMLElement | null>[];
  moods: number[];
  labels: string[];
  title: string;
}

/**
 * "Peta emosi": garis mood tipis di tepi kanan layar. Sumbu Y = posisi di halaman,
 * sumbu X = intensitas emosi tiap babak. Penanda bergerak mengikuti scroll
 * (transform saja); bentuk garis dihitung ulang hanya saat ScrollTrigger refresh.
 */
export function EmotionMap({ sections, moods, labels, title }: EmotionMapProps) {
  const path = useRef<SVGPathElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const ticks = useRef<HTMLOListElement>(null);
  const stops = useRef<{ pos: number; mood: number }[]>([]);

  useEffect(() => {
    const W = 22;
    const build = () => {
      const doc = document.documentElement.scrollHeight;
      if (!doc) return;
      const pts = sections
        .map((r, i) => {
          const el = r.current;
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          return { pos: (top + rect.height / 2) / doc, mood: moods[i] ?? 0 };
        })
        .filter((p): p is { pos: number; mood: number } => p !== null);
      stops.current = pts;
      const all = [
        { pos: 0, mood: pts[0]?.mood ?? 0 },
        ...pts,
        { pos: 1, mood: pts[pts.length - 1]?.mood ?? 0 },
      ];
      let d = `M ${(2 + all[0].mood * W).toFixed(1)} 0`;
      for (let i = 1; i < all.length; i++) {
        const a = all[i - 1];
        const b = all[i];
        const ya = a.pos * 1000;
        const yb = b.pos * 1000;
        const xa = 2 + a.mood * W;
        const xb = 2 + b.mood * W;
        const my = (ya + yb) / 2;
        d += ` C ${xa.toFixed(1)} ${my.toFixed(1)}, ${xb.toFixed(1)} ${my.toFixed(1)}, ${xb.toFixed(1)} ${yb.toFixed(1)}`;
      }
      path.current?.setAttribute('d', d);
      ticks.current?.querySelectorAll<HTMLLIElement>('li').forEach((li, i) => {
        if (pts[i])
          li.style.transform = `translateY(${(pts[i].pos * window.innerHeight).toFixed(1)}px)`;
      });
    };

    const update = (y: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? y / max : 0;
      if (marker.current)
        marker.current.style.transform = `translateY(${(p * (window.innerHeight - 12)).toFixed(1)}px)`;
    };

    build();
    update(window.scrollY);
    ScrollTrigger.addEventListener('refresh', build);
    const off = onLenisScroll((y) => update(y));
    const onNative = () => {
      if (!getLenis()) update(window.scrollY);
    };
    window.addEventListener('scroll', onNative, { passive: true });
    window.addEventListener('resize', build);
    return () => {
      ScrollTrigger.removeEventListener('refresh', build);
      off();
      window.removeEventListener('scroll', onNative);
      window.removeEventListener('resize', build);
    };
  }, [sections, moods]);

  return (
    <aside
      aria-label={title}
      className="pointer-events-none fixed bottom-0 right-0 top-0 z-40 hidden w-8 sm:block"
    >
      <svg
        viewBox="0 0 26 1000"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          ref={path}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
          opacity="0.55"
        />
      </svg>
      <ol ref={ticks} className="absolute inset-x-0 top-0">
        {labels.map((l) => (
          <li key={l} className="absolute right-1 top-0 flex items-center gap-1" title={l}>
            <span className="sr-only">{l}</span>
            <span aria-hidden="true" className="block h-[2px] w-2 bg-ink" />
          </li>
        ))}
      </ol>
      <div
        ref={marker}
        className="absolute right-[3px] top-0 h-3 w-3 rotate-45 border-2 border-ink bg-paper"
        aria-hidden="true"
      />
    </aside>
  );
}
