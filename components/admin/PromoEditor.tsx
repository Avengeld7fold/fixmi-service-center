"use client";
import AdminSymbol from "./AdminSymbol";


import { useState, useRef } from "react";
import Image from "next/image";
import {
  Tag,
  Calendar,
  Sparkles,
  ExternalLink,
  MessageCircle,
  X,
  AlertCircle,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { uploadPromoAction, deletePromoAction } from "@/app/admin/actions";
import { ADMIN_IDENTITY } from "@/lib/admin/identity";
import ConfirmModal from "./ConfirmModal";

export interface PromoItem {
  id: string | number;
  Image: string;
  Title?: string;
  badge?: string;
  validUntil?: string;
  link?: string;
  altText?: string;
  createdAt?: string;
}

interface PromoEditorProps {
  initialPromos: PromoItem[];
}

/**
 * macOS Promo Editor & Banner Manager (macOS 26 Tahoe Specification)
 * Referensi Resmi: Ref 06, Ref 29, Ref 30
 */
export default function PromoEditor({ initialPromos }: PromoEditorProps) {
  const [promos, setPromos] = useState<PromoItem[]>(initialPromos);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PromoItem | null>(null);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [badge, setBadge] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [waNote, setWaNote] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFeedback({ kind: "err", text: "Format file harus berupa gambar (JPG, PNG, WebP)." });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFeedback(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFeedback(null);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle("");
    setBadge("");
    setValidUntil("");
    setWaNote("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setFeedback({ kind: "err", text: "Silakan pilih berkas gambar banner terlebih dahulu." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (title.trim()) formData.append("title", title.trim());
      if (badge.trim()) formData.append("badge", badge.trim());
      if (validUntil.trim()) formData.append("validUntil", validUntil.trim());
      if (waNote.trim()) formData.append("waNote", waNote.trim());

      const res = await uploadPromoAction(formData);
      if (res.ok && res.promo) {
        setPromos((prev) => [res.promo!, ...prev]);
        resetForm();
        setFeedback({ kind: "ok", text: res.message || "Banner promo berhasil dipublikasikan!" });
      } else {
        setFeedback({ kind: "err", text: res.error || "Gagal mengunggah banner promo." });
      }
    } catch {
      setFeedback({ kind: "err", text: "Terjadi kesalahan saat memproses unggahan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deletePromoAction(String(deleteTarget.id));
      if (res.ok) {
        setPromos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
        setFeedback({ kind: "ok", text: "Banner promo berhasil dihapus dari sistem." });
      } else {
        setFeedback({ kind: "err", text: res.error || "Gagal menghapus promo." });
      }
    } catch {
      setFeedback({ kind: "err", text: "Terjadi kendala saat menghapus promo." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Status Feedback Alert ── */}
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
            className="p-1 rounded-full text-text-muted hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── macOS Form Box Upload Banner Promo (Ref 29, 30) ── */}
      <div className="admin-group admin-media-form">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm sm:text-base font-semibold text-foreground">
            Upload Banner & Penawaran Promo Baru
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Dropzone Image Well (Ref 30) */}
            <div className="lg:col-span-5">
              <label className="block mb-2 text-[11px] font-medium text-text-muted">
                Gambar Banner Promo (Wajib)
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
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative w-full h-40 rounded-[8px] overflow-hidden border border-panel-border">
                    <Image
                      src={previewUrl}
                      alt="Preview Banner Promo"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white">
                      Klik untuk ganti gambar
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2.5 text-text-muted">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
<AdminSymbol name="upload" className="h-5 w-5 object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Klik atau Drag & Drop Gambar Banner
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Format JPG, PNG, atau WebP (Landscape 16:9 atau poster 4:5)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Promo */}
            <div className="lg:col-span-7 space-y-3.5">
              <div>
                <label className="block mb-1 text-[11px] font-medium text-text-muted">
                  Judul Promo (Opsional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mis. Promo Merdeka Ganti LCD iPhone Diskon 20%"
                  className="w-full h-8 rounded-[8px] border border-panel-border bg-background px-3 text-xs text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[11px] font-medium text-text-muted">
                    Badge Label (Opsional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Mis. DISKON 20%, SPESIAL, FREE"
                    className="w-full h-8 rounded-[8px] border border-panel-border bg-background px-3 text-xs text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[11px] font-medium text-text-muted">
                    Masa Berlaku (Opsional)
                  </label>
                  <input
                    type="text"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    placeholder="Mis. Hingga 30 September 2026"
                    className="w-full h-8 rounded-[8px] border border-panel-border bg-background px-3 text-xs text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[11px] font-medium text-text-muted">
                  Keterangan WhatsApp Otomatis (Opsional)
                </label>
                <input
                  type="text"
                  value={waNote}
                  onChange={(e) => setWaNote(e.target.value)}
                  placeholder="Mis. Mohon info syarat dan ketentuan promo diskon perbaikan LCD."
                  className="w-full h-8 rounded-[8px] border border-panel-border bg-background px-3 text-xs text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-primary hover:bg-[#0066D6] px-4 text-xs font-semibold text-white  transition-all active:scale-[0.97] disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? "Mengunggah Promo…" : "Publikasikan Promo"}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ── Daftar Promo Aktif ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-panel-border pb-2.5">
          <h3 className="text-[11px] font-medium text-text-muted">
            Daftar Promo Aktif di Website ({promos.length})
          </h3>
          <a
            href="/promo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <span>Lihat Halaman Promo Publik</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {promos.length === 0 ? (
          <div className="relative overflow-hidden flex flex-col items-center justify-center rounded-[14px] border border-panel-border bg-panel px-6 py-10 text-center ">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <h4 className="text-sm font-semibold text-foreground">
              Belum Ada Banner Promo Aktif
            </h4>
            <p className="mt-1 max-w-[44ch] text-xs text-text-muted leading-relaxed">
              Gunakan formulir upload di atas untuk mempublikasikan banner promosi dan penawaran diskon spesial.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="group relative overflow-hidden rounded-[12px] border border-panel-border bg-panel  transition-all duration-150 hover:border-black/20 dark:hover:border-white/20"
              >
                {/* Banner Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900/10">
                  <Image
                    src={promo.Image}
                    alt={promo.altText || promo.Title || "Banner Promo"}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-102"
                  />
                  {promo.badge && (
                    <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-[6px] bg-primary px-2 py-0.5 text-[10px] font-semibold text-white  uppercase tracking-wider">
                      <Tag className="h-2.5 w-2.5" />
                      <span>{promo.badge}</span>
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <a
                      href={promo.Image}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Lihat ukuran penuh"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white  transition-all hover:bg-black/80 active:scale-[0.97]"
                    >
<AdminSymbol name="eye" className="h-3.5 w-3.5 object-contain" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(promo)}
                      title="Hapus promo ini"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white  transition-all hover:bg-[#FF3B30] active:scale-[0.97]"
                    >
<AdminSymbol name="trash" className="h-3.5 w-3.5 object-contain" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 space-y-1.5">
                  <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                    {promo.Title || "Banner Promo Spesial"}
                  </h4>
                  {promo.validUntil && (
                    <p className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted">
                      <Calendar className="h-3 w-3 text-primary" />
                      <span>{promo.validUntil}</span>
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-between text-[11px] border-t border-panel-border/60">
                    <span className="font-mono text-[10px] text-text-muted">
                      {promo.createdAt ? new Date(promo.createdAt).toLocaleDateString("id-ID") : "Aktif"}
                    </span>
                    {promo.link && (
                      <a
                        href={promo.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>Link WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Apple HIG Alert Modal (Ref 03, 18) ── */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Banner Promo?"
        subtitle={deleteTarget?.Title || "Banner Promo"}
        description={`Banner promo ini akan dihapus dari halaman publik website ${ADMIN_IDENTITY.brandName}.`}
        confirmText={isDeleting ? "Menghapus…" : "Hapus"}
        cancelText="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
