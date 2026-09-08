import type { ServiceType, Variant } from "@/lib/data";

/**
 * Kamus istilah perbaikan standar untuk alih bahasa otomatis ID -> EN.
 * Jika admin tidak mengisi Name_en secara manual, sistem mencari padanan di kamus ini.
 */
const SERVICE_TERM_MAP: Record<string, string> = {
  // LCD / Display
  "ganti lcd": "Screen Replacement",
  "lcd / display": "Screen Replacement",
  "lcd": "Screen Replacement",
  "layar": "Screen Replacement",
  "service lcd": "Screen Replacement",
  "ganti layar": "Screen Replacement",
  "display": "Screen Replacement",
  "screen": "Screen Replacement",
  "screen replacement": "Screen Replacement",

  // Baterai
  "ganti baterai": "Battery Replacement",
  "baterai": "Battery Replacement",
  "battery": "Battery Replacement",
  "service baterai": "Battery Replacement",
  "battery replacement": "Battery Replacement",

  // Kamera
  "kamera": "Camera Repair",
  "camera": "Camera Repair",
  "service kamera": "Camera Repair",
  "kamera belakang": "Rear Camera Repair",
  "back camera": "Rear Camera Repair",
  "rear camera": "Rear Camera Repair",
  "kamera depan": "Front Camera Repair",
  "front camera": "Front Camera Repair",
  "kaca kamera": "Camera Lens Glass",
  "kamera & lensa": "Camera & Lens Repair",

  // Charging Port
  "port charger": "Charging Port Repair",
  "charger port": "Charging Port Repair",
  "charger": "Charging Port Repair",
  "konektor charger": "Charging Port Repair",
  "flex charger": "Charging Flex Repair",
  "charging port": "Charging Port Repair",

  // Audio / Speaker
  "speaker": "Speaker Repair",
  "speaker & mic": "Speaker & Microphone",
  "speaker / mic": "Speaker & Microphone",
  "ear speaker": "Ear Speaker Repair",
  "loud speaker": "Loudspeaker Repair",
  "loudspeaker": "Loudspeaker Repair",
  "mic": "Microphone Repair",
  "mikrofon": "Microphone Repair",

  // Housing & Back Glass
  "housing & backglass": "Back Glass & Housing",
  "back glass": "Back Glass Repair",
  "backglass": "Back Glass Repair",
  "kaca belakang": "Back Glass Repair",
  "housing": "Housing Replacement",
  "casing": "Housing Replacement",

  // Face ID & Sensor
  "face id": "Face ID Repair",
  "face id & sensor": "Face ID & Sensor Repair",
  "faceid": "Face ID Repair",
  "sensor": "Sensor Repair",

  // Mesin & Logic Board
  "mesin": "Logic Board Repair",
  "motherboard": "Logic Board Repair",
  "logic board": "Logic Board Repair",
  "ic power": "Power IC Repair",
  "mati total": "Dead Device Repair",
  "matot": "Dead Device Repair",
  "kena air": "Water Damage Restoration",
  "water damage": "Water Damage Restoration",
};

/**
 * Mendapatkan nama layanan yang sesuai dengan bahasa aktif.
 *
 * Aturan:
 * 1. Bahasa Indonesia ('id'): Mengembalikan service.Name persis apa adanya (tanpa imbuhan "Harga" atau kategori).
 * 2. Bahasa Inggris ('en'):
 *    a. Jika ada service.Name_en yang diisi manual -> prioritaskan teks tersebut.
 *    b. Jika kosong -> periksa kamus istilah servis umum (SERVICE_TERM_MAP).
 *    c. Fallback -> kembalikan service.Name apa adanya.
 */
