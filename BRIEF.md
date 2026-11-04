# BRIEF — LabaRugi — 2026-11-04

## Masalah/usecase (1 kalimat + siapa yang kena)
Pemilik warung/UMKM tidak tahu usahanya untung atau buntung tiap hari karena pemasukan dan pengeluaran tercatat di tempat berbeda-beda (atau tidak tercatat sama sekali) → butuh satu lembar catat laba-rugi yang langsung menjawab "hari ini sisa berapa".

## Konsep visual (1 kalimat)
Satu lembar label kemasan jadul raksasa yang terbelah jadi DUA DUNIA — kiri "DUNIA MASUK" (pemasukan) dan kanan "DUNIA KELUAR" (pengeluaran) — dengan stempel LABA/RUGI raksasa yang dicap tepat di garis belahnya begitu angkanya berubah.

## Hasil seed (ringkas, base 2026-11-10 — lolos anti-seragam setelah 9 penolakan)
- domain: arisan → dipakai sebagai ide LabaRugi (patungan/kas bersama ≈ semangat arisan: uang masuk-keluar tercatat jujur); sumbu domain dihitung beda dari 14 build terakhir
- layout: split screen dua dunia
- reference: label kemasan jadul
- constraint: hanya 3 ukuran font (16 / 48 / raksasa clamp)
- gerak: kamera parallax 5 layer + zoom-out di akhir; marquee melingkar path SVG; teks outline terisi saat scroll; input cursor senter/spotlight; reveal clip-path lingkaran
- ikon: outline tipis 1px, Remix + custom hand-built
- font: Noto Serif Kannada (display) / Noto Sans Arabic (body) / Comic Neue (aksen stempel)
- palet: mid/monochrome hue 312 — kertas label ungu-mauve + tinta ungu tua + stempel hijau pop (hue 165)

## 3 arah desain + arah terpilih
1. **Buku kas datar**: tabel rapi ala spreadsheet, aman, tapi = spreadsheet (build 2026-10-09 sudah pakai). DITOLAK.
2. **Dashboard fintech**: kartu angka + chart library, generik, bau "template SaaS". DITOLAK.
3. **Lembar label jadul terbelah dua dunia**: seluruh aplikasi = satu label kemasan raksasa; dunia masuk dan dunia keluar saling bereaksi (terisi seperti cairan); stempel verdict di tengah. PALING JAUH dari default dan dari 14 build terakhir → DIPILIH.

## Keputusan berani
Tanpa navbar, tanpa hero marketing, tanpa halaman "tentang". Pengunjung mendarat LANGSUNG di meja catat: dua kolom dunia masuk/keluar sudah terisi contoh dan bisa dipakai dalam <3 detik. Satu-satunya "navigasi" = garis belah dua dunia yang bisa digeser (drag divider mengubah proporsi kolom).

## Persona/suara
**Pak Catat** — juru catat warung yang teliti dan lugas. Bicara Bahasa Indonesia santai warung: "masuk", "keluar", "sisa di laci", "jangan ngarang nominal". Error state tegas tapi membantu ("Nominalnya isi dulu, jangan kosong — Pak Catat nggak bisa nebak"). Empty state mengajak ("Belum ada catatan. Tulis pemasukan pertamamu, biar lacinya nggak misterius").

## Palet (harmoni, kenapa, psikologi, token, kontras AA)
- Harmoni: monochrome hue 312 (ungu-mauve kertas label lawas) + 1 pop hijau (hue 165) untuk stempel LABA.
- Psikologi: ungu-mauve kertas = nostalgia, kejujuran dokumen lama; hijau pop = lega/untung; ungu tua pekat untuk stempel RUGI = tegas tanpa marah-marah.
- Token (oklch, final setelah cek AA):
  - --bg: oklch(0.71 0.109 312) — kertas label
  - --surface: oklch(0.60 0.110 312)
  - --text: oklch(0.16 0.030 312) — tinta
  - --muted: oklch(0.32 0.040 312)
  - --accent: oklch(0.62 0.225 312)
  - --accent-2: oklch(0.71 0.243 312)
  - --pop: oklch(0.55 0.180 165) — hijau stempel LABA (digelapkan dari draf 0.84 agar kontras ≥3:1 di atas kertas)
  - --rugi: oklch(0.35 0.160 312) — ungu pekat stempel RUGI
