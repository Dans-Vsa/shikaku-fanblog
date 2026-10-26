import type { CSSProperties } from 'react';

const BLOTS = [
  'M50 8c9 1 11 13 19 12s13-9 17-3-5 13-1 19 17 5 14 14-15 4-19 10 4 18-5 20-11-9-19-8-11 14-20 9 0-17-6-22-19 0-19-9 14-9 14-18-12-14-4-19 14 4 19-1 2-17 10-15z',
  'M48 10c12-2 16 10 26 14s14 14 8 22-2 18-10 24-20 10-30 6-22-8-24-20-6-20 2-30 16-14 28-16z',
  'M30 20c8-10 26-12 36-4s22 6 22 18-10 16-8 26-6 22-18 22-18-8-28-6-22-4-20-16 6-16 2-24 6-10 14-16z',
];

interface InkBlotProps {
  variant?: 0 | 1 | 2;
  className?: string;
  style?: CSSProperties;
  color?: string;
  /** Percikan kecil di sekitar gumpalan */
  splatter?: boolean;
}

/** Gumpalan tinta SVG buatan sendiri, dipakai sebagai aksen dekoratif hitam. */
export function InkBlot({
  variant = 0,
  className = '',
  style,
  color = 'var(--ink)',
  splatter = true,
}: InkBlotProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path d={BLOTS[variant]} fill={color} />
      {splatter && (
        <g fill={color}>
          <circle cx="88" cy="16" r="3.2" />
          <circle cx="12" cy="82" r="2.4" />
          <circle cx="92" cy="78" r="1.8" />
          <circle cx="8" cy="30" r="1.4" />
        </g>
      )}
    </svg>
  );
}
