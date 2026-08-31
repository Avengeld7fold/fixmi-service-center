import type { Category } from "./data";

/**
 * SKELETON_PRICELIST — Kerangka Kategori Utama (Tanpa Akordeon Hardcoded)
 *
 * Digunakan jika file data/pricelist.json tidak ditemukan atau kosong.
 * Kartu kategori (iPhone, iPad, MacBook, iWatch, Android) tetap tampil 100% di UI,
 * sedangkan akordeon layanan dan tabel harga hanya muncul jika didefinisikan di dalam file pricelist.json.
 */
export const SKELETON_PRICELIST: Category[] = [
  {
    Name: "iPhone",
    Slug: "iphone",
    description:
      "Layanan perbaikan display OLED, penggantian baterai, kalibrasi Face ID, dan restorasi logic board iPhone secara presisi.",
    Image: "/images/iphone.webp",
    service_types: [],
  },
  {
    Name: "iPad",
    Slug: "ipad",
    description:
      "Restorasi digitizer presisi tinggi, penggantian baterai iPad, dan reparasi port pengisian daya.",
    Image: "/images/ipad.webp",
    service_types: [],
  },
  {
    Name: "MacBook",
    Slug: "macbook",
    description:
      "Perbaikan display Retina, penggantian baterai bergaransi, dan restorasi logic board mikrosolder MacBook Pro & Air.",
    Image: "/images/macbook.webp",
    service_types: [],
  },
  {
    Name: "iWatch",
    Slug: "iwatch",
    description:
      "Penggantian kaca retak, panel OLED, dan baterai Apple Watch Series, SE, dan Ultra dengan ketahanan air teruji.",
    Image: "/images/iwatch.webp",
    service_types: [],
  },
  {
    Name: "Android",
    Slug: "android",
    description:
      "Solusi perbaikan terlengkap untuk Samsung Galaxy, Asus ROG / Zenfone, Xiaomi, Google Pixel, Oppo, dan Vivo.",
    Image: "/images/android.webp",
    service_types: [],
  },
];
