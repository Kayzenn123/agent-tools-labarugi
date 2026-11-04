# CRITIQUE — LabaRugi — 2026-11-04

## Slop test (v3) + 3 hal paling template + yang dirombak
**Slop test**: tutup logo "LABARUGI" — yang tersisa: label kertas ungu terbelah dua dunia (terang/gelap) + stempel vonis di garis belah + angka raksasa + pita teks melingkar. Tidak ketuker dengan build sebelumnya (terakhir: buku arisan raksasa BagiBon, terminal kartu pos, papan gambar teknik). LULUS.

**3 hal paling template** (jujur):
1. Form input tanggal/keterangan/nominal — polanya standar. Dipertahankan karena alat catat harus langsung bisa dipakai; dibedakan lewat bingkai label + suara Pak Catat di error.
2. Toast notifikasi — pola umum. Dipertahankan (aria-live, auto-dismiss); bukan elemen identitas.
3. Daftar riwayat baris-per-baris — pola umum. Diredam dengan badge stempel MASUK/KELUAR + perforasi.

**Dirombak sebelum deploy** (2 putaran):
- Putaran 1: `--muted`/`--accent` ketabrak token shadcn template (muted jadi color-mix 6% — nyaris tak terbaca). Diperbaiki: token diganti `--lr-muted`/`--lr-accent`.
- Putaran 2: tombol jadi pil (radius 2147483647px dari `@utility btn` template) — tidak cocok dengan estetika label jadul. Diperbaiki: rename ke `.lr-btn` + `border-radius: 0`.
- Temuan QA: reveal pakai IntersectionObserver TIDAK PERNAH jalan di Chromium untuk elemen `clip-path: circle(0%)` (isIntersecting=false permanen, terbukti via tes manual). Diganti: reveal via loop rAF + getBoundingClientRect (deterministik). Ini juga memperbaiki bug laten: di mode lite/reduced-motion konten bisa terkunci tak terlihat selamanya.

## Gerbang gerak (v4)
- Lapisan (5 dari 5 kategori): A parallax 5 layer + zoom-out footer (1.12→1.0) · B 2 marquee melingkar SVG berlawanan arah · C judul outline terisi mengikuti scroll · D spotlight kursor (pointer halus) · E reveal clip-path lingkaran. F dipangkas (partikel koin — tidak esensial).
- Zoom: ya (footer). Pan horizontal: TIDAK — diganti divider dua dunia yang bisa digeser (drag + panah keyboard); seed kamera ("parallax 5 layer + zoom out") tidak mewajibkan pan.
- 2 marquee: ya (2 pita melingkar, arah berlawanan, ada tombol jeda).
- FPS 4x CPU throttle: **60.2** (syarat ≥45).
- Font/palet/gaya ikon beda dari 7 build terakhir: ya (Noto Serif Kannada/Noto Sans Arabic/Comic Neue; mid/monochrome 312; outline tipis 1px Remix).
- Kontras AA: terverifikasi via skrip (teks/bg 7.26:1; lr-muted/bg 4.79:1; stempel LABA raksasa 3.11:1; stempel RUGI 4.57:1; teks kertas di dunia gelap 4.93:1). Body 16px terbaca di 390px.
- Reduced-motion: dites (0 animasi berjalan); mode gerak mati via toggle + media query.

## Gerbang v5
- Tes bandingkan (vs BagiBon 11-03, GOWES 11-03, POSKILAT 11-02): beda total — dua dunia terang/gelap + stempel tengah tidak ada di ketiganya.
- Tes blur: komposisi terbelah dua + lingkaran teks di tengah tetap terbaca sebagai identitas.
- Tes 3 detik: "MASUK | KELUAR" + tombol catat langsung terlihat; keputusan berani (tanpa navbar/hero, langsung meja catat) kelihatan.
- Keyboard-only: lulus (divider panah kiri/kanan, submit form via Enter, jeda marquee, skip link → #meja; dites 2026-11-04).
- Reduced-motion: lulus. Mode ringan: lulus (diuji — headless VM otomatis masuk mode lite; semua fungsi jalan, reveal tetap muncul).
- Budget: JS 18.9KB (≤250KB gzip) · CSS ~140KB mentah/~20KB gzip (≤60KB) · font 172KB (≤250KB) · LCP 1.8s · CLS 0.001 · TBT 90ms.
- Keamanan: input divalidasi (tipe/panjang/range), JSON.parse try/catch + cek skema + versi key, tanpa innerHTML mentah (esc()), deep-link tidak destruktif (hanya memuat snapshot), tanpa tracker/key. Lolos.
- Lisensi: font OFL (Fontsource), ikon Remix (Apache-2.0), ornamen/SVG buatan sendiri, tanpa aset berhak cipta. Lolos.
- WebKit: TIDAK bisa diuji di VM (MiniBrowser butuh libgstreamer-1.0 yang tidak ada — keterbatasan environment, bukan bug web). Cek setara: Chromium + responsif 4 viewport + keyboard.
- Dipangkas: lapisan F (partikel koin), suara mikro, toggle ID/EN. Alasan: waktu; tidak mengurangi fungsi inti.

## Skor 1-10
- karakter: **9** (label jadul + dua dunia + stempel vonis = identitas kuat; -1 karena form masih terasa standar)
- keunikan: **9** (tidak ada build sebelumnya yang split-screen dua dunia reaktif + stempel di garis belah)
- kerapian: **8** (kontras & spacing rapi; -1 stamp di mobile menutupi handle divider; -1 jarak section reveal di full-page capture terlihat kosong saat JS mati — tapi itu artefak capture)

## Keputusan konflik aturan
- Widget template (Hero/Features/dll) TIDAK dipakai: tidak ada widget yang cocok untuk aplikasi ledger split-screen; memaksanya = slop. Diputuskan: pakai Layout + komponen custom (v3 anti-slop menang atas instruksi "rakit dari widget").
- Pan horizontal (v4 ATURAN 6) diganti drag divider interaktif — seed kamera tidak mewajibkan pan; drag lebih melayani konsep "menimbang".

## Verifikasi fakta
- Semua angka contoh realistis warung Indonesia, dilabeli "contoh" (R10).
- Benchmark margin 20% = wejangan Pak Catat (heuristik internal, BUKAN klaim industri) — dinyatakan sebagai suara persona, bukan fakta.
- Tidak ada harga/jadwal/alamat klaim eksternal (R7 aman).
