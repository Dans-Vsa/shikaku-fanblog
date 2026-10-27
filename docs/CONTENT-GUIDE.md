# CONTENT GUIDE

## Label kejujuran

Setiap klaim memakai salah satu label (`Tag` / `{{tag:...}}` di JSON):

| Label | Kapan dipakai |
| --- | --- |
| `[FAKTA]` / `fact` | Diverifikasi dari sumber resmi/kredibel: situs resmi anime, VIZ, pengumuman Prime Video, kanal YouTube avex pictures, Wikipedia (untuk data rilis) |
| `[ANALISIS FANS]` / `fan` | Tafsiran penggemar yang beralasan dari teks |
| `[TEORI FANS]` / `theory` | Spekulasi yang tidak bisa diverifikasi (mis. "Shikaku adalah prototipe Power") |
| `[OPINI]` / `opinion` | Pendapat penulis situs |
| `[DRAMATISASI]` / `dramatized` | Adegan yang diparafrasekan/didramatisasi (scrollytelling, montase) |

## Aturan

1. **Jangan menyalin dialog manga.** Semua adegan diparafrasekan dengan kata-kata sendiri.
2. **Angka & detail yang tidak terverifikasi ditulis umum.** Contoh: "365 hari" di Babak 2
   diberi label dramatisasi dan catatan "simbolis"; jumlah percobaan pembunuhan tidak ditulis.
3. **Staf episode anime tidak dicantumkan** (sesuai brief), walaupun situs resmi memuatnya.
   Yang boleh: 8 episode, Shikaku = episode 4, studio GRAPH77, Kana Hanazawa (Shikaku),
   Tomokazu Sugita (Yugeru), Prime Video awal November 2025, trailer per cerita dari Avex.
4. **Spoiler** dibungkus `{{s:...}}` (inline) atau komponen `<Spoiler>` (blok). Mode aman spoiler
   aktif secara default dan menyensor semua bagian itu di seluruh situs.
5. **Istilah** yang punya entri glosarium ditandai `{{g:id|label}}` agar mendapat tooltip.
6. **Dua bahasa wajib.** Setiap file di `src/content/id/` punya pasangan di `src/content/en/`
   dengan struktur kunci yang sama.
7. Hindari menebak pronomina tokoh di luar cerita Shikaku; untuk tokoh lain (mis. di Fire Punch)
   gunakan rujukan netral ("tokoh").

## Markup ringan di JSON

`{{g:termId|label}}` istilah glosarium · `{{s:teks}}` spoiler inline · `{{tag:fact}}` label ·
`{{jp:刺客}}` teks Jepang · `**tebal**` · `*miring*`. Parser: `src/components/ui/rich.tsx`.

## Fakta yang sudah diverifikasi (2026-10-27)

- Shikaku: one-shot 2014, Jump SQ.19; cerita ke-4 di *17-21* (Shueisha 4 Okt 2021; VIZ 17 Jan 2023).
- Situs resmi anime: Yugeru bosan setelah ±3.500 tahun hidup abadi; Shikaku gadis yang terkenal sebagai pembunuh bayaran.
- Imbalan 100 juta dolar (Wikipedia).
- Anime *Tatsuki Fujimoto 17-26*: bioskop Jepang terbatas mulai 17 Okt 2025, Prime Video global 7 Nov 2025 (8 Nov JST).
- Trailer resmi Shikaku: `RNXHeI0Sly8` (kanal avex pictures, diverifikasi via oEmbed).
