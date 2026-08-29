import {
  Smartphone,
  Monitor,
  Touchpad,
  Layers,
  Battery,
  BatteryCharging,
  Plug,
  Cable,
  Zap,
  Camera,
  Aperture,
  ScanFace,
  Fingerprint,
  Power,
  ToggleLeft,
  Volume2,
  Speaker,
  Mic,
  Cpu,
  Shield,
  Droplets,
  Wrench,
  Sparkles,
  Tablet,
  Laptop,
  Watch,
  TabletSmartphone,
  type LucideIcon,
} from "lucide-react";
import { brandImage } from "@/lib/data";

// Peta nama ikon ke komponen Lucide
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  monitor: Monitor,
  touchpad: Touchpad,
  layers: Layers,
  battery: Battery,
  "battery-charging": BatteryCharging,
  plug: Plug,
  cable: Cable,
  zap: Zap,
  camera: Camera,
  aperture: Aperture,
  "scan-face": ScanFace,
  fingerprint: Fingerprint,
  power: Power,
  "toggle-left": ToggleLeft,
  "volume-2": Volume2,
  speaker: Speaker,
  mic: Mic,
  cpu: Cpu,
  shield: Shield,
  droplets: Droplets,
  wrench: Wrench,
  sparkles: Sparkles,
  tablet: Tablet,
  laptop: Laptop,
  watch: Watch,
  "tablet-smartphone": TabletSmartphone,
};

export interface RepairIconMeta {
  id: string;
  label: string;
  category: string;
  keywords: string[];
}

/**
 * Daftar ikon perbaikan relevan yang dapat dipilih di panel admin
 */
