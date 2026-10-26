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
    },
  },
  plugins: [],
} satisfies Config;
