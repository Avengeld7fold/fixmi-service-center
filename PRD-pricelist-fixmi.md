# PRD — Halaman Pricelist FIXMI

> Product Requirements Document
> Versi 1.0 · 5 Juli 2026
> Acuan visual: 2 screenshot desain (kartu kategori + akordeon jenis service + tabel harga multi-varian)
> Acuan teknis: PROJECT-REFERENCE.md §4 (design system), §5.1 (skala fluid), §6 (data layer), §8 (aturan pengembangan)

---

## 1. Latar Belakang & Tujuan

Halaman `/pricelist` adalah satu-satunya halaman yang dirujuk Navbar dengan modal data paling siap, namun masih 404. Harga adalah alasan utama pengunjung membuka website jasa reparasi — halaman ini adalah konversi terpenting setelah hero.

**Tujuan produk:**
1. Pengunjung menemukan harga service untuk device miliknya dalam ≤ 3 klik (kategori → jenis service → baris model).
2. Transparansi harga memperkuat positioning "diagnostic engineering" — harga bertingkat berdasarkan kualitas part + garansi, disajikan seperti spesifikasi teknis, bukan brosur diskon.
3. Data harga sepenuhnya dikelola client (lewat admin panel yang sudah dikonsultasikan terpisah) tanpa menyentuh kode.

**Non-goals (di luar lingkup versi ini):**
- Booking/checkout dari tabel harga (cukup CTA ke WhatsApp/contact).
- Perbandingan harga antar-toko, kalkulator estimasi, promo/diskon.
- Halaman admin itu sendiri (PRD terpisah — namun struktur data di §4 dokumen ini mengikat keduanya).

---

## 2. Referensi Desain (dari screenshot)

**Layar 1 — daftar kategori & jenis service:**
- Baris atas: 5 kartu kategori sejajar — Service iPhone, iPad, Macbook, iWatch, Android — masing-masing dengan foto produk dan label. Kategori aktif ditandai border oranye (`--fixmi-primary`).
- Di bawahnya: daftar akordeon jenis service milik kategori aktif (mis. "Harga LCD iPhone", "Harga Battery iPhone", "Harga Charger iPhone", "Harga Kamera iPhone", "Harga Face ID iPhone", "Harga Housing & Backglass iPhone"). Tiap baris: ikon di kiri (chip persegi rounded dengan ikon oranye), judul, tombol **+** di kanan.

**Layar 2 — akordeon terbuka:**
- Baris akordeon berubah: **+** menjadi **×** (tutup).
- Muncul kolom pencarian "Cari model / layanan…" di atas tabel.
- Tabel harga: kolom pertama = daftar model device (mis. iPhone 6 … iPhone XS), kolom-kolom berikutnya = **varian harga** dengan header dua baris: nama varian (ORIGINAL APPLE, OLED PREMIUM, OEM SCREEN, GRADE A SCREEN, ADD ON CHIP MOVE) + keterangan kecil (mis. "3 Bulan + Chip Move", "1 Bulan Warranty", "Biaya Pindah Chip LCD").
- Harga format Rupiah oranye (`Rp. 600.000`), varian yang tidak tersedia ditampilkan "-".
- Header tabel sticky-look dengan latar sedikit lebih terang; baris dipisah hairline border.

---

## 3. User Flow

### 3.1 Pengunjung
1. Klik "PRICING" di Navbar → mendarat di `/pricelist`, kategori default **iPhone** aktif, semua akordeon tertutup.
2. Klik kartu kategori lain → daftar akordeon berganti ke jenis service kategori itu (tanpa reload halaman; URL ikut berubah, lihat §5.1).
3. Klik baris akordeon → tabel harga jenis service itu terbuka; akordeon lain yang sedang terbuka menutup (single-open, agar halaman tidak memanjang tak terkendali).
4. (Opsional) Ketik di kolom pencarian → baris model difilter langsung (client-side).
5. Menemukan harga → CTA lanjut (lihat §6.6).

### 3.2 Client (pengelola) — konteks integrasi
1. Mengubah harga lewat admin panel (import Excel / edit inline).
2. Perubahan tersimpan di server → halaman `/pricelist` menampilkan data terbaru pada request berikutnya (lihat §7.2).

