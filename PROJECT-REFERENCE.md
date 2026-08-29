# FIXMI — Project Reference

> Dokumen acuan lengkap untuk pengembangan fitur selanjutnya.
> Terakhir diperbarui: 5 Juli 2026. Jika struktur kode sudah berubah jauh dari dokumen ini, verifikasi ulang ke file aslinya.

---

## 1. Ringkasan Proyek

**FIXMI** adalah landing page premium untuk jasa perbaikan perangkat pintar (iPhone, iPad, MacBook, iWatch, Android) berlokasi di **Bali**. Gaya penyajian: *Apple-style scroll storytelling* + interaksi WebGL, memposisikan jasa reparasi sebagai "diagnostic engineering" kelas klinis, bukan tambal-sulam pinggir jalan.

- Bahasa konten: Indonesia (dengan aksen Inggris untuk istilah teknis)
- Target user: pemilik perangkat high-end yang butuh kepercayaan & transparansi
- Dokumen produk/design asli: [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md), [prd.md](prd.md), [agents.md](agents.md)
  (catatan: `agents.md` & `prd.md` ditulis untuk arsitektur lama R3F+GLTF — implementasi Hero3D sekarang sudah berbeda, lihat §5.2)

---

## 2. Tech Stack

| Layer | Teknologi | Versi |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.9 |
| UI | React + React DOM | 19.2.4 |
| Bahasa | TypeScript (strict) | ^5 |
| Styling | Tailwind CSS v4 (`@theme inline`, tanpa config JS) | ^4 |
| Animasi | GSAP + ScrollTrigger + `@gsap/react` (`useGSAP`) | ^3.15 |
| 3D/WebGL | Three.js + `@react-three/fiber` + `@react-three/drei` | three ^0.166, r3f ^9.6 |
| Smooth scroll | Lenis (`lenis/react` → `ReactLenis`) | ^1.3 |
| Icons | lucide-react (terpasang, jarang dipakai — ikon umumnya SVG inline) | ^1.23 |
| Data | JSON lokal (bukan CMS — migrasi Strapi pernah dicoba lalu di-rollback total) | — |

**Perintah:** `npm run dev` (port 3000) · `npm run build` · `npm run lint`
Dev server preview config: [.claude/launch.json](.claude/launch.json) (`autoPort: true`).

---

## 3. Struktur File

```
Fixmi/
├── app/
│   ├── layout.tsx          # Root layout: font loading, metadata, Navbar + SmoothScrolling wrapper
│   ├── page.tsx            # Landing page: Hero (WebGL) + ScrollSequence + section "Mengapa Memilih"
│   ├── globals.css         # Design system: token warna OKLCH, skala rem fluid, utility classes
│   ├── contact/page.tsx    # Halaman kontak statis (server component, 91 baris)
│   ├── api/                # (kosong)
│   └── favicon.ico
├── components/
│   ├── Navbar.tsx          # Header global: logo, menu desktop, CTA BOOK NOW, hamburger + panel mobile
│   ├── Hero3D.tsx          # WebGL shader kustom: 2.5D parallax + liquid slash mask (bukan GLTF!)
│   ├── ScrollSequence.tsx  # Canvas 2D scrub 192 frame JPG via GSAP ScrollTrigger (pin + scrub)
│   ├── SmoothScrolling.tsx # Wrapper ReactLenis (lerp 0.1, duration 1.5)
│   └── PriceTable.tsx      # Tabel harga accordion (SIAP PAKAI, belum dirender di halaman mana pun)
├── lib/
│   └── data.ts             # Helper data + type: getCategories, getCategoryWithServices,
│                           #   getServiceTypeWithPrices, getGalleryData, formatRupiah
├── data/
│   ├── pricelist.json      # Sumber harga (lihat §6)
│   └── gallery.json        # 9 item galeri repair (field Image masih null semua)
├── public/
│   ├── images/             # iphone-broken.png, iphone-fixed.png, iphone-depth.png (2000×1500, utk Hero3D)
│   ├── sequence/           # frame_000000.jpg … frame_000191.jpg (192 frame, ~9.8MB, utk ScrollSequence)
│   ├── models/             # iphone.glb + folder iphone/ (~66MB — TIDAK dipakai kode saat ini, sisa arsitektur lama)
│   └── fonts/neue-montreal/  # 8 file .otf (Regular/Medium/Bold/Light + italic)
├── DESIGN.md / PRODUCT.md / prd.md / agents.md   # Dokumen produk & aturan agent
├── next.config.ts          # Kosong (default)
├── tsconfig.json           # strict, paths @/* → ./*, exclude "fixmi-cms" (folder sudah tidak ada)
└── .agents/skills/         # Skill AI terinstall (impeccable, ponytail, taste-skill, frontend-design, dll)
```

