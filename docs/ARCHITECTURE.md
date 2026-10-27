# ARCHITECTURE

## Ringkasan

SPA statis: Vite 8 + React 19 + TypeScript (strict) + React Router 7 (data router, `lazy`
per route). Tanpa backend. Semua animasi scroll lewat **satu ticker** (`gsap.ticker`) yang
juga menggerakkan Lenis.

```
main.tsx ─ fonts (fontsource + subset JP), globals.css, i18n, setupGsap
  └ App ─ I18nProvider → MotionProvider → PerformanceProvider → AudioProvider → SpoilerProvider
       └ RouterProvider (createBrowserRouter, route lazy = chunk per halaman)
            └ RootLayout ─ PaperBackground · ProgressInk · Navbar · <Outlet/> · Footer
                           PageTransition · CustomCursor · FpsOverlay(?debug)
```

## Provider (`src/app/providers`)

| Provider | State | Persist |
| --- | --- | --- |
| I18n | `lang` (id/en), transisi fade 160 ms tanpa reload | `localStorage: shikaku:lang` |
| Motion | `pref` system/full/reduced → `html[data-motion]` | `shikaku:motion-pref` |
| Performance | `quality` high/medium/low (heuristik → benchmark median frame time → auto-downgrade bila FPS < 42 dua jendela 2 detik), `webgl` | sesi |
| Audio | `muted` (default true). Modul audio di-lazy-load saat suara dinyalakan | `shikaku:muted` |
| Spoiler | `hidden` (default true = mode aman) → `html[data-spoilers]` | `shikaku:spoilers-hidden` |

Context ada di `contexts.ts`; hook akses di `src/hooks/useProviders.ts`.

## Fitur (`src/features`)

| Fitur | Inti |
| --- | --- |
| `execution-sim` | `ExecutionEngine` (kelas TS murni): 1 canvas, 1 rAF, pool partikel typed-array, trauma shake, hit-stop, slow-mo, state machine regenerasi. React hanya HUD. Input diproses sinkron (render + SFX di frame yang sama). |
| `crt-effect` | `BroadcastCanvas` (konten 2D) → `CrtPipeline` (OGL, 1 triangle, 1 fragment shader) ; `timeline.ts` memetakan progres → uniform ; fallback CSS ; `DebugPanel` |
| `kanji-morph` | Sample piksel teks → partikel 刺客→資格, dipakai di /wiki/kanji dan di dalam siaran CRT |
| `split-screen` | Montase sticky + GSAP scrub (transform saja) |
| `emotion-map` | Garis mood SVG di tepi kanan; dihitung ulang saat `ScrollTrigger` refresh |
| `spoiler-ink` | `Spoiler` (inline/blok, `inert` saat tertutup) + `SpoilerToggle` |
| `glossary-tooltip` | Tooltip portal, posisi dihitung sekali saat dibuka |
| `quiz` | Skor 2 sumbu + `renderResultCard` (canvas → PNG, Web Share API / unduh) |
| `before-after-slider` | `clip-path` + pegangan `transform`, `role="slider"` |
| `custom-cursor` | Titik + cincin, state dari `data-cursor`, posisi via `gsap.ticker` |
| `page-transition` | Tirai tinta 2 lembar; tutup → navigate → buka (`useLayoutEffect`) |

Komunitas memakai `CommunityStore` (`src/lib/community-store.ts`); implementasi saat ini
`LocalCommunityStore`. Ganti dengan adapter REST tanpa menyentuh UI.

## Konten

`src/content/{id,en}/*.json`, diimpor statis oleh chunk halaman (ganti bahasa instan).
Markup ringan (`{{g:}}`, `{{s:}}`, `{{tag:}}`) dirender `rich.tsx`. String UI global via
i18next (`ui.json`).

## Prinsip performa

- Animasi hanya `transform` / `opacity` / `clip-path`; tidak ada listener scroll liar
  (Lenis → `onLenisScroll`; fallback native hanya saat Lenis mati).
- Render berat (simulasi, CRT) hanya berjalan saat terlihat (`IntersectionObserver`) dan tab aktif.
- CRT: resolusi, bloom tap, mask, noise mengikuti level kualitas; context WebGL dilepas
  (`loseContext`) saat unmount; canvas dibuat baru per mount (aman untuk StrictMode/HMR).
- Code splitting per route; audio (Howler + sintesis), OGL, dan halaman berat dimuat saat dibutuhkan.
- Font Jepang di-subset (~108 KB total untuk dua keluarga, hanya glyph yang dipakai, dimuat per `unicode-range`).

## Hasil profiling (build produksi, `vite preview`, 2026-10-27)

### Ukuran bundle (gzip)

| Chunk | gzip |
| --- | --- |
| `index` (React, Router, i18next, GSAP+ScrollTrigger, Lenis, layout) | 157 KB |
| `Read` (/baca + OGL + shader + split/emotion map) | 34.5 KB |
| `jsx-runtime` + shared | 19 KB |
| `ExecutionSim` | 12 KB |
| `audio-manager` (Howler + sintesis, lazy) | 11.6 KB |
| CSS utama | 11.4 KB |
| Halaman lain | 1–9 KB masing-masing |

### Lighthouse (Chrome DevTools MCP, landing `/`)

| Kategori | Desktop |
| --- | --- |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

Temuan a11y awal (ARIA terlarang di `<dd>`, nama aksesibel tidak memuat teks terlihat pada
logo/toggle bahasa/toggle spoiler) sudah diperbaiki; skor naik dari 96 ke 100.

### Trace performa (Core Web Vitals lab)

| Skenario | LCP | CLS |
| --- | --- | --- |
| Desktop, tanpa throttling | 273 ms | 0.00 |
| Mobile 412×915, CPU 4× lebih lambat | 1 282 ms | 0.00 |

Dengan LCP < 1.3 s pada CPU 4× dan CLS 0, skor Performance Lighthouse diperkirakan ≥ 90
(target brief ≥ 85).

### Runtime

- Simulasi: satu canvas; partikel dibatasi 520/300/160 (High/Medium/Low); tidak ada alokasi
  per frame di loop partikel.
- CRT: satu draw call per frame; tekstur konten di-upload sekali per frame; loop berhenti saat
  section keluar layar. Pada kualitas Low tanpa bloom dan resolusi ½.
- Mode performa otomatis menurunkan kualitas saat FPS < 42 selama 2 jendela berturut (toast diumumkan via `role="status"`).
- Monitor FPS & pemilih kualitas: `?debug=1`.

### Matriks fallback yang diuji

| Kondisi | Hasil |
| --- | --- |
| WebGL tersedia | Shader OGL penuh |
| `?webgl=0` / WebGL gagal / context lost | Fallback CSS (scanline, flicker, aberasi palsu, kertas tertarik, tabung menyala/padam) |
| `prefers-reduced-motion` / toggle gerak | Lenis mati, montase & timeline statis, CRT statis (waktu beku), simulasi tanpa shake |
| Tanpa audio / mute (default) | Modul audio tidak diunduh sama sekali |
| Tanpa embed video | Facade buatan sendiri + tautan YouTube & halaman trailer resmi |
| Mode aman spoiler | Teks spoiler tertutup tinta + `inert`; siaran Babak 5 disensor |
