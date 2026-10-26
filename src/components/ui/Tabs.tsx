import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { playSfx } from '@/lib/audio-bridge';

interface TabsProps<K extends string> {
  tabs: { key: K; label: ReactNode }[];
  active: K;
  onChange: (key: K) => void;
  label: string;
  children: ReactNode;
}

/** Tab ARIA lengkap (panah kiri/kanan, Home/End) dengan indikator blok tinta. */
export function Tabs<K extends string>({ tabs, active, onChange, label, children }: TabsProps<K>) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = tabs.findIndex((t) => t.key === active);

  const onKey = (e: KeyboardEvent) => {
    let next: number;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    onChange(tabs[next].key);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="relative inline-flex border-[3px] border-ink bg-paper"
        onKeyDown={onKey}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-ink transition-transform duration-500 ease-snap"
          style={{ width: `${100 / tabs.length}%`, transform: `translateX(${index * 100}%)` }}
        />
        {tabs.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${id}-tab-${t.key}`}
            aria-selected={t.key === active}
            aria-controls={`${id}-panel`}
            tabIndex={t.key === active ? 0 : -1}
            onClick={() => {
              playSfx('tick');
              onChange(t.key);
            }}
            className={`t-label relative z-10 min-w-36 px-4 py-3 transition-colors duration-300 ${
              t.key === active ? 'text-paper' : 'text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
        tabIndex={0}
        className="mt-10 outline-none"
      >
        {children}
      </div>
    </div>
  );
}
