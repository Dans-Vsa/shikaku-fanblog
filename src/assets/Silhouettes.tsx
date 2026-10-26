import type { SVGProps } from 'react';

/**
 * Ilustrasi tokoh buatan sendiri (SVG murni, bukan tracing panel resmi).
 * style:
 *   ink   — siluet tinta penuh (gaya cetak manga)
 *   hatch — arsir garis + halftone (gaya goresan manga)
 *   cel   — blok warna datar + bayangan lembut (tafsir arah visual anime)
 */
export type FigureStyle = 'ink' | 'hatch' | 'cel';

interface FigureProps extends SVGProps<SVGSVGElement> {
  figureStyle?: FigureStyle;
  /** 0 = tenang, 1 = sangat bosan (kelopak mata turun) */
  boredom?: number;
  title?: string;
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <pattern
        id={`${id}-hatch`}
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(35)"
      >
        <line x1="0" y1="0" x2="0" y2="6" stroke="var(--ink)" strokeWidth="2.2" />
      </pattern>
      <pattern id={`${id}-dots`} width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="2.5" cy="2.5" r="1.1" fill="var(--ink)" />
      </pattern>
      <linearGradient id={`${id}-cel`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#2b2a3a" />
        <stop offset="1" stopColor="#14131c" />
      </linearGradient>
    </defs>
  );
}

function fills(id: string, style: FigureStyle) {
  if (style === 'hatch')
    return {
      body: `url(#${id}-hatch)`,
      dark: 'var(--ink)',
      skin: 'var(--paper)',
      shade: `url(#${id}-dots)`,
      line: 'var(--ink)',
    };
  if (style === 'cel')
    return {
      body: `url(#${id}-cel)`,
      dark: '#1b1a24',
      skin: '#f3e3d3',
      shade: '#d9c1ad',
      line: '#1b1a24',
    };
  return {
    body: 'var(--ink)',
    dark: 'var(--ink)',
    skin: 'var(--paper)',
    shade: 'var(--paper-deep)',
    line: 'var(--ink)',
  };
}

/** Yugeru: bangsawan tinggi, kerah tegak, jubah lebar, rambut panjang, mata jemu. */
export function YugeruFigure({ figureStyle = 'ink', boredom = 0.5, title, ...props }: FigureProps) {
  const id = `yg-${figureStyle}`;
  const f = fills(id, figureStyle);
  const lid = 2 + boredom * 5;
  return (
    <svg
      viewBox="0 0 200 400"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title && <title>{title}</title>}
      <Defs id={id} />
      {/* jubah */}
      <path
        d="M100 112 C70 116 52 130 44 160 L16 392 L184 392 L156 160 C148 130 130 116 100 112 Z"
        fill={f.body}
        stroke={f.line}
        strokeWidth="3"
      />
      {/* lapisan dalam jubah */}
      <path d="M100 126 L74 392 L126 392 Z" fill={f.dark} />
      <path
        d="M100 126 L86 392 M100 126 L114 392"
        stroke={f.skin}
        strokeWidth="1.5"
        opacity="0.35"
      />
      {/* kerah tegak */}
      <path
        d="M58 132 L66 92 L88 120 Z M142 132 L134 92 L112 120 Z"
        fill={f.dark}
        stroke={f.line}
        strokeWidth="2"
      />
      {/* leher */}
      <path
        d="M90 100 L110 100 L108 122 L92 122 Z"
        fill={f.skin}
        stroke={f.line}
        strokeWidth="2.5"
      />
      {/* rambut belakang panjang */}
      <path
        d="M68 66 C64 110 70 140 74 152 L88 110 L112 110 L126 152 C130 140 136 110 132 66 Z"
        fill={f.dark}
      />
      {/* wajah */}
      <path
        d="M78 58 C78 36 122 36 122 58 L120 84 C116 98 106 104 100 104 C94 104 84 98 80 84 Z"
        fill={f.skin}
        stroke={f.line}
        strokeWidth="3"
      />
      {figureStyle === 'cel' && (
        <path
          d="M104 46 C118 52 120 70 116 88 C112 96 106 101 100 103 C110 92 112 70 104 46 Z"
          fill={f.shade}
        />
      )}
      {figureStyle === 'hatch' && (
        <path d="M108 50 C120 58 118 78 114 90 L108 96 Z" fill={f.shade} />
      )}
      {/* poni */}
      <path
        d="M74 60 C74 30 126 28 128 62 C118 50 108 48 100 56 C94 48 82 50 74 60 Z"
        fill={f.dark}
        stroke={f.line}
        strokeWidth="2"
      />
      {/* mata jemu: kelopak turun */}
      <g stroke={f.line} strokeWidth="2.6" strokeLinecap="round">
        <path d={`M86 ${70 + lid * 0.3} q6 ${-3 + lid * 0.4} 12 0`} fill="none" />
        <path d={`M104 ${70 + lid * 0.3} q6 ${-3 + lid * 0.4} 12 0`} fill="none" />
      </g>
      <g fill={f.line}>
        <ellipse cx="92" cy={72 + lid * 0.35} rx="2.4" ry={Math.max(0.6, 2.6 - boredom * 1.8)} />
        <ellipse cx="110" cy={72 + lid * 0.35} rx="2.4" ry={Math.max(0.6, 2.6 - boredom * 1.8)} />
      </g>
      {/* mulut datar */}
      <path
        d={`M94 ${90 + boredom} q6 ${1 - boredom * 2} 12 0`}
        stroke={f.line}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* bros kerah */}
      <circle cx="100" cy="128" r="4" fill={f.skin} stroke={f.line} strokeWidth="2" />
    </svg>
  );
}

