import type { Category } from "./data";

/**
 * SKELETON_PRICELIST — Struktur Cadangan Kategori & Model Gadget
 *
 * Digunakan secara otomatis sebagai graceful fallback ketika file data/pricelist.json
 * tidak ditemukan, kosong, atau sedang dalam pembaruan.
 * Memastikan kartu kategori (iPhone, iPad, MacBook, iWatch, Android), gambar,
 * dan nama model tetap tampil 100% di UI dengan tombol konsultasi WhatsApp.
 */
export const SKELETON_PRICELIST: Category[] = [
  {
    Name: "iPhone",
    Slug: "iphone",
    description:
      "Layanan perbaikan display OLED, penggantian baterai, kalibrasi Face ID, dan restorasi logic board iPhone secara presisi.",
    Image: "/images/iphone.webp",
    service_types: [
      {
        Name: "LCD / Display",
        Slug: "lcd-display",
        title: "Harga LCD iPhone",
        icon: "smartphone",
        variants: [
          { Key: "original", Label: "ORIGINAL", Note: "Garansi 90 Hari" },
          { Key: "oem", Label: "PREMIUM OEM", Note: "Garansi 30 Hari" },
        ],
        device_prices: [
          { DeviceModel: "iPhone 16 Pro Max", prices: {} },
          { DeviceModel: "iPhone 16 Pro", prices: {} },
          { DeviceModel: "iPhone 16 Plus", prices: {} },
          { DeviceModel: "iPhone 16", prices: {} },
          { DeviceModel: "iPhone 15 Pro Max", prices: {} },
          { DeviceModel: "iPhone 15 Pro", prices: {} },
          { DeviceModel: "iPhone 15 Plus", prices: {} },
          { DeviceModel: "iPhone 15", prices: {} },
          { DeviceModel: "iPhone 14 Pro Max", prices: {} },
          { DeviceModel: "iPhone 14 Pro", prices: {} },
          { DeviceModel: "iPhone 14 Plus", prices: {} },
          { DeviceModel: "iPhone 14", prices: {} },
          { DeviceModel: "iPhone 13 Pro Max", prices: {} },
          { DeviceModel: "iPhone 13 Pro", prices: {} },
          { DeviceModel: "iPhone 13", prices: {} },
          { DeviceModel: "iPhone 12 Pro Max", prices: {} },
          { DeviceModel: "iPhone 12 Pro", prices: {} },
          { DeviceModel: "iPhone 12", prices: {} },
          { DeviceModel: "iPhone 11 Pro Max", prices: {} },
          { DeviceModel: "iPhone 11 Pro", prices: {} },
          { DeviceModel: "iPhone 11", prices: {} },
          { DeviceModel: "iPhone XS Max", prices: {} },
          { DeviceModel: "iPhone XS", prices: {} },
          { DeviceModel: "iPhone XR", prices: {} },
          { DeviceModel: "iPhone X", prices: {} },
        ],
      },
      {
        Name: "Battery",
        Slug: "battery",
        title: "Harga Baterai iPhone",
        icon: "battery",
        variants: [
          { Key: "original", Label: "ORIGINAL QUALITY", Note: "Garansi 90 Hari" },
        ],
        device_prices: [
          { DeviceModel: "iPhone 16 Pro Max", prices: {} },
          { DeviceModel: "iPhone 16 Pro", prices: {} },
          { DeviceModel: "iPhone 15 Pro Max", prices: {} },
          { DeviceModel: "iPhone 15 Pro", prices: {} },
          { DeviceModel: "iPhone 14 Pro Max", prices: {} },
          { DeviceModel: "iPhone 14 Pro", prices: {} },
          { DeviceModel: "iPhone 13 Pro Max", prices: {} },
          { DeviceModel: "iPhone 13 Pro", prices: {} },
          { DeviceModel: "iPhone 12 Pro Max", prices: {} },
          { DeviceModel: "iPhone 12", prices: {} },
          { DeviceModel: "iPhone 11 Pro Max", prices: {} },
          { DeviceModel: "iPhone 11", prices: {} },
        ],
      },
      {
        Name: "Kamera & Face ID",
        Slug: "camera",
        title: "Harga Kamera & Face ID iPhone",
        icon: "camera",
        variants: [
          { Key: "original", Label: "ORIGINAL PART", Note: "Garansi 30 Hari" },
        ],
        device_prices: [
          { DeviceModel: "iPhone 15 Pro Max", prices: {} },
          { DeviceModel: "iPhone 15 Pro", prices: {} },
          { DeviceModel: "iPhone 14 Pro Max", prices: {} },
          { DeviceModel: "iPhone 14 Pro", prices: {} },
          { DeviceModel: "iPhone 13 Pro Max", prices: {} },
          { DeviceModel: "iPhone 13 Pro", prices: {} },
          { DeviceModel: "iPhone 12 Pro Max", prices: {} },
          { DeviceModel: "iPhone 11 Pro Max", prices: {} },
        ],
      },
    ],
  },
  {
    Name: "iPad",
    Slug: "ipad",
    description:
      "Restorasi digitizer presisi tinggi, penggantian baterai iPad, dan reparasi port pengisian daya.",
    Image: "/images/ipad.webp",
    service_types: [
      {
        Name: "LCD / Digitizer",
        Slug: "lcd-display",
        title: "Harga LCD iPad",
        icon: "smartphone",
        variants: [
          { Key: "original", Label: "ORIGINAL PART", Note: "Garansi 90 Hari" },
        ],
        device_prices: [
          { DeviceModel: "iPad Pro 13\" (M4)", prices: {} },
          { DeviceModel: "iPad Pro 11\" (M4)", prices: {} },
          { DeviceModel: "iPad Air 13\" (M2)", prices: {} },
          { DeviceModel: "iPad Air 11\" (M2)", prices: {} },
          { DeviceModel: "iPad Pro 12.9\" (Gen 6)", prices: {} },
          { DeviceModel: "iPad Pro 11\" (Gen 4)", prices: {} },
          { DeviceModel: "iPad Air (Gen 5)", prices: {} },
          { DeviceModel: "iPad (Gen 10)", prices: {} },
          { DeviceModel: "iPad Mini (Gen 6)", prices: {} },
        ],
      },
      {
        Name: "Battery",
        Slug: "battery",
        title: "Harga Baterai iPad",
        icon: "battery",
        variants: [
          { Key: "original", Label: "ORIGINAL QUALITY", Note: "Garansi 90 Hari" },
        ],
        device_prices: [
          { DeviceModel: "iPad Pro 13\" (M4)", prices: {} },
          { DeviceModel: "iPad Pro 11\" (M4)", prices: {} },
          { DeviceModel: "iPad Air 13\" (M2)", prices: {} },
          { DeviceModel: "iPad Air 11\" (M2)", prices: {} },
          { DeviceModel: "iPad Pro 12.9\" (Gen 6)", prices: {} },
          { DeviceModel: "iPad Pro 11\" (Gen 4)", prices: {} },
          { DeviceModel: "iPad Air (Gen 5)", prices: {} },
          { DeviceModel: "iPad (Gen 10)", prices: {} },
        ],
      },
    ],
  },
  {
    Name: "MacBook",
    Slug: "macbook",
    description:
      "Perbaikan display Retina, penggantian baterai bergaransi, dan restorasi logic board mikrosolder MacBook Pro & Air.",
    Image: "/images/macbook.webp",
    service_types: [
      {
        Name: "LCD / Display Retina",
        Slug: "lcd-display",
        title: "Harga LCD MacBook",
        icon: "smartphone",
        variants: [
          { Key: "original", Label: "ORIGINAL ASSEMBLY", Note: "Garansi 90 Hari" },
        ],
        device_prices: [
          { DeviceModel: "MacBook Pro 16\" (M3 Pro / M3 Max)", prices: {} },
          { DeviceModel: "MacBook Pro 14\" (M3 / M3 Pro)", prices: {} },
          { DeviceModel: "MacBook Air 15\" (M3)", prices: {} },
          { DeviceModel: "MacBook Air 13\" (M3)", prices: {} },
          { DeviceModel: "MacBook Pro 16\" (M2 Pro / Max)", prices: {} },
          { DeviceModel: "MacBook Pro 14\" (M2 Pro / Max)", prices: {} },
          { DeviceModel: "MacBook Air 15\" (M2)", prices: {} },
          { DeviceModel: "MacBook Air 13\" (M2)", prices: {} },
          { DeviceModel: "MacBook Pro 13\" (M2 / M1)", prices: {} },
          { DeviceModel: "MacBook Air 13\" (M1)", prices: {} },
        ],
      },
      {
        Name: "Battery",
        Slug: "battery",
        title: "Harga Baterai MacBook",
        icon: "battery",
        variants: [
          { Key: "original", Label: "ORIGINAL CELL", Note: "Garansi 90 Hari" },
        ],
        device_prices: [
          { DeviceModel: "MacBook Pro 16\" (M3 / M2 / M1)", prices: {} },
          { DeviceModel: "MacBook Pro 14\" (M3 / M2 / M1)", prices: {} },
          { DeviceModel: "MacBook Air 15\" (M3 / M2)", prices: {} },
          { DeviceModel: "MacBook Air 13\" (M3 / M2 / M1)", prices: {} },
          { DeviceModel: "MacBook Pro 13\" (M2 / M1 / Intel)", prices: {} },
        ],
      },
    ],
  },
  {
    Name: "iWatch",
    Slug: "iwatch",
    description:
      "Penggantian kaca retak, panel OLED, dan baterai Apple Watch Series, SE, dan Ultra dengan ketahanan air teruji.",
    Image: "/images/iwatch.webp",
    service_types: [
      {
        Name: "LCD / OLED Display",
        Slug: "lcd-display",
        title: "Harga LCD Apple Watch",
        icon: "smartphone",
        variants: [
          { Key: "original", Label: "ORIGINAL PART", Note: "Garansi 60 Hari" },
        ],
        device_prices: [
          { DeviceModel: "Apple Watch Ultra 2 (49mm)", prices: {} },
          { DeviceModel: "Apple Watch Ultra (49mm)", prices: {} },
          { DeviceModel: "Apple Watch Series 9 (45mm / 41mm)", prices: {} },
          { DeviceModel: "Apple Watch Series 8 (45mm / 41mm)", prices: {} },
          { DeviceModel: "Apple Watch Series 7 (45mm / 41mm)", prices: {} },
          { DeviceModel: "Apple Watch Series 6 (44mm / 40mm)", prices: {} },
          { DeviceModel: "Apple Watch SE 2 (44mm / 40mm)", prices: {} },
        ],
      },
      {
        Name: "Battery",
        Slug: "battery",
        title: "Harga Baterai Apple Watch",
        icon: "battery",
        variants: [
          { Key: "original", Label: "ORIGINAL CELL", Note: "Garansi 60 Hari" },
        ],
        device_prices: [
          { DeviceModel: "Apple Watch Ultra 2 (49mm)", prices: {} },
          { DeviceModel: "Apple Watch Ultra (49mm)", prices: {} },
          { DeviceModel: "Apple Watch Series 9 (45mm / 41mm)", prices: {} },
          { DeviceModel: "Apple Watch Series 8 (45mm / 41mm)", prices: {} },
          { DeviceModel: "Apple Watch Series 7 (45mm / 41mm)", prices: {} },
          { DeviceModel: "Apple Watch Series 6 (44mm / 40mm)", prices: {} },
          { DeviceModel: "Apple Watch SE 2 (44mm / 40mm)", prices: {} },
        ],
      },
    ],
  },
  {
    Name: "Android",
    Slug: "android",
    description:
      "Solusi perbaikan terlengkap untuk Samsung Galaxy, Asus ROG / Zenfone, Xiaomi, Google Pixel, Oppo, dan Vivo.",
    Image: "/images/android.webp",
    service_types: [
      {
        Name: "LCD / Display",
        Slug: "samsung-galaxy-s-series--lcd-display",
        Brand: "Samsung",
        Series: "Galaxy S Series",
        title: "Harga LCD Samsung Galaxy S Series",
        icon: "smartphone",
        variants: [
          { Key: "original", Label: "ORIGINAL SERVICE PACK", Note: "Garansi 90 Hari" },
        ],
        device_prices: [
          { DeviceModel: "Samsung Galaxy S24 Ultra", prices: {} },
          { DeviceModel: "Samsung Galaxy S24+ / S24", prices: {} },
          { DeviceModel: "Samsung Galaxy S23 Ultra", prices: {} },
          { DeviceModel: "Samsung Galaxy S23+ / S23", prices: {} },
          { DeviceModel: "Samsung Galaxy S22 Ultra", prices: {} },
          { DeviceModel: "Samsung Galaxy S21 Ultra", prices: {} },
        ],
      },
      {
        Name: "LCD / Display",
        Slug: "asus-rog-phone--lcd-display",
        Brand: "Asus",
        Series: "ROG Phone Series",
        title: "Harga LCD Asus ROG Phone",
        icon: "smartphone",
        variants: [
          { Key: "original", Label: "ORIGINAL 165Hz", Note: "Garansi 60 Hari" },
        ],
        device_prices: [
          { DeviceModel: "ROG Phone 8 Pro / 8", prices: {} },
          { DeviceModel: "ROG Phone 7 Ultimate / 7", prices: {} },
          { DeviceModel: "ROG Phone 6 Pro / 6", prices: {} },
          { DeviceModel: "ROG Phone 5s / 5", prices: {} },
        ],
      },
    ],
  },
];
