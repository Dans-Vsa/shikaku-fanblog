import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
});

export function SpeakerIcon({ size, on, ...p }: IconProps & { on: boolean }) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none" />
      <g className="transition-opacity duration-300" style={{ opacity: on ? 1 : 0 }}>
        <path d="M15.5 9a4 4 0 0 1 0 6" />
        <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
      </g>
      <g className="transition-opacity duration-300" style={{ opacity: on ? 0 : 1 }}>
        <path d="M16 9.5l5 5M21 9.5l-5 5" />
      </g>
    </svg>
  );
}

export function MotionIcon({ size, reduced, ...p }: IconProps & { reduced: boolean }) {
  return (
    <svg {...base(size)} {...p}>
      <path
        d={reduced ? 'M3 12h18' : 'M3 12c2-5 4-5 6 0s4 5 6 0 4-5 6 0'}
        style={{ transition: 'd 0.4s cubic-bezier(0.16,1,0.3,1)' }}
      />
      {reduced && <path d="M3 7h18M3 17h18" opacity={0.35} />}
    </svg>
  );
}

export function MenuIcon({ size, open, ...p }: IconProps & { open: boolean }) {
  return (
    <svg {...base(size)} {...p}>
      <path
        d={open ? 'M5 5l14 14' : 'M3 7h18'}
        style={{ transition: 'd 0.35s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <path d="M3 12h18" style={{ opacity: open ? 0 : 1, transition: 'opacity 0.2s' }} />
      <path
        d={open ? 'M5 19L19 5' : 'M3 17h14'}
        style={{ transition: 'd 0.35s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  );
}

export function ArrowIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M4 12.5c5-.6 10-.4 15 0M14 7l5.5 5.5L14 18" />
    </svg>
  );
}

export function ExternalIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5" />
    </svg>
  );
}

export function PlayIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M7 4.5l13 7.5-13 7.5z" fill="currentColor" />
    </svg>
  );
}

/** Logo: bingkai panel miring (四角 = "persegi") ditebas satu garis + satu titik tinta. */
export function LogoMark({ size = 34, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable={false} {...p}>
      <rect
        x="9"
        y="9"
        width="46"
        height="46"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        transform="rotate(-4 32 32)"
      />
      <path d="M18 46 L46 18" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <circle cx="46" cy="46" r="5" fill="currentColor" />
    </svg>
  );
}
