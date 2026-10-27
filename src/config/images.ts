import type { Lang } from '@/types/content';

/**
 * Gambar resmi (dipakai untuk ulasan & promosi, dengan atribusi). Semua file WebP di
 * public/media/, dibuat oleh tools/ dari sumber yang dicatat di ASSETS.md.
 */
export type Rights = 'manga' | 'anime';

export interface OfficialImage {
  src: string;
  /** srcset kecil untuk layar sempit (opsional) */
  small?: string;
  w: number;
  h: number;
  rights: Rights;
  alt: Record<Lang, string>;
  source: string;
}

const base = import.meta.env.BASE_URL;
const m = (p: string) => `${base}media/${p}`;

export const RIGHTS: Record<Rights, string> = {
  manga: '© Tatsuki Fujimoto / Shueisha',
  anime: '© 藤本タツキ／集英社・「藤本タツキ 17-26」製作委員会',
};

export const images = {
  mangaTitle: {
    src: m('manga-title-764.webp'),
    small: m('manga-title-480.webp'),
    w: 764,
    h: 1200,
    rights: 'manga',
    alt: {
      id: 'Halaman judul manga Shikaku (2014): logo シカク di atas kota, Shikaku berjaket dengan sabuk senjata menyapa "Konnichiwa!", keterangan "sepuluh tahun kemudian".',
      en: 'Title page of the Shikaku manga (2014): the シカク logo above a city, Shikaku in a jacket and weapon belt greeting "Konnichiwa!", caption "ten years later".',
    },
    source: 'Jump SQ.19 (2014) — via Fujimoto Archive',
  },
  animeKv: {
    src: m('anime-kv-1080.webp'),
    small: m('anime-kv-600.webp'),
    w: 1080,
    h: 1519,
    rights: 'anime',
    alt: {
      id: 'Key visual anime Shikaku: Yugeru menengadah dalam cahaya, Shikaku menodongkan pistol ke dagunya, logo シカク merah.',
      en: 'Shikaku anime key visual: Yugeru looking up into the light while Shikaku presses a pistol under his chin, red シカク logo.',
    },
    source: 'fujimototatsuki17-26.com',
  },
  animePv: {
    src: m('anime-pv-1280.webp'),
    small: m('anime-pv-640.webp'),
    w: 1280,
    h: 720,
    rights: 'anime',
    alt: {
      id: 'Cuplikan Special PV Shikaku: wajah Shikaku dari dekat, mata berkaca-kaca dan mulut terbuka.',
      en: 'Frame from the Shikaku Special PV: a close-up of Shikaku, eyes glistening and mouth open.',
    },
    source: 'YouTube avex pictures (thumbnail resmi)',
  },
  charaShikaku: {
    src: m('chara-shikaku-900.webp'),
    small: m('chara-shikaku-480.webp'),
    w: 900,
    h: 1200,
    rights: 'anime',
    alt: {
      id: 'Desain karakter anime Shikaku: rambut bob oranye-merah muda, jaket hoodie biru muda, syal, celana gelap dan sabuk berkantong senjata.',
      en: 'Anime character design of Shikaku: salmon-orange bob, light-blue hoodie, scarf, dark trousers and a pouch-and-weapon belt.',
    },
    source: 'fujimototatsuki17-26.com',
  },
  charaYugeru: {
    src: m('chara-yugeru-900.webp'),
    small: m('chara-yugeru-480.webp'),
    w: 900,
    h: 1200,
    rights: 'anime',
    alt: {
      id: 'Desain karakter anime Yugeru: rambut perak disisir ke belakang, kemeja putih lengan digulung, bretel, celana kain gelap.',
      en: 'Anime character design of Yugeru: slicked-back silver hair, white shirt with rolled sleeves, suspenders, dark trousers.',
    },
    source: 'fujimototatsuki17-26.com',
  },
} satisfies Record<string, OfficialImage>;

/** Sampul resmi (Shueisha) untuk timeline — sama dengan rak Fujimoto Archive. */
export const covers: Record<string, string> = {
  "A Couple Clucking Chickens Were Still Kickin' in the Schoolyard": m('covers/chickens.webp'),
  'Sasaki Stopped a Bullet': m('covers/sasaki.webp'),
  'Love is Blind': m('covers/love-is-blind.webp'),
  Shikaku: m('covers/shikaku.webp'),
  'Mermaid Rhapsody': m('covers/mermaid-rhapsody.webp'),
  'Nayuta of the Prophecy': m('covers/nayuta.webp'),
  'Fire Punch': m('covers/fire-punch.webp'),
  'Woke-Up-as-a-Girl Syndrome': m('covers/woke-up-as-a-girl.webp'),
  Sisters: m('covers/sisters.webp'),
  'Chainsaw Man': m('covers/chainsaw-man.webp'),
  'Look Back': m('covers/look-back.webp'),
  'Goodbye, Eri': m('covers/goodbye-eri.webp'),
  '17-21': m('covers/17-21.webp'),
  '22-26': m('covers/22-26.webp'),
  '17-26': m('covers/17-26-anime.webp'),
};

export const faceCloseupSrc = m('anime-pv-face.webp');
export const charaYugeruSrc = m('chara-yugeru-900.webp');
