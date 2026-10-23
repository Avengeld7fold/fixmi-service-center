"use client";
import AdminSymbol from "./AdminSymbol";


import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "@/components/admin/AdminIcons";
import { useAdminDialog } from "./useAdminDialog";
import ServiceIcon, { REPAIR_ICON_OPTIONS, type RepairIconMeta } from "@/components/pricelist/ServiceIcon";

export interface IconPickerModalProps {
  isOpen: boolean;
  currentIcon: string;
  onSelect: (iconId: string) => void;
  onClose?: () => void;
  serviceTitle?: string;
  categorySlug?: string;
  isAndroid?: boolean;
}

/**
 * Apple HIG Icon Picker Sheet Dialog (macOS Tahoe Specification)
 * Referensi: Ref 14 Utility Panel & Ref 53 Sheet Modal
 */
export default function IconPickerModal({
  isOpen,
  currentIcon,
  onSelect,
  onClose = () => {},
  serviceTitle,
  categorySlug,
  isAndroid: isAndroidProp,
}: IconPickerModalProps) {
  const [search, setSearch] = useState("");
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) { setWasOpen(isOpen); setSearch(""); }
  const { dialogRef, initialFocusRef, present } = useAdminDialog<HTMLInputElement>(isOpen, onClose);

  const isAndroid = isAndroidProp ?? (categorySlug === "android");


  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REPAIR_ICON_OPTIONS.filter((icon: RepairIconMeta) => {
      if (!isAndroid && icon.category === "Logo Merk Android") {
        return false;
      }
      if (!q) return true;
      const matchLabel = icon.label.toLowerCase().includes(q);
      const matchId = icon.id.toLowerCase().includes(q);
      const matchKeywords = icon.keywords.some((k: string) => k.includes(q));
      return matchLabel || matchId || matchKeywords;
    });
  }, [search, isAndroid]);

  const groupedCategories = useMemo(() => {
    const map = new Map<string, RepairIconMeta[]>();
    for (const icon of filteredIcons) {
      const cat = icon.category || "Lainnya";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(icon);
    }
    return Array.from(map.entries());
  }, [filteredIcons]);

  if (!present || typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={onClose}
      className="admin-modal-backdrop" inert={!isOpen}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="icon-picker-title"
        onClick={(e) => e.stopPropagation()}
        className="admin-sheet"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.08] dark:border-white/10">
          <div>
            <h3 id="icon-picker-title" className="text-[15px] font-bold text-neutral-900 dark:text-white leading-tight">
              Pilih Ikon Layanan
            </h3>
            {serviceTitle && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate max-w-sm">
                Untuk {serviceTitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose} aria-label="Tutup pemilih ikon"
            className="admin-button admin-button--icon w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Field (macOS Pill) */}
        <div className="pt-3 pb-2">
          <div className="relative flex items-center">
<AdminSymbol name="magnifying" className="absolute left-2.5 w-3.5 h-3.5 object-contain pointer-events-none" />
            <input
              ref={initialFocusRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari simbol (kamera, layar, baterai, chip)…"
              className="w-full h-8 pl-8 pr-7 rounded-full text-xs bg-black/5 dark:bg-white/10 text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none border border-transparent focus:border-primary focus:bg-white dark:focus:bg-neutral-900 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="admin-button absolute right-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List of Icons */}
        <div
          data-lenis-prevent
          role="region"
          aria-label="Daftar ikon layanan"
          tabIndex={0}
          className="flex-1 overflow-y-auto overscroll-contain py-2 pr-1 space-y-4 max-h-[50vh]"
        >
          {groupedCategories.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              Tidak ada simbol yang cocok dengan &ldquo;{search}&rdquo;.
            </div>
          ) : (
            groupedCategories.map(([categoryName, icons]) => (
              <div key={categoryName} className="space-y-1.5">
                <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 px-1 uppercase tracking-wider">
                  {categoryName}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {icons.map((icon) => {
                    const isSelected = currentIcon === icon.id;
                    return (
                      <button
                        key={icon.id}
                        type="button"
                        onClick={() => {
                          onSelect(icon.id);
                          onClose();
                        }}
                        className={`group relative flex flex-col items-center justify-center p-2.5 rounded-[10px] border transition-all active:scale-[0.95] ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white/60 dark:bg-neutral-800/60 border-black/8 dark:border-white/10 hover:bg-white dark:hover:bg-neutral-700 hover:border-black/20"
                        }`}
                        title={`${icon.label} (${icon.category})`}
                      >
                        <div className="w-6 h-6 flex items-center justify-center mb-1">
                          <ServiceIcon name={icon.id} className="w-5 h-5" />
                        </div>
                        <span
                          className={`text-[10px] text-center truncate max-w-full font-medium ${
                            isSelected ? "text-white" : "text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          {icon.label}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-white text-primary flex items-center justify-center shadow-sm">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-black/8 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-500">
          <span>{filteredIcons.length} glif tersedia</span>
          <button
            type="button"
            onClick={onClose}
            className="admin-button h-7 px-3 rounded-[6px] font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-700 dark:text-neutral-300 transition-all active:scale-[0.97]"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>,
    document.querySelector(".admin-shell") || document.body
  );
}