---

## 4. Struktur Data — PERUBAHAN WAJIB

### 4.1 Masalah dengan struktur sekarang
`pricelist.json` saat ini: `DevicePrice { DeviceModel, Harga }` — **satu harga per model**. Desain di screenshot membutuhkan **beberapa harga per model** (satu per varian part) plus **metadata varian** (nama + keterangan garansi) yang berbeda-beda antar jenis service (LCD punya 5 varian; Battery mungkin hanya 2). Struktur lama tidak bisa merepresentasikan ini.

### 4.2 Struktur baru yang diusulkan

```ts
interface Category {
  Name: string;          // "iPhone"
  Slug: string;          // "iphone"
  description: string;
  Image: string | null;  // path foto kartu kategori, mis. "/images/pricelist/iphone.png"
  service_types: ServiceType[];
}

interface ServiceType {
  Name: string;          // "LCD/Display"
  Title: string;         // judul tampilan akordeon: "Harga LCD iPhone"
  Slug: string;          // "lcd-display"
  Icon: string;          // nama ikon lucide-react, mis. "smartphone", "battery", "plug", "camera"
  variants: Variant[];   // definisi kolom tabel, urutan = urutan kolom
  device_prices: DevicePrice[];
}

interface Variant {
  Key: string;           // "original-apple" (stabil, dipakai sebagai kunci harga)
  Label: string;         // "ORIGINAL APPLE"
  Note: string;          // "3 Bulan + Chip Move" — garansi/keterangan, boleh kosong
}

interface DevicePrice {
  DeviceModel: string;                      // "iPhone 13 Pro"
  prices: Record<string, number | null>;    // { "original-apple": 1750000, "oled-premium": null, ... }
                                            // null = varian tidak tersedia → dirender "-"
}
```

**Aturan:**
- `variants` didefinisikan per `ServiceType` (bukan global) karena tiap jenis service punya varian berbeda.
- `prices` yang tidak punya entri untuk suatu `Variant.Key` diperlakukan sama dengan `null`.
- Harga rupiah integer ≥ 0, tanpa desimal.
- Migrasi data lama: setiap service type lama mendapat satu varian default `{ Key: "standar", Label: "HARGA", Note: "" }` dan `Harga` lama dipindah ke `prices.standar`. Skrip migrasi satu kali wajib disertakan.

### 4.3 Dampak ke format Excel import (mengikat PRD admin)
Format 4 kolom yang direncanakan sebelumnya (Kategori | Jenis Service | Model Device | Harga) **tidak cukup lagi**. Format baru: **long format, 1 baris = 1 harga**, satu sheet:

| Kategori | Jenis Service | Model Device | Varian | Keterangan Varian | Harga |
|---|---|---|---|---|---|
| iPhone | LCD/Display | iPhone 6 | Original Apple | 3 Bulan + Chip Move | 600000 |
| iPhone | LCD/Display | iPhone 6 | OEM Screen | 1 Bulan Warranty | 475000 |
| iPhone | LCD/Display | iPhone 6 | Grade A Screen | 1 Bulan Warranty | 375000 |

- Varian tidak tersedia = barisnya tidak ditulis (bukan menulis 0).
- Urutan kolom varian di tabel web = urutan kemunculan pertama varian tersebut di file.
- `Keterangan Varian` cukup diisi di baris pertama kemunculan varian; baris berikutnya boleh kosong.
- Long format dipilih (bukan kolom melebar per varian) karena varian berbeda antar jenis service — kolom melebar akan menghasilkan sheet yang bolong-bolong dan rawan salah kolom.
- Kolom `Icon` dan `Title` akordeon **tidak** lewat Excel (terlalu teknis untuk client) — dikelola sebagai mapping default di kode dengan fallback: `Title = "Harga {Nama Service} {Nama Kategori}"`, `Icon = "wrench"` bila slug tidak dikenali.

---

## 5. Arsitektur Halaman

