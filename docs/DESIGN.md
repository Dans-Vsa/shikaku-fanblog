# DESIGN — "Absurdist Romantic Gore"

Dokumen ini berfungsi sebagai `DESIGN.md` proyek (sistem desain sumber kebenaran).
Lembaran kertas manga cetak hitam-putih yang bertabrakan dengan elemen modern yang kacau.

## Warna (`src/styles/tokens.css`)

| Token | Nilai | Aturan |
| --- | --- | --- |
| `--paper` | `rgb(239 232 218)` | Dasar seluruh situs (kertas tua) |
| `--paper-deep` | `rgb(226 216 196)` | Panel sekunder |
| `--ink` | `rgb(20 18 16)` | Tinta: teks, garis, bayangan panel |
| `--ink-soft` | `rgb(74 68 61)` | Teks sekunder (kontras AA di atas kertas) |
| `--blood` | `rgb(179 18 27)` | **Hanya** regenerasi Yugeru (partikel di simulasi, tetes di ilustrasi hidangan) dan ledakan emosi Shikaku (kalimat terakhir pengakuan di Babak 5) |
| `--crt` / `--crt-blue` | `rgb(92 255 176)` / `rgb(127 216 255)` | **Hanya** Babak 5 (tema `tv`, tint fosfor shader) |
| `--paper-print` | `rgb(239 232 218)` | Kertas yang tidak ikut berubah di tema TV (transisi terbakar) |

Logo & favicon sengaja memakai titik tinta, bukan merah, agar `--blood` tetap mengejutkan.

## Tema

- `paper` (default): semua halaman.
- `tv`: diaktifkan otomatis oleh `CrtScreen` saat Babak 5 berada di layar (progres 0.045–0.975),
  lalu kembali ke `paper`. Ini bukan dark mode; ini perubahan medium dari kertas ke layar.
- `.invert-scope`: blok tinta penuh (kuis di `/komunitas`).

## Tipografi

| Peran | Font | Kelas |
| --- | --- | --- |
| Yugeru / body | Cormorant Garamond 500/700/500-italic | `t-yugeru`, default |
| Shikaku | Permanent Marker | `t-shikaku` |
| Coretan | Reenie Beanie | `t-scrawl` |
| Label arsip/UI | IBM Plex Mono | `t-label` |
| Kanji | Zen Antique (subset) | `jp` |
| Kanji tebal | Dela Gothic One (subset) | `font-jp-heavy` |

## Layout & `--chaos`

`--chaos` (0..1) ditulis hanya oleh `setChaos()` (`src/hooks/useScrollChaos.ts`).
Turunannya hanya `transform` (`.chaos-panel`, `.chaos-offset`, `PanelFrame chaotic`).

| Konteks | `--chaos` | `--mood` |
| --- | --- | --- |
| Babak 1 (arsip kontrak) | 0.05 | 0.30 |
| Babak 2 (montase) | 1.00 | 0.85 |
| Babak 3 (sunyi) | 0.00 | 0.05 |
| Babak 4 (galeri) | 0.12 | 0.35 |
| Babak 5 (siaran) | 0.75 | 1.00 |
| Landing | 0.55 | 0.40 |
| Komunitas / Fujimoto / Anime | 0.45 / 0.35 / 0.30 | sama |
| Wiki | 0.05–0.25 | sama |
| Kredit / Baca resmi | 0 / 0.05 | sama |

Momen hening = grid kaku, tegak, berjarak. Momen aksi/obsesi = panel miring, bertumpuk,
menembus bingkai. Progress bar tinta (`ProgressInk`) makin bergerigi mengikuti `--chaos`.

## Motion

- Easing: `--ease-ink` (0.7,0,0.2,1) untuk sapuan tinta, `--ease-snap` (0.2,1.4,0.3,1) untuk umpan balik tombol, `--ease-out` untuk masuk.
- Semua animasi hanya `transform`/`opacity`/`clip-path`. Satu ticker: `gsap.ticker` (Lenis, ScrollTrigger, kursor, monitor FPS, render CRT).
- Reduced motion (sistem atau toggle): Lenis mati, montase & timeline jadi daftar statis, shader statis (`uMotion = 0`, waktu dibekukan), simulasi tanpa shake/slow-mo/impact frame, transisi halaman tanpa tirai.

## Game feel simulasi (`src/features/execution-sim`)

| Aksi | Trauma | Hit-stop | Lainnya |
| --- | --- | --- | --- |
| Tembak | +0.16 | 45 ms | recoil pistol, selongsong, tracer, crosshair menyempit |
| Tebas | +0.42 | 75 ms | impact frame negatif 2 frame, tubuh terbelah |
| Ledakan | +0.95 | 90 ms | slow-mo 700 ms (×0.28), flash, shockwave, puing, ruang runtuh |

Trauma: offset = 26 px × trauma² × noise; rotasi 0.045 rad × trauma²; luruh 1.35/detik.
Urutan regenerasi: rusak → **tahan napas** (audio di-duck ke 4%, "……") → percikan merah →
pulih (easeOutBack) → keluhan (3 tingkat kebosanan, tanpa pengulangan berturut).

## Nilai final shader CRT (`src/features/crt-effect/quality-levels.ts`)

| Parameter | Nilai | Keterangan |
| --- | --- | --- |
| `curve` | 0.085 | barrel distortion |
| `scan` | 0.22 | kekuatan scanline (periode 3 px, teks tetap terbaca) |
| `mask` | 0.14 | shadow mask RGB triad |
| `aberr` | 0.0016 | aberasi dasar (+ intensitas × 0.014) |
| `noise` | 0.11 | statis analog |
| `roll` | 1.0 | rolling bar (horizontal hold) |
| `jitter` | 1.0 | jitter vertikal |
| `tear` | 1.0 | signal tearing |
| `bloom` | 0.7 | glow pada area terang |
| `flicker` | 1.0 | flicker tipis |
| `vignette` | 0.28 | eksponen vignette |

Level kualitas: High (skala 1×DPR ≤1920px, bloom 8 tap), Medium (0.75×, 4 tap, mask 0.8),
Low (0.5×, tanpa bloom, tanpa mask). Semua parameter bisa diatur live via `?debug=1`.

Timeline Babak 5 (progres scroll → `sceneAt()`): kertas terbakar 0–0.08 · tabung menyala
0.065–0.13 (flash ~0.1) · pembajakan 0.13–0.30 (intensitas puncak) · stabil 0.30–0.38 ·
pengakuan 0.38–0.58 · morph 刺客→資格 0.58–0.72 · jawaban Yugeru 0.72–0.86 · padam 0.86–0.97.
Semua kurva dari `smoothstep`, sehingga kontinu tanpa lompatan.