---

## 4. Design System

### 4.1 Identitas Visual — "Technical Diagnostic Instrument"
Tema gelap slate metalik + aksen **oranye diagnostik `#f26a21`**. Kepribadian brand: Technical Precision, Diagnostic Trust, Understated Premium.

**Anti-referensi (JANGAN):** gradien SaaS indigo-cyan, nuansa terracotta/krem, estetika bengkel murahan, tombol pill terlalu bundar (>12px), glowing card border, kicker uppercase kecil di tiap section.

### 4.2 Token Warna (didefinisikan di [app/globals.css](app/globals.css))
Semua warna OKLCH, dideklarasikan sebagai `--fixmi-*` di `:root` lalu dipetakan ke Tailwind via `@theme inline`:

| Tailwind class | CSS var | Nilai |
|---|---|---|
| `bg-background` | `--fixmi-bg-primary` | oklch(12% 0.005 240) — slate charcoal |
| `bg-surface` / `bg-surface-alt` | `--fixmi-bg-secondary/tertiary` | oklch 16% / 20% |
| `text-foreground` | `--fixmi-text-primary` | oklch(95% …) — titanium white |
| `text-text-secondary` | `--fixmi-text-secondary` | oklch(70% …) |
| `text-text-muted` | `--fixmi-text-muted` | oklch(48% …) |
| `bg-primary` / `text-primary` | `--fixmi-primary` | oklch(62.7% 0.22 41) = #f26a21 |
| `primary-light` / `primary-dark` | hover / pressed | #ff7f39 / #cf550d |
| `border-border` | `--fixmi-border` | oklch(22% 0.01 240) hairline |

Utility siap pakai: `.fixmi-glass`, `.fixmi-glass-strong` (glass blur), `.fixmi-card` (border 1px, radius 12px, hover border oranye).

### 4.3 Tipografi
Font dimuat di [app/layout.tsx](app/layout.tsx) sebagai CSS variable:

| Var | Font | Kegunaan |
|---|---|---|
| `--font-bayon` | Bayon (Google) | Judul display raksasa hero & caption ScrollSequence (uppercase, condensed) |
| `--font-neue-montreal` | PP Neue Montreal (lokal, 8 file .otf) | UI, nav, body — juga dipetakan ke `font-display` & `font-sans` |
| `--font-mono` | Geist Mono | Angka harga, HUD telemetri, label teknis |
| `--font-space-grotesk`, `--font-inter` | dimuat tapi sekunder | |

Aturan: letter-spacing display ≥ `-0.03em`; body line-height 1.5–1.6; lebar paragraf max `72ch` (sudah dipaksa global pada `p`); harga pakai mono + `tabular-nums`.

### 4.4 Komponen & Motion
- Border tajam 1px; **jangan** gabungkan border + drop shadow lembut
- Radius max card 12px, input 8px
- State interaktif: pergeseran warna solid, tanpa gradien glow
- Semua transisi wajib hormati `prefers-reduced-motion` (sudah ada rule global `@media (prefers-reduced-motion: reduce)`)
- Kontras body minimal 4.5:1
- **JANGAN pasang `transition-all` pada elemen yang ukurannya berubah saat resize** — membuat resize terasa lag (pernah jadi bug)

---

## 5. Arsitektur Responsive & Komponen Kunci

### 5.1 Sistem Skala Fluid (INTI RESPONSIVE — WAJIB DIPAHAMI)
Di [app/globals.css](app/globals.css) `@layer base`: root `font-size` dibuat **proporsional terhadap lebar viewport** (teknik "proportional rem scaling" ala dontboardme.com). Seluruh halaman menskala seperti zoom yang mulus:

