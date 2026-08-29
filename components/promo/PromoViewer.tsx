"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, Tag } from "lucide-react";
import type { PromoImageItem } from "@/lib/promo-server";

interface PromoViewerProps {
  promos: PromoImageItem[];
}

export default function PromoViewer({ promos }: PromoViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedPromo = selectedIndex !== null ? promos[selectedIndex] : null;

  const handleOpen = (index: number) => {
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setSelectedIndex(null);
  };

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : promos.length - 1));
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! < promos.length - 1 ? prev! + 1 : 0));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  // Clean executive empty state
  if (!promos || promos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 sm:py-28 px-4 text-center rounded-2xl border border-white/[0.06] bg-[#141414]/50 backdrop-blur-sm">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 mb-5">
          <Tag className="h-8 w-8 text-neutral-500 stroke-[1.5]" />
        </div>
        <h3
          className="text-lg sm:text-xl font-medium text-white mb-2"
          style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
        >
          Informasi Penawaran &amp; Promo
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary max-w-md leading-relaxed">
          Program penawaran khusus dan promo berkala akan ditampilkan di sini.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Promo Image Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {promos.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => handleOpen(index)}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-panel transition-all duration-300 hover:border-primary/50 hover:shadow-[0_16px_40px_rgba(255,107,0,0.16)] cursor-pointer"
          >
            {/* Promo Card Image */}
            <div className="relative w-full overflow-hidden bg-neutral-900/80">
              <img
                src={item.Image}
                alt={item.altText || item.Title || `Promo FIXMI ${index + 1}`}
                loading={index < 3 ? "eager" : "lazy"}
                className="w-full h-auto block object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />

              {/* Hover Overlay with Zoom indicator */}
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                <div className="rounded-full bg-primary/90 text-white p-3 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <ZoomIn className="h-5 w-5 stroke-[2.5]" />
                </div>
              </div>

              {/* Optional Top Badge Tag */}
              {item.badge && (
                <div className="absolute top-3.5 left-3.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 font-mono text-[0.6875rem] font-semibold tracking-wider text-primary backdrop-blur-md">
                  {item.badge}
                </div>
              )}
            </div>

            {/* Optional Card Bottom Info */}
            {(item.Title || item.validUntil) && (
              <div className="p-4 sm:p-5 border-t border-white/[0.06] flex items-center justify-between gap-3">
                {item.Title && (
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                    {item.Title}
                  </h4>
                )}
                {item.validUntil && (
                  <span className="font-mono text-xs text-neutral-400 shrink-0">
                    {item.validUntil}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Fullscreen Interactive Lightbox Modal ── */}
      {selectedPromo && selectedIndex !== null && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-2xl transition-all duration-300 animate-in fade-in"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup Preview"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 rounded-full bg-white/10 p-2.5 sm:p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Prev Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Promo Sebelumnya"
            className="absolute left-2 sm:left-6 z-50 rounded-full bg-white/10 p-2 sm:p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Promo Berikutnya"
            className="absolute right-2 sm:right-6 z-50 rounded-full bg-white/10 p-2 sm:p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>

          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center max-w-5xl max-h-[90vh] w-full select-none"
          >
            <div className="relative flex items-center justify-center max-h-[78vh] w-auto max-w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl">
              <img
                src={selectedPromo.Image}
                alt={selectedPromo.altText || selectedPromo.Title || "Banner Promo FIXMI"}
                className="max-h-[78vh] max-w-full object-contain block"
              />
            </div>

            {/* Bottom Caption */}
            <div className="mt-3.5 flex items-center justify-between w-full max-w-2xl px-3">
              <span className="text-xs sm:text-sm font-mono text-neutral-400">
                Promo {selectedIndex + 1} dari {promos.length}
              </span>
              {selectedPromo.Title && (
                <span className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wide truncate max-w-[65%] text-right">
                  {selectedPromo.Title}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
