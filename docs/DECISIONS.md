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

## Fase 1–5

- **Transisi halaman = tirai tinta dua lembar** yang menutup *sebelum* `navigate()` (lewat `TransitionLink`) lalu membuka setelah halaman baru ter-render. Chunk route dimuat di balik tirai, jadi tidak pernah ada layar kosong. Back/forward: tirai tertutup instan sebelum paint lalu terbuka.
- **Tema "layar TV" bukan toggle pengguna**, melainkan perubahan medium otomatis saat Babak 5 aktif — brief membatasi warna CRT hanya untuk Babak 5, jadi dark mode bebas akan melanggar aturan warna.
- **Simulasi muncul dua kali**: sebagai pintu masuk di landing dan di akhir Babak 1, karena brief meminta keduanya.
- **Kontrol simulasi**: tembak sejak awal; tebasan terbuka setelah 4 percobaan; ledakan setelah 2 tebasan atau 10 percobaan; isyarat "lanjut" setelah ≥12 percobaan + 1 ledakan (atau 18 percobaan). Keyboard: 1/2/3, Spasi, E. Sentuh: ketuk = tembak, tahan/geser = tebas, dua jari = ledakan.
- **Darah (`--blood`) hanya di tiga tempat**: partikel regenerasi di simulasi, satu tetes di ilustrasi hidangan (bagian yang beregenerasi), kalimat terakhir pengakuan Shikaku di siaran (ledakan emosi). Logo memakai titik tinta.
- **"365 hari" dan "3.000 tahun"** dipakai sesuai brief tetapi diberi label dramatisasi/catatan simbolis; angka resmi yang terverifikasi hanya "±3.500 tahun" (usia Yugeru).
- **Trailer facade tanpa thumbnail resmi**: poster dibuat sendiri, sehingga tidak ada request ke YouTube dan tidak ada gambar berhak cipta sampai pengguna menekan putar.
- **Kanal & ID trailer diverifikasi via oEmbed YouTube** (author `avex pictures`). Fallback kartu tautan ke `fujimototatsuki17-26.com/movie/` tetap ditampilkan.
- **Analisis anime ditulis sebagai kerangka perbandingan medium** [OPINI], tanpa mengklaim isi adegan spesifik episode yang belum diverifikasi.
- **Tokoh di luar Shikaku (Togata, dst.) dirujuk netral** ("tokoh"), bukan "karakter wanita" seperti di brief, untuk menghindari salah gender.
- **Canvas WebGL dibuat baru per mount**: memakai ulang elemen canvas setelah `loseContext()` (StrictMode menjalankan efek dua kali) membuat context baru rusak; bug ini ditemukan saat verifikasi browser.
- **Komunitas = localStorage via `CommunityStore`**; contoh posting bawaan diberi label "contoh dari tim situs" agar tidak terkesan seperti posting pengguna sungguhan.
- **Kuis**: 7 pertanyaan dua sumbu (Shikaku/Yugeru); selisih ≤2 menghasilkan hasil ketiga "Shikaku × Yugeru" (資格). Kartu hasil 1080×1350 digambar canvas, dibagikan via Web Share API (file) → share URL → salin teks.

## Fase 6

- **Lighthouse via Chrome DevTools MCP**: Accessibility 96 → 100 setelah perbaikan nama aksesibel; Best Practices 100; SEO 100. Kategori Performance tidak tersedia di alat itu, jadi diukur lewat trace Core Web Vitals (lihat ARCHITECTURE.md).
- **`public/llms.txt`** ditambahkan agar audit "agentic browsing" mendapat peta situs ringkas.
- **Konten CRT diperbesar di layar potret** (unit skala memakai lebar ×1.45) agar teks siaran terbaca di HP.

## Publikasi

- **Repo `Dans-Vsa/shikaku-fanblog`**, nama mengikuti pola `sasaki-fanblog`; disajikan GitHub Pages dari branch `gh-pages` di `/shikaku-fanblog/` (base Vite + `basename` router; `404.html` = salinan `index.html` untuk deep link).
- **Deploy lewat `tools/deploy.mjs`** (meniru hub 17-26), bukan GitHub Actions: commit `gh-pages` dibuat dengan identitas git lokal sehingga satu-satunya kontributor tetap pemilik repo (tanpa `github-actions[bot]`).
- **Tautan jaringan**: footer + halaman /fujimoto menaut ke Fujimoto Archive dan `before-chainsaw-man-fanblog/17-21/#shikaku`; kedua hub itu menaut balik lewat field `blog` / `site` masing-masing.

## Gambar resmi (2026-10-27)

- **Ilustrasi buatan sendiri diganti gambar resmi** atas permintaan pemilik situs ("biar relate untuk perkenalan/promosi"): halaman judul manga, sampul karya, key visual, desain karakter, frame PV. Semua dengan atribusi; sumber di `ASSETS.md`.
- **Sumber diutamakan dari repo milik sendiri** (Fujimoto Archive, hub 17-26) lalu situs resmi anime & thumbnail YouTube resmi. Gambar dari artikel berita yang memakai proteksi hotlink **tidak** diambil (tidak mem-bypass kontrol akses).
- **Koreksi fakta penampilan**: brief menyebut Shikaku berseragam pelaut hitam dan Yugeru berjubah bangsawan; gambar resmi menunjukkan hoodie + syal + sabuk senjata dan kemeja + bretel. Semua teks ID/EN, keluhan simulasi, dan alt text disesuaikan.
- **Simulasi** memakai desain resmi Yugeru (grayscale agar menyatu dengan estetika tinta; merah tetap hanya untuk regenerasi). **Siaran Babak 5** memakai close-up resmi dari Special PV, tetap melewati shader CRT. Gambar vektor lama hanya jadi cadangan selama gambar dimuat.
- `Silhouettes.tsx` & `BurningFigure` dihapus (tak terpakai). Agni diwakili sampul Fire Punch vol. 1.
- `vite preview` kini memakai base produksi (`isPreview`), agar preview lokal identik dengan GitHub Pages.