### 5.1 Routing
- **Route tunggal `app/pricelist/page.tsx`** — sesuai perilaku screenshot: ganti kategori terjadi di tempat, kartu selalu terlihat di atas.
- Kategori aktif disinkronkan ke query param: `/pricelist?device=iphone` (default `iphone` bila kosong/tidak dikenal). Manfaat: link bisa dibagikan ("cek harga iPad di sini"), tombol back browser bekerja, tanpa full reload (`router.replace` shallow).
- Route `/pricelist/[kategori]` dari PRD lama **dibatalkan** — digantikan query param. Redirect permanen tidak diperlukan karena route lama belum pernah rilis. NAV_LINKS tidak berubah (`PRICING → /pricelist`).

### 5.2 Komposisi komponen

```
app/pricelist/page.tsx            (server) — baca data, terima searchParams, kirim ke client
└── components/pricelist/
    ├── PricelistExplorer.tsx     (client) — state kategori aktif + akordeon terbuka + sinkron URL
    ├── CategoryCards.tsx         — 5 kartu kategori (scroll horizontal di mobile, §6.1)
    ├── ServiceAccordion.tsx      — daftar baris jenis service, single-open
    └── PriceTable.tsx            — tabel multi-varian + pencarian (REWRITE dari komponen lama)
```

- `PriceTable.tsx` lama dirombak total (struktur data berubah); saat merombak, **konsolidasikan `formatRupiah` yang terduplikasi ke `lib/data.ts`** (utang teknis tercatat di PROJECT-REFERENCE §6).
- Halaman server component; hanya `PricelistExplorer` ke bawah yang `"use client"`.

---

## 6. Spesifikasi UI & Interaksi

Seluruhnya tunduk pada design system §4 PROJECT-REFERENCE: token warna OKLCH via class Tailwind (`bg-surface`, `border-border`, `text-primary`, dst.), radius maksimum 12px, border tajam 1px, tanpa gradien glow, ukuran dalam rem.

### 6.1 Kartu kategori
- Desktop (lg+): 5 kartu satu baris, lebar sama (grid 5 kolom, gap `1.25rem`).
- Mobile/tablet (<lg): **scroll horizontal snap** (`overflow-x-auto`, `scroll-snap-type: x mandatory`), kartu lebar ±`10rem`, agar 5 kategori tetap satu baris tanpa menumpuk.
- Isi kartu: foto produk (tinggi ±`9rem`, `object-contain`) + label `font-medium`. Foto disiapkan user (aturan §8.8 — jangan generate placeholder binary); sebelum aset ada, area foto memakai ikon kategori lucide berukuran besar dengan warna `text-text-muted`.
- State: default `bg-surface border-border`; hover border `primary` (pola `.fixmi-card`); **aktif** border `primary` + label `text-foreground` (kartu non-aktif label `text-text-secondary`). Fokus keyboard: outline visible.
- Klik kartu = ganti kategori: daftar akordeon di bawah diganti, akordeon yang terbuka ditutup, query param diperbarui.

### 6.2 Akordeon jenis service
- Baris: tinggi ±`4.5rem`, `bg-surface border border-border rounded-[12px]`, jarak antar baris `1rem`.
- Kiri: chip ikon `2.75rem` persegi `rounded-[10px] bg-surface-alt` berisi ikon lucide `text-primary`; judul dari `ServiceType.Title`.
- Kanan: indikator **+** (tertutup) / **×** (terbuka) warna `text-primary`, `font-mono`.
- Perilaku **single-open**: membuka satu baris menutup baris lain.
- Ekspansi: konten tabel muncul di dalam kartu baris yang sama (border menyatu, seperti screenshot 2). Animasi tinggi ringan (CSS grid-rows atau GSAP height auto) durasi ≤ 300ms — **wajib mati saat `prefers-reduced-motion`** (rule global sudah ada).
- Aksesibilitas: baris adalah `<button>` dengan `aria-expanded` + `aria-controls`; konten `role="region"` dengan `aria-labelledby`.

