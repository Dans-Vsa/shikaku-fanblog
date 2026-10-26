import type { CSSProperties, ElementType, ReactNode } from 'react';

interface PanelFrameProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Kemiringan dasar (derajat). Dikalikan --chaos bila `chaotic`. */
  tilt?: number;
  /** Panel menembus bingkai (overflow terlihat) — untuk momen aksi. */
  bleed?: boolean;
  chaotic?: boolean;
  caption?: ReactNode;
  style?: CSSProperties;
  label?: string;
}

/**
 * Panel manga. Momen hening: tegak, rapi. Momen aksi: miring & keluar bingkai.
 */
export function PanelFrame({
  children,
  as: Tag = 'figure',
  className = '',
  tilt = 0,
  bleed = false,
  chaotic = false,
  caption,
  style,
  label,
}: PanelFrameProps) {
  const transform = chaotic
    ? `rotate(calc(${tilt}deg + var(--chaos) * ${tilt === 0 ? -1.5 : tilt * 0.8}deg))`
    : tilt
      ? `rotate(${tilt}deg)`
      : undefined;
  return (
    <Tag
      className={`relative border-[3px] border-ink bg-paper ${bleed ? 'overflow-visible' : 'overflow-hidden'} ${className}`}
      style={{ transform, ...style }}
      aria-label={label}
    >
      {children}
      {caption && (
        <figcaption className="t-label absolute left-0 top-0 border-b-[3px] border-r-[3px] border-ink bg-paper px-2 py-1">
          {caption}
        </figcaption>
      )}
    </Tag>
  );
}
