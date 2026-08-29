"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  Tag,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { uploadGalleryAction, deleteGalleryAction } from "@/app/admin/actions";
import type { GalleryImage } from "@/lib/gallery-server";
import ConfirmModal from "./ConfirmModal";

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setFeedback(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setFeedback(null);
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
    formData.append("altText", title || `Dokumentasi servis ${category} FIXMI`);

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
    <div className="space-y-10">
      {/* Feedback Toast */}
      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 p-4 rounded-xl border animate-in fade-in duration-200 ${
            feedback.kind === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            {feedback.kind === "ok" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-md text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Form Upload Dokumentasi Galeri ── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-7 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_40px_rgba(0,0,0,0.4)]">
        <div className="mb-6 flex items-center gap-2.5">
          <Camera className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold text-white">
            Upload Foto Dokumentasi Hasil Perbaikan
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Dropzone Upload Foto */}
            <div className="lg:col-span-5">
              <label className="block mb-2 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
                Berkas Foto Servis (Wajib)
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-6 min-h-[220px] rounded-xl border border-dashed text-center cursor-pointer transition-all duration-200 ${
                  previewUrl
                    ? "border-primary/50 bg-white/[0.04]"
                    : "border-white/[0.14] bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative w-full h-44 rounded-lg overflow-hidden border border-white/[0.10]">
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
                  <div className="flex flex-col items-center gap-3 text-neutral-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-primary">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        Klik atau Drag & Drop Foto Servis
                      </p>
                      <p className="text-[0.6875rem] text-neutral-500 mt-1">
                        Format JPG, PNG, atau WebP resolusi tinggi
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Foto */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block mb-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
                  Judul / Deskripsi Singkat Pengerjaan (Opsional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mis. Rekondisi Kaca LCD iPhone 15 Pro Max Tanpa Notifikasi"
                  className="w-full rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
                  Kategori Perangkat / Pengerjaan
                </label>
                <div className="flex flex-wrap gap-2">
                  {GALLERY_CATEGORIES.filter((c) => c !== "Semua").map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        category === cat
                          ? "bg-primary text-white shadow-sm"
                          : "border border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-light hover:brightness-105 active:scale-95 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isSubmitting ? "Mengunggah Foto…" : "Publikasikan ke Galeri"}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ── Filter Kategori & Grid Galeri ── */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/[0.08] pb-3.5 sm:pb-4">
          {/* Tab Filter Kategori (Smooth swipe on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:flex-wrap max-w-full">
            {GALLERY_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              const count =
                cat === "Semua"
                  ? images.length
                  : images.filter((img) => img.category?.toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all shrink-0 active:scale-95 ${
                    active
                      ? "bg-white/[0.10] text-white border border-primary/50 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span>{cat}</span>
                  <span className="font-mono text-[0.625rem] text-neutral-500">({count})</span>
                </button>
              );
            })}
          </div>

          <a
            href="/gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline shrink-0"
          >
            <span>Lihat Galeri Publik</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {filteredImages.length === 0 ? (
          <div className="relative overflow-hidden flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-12 sm:py-14 text-center backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.35)]">
            {/* Soft ambient orange glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl"
            />

            <span className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.04] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Camera className="h-5 w-5 stroke-[2]" />
            </span>

            <h4 className="relative z-10 text-sm sm:text-base font-semibold text-white tracking-tight">
              Belum Ada Foto di Kategori &ldquo;{selectedCategory}&rdquo;
            </h4>

            <p className="relative z-10 mt-1.5 max-w-[44ch] text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Gunakan formulir upload di atas untuk mempublikasikan foto hasil pengerjaan nyata teknisi ke galeri website.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredImages.map((img, idx) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] transition-all duration-200 hover:border-white/[0.22] hover:bg-white/[0.05]"
              >
                {/* Photo aspect square */}
                <div className="relative aspect-square w-full overflow-hidden bg-neutral-900">
                  <Image
                    src={img.Image}
                    alt={img.altText || img.Title || "Foto Galeri"}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {img.category && (
                    <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 font-mono text-[0.5625rem] font-semibold uppercase tracking-wider text-neutral-300 backdrop-blur-md">
                      {img.category}
                    </div>
                  )}

                  {/* Hover Overlay Controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      title="Lihat foto resolusi penuh"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(img)}
                      title="Hapus foto galeri"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Caption info */}
                {img.Title && (
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-white truncate" title={img.Title}>
                      {img.Title}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Konfirmasi Hapus ── */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Foto Galeri?"
        subtitle={deleteTarget?.Title || "Foto Dokumentasi Servis"}
        description="Foto ini akan dihapus permanen dari galeri dokumentasi website FIXMI."
        confirmText={isDeleting ? "Menghapus…" : "Ya, Hapus Foto"}
        cancelText="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Lightbox Preview Modal ── */}
      {lightboxIndex !== null && filteredImages[lightboxIndex] && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center"
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-12 right-0 p-2 text-neutral-400 hover:text-white rounded-full bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative w-full h-[65vh] rounded-2xl overflow-hidden border border-white/[0.12]">
              <Image
                src={filteredImages[lightboxIndex].Image}
                alt={filteredImages[lightboxIndex].Title || "Foto Galeri"}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            {filteredImages[lightboxIndex].Title && (
              <p className="mt-4 text-sm font-medium text-white text-center">
                {filteredImages[lightboxIndex].Title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