### 6.3 Tabel harga
- Header dua baris visual dalam satu `<th>`: `Label` varian (`font-mono`, uppercase, tracking lebar, `0.75rem`, `text-foreground`) + `Note` di bawahnya (`0.6875rem`, `text-text-secondary`). Kolom pertama: "{NAMA SERVICE}" + "{Kategori} Models".
- Latar header `bg-surface-alt`; pemisah baris `border-border` hairline; tanpa zebra-stripe.
- Sel harga: `font-mono tabular-nums text-primary`, format `formatRupiah` (Intl id-ID) — konsisten dengan aturan tipografi harga §4.3.
- Varian `null`/tidak ada: tampil `–` warna `text-text-muted`, `text-center`.
- Kolom model: `text-foreground font-medium`, rata kiri.
- **Responsive (kritis):** tabel 6 kolom tidak muat di 390px. Solusi: wrapper `overflow-x-auto` dengan **kolom pertama sticky** (`position: sticky; left: 0; bg-surface` + shadow tipis 1px border kanan) sehingga nama model selalu terlihat saat menggulir horizontal. Lebar minimum kolom harga ±`8rem`. Tidak mengubah layout menjadi kartu bertumpuk — tabel adalah format yang tepat untuk perbandingan varian.
- Interaksi gulir horizontal harus kompatibel Lenis (Lenis menangani vertikal; pastikan `touchMultiplier` tidak membajak pan horizontal — uji di perangkat sentuh).

### 6.4 Pencarian
- Input di atas tabel (dalam akordeon terbuka), placeholder "Cari model / layanan…", `bg-background border-border rounded-[8px]`.
- Filter client-side, case-insensitive, substring match pada `DeviceModel`, tanpa debounce (dataset kecil).
- Hasil kosong: baris tunggal "Tidak ada model yang cocok dengan '{query}'." (`text-text-muted`), bukan tabel kosong tanpa penjelasan.

### 6.5 Keadaan khusus
- **Kategori tanpa service**: pesan "Daftar harga {kategori} sedang diperbarui. Hubungi kami untuk penawaran." + CTA WhatsApp.
- **Data gagal dibaca (server)**: halaman tetap render dengan pesan serupa — jangan crash.
- **Loading**: halaman server-rendered, tidak butuh spinner; ekspansi akordeon instan karena seluruh data kategori sudah di client (payload JSON penuh diperkirakan < 50KB — aman dikirim sekaligus).

### 6.6 CTA konversi
Di bawah daftar akordeon: satu blok CTA "Tidak menemukan model kamu? Konsultasi gratis via WhatsApp" — tombol gaya solid `bg-primary` (pola hover mengikuti CTA BOOK NOW). Link WhatsApp masih placeholder (utang yang sama dengan hero) — pakai konstanta terpusat agar sekali ganti beres.

### 6.7 Motion & entrance
- Entrance halaman: fade + y ringan pada kartu kategori dan baris akordeon (stagger), pola `useGSAP` yang sama dengan hero.
- Ganti kategori: crossfade singkat daftar akordeon (≤ 200ms).
- Semua respek `prefers-reduced-motion`. Tidak ada scroll-trigger/pin di halaman ini — biarkan halaman terasa "alat", bukan "pertunjukan" (kontras yang disengaja dengan homepage).

---

## 7. Data & Integrasi Teknis

### 7.1 Sumber data
- Satu sumber: `data/pricelist.json` (struktur baru §4.2), diakses **hanya lewat helper** (`lib/data.ts` diperluas / lapisan store) — aturan §8.7.
- Helper yang dibutuhkan: `getPricelist(): Promise<Category[]>` (async, baca filesystem), `formatRupiah` (sudah ada, dikonsolidasikan).

### 7.2 Kesegaran data (WAJIB — jebakan utama)
- **Dilarang `import pricelist from "@/data/pricelist.json"` statis** di halaman ini. Import statis dibekukan saat build → perubahan dari admin panel tidak akan pernah tampil di produksi.
- Halaman membaca file via `fs` saat render. Strategi cache: `export const dynamic = "force-dynamic"` (paling sederhana) **atau** cached + `revalidatePath("/pricelist")` dipanggil admin panel setiap kali data berubah (lebih hemat; pilih ini jika admin panel dibangun bersamaan).
- SEO: karena server-rendered, seluruh harga tetap terindeks meski interaksinya client-side. Tambahkan `metadata` title/description khusus ("Daftar Harga Service iPhone, iPad, MacBook — FIXMI Bali").