```css
/* Stacked layout (mobile/tablet, <1024px) — basis desain 390px */
html { font-size: clamp(14px, calc(100vw / 390 * 16), 21px); }

/* Desktop (>=1024px = breakpoint lg, titik ganti layout) — basis desain 1440px */
@media (min-width: 1024px) {
  html { font-size: clamp(11.5px, calc(100vw / 1440 * 16), 16px); }
}
```

**Konsekuensi untuk fitur baru:**
1. **Selalu pakai `rem`** (atau class Tailwind berbasis rem) untuk ukuran — JANGAN px mati, JANGAN campur `vw` dengan rem dalam `clamp()` (double-scaling non-linear).
2. Breakpoint layout utama adalah `lg` (1024px). Di bawahnya = layout stacked/mobile (hamburger), di atasnya = layout desktop.
3. **JANGAN PERNAH menambahkan reset `* { margin:0; padding:0 }` tanpa `@layer`** — style tanpa layer menimpa semua utility Tailwind v4 (pernah jadi bug besar yang mematikan seluruh padding situs).

### 5.2 Hero3D ([components/Hero3D.tsx](components/Hero3D.tsx)) — `"use client"`
BUKAN model GLTF. Ini **shader GLSL kustom** pada satu `planeGeometry` full-canvas:
- **Tekstur**: `iphone-broken.png` (default), `iphone-fixed.png` (reveal), `iphone-depth.png` (depth map) — dimuat manual via `THREE.LoadingManager` dengan loader progress UI ("INITIALIZING WEBGL 2.5D SHADER")
- **Efek**: 2.5D parallax mengikuti kursor/gyroscope (depth map), "shader breathing" (intensitas depth bernapas via sin), **liquid slash mask ala Fruit Ninja** (trail 15 titik, `sdLine` + smooth-min + Perlin noise) yang me-reveal iPhone "fixed" di bekas sapuan kursor, idle floating sinusoidal
- **Fit**: center-contain dengan koreksi aspect ratio di fragment shader; alpha discard untuk transparansi
- **Posisi canvas di [app/page.tsx](app/page.tsx)**: dibatasi PITA agar iPhone tidak menimpa teks:
  - Mobile/tablet: `top-[20%] bottom-[34%]`
  - Desktop: `lg:top-1/2 lg:-translate-y-1/2 lg:h-[44rem]` (tinggi TETAP → ukuran iPhone konsisten di semua tinggi layar)

### 5.3 Hero Section ([app/page.tsx](app/page.tsx))
- **Desktop (lg+)**: komposisi asimetris — "HP KAMU RUSAK?" kiri-atas, iPhone tengah, caption + "FIXMI BALI SOLUSINYA!" kanan-bawah, ikon sosial kiri-bawah. Grid 12 kolom (4-4-4).
- **Mobile/tablet (<lg)**: poster satu sumbu tengah — judul besar center → iPhone → caption → brand title center → ikon sosial center.
- Ukuran judul: `text-[4.25rem] md:text-[5.25rem] lg:text-[7.25rem]`, font Bayon, warna primary.
- Animasi entrance: GSAP timeline (fade + y, stagger) via `useGSAP` — jangan sentuh pola `opacity: 0` inline pada elemen ber-ref (dibutuhkan animasi).
- Ikon sosial: Instagram, TikTok, WhatsApp (SVG inline, link masih placeholder — belum diarahkan ke akun asli).

