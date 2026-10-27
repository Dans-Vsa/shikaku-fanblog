/**
 * Daftar aset & pustaka (bahasa-netral). Peran/keterangan diterjemahkan lewat
 * kunci `role` di content/{id,en}/credits.json. Sumber kebenaran yang sama
 * dengan ASSETS.md.
 */
export interface CreditItem {
  name: string;
  license: string;
  url: string;
  role: string;
}

export const fontCredits: CreditItem[] = [
  {
    name: 'Cormorant Garamond',
    license: 'SIL OFL 1.1',
    url: 'https://fonts.google.com/specimen/Cormorant+Garamond',
    role: 'yugeru',
  },
  {
    name: 'Permanent Marker',
    license: 'Apache 2.0',
    url: 'https://fonts.google.com/specimen/Permanent+Marker',
    role: 'shikaku',
  },
  {
    name: 'Reenie Beanie',
    license: 'SIL OFL 1.1',
    url: 'https://fonts.google.com/specimen/Reenie+Beanie',
    role: 'scrawl',
  },
  {
    name: 'Zen Antique',
    license: 'SIL OFL 1.1',
    url: 'https://fonts.google.com/specimen/Zen+Antique',
    role: 'jp',
  },
  {
    name: 'Dela Gothic One',
    license: 'SIL OFL 1.1',
    url: 'https://fonts.google.com/specimen/Dela+Gothic+One',
    role: 'jpHeavy',
  },
  {
    name: 'IBM Plex Mono',
    license: 'SIL OFL 1.1',
    url: 'https://fonts.google.com/specimen/IBM+Plex+Mono',
    role: 'mono',
  },
];

export const libraryCredits: CreditItem[] = [
  { name: 'React 19', license: 'MIT', url: 'https://react.dev/', role: 'ui' },
  { name: 'React Router 7', license: 'MIT', url: 'https://reactrouter.com/', role: 'router' },
  { name: 'Vite', license: 'MIT', url: 'https://vite.dev/', role: 'build' },
  {
    name: 'TypeScript',
    license: 'Apache 2.0',
    url: 'https://www.typescriptlang.org/',
    role: 'lang',
  },
  { name: 'Tailwind CSS', license: 'MIT', url: 'https://tailwindcss.com/', role: 'css' },
  {
    name: 'GSAP + ScrollTrigger',
    license: "GSAP Standard 'no charge' License",
    url: 'https://gsap.com/standard-license',
    role: 'anim',
  },
  {
    name: 'Lenis',
    license: 'MIT',
    url: 'https://github.com/darkroomengineering/lenis',
    role: 'scroll',
  },
  { name: 'OGL', license: 'Unlicense', url: 'https://github.com/oframe/ogl', role: 'webgl' },
  { name: 'Howler.js', license: 'MIT', url: 'https://howlerjs.com/', role: 'audio' },
  {
    name: 'i18next + react-i18next',
    license: 'MIT',
    url: 'https://www.i18next.com/',
    role: 'i18n',
  },
  {
    name: 'Fontsource',
    license: 'MIT + OFL/Apache (per font)',
    url: 'https://fontsource.org/',
    role: 'fonts',
  },
  {
    name: 'fontTools (pyftsubset)',
    license: 'MIT',
    url: 'https://github.com/fonttools/fonttools',
    role: 'subset',
  },
];
