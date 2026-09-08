"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, X, FileSpreadsheet, Layers, Wrench, CheckCircle2 } from "lucide-react";

export interface ExportCategoryOption {
  Name: string;
  Slug: string;
  services: { Slug: string; title: string }[];
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExportCategoryOption[];
}

export default function ExportModal({ isOpen, onClose, categories }: ExportModalProps) {
  const [mounted, setMounted] = useState(false);
  const [scope, setScope] = useState<"all" | "category" | "service">("all");
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [selectedSvc, setSelectedSvc] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Set default selected category saat categories tersedia
  useEffect(() => {
    if (categories.length > 0 && !selectedCat) {
      setSelectedCat(categories[0].Slug);
    }
  }, [categories, selectedCat]);

  // Update default selected service saat category berubah
  useEffect(() => {
    const cat = categories.find((c) => c.Slug === selectedCat);
    if (cat && cat.services.length > 0) {
      setSelectedSvc(cat.services[0].Slug);
    } else {
      setSelectedSvc("");
    }
  }, [selectedCat, categories]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const activeCat = categories.find((c) => c.Slug === selectedCat);
  const activeSvc = activeCat?.services.find((s) => s.Slug === selectedSvc);

  // Generate nama file preview
  const today = new Date().toISOString().slice(0, 10);
  let fileSuffix = "semua";
  if (scope === "category" && activeCat) {
    fileSuffix = activeCat.Slug;
  } else if (scope === "service" && activeCat && activeSvc) {
    fileSuffix = `${activeCat.Slug}-${activeSvc.Slug}`;
  }
  const previewFilename = `pricelist-${fileSuffix}-${today}.xlsx`;

  const handleDownload = () => {
    let url = "/api/admin/export";
    const params = new URLSearchParams();

    if (scope === "category" && selectedCat) {
      params.set("category", selectedCat);
    } else if (scope === "service" && selectedCat && selectedSvc) {
      params.set("category", selectedCat);
      params.set("service", selectedSvc);
    }

    const query = params.toString();
    if (query) {
      url += `?${query}`;
    }

    window.location.href = url;
    onClose();
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-200 animate-in fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.12] bg-[#161618] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
      >
        {/* Specular Top Hairline */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 rounded-full bg-white/[0.06] p-1.5 text-neutral-400 transition-colors hover:bg-white/[0.12] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-primary shrink-0 shadow-[0_0_15px_rgba(255,107,0,0.15)]">
            <Download className="h-6 w-6" />
          </div>
          <div className="pr-6">
            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
              Export Data ke Excel (.xlsx)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Pilih cakupan data harga yang ingin diunduh untuk diedit.
            </p>
          </div>
        </div>

        {/* Scope Selector Options */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-medium text-neutral-300 block mb-1.5">
            Cakupan Data yang Di-export:
          </label>

          {/* Option 1: Full / Semua Kategori */}
          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              scope === "all"
                ? "border-primary/50 bg-primary/[0.08] text-white ring-1 ring-primary/25"
                : "border-white/[0.08] bg-white/[0.02] text-neutral-300 hover:bg-white/[0.05]"
            }`}
          >
            <input
              type="radio"
              name="export-scope"
              checked={scope === "all"}
              onChange={() => setScope("all")}
              className="accent-primary h-4 w-4"
            />
            <FileSpreadsheet className={`h-4 w-4 shrink-0 ${scope === "all" ? "text-primary" : "text-neutral-400"}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-semibold">Semua Kategori & Layanan (Full)</div>
              <div className="text-[0.6875rem] text-neutral-400">
                Unduh seluruh data katalog harga ({categories.length} kategori).
              </div>
            </div>
          </label>

          {/* Option 2: Per Kategori */}
          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              scope === "category"
                ? "border-primary/50 bg-primary/[0.08] text-white ring-1 ring-primary/25"
                : "border-white/[0.08] bg-white/[0.02] text-neutral-300 hover:bg-white/[0.05]"
            }`}
          >
            <input
              type="radio"
              name="export-scope"
              checked={scope === "category"}
              onChange={() => setScope("category")}
              className="accent-primary h-4 w-4"
            />
            <Layers className={`h-4 w-4 shrink-0 ${scope === "category" ? "text-primary" : "text-neutral-400"}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-semibold">Hanya 1 Kategori Tertentu</div>
              <div className="text-[0.6875rem] text-neutral-400">
                Hanya mengunduh seluruh layanan dalam kategori yang dipilih (misal: iPhone).
              </div>
            </div>
          </label>

          {/* Option 3: Per Layanan Spesifik */}
          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              scope === "service"
                ? "border-primary/50 bg-primary/[0.08] text-white ring-1 ring-primary/25"
                : "border-white/[0.08] bg-white/[0.02] text-neutral-300 hover:bg-white/[0.05]"
            }`}
          >
            <input
              type="radio"
              name="export-scope"
              checked={scope === "service"}
              onChange={() => setScope("service")}
              className="accent-primary h-4 w-4"
            />
            <Wrench className={`h-4 w-4 shrink-0 ${scope === "service" ? "text-primary" : "text-neutral-400"}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-semibold">Layanan Perbaikan Spesifik</div>
              <div className="text-[0.6875rem] text-neutral-400">
                Hanya mengunduh 1 jenis layanan perbaikan (misal: iPhone · LCD / Display).
              </div>
            </div>
          </label>
        </div>

        {/* Dropdowns jika memilih Category atau Service */}
        {scope !== "all" && (
          <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-3 mb-5 animate-in fade-in">
            {/* Pilih Kategori */}
            <div>
              <label className="text-[0.6875rem] font-mono uppercase tracking-wider text-text-muted block mb-1.5">
                Pilih Kategori Perangkat:
              </label>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full rounded-lg border border-white/[0.12] bg-[#1a1a1c] px-3 py-2 text-xs sm:text-sm font-medium text-white outline-none focus:border-primary transition-colors cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.Slug} value={cat.Slug} className="bg-[#1a1a1c] text-white">
                    {cat.Name} ({cat.services.length} layanan)
                  </option>
                ))}
              </select>
            </div>

            {/* Pilih Layanan jika scope === 'service' */}
            {scope === "service" && (
              <div>
                <label className="text-[0.6875rem] font-mono uppercase tracking-wider text-text-muted block mb-1.5">
                  Pilih Jenis Layanan:
                </label>
                <select
                  value={selectedSvc}
                  onChange={(e) => setSelectedSvc(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.12] bg-[#1a1a1c] px-3 py-2 text-xs sm:text-sm font-medium text-white outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  {activeCat?.services.map((svc) => (
                    <option key={svc.Slug} value={svc.Slug} className="bg-[#1a1a1c] text-white">
                      {svc.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Preview Summary Box */}
        <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3.5 mb-6 text-xs leading-relaxed text-neutral-300">
          <div className="flex items-center gap-1.5 font-medium text-primary mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>Format Kompatibel Penuh dengan Re-Import</span>
          </div>
          <div className="font-mono text-[0.6875rem] text-neutral-400 break-all">
            File target: <span className="text-white font-medium">{previewFilename}</span>
          </div>
          <p className="text-[0.6875rem] text-neutral-400 mt-1">
            Saat di-import kembali, hanya data kategori/layanan ini yang diperbarui. Kategori lainnya dijamin tetap aman.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm font-semibold text-neutral-300 transition-colors hover:bg-white/[0.08] hover:text-white text-center"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_4px_16px_rgba(255,107,0,0.3)] transition-all hover:bg-primary-light hover:brightness-105 active:scale-95 text-center"
          >
            <Download className="h-4 w-4" />
            <span>Unduh Excel (.xlsx)</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
