"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkLoginAttempt,
  clearLoginAttempts,
  recordLoginFailure,
} from "@/lib/admin/rate-limit";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_S,
  createSessionToken,
  verifyPassword,
  verifySessionToken,
} from "@/lib/admin/auth";
import { promises as fs } from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { clearAllBackups, createManualBackup, deleteBackup, listBackups, restoreBackup, writePricelist } from "@/lib/admin/pricelist-write";
import { parseImportFile, type ImportPreview } from "@/lib/admin/import-parse";
import { getPricelist } from "@/lib/pricelist-server";
import { addPromoItem, deletePromoItem, type PromoImageItem } from "@/lib/promo-server";
import { addGalleryImage, deleteGalleryImage, type GalleryImage } from "@/lib/gallery-server";

// ============================================================
// Auth
// ============================================================

export interface LoginState {
  error: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!process.env.ADMIN_PASSWORD) {
    return { error: "ADMIN_PASSWORD belum diset di environment server." };
  }

  // Kunci pembatas = IP klien (header proxy cPanel/CDN), fallback "unknown".
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";

  const gate = checkLoginAttempt(ip);
  if (!gate.allowed) {
    const menit = Math.ceil(gate.retryAfterSeconds / 60);
    return {
      error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${menit} menit.`,
    };
  }

  if (!(await verifyPassword(password))) {
    await new Promise((r) => setTimeout(r, 500)); // perlambat percobaan otomatis
    const after = recordLoginFailure(ip);
    if (!after.allowed) {
      const menit = Math.ceil(after.retryAfterSeconds / 60);
      return { error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${menit} menit.` };
    }
    return {
      error:
        after.remaining <= 2
          ? `Password salah. Sisa ${after.remaining} percobaan sebelum terkunci sementara.`
          : "Password salah.",
    };
  }

  clearLoginAttempts(ip);

  const token = await createSessionToken();
  if (!token) return { error: "Konfigurasi sesi tidak lengkap." };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
  redirect("/admin/pricelist");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/** Guard berlapis untuk semua action mutasi (middleware sudah menjaga route-nya). */
async function requireSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

// ============================================================
// Simpan editor inline
// ============================================================

export interface ActionResult {
  ok: boolean;
  error?: string;
  message?: string;
}

export async function savePricelistAction(payloadJson: string): Promise<ActionResult> {
  if (!(await requireSession())) return { ok: false, error: "Sesi berakhir — silakan login ulang." };
  try {
    await writePricelist(JSON.parse(payloadJson));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan." };
  }
}

// ============================================================
// Import (preview → apply)
// ============================================================

