import ExcelJS from "exceljs";
import { MAX_VARIANTS, slugify, type Category, type DevicePrice, type Variant } from "@/lib/data";

/**
 * Parser import pricelist. Tiga tata letak file yang didukung:
 *
 * 1. Long format 6 kolom (kontrak PRD §4.3, hasil Download Excel):
 *      Kategori | Jenis Service | Model Device | Varian | Keterangan Varian | Harga
 *    Mode "sesuai file": kategori di file di-REPLACE penuh; kategori baru tidak
 *    dibuat (baris kategori tak dikenal = error).
 *
 * 2. Long format 4 kolom (hanya mode target):
 *      Model Device | Varian | Keterangan Varian | Harga
 *
 * 3. WIDE/MATRIKS (hanya mode target) — format alami client di Excel:
 *      kolom 1 = model, kolom 2..N = nama varian di header, isi sel = harga.
 *      Harga "0" atau kosong = varian tidak tersedia (→ "–").
 *      Bila seluruh harga di file ≤ 20.000, angka dianggap RIBUAN dan dikonversi
 *      otomatis (600 → 600.000) dengan pemberitahuan di preview.
 *
 * Mode target: semua baris masuk ke satu jenis service; hanya service itu yang
 * di-replace. Jika ada satu pun error, tidak ada data yang ditulis.
 */

export interface ImportTarget {
  categorySlug: string;
  serviceSlug: string;
}

export interface ImportError {
  row: number; // nomor baris file (1-based, termasuk header)
  message: string;
}

export interface ImportPreview {
  categories: { name: string; services: number; models: number; prices: number }[];
  untouched: string[];
  errors: ImportError[];
  warnings: string[];
  targetNote?: string;
}

export interface ImportResult {
  merged: Category[] | null; // null bila ada error
  preview: ImportPreview;
}

const FULL_HEADER = ["kategori", "jenisservice", "modeldevice", "varian", "keteranganvarian", "harga"];
const SHORT_HEADER = FULL_HEADER.slice(2);
const HEADER_LABELS = ["Kategori", "Jenis Service", "Model Device", "Varian", "Keterangan Varian", "Harga"];

/** Ambang deteksi harga-dalam-ribuan: tidak ada jasa servis di bawah Rp 20.000. */
const RIBUAN_THRESHOLD = 20000;

