export interface NavItem {
  to: string;
  key: string;
  children?: NavItem[];
}

export const wikiSections: NavItem[] = [
  { to: '/wiki/karakter', key: 'nav.characters' },
  { to: '/wiki/sinopsis', key: 'nav.synopsis' },
  { to: '/wiki/tema', key: 'nav.themes' },
  { to: '/wiki/kanji', key: 'nav.kanji' },
  { to: '/wiki/produksi', key: 'nav.production' },
  { to: '/wiki/glosarium', key: 'nav.glossary' },
];

export const mainNav: NavItem[] = [
  { to: '/baca', key: 'nav.read' },
  { to: '/wiki', key: 'nav.wiki', children: wikiSections },
  { to: '/anime', key: 'nav.anime' },
  { to: '/fujimoto', key: 'nav.fujimoto' },
  { to: '/komunitas', key: 'nav.community' },
];

export const footerNav: NavItem[] = [
  { to: '/baca-resmi', key: 'nav.official' },
  { to: '/kredit', key: 'nav.credits' },
];

/** Jaringan blog penggemar Fujimoto (repo GitHub Pages milik pengguna yang sama). */
export const network = {
  archive: 'https://dans-vsa.github.io/fujimoto-archive/',
  hub: 'https://dans-vsa.github.io/before-chainsaw-man-fanblog/17-21/#shikaku',
} as const;

export const site = {
  name: 'SHIKAKU',
  kana: 'シカク',
  year: 2014,
} as const;
