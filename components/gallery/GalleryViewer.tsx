"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ImageOff } from "lucide-react";
import type { GalleryImage } from "@/lib/gallery-server";

interface GalleryViewerProps {
  images: GalleryImage[];
}

export default function GalleryViewer({ images }: GalleryViewerProps) {
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

  // Clean, executive-grade empty state
  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 sm:py-28 px-4 text-center rounded-2xl border border-white/[0.06] bg-[#141414]/50 backdrop-blur-sm">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 mb-5">
          <ImageOff className="h-8 w-8 text-neutral-500 stroke-[1.5]" />
        </div>
        <h3
          className="text-lg sm:text-xl font-medium text-white mb-2"
          style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
        >
          Arsip Dokumentasi Teknis
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary max-w-md leading-relaxed">
          Koleksi dokumentasi visual dan studi kasus hasil penanganan perangkat pintar di laboratorium FIXMI diperbarui secara berkala.
        </p>
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
            aria-label="Foto Sebelumnya"
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
            aria-label="Foto Berikutnya"
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
                alt={selectedImage.altText || selectedImage.Title || "Dokumentasi Servis FIXMI"}
                className="max-h-[78vh] max-w-full object-contain block"
              />
            </div>

            {/* Bottom Caption (Clean Photo Counter & Title) */}
            <div className="mt-3.5 flex items-center justify-between w-full max-w-2xl px-3">
              <span className="text-xs sm:text-sm font-mono text-neutral-400">
                Foto {selectedIndex + 1} dari {images.length}
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