function normalizeHeaderCell(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Rapikan teks header varian: buang newline & spasi ganda. */
function cleanLabel(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// ============================================================
// Pembacaan file → matriks string
// ============================================================

/** Parser CSV kecil: dukung kutip ganda, delimiter otomatis (Excel Indonesia memakai ";"). */
export function parseCsv(text: string): string[][] {
  const body = text.replace(/^﻿/, ""); // buang BOM
  const firstLine = body.slice(0, body.indexOf("\n") === -1 ? body.length : body.indexOf("\n"));
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";

  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inQuotes) {
      if (ch === '"') {
        if (body[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"' && field === "") {
      // Kutip hanya membuka mode quoted di AWAL field; kutip di tengah teks
      // (mis. iPad Pro 13" ) diperlakukan sebagai karakter biasa.
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && body[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Ekstrak teks sel exceljs — tangani formula, rich text, hyperlink. */
function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if (value instanceof Date) return value.toISOString();
    if ("result" in value) return value.result == null ? "" : String(value.result).trim();
    if ("richText" in value) return value.richText.map((rt) => rt.text).join("").trim();
    if ("text" in value) return String(value.text).trim();
    return "";
  }
  return String(value).trim();
}

async function parseXlsx(buffer: Buffer): Promise<string[][]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  // Pakai sheet pertama yang ada isinya (file client sering punya Sheet2/3 kosong).
  const sheet = workbook.worksheets.find((s) => s.rowCount > 0);
  if (!sheet) return [];
  const maxCol = Math.max(sheet.columnCount, 7);
  const rows: string[][] = [];
  sheet.eachRow({ includeEmpty: true }, (row) => {
    const cells: string[] = [];
    for (let col = 1; col <= maxCol; col++) {
      cells.push(cellToString(row.getCell(col).value));
    }
    rows.push(cells);
  });
  return rows;
}

// ============================================================
// Struktur bangunan bersama
// ============================================================

function parsePrice(raw: string): number | null {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isSafeInteger(n) ? n : null;
}

interface BuildingService {
  Name: string;
  Slug: string;
  variants: Variant[];
  rows: Map<string, DevicePrice>; // key: lower(model)
}

export async function parseImportFile(
  buffer: Buffer,
  filename: string,
  existing: Category[],
  target?: ImportTarget
): Promise<ImportResult> {
  const errors: ImportError[] = [];
  const warnings: string[] = [];

  const rows = filename.toLowerCase().endsWith(".csv")
    ? parseCsv(buffer.toString("utf8"))
    : await parseXlsx(buffer);

  const emptyPreview = (): ImportPreview => ({ categories: [], untouched: [], errors, warnings });

  if (rows.length < 2) {
    errors.push({ row: 1, message: "File kosong atau tidak punya baris data." });
    return { merged: null, preview: emptyPreview() };
  }

  // Validasi target (bila mode destinasi).
  let targetCategory: Category | undefined;
  let targetServiceSlug = "";
  let targetServiceName = "";
  if (target) {
    targetCategory = existing.find((c) => c.Slug === target.categorySlug);
    if (!targetCategory) {
      errors.push({ row: 1, message: `Kategori tujuan "${target.categorySlug}" tidak ditemukan.` });
      return { merged: null, preview: emptyPreview() };
    }
    const svc = targetCategory.service_types.find((s) => s.Slug === target.serviceSlug);
    if (!svc) {
      errors.push({
        row: 1,
        message: `Jenis service tujuan "${target.serviceSlug}" tidak ada di kategori ${targetCategory.Name}.`,
      });
      return { merged: null, preview: emptyPreview() };
    }
    targetServiceSlug = svc.Slug;
    targetServiceName = svc.Name;
  }

  // Deteksi tata letak: long 6 kolom, long 4 kolom (target), atau wide/matriks (target).
  const header = rows[0].map(normalizeHeaderCell);
  let layout: "long" | "wide";
  let offset = 2; // indeks kolom "Model Device" pada layout long
  if (FULL_HEADER.every((h, i) => header[i] === h)) {
    layout = "long";
    offset = 2;
  } else if (target && SHORT_HEADER.every((h, i) => header[i] === h)) {
    layout = "long";
    offset = 0;
  } else if (target) {
    layout = "wide";
  } else {
    errors.push({
      row: 1,
      message:
        `Header tidak dikenal — untuk import tanpa tujuan, gunakan "${HEADER_LABELS.join(" | ")}" ` +
        `(pakai file hasil Download Excel sebagai template). File matriks (kolom model × varian) ` +
        `juga didukung, tapi harus memilih Tujuan import terlebih dahulu.`,
    });
    return { merged: null, preview: emptyPreview() };
  }

  const touched = new Map<string, Map<string, BuildingService>>();

  // ============================================================
  // Layout WIDE/MATRIKS — semua baris ke service target
  // ============================================================
  if (layout === "wide") {
    // Varian = header kolom 2..N yang tidak kosong.
    const variantCols: { col: number; variant: Variant }[] = [];
    for (let c = 1; c < rows[0].length; c++) {
      const raw = cleanLabel(rows[0][c] ?? "");
      if (!raw) continue;
      const key = slugify(raw);
      if (!key) continue;
      if (variantCols.some((v) => v.variant.Key === key)) {
        errors.push({ row: 1, message: `Kolom varian duplikat: "${raw}".` });
        continue;
      }
      variantCols.push({ col: c, variant: { Key: key, Label: raw.toUpperCase(), Note: "" } });
    }
    if (variantCols.length === 0) {
      errors.push({
        row: 1,
        message: "Tidak ada kolom varian terdeteksi — header kolom ke-2 dst. harus berisi nama varian.",
      });
    }
    if (variantCols.length > MAX_VARIANTS) {
      errors.push({
        row: 1,
        message: `Maksimum ${MAX_VARIANTS} kolom varian (file ini punya ${variantCols.length}).`,
      });
    }
    if (errors.length > 0) return { merged: null, preview: emptyPreview() };

    // Kumpulkan baris model + deteksi harga-dalam-ribuan (dua tahap).
    const service: BuildingService = {
      Name: targetServiceName,
      Slug: targetServiceSlug,
      variants: variantCols.map((v) => v.variant),
      rows: new Map(),
    };
    let maxPrice = 0;

    for (let r = 1; r < rows.length; r++) {
      const rowNum = r + 1;
      const cells = rows[r];
      if (cells.every((c) => !c || c.trim() === "")) continue;

      const model = cleanLabel(cells[0] ?? "");
      if (!model) {
        errors.push({ row: rowNum, message: "Kolom pertama (nama model) kosong." });
        continue;
      }
      const modelKey = model.toLowerCase();
      if (service.rows.has(modelKey)) {
        errors.push({ row: rowNum, message: `Model duplikat: "${model}".` });
        continue;
      }

      const prices: Record<string, number | null> = {};
      for (const { col, variant } of variantCols) {
        const raw = (cells[col] ?? "").trim();
        const parsed = parsePrice(raw);
        // "0", kosong, atau non-angka = varian tidak tersedia.
        prices[variant.Key] = parsed === null || parsed === 0 ? null : parsed;
        if (parsed !== null && parsed > maxPrice) maxPrice = parsed;
      }
      service.rows.set(modelKey, { DeviceModel: model, prices });
    }

    if (errors.length > 0) return { merged: null, preview: emptyPreview() };

    // Seluruh harga kecil → file memakai satuan ribuan; konversi diam-diam (600 → 600.000).
    if (maxPrice > 0 && maxPrice <= RIBUAN_THRESHOLD) {
      for (const dp of service.rows.values()) {
        for (const k of Object.keys(dp.prices)) {
          if (dp.prices[k] !== null) dp.prices[k] = dp.prices[k]! * 1000;
        }
      }
    }

    touched.set(targetCategory!.Slug, new Map([[targetServiceSlug, service]]));
  } else {
    // ============================================================
    // Layout LONG — logika lama (mode sesuai-file & target)
    // ============================================================
    const categoryLookup = new Map<string, Category>();
    for (const cat of existing) {
      categoryLookup.set(cat.Slug.toLowerCase(), cat);
      categoryLookup.set(cat.Name.toLowerCase(), cat);
    }
    const seenPriceKeys = new Set<string>();

    for (let r = 1; r < rows.length; r++) {
      const rowNum = r + 1;
      const cells = rows[r].map((c) => (c ?? "").trim());
      if (cells.every((c) => c === "")) continue;

      const rawModel = cells[offset];
      const rawVariant = cells[offset + 1];
      const rawNote = cells[offset + 2] ?? "";
      const rawPrice = cells[offset + 3] ?? "";

      let category: Category;
      let svcSlug: string;
      let svcName: string;
      if (target) {
        category = targetCategory!;
        svcSlug = targetServiceSlug;
        svcName = targetServiceName;
      } else {
        const rawCat = cells[0];
        const rawSvc = cells[1];
        if (!rawCat || !rawSvc) {
          errors.push({ row: rowNum, message: "Kolom Kategori dan Jenis Service wajib diisi." });
          continue;
        }
        const found = categoryLookup.get(rawCat.toLowerCase());
        if (!found) {
          errors.push({
            row: rowNum,
            message: `Kategori "${rawCat}" tidak dikenal. Kategori yang tersedia: ${existing.map((c) => c.Name).join(", ")}.`,
          });
          continue;
        }
        category = found;
        const existingSvc = category.service_types.find(
          (s) =>
            s.Slug.toLowerCase() === rawSvc.toLowerCase() ||
            s.Name.toLowerCase() === rawSvc.toLowerCase()
        );
        svcSlug = existingSvc?.Slug ?? slugify(rawSvc);
        svcName = existingSvc?.Name ?? rawSvc;
      }

      if (!rawModel || !rawVariant) {
        errors.push({ row: rowNum, message: "Kolom Model Device dan Varian wajib diisi." });
        continue;
      }

      const price = parsePrice(rawPrice);
      if (price === null) {
        errors.push({
          row: rowNum,
          message: `Harga "${rawPrice}" tidak valid — isi angka bulat ≥ 0 (varian yang tidak tersedia: hapus barisnya, jangan isi 0/kosong).`,
        });
        continue;
      }

      if (!touched.has(category.Slug)) touched.set(category.Slug, new Map());
      const services = touched.get(category.Slug)!;
      if (!services.has(svcSlug)) {
        services.set(svcSlug, { Name: svcName, Slug: svcSlug, variants: [], rows: new Map() });
      }
      const service = services.get(svcSlug)!;

      const variantKey = slugify(rawVariant);
      if (!variantKey) {
        errors.push({ row: rowNum, message: `Nama varian "${rawVariant}" tidak valid.` });
        continue;
      }
      let variant = service.variants.find((v) => v.Key === variantKey);
      if (!variant) {
        if (service.variants.length >= MAX_VARIANTS) {
          errors.push({
            row: rowNum,
            message: `Service "${service.Name}" (${category.Name}) melebihi ${MAX_VARIANTS} varian — varian "${rawVariant}" ditolak.`,
          });
          continue;
        }
        variant = { Key: variantKey, Label: rawVariant.toUpperCase(), Note: rawNote };
        service.variants.push(variant);
      } else {
        if (variant.Label.toLowerCase() !== rawVariant.toLowerCase()) {
          warnings.push(
            `Baris ${rowNum}: varian "${rawVariant}" dianggap sama dengan "${variant.Label}" (${category.Name} / ${service.Name}).`
          );
        }
        if (!variant.Note && rawNote) variant.Note = rawNote;
      }

      const dupKey = `${category.Slug}|${svcSlug}|${rawModel.toLowerCase()}|${variantKey}`;
      if (seenPriceKeys.has(dupKey)) {
        errors.push({
          row: rowNum,
          message: `Duplikat: harga untuk ${rawModel} / ${rawVariant} (${category.Name} / ${service.Name}) sudah ada di baris sebelumnya.`,
        });
        continue;
      }
      seenPriceKeys.add(dupKey);

      const modelKey = rawModel.toLowerCase();
      if (!service.rows.has(modelKey)) {
        service.rows.set(modelKey, { DeviceModel: rawModel, prices: {} });
      }
      service.rows.get(modelKey)!.prices[variantKey] = price;
    }
  }

  // ============================================================
  // Rakit hasil merge + preview (bersama untuk semua layout)
  // ============================================================
  const preview: ImportPreview = { categories: [], untouched: [], errors, warnings };
  if (errors.length > 0) return { merged: null, preview };

  const buildServiceTypes = (b: BuildingService) => ({
    Name: b.Name,
    Slug: b.Slug,
    variants: b.variants,
    device_prices: [...b.rows.values()].map((dp) => ({
      DeviceModel: dp.DeviceModel,
      prices: Object.fromEntries(b.variants.map((v) => [v.Key, dp.prices[v.Key] ?? null])),
    })),
    title: "",
    icon: "",
  });

  const countPreview = (name: string, services: ReturnType<typeof buildServiceTypes>[]) => {
    preview.categories.push({
      name,
      services: services.length,
      models: services.reduce((n, s) => n + s.device_prices.length, 0),
      prices: services.reduce(
        (n, s) =>
          n + s.device_prices.reduce((m, d) => m + Object.values(d.prices).filter((p) => p !== null).length, 0),
        0
      ),
    });
  };

  const merged: Category[] = existing.map((cat) => {
    const services = touched.get(cat.Slug);
    if (!services) {
      preview.untouched.push(cat.Name);
      return cat;
    }

    if (target) {
      const built = buildServiceTypes(services.get(targetServiceSlug)!);
      countPreview(cat.Name, [built]);
      preview.targetNote = `Semua baris masuk ke "${targetServiceName}" (${cat.Name}) — service lain di kategori ini tidak berubah.`;
      return {
        ...cat,
        // Pertahankan Brand/Series service lama saat di-replace — tanpa ini
        // import bertarget diam-diam melepas service dari hirarki merk.
        service_types: cat.service_types.map((s) =>
          s.Slug === targetServiceSlug
            ? {
                ...built,
                ...(s.Brand ? { Brand: s.Brand } : {}),
                ...(s.Series ? { Series: s.Series } : {}),
              }
            : s
        ),
      };
    }

    const service_types = [...services.values()].map(buildServiceTypes);
    countPreview(cat.Name, service_types);
    return { ...cat, service_types };
  });

  return { merged, preview };
}
