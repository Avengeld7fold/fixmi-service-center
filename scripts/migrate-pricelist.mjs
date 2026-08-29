/**
 * Migrasi pricelist.json dari struktur lama (satu harga per model) ke struktur
 * multi-varian (PRD-pricelist-fixmi.md §4.2). Idempotent: aman dijalankan ulang —
 * data yang sudah berformat baru dilewati tanpa perubahan.
 *
 * Lama:  service_type.device_prices[] = { DeviceModel, Harga }
 * Baru:  category.Image                 = null (kalau belum ada)
 *        service_type.variants[]        = [{ Key:"standar", Label:"HARGA", Note:"" }]
 *        service_type.device_prices[]   = { DeviceModel, prices: { standar: <Harga> } }
 *
 * Title & Icon TIDAK disimpan di JSON — di-resolve di kode (lib/data.ts) sesuai §4.3.
 *
 * Jalankan: node scripts/migrate-pricelist.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = join(root, "data", "pricelist.json");

const DEFAULT_VARIANT = { Key: "standar", Label: "HARGA", Note: "" };

const categories = JSON.parse(readFileSync(file, "utf8"));

for (const category of categories) {
  if (!("Image" in category)) category.Image = null;

  for (const service of category.service_types ?? []) {
    if (!Array.isArray(service.variants) || service.variants.length === 0) {
      service.variants = [{ ...DEFAULT_VARIANT }];
    }

    service.device_prices = (service.device_prices ?? []).map((dp) => {
      // Sudah format baru → biarkan.
      if (dp.prices && typeof dp.prices === "object") return dp;
      return { DeviceModel: dp.DeviceModel, prices: { standar: dp.Harga } };
    });
  }
}

writeFileSync(file, JSON.stringify(categories, null, 2) + "\n", "utf8");

const services = categories.reduce((n, c) => n + (c.service_types?.length ?? 0), 0);
console.log(`Migrasi selesai: ${categories.length} kategori, ${services} jenis service.`);
