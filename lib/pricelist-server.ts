import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import type { Category, ServiceType, Variant, DevicePrice } from "./data";

// ============================================================
// Resolusi Title & Icon per jenis service (dikelola di kode, §4.3)
// ============================================================

const SERVICE_META: Record<string, { title: string; icon: string }> = {
  "lcd-display": { title: "LCD", icon: "smartphone" },
  battery: { title: "Battery", icon: "battery" },
  "charger-port": { title: "Charger", icon: "plug" },
  camera: { title: "Kamera", icon: "camera" },
  "face-id-sensor": { title: "Face ID", icon: "scan-face" },
  "housing-backglass": { title: "Housing & Backglass", icon: "layers" },
};

export function resolveServiceMeta(
  serviceSlug: string,
  serviceName: string,
  categoryName: string,
  branded = false
): { title: string; icon: string } {
  // Service bertingkat memakai slug "brand-series--service"; META dicari
  // dengan bagian setelah "--" (mis. "samsung-galaxy-s-series--lcd-display"
  // → "lcd-display").
  const baseSlug = serviceSlug.includes("--")
    ? serviceSlug.split("--").pop()!
    : serviceSlug;
  const meta = SERVICE_META[baseSlug];
  const shortName = meta?.title ?? serviceName;
  return {
    // Bertingkat: konteks merk/series sudah ada di header induk — nama
    // kategori jadi redundan ("Harga LCD", bukan "Harga LCD Android").
    title: branded ? `Harga ${shortName}` : `Harga ${shortName} ${categoryName}`,
    icon: meta?.icon ?? "wrench",
  };
}

// ============================================================
// Pricelist — dibaca via fs setiap request (JANGAN import statis,
// agar perubahan admin tampil tanpa rebuild — §7.2). SERVER-ONLY.
// ============================================================

const PRICELIST_PATH = join(process.cwd(), "data", "pricelist.json");

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`pricelist.json tidak valid: ${message}`);
}

/**
 * Mendapatkan tanggal terakhir data pricelist diedit di backend/filesystem.
 * Format: "Update [Bulan] [Tahun]" (contoh: "Update Agustus 2026").
 */
export async function getPricelistLastUpdated(): Promise<string> {
  try {
    const s = await stat(PRICELIST_PATH);
    const date = s.mtime;
    const month = MONTH_NAMES_ID[date.getMonth()] ?? "Januari";
    const year = date.getFullYear();
    return `Update ${month} ${year}`;
  } catch {
    const now = new Date();
    const month = MONTH_NAMES_ID[now.getMonth()] ?? "Januari";
    return `Update ${month} ${now.getFullYear()}`;
  }
}

/**
 * Baca & validasi pricelist dari filesystem, lalu perkaya tiap jenis service
 * dengan title & icon hasil resolusi kode. Melempar Error bila struktur korup
 * (ditangkap oleh halaman → pesan ramah, bukan crash).
 */
export async function getPricelist(): Promise<Category[]> {
  const raw = await readFile(PRICELIST_PATH, "utf8");
  const parsed = JSON.parse(raw);
  assert(Array.isArray(parsed), "root harus array kategori");

  return parsed.map((cat: unknown): Category => {
    assert(cat && typeof cat === "object", "kategori bukan objek");
    const c = cat as Record<string, unknown>;
    assert(typeof c.Name === "string" && typeof c.Slug === "string", "kategori tanpa Name/Slug");
    assert(Array.isArray(c.service_types), `service_types kategori ${c.Slug} bukan array`);

    const service_types = (c.service_types as unknown[]).map((st): ServiceType => {
      const s = st as Record<string, unknown>;
      assert(typeof s.Name === "string" && typeof s.Slug === "string", "service tanpa Name/Slug");
      assert(Array.isArray(s.variants), `variants ${c.Slug}/${s.Slug} bukan array`);
      assert(Array.isArray(s.device_prices), `device_prices ${c.Slug}/${s.Slug} bukan array`);

      const brand = typeof s.Brand === "string" && s.Brand.trim() ? s.Brand.trim() : undefined;
      const series = typeof s.Series === "string" && s.Series.trim() ? s.Series.trim() : undefined;
      const { title, icon: fallbackIcon } = resolveServiceMeta(s.Slug, s.Name, c.Name as string, !!brand);
      const icon = typeof s.icon === "string" && s.icon.trim() ? s.icon.trim() : fallbackIcon;
      return {
        Name: s.Name,
        Slug: s.Slug,
        ...(brand ? { Brand: brand } : {}),
        ...(series ? { Series: series } : {}),
        variants: s.variants as Variant[],
        device_prices: s.device_prices as DevicePrice[],
        title,
        icon,
      };
    });

    const brand_icons: Record<string, string> = {};
    if (c.brand_icons && typeof c.brand_icons === "object") {
      for (const [b, ic] of Object.entries(c.brand_icons as Record<string, unknown>)) {
        if (typeof b === "string" && b.trim() && typeof ic === "string" && ic.trim()) {
          brand_icons[b.trim()] = ic.trim();
        }
      }
    }

    return {
      Name: c.Name,
      Slug: c.Slug,
      description: typeof c.description === "string" ? c.description : "",
      Image: typeof c.Image === "string" ? c.Image : null,
      brand_icons: Object.keys(brand_icons).length > 0 ? brand_icons : undefined,
      service_types,
    };
  });
}
