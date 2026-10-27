/**
 * Ilustrasi simbolik buatan sendiri (SVG). Tidak ada gore eksplisit:
 * hidangan Babak 2 hanya potongan abstrak + satu tetes merah (regenerasi).
 */
export function MealIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 240" className={className} role="img" aria-hidden="true">
      {/* taplak kotak-kotak */}
      <defs>
        <pattern id="cloth" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="var(--ink)" opacity="0.12" />
          <rect x="10" y="10" width="10" height="10" fill="var(--ink)" opacity="0.12" />
        </pattern>
      </defs>
      <rect x="0" y="150" width="400" height="90" fill="url(#cloth)" />
      {/* piring */}
      <ellipse
        cx="200"
        cy="160"
        rx="120"
        ry="34"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth="4"
      />
      <ellipse
        cx="200"
        cy="158"
        rx="84"
        ry="22"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2"
        opacity="0.5"
      />
      {/* potongan abstrak */}
      <path d="M176 150 C176 132 224 128 228 146 C230 158 182 162 176 150 Z" fill="var(--ink)" />
      <path
        d="M186 142 C196 138 210 138 218 142"
        stroke="var(--paper)"
        strokeWidth="2"
        fill="none"
      />
      {/* satu tetes merah: bagian yang tumbuh kembali */}
      <path
        d="M232 128 C232 136 238 140 238 146 C238 151 226 151 226 146 C226 140 232 136 232 128 Z"
        fill="var(--blood)"
      />
      {/* garpu Shikaku (kiri) */}
      <g stroke="var(--ink)" strokeWidth="4" strokeLinecap="round">
        <path d="M70 60 L120 150" />
        <path d="M60 44 L72 66 M68 40 L80 62 M76 36 L88 58" strokeWidth="3" />
      </g>
      {/* tangan Yugeru (kanan) menyodorkan, lengan jubah */}
      <path
        d="M400 70 C350 74 320 96 300 120 L316 132 C334 116 360 104 400 102 Z"
        fill="var(--ink)"
      />
      <path
        d="M300 120 C290 126 284 136 288 142 C294 146 306 140 316 132 Z"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth="3"
      />
      {/* garis efek manga */}
      <g stroke="var(--ink)" strokeWidth="2" opacity="0.5">
        <path d="M150 40 L162 70 M200 26 L200 60 M250 40 L238 70" />
      </g>
    </svg>
  );
}

export function TeacupsIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 140" className={className} role="img" aria-hidden="true">
      <line x1="0" y1="120" x2="300" y2="120" stroke="var(--ink)" strokeWidth="2" />
      {/* cangkir hangat (kiri) dengan uap tipis */}
      <path
        d="M50 80 h60 v18 c0 14 -12 22 -30 22 s-30 -8 -30 -22 Z"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth="3"
      />
      <path d="M110 86 c14 0 14 18 0 18" fill="none" stroke="var(--ink)" strokeWidth="3" />
      <path
        d="M70 70 c-6 -10 6 -16 0 -26 M90 70 c-6 -10 6 -16 0 -26"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.6"
        opacity="0.6"
      />
      {/* cangkir dingin (kanan), tanpa uap, sedikit miring */}
      <g transform="rotate(4 215 100)">
        <path
          d="M185 80 h60 v18 c0 14 -12 22 -30 22 s-30 -8 -30 -22 Z"
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeWidth="3"
        />
        <path d="M245 86 c14 0 14 18 0 18" fill="none" stroke="var(--ink)" strokeWidth="3" />
        <path d="M188 84 h54" stroke="var(--ink)" strokeWidth="1.5" opacity="0.4" />
      </g>
    </svg>
  );
}

/** Kursi kosong — Babak 3. */
export function EmptyChairIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 220" className={className} role="img" aria-hidden="true">
      <g
        fill="none"
        stroke="var(--ink)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M40 20 C40 10 120 10 120 20 L116 110 L44 110 Z" />
        <path d="M54 30 L56 100 M80 26 L80 102 M106 30 L104 100" opacity="0.5" />
        <path d="M30 112 L130 112 L126 132 L34 132 Z" />
        <path d="M40 132 L34 210 M120 132 L126 210 M52 132 L56 196 M108 132 L104 196" />
      </g>
    </svg>
  );
}

/** Sosok terbakar (tafsir bebas tokoh beregenerasi di Fire Punch) — siluet tinta + lidah api. */
export function BurningFigure({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 400" className={className} role="img" aria-hidden="true">
      <g fill="var(--ink)">
        <circle cx="100" cy="78" r="30" />
        <path d="M70 112 C60 160 62 230 70 300 L84 392 L98 392 L100 300 L102 392 L116 392 L130 300 C138 230 140 160 130 112 Z" />
        <path d="M70 120 L34 220 L46 224 L80 150 Z M130 120 L166 220 L154 224 L120 150 Z" />
      </g>
      <g fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round">
        <path d="M100 6 C112 30 96 36 118 54 C130 30 140 46 134 70 C150 60 150 84 140 98 C126 92 112 104 100 96 C86 104 72 92 60 98 C50 84 52 60 66 70 C60 46 74 30 82 54 C102 36 88 30 100 6 Z" />
        <path d="M40 200 C30 186 40 176 34 160 C50 170 56 186 52 204 Z" />
        <path d="M160 200 C170 186 160 176 166 160 C150 170 144 186 148 204 Z" />
        <path d="M86 250 C78 230 90 222 86 204 C102 218 104 236 100 254 Z" />
        <path d="M114 300 C108 284 118 276 114 262 C128 274 128 290 124 304 Z" />
      </g>
    </svg>
  );
}
