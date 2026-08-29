/**
 * Sistem Status Operasional Real-Time Gerai FIXMI (WITA / UTC+8)
 *
 * Mengkalkulasi status Buka, Segera Tutup, Tutup, dan Libur Hari Raya
 * secara akurat mengikuti zona waktu Bali dan kalender operasional Google Maps.
 */

export interface StoreHoursConfig {
  openHour: number;
  closeHourWeekday: number;
  closeHourSunday: number;
}

export type StoreStatusType = "open" | "closing_soon" | "closed" | "holiday";

export interface StoreLiveStatus {
  isOpen: boolean;
  isHoliday: boolean;
  statusType: StoreStatusType;
  label: string;
  detail: string;
  badgeClass: string;
  dotClass: string;
  witaTimeFormatted: string;
}

/**
 * Daftar Hari Libur Khusus / Nasional di Bali (Toko Tutup)
 * Format YYYY-MM-DD
 */
const BALI_HOLIDAYS: Record<string, string> = {
  // 2026 Public Holidays & Bali Religious Festivals
  "2026-01-01": "Tahun Baru Masehi",
  "2026-03-19": "Hari Raya Nyepi (Tahun Baru Saka 1948)",
  "2026-03-20": "Ngembak Geni (Pasca Nyepi)",
  "2026-03-21": "Hari Raya Idul Fitri 1447 H",
  "2026-03-22": "Hari Raya Idul Fitri 1447 H",
  "2026-04-03": "Wafat Yesus Kristus",
  "2026-05-01": "Hari Buruh Internasional",
  "2026-05-14": "Kenaikan Yesus Kristus",
  "2026-05-27": "Hari Raya Idul Adha 1447 H",
  "2026-05-31": "Hari Raya Waisak 2570",
  "2026-06-16": "Tahun Baru Islam 1448 H",
  "2026-08-17": "Hari Kemerdekaan Republik Indonesia",
  "2026-08-25": "Maulid Nabi Muhammad SAW",
  "2026-12-25": "Hari Raya Natal",
};

/**
 * Menghitung waktu WITA (Bali UTC+8) saat ini secara akurat.
 */
export function getWitaDate(customDate?: Date): Date {
  const date = customDate || new Date();
  // Hitung offset UTC dan tambahkan 8 jam untuk WITA
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * 8);
}

/**
 * Mengkalkulasi status live gerai FIXMI.
 */
export function getStoreLiveStatus(
  config: StoreHoursConfig = { openHour: 9, closeHourWeekday: 21, closeHourSunday: 18 },
  customDate?: Date
): StoreLiveStatus {
  const wita = getWitaDate(customDate);
  const year = wita.getFullYear();
  const month = String(wita.getMonth() + 1).padStart(2, "0");
  const day = String(wita.getDate()).padStart(2, "0");
  const dateKey = `${year}-${month}-${day}`;

  const hours = wita.getHours();
  const minutes = wita.getMinutes();
  const currentDecimalHour = hours + minutes / 60;
  const isSunday = wita.getDay() === 0;
  const closeHour = isSunday ? config.closeHourSunday : config.closeHourWeekday;
  const openHour = config.openHour;

  const witaTimeFormatted = `${String(hours).padStart(2, "0")}.${String(minutes).padStart(2, "0")} WITA`;

  // 1. Cek Libur Hari Raya / Libur Khusus Bali
  const holidayName = BALI_HOLIDAYS[dateKey];
  if (holidayName) {
    return {
      isOpen: false,
      isHoliday: true,
      statusType: "holiday",
      label: `Libur · ${holidayName}`,
      detail: `Tutup khusus ${holidayName} · Buka kembali esok 09.00 WITA`,
      badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/25",
      dotClass: "bg-amber-400 shadow-[0_0_8px_#f59e0b]",
      witaTimeFormatted,
    };
  }

  // 2. Cek Buka Sekarang
  if (currentDecimalHour >= openHour && currentDecimalHour < closeHour) {
    // Cek apakah mendekati jam tutup (30 menit terakhir)
    if (closeHour - currentDecimalHour <= 0.5) {
      const minutesLeft = Math.ceil((closeHour - currentDecimalHour) * 60);
      return {
        isOpen: true,
        isHoliday: false,
        statusType: "closing_soon",
        label: `Segera Tutup · Sisa ${minutesLeft} Menit`,
        detail: `Toko tutup pukul ${closeHour}.00 WITA`,
        badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/25",
        dotClass: "bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse",
        witaTimeFormatted,
      };
    }

    return {
      isOpen: true,
      isHoliday: false,
      statusType: "open",
      label: `Buka Sekarang · Tutup ${closeHour}.00 WITA`,
      detail: `Buka hari ini sampai ${closeHour}.00 WITA`,
      badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
      dotClass: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
      witaTimeFormatted,
    };
  }

  // 3. Toko Tutup (di luar jam buka)
  const isBeforeOpen = currentDecimalHour < openHour;
  const nextOpenText = isBeforeOpen
    ? `Buka Hari Ini ${String(openHour).padStart(2, "0")}.00 WITA`
    : `Buka Besok 09.00 WITA`;

  return {
    isOpen: false,
    isHoliday: false,
    statusType: "closed",
    label: `Tutup · ${nextOpenText}`,
    detail: `Jam operasional: 09.00 – ${closeHour}.00 WITA`,
    badgeClass: "text-neutral-400 bg-neutral-800/60 border-white/[0.08]",
    dotClass: "bg-neutral-500",
    witaTimeFormatted,
  };
}
