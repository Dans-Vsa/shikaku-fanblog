# SHIKAKU · シカク — fanblog & wiki interaktif

Situs penggemar non-komersial (ID/EN) untuk one-shot **Shikaku** karya Tatsuki Fujimoto
(Jump SQ.19, 2014; kumpulan *Tatsuki Fujimoto Before Chainsaw Man: 17-21*). Sekaligus
portofolio front-end: scrollytelling lima babak, simulasi eksekusi dengan *game feel*,
shader CRT WebGL, i18n, aksesibilitas, dan performa.

> *Dia disewa untuk membunuh. Dia tidak bisa mati.*

## Menjalankan

Butuh Node.js ≥ 20 (diuji di Node 25).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck (tsc -b) + build produksi ke dist/
npm run preview    # sajikan dist/ di http://localhost:4173
npm run lint       # ESLint (flat config)
npm run format     # Prettier
```

Opsional (hanya bila menambah teks Jepang baru):

```bash
pip install fonttools brotli
npm run fonts      # subset ulang Zen Antique & Dela Gothic One ke glyph yang dipakai
```

### Parameter URL untuk pengujian

| Parameter | Fungsi |
| --- | --- |
| `?debug=1` | Monitor FPS + pemilih kualitas + panel parameter shader CRT (di Babak 5) |
| `?quality=high\|medium\|low` | Paksa level kualitas (lewati benchmark) |
| `?webgl=0` | Paksa fallback CSS non-WebGL untuk shader CRT |

## Deploy

**Live:** https://dans-vsa.github.io/shikaku-fanblog/ — bagian dari
[Fujimoto Archive](https://dans-vsa.github.io/fujimoto-archive/) dan hub
[Before Chainsaw Man 17-21 & 22-26](https://dans-vsa.github.io/before-chainsaw-man-fanblog/17-21/#shikaku).

- **GitHub Pages (utama)**: `npm run deploy` — build dengan base `/shikaku-fanblog/`, salin
  `index.html` → `404.html` (deep link SPA), lalu force-push `dist/` ke branch `gh-pages`
  sebagai satu commit atas nama identitas git lokal.

Situs statis (SPA). Semua route harus jatuh ke `index.html`. Untuk hosting di root domain,
build dengan `VITE_BASE=/ npm run build`.

- **Vercel**: `vercel.json` sudah berisi rewrite + cache header aset. Build command `npm run build`, output `dist`.
- **Netlify**: `public/_redirects` sudah ada (`/* /index.html 200`). Build `npm run build`, publish `dist`.
- **Hosting statis lain**: unggah `dist/` dan arahkan 404 ke `index.html`.

## Peta situs

| Route | Isi |
| --- | --- |
| `/` | Hook + simulasi "Eksekusi Target" + dua jalur (belum baca / fans) |
| `/baca` | Scrollytelling 5 babak (kontrak → montase → sunyi → arsip → siaran TV CRT) |
| `/wiki` (+ `/karakter`, `/sinopsis`, `/tema`, `/kanji`, `/produksi`, `/glosarium`) | Wiki lengkap |
| `/anime` | Episode 4 *Tatsuki Fujimoto 17-26*, trailer resmi (facade), slider before/after |
| `/fujimoto` | Timeline horizontal karier + DNA Fujimoto |
| `/komunitas` | Dinding panel favorit, kuis + kartu hasil, papan tafsiran (localStorage via adapter) |
| `/baca-resmi` | Tautan legal (VIZ, Shueisha, Prime Video, situs resmi) |
| `/kredit` | Atribusi aset & lisensi |

## Dokumentasi

- [`docs/DESIGN.md`](docs/DESIGN.md) — art direction, token, aturan `--chaos`, nilai final shader
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — struktur, alur data, hasil profiling
- [`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md) — aturan fakta vs analisis vs opini
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — log keputusan
- [`ASSETS.md`](ASSETS.md) — semua aset & lisensi

## Hak cipta

Shikaku © Tatsuki Fujimoto / Shueisha. Situs ini tidak berafiliasi dengan Shueisha, VIZ
Media, Avex Pictures, atau Amazon. Gambar resmi (halaman judul manga, sampul, key visual, desain
karakter, frame PV) dipakai untuk ulasan dan promosi dengan atribusi pemegang hak; sumbernya
dicatat di `ASSETS.md`. Dukung karya aslinya lewat jalur resmi.
