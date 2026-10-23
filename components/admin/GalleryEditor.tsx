"use client";
import AdminSymbol from "./AdminSymbol";


import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
} from "@/components/admin/AdminIcons";
import { uploadGalleryAction, deleteGalleryAction } from "@/app/admin/actions";
import type { GalleryImage } from "@/lib/gallery-server";
import { ADMIN_IDENTITY } from "@/lib/admin/identity";
import ConfirmModal from "./ConfirmModal";
import { useAdminDialog } from "./useAdminDialog";

const GALLERY_CATEGORIES = [
  "Semua",
  "iPhone",
  "iPad",
  "MacBook",
  "Android",
  "Mesin / IC",
  "Layar & Kaca",
  "Baterai",
  "Lainnya",
];

/**
 * macOS Gallery Editor & Asset Manager (macOS 26 Tahoe Specification)
 * Referensi Resmi: Ref 06, Ref 29, Ref 30, Ref 49
 */
export default function GalleryEditor({ initialImages }: { initialImages: GalleryImage[] }) {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("iPhone");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // Auto-dismiss feedback sukses setelah 4 detik
  useEffect(() => {
    if (!feedback || feedback.kind !== "ok") return;
    const timer = setTimeout(() => {
      setFeedback(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Modal konfirmasi hapus
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lightbox preview modal di admin
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const { dialogRef: lightboxRef, initialFocusRef: lightboxCloseRef } = useAdminDialog<HTMLButtonElement>(lightboxIndex !== null, closeLightbox);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 8 * 1024 * 1024) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setFeedback(null);
    } else if (file) {
      setFeedback({ kind: "error", text: "Pilih gambar JPG, PNG, atau WebP berukuran maksimum 8 MB." });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 8 * 1024 * 1024) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setFeedback(null);
    } else if (file) {
      setFeedback({ kind: "error", text: "Pilih gambar JPG, PNG, atau WebP berukuran maksimum 8 MB." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !previewUrl) {
      setFeedback({ kind: "error", text: "Silakan pilih foto dokumentasi hasil perbaikan terlebih dahulu." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    if (selectedFile) formData.append("image", selectedFile);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("altText", title || `Dokumentasi servis ${category} ${ADMIN_IDENTITY.brandName}`);

    const res = await uploadGalleryAction(formData);
    setIsSubmitting(false);

    if (res.ok && res.galleryItem) {
      setImages((prev) => [res.galleryItem!, ...prev]);
      setTitle("");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFeedback({ kind: "ok", text: "Foto dokumentasi perbaikan berhasil dipublikasikan ke Galeri!" });
      router.refresh();
    } else {
      setFeedback({ kind: "error", text: res.error ?? "Gagal mengunggah foto galeri." });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteGalleryAction(String(deleteTarget.id));
    setIsDeleting(false);

    if (res.ok) {
      setImages((prev) => prev.filter((img) => String(img.id) !== String(deleteTarget.id)));
      setFeedback({ kind: "ok", text: "Foto galeri berhasil dihapus." });
      setDeleteTarget(null);
      router.refresh();
    } else {
      setFeedback({ kind: "error", text: res.error ?? "Gagal menghapus foto." });
    }
  };

  // Filter gambar galeri berdasarkan tab kategori
  const filteredImages = useMemo(() => {
    if (selectedCategory === "Semua") return images;
    return images.filter((img) => img.category?.toLowerCase() === selectedCategory.toLowerCase());
  }, [images, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Feedback Toast */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center justify-between gap-3 p-3.5 rounded-[10px] border text-xs font-medium animate-in fade-in duration-150 ${
            feedback.kind === "ok"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.kind === "ok" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="admin-button admin-button--plain p-1 rounded-full text-text-muted hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── macOS Form Box Upload Dokumentasi Galeri (Ref 29, 30) ── */}
      <div className="admin-group admin-media-form">
        <div className="mb-5 flex items-center gap-2">
<AdminSymbol name="camera" className="h-4 w-4 object-contain" />
          <h2 className="text-sm sm:text-base font-semibold text-foreground">
            Upload Foto Dokumentasi Hasil Perbaikan
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Dropzone Image Well (Ref 30) */}
            <div className="lg:col-span-5">
              <label className="block mb-2 text-[11px] font-medium text-text-muted">
                Berkas Foto Servis (Wajib)
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Pilih gambar untuk diunggah"
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); fileInputRef.current?.click(); } }}
                onClick={() => fileInputRef.current?.click()}
                className={`admin-image-well relative flex flex-col items-center justify-center p-5 min-h-[200px] rounded-[12px] border border-dashed text-center cursor-pointer transition-all duration-150 ${
                  previewUrl
                    ? "border-primary/60 bg-primary/5"
                    : "border-panel-border bg-panel-raised/40 hover:border-primary/40 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative w-full h-40 rounded-[8px] overflow-hidden border border-panel-border">
                    <Image
                      src={previewUrl}
                      alt="Preview Foto Galeri"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white">
                      Klik untuk ganti foto
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2.5 text-text-muted">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
<AdminSymbol name="upload" className="h-5 w-5 object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Klik atau Drag & Drop Foto Servis
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Format JPG, PNG, atau WebP resolusi tinggi
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Foto */}
            <div className="lg:col-span-7 space-y-3.5">
              <div>
                <label className="block mb-1 text-[11px] font-medium text-text-muted">
                  Judul / Deskripsi Singkat Pengerjaan (Opsional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mis. Rekondisi Kaca LCD iPhone 15 Pro Max Tanpa Notifikasi"
                  className="w-full h-8 rounded-[8px] border border-panel-border bg-background px-3 text-xs text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-[11px] font-medium text-text-muted">
                  Kategori Perangkat / Pengerjaan
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GALLERY_CATEGORIES.filter((c) => c !== "Semua").map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition-all select-none active:scale-[0.97] ${
                        category === cat
                          ? "bg-primary text-white  font-semibold"
                          : "border border-panel-border bg-panel-raised text-text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="admin-button admin-button--primary inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-primary hover:bg-[#0066D6] px-4 text-xs font-semibold text-white  transition-all active:scale-[0.97] disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? "Mengunggah Foto…" : "Publikasikan ke Galeri"}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ── Koleksi Galeri Aktif ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-panel-border pb-3">
          <div>
            <h3 className="text-[11px] font-medium text-text-muted">
              Dokumentasi Galeri di Website ({images.length} Foto)
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Menampilkan {filteredImages.length} foto untuk kategori &ldquo;{selectedCategory}&rdquo;
            </p>
          </div>
          <a
            href="/gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <span>Lihat Galeri Publik</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* macOS Segmented Filter Bar (Ref 49, 50) */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          <div className="inline-flex p-1 rounded-[9px] bg-black/5 dark:bg-white/10 border border-black/[0.05] dark:border-white/[0.08] gap-0.5">
            {GALLERY_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-all select-none shrink-0 active:scale-[0.98] ${
                    active
                      ? "bg-primary text-white  font-semibold"
                      : "text-text-muted hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <span>{cat}</span>
                  {cat === "Semua" && (
                    <span className="ml-1.5 opacity-70 font-mono text-[10px]">
                      {images.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {filteredImages.length === 0 ? (
          <div className="relative overflow-hidden flex flex-col items-center justify-center rounded-[14px] border border-panel-border bg-panel px-6 py-12 text-center ">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
<AdminSymbol name="camera" className="h-5 w-5 object-contain" />
            </span>
            <h4 className="text-sm font-semibold text-foreground">
              Tidak Ada Foto untuk Kategori Ini
            </h4>
            <p className="mt-1 max-w-[40ch] text-xs text-text-muted">
              Belum ada foto dokumentasi servis yang diunggah untuk kategori &ldquo;{selectedCategory}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-[10px] border border-panel-border bg-panel  transition-all duration-150 hover:border-black/20 dark:hover:border-white/20"
              >
                {/* Thumbnail */}
                <div className="relative aspect-square w-full overflow-hidden bg-neutral-900/10">
                  <Image
                    src={img.Image}
                    alt={img.altText || img.Title || "Foto Dokumentasi"}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-200 group-hover:scale-103"
                  />

                  {/* Kategori Badge */}
                  {img.category && (
                    <span className="absolute top-2 left-2 rounded-[5px] bg-black/60  px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white tracking-wide uppercase">
                      {img.category}
                    </span>
                  )}

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const idx = filteredImages.findIndex((i) => String(i.id) === String(img.id));
                        if (idx !== -1) setLightboxIndex(idx);
                      }}
                      title="Pratinjau foto besar"
                      className="admin-button admin-button--icon flex h-7 w-7 items-center justify-center rounded-full bg-white/30 text-white  transition-all hover:bg-white/50 active:scale-[0.97]"
                    >
<AdminSymbol name="eye" className="w-3.5 h-3.5 object-contain" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(img)}
                      title="Hapus foto galeri"
                      className="admin-button admin-button--icon flex h-7 w-7 items-center justify-center rounded-full bg-white/30 text-white  transition-all hover:bg-[#FF3B30] active:scale-[0.97]"
                    >
<AdminSymbol name="trash" className="w-3.5 h-3.5 object-contain" />
                    </button>
                  </div>
                </div>

                {/* Caption info */}
                {img.Title && (
                  <div className="p-2">
                    <p className="text-[11px] font-medium text-foreground truncate" title={img.Title}>
                      {img.Title}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Apple HIG Alert Modal (Ref 03, 18) ── */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Foto Galeri?"
        subtitle={deleteTarget?.Title || "Foto Dokumentasi Servis"}
        description={`Foto ini akan dihapus dari galeri dokumentasi website ${ADMIN_IDENTITY.brandName}.`}
        confirmText={isDeleting ? "Menghapus…" : "Hapus"}
        cancelText="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Lightbox Preview Modal ── */}
      {lightboxIndex !== null && filteredImages[lightboxIndex] && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85  animate-in fade-in select-none"
        >
          <div
            ref={lightboxRef}
            role="dialog"
            aria-modal="true"
            aria-label="Pratinjau foto galeri"
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center"
          >
            <button
              ref={lightboxCloseRef}
              type="button"
              onClick={closeLightbox}
              aria-label="Tutup pratinjau"
              className="admin-button admin-button--icon absolute -top-11 right-0 flex h-9 w-9 items-center justify-center text-white/80 hover:text-white rounded-full bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative w-full h-[65vh] rounded-[14px] overflow-hidden border border-white/20 shadow-2xl">
              <Image
                src={filteredImages[lightboxIndex].Image}
                alt={filteredImages[lightboxIndex].Title || "Foto Layar Penuh"}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            {filteredImages[lightboxIndex].Title && (
              <p className="mt-3 text-center text-xs text-white/90 font-medium">
                {filteredImages[lightboxIndex].Title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