export const REPAIR_ICON_OPTIONS: RepairIconMeta[] = [
  // Logo Merk Android (Mengambil berkas SVG dari direktori public/brands/)
  { id: "brand:samsung", label: "Samsung", category: "Logo Merk Android", keywords: ["samsung", "galaxy", "android", "merk", "brand"] },
  { id: "brand:xiaomi", label: "Xiaomi / Redmi / POCO", category: "Logo Merk Android", keywords: ["xiaomi", "redmi", "mi", "poco", "android", "merk", "brand"] },
  { id: "brand:oppo", label: "Oppo", category: "Logo Merk Android", keywords: ["oppo", "reno", "find", "android", "merk", "brand"] },
  { id: "brand:vivo", label: "Vivo / iQOO", category: "Logo Merk Android", keywords: ["vivo", "iqoo", "android", "merk", "brand"] },
  { id: "brand:realme", label: "Realme", category: "Logo Merk Android", keywords: ["realme", "narzo", "android", "merk", "brand"] },
  { id: "brand:infinix", label: "Infinix", category: "Logo Merk Android", keywords: ["infinix", "hot", "note", "android", "merk", "brand"] },
  { id: "brand:google-pixel", label: "Google Pixel", category: "Logo Merk Android", keywords: ["google", "pixel", "nexus", "android", "merk", "brand"] },
  { id: "brand:huawei", label: "Huawei", category: "Logo Merk Android", keywords: ["huawei", "honor", "mate", "p series", "android", "merk", "brand"] },
  { id: "brand:tecno", label: "Tecno", category: "Logo Merk Android", keywords: ["tecno", "spark", "camon", "android", "merk", "brand"] },
  { id: "brand:itel", label: "Itel", category: "Logo Merk Android", keywords: ["itel", "android", "merk", "brand"] },
  { id: "brand:zenfone", label: "Asus / ROG / Zenfone", category: "Logo Merk Android", keywords: ["asus", "zenfone", "rog", "android", "merk", "brand"] },

  // Layar & Kaca
  { id: "smartphone", label: "LCD & Layar", category: "Layar", keywords: ["lcd", "layar", "screen", "display", "hp", "iphone"] },
  { id: "touchpad", label: "Kaca Touchscreen", category: "Layar", keywords: ["touchscreen", "touch", "kaca", "sentuh", "depan"] },
  { id: "monitor", label: "Layar Laptop / Monitor", category: "Layar", keywords: ["monitor", "display", "macbook", "ipad", "laptop"] },
  { id: "layers", label: "Backdoor & Kaca Belakang", category: "Layar", keywords: ["glass", "backdoor", "kaca belakang", "layer", "tutup"] },

  // Baterai & Daya
  { id: "battery", label: "Baterai", category: "Baterai & Daya", keywords: ["baterai", "battery", "batre", "daya", "health"] },
  { id: "battery-charging", label: "Pengisian Daya", category: "Baterai & Daya", keywords: ["charging", "isi daya", "baterai", "cas", "fast charge"] },
  { id: "plug", label: "Port Charger (Konektor Cas)", category: "Baterai & Daya", keywords: ["charger", "port", "cas", "colokan", "konektor", "charging"] },
  { id: "cable", label: "Fleksibel Charger", category: "Baterai & Daya", keywords: ["kabel", "cable", "flexible cas", "charging flex", "fleksibel"] },
  { id: "zap", label: "IC Power", category: "Baterai & Daya", keywords: ["ic power", "arus", "konslet", "short", "listrik", "daya"] },

  // Kamera & Sensor
  { id: "camera", label: "Kamera Depan & Belakang", category: "Kamera & Sensor", keywords: ["kamera", "camera", "lens", "foto", "depan", "belakang"] },
  { id: "aperture", label: "Lensa & Kaca Kamera", category: "Kamera & Sensor", keywords: ["lensa", "kaca kamera", "aperture", "fokus"] },
  { id: "scan-face", label: "Face ID", category: "Kamera & Sensor", keywords: ["face id", "face", "sensor", "truedepth", "biometrik", "wajah"] },
  { id: "fingerprint", label: "Fingerprint & Touch ID", category: "Kamera & Sensor", keywords: ["fingerprint", "touch id", "sidik jari", "sensor"] },

  // Tombol & Audio
  { id: "power", label: "Fleksibel On / Off (Power)", category: "Tombol & Audio", keywords: ["power", "on off", "tombol power", "flexible", "hidup", "mati"] },
  { id: "toggle-left", label: "Tombol Volume & Mute", category: "Tombol & Audio", keywords: ["volume", "switch", "mute", "tombol samping", "silent"] },
  { id: "volume-2", label: "Speaker Musik & Buzzer", category: "Tombol & Audio", keywords: ["speaker", "musik", "buzzer", "suara", "dering", "bawah"] },
  { id: "speaker", label: "Speaker Telepon (Earpiece)", category: "Tombol & Audio", keywords: ["earpiece", "telepon", "speaker atas", "suara", "dengar"] },
  { id: "mic", label: "Mikrofon", category: "Tombol & Audio", keywords: ["mic", "mikrofon", "suara", "rekam", "panggilan"] },

  // Mesin & Bodi
  { id: "cpu", label: "Mesin & Motherboard (IC)", category: "Mesin & Bodi", keywords: ["mesin", "motherboard", "ic", "cpu", "chip", "mati total", "logic board"] },
  { id: "shield", label: "Housing & Casing Bodi", category: "Mesin & Bodi", keywords: ["housing", "casing", "body", "frame", "tulang", "bodi"] },

  // Perawatan & Servis Lain
  { id: "droplets", label: "Pembersihan Kena Air", category: "Perawatan", keywords: ["air", "water damage", "pembersihan", "kena air", "korosi", "cuci mesin"] },
  { id: "sparkles", label: "Poles & Ganti Kaca", category: "Perawatan", keywords: ["restorasi", "poles", "ganti kaca", "mulus", "refurbish"] },
  { id: "wrench", label: "Servis Umum & Lainnya", category: "Perawatan", keywords: ["service", "servis", "obeng", "perbaikan", "umum", "lainnya"] },
];

// Ikon fallback kartu kategori berdasarkan slug
export const CATEGORY_ICON: Record<string, string> = {
  iphone: "smartphone",
  ipad: "tablet",
  macbook: "laptop",
  iwatch: "watch",
  android: "tablet-smartphone",
};

export default function ServiceIcon({
  name,
  className,
  strokeWidth = 2,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  // Jika ikon merujuk ke logo merk (awalan "brand:" atau nama merk yang valid di folder brands)
  const brandSvg = brandImage(name);
  if (brandSvg && (name.startsWith("brand:") || !SERVICE_ICONS[name])) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brandSvg}
        alt={name}
        className={`object-contain ${className ?? "h-5 w-5"}`}
        loading="lazy"
      />
    );
  }

  const Icon = SERVICE_ICONS[name] ?? Wrench;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
