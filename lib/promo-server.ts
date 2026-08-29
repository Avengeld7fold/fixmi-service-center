import { promises as fs } from "fs";
import path from "path";

export interface PromoImageItem {
  id: number | string;
  Title?: string;
  Image: string;
  altText?: string;
  validUntil?: string;
  badge?: string;
  link?: string;
  createdAt?: string;
}

const PROMO_FILE = path.join(process.cwd(), "data", "promo.json");

/**
 * Membaca daftar gambar promo dari data/promo.json di server.
 * Mengembalikan array kosong jika belum ada promo yang diunggah.
 */
export async function getPromoItems(): Promise<PromoImageItem[]> {
  try {
    const raw = await fs.readFile(PROMO_FILE, "utf-8");
    const parsed: PromoImageItem[] = JSON.parse(raw);

    if (Array.isArray(parsed) && parsed.length > 0) {
      // Filter hanya item yang memiliki Image valid
      return parsed.filter(
        (item) => typeof item.Image === "string" && item.Image.trim().length > 0
      );
    }
  } catch {
    // File belum ada atau kosong
  }

  return [];
}

/**
 * Menyimpan daftar gambar promo ke data/promo.json (untuk sinkronisasi upload backend).
 */
export async function savePromoItems(promos: PromoImageItem[]): Promise<void> {
  const dataDir = path.join(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(PROMO_FILE, JSON.stringify(promos, null, 2), "utf-8");
}

/**
 * Menambahkan item promo baru ke data/promo.json.
 */
export async function addPromoItem(item: Omit<PromoImageItem, "id" | "createdAt">): Promise<PromoImageItem> {
  const promos = await getPromoItems();
  const newPromo: PromoImageItem = {
    id: `promo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...item,
    createdAt: new Date().toISOString(),
  };
  promos.unshift(newPromo); // taruh promo terbaru di atas
  await savePromoItems(promos);
  return newPromo;
}

/**
 * Menghapus item promo dari data/promo.json berdasarkan id.
 */
export async function deletePromoItem(id: number | string): Promise<boolean> {
  const promos = await getPromoItems();
  const filtered = promos.filter((p) => String(p.id) !== String(id));
  if (filtered.length !== promos.length) {
    await savePromoItems(filtered);
    return true;
  }
  return false;
}
