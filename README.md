# LabaRugi — Lembar Timbang Untung-Rugi Warung

Satu lembar label kemasan jadul raksasa yang terbelah jadi **dua dunia** — kiri
"DUNIA MASUK" (pemasukan), kanan "DUNIA KELUAR" (pengeluaran). Di garis belahnya
dicap stempel **LABA / RUGI / IMPAS** raksasa setiap angkanya berubah.

**Live:** https://kayzenn123.github.io/agent-tools-labarugi/

## Fitur

- Catat pemasukan & pengeluaran (tanggal, kategori, keterangan, nominal) dengan
  validasi suara Pak Catat — 100% client-side, offline, tanpa akun.
- Laba bersih + margin % otomatis, lengkap dengan benchmark 20% ("warungmu sehat
  / cek belanja bahanmu").
- Filter periode: hari ini / 7 hari / 30 hari / bulan ini / semua.
- Grafik tren 30 hari (SVG murni, titik interaktif), rekap per bulan, buku catatan
  (cari, ubah, hapus), contoh data sekali klik.
- Deep-link `?lr=` (bagikan snapshot data), ekspor CSV/JSON, impor JSON, cetak
  laporan, salin ringkasan WA.
- localStorage berversi (`labarugi:v1`) + validasi skema; data rusak → fallback aman.
- Aksesibilitas: keyboard-only penuh, skip link, tombol jeda marquee, toggle gerak,
  `prefers-reduced-motion`, mode ringan otomatis (CPU/RAM kecil, Save-Data).

## Teknologi

Astro 7 + Tailwind v4 (template web-starter Astrowind, halaman custom),
vanilla JS tanpa dependency untuk logika aplikasi, ikon Remix (outline tipis),
font Noto Serif Kannada / Noto Sans Arabic / Comic Neue via Astro Fonts API.
Hanya 3 ukuran font di seluruh situs (16px / 48px / raksasa).

## Skor

- Lighthouse mobile: **93 / 100 / 100 / 100** (performance / accessibility /
  best-practices / SEO), desktop: **100 / 100 / 100 / 100**
- qa.js: exit 0 (4 viewport, tanpa overflow, tanpa console error, tap target ≥44px)
- FPS CPU throttle 4x: **60.2** · 17/17 tes fungsi lulus · keyboard-only lulus
- Kontras WCAG AA terverifikasi via skrip (lihat CRITIQUE.md)

## Cara jalanin lokal

```bash
npm install
npm run dev     # http://localhost:4321/agent-tools-labarugi/
npm run build   # output ke dist/
```

## Struktur

- `src/pages/index.astro` — seluruh halaman aplikasi
- `src/assets/styles/labarugi.css` — desain (token di `CustomStyles.astro`)
- `public/js/labarugi.js` — logika aplikasi (store, render, grafik, ekspor)
- `BRIEF.md` — konsep & storyboard · `CRITIQUE.md` — gerbang kritik
- `seed.json` — konstrain seed hari build · `screenshots/` — bukti QA

## Lisensi & kredit

Kode: MIT. Font: SIL OFL (via Fontsource). Ikon: Remix Icon (Apache-2.0).
Ornamen & ilustrasi SVG: buatan sendiri.
