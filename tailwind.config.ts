import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--paper-rgb) / <alpha-value>)',
        'paper-deep': 'rgb(var(--paper-deep-rgb) / <alpha-value>)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        'ink-soft': 'rgb(var(--ink-soft-rgb) / <alpha-value>)',
        blood: 'rgb(var(--blood-rgb) / <alpha-value>)',
        crt: 'rgb(var(--crt-rgb) / <alpha-value>)',
        'crt-blue': 'rgb(var(--crt-blue-rgb) / <alpha-value>)',
      },
      fontFamily: {
        yugeru: 'var(--font-yugeru)',
        shikaku: 'var(--font-shikaku)',
        scrawl: 'var(--font-scrawl)',
        jp: 'var(--font-jp)',
        'jp-heavy': 'var(--font-jp-heavy)',
        mono: 'var(--font-mono)',
      },
      transitionTimingFunction: {
        ink: 'cubic-bezier(0.7, 0, 0.2, 1)',
        snap: 'cubic-bezier(0.2, 1.4, 0.3, 1)',
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      maxWidth: {
        prose: '68ch',
      },
      keyframes: {
        inkBurst: {
          '0%': { opacity: '0.85', transform: 'scale(0.3)' },
          '100%': { opacity: '0', transform: 'scale(1.7)' },
        },
        crtFlicker: {
          '0%, 100%': { opacity: '1' },
          '47%': { opacity: '0.94' },
          '50%': { opacity: '0.82' },
          '53%': { opacity: '0.96' },
        },
        scanRoll: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        inkPulse: {
          '0%, 100%': { transform: 'scaleX(0.2)', transformOrigin: 'left' },
          '50%': { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
        hintBob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
      },
      animation: {
        'ink-burst': 'inkBurst 0.45s cubic-bezier(0.16,1,0.3,1)',
        'crt-flicker': 'crtFlicker 3.2s steps(1) infinite',
        'scan-roll': 'scanRoll 7s linear infinite',
        'ink-pulse': 'inkPulse 1.2s cubic-bezier(0.7,0,0.2,1) infinite',
        'hint-bob': 'hintBob 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
