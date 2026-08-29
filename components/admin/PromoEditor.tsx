"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Calendar,
  Tag,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { uploadPromoAction, deletePromoAction } from "@/app/admin/actions";
import type { PromoImageItem } from "@/lib/promo-server";
import { whatsappUrl } from "@/lib/constants";
import ConfirmModal from "./ConfirmModal";

export default function PromoEditor({ initialPromos }: { initialPromos: PromoImageItem[] }) {
  const router = useRouter();
  const [promos, setPromos] = useState<PromoImageItem[]>(initialPromos);
  const [title, setTitle] = useState("");
  const [badge, setBadge] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [waNote, setWaNote] = useState("");
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
  const [deleteTarget, setDeleteTarget] = useState<PromoImageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setFeedback({ kind: "error", text: "Silakan pilih berkas gambar banner promo terlebih dahulu." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    if (selectedFile) formData.append("image", selectedFile);
    formData.append("title", title);
    formData.append("badge", badge);
    formData.append("validUntil", validUntil);
    if (waNote) {
      const generatedLink = whatsappUrl(
        `Halo FIXMI Service Center, saya tertarik dengan promo: "${title || "Promo Spesial"}".\n\n${waNote}`
      );
      formData.append("link", generatedLink);
    }

    const res = await uploadPromoAction(formData);
    setIsSubmitting(false);

    if (res.ok && res.promo) {
      setPromos((prev) => [res.promo!, ...prev]);
      setTitle("");
      setBadge("");
      setValidUntil("");
      setWaNote("");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFeedback({ kind: "ok", text: "Banner promo berhasil dipublikasikan ke halaman website!" });
      router.refresh();
    } else {
      setFeedback({ kind: "error", text: res.error ?? "Gagal mengunggah promo." });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deletePromoAction(String(deleteTarget.id));
    setIsDeleting(false);

    if (res.ok) {
      setPromos((prev) => prev.filter((p) => String(p.id) !== String(deleteTarget.id)));
      setFeedback({ kind: "ok", text: "Banner promo berhasil dihapus." });
      setDeleteTarget(null);
      router.refresh();
    } else {
      setFeedback({ kind: "error", text: res.error ?? "Gagal menghapus promo." });
    }
  };

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

      {/* ── Form Upload Banner Promo Baru ── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-7 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_40px_rgba(0,0,0,0.4)]">
        <div className="mb-6 flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold text-white">
            Upload Banner & Penawaran Promo Baru
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Dropzone Upload Gambar */}
            <div className="lg:col-span-5">
              <label className="block mb-2 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
                Gambar Banner Promo (Wajib)
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
                  <div className="flex flex-col items-center gap-3 text-neutral-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-primary">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        Klik atau Drag & Drop Gambar Banner
                      </p>
                      <p className="text-[0.6875rem] text-neutral-500 mt-1">
                        Format JPG, PNG, atau WebP (Disarankan rasio landscape 16:9 atau poster 4:5)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Promo */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block mb-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
                  Judul Promo (Opsional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mis. Promo Merdeka Ganti LCD iPhone Diskon 20%"
                  className="w-full rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
                    Badge Label (Opsional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Mis. DISKON 20%, SPESIAL, FREE"
                    className="w-full rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
                    Masa Berlaku (Opsional)
                  </label>
                  <input
                    type="text"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    placeholder="Mis. Hingga 30 September 2026"
                    className="w-full rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
                  Keterangan WhatsApp Otomatis (Opsional)
                </label>
                <input
                  type="text"
                  value={waNote}
                  onChange={(e) => setWaNote(e.target.value)}
                  placeholder="Mis. Mohon info syarat dan ketentuan promo diskon perbaikan LCD."
                  className="w-full rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-light hover:brightness-105 active:scale-95 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isSubmitting ? "Mengunggah Promo…" : "Publikasikan Promo"}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ── Daftar Promo Aktif ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Daftar Promo Aktif di Website ({promos.length})
          </h3>
          <a
            href="/promo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <span>Lihat Halaman Promo Publik</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {promos.length === 0 ? (
          <div className="relative overflow-hidden flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-12 sm:py-14 text-center backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.35)]">
            {/* Soft ambient orange glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl"
            />

            <span className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.04] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Sparkles className="h-5 w-5 stroke-[2]" />
            </span>

            <h4 className="relative z-10 text-sm sm:text-base font-semibold text-white tracking-tight">
              Belum Ada Banner Promo Aktif
            </h4>

            <p className="relative z-10 mt-1.5 max-w-[44ch] text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Gunakan formulir upload di atas untuk mempublikasikan banner promosi dan penawaran diskon spesial ke halaman website.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm transition-all duration-200 hover:border-white/[0.2] hover:bg-white/[0.04]"
              >
                {/* Banner Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                  <Image
                    src={promo.Image}
                    alt={promo.altText || promo.Title || "Banner Promo"}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {promo.badge && (
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[0.625rem] font-bold tracking-wider text-white shadow-md uppercase">
                      <Tag className="h-3 w-3" />
                      <span>{promo.badge}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(promo)}
                    title="Hapus promo ini"
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-md transition-colors hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-white line-clamp-1">
                    {promo.Title || "Banner Promo Spesial"}
                  </h4>
                  {promo.validUntil && (
                    <p className="flex items-center gap-1.5 font-mono text-[0.6875rem] text-neutral-400">
                      <Calendar className="h-3 w-3 text-primary" />
                      <span>{promo.validUntil}</span>
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-white/[0.06]">
                    <span className="font-mono text-[0.625rem] text-neutral-500">
                      {promo.createdAt ? new Date(promo.createdAt).toLocaleDateString("id-ID") : "Aktif"}
                    </span>
                    {promo.link && (
                      <a
                        href={promo.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-emerald-400 hover:underline"
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

      {/* ── Modal Konfirmasi Hapus ── */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Banner Promo?"
        subtitle={deleteTarget?.Title || "Banner Promo"}
        description="Banner promo ini akan segera dihapus dari halaman publik website FIXMI."
        confirmText={isDeleting ? "Menghapus…" : "Ya, Hapus Promo"}
        cancelText="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
