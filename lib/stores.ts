/**
 * Data 3 gerai FIXMI — SATU sumber kebenaran untuk halaman Contact & Footer.
 * Ganti di sini sekali, berlaku di seluruh situs.
 */

export interface Store {
  key: string;
  /** Peran gerai, mis. "Toko Utama" */
  role: string;
  /** Nama resmi gerai */
  name: string;
  /** Area singkat untuk daftar, mis. "Kedonganan · Badung" */
  region: string;
  address: string;
  phone: string;
  hours: string;
  /** Query pencarian Google Maps */
  map: string;
  /** Titik pin di peta (koordinat gerai sebenarnya) */
  lat: number;
  lng: number;
  openHour: number;
  closeHourWeekday: number;
  closeHourSunday: number;
}

/** Titik tengah peta agar ketiga gerai muat dalam satu tampilan. */
export const MAP_CENTER = { lat: -8.74, lng: 115.18 };

export const STORES: Store[] = [
  {
    key: "kedonganan",
    role: "Toko Utama",
    name: "Fixmi Service Center",
    region: "Kedonganan · Badung",
    address:
      "Link. Kubu Alit Kedonganan, Jl. Raya Uluwatu, Kedonganan, Kec. Kuta, Kabupaten Badung, Bali 80361",
    phone: "0819-9933-6722",
    hours: "09.00 – 21.00 WITA",
    map: "Fixmi Service Center Kedonganan Jl Raya Uluwatu Bali 80361",
    lat: -8.759229543631317,
    lng: 115.17628628769123,
    openHour: 9,
    closeHourWeekday: 21,
    closeHourSunday: 18,
  },
  {
    key: "taman-griya",
    role: "Cabang Taman Griya",
    name: "Fixmi Service Center Phone Taman Griya",
    region: "Jimbaran · Badung",
    address:
      "Taman Griya, Jl. Nuansa Utama No. 33, Jimbaran, Kuta Selatan, Kabupaten Badung, Bali 80361",
    phone: "0819-9933-6722",
    hours: "09.00 – 21.00 WITA",
    map: "Fixmi Service Center Phone Taman Griya Jl Nuansa Utama Jimbaran Bali",
    lat: -8.795211286730995,
    lng: 115.18692765700816,
    openHour: 9,
    closeHourWeekday: 21,
    closeHourSunday: 18,
  },
  {
    key: "denpasar",
    role: "Cabang Denpasar",
    name: "Mobicare Service Center",
    region: "Denpasar Barat",
    address:
      "Cellular World Arena, Jl. Teuku Umar No. 57, Dauh Puri Kauh, Kec. Denpasar Barat, Kota Denpasar, Bali 80113",
    phone: "0819-9933-6722",
    hours: "09.00 – 21.00 WITA",
    map: "Mobicare Service Center Cellular World Arena Jl Teuku Umar Denpasar Bali",
    lat: -8.67049674423244,
    lng: 115.209545433761,
    openHour: 9,
    closeHourWeekday: 21,
    closeHourSunday: 18,
  },
];

/** Peta embed tanpa API key — cukup query pencarian (gratis, tanpa konfigurasi). */
export const mapEmbedUrl = (query: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;

export const mapDirectionsUrl = (query: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

export const mapSearchUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