### 5.4 ScrollSequence ([components/ScrollSequence.tsx](components/ScrollSequence.tsx)) — `"use client"`
Storytelling proses reparasi 5 tahap ala Apple:
- 192 frame JPG (`/sequence/frame_%06d.jpg`) di-preload semua (progress UI "BUFFERING HARDWARE MEMORY"), digambar ke `<canvas>` 2D dengan cover-fit + DPR scaling
- GSAP ScrollTrigger: `pin: true`, `end: "+=300%"`, `scrub: 0.5` → scroll memutar frame maju/mundur
- 5 tahap caption (teks Indonesia): DIAGNOSIS (frame <35) → DEMONTASI (<75) → PENGUJIAN (<120) → REPARASI (<160) → KALIBRASI (≤192), masing-masing dengan judul 3 baris + deskripsi + progress lingkaran SVG di kanan
- HUD: chip "DIAGNOSTIC TELEMETRY" + counter FRAME kiri/kanan atas, "TAHAPAN 0X/05" kanan bawah
- Resize canvas pakai `requestAnimationFrame` throttle (bukan debounce)

### 5.5 Navbar ([components/Navbar.tsx](components/Navbar.tsx)) — `"use client"`
- Tinggi `4.5rem`, max-width `90rem`, padding sinkron dengan hero (`px-8 md:px-12 lg:px-16`)
- Desktop: menu tengah dengan underline oranye animasi kiri→kanan saat hover; CTA "BOOK NOW" dengan efek turun + strip oranye + fillet sudut SVG saat hover → link ke `/contact`
- Mobile (<lg): hamburger 3 garis → panel slide dari kanan (max-w 20rem) + backdrop blur; auto-close saat ganti route; body scroll dikunci saat terbuka
- **NAV_LINKS** (di file yang sama): HOME `/`, PRICING `/pricelist`, PROMO `/promo`, GALLERY REPAIR `/gallery`, ABOUT US `/about`

### 5.6 SmoothScrolling ([components/SmoothScrolling.tsx](components/SmoothScrolling.tsx))
`ReactLenis root` membungkus seluruh app di layout — opsi: `lerp 0.1`, `duration 1.5`, `smoothWheel`, `touchMultiplier 1.5`. Hati-hati saat menambah scroll-logic baru: pastikan kompatibel dengan Lenis + ScrollTrigger.

---

## 6. Data Layer

### [data/pricelist.json](data/pricelist.json) — struktur:
```
Category { Name, Slug, description, service_types: ServiceType[] }
ServiceType { Name, Slug, device_prices: DevicePrice[] }
DevicePrice { DeviceModel: string, Harga: number }   // Harga dalam Rupiah
```
Kategori saat ini: **iPhone** (6 service types: LCD/Display, Battery, Charger/Port, Camera, Face ID/Sensor, Housing/Backglass), **iPad** (2), **Macbook** (2), **iWatch** (2), **Android** (3).

### [data/gallery.json](data/gallery.json)
9 item `{ id, Title, Image (semua masih null!), altText }` — butuh foto asli sebelum halaman gallery dibuat.

### [lib/data.ts](lib/data.ts) — helper siap pakai:
`getCategories()`, `getCategoryWithServices(slug)`, `getServiceTypeWithPrices(slug)`, `getGalleryData()`, `formatRupiah(number)` (Intl id-ID, tanpa desimal).
Catatan: `formatRupiah` juga terduplikasi di `PriceTable.tsx` — kalau menyentuh file itu, konsolidasikan ke `lib/data.ts`.

---

## 7. Status Fitur

### ✅ Sudah ada
- Hero WebGL interaktif (parallax + liquid slash reveal broken→fixed)
- Scroll sequence teardown 5 tahap (pin + scrub, preload 192 frame)
- Navbar responsif + mobile panel
- Smooth scrolling global (Lenis)
- Halaman `/contact` (statis: telepon, email, alamat "Jl. Teknologi No. 42, Jakarta Selatan" ← PLACEHOLDER, harusnya Bali; jam operasional)
- Section "Mengapa Memilih Layanan Kami?" (masih teks saja, belum ada kartu keunggulan)
- Sistem responsive fluid penuh (§5.1)
- SEO dasar: metadata title/description/keywords di layout

