import { copyFile, mkdir, readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { MAX_VARIANTS, slugify, type Category, type DevicePrice, type ServiceType, type Variant } from "@/lib/data";

const DATA_DIR = join(process.cwd(), "data");
const PRICELIST_PATH = join(DATA_DIR, "pricelist.json");
const BACKUP_DIR = join(DATA_DIR, "backups");

/** Masa simpan backup otomatis: 30 hari. */
export const BACKUP_RETENTION_DAYS = 30;
export const BACKUP_RETENTION_MS = BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;

// ============================================================
// Bentuk tersimpan di JSON: tanpa field hasil resolusi (title/icon).
// ============================================================

interface StoredServiceType {
  Name: string;
  Slug: string;
  Brand?: string;
  Series?: string;
  icon?: string;
  variants: Variant[];
  device_prices: DevicePrice[];
}

interface StoredCategory {
  Name: string;
  Slug: string;
  description: string;
  Image: string | null;
  brand_icons?: Record<string, string>;
  service_types: StoredServiceType[];
}

// ============================================================
// Validasi — satu jalur untuk save-inline, import, dan restore.
// Melempar Error dengan pesan siap-tampil bila data tidak sah.
// ============================================================

function fail(message: string): never {
  throw new Error(message);
}

/**
 * Validasi + normalisasi ke bentuk tersimpan. Menerima Category[] (boleh
 * membawa title/icon dari client — dibuang), mengembalikan StoredCategory[].
 */
export function validateAndStrip(input: unknown): StoredCategory[] {
  if (!Array.isArray(input) || input.length === 0) fail("Data kosong atau bukan array kategori.");

  const catSlugs = new Set<string>();
  return input.map((cat, ci): StoredCategory => {
    const c = cat as Partial<Category>;
    if (!c || typeof c.Name !== "string" || !c.Name.trim()) fail(`Kategori #${ci + 1}: Name kosong.`);
    if (typeof c.Slug !== "string" || !c.Slug.trim()) fail(`Kategori "${c.Name}": Slug kosong.`);
    if (catSlugs.has(c.Slug)) fail(`Slug kategori duplikat: "${c.Slug}".`);
    catSlugs.add(c.Slug);
    if (!Array.isArray(c.service_types)) fail(`Kategori "${c.Name}": service_types bukan array.`);

    const svcSlugs = new Set<string>();
    const service_types = c.service_types.map((svc): StoredServiceType => {
      const s = svc as Partial<ServiceType>;
      if (!s || typeof s.Name !== "string" || !s.Name.trim())
        fail(`Kategori "${c.Name}": ada jenis service tanpa nama.`);
      if (typeof s.Slug !== "string" || !s.Slug.trim()) fail(`Service "${s.Name}": Slug kosong.`);
      if (svcSlugs.has(s.Slug)) fail(`Kategori "${c.Name}": slug service duplikat "${s.Slug}".`);
      svcSlugs.add(s.Slug);

      if (!Array.isArray(s.variants) || s.variants.length === 0)
        fail(`Service "${s.Name}" (${c.Name}): minimal satu varian.`);
      if (s.variants.length > MAX_VARIANTS)
        fail(`Service "${s.Name}" (${c.Name}): maksimum ${MAX_VARIANTS} varian (sekarang ${s.variants.length}).`);

      const keys = new Set<string>();
      const variants = s.variants.map((v): Variant => {
        if (!v || typeof v.Key !== "string" || !v.Key.trim())
          fail(`Service "${s.Name}" (${c.Name}): ada varian tanpa Key.`);
        if (typeof v.Label !== "string" || !v.Label.trim())
          fail(`Service "${s.Name}" (${c.Name}): varian "${v.Key}" tanpa Label.`);
        if (keys.has(v.Key)) fail(`Service "${s.Name}" (${c.Name}): Key varian duplikat "${v.Key}".`);
        keys.add(v.Key);
        return { Key: v.Key, Label: v.Label.trim(), Note: typeof v.Note === "string" ? v.Note.trim() : "" };
      });

      if (!Array.isArray(s.device_prices)) fail(`Service "${s.Name}" (${c.Name}): device_prices bukan array.`);
      const models = new Set<string>();
      const device_prices = s.device_prices.map((dp): DevicePrice => {
        if (!dp || typeof dp.DeviceModel !== "string" || !dp.DeviceModel.trim())
          fail(`Service "${s.Name}" (${c.Name}): ada baris model tanpa nama.`);
        const model = dp.DeviceModel.trim();
        if (models.has(model.toLowerCase()))
          fail(`Service "${s.Name}" (${c.Name}): model duplikat "${model}".`);
        models.add(model.toLowerCase());
        if (!dp.prices || typeof dp.prices !== "object")
          fail(`Model "${model}" (${s.Name}, ${c.Name}): prices bukan objek.`);

        // Hanya simpan kunci varian yang dikenal (forward-compatible, PRD §7.3).
        const prices: Record<string, number | null> = {};
        for (const v of variants) {
          const raw = (dp.prices as Record<string, unknown>)[v.Key];
          if (raw === null || raw === undefined || raw === "") {
            prices[v.Key] = null;
          } else if (typeof raw === "number" && Number.isInteger(raw) && raw >= 0) {
            prices[v.Key] = raw;
          } else {
            fail(`Model "${model}" (${s.Name}, ${c.Name}): harga varian "${v.Label}" harus bilangan bulat ≥ 0.`);
          }
        }
        return { DeviceModel: model, prices };
      });

      return {
        Name: s.Name.trim(),
        Slug: s.Slug,
        // Passthrough hirarki merk/series & icon kustom
        ...(typeof s.Brand === "string" && s.Brand.trim() ? { Brand: s.Brand.trim() } : {}),
        ...(typeof s.Series === "string" && s.Series.trim() ? { Series: s.Series.trim() } : {}),
        ...(typeof s.icon === "string" && s.icon.trim() ? { icon: s.icon.trim() } : {}),
        variants,
        device_prices,
      };
    });

    const brand_icons: Record<string, string> = {};
    if (c.brand_icons && typeof c.brand_icons === "object") {
      for (const [b, ic] of Object.entries(c.brand_icons)) {
        if (typeof b === "string" && b.trim() && typeof ic === "string" && ic.trim()) {
          brand_icons[b.trim()] = ic.trim();
        }
      }
    }

    return {
      Name: c.Name.trim(),
      Slug: c.Slug,
      description: typeof c.description === "string" ? c.description : "",
      Image: typeof c.Image === "string" ? c.Image : null,
      ...(Object.keys(brand_icons).length > 0 ? { brand_icons } : {}),
      service_types,
    };
  });
}

// ============================================================
// Backup & tulis atomik
// ============================================================

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

/**
 * Membersihkan otomatis file backup yang usianya sudah melebihi 30 hari.
 * Mengembalikan daftar nama file yang dihapus.
 */
export async function cleanExpiredBackups(): Promise<string[]> {
  await mkdir(BACKUP_DIR, { recursive: true });
  const now = Date.now();
  const deleted: string[] = [];

  try {
    const files = (await readdir(BACKUP_DIR)).filter((f) => /^pricelist-.*\.json$/.test(f));
    for (const filename of files) {
      const filepath = join(BACKUP_DIR, filename);
      try {
        const fileStat = await stat(filepath);
        const ageMs = now - fileStat.mtime.getTime();
        // Hapus jika sudah lebih dari 30 hari
        if (ageMs > BACKUP_RETENTION_MS) {
          await unlink(filepath);
          deleted.push(filename);
        }
      } catch {
        // Abaikan jika file sudah tidak ada
      }
    }
  } catch {
    // Folder belum ada
  }

  return deleted;
}

/**
 * Membuat snapshot cadangan manual dari data pricelist saat ini.
 */
export async function createManualBackup(): Promise<string> {
  await mkdir(BACKUP_DIR, { recursive: true });
  const filename = `pricelist-${timestamp()}--cadangan-manual.json`;
  await copyFile(PRICELIST_PATH, join(BACKUP_DIR, filename));
  await cleanExpiredBackups();
  return filename;
}

async function backupCurrent(reason?: string): Promise<string> {
  await mkdir(BACKUP_DIR, { recursive: true });
  const safeReason = reason ? `--${reason.replace(/[^a-zA-Z0-9-]/g, "-")}` : "";
  const filename = `pricelist-${timestamp()}${safeReason}.json`;
  try {
    await copyFile(PRICELIST_PATH, join(BACKUP_DIR, filename));
  } catch {
    return ""; // file utama belum ada — tidak ada yang di-backup
  }

  // Bersihkan backup yang sudah lebih tua dari 30 hari
  await cleanExpiredBackups();
  return filename;
}

interface DeletionCheckResult {
  hasDeletion: boolean;
  reason?: string;
}

async function checkIfDeletionOccurred(storedNew: StoredCategory[]): Promise<DeletionCheckResult> {
  try {
    const raw = await readFile(PRICELIST_PATH, "utf8");
    const current: StoredCategory[] = JSON.parse(raw);
    if (!Array.isArray(current)) return { hasDeletion: false };

    // Kumpulkan semua service slug saat ini: "categorySlug::serviceSlug" -> info
    const currentServices = new Map<string, { serviceName: string; catName: string }>();
    let currentModelCount = 0;
    for (const cat of current) {
      for (const svc of cat.service_types || []) {
        currentServices.set(`${cat.Slug}::${svc.Slug}`, {
          serviceName: svc.Name || svc.Slug,
          catName: cat.Name || cat.Slug,
        });
        currentModelCount += (svc.device_prices || []).length;
      }
    }

    // Kumpulkan semua service slug di data baru
    const newServices = new Set<string>();
    let newModelCount = 0;
    for (const cat of storedNew) {
      for (const svc of cat.service_types || []) {
        newServices.add(`${cat.Slug}::${svc.Slug}`);
        newModelCount += (svc.device_prices || []).length;
      }
    }

    // Cari layanan yang dihapus
    const deletedServices: { serviceName: string; catName: string }[] = [];
    for (const [key, val] of currentServices.entries()) {
      if (!newServices.has(key)) {
        deletedServices.push(val);
      }
    }

    if (deletedServices.length > 0) {
      if (deletedServices.length === 1) {
        const first = deletedServices[0];
        const sSlug = slugify(first.serviceName) || "layanan";
        const cSlug = slugify(first.catName) || "kategori";
        return {
          hasDeletion: true,
          reason: `hapus-layanan-${sSlug}-${cSlug}`,
        };
      }
      return {
        hasDeletion: true,
        reason: `hapus-${deletedServices.length}-layanan`,
      };
    }

    // Jika jumlah baris model berkurang (ada model yang dihapus)
    if (newModelCount < currentModelCount) {
      const diff = currentModelCount - newModelCount;
      return {
        hasDeletion: true,
        reason: `hapus-${diff}-model-perangkat`,
      };
    }

    return { hasDeletion: false };
  } catch {
    return { hasDeletion: false };
  }
}

/**
 * Validasi → deteksi penghapusan → tulis atomik (tmp + rename) → revalidate.
 * Satu-satunya pintu penulisan pricelist.json.
 * Cadangan data otomatis dibuat jika mendeteksi penghapusan layanan atau model.
 */
export async function writePricelist(input: unknown): Promise<void> {
  const stored = validateAndStrip(input);

  // Otomatis buat cadangan HANYA jika ada layanan/model yang dihapus
  const checkResult = await checkIfDeletionOccurred(stored);
  if (checkResult.hasDeletion) {
    await backupCurrent(checkResult.reason);
  }

  const tmp = `${PRICELIST_PATH}.tmp`;
  await writeFile(tmp, JSON.stringify(stored, null, 2) + "\n", "utf8");
  await rename(tmp, PRICELIST_PATH); // atomik di filesystem yang sama
  revalidatePath("/pricelist");
}

// ============================================================
// Daftar & restore backup
// ============================================================

export interface BackupInfo {
  name: string;
  title: string;
  badge?: string;
  modifiedAt: string; // ISO
  sizeBytes: number;
  daysRemaining: number; // Hari tersisa sebelum kedaluwarsa (1-30 hari)
}

function parseBackupTitle(filename: string): { title: string; badge?: string } {
  // Tangkap format: pricelist-YYYY-MM-DDTHH-mm-ss(--reason)?.json
  const match = filename.match(/^pricelist-([\d-]+T[\d-]+)(?:--([\w-]+))?\.json$/);

  if (!match || !match[2]) {
    return { title: "Cadangan Data Snapshot", badge: "Auto Snapshot" };
  }

  const rawReason = match[2];

  if (rawReason === "cadangan-manual") {
    return { title: "Cadangan Data Manual", badge: "Manual" };
  }

  if (rawReason.startsWith("hapus-layanan-")) {
    const serviceInfo = rawReason
      .replace(/^hapus-layanan-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return {
      title: `Sebelum Hapus Layanan: ${serviceInfo}`,
      badge: "Hapus Layanan",
    };
  }

  if (rawReason.startsWith("hapus-")) {
    const info = rawReason
      .replace(/^hapus-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return {
      title: `Sebelum Hapus ${info}`,
      badge: "Hapus Data",
    };
  }

  const clean = rawReason.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return { title: clean, badge: "Snapshot" };
}

/**
 * Mengambil daftar backup aktif yang masih berada dalam masa retensi 30 hari.
 * Backup yang sudah melewati 30 hari akan otomatis dihapus dan tidak ditampilkan.
 */
export async function listBackups(): Promise<BackupInfo[]> {
  await mkdir(BACKUP_DIR, { recursive: true });
  // Bersihkan file kedaluwarsa terlebih dahulu
  await cleanExpiredBackups();

  const now = Date.now();
  const files = (await readdir(BACKUP_DIR)).filter((f) => /^pricelist-.*\.json$/.test(f));
  const infos: BackupInfo[] = [];

  for (const name of files) {
    try {
      const s = await stat(join(BACKUP_DIR, name));
      const ageMs = now - s.mtime.getTime();

      // Hanya masukkan yang <= 30 hari
      if (ageMs <= BACKUP_RETENTION_MS) {
        const daysOld = Math.floor(ageMs / (24 * 60 * 60 * 1000));
        const daysRemaining = Math.max(1, BACKUP_RETENTION_DAYS - daysOld);
        const parsed = parseBackupTitle(name);
        infos.push({
          name,
          title: parsed.title,
          badge: parsed.badge,
          modifiedAt: s.mtime.toISOString(),
          sizeBytes: s.size,
          daysRemaining,
        });
      }
    } catch {
      // Abaikan bila file error saat dibaca
    }
  }

  return infos.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt)); // terbaru dulu berdasarkan waktu
}

/**
 * Memulihkan data dari file backup.
 * Memverifikasi ketat batas retensi 30 hari: jika file sudah melewati 30 hari,
 * pemulihan ditolak dan file otomatis dihapus.
 */
export async function restoreBackup(name: string): Promise<void> {
  // Tolak path traversal: hanya nama file backup yang valid.
  if (!/^pricelist-[\w.-]+\.json$/.test(name)) fail("Nama backup tidak valid.");

  const source = join(BACKUP_DIR, name);

  let fileStat;
  try {
    fileStat = await stat(source);
  } catch {
    fail("File backup tidak ditemukan.");
  }

  const ageMs = Date.now() - fileStat.mtime.getTime();
  if (ageMs > BACKUP_RETENTION_MS) {
    // Hapus file kedaluwarsa agar tidak memakan ruang disk
    await unlink(source).catch(() => {});
    fail("File backup ini sudah kedaluwarsa (> 30 hari) dan tidak dapat dipulihkan.");
  }

  const parsed = JSON.parse(await readFile(source, "utf8"));
  await writePricelist(parsed); // validasi + tulis + revalidate

  // Setelah dipulihkan, hapus file snapshot ini agar tidak tertinggal di riwayat
  await unlink(source).catch(() => {});
}

/**
 * Menghapus file backup secara permanen dari disk server.
 */
export async function deleteBackup(name: string): Promise<void> {
  // Tolak path traversal: hanya nama file backup yang valid.
  if (!/^pricelist-[\w.-]+\.json$/.test(name)) fail("Nama backup tidak valid.");

  const target = join(BACKUP_DIR, name);
  try {
    await unlink(target);
  } catch {
    fail("File backup tidak ditemukan atau sudah dihapus.");
  }
}

/**
 * Mengosongkan seluruh file backup secara permanen dari server.
 */
export async function clearAllBackups(): Promise<number> {
  await mkdir(BACKUP_DIR, { recursive: true });
  const files = (await readdir(BACKUP_DIR)).filter((f) => /^pricelist-.*\.json$/.test(f));
  let count = 0;
  for (const filename of files) {
    try {
      await unlink(join(BACKUP_DIR, filename));
      count++;
    } catch {
      // Abaikan jika sudah terhapus
    }
  }
  return count;
}
