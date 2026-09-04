"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { GalleryImage } from "@/lib/gallery-server";

interface GalleryViewerProps {
  images: GalleryImage[];
}

export default function GalleryViewer({ images }: GalleryViewerProps) {
  const { dict, locale } = useI18n();
  const isEn = locale === "en";
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  const handleOpen = (index: number) => {
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setSelectedIndex(null);
  };

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));
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

  // Ultra-Clean Snug Banner (adopted from Pricelist empty card pattern, without WhatsApp CTA)
  if (!images || images.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[16px] lg:rounded-[20px] border border-panel-border bg-panel p-5 sm:p-6 lg:py-7 lg:px-8 transition-colors duration-200">
        <div className="max-w-2xl">
          {/* Status Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[0.6875rem] font-mono tracking-wider text-neutral-300 uppercase mb-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>{isEn ? "Documentation Archive" : "Dokumentasi & Portofolio"}</span>
          </div>

          <h3
            className="font-bayon text-xl sm:text-2xl lg:text-[1.75rem] text-white uppercase tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-bayon), sans-serif" }}
          >
            {isEn ? (
              <>
                Documentation Photos{" "}
                <span className="text-primary">Coming Soon</span>
              </>
            ) : (
              <>
                Foto Dokumentasi Servis{" "}
                <span className="text-primary">Segera Hadir</span>
              </>
            )}
          </h3>

          <p
            className="mt-2 text-xs sm:text-sm leading-relaxed text-text-secondary max-w-xl"
            style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
          >
            {dict.gallery.emptyGallery}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Smart Dynamic Masonry Grid (Preserves Natural Portrait / Landscape Ratios) ── */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 md:gap-5 space-y-3 sm:space-y-4 md:space-y-5">
        {images.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => handleOpen(index)}
            className="group relative w-full break-inside-avoid overflow-hidden rounded-xl sm:rounded-2xl border border-white/[0.08] bg-[#141414] cursor-pointer transition-all duration-300 hover:border-primary/60 hover:shadow-[0_12px_32px_rgba(255,107,0,0.18)]"
          >
            {/* Dynamic Natural Ratio Image */}
            <div className="relative w-full overflow-hidden bg-neutral-900/60">
              <img
                src={item.Image}
                alt={item.altText || item.Title || `Dokumentasi Servis FIXMI ${index + 1}`}
                loading={index < 4 ? "eager" : "lazy"}
                className="w-full h-auto block object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Hover Vignette & Zoom Icon Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                <div className="rounded-full bg-primary/90 text-white p-2.5 sm:p-3 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Fullscreen Interactive Lightbox Modal ── */}
      {selectedImage && selectedIndex !== null && (
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
            aria-label={isEn ? "Previous photo" : "Foto Sebelumnya"}
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
            aria-label={isEn ? "Next photo" : "Foto Berikutnya"}
            className="absolute right-2 sm:right-6 z-50 rounded-full bg-white/10 p-2 sm:p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>

          {/* Modal Content — Intelligently sizes to natural aspect ratio */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center max-w-5xl max-h-[90vh] w-full select-none"
          >
            <div className="relative flex items-center justify-center max-h-[78vh] w-auto max-w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl">
              <img
                src={selectedImage.Image}
                alt={selectedImage.altText || selectedImage.Title || (isEn ? "FIXMI Repair Documentation" : "Dokumentasi Servis FIXMI")}
                className="max-h-[78vh] max-w-full object-contain block"
              />
            </div>

            {/* Bottom Caption (Clean Photo Counter & Title) */}
            <div className="mt-3.5 flex items-center justify-between w-full max-w-2xl px-3">
              <span className="text-xs sm:text-sm font-mono text-neutral-400">
                {isEn
                  ? `Photo ${selectedIndex + 1} of ${images.length}`
                  : `Foto ${selectedIndex + 1} dari ${images.length}`}
              </span>
              {selectedImage.Title && (
                <span className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wide truncate max-w-[65%] text-right">
                  {selectedImage.Title}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