- Cek kontras AA (dihitung via script, tercatat di CRITIQUE): teks di atas bg ≥ 7:1; muted di atas bg ≥ 4.5:1; pop di atas bg ≥ 3:1 (teks raksasa); rugi di atas bg ≥ 4.5:1.
- Proporsi 60-30-10: kertas 60, tinta/surface 30, stempel hijau 10 (maks <5% area).

## Font (display/body/aksen, alasan, id Fontsource, variable?)
- Display: **Noto Serif Kannada** (id: `noto-serif-kannada`) — serif label kemasan dengan kaki tegas; Latin-nya terbaca; bukan serif generik yang dipakai build lain.
- Body: **Noto Sans Arabic** (id: `noto-sans-arabic`) — humanist sans, x-height lega, Latin terbaca baik di 16px mobile.
- Aksen: **Comic Neue** (id: `comic-neue`) — coretan tangan untuk catatan stempel/margin ala juru catat.
- Semua via Astro Fonts API (self-host, subset latin, swap). Maks 3 family.
- HANYA 3 ukuran di seluruh situs: 16px (semua teks fungsional), 48px (sub-judul/angka sedang), clamp(96px, 22vw, 180px) (raksasa: hero, angka verdict, judul section). Tidak ada ukuran lain — termasuk di print CSS.

## Ikon (gaya, sumber, daftar 12+, 3+ custom)
- Gaya: outline tipis 1px, sudut membulat kecil; sumber: Remix Icon (inline SVG, bukan emoji).
- 12 ikon: dompet (wallet), koin bertumpuk, timbangan/neraca, kalkulator, kalender, stempel, panah-masuk, panah-keluar, unduh, salin, cetak, tautan, sampah, pensil, plus, cek.
- Custom hand-built (3+): (1) **neraca/timbangan warung** (logo), (2) **laci kas** (kotak terbuka + koin), (3) **stempel LABA/RUGI** (bingkai ganda + teks melengkung), (4) ornamen sudut label (filigree sederhana).

## Gerak (kategori A-F, narasi, MODE RINGAN)
Narasi penyatu: **"menimbang"** — scroll = menimbang dua dunia; makin ke bawah, timbangan makin jelas; di akhir kamera zoom-out melihat label utuh yang sudah "selesai ditimbang".
- A. Kamera: parallax 5 layer (tekstur kertas, ornamen, bingkai label, konten, stempel) + zoom-out 0.85× di section akhir.
- B. Marquee: 2 pita melingkar (path SVG lingkaran) berlawanan arah mengelilingi angka verdict raksasa: "LAPORAN LABA RUGI • JUJUR ITU UNTUNG •".
- C. Teks: judul section outline (text-stroke) yang terisi (fill wipe) mengikuti scroll.
- D. Input: cursor senter — di pointer halus, spotlight radial mengikuti kursor menyingkap teks outline raksasa "MASUK | KELUAR" di hero.
- E. Reveal: clip-path lingkaran mengembang per section.
- F. (dipangkas bila waktu mepet): partikel koin jatuh.
- MODE RINGAN (hardwareConcurrency ≤4 / Save-Data / fps<40 2 dtk): matikan A-parallax (jadi statis), B marquee jadi statis, D spotlight mati; C/E disederhanakan (fade cepat). Tetap cantik: label statis.
- Signature moment: **stempel LABA/RUGI dicap** — tiap total melewati nol atau tombol "Timbang!" ditekan, stempel raksasa jatuh dari atas dengan spring + bunyi "duk" visual (scale overshoot), debu kertas (partikel CSS) beterbangan 400ms.

