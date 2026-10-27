# Audio

Semua SFX (tembakan, hantaman, ledakan, statis TV, detak jantung, kertas, ambience) disintesis
real-time dengan Web Audio API di `src/lib/audio-manager.ts`, sehingga situs selalu bersuara tanpa
mengunduh file. Folder ini disediakan untuk file audio CC0 opsional; bila ditambahkan, catat di
`ASSETS.md` dan daftarkan di `src/config/media.ts`.
