# ASSETS

Semua aset yang dipakai situs ini, sumber, dan lisensinya. Daftar yang sama ditampilkan
di halaman `/kredit` (sumber data: `src/config/credits.ts`).

**Aturan (diperbarui atas keputusan pemilik situs):** gambar resmi boleh dipakai sebagai
cuplikan untuk ulasan & promosi, **selalu dengan atribusi** pemegang hak dan sumber yang
dicatat di bawah. Tidak ada scan bab lengkap dan tidak ada video yang diunduh.

## Karya asli (dirujuk, tidak disalin)

| Karya | Pemegang hak | Cara dipakai |
| --- | --- | --- |
| Shikaku (シカク), one-shot 2014 | © Tatsuki Fujimoto / Shueisha | Diparafrasekan & dianalisis; tanpa kutipan dialog; cuplikan gambar resmi dengan atribusi (lihat di bawah) |
| Tatsuki Fujimoto Before Chainsaw Man: 17-21 (EN) | VIZ Media | Ditautkan (`/baca-resmi`) |
| Anime *Tatsuki Fujimoto 17-26*, ep. 4 | Pemegang hak masing-masing; Avex Pictures; Prime Video | Ditautkan |
| Trailer "スペシャルPV「シカク」" (`RNXHeI0Sly8`) | avex pictures (YouTube) | Embed `youtube-nocookie.com` setelah klik; facade memakai frame PV resmi yang di-host sendiri |

## Gambar resmi (`public/media/`, WebP)

| File | Isi | Sumber | Hak |
| --- | --- | --- | --- |
| `manga-title-{764,480}.webp` | Halaman judul manga Shikaku (grayscale) | Jump SQ.19 (2014), via `Dans-Vsa/fujimoto-archive/assets/covers/shikaku.webp` (Chainsaw Man Fandom Wiki) | © Tatsuki Fujimoto / Shueisha |
| `covers/*.webp` | Sampul/halaman judul karya Fujimoto lain | `Dans-Vsa/fujimoto-archive/assets/covers/` | © Tatsuki Fujimoto / Shueisha |
| `covers/17-26-anime.webp` | Key visual antologi 17-26 | `Dans-Vsa/before-chainsaw-man-fanblog/assets/img/anime-kv-700.webp` | © 藤本タツキ／集英社・「藤本タツキ 17-26」製作委員会 |
| `anime-kv-{1080,600}.webp` | Key visual episode Shikaku | `fujimototatsuki17-26.com/assets/img/stories/04/stories04_kv.jpg` | © 藤本タツキ／集英社・「藤本タツキ 17-26」製作委員会 |
| `chara-shikaku-*.webp`, `chara-yugeru-*.webp` | Desain karakter anime | `fujimototatsuki17-26.com/assets/img/stories/04/chara_img_*.png` | © idem |
| `anime-pv-{1280,640}.webp`, `anime-pv-face.webp` | Frame Special PV (thumbnail) + crop wajah untuk siaran Babak 5 | `i.ytimg.com/vi/RNXHeI0Sly8/maxresdefault.jpg` (kanal avex pictures) | © idem |

Diunduh/dikonversi 2026-10-27 (Pillow, WebP). Dipakai di: slider Babak 4, `/anime`, kartu
karakter, kontras Babak 1, sprite simulasi (grayscale), siaran CRT Babak 5, landing, timeline
`/fujimoto`, `/wiki/produksi`, `/baca-resmi`. Setiap tampilan menyertakan atribusi.

## Font (self-host)

| Font | Lisensi | Sumber | Catatan |
| --- | --- | --- | --- |
| Cormorant Garamond | SIL OFL 1.1 | `@fontsource/cormorant-garamond` | 500, 500 italic, 700 |
| Permanent Marker | Apache 2.0 | `@fontsource/permanent-marker` | 400 |
| Reenie Beanie | SIL OFL 1.1 | `@fontsource/reenie-beanie` | 400 |
| IBM Plex Mono | SIL OFL 1.1 | `@fontsource/ibm-plex-mono` | 400, 500 |
| Zen Antique | SIL OFL 1.1 | `@fontsource/zen-antique` → subset | `public/fonts/zen-antique-*.woff2` (hanya glyph yang dipakai) |
| Dela Gothic One | SIL OFL 1.1 | `@fontsource/dela-gothic-one` → subset | `public/fonts/dela-gothic-one-*.woff2` |

Subset dibuat ulang dengan `npm run fonts` (`scripts/subset-fonts.py`, fontTools). OFL
mengizinkan subsetting dan redistribusi bersama perangkat lunak.

## Aset buatan sendiri (orisinal, milik proyek ini)

| Aset | Lokasi | Teknik |
| --- | --- | --- |
| Tekstur kertas | `public/textures/paper.svg` | SVG `feTurbulence` |
| Noise/grain | `public/textures/noise.svg` | SVG `feTurbulence` |
| Percikan tinta | `public/textures/ink-splatter.svg` | Path SVG |
| Favicon / logo | `public/favicon/favicon.svg`, `LogoMark` | SVG |
| Hidangan simbolik, kursi kosong, cangkir teh | `src/assets/Illustrations.tsx` | SVG |
| Sprite cadangan Yugeru (sebelum gambar resmi termuat) | `src/features/execution-sim/figure.ts` | Canvas `Path2D` |
| Wajah cadangan Shikaku di siaran TV (sebelum frame PV termuat) | `src/features/crt-effect/broadcast.ts` | Canvas 2D |
| Kartu hasil kuis | `src/features/quiz/result-card.ts` | Canvas 2D → PNG |

## Audio

Tidak ada file audio. Semua SFX (tembakan, tebasan, ledakan, regenerasi, statis TV, detak
jantung, kertas, ambience) disintesis real-time di `src/lib/audio-manager.ts` dengan Web
Audio API, dirutekan lewat Howler.js. Folder `public/audio/` disediakan untuk file CC0
opsional di masa depan (wajib dicatat di sini bila ditambahkan).

## Pustaka

| Pustaka | Versi | Lisensi |
| --- | --- | --- |
| React / React DOM | 19.3 | MIT |
| React Router | 7.18 | MIT |
| Vite | 8.3 | MIT |
| TypeScript | 6.0 | Apache-2.0 |
| Tailwind CSS | 3.4 | MIT |
| GSAP (+ ScrollTrigger) | 3.15 | GSAP Standard "no charge" License |
| Lenis | 1.3 | MIT |
| OGL | 1.0 | Unlicense |
| Howler.js | 2.2 | MIT |
| i18next / react-i18next | 26 / 17 | MIT |
| Fontsource | 5.3 | MIT (paket) + lisensi font masing-masing |
| fontTools (dev, Python) | 4.67 | MIT |
