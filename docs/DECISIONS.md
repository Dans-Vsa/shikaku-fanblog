# Keputusan (Decision Log)

Format: **keputusan** — alasan. Ditulis saat keputusan diambil, per fase.

## Fase 0 — Scaffold

- **Root proyek = `shikaku-web/`** di dalam folder kerja — mengikuti struktur folder wajib di brief secara literal.
- **Versi tooling terbaru saat build (Vite 8, React 19, TypeScript 6, ESLint 10, Tailwind 3.4)** — Tailwind dikunci di v3 karena brief meminta `tailwind.config.ts`; v4 memindahkan konfigurasi ke CSS.
- **ESLint flat config (`eslint.config.js`)** menggantikan `.eslintrc` — ESLint ≥9 tidak lagi membaca `.eslintrc` secara default. Aturan `react-hooks` v7 (berbasis React Compiler) dipakai penuh.
- **Konten per halaman diimpor statis (ID+EN) di chunk halaman** — ganti bahasa jadi instan tanpa Suspense/flicker. Biayanya ~beberapa KB per halaman, jauh lebih murah daripada state loading tambahan. String UI global ada di `content/{id,en}/ui.json` lewat i18next.
- **Font Jepang di-subset sendiri** (`scripts/subset-fonts.py`, output `public/fonts/` + `src/styles/fonts-jp.css`) — CSS @fontsource untuk Zen Antique/Dela Gothic One berukuran ~280 KB (ratusan blok unicode-range). Setelah subset hanya glyph yang dipakai situs (~44 KB total, CSS utama 26 KB). Font Latin tetap via `@fontsource` (self-host, OFL).
- **Tekstur kertas & noise = SVG `feTurbulence` buatan sendiri** di `public/textures/` — nol aset pihak ketiga, ringan, tile mulus. Tidak ada gambar raster sehingga aturan WebP/AVIF tidak relevan; bila kelak ada, pakai format itu.
- **Audio modul di-lazy-load**: Howler + sintesis (`lib/audio-manager.ts`, ~12 KB gzip) baru diunduh saat suara dinyalakan. Setelah dimuat, SFX dipanggil sinkron (tanpa await) agar tetap di frame yang sama dengan input.
- **Howler dipakai sebagai hub audio** (AudioContext bersama, master gain, mute global, auto-unlock iOS); semua SFX disintesis Web Audio dan dirutekan ke `Howler.masterGain`. Tidak ada file audio yang diunduh.
- **Satu ticker**: Lenis digerakkan `gsap.ticker`; monitor FPS juga menumpang ticker ini.

## Fakta yang diverifikasi (2026-10-27)

- Trailer resmi: `RNXHeI0Sly8` — "スペシャルPV「シカク」", kanal YouTube **avex pictures** (diverifikasi lewat endpoint oEmbed YouTube). Disimpan di `src/config/media.ts`.
- Situs resmi anime menulis Yugeru bosan setelah **3.500 tahun** hidup abadi. Pengisi suara: Kana Hanazawa (Shikaku), Tomokazu Sugita (Yugeru). Studio: GRAPH77.
- **Staf episode (sutradara, musik, dll.) sengaja tidak dicantumkan**, sesuai instruksi brief, walaupun situs resmi sudah mencantumkannya.
- Prime Video: rilis global 7 November 2025 (8 November JST). Ditulis "awal November 2025".
