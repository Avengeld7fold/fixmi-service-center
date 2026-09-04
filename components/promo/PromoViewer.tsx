"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, MessageCircle, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { whatsappUrl } from "@/lib/constants";
import type { PromoImageItem } from "@/lib/promo-server";

interface PromoViewerProps {
  promos: PromoImageItem[];
}

export default function PromoViewer({ promos }: PromoViewerProps) {
  const { dict, locale } = useI18n();
  const isEn = locale === "en";
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

  // Ultra-Clean Snug Banner (adopted from Pricelist empty card pattern)
  if (!promos || promos.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[16px] lg:rounded-[20px] border border-panel-border bg-panel p-5 sm:p-6 lg:py-7 lg:px-8 transition-colors duration-200">
        <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[0.6875rem] font-mono tracking-wider text-neutral-300 uppercase mb-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{isEn ? "Offers & Promo Information" : "Informasi Penawaran & Promo"}</span>
            </div>

            <h3
              className="font-bayon text-xl sm:text-2xl lg:text-[1.75rem] text-white uppercase tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-bayon), sans-serif" }}
            >
              {isEn ? (
                <>
                  Exclusive Offers{" "}
                  <span className="text-primary">Coming Soon</span>
                </>
              ) : (
                <>
                  Promo & Penawaran Khusus{" "}
                  <span className="text-primary">Segera Hadir</span>
                </>
              )}
            </h3>

            <p
              className="mt-2 text-xs sm:text-sm leading-relaxed text-text-secondary max-w-xl"
              style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
            >
              {dict.promo.emptyPromo}
            </p>
          </div>

          {/* Direct WhatsApp Action Button */}
          <a
            href={whatsappUrl(
              isEn
                ? "Halo FIXMI Service Center, saya ingin menanyakan penawaran menarik dan promo servis untuk gadget saya."
                : "Halo FIXMI Service Center, saya ingin menanyakan penawaran menarik dan promo servis untuk gadget saya."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2.5 rounded-xl bg-primary px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-white tracking-[-0.01em] transition-all duration-150 ease-out hover:bg-primary-light hover:brightness-105 active:scale-[0.98] shadow-[0_4px_16px_rgba(255,107,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <MessageCircle className="h-4 w-4 text-white stroke-[2]" aria-hidden="true" />
            <span>{isEn ? "Inquire on WhatsApp" : "Hubungi via WhatsApp"}</span>
            <ArrowRight
              className="h-3.5 w-3.5 text-white/80 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-white"
              strokeWidth={2}
              aria-hidden="true"
            />
          </a>
        </div>
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
            aria-label={dict.common.close}
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
            aria-label={isEn ? "Previous promo" : "Promo Sebelumnya"}
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
            aria-label={isEn ? "Next promo" : "Promo Berikutnya"}
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
                alt={selectedPromo.altText || selectedPromo.Title || (isEn ? "FIXMI Promo Banner" : "Banner Promo FIXMI")}
                className="max-h-[78vh] max-w-full object-contain block"
              />
            </div>

            {/* Bottom Caption */}
            <div className="mt-3.5 flex items-center justify-between w-full max-w-2xl px-3">
              <span className="text-xs sm:text-sm font-mono text-neutral-400">
                {isEn
                  ? `Promo ${selectedIndex + 1} of ${promos.length}`
                  : `Promo ${selectedIndex + 1} dari ${promos.length}`}
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