export function getLocalizedServiceName(
  service: Pick<ServiceType, "Name"> & Partial<Pick<ServiceType, "Name_en" | "Slug" | "title">>,
  locale: string = "id"
): string {
  const originalName = service.Name || "";

  if (locale === "id") {
    return originalName;
  }

  // Mode English ('en')
  if (service.Name_en && service.Name_en.trim()) {
    return service.Name_en.trim();
  }

  const cleanKey = originalName.toLowerCase().trim();

  // 1. Direct match in dictionary
  if (SERVICE_TERM_MAP[cleanKey]) {
    return SERVICE_TERM_MAP[cleanKey];
  }

  // 2. Slug check
  if (service.Slug) {
    const slugKey = service.Slug.toLowerCase().replace(/^[a-z0-9-]+--/, ""); // strip brand prefix if any
    if (SERVICE_TERM_MAP[slugKey]) {
      return SERVICE_TERM_MAP[slugKey];
    }
  }

  // 3. Keyword matching for common repair nouns
  if (cleanKey.includes("baterai") || cleanKey.includes("battery")) {
    return "Battery Replacement";
  }
  if (cleanKey.includes("lcd") || cleanKey.includes("layar") || cleanKey.includes("display") || cleanKey.includes("screen")) {
    return "Screen Replacement";
  }
  if (cleanKey.includes("kamera") || cleanKey.includes("camera")) {
    if (cleanKey.includes("belakang") || cleanKey.includes("rear") || cleanKey.includes("back")) {
      return "Rear Camera Repair";
    }
    if (cleanKey.includes("depan") || cleanKey.includes("front")) {
      return "Front Camera Repair";
    }
    return "Camera Repair";
  }
  if (cleanKey.includes("charger") || cleanKey.includes("cas") || cleanKey.includes("charging")) {
    return "Charging Port Repair";
  }
  if (cleanKey.includes("speaker") || cleanKey.includes("suara") || cleanKey.includes("audio")) {
    return "Speaker & Audio Repair";
  }
  if (cleanKey.includes("backglass") || cleanKey.includes("back glass") || cleanKey.includes("kaca belakang") || cleanKey.includes("housing")) {
    return "Back Glass & Housing";
  }
  if (cleanKey.includes("face id") || cleanKey.includes("faceid")) {
    return "Face ID & Sensor Repair";
  }
  if (cleanKey.includes("mesin") || cleanKey.includes("motherboard") || cleanKey.includes("logic board") || cleanKey.includes("ic")) {
    return "Logic Board Repair";
  }

  // Fallback: use originalName verbatim
  return originalName;
}

/**
 * Mendapatkan label kolom varian harga (misal "HARGA" -> "PRICE" saat locale === 'en').
 */
export function getLocalizedVariantLabel(
  variant: Pick<Variant, "Label"> & Partial<Pick<Variant, "Label_en">>,
  locale: string = "id"
): string {
  if (locale === "id") {
    return variant.Label;
  }

  // Mode English ('en')
  if (variant.Label_en && variant.Label_en.trim()) {
    return variant.Label_en.trim().toUpperCase();
  }

  const cleanLabel = variant.Label.toUpperCase().trim();
  if (cleanLabel === "HARGA" || cleanLabel === "BIAYA" || cleanLabel === "ESTIMASI HARGA") {
    return "PRICE";
  }

  return variant.Label;
}

/**
 * Menerjemahkan catatan garansi varian (misal "90 Hari" -> "90 Days" saat locale === 'en').
 */
export function getLocalizedVariantNote(
  note: string | undefined,
  locale: string = "id"
): string {
  if (!note || !note.trim()) return "";
  if (locale === "id") return note;

  // Mode English ('en')
  let enNote = note;
  enNote = enNote.replace(/(\d+)\s*Hari/gi, "$1 Days");
  enNote = enNote.replace(/(\d+)\s*Bulan/gi, "$1 Months");
  enNote = enNote.replace(/(\d+)\s*Tahun/gi, "$1 Year(s)");
  enNote = enNote.replace(/Garansi\s*/gi, "Warranty: ");
  enNote = enNote.replace(/\bResmi\b/gi, "Official");
  enNote = enNote.replace(/\bHari\b/gi, "Days");
  enNote = enNote.replace(/\bBulan\b/gi, "Months");

  return enNote;
}