export interface ImportPreviewState {
  preview: ImportPreview | null;
  /** JSON Category[] hasil merge — dipegang client, dikirim balik saat apply. */
  payload: string | null;
  error: string;
}

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export async function importPreviewAction(formData: FormData): Promise<ImportPreviewState> {
  if (!(await requireSession()))
    return { preview: null, payload: null, error: "Sesi berakhir — silakan login ulang." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { preview: null, payload: null, error: "Pilih file .xlsx atau .csv terlebih dahulu." };
  if (!/\.(xlsx|csv)$/i.test(file.name))
    return { preview: null, payload: null, error: "Format file harus .xlsx atau .csv." };
  if (file.size > MAX_UPLOAD_BYTES)
    return { preview: null, payload: null, error: "Ukuran file maksimum 2MB." };

  // Mode target destinasi (opsional): kategori + jenis service tujuan dari dropdown.
  const targetCategory = String(formData.get("targetCategory") ?? "");
  const targetService = String(formData.get("targetService") ?? "");
  if (targetCategory && !targetService)
    return { preview: null, payload: null, error: "Pilih jenis service tujuan import." };

  try {
    const existing = await getPricelist();
    const buffer = Buffer.from(await file.arrayBuffer());
    const target = targetCategory
      ? { categorySlug: targetCategory, serviceSlug: targetService }
      : undefined;
    const { merged, preview } = await parseImportFile(buffer, file.name, existing, target);
    return {
      preview,
      payload: merged ? JSON.stringify(merged) : null,
      error: "",
    };
  } catch (e) {
    return {
      preview: null,
      payload: null,
      error: e instanceof Error ? e.message : "Gagal membaca file.",
    };
  }
}

export async function importApplyAction(payloadJson: string): Promise<ActionResult> {
  if (!(await requireSession())) return { ok: false, error: "Sesi berakhir — silakan login ulang." };
  try {
    await writePricelist(JSON.parse(payloadJson));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menerapkan import." };
  }
}

// ============================================================
// Backup
// ============================================================

export async function restoreBackupAction(name: string): Promise<ActionResult> {
  if (!(await requireSession())) return { ok: false, error: "Sesi berakhir — silakan login ulang." };
  try {
    await restoreBackup(name);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal memulihkan backup." };
  }
}

export async function deleteBackupAction(name: string): Promise<ActionResult> {
  if (!(await requireSession())) return { ok: false, error: "Sesi berakhir — silakan login ulang." };
  try {
    await deleteBackup(name);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menghapus backup." };
  }
}

export async function clearAllBackupsAction(): Promise<ActionResult> {
  if (!(await requireSession())) return { ok: false, error: "Sesi berakhir — silakan login ulang." };
  try {
    const count = await clearAllBackups();
    return { ok: true, message: `${count} file backup berhasil dikosongkan.` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal mengosongkan file backup." };
  }
}

export async function createManualBackupAction(): Promise<ActionResult> {
  if (!(await requireSession())) return { ok: false, error: "Sesi berakhir — silakan login ulang." };
  try {
    const filename = await createManualBackup();
    return { ok: true, message: `Cadangan manual "${filename}" berhasil dibuat.` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal membuat cadangan manual." };
  }
}

export async function refreshBackupsAction() {
  if (!(await requireSession())) return [];
  return listBackups();
}

// ============================================================
// Promo Management
// ============================================================

export async function uploadPromoAction(formData: FormData): Promise<ActionResult & { promo?: PromoImageItem }> {
  if (!(await requireSession())) return { ok: false, error: "Sesi berakhir — silakan login ulang." };
  try {
    const title = String(formData.get("title") ?? "").trim();
    const badge = String(formData.get("badge") ?? "").trim();
    const validUntil = String(formData.get("validUntil") ?? "").trim();
    const link = String(formData.get("link") ?? "").trim();
    const file = formData.get("image") as File | null;
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();

    let finalImagePath = imageUrl;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(file.name) || ".jpg";
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
      const filename = `promo-${Date.now()}-${sanitizedName}`;
      const uploadDir = path.join(process.cwd(), "public", "images", "promo");
      await fs.mkdir(uploadDir, { recursive: true });
      const targetPath = path.join(uploadDir, filename);
      await fs.writeFile(targetPath, buffer);
      finalImagePath = `/images/promo/${filename}`;
    }

    if (!finalImagePath) {
      return { ok: false, error: "Pilih file gambar banner promo atau masukkan URL gambar." };
    }

    const created = await addPromoItem({
      Title: title || undefined,
      Image: finalImagePath,
      altText: title || "Banner Promo FIXMI Bali",
      badge: badge || undefined,
      validUntil: validUntil || undefined,
      link: link || undefined,
    });

    revalidatePath("/promo");
    revalidatePath("/admin/promo");
    return { ok: true, message: "Banner promo berhasil ditambahkan.", promo: created };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menambahkan promo." };
  }
}

export async function deletePromoAction(id: string): Promise<ActionResult> {
  if (!(await requireSession())) return { ok: false, error: "Sesi berakhir — silakan login ulang." };
  try {
    const ok = await deletePromoItem(id);
    if (!ok) return { ok: false, error: "Promo tidak ditemukan." };
    revalidatePath("/promo");
    revalidatePath("/admin/promo");
    return { ok: true, message: "Promo berhasil dihapus." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menghapus promo." };
  }
}

// ============================================================
// Gallery Repair Management
// ============================================================

export async function uploadGalleryAction(formData: FormData): Promise<ActionResult & { galleryItem?: GalleryImage }> {
  if (!(await requireSession())) return { ok: false, error: "Sesi berakhir — silakan login ulang." };
  try {
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim() || "iPhone";
    const altText = String(formData.get("altText") ?? "").trim();
    const file = formData.get("image") as File | null;
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();

    let finalImagePath = imageUrl;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
      const filename = `gallery-${Date.now()}-${sanitizedName}`;
      const uploadDir = path.join(process.cwd(), "public", "images", "gallery");
      await fs.mkdir(uploadDir, { recursive: true });
      const targetPath = path.join(uploadDir, filename);
      await fs.writeFile(targetPath, buffer);
      finalImagePath = `/images/gallery/${filename}`;
    }

    if (!finalImagePath) {
      return { ok: false, error: "Pilih file foto dokumentasi atau masukkan URL foto." };
    }

    const created = await addGalleryImage({
      Title: title || undefined,
      Image: finalImagePath,
      altText: altText || title || `Dokumentasi servis ${category} FIXMI Bali`,
      category,
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { ok: true, message: "Foto dokumentasi servis berhasil ditambahkan ke galeri.", galleryItem: created };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal mengunggah foto galeri." };
  }
}

export async function deleteGalleryAction(id: string): Promise<ActionResult> {
  if (!(await requireSession())) return { ok: false, error: "Sesi berakhir — silakan login ulang." };
  try {
    const ok = await deleteGalleryImage(id);
    if (!ok) return { ok: false, error: "Foto galeri tidak ditemukan." };
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { ok: true, message: "Foto galeri berhasil dihapus." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menghapus foto galeri." };
  }
}

