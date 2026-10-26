import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '@/hooks/useProviders';
import { onLenisScroll } from '@/lib/lenis-setup';
import { findTerm } from './glossary-data';

interface Pos {
  left: number;
  top: number;
  above: boolean;
}

/**
 * Istilah glosarium dengan tooltip global. Tooltip dirender lewat portal (tidak
 * terpotong overflow panel), posisinya dihitung sekali saat dibuka (satu baca DOM).
 */
export function GlossaryTerm({ termId, children }: { termId: string; children?: ReactNode }) {
  const { lang } = useLang();
  const term = findTerm(lang, termId);
  const id = useId();
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);

  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const off = onLenisScroll(close);
    window.addEventListener('scroll', close, { passive: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      off();
      window.removeEventListener('scroll', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [pos]);

  if (!term) return <>{children}</>;

  const open = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min(320, window.innerWidth - 24);
    const left = Math.min(
      Math.max(12, r.left + r.width / 2 - width / 2),
      window.innerWidth - width - 12,
    );
    const above = r.top > 220;
    setPos({ left, top: above ? r.top - 10 : r.bottom + 10, above });
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        className="glossary-term inline cursor-help border-b-2 border-dotted border-current p-0 text-left font-[inherit] leading-[inherit]"
        aria-describedby={pos ? id : undefined}
        onMouseEnter={open}
        onMouseLeave={() => setPos(null)}
        onFocus={open}
        onBlur={() => setPos(null)}
        onClick={() => (pos ? setPos(null) : open())}
      >
        {children ?? term.term}
      </button>
      {pos &&
        createPortal(
          <div
            id={id}
            role="tooltip"
            className="glossary-tip pointer-events-none fixed z-[95] w-[min(320px,calc(100vw-24px))] border-[3px] border-ink bg-paper p-4 text-left text-ink shadow-[6px_6px_0_var(--ink)]"
            style={{
              left: pos.left,
              top: pos.top,
              transform: pos.above ? 'translateY(-100%)' : undefined,
            }}
          >
            <p className="flex items-baseline justify-between gap-3">
              <span className="text-xl font-bold leading-tight">{term.term}</span>
              <span lang="ja" className="jp text-2xl leading-none">
                {term.jp}
              </span>
            </p>
            <p className="t-label mt-1 text-ink-soft">{term.romaji}</p>
            <p className="mt-2 text-base leading-snug">{term.short}</p>
          </div>,
          document.body,
        )}
    </>
  );
}
