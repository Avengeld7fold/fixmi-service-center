"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Download, FileSpreadsheet, ChevronDown } from "@/components/admin/AdminIcons";
import { useAdminDialog } from "./useAdminDialog";

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

/**
 * Apple HIG Save / Export Attached Sheet Dialog (macOS Tahoe Specification)
 * Referensi Resmi: Ref 05, Ref 11, Ref 26, Ref 53
 * https://developer.apple.com/design/human-interface-guidelines/sheets
 */
export default function ExportModal({ isOpen, onClose, categories }: ExportModalProps) {
  const [scope, setScope] = useState<"all" | "category" | "service">("all");
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [selectedSvc, setSelectedSvc] = useState<string>("");
  const { dialogRef, initialFocusRef, present } = useAdminDialog<HTMLSelectElement>(isOpen, onClose);

  if (!present || typeof document === "undefined") return null;

  const activeCat = categories.find((c) => c.Slug === selectedCat) || categories[0];
  const activeSvc = activeCat?.services.find((s) => s.Slug === selectedSvc) || activeCat?.services[0];

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

    if (scope === "category" && activeCat) {
      params.set("category", activeCat.Slug);
    } else if (scope === "service" && activeCat && activeSvc) {
      params.set("category", activeCat.Slug);
      params.set("service", activeSvc.Slug);
    }

    const query = params.toString();
    if (query) {
      url += `?${query}`;
    }

    // Native navigation preserves the spreadsheet download response.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = url;
    onClose();
  };

  return createPortal(
    <div
      onClick={onClose}
      className="admin-modal-backdrop" inert={!isOpen}
    >
      <div
        ref={dialogRef}
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-sheet-title"
        onClick={(e) => e.stopPropagation()}
        className="admin-sheet"
      >
        {/* Sheet Header (Ref 05, 26) */}
        <div className="flex items-center gap-3 pb-4 border-b border-black/8 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-primary/12 text-primary flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 id="export-sheet-title" className="text-[15px] font-bold text-neutral-900 dark:text-white leading-tight">
              Ekspor Dokumen Excel
            </h3>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Simpan katalog harga ke format spreadsheet (.xlsx).
            </p>
          </div>
        </div>

        {/* Sheet Form Rows (Ref 05, 29) */}
        <div className="admin-sheet-form py-4 space-y-3.5 text-[13px]">
          {/* File Name Preview (Save As Field) */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Nama berkas
            </label>
            <div className="h-8 px-3 rounded-[6px] border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-mono text-[12px] flex items-center shadow-inner">
              {previewFilename}
            </div>
          </div>

          {/* Scope Selector (Pop-Up Button Style) */}
          <div>
            <label htmlFor="export-scope" className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Cakupan data
            </label>
            <div className="relative">
              <select
                ref={initialFocusRef} id="export-scope"
                value={scope}
                onChange={(e) => setScope(e.target.value as "all" | "category" | "service")}
                className="w-full h-8 pl-3 pr-8 rounded-[6px] border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[13px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="all">Semua Kategori & Layanan (Penuh)</option>
                <option value="category">Satu Kategori Perangkat</option>
                <option value="service">Satu Layanan Spesifik</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Conditional Category Filter */}
          {scope !== "all" && (
            <div>
              <label htmlFor="export-category" className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                Kategori Perangkat
              </label>
              <div className="relative">
                <select
                  id="export-category" value={activeCat?.Slug || ""}
                  onChange={(e) => { setSelectedCat(e.target.value); setSelectedSvc(""); }}
                  className="w-full h-8 pl-3 pr-8 rounded-[6px] border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[13px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.Slug} value={c.Slug}>
                      {c.Name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}

          {/* Conditional Service Filter */}
          {scope === "service" && activeCat && (
            <div>
              <label htmlFor="export-service" className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                Pilih Layanan
              </label>
              <div className="relative">
                <select
                  id="export-service" value={activeSvc?.Slug || ""}
                  onChange={(e) => setSelectedSvc(e.target.value)}
                  className="w-full h-8 pl-3 pr-8 rounded-[6px] border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[13px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  {activeCat.services.map((s) => (
                    <option key={s.Slug} value={s.Slug}>
                      {s.title}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sheet Action Footer (Ref 05, 26) */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/8 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="admin-button h-8 px-4 rounded-[6px] text-[13px] font-medium bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:bg-black/10 dark:hover:bg-white/15 transition-all active:scale-[0.97]"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="admin-button admin-button--primary h-8 px-4 rounded-[6px] text-[13px] font-semibold bg-primary hover:bg-[#0066D6] text-white shadow-sm inline-flex items-center gap-1.5 transition-all active:scale-[0.97]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Sekarang</span>
          </button>
        </div>
      </div>
    </div>,
    document.querySelector(".admin-shell") || document.body
  );
}
