"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Sparkles,
  Search,
  ShieldCheck,
  BadgePercent,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { whatsappUrl } from "@/lib/constants";
import type { PromoImageItem } from "@/lib/promo-server";

interface PromoViewerProps {
  promos: PromoImageItem[];
}

export default function PromoViewer({ promos }: PromoViewerProps) {
  const { dict, locale, getLocalizedPath } = useI18n();
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

  // Luxury VIP Privilege & Direct Consultation State (when no campaign banners are active)
  if (!promos || promos.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.035] via-white/[0.015] to-transparent backdrop-blur-xl p-6 sm:p-10 md:p-14 lg:p-16 text-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
        {/* Subtle Ambient Backlight Glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 sm:w-[32rem] h-64 sm:h-80 rounded-full bg-primary/[0.12] blur-[90px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,107,0,0.07),transparent_75%)]"
          aria-hidden="true"
        />

        {/* Architectural Crosshairs */}
        <span className="pointer-events-none absolute top-3 left-3 font-mono text-xs font-light text-white/20 select-none">
          +
        </span>
        <span className="pointer-events-none absolute top-3 right-3 font-mono text-xs font-light text-white/20 select-none">
          +
        </span>
        <span className="pointer-events-none absolute bottom-3 left-3 font-mono text-xs font-light text-white/20 select-none">
          +
        </span>
        <span className="pointer-events-none absolute bottom-3 right-3 font-mono text-xs font-light text-white/20 select-none">
          +
        </span>

        {/* Live Status Pill */}
        <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/[0.08] backdrop-blur-md mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="font-mono text-[0.6875rem] font-semibold tracking-wider text-primary uppercase">
            {isEn ? "Direct Rate Inquiry Active" : "Konsultasi Penawaran Aktif"}
          </span>
        </div>

        {/* Holographic Glowing Icon Badge */}
        <div className="relative z-10 mx-auto mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-primary/25 blur-xl transition-all duration-700 animate-pulse" />
          <div className="relative flex h-full w-full items-center justify-center rounded-3xl border border-white/[0.14] bg-gradient-to-b from-white/[0.09] to-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl">
            <Sparkles className="h-9 w-9 sm:h-11 sm:w-11 text-primary stroke-[1.75]" />
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2
            className="font-bayon text-2xl sm:text-3xl md:text-4xl text-white tracking-tight uppercase leading-tight mb-3 font-mono"
            style={{ fontFamily: "var(--font-bayon), sans-serif" }}
          >
            {isEn ? "EXCLUSIVE PRIVILEGES & DIRECT OFFERS" : "PENAWARAN KHUSUS & KONSULTASI LANGSUNG"}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-text-secondary leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto">
            {isEn
              ? "Seasonal voucher campaigns are currently being refreshed for the next period. Meanwhile, you can instantly consult our senior technicians on WhatsApp for custom repair bundles and free priority diagnostics."
              : "Katalog promo berkala sedang diperbarui untuk periode mendatang. Namun, Anda tetap bisa langsung berkonsultasi dengan teknisi kami via WhatsApp untuk mendapatkan potongan paket servis, estimasi harga transparan, dan diagnosa gratis hari ini."}
          </p>
        </div>

        {/* 3 Permanent Privileges (Bento Perks) */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 max-w-4xl mx-auto mb-8 sm:mb-10 text-left">
          {/* Perk 1 */}
          <div className="group/perk relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-white/[0.04]">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover/perk:scale-110">
                <Search className="h-4 w-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">
                {isEn ? "Free Front-Desk Diagnostic" : "Diagnosa Meja Depan Gratis"}
              </h4>
            </div>
            <p className="text-[0.6875rem] sm:text-xs text-text-secondary leading-relaxed">
              {isEn
                ? "Thorough hardware & board inspection in front of you with zero hidden charges or repair obligations."
                : "Pemeriksaan terbuka di meja depan langsung oleh teknisi tanpa biaya tersembunyi dan tanpa kewajiban servis."}
            </p>
          </div>

          {/* Perk 2 */}
          <div className="group/perk relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-white/[0.04]">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover/perk:scale-110">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">
                {isEn ? "Official Warranty Protection" : "Garansi Servis Hingga 90 Hari"}
              </h4>
            </div>
            <p className="text-[0.6875rem] sm:text-xs text-text-secondary leading-relaxed">
              {isEn
                ? "Every replacement part is backed by clear warranty terms and dedicated post-service care."
                : "Jaminan suku cadang berkualitas dengan garansi resmi tertulis hingga 90 hari untuk ketenangan maksimal Anda."}
            </p>
          </div>

          {/* Perk 3 */}
          <div className="group/perk relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-white/[0.04]">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover/perk:scale-110">
                <BadgePercent className="h-4 w-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">
                {isEn ? "Custom Bundle Discounts" : "Penawaran Paket Spesial"}
              </h4>
            </div>
            <p className="text-[0.6875rem] sm:text-xs text-text-secondary leading-relaxed">
              {isEn
                ? "Special bundled rate when repairing multiple faults or bringing multiple family devices."
                : "Potongan harga khusus untuk perbaikan lebih dari satu kerusakan atau servis beberapa perangkat sekaligus."}
            </p>
          </div>
        </div>

        {/* Dual Interactive Action Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
          <a
            href={whatsappUrl(
              isEn
                ? "Hello FIXMI Service Center, I would like to ask about special offers and repair promo for my device."
                : "Halo FIXMI Service Center, saya ingin menanyakan penawaran spesial dan promo servis untuk perangkat saya."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-[0_10px_25px_-5px_rgba(255,107,0,0.4)] transition-all duration-300 hover:bg-primary-hover hover:shadow-[0_14px_30px_-5px_rgba(255,107,0,0.6)] hover:-translate-y-0.5 active:scale-95"
          >
            <MessageCircle className="h-4 w-4 fill-white/20" />
            <span>{isEn ? "Inquire Special Rates via WhatsApp" : "Tanyakan Penawaran via WhatsApp"}</span>
          </a>

          <Link
            href={getLocalizedPath("/pricelist")}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-6 py-3.5 text-xs sm:text-sm font-semibold text-neutral-200 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/[0.08] hover:text-white hover:-translate-y-0.5 active:scale-95"
          >
            <span>{isEn ? "Explore Standard Pricelist" : "Cek Estimasi Biaya Servis"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
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
