---
name: FIXMI Service Center
description: Premium Smart Device Repair & Diagnostic Service Center Bali
colors:
  primary: "#FF6B00"
  primary-glow: "rgba(255, 107, 0, 0.15)"
  neutral-bg: "#121212"
  panel-bg: "#1a1a1a"
  panel-border: "#262626"
  text-foreground: "#f5f5f5"
  text-secondary: "#a3a3a3"
  text-muted: "#737373"
typography:
  display:
    fontFamily: "Bayon, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.04em"
  body:
    fontFamily: "Neue Montreal, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  mono:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.9rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "#e05e00"
  card-panel:
    backgroundColor: "{colors.panel-bg}"
    textColor: "{colors.text-foreground}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: FIXMI Service Center

## Overview

**Creative North Star: "The Clinical Diagnostic Instrument"**

FIXMI Service Center menghadirkan antarmuka instrumen teknis klinis tingkat laboratorium. Desain berpusat pada presisi, kejelasan informasi harga, dan visual peranti keras tanpa ornamen dekoratif generik.

### Key Characteristics:
- **Tonal Dark Slate Base**: Latar belakang `#121212` yang menyatu dengan navbar dan elemen glassmorphism.
- **Diagnostic Orange Accent**: Warna tunggal `#FF6B00` digunakan secara selektif untuk indikator aktif, status live, dan aksen harga.
- **Zero Emoji Policy**: Seluruh elemen visual menggunakan ikon vektor SVG presisi tanpa emoji.
- **Instrument Spacing & Monospace Specs**: Tipografi monospaced untuk nomor HP, rating, dan nominal harga.

## Colors

Palet didasarkan pada warna netral dark charcoal dengan aksen tunggal oranye diagnostik presisi.

### Primary
- **Diagnostic Orange** (`#FF6B00`): Digunakan khusus untuk status aktif, indikator live, tombol utama, dan harga perbaikan.

### Neutral
- **Dark Slate Background** (`#121212`): Latar belakang utama seluruh situs.
- **Panel Surface** (`#1a1a1a`): Permukaan kartu, panel info, dan kontainer utama.
- **Panel Border** (`#262626`): Garis pembatas 1px yang bersih.
- **Foreground White** (`#f5f5f5`): Teks utama ber-kontras tinggi.
- **Secondary Gray** (`#a3a3a3`): Teks deskripsi dan informasi pendukung.
- **Muted Gray** (`#737373`): Subtitle, label tanggal, dan keterangan tambahan.

### Named Rules
**The One Voice Rule.** Aksen oranye utama hanya boleh mengisi ≤10% dari total area layar. Kelangkaan aksen adalah kunci kontras diagnostik.

## Typography

**Display Font:** Bayon (`var(--font-bayon)`), sans-serif
**Body Font:** Neue Montreal (`var(--font-neue-montreal)`), sans-serif
**Mono Font:** Geist Mono (`var(--font-mono)`), monospace

### Hierarchy
- **Display** (Bold 700, `clamp(2.25rem, 4vw, 3.5rem)`, `leading-[1.15]`, `letterSpacing: 0.04em`): Judul utama seksi dan lokasi gerai.
- **Headline** (Bold 700, `1.5rem`–`2rem`, `leading-[1.2]`): Judul kartu dan kategori service.
- **Body** (Regular 400, `1rem`, `leading-[1.6]`): Paragraf utama dan penjelasan layanan (max-width 65ch).
- **Label / Mono** (Medium 500, `0.85rem`–`0.95rem`, tabular-nums): Nomor WhatsApp, nominal harga Rp, rating, dan jam buka.

## Layout

- **Container Max-Width**: `max-w-[84rem]` (`1344px`) terpusat secara horizontal (`mx-auto`).
- **Breakpoints**: Standard Tailwind (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
- **Grid Layout**: Menggunakan CSS Grid (`grid-cols-1 lg:grid-cols-2`) untuk perbandingan direktori dan peta lokasi.

## Elevation & Depth

Sistem ini bersifat **Flat-By-Default** dengan kedalaman tonal (tonal layering) melalui perbedaan nilai latar belakang (`#121212` ke `#1a1a1a`). Bayangan hanya digunakan sebagai respon state hover (`shadow-2xl`).

### Named Rules
**The Tonal Layering Rule.** Kedalaman antarmuka dicapai melalui kontras border 1px dan lapisan panel glassmorphism (`backdrop-blur-md`), bukan dengan bayangan tebal.

## Shapes

- **Corner Radius Scale**:
  - `sm` (`6px`): Tag & badge kecil.
  - `md` (`10px`): Tombol & input control.
  - `lg` (`12px`): Frame peta & kartu info.
  - `xl` (`16px`): Panel kontainer utama.
  - `2xl` (`24px`): Layout dialog & hero container.

## Components

### Buttons
- **Shape**: Rounded `10px` (`rounded-md`).
- **Primary**: Background `#FF6B00`, teks putih, padding `12px 24px`, font-weight `600`.
- **Tactile Push State**: `:active` menggunakan `scale-[0.98]` dan `-translate-y-[1px]`.

### Store Selector Directory
- **Style**: Kontainer kelompok `divide-y divide-panel-border/60`.
- **Active State**: Indikator garis aksen kiri `border-l-4 border-l-primary bg-primary/[0.08]` dan pendaran titik status (`animate-ping`).

### Spec Sheet & Data Cards
- **Style**: Panel glassmorphism `border border-panel-border/80 bg-panel/40 p-5 backdrop-blur-sm`.
- **Metrics**: Nomor telepon & nominal harga wajib menggunakan `font-mono tabular-nums`.

## Do's and Don'ts

### Do:
- **Do** gunakan aksen oranye `#FF6B00` secara hemat dan bermakna hanya pada elemen aktif, CTA, dan nominal harga.
- **Do** gunakan `font-mono tabular-nums` untuk seluruh angka, harga, dan nomor telepon.
- **Do** terapkan `active:scale-[0.98]` untuk memberikan respon fisik *tactile feedback* saat tombol diklik.

### Don't:
- **Don't** gunakan emoji di dalam antarmuka. Gunakan selalu vektor ikon SVG presisi.
- **Don't** gunakan gradien warna AI-purple atau cyan neon pada background atau tombol.
- **Don't** gunakan bayangan tebal gelap di luar konteks panel elevated.
