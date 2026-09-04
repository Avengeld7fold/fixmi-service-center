"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, Tag, MessageCircle, ArrowRight } from "lucide-react";
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

  // Luxury Digital Service Pass (when no flyer banners are uploaded)
  if (!promos || promos.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl py-4 sm:py-8">
        {/* The Luxury Voucher Pass Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-b from-[#18181b] via-[#131316] to-[#0e0e10] p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
          {/* Subtle ambient orange backlight */}
          <div
            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />

          {/* Ticket Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-4 sm:pb-5 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="font-mono text-xs font-semibold tracking-wider text-white/70 uppercase">
                FIXMI DIGITAL PASS
              </span>
            </div>
            <span className="font-mono text-[0.6875rem] text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full font-medium">
              DIRECT PRIVILEGE
            </span>
          </div>

          {/* Voucher Main Content */}
          <div className="relative z-10 text-center sm:text-left mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4 sm:hidden">
              <Tag className="w-6 h-6 stroke-[1.5]" />
            </div>

            <h3
              className="font-bayon text-2xl sm:text-3xl text-white tracking-tight leading-tight uppercase mb-3 font-mono"
              style={{ fontFamily: "var(--font-bayon), sans-serif" }}
            >
              {isEn ? "EXCLUSIVE REPAIR PRIVILEGE" : "KONSULTASI & PENAWARAN SPESIAL"}
            </h3>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
              {isEn
                ? "Currently, no seasonal campaign banners are running. However, you are always entitled to our transparent pricing estimate, free front-desk diagnosis, and custom service bundle rates."
                : "Saat ini belum ada flyer promo berkala yang dirilis. Namun, Anda tetap berhak mendapatkan estimasi biaya transparan, diagnosa meja depan 100% gratis, dan penawaran paket servis langsung dari teknisi kami."}
            </p>

            {/* 3 Core Guarantees Chips */}
            <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-[0.6875rem] sm:text-xs font-mono text-neutral-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-primary font-bold">✓</span> {isEn ? "Free Diagnostic" : "Diagnosa Gratis"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-primary font-bold">✓</span> {isEn ? "Up to 90-Day Warranty" : "Garansi s/d 90 Hari"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-primary font-bold">✓</span> {isEn ? "Original Parts" : "Suku Cadang Berkualitas"}
              </span>
            </div>
          </div>

          {/* Ticket Perforation Line with Side Notches */}
          <div className="relative my-6 -mx-6 sm:-mx-8 md:-mx-10 flex items-center">
            {/* Left notch cutout */}
            <div className="w-5 h-7 rounded-r-full bg-[#121212] border-r border-t border-b border-white/[0.1] -ml-px" />
            {/* Dashed line */}
            <div className="flex-1 border-t border-dashed border-white/[0.15] mx-2" />
            {/* Right notch cutout */}
            <div className="w-5 h-7 rounded-l-full bg-[#121212] border-l border-t border-b border-white/[0.1] -mr-px" />
          </div>

          {/* Ticket Action Footer */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.6875rem] uppercase text-text-muted">KODE AKSES:</span>
              <span className="font-mono text-xs font-bold tracking-widest text-primary bg-black/40 border border-white/[0.08] px-2.5 py-1 rounded-md select-all">
                FIXMI-SPECIAL
              </span>
            </div>

            <a
              href={whatsappUrl(
                isEn
                  ? "Hello FIXMI Service Center, I would like to inquire about exclusive special offers and device repair promo."
                  : "Halo FIXMI Service Center, saya ingin menanyakan penawaran spesial dan promo servis untuk perangkat saya."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all duration-300 hover:bg-primary-hover hover:shadow-[0_8px_25px_rgba(255,107,0,0.35)] active:scale-95"
            >
              <MessageCircle className="h-4 w-4 fill-white/20" />
              <span>{isEn ? "Claim via WhatsApp" : "Klaim via WhatsApp"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
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