### 7.3 Validasi & ketahanan
- Helper memvalidasi struktur saat baca; data korup → lempar error yang ditangkap halaman (→ §6.5).
- `prices` dengan kunci varian tak dikenal diabaikan diam-diam (forward-compatible).

---

## 8. Kriteria Penerimaan (Acceptance Criteria)

1. `/pricelist` dan `/pricelist?device={slug}` merender kategori yang benar; slug tak dikenal jatuh ke iPhone tanpa error.
2. Ganti kategori tidak me-reload halaman; tombol back browser mengembalikan kategori sebelumnya.
3. Hanya satu akordeon terbuka pada satu waktu; indikator +/× dan `aria-expanded` akurat.
4. Tabel menampilkan varian sesuai urutan `variants`, harga format `Rp X.XXX.XXX`, varian kosong sebagai "–".
5. Di viewport 390px: kartu kategori dapat digulir horizontal; tabel dapat digulir horizontal dengan kolom model tetap terlihat (sticky); tidak ada overflow layout.
6. Pencarian memfilter baris seketika; keadaan kosong tertangani dengan pesan.
7. Perubahan data dari server (edit `pricelist.json`) tampil di produksi tanpa rebuild.
8. `prefers-reduced-motion: reduce` mematikan semua animasi ekspansi/entrance.
9. Kontras teks body ≥ 4.5:1; seluruh interaksi bisa dijalankan keyboard.
10. Tidak ada px mati, tidak ada `transition-all` pada elemen yang berubah ukuran, tidak ada import JSON langsung di komponen (lint review manual).
11. `npm run build` dan `npm run lint` lulus.

---

## 9. Tahapan Implementasi & Estimasi

| # | Tahap | Keluaran | Estimasi |
|---|---|---|---|
| 1 | Migrasi struktur data | `pricelist.json` format baru + skrip migrasi + update tipe di `lib/data.ts` | 0.5 hari |
| 2 | Helper & halaman server | `getPricelist()` async, `app/pricelist/page.tsx`, metadata SEO | 0.5 hari |
| 3 | UI inti | CategoryCards, ServiceAccordion, PriceTable (rewrite) + pencarian | 1–1.5 hari |
| 4 | Responsive & poles | sticky column mobile, snap-scroll kartu, entrance motion, reduced-motion | 0.5 hari |
| 5 | QA kriteria §8 | uji 390px/768px/1440px, keyboard, Lenis, build | 0.5 hari |

Total ± 3–3.5 hari kerja. Dependensi eksternal: foto produk 5 kategori dari user (tahap 3 bisa jalan dengan fallback ikon).

**Urutan dengan admin panel:** kerjakan tahap 1 (struktur data) lebih dulu dan sepakati sebagai kontrak — admin panel dan halaman publik sama-sama bergantung padanya. Setelah itu keduanya bisa paralel.

---

## 10. Risiko & Keputusan Terbuka

| Risiko / keputusan | Rekomendasi |
|---|---|
| Struktur data baru mematahkan `PriceTable.tsx` lama & format Excel yang sudah disepakati | Terima sekarang selagi belum ada halaman rilis — menunda = migrasi lebih mahal |
| Client kesulitan mengisi Excel long-format (1 baris per harga) | Sediakan template dengan contoh terisi + validasi import yang menyebut nomor baris; opsi lanjutan: sheet per kategori |
| Tabel 6 kolom di layar kecil tetap terasa sempit walau sticky | Uji dengan data asli; fallback: sembunyikan kolom `Note` di <md, tampilkan sebagai tooltip/baris kedua |
| Nama varian tidak konsisten antar baris Excel ("OEM" vs "OEM Screen") | Normalisasi via slug saat import + laporkan varian yang mirip sebagai peringatan |
| Jumlah varian ekstrem (> 6) merusak layout | Batasi maksimum 6 varian per service type saat import, tolak dengan pesan jelas |
