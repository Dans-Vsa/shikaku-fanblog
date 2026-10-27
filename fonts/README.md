# Fonts

Font di situs ini di-self-host lewat paket `@fontsource/*` (lisensi SIL Open Font License).
Vite menyalin file `.woff2` ke `dist/assets/` saat build, lengkap dengan `unicode-range`
sehingga browser hanya mengunduh subset glyph yang benar-benar dipakai (penting untuk font Jepang).

Folder ini disediakan untuk font tambahan buatan sendiri bila kelak diperlukan.
Daftar lengkap font + lisensi: lihat `ASSETS.md` dan halaman `/kredit`.