/** Shikaku: rambut bob berponi, kerah pelaut, pita, rok lipit, dua pistol. */
export function ShikakuFigure({ figureStyle = 'ink', title, ...props }: FigureProps) {
  const id = `sk-${figureStyle}`;
  const f = fills(id, figureStyle);
  return (
    <svg
      viewBox="0 0 200 400"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title && <title>{title}</title>}
      <Defs id={id} />
      {/* kaki */}
      <path
        d="M86 300 L82 380 L92 380 L96 300 Z M104 300 L108 380 L118 380 L114 300 Z"
        fill={f.skin}
        stroke={f.line}
        strokeWidth="2.5"
      />
      <path d="M78 376 h18 v12 h-20 Z M104 376 h18 l2 12 h-20 Z" fill={f.dark} />
      {/* rok lipit */}
      <path d="M70 232 L130 232 L148 304 L52 304 Z" fill={f.body} stroke={f.line} strokeWidth="3" />
      <path
        d="M84 232 L76 304 M100 232 L100 304 M116 232 L124 304"
        stroke={f.skin}
        strokeWidth="1.6"
        opacity="0.4"
      />
      {/* lengan kiri: pistol */}
      <path
        d="M72 150 C56 170 40 186 22 192 L20 202 C42 200 62 186 80 168 Z"
        fill={f.body}
        stroke={f.line}
        strokeWidth="2.5"
      />
      <path d="M2 186 h22 v8 h-10 l-2 10 h-6 l1 -10 h-5 Z" fill={f.dark} />
      {/* lengan kanan: pistol */}
      <path
        d="M128 150 C144 170 160 186 178 192 L180 202 C158 200 138 186 120 168 Z"
        fill={f.body}
        stroke={f.line}
        strokeWidth="2.5"
      />
      <path d="M198 186 h-22 v8 h10 l2 10 h6 l-1 -10 h5 Z" fill={f.dark} />
      {/* badan seragam */}
      <path
        d="M72 140 C70 180 70 210 70 236 L130 236 C130 210 130 180 128 140 C118 132 82 132 72 140 Z"
        fill={f.body}
        stroke={f.line}
        strokeWidth="3"
      />
      {/* kerah pelaut */}
      <path
        d="M72 140 L100 196 L128 140 L120 136 L100 176 L80 136 Z"
        fill={f.skin}
        stroke={f.line}
        strokeWidth="2.5"
      />
      <path d="M78 141 L100 186 L122 141" stroke={f.line} strokeWidth="1.6" fill="none" />
      {/* pita */}
      <path
        d="M100 184 L86 176 L88 194 Z M100 184 L114 176 L112 194 Z M98 182 h4 v6 h-4 Z"
        fill={f.dark}
        stroke={f.line}
        strokeWidth="1.5"
      />
      <path d="M96 188 L90 214 L98 208 Z M104 188 L110 214 L102 208 Z" fill={f.dark} />
      {/* leher */}
      <path
        d="M93 116 L107 116 L106 136 L94 136 Z"
        fill={f.skin}
        stroke={f.line}
        strokeWidth="2.5"
      />
      {/* rambut belakang bob */}
      <path d="M64 70 C60 110 66 128 76 130 L124 130 C134 128 140 110 136 70 Z" fill={f.dark} />
      {/* wajah */}
      <path
        d="M74 74 C74 46 126 46 126 74 L124 98 C120 112 108 120 100 120 C92 120 80 112 76 98 Z"
        fill={f.skin}
        stroke={f.line}
        strokeWidth="3"
      />
      {figureStyle === 'cel' && (
        <path
          d="M106 60 C120 68 122 88 118 102 C114 110 108 116 100 118 C112 104 114 82 106 60 Z"
          fill={f.shade}
        />
      )}
      {figureStyle === 'cel' && (
        <g fill="#e8a7a0" opacity="0.6">
          <ellipse cx="84" cy="100" rx="6" ry="3" />
          <ellipse cx="116" cy="100" rx="6" ry="3" />
        </g>
      )}
      {/* poni rata */}
      <path
        d="M66 76 C62 40 138 36 134 76 L134 82 C120 74 112 78 104 72 C96 78 84 72 78 80 L66 84 Z"
        fill={f.dark}
        stroke={f.line}
        strokeWidth="2"
      />
      {/* mata besar terbuka, senyum lebar */}
      <g fill={f.line}>
        <ellipse cx="88" cy="92" rx="4" ry="5.5" />
        <ellipse cx="112" cy="92" rx="4" ry="5.5" />
      </g>
      <g fill={f.skin}>
        <circle cx="89.5" cy="90" r="1.4" />
        <circle cx="113.5" cy="90" r="1.4" />
      </g>
      <path d="M90 106 q10 10 20 0 q-10 4 -20 0 Z" fill={f.line} />
    </svg>
  );
}