### ❌ Belum ada (dirujuk Navbar tapi 404 — kandidat fitur berikutnya)
| Route | Rencana (dari PRD) | Modal yang sudah tersedia |
|---|---|---|
| `/pricelist` | Menu kategori (iPhone, iPad, dst) | `getCategories()`, data lengkap |
| `/pricelist/[kategori]` | Tabel harga dinamis per kategori | `PriceTable.tsx` sudah jadi + `getCategoryWithServices()` |
| `/promo` | Halaman promo | belum ada data |
| `/gallery` | Galeri hasil repair | `gallery.json` (butuh foto), `getGalleryData()` |
| `/about` | Tentang FIXMI | belum ada data |
- Footer belum ada
- Link sosial & nomor WhatsApp masih placeholder
- `public/models/` (66MB glb) tidak terpakai — kandidat penghapusan biar repo ramping

---

## 7b. Admin Panel Pricelist (`/admin`)

Client mengelola harga tanpa menyentuh kode. Sumber kebenaran tetap `data/pricelist.json` (cocok dengan hosting cPanel — disk permanen, tanpa database).

- **Auth**: password tunggal (`ADMIN_PASSWORD` env) + cookie HMAC (`ADMIN_SESSION_SECRET`, Web Crypto — Edge-safe). [proxy.ts](proxy.ts) memproteksi `/admin/*` & `/api/admin/*`; guard berlapis di tiap server action.
- **Alur Excel**: "Download Excel" ([app/api/admin/export/route.ts](app/api/admin/export/route.ts), long-format §4.3 PRD — export = template) → client edit di Excel → upload (.xlsx via exceljs / .csv parser sendiri, delimiter `;` atau `,`) → preview ringkasan + error per nomor baris → Terapkan. **Semantik per-kategori**: kategori di file di-replace penuh; yang tidak disebut tak berubah. Ada error apa pun = tidak ada yang ditulis.
- **Edit inline**: [components/admin/PricelistEditor.tsx](components/admin/PricelistEditor.tsx) — tab kategori, edit harga/model/varian (max 6, `Key` immutable), sticky save bar.
- **Keamanan data**: satu pintu tulis [lib/admin/pricelist-write.ts](lib/admin/pricelist-write.ts) — validasi ketat → backup otomatis (`data/backups/`, 20 terbaru, git-ignored) → tulis atomik (tmp+rename) → `revalidatePath("/pricelist")`. Restore satu klik dari panel backup.
- **Server actions**: [app/admin/actions.ts](app/admin/actions.ts). Navbar publik disembunyikan di `/admin` (guard pathname di Navbar.tsx).
- **Deploy cPanel**: jalankan sebagai Node.js App (`next start`); set kedua env var di cPanel; pastikan `data/` writable.

## 8. Aturan Pengembangan (dari agents.md + pelajaran sesi sebelumnya)

1. **App Router + TypeScript strict**; komponen dengan GSAP/R3F/DOM wajib `"use client"`
2. Logika GSAP lewat `useGSAP` (auto-cleanup) — hindari memory leak
3. **JANGAN `git push` tanpa perintah eksplisit tertulis** — hanya commit lokal
4. Ikuti sistem rem fluid (§5.1): rem untuk semua ukuran, no px mati, no `vw` dalam clamp
5. Jangan tambah reset CSS tanpa `@layer`
6. Ikuti anti-referensi desain (§4.1) & aturan motion (§4.4)
7. Data harga/galeri selalu lewat helper `lib/data.ts`, jangan import JSON langsung di komponen baru
8. Aset besar (glb, ratusan frame) disiapkan user — jangan generate placeholder binary

---

## 9. Konteks Operasional

- Dev server: `npm run dev` → `localhost:3000`. Jika Next menolak start karena "Another server is running" padahal tidak ada: hapus `.next/dev/lock` (lockfile basi dari proses yatim).
- Jika tampilan browser ≠ kode: pastikan yang jalan **dev server** (log ada "(Turbopack)"), bukan sisa `next start` produksi; lalu hard-refresh (`Cmd+Shift+R`).
- Git: branch `main`, komit terakhir sebelum sesi responsive: `3f5842f "Push github sebelum modifikasi"`. Riwayat menunjukkan evolusi Hero3D yang panjang (blob mask → liquid slash → parallax) dan migrasi Strapi yang dibatalkan.
- Skill AI terpasang di `.agents/skills/` (impeccable, ponytail, design-taste, frontend-design, dll) — dipakai sebagai standar kualitas default untuk semua kode/desain di proyek ini.
