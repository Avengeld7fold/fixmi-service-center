import galleryData from "@/data/gallery.json";

// ============================================================
// Type Definitions — struktur pricelist multi-varian
// (PRD-pricelist-fixmi.md §4.2). Modul ini AMAN untuk client:
// tidak boleh mengimpor `fs`/`path`. Baca file ada di lib/pricelist-server.ts.
// ============================================================

export interface Variant {
  Key: string; // kunci stabil untuk lookup harga, mis. "original-apple"
  Label: string; // teks kolom, mis. "ORIGINAL APPLE"
  Note: string; // keterangan garansi di bawah label, boleh kosong
}

export interface DevicePrice {
  DeviceModel: string;
  prices: Record<string, number | null>; // key = Variant.Key; null / absen = tidak tersedia
}

export interface ServiceType {
  Name: string; // "LCD / Display"
  Slug: string; // "lcd-display" — atau "samsung-galaxy-s-series--lcd-display" bila bertingkat
  // Hirarki opsional (pola fixmibali.com untuk Android): service ber-Brand
  // dirender bertingkat Merk → Series → jenis service, bukan daftar datar.
  Brand?: string; // "Samsung"
  Series?: string; // "Galaxy S Series"
  variants: Variant[];
  device_prices: DevicePrice[];
  // Field hasil resolusi di kode (tidak disimpan di JSON) — §4.3:
  title: string; // judul akordeon, mis. "Harga LCD iPhone"
  icon: string; // nama ikon lucide-react, mis. "smartphone"
}

export interface Category {
  Name: string;
  Slug: string;
  description: string;
  Image: string | null; // foto kartu kategori; null → fallback ikon
  brand_icons?: Record<string, string>; // custom icon per merk, mis. { "Samsung": "brand:samsung" }
  service_types: ServiceType[];
}

export interface GalleryItem {
  id: number;
  Title: string;
  Image: string | null;
  altText?: string;
}

// ============================================================
// Gallery Helpers
// ============================================================

export function getGalleryData(): GalleryItem[] {
  return galleryData as GalleryItem[];
}

// ============================================================
// Utility Helpers
// ============================================================

/** Batas kolom varian per jenis service (PRD §10). Client-safe — dipakai editor & validasi server. */
export const MAX_VARIANTS = 6;

/** Slug stabil dari label: "OEM Screen" → "oem-screen". Dipakai editor admin & parser import. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Logo merk Android (public/brands, 11 merk default fixmibali).
 * Key = slugify(nama merk); nilai = nama file tanpa ekstensi.
 * null → UI fallback ke chip inisial huruf.
 */
export const BRAND_IMAGES: Record<string, string> = {
  xiaomi: "xiaomi",
  redmi: "xiaomi",
  poco: "xiaomi",
  samsung: "samsung",
  realme: "realme",
  infinix: "infinix",
  oppo: "oppo",
  vivo: "vivo",
  iqoo: "vivo",
  asus: "zenfone",
  zenfone: "zenfone",
  rog: "zenfone",
  "google-pixel": "google-pixel",
  google: "google-pixel",
  pixel: "google-pixel",
  itel: "itel",
  tecno: "tecno",
  huawei: "huawei",
  honor: "huawei",
};

export function brandImage(brand: string): string | null {
  if (!brand) return null;
  const normalized = slugify(brand.replace(/^brand:/, ""));
  const file = BRAND_IMAGES[normalized];
  return file ? `/brands/${file}.svg` : null;
}

/** Format angka ke Rupiah (Intl id-ID, tanpa desimal). */
export function formatRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Titik ribuan gaya Indonesia tanpa prefix "Rp" — untuk input harga di editor.
 * 3000 → "3.000", 30000 → "30.000", 3000000 → "3.000.000". null/kosong → "".
 */
export function formatThousands(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("id-ID").format(value);
}

/** Ambil digit dari teks harga ("Rp 3.000" / "3.000") → 3000, atau null bila kosong. */
export function parseThousands(text: string): number | null {
  const digits = text.replace(/[^0-9]/g, "");
  return digits === "" ? null : Number(digits);
}