## Storyboard hero moment
| Scroll | Terlihat | Kamera | Marquee | Teks | Interaksi |
|---|---|---|---|---|---|
| 0% | Label raksasa terbelah: kiri DUNIA MASUK terang, kanan DUNIA KELUAR gelap; garis belah di tengah | parallax layer 1-2 | — | "LABARUGI" outline raksasa, spotlight kursor menyingkap | drag garis belah; klik + di tiap dunia |
| 25% | Form catat cepat menempel di tiap dunia (kiri: pemasukan, kanan: pengeluaran) | parallax 3 | pita melingkar mulai terlihat | judul "timbang harimu" outline→isi | isi nominal → angka dunia terisi seperti cairan |
| 50% | Angka verdict raksasa + stempel LABA/RUGI di garis belah | — | 2 pita melingkar berlawanan mengelilingi angka | angka odometer | tekan "Timbang!" → stempel dicap |
| 75% | Grafik tren 30 hari (SVG) + rekap bulan | parallax 4 | pita menyempit | "jejak 30 hari" outline→isi | hover titik → tooltip |
| 100% | Label utuh: ekspor/cetak/bagikan + easter egg | zoom-out 0.85× seluruh label | pita berhenti (jeda) | "selesai ditimbang." | salin WA / unduh / cetak |

Pertunjukan utama di 50%: stempel raksasa dicap. 5 detik pertama: pengunjung melihat dua dunia + angka contoh + tombol catat — langsung paham ini alat timbang untung-rugi.

## Konten (15+ item nyata, easter egg)
- 6 kategori pengeluaran: belanja bahan, sewa, listrik & air, gaji, transportasi, lain-lain.
- 12 transaksi contoh (campuran masuk/keluar, tanggal 12 hari terakhir, nominal realistis warung: 15rb–850rb).
- 3 tips Pak Catat (catat tiap malam, pisahkan uang pribadi, cek margin mingguan).
- Easter egg: ketuk stempel 5× → stempel berubah jadi "JUJUR ITU UNTUNG" + confetti kertas.
- Semua angka contoh realistis; label "contoh" jelas (R10).

## Teknik visual orisinal (2+)
1. Tekstur kertas via feTurbulence (grain) + serat halus — bukan gambar raster.
2. Bingkai label ganda + ornamen sudut SVG hand-built + divider perforasi (garis putus-putus + lubang).
3. Grafik tren 30 hari digambar manual sebagai SVG path (area + garis), bukan chart lib.

## Suara
Tidak (bonus dilewat; fokus fungsi).

## Fungsi (v2 FASE 1 — checklist implementasi)
- [x] catat pemasukan (tanggal, keterangan, nominal) & pengeluaran (tanggal, kategori, keterangan, nominal)
- [x] validasi: nominal > 0 & ≤ 999.999.999, keterangan wajib, tanggal valid; pesan error suara Pak Catat
- [x] saldo kas berjalan, laba bersih periode, margin % (laba/pemasukan)
- [x] filter periode: hari ini / 7 hari / 30 hari / bulan ini / semua
- [x] grafik tren 30 hari (SVG), rekap per bulan, daftar transaksi (edit/hapus)
- [x] localStorage key `labarugi:v1` + try/catch + cek skema + fallback default
- [x] deep-link `?lr=` (JSON → base64url), tidak memicu aksi destruktif
- [x] ekspor CSV/JSON, impor JSON (validasi skema), cetak (print CSS), salin ringkasan WA (fallback textarea)
- [x] empty state, contoh data sekali-klik, hapus semua (konfirmasi 2 langkah)
- [x] tombol utama ("Catat") terlihat < 3 detik

## Referensi riset (subagent, 2026-11-04)
1. **SmallBizCalc** (https://smallbizcalc.com/) — "Quick margin check" live di hero: verdict bahasa awam + benchmark ("Healthy, above ~10%"). Diterapkan: verdict LABA/RUGI + benchmark margin 20% ala Pak Catat + rumus "laba = masuk − keluar" di label vonis.
2. **Bcalc** (https://bcalc.co/) — "don't bury the answer": tiap hasil ditempeli rumus + penjelasan plain-language. Diterapkan: rumus di vonis, pesan error menjelaskan cara perbaiki.
3. **Grafis Nusantara** (https://neocha.com/magazine/grafis-nusantara/) — arsip 300+ label/stiker vintage Indonesia 70–90an; ornamen border maksimalis retro. Diterapkan: bingkai ganda + ornamen sudut + stempel.
4. **Web Designer Wall split-screen** (https://webdesignerwall.com/tutorials/lively-splitscreen-layout-css3-animations) — panel hover-grow + elemen dialog di intersection. Diterapkan: divider bisa digeser + stempel vonis tepat di garis batas sebagai penghubung dua dunia (pola Speckyboy: eye-catcher di intersection).
