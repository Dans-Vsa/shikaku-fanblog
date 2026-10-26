/**
 * Semua tautan & media eksternal resmi. Diverifikasi 2026-10-27:
 * - Trailer: "スペシャルPV「シカク」" diunggah kanal YouTube resmi avex pictures
 *   (diverifikasi lewat oEmbed: author_name = "avex pictures").
 * Tidak ada video yang diunduh; embed memakai youtube-nocookie dengan facade.
 */
export const media = {
  shikakuTrailer: {
    youtubeId: 'RNXHeI0Sly8',
    channel: 'avex pictures',
    title: 'アニメ「藤本タツキ 17-26」スペシャルPV「シカク」',
    watchUrl: 'https://www.youtube.com/watch?v=RNXHeI0Sly8',
    /** Thumbnail resmi YouTube (dimuat dari i.ytimg.com, tidak disalin ke repo). */
    thumbnail: 'https://i.ytimg.com/vi/RNXHeI0Sly8/hqdefault.jpg',
  },
  /** Halaman pengganti bila embed tidak bisa/ditolak dimuat. */
  trailerFallbackUrl: 'https://fujimototatsuki17-26.com/movie/',
  officialAnimeSite: 'https://fujimototatsuki17-26.com/',
  officialShikakuStory: 'https://fujimototatsuki17-26.com/story/shikaku/',
  avexYoutube: 'https://www.youtube.com/@avexpictures',
  primeVideo: {
    us: 'https://www.amazon.com/dp/B0FGHMF69K',
    jp: 'https://www.amazon.co.jp/dp/B0FGHFLJ5M',
  },
  viz: {
    volume1721: 'https://www.viz.com/read/manga/tatsuki-fujimoto-before-chainsaw-man/product/7330',
    series: 'https://www.viz.com/tatsuki-fujimoto-before-chainsaw-man',
    chapters: 'https://www.viz.com/shonenjump/chapters/tatsuki-fujimoto-before-chainsaw-man',
  },
  shueisha: {
    jumpPlus: 'https://shonenjumpplus.com/',
    mangaPlus: 'https://mangaplus.shueisha.co.jp/',
  },
} as const;

/** Audio CC0 opsional. Kosong = 100% sintesis Web Audio (lihat ASSETS.md). */
export const audioFiles: Record<string, string> = {};
