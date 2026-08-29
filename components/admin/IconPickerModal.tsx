"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, Check } from "lucide-react";
import ServiceIcon, { REPAIR_ICON_OPTIONS, type RepairIconMeta } from "@/components/pricelist/ServiceIcon";

interface IconPickerModalProps {
  isOpen: boolean;
  currentIcon: string;
  onSelect: (iconId: string) => void;
  onClose: () => void;
  serviceTitle?: string;
  categorySlug?: string;
}

export default function IconPickerModal({
  isOpen,
  currentIcon,
  onSelect,
  onClose,
  serviceTitle,
  categorySlug,
}: IconPickerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  const isAndroid = categorySlug === "android";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset search saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  // Tutup modal dengan tombol Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter daftar ikon berdasarkan pencarian dan kategori aktif (hanya tampilkan logo merk Android jika di tab Android)
  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REPAIR_ICON_OPTIONS.filter((icon) => {
      // Sembunyikan Logo Merk Android jika bukan di tab Android
      if (!isAndroid && icon.category === "Logo Merk Android") {
        return false;
      }
      if (!q) return true;
      const matchLabel = icon.label.toLowerCase().includes(q);
      const matchCategory = icon.category.toLowerCase().includes(q);
      const matchId = icon.id.toLowerCase().includes(q);
      const matchKeywords = icon.keywords.some((k) => k.includes(q));
      return matchLabel || matchCategory || matchId || matchKeywords;
    });
  }, [search, isAndroid]);

  // Kelompokkan ikon berdasarkan kategori
  const groupedCategories = useMemo(() => {
    const map = new Map<string, RepairIconMeta[]>();
    for (const icon of filteredIcons) {
      if (!map.has(icon.category)) map.set(icon.category, []);
      map.get(icon.category)!.push(icon);
    }
    return Array.from(map.entries());
  }, [filteredIcons]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-200 animate-in fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-[#161618] shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 sm:px-6 py-3.5 sm:py-4">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
              Pilih Ikon Layanan
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {serviceTitle ? `Untuk ${serviceTitle}` : "Pilih ikon perbaikan yang sesuai"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-full bg-white/[0.06] p-1.5 text-neutral-400 transition-colors hover:bg-white/[0.12] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Kolom Pencarian */}
        <div className="border-b border-white/[0.08] px-4 sm:px-6 py-3 bg-white/[0.02]">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isAndroid
                  ? "Cari merk / komponen, mis. Samsung, Xiaomi, LCD…"
                  : "Cari komponen, mis. LCD, Baterai, Port Cas…"
              }
              autoFocus
              className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] pl-9 pr-4 py-2 text-xs sm:text-sm text-white outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-neutral-500"
            />
          </div>
        </div>

        {/* Grid Daftar Ikon */}
        <div
          data-lenis-prevent="true"
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 sm:space-y-6 scrollbar-thin scrollbar-thumb-white/15 hover:scrollbar-thumb-white/25"
        >
          {groupedCategories.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-neutral-400">
                Tidak ada ikon yang sesuai dengan &ldquo;{search}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-3 text-xs font-medium text-primary hover:underline"
              >
                Tampilkan semua ikon
              </button>
            </div>
          ) : (
            groupedCategories.map(([categoryName, icons]) => (
              <div key={categoryName} className="space-y-2.5">
                <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
                  {categoryName}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
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
                        className={`group relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.98] ${
                          isSelected
                            ? "border-primary/50 bg-white/[0.08] text-white shadow-[0_0_15px_rgba(255,107,0,0.08)] ring-1 ring-primary/25"
                            : "border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:border-white/[0.22] hover:bg-white/[0.07] hover:text-white"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            isSelected
                              ? "bg-primary text-white shadow-sm"
                              : "bg-white/[0.06] text-neutral-300 group-hover:text-primary group-hover:bg-white/[0.12]"
                          }`}
                        >
                          <ServiceIcon name={icon.id} className="h-5 w-5" />
                        </span>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className={`text-xs truncate ${isSelected ? "text-white font-semibold" : "text-neutral-200 group-hover:text-white font-medium"}`}>
                            {icon.label}
                          </p>
                          <p className="font-mono text-[0.625rem] text-neutral-400 truncate">
                            {icon.id}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
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

        {/* Footer Modal */}
        <div className="border-t border-white/[0.08] px-6 py-3 bg-white/[0.02] flex items-center justify-between text-xs text-neutral-400">
          <span>Klik ikon untuk memilih</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/[0.12] bg-white/[0.05] px-3.5 py-1.5 font-medium text-neutral-200 transition-colors hover:border-primary/50 hover:bg-white/[0.10] hover:text-white"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
