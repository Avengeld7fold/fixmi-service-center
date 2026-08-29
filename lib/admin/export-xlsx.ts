import ExcelJS from "exceljs";
import type { Category } from "@/lib/data";

/**
 * Export pricelist → workbook long-format (kontrak PRD §4.3), satu sheet.
 * File ini sekaligus menjadi TEMPLATE: client mengedit hasil export lalu
 * mengimpornya kembali, sehingga format tidak pernah dikarang manual.
 */
export async function buildPricelistXlsx(categories: Category[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Pricelist");

  sheet.columns = [
    { header: "Kategori", key: "kategori", width: 14 },
    { header: "Jenis Service", key: "service", width: 22 },
    { header: "Model Device", key: "model", width: 30 },
    { header: "Varian", key: "varian", width: 22 },
    { header: "Keterangan Varian", key: "note", width: 26 },
    { header: "Harga", key: "harga", width: 14 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const cat of categories) {
    for (const svc of cat.service_types) {
      for (const dp of svc.device_prices) {
        for (const v of svc.variants) {
          const price = dp.prices[v.Key];
          if (price === null || price === undefined) continue; // varian tak tersedia = baris tidak ditulis
          sheet.addRow({
            kategori: cat.Name,
            // Service bertingkat ditulis dengan SLUG (unik per merk/series) —
            // Name-nya ("LCD / Display") duplikat lintas merk sehingga
            // re-import akan salah menggabungkan semua merk jadi satu service.
            // Import mencocokkan slug lebih dulu, jadi round-trip aman.
            service: svc.Brand ? svc.Slug : svc.Name,
            model: dp.DeviceModel,
            varian: v.Label,
            note: v.Note,
            harga: price,
          });
        }
      }
    }
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
