"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { whatsappUrl } from "@/lib/constants";

interface WorkshopPhoto {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  image: string;
}

const WORKSHOP_PHOTOS: WorkshopPhoto[] = [
  {
    id: "live-bench",
    number: "01",
    title: "Live Repair Station",
    subtitle: "Pengerjaan transparan langsung di meja servis tanpa ada data pribadi yang diakses.",
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "speed-assembly",
    number: "02",
    title: "Precision Modular Assembly",
    subtitle: "Penggantian layar & baterai kilat 15–30 menit bisa langsung ditunggu di lounge.",
    image:
      "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "microscope",
    number: "03",
    title: "Micro-soldering & CPU Reballing",
    subtitle: "Peralatan mikroskop elektronika tingkat lanjut untuk pemulihan Logic Board.",
    image:
      "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "quality-check",
    number: "04",
    title: "Quality Control & Warranty",
    subtitle: "Uji fungsi menyeluruh berstandar pabrikan dan garansi resmi hingga 365 hari.",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
  },
];

const AUTOPLAY_INTERVAL = 4500; // 4.5 detik per slide

export default function WhyChooseFixmiSection() {
  const { dict, getLocalizedPath } = useI18n();
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const touchStartXRef = useRef<number>(0);
  const touchEndXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);

  const nextSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % WORKSHOP_PHOTOS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + WORKSHOP_PHOTOS.length) % WORKSHOP_PHOTOS.length);
  }, []);

  // ── Standalone Auto-Slide Timer (resets on manual interaction) ──
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isHovered, nextSlide, currentIdx]);

  // ── Touch Gesture Handlers (Mobile & Tablet) ──
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const delta = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(delta) > 40) {
      if (delta > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = 0;
    touchEndXRef.current = 0;
  };

  // ── Mouse Drag Handlers (Desktop & Laptop) ──
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const delta = dragStartXRef.current - e.clientX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    isDraggingRef.current = false;
  };

  return (
    <section className="relative w-full bg-[#121212] text-white py-12 sm:py-16 lg:py-20 overflow-hidden select-none">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 xl:gap-14 items-center">
          
          {/* ── SISI KIRI: STREAMLINED EDITORIAL TYPOGRAPHY & VALUE PILLARS ── */}
          <div className="lg:col-span-6 flex flex-col justify-between text-left h-full py-1">
            
            {/* Header Group */}
            <div>
              <h2
                className="font-bayon text-3xl sm:text-4xl lg:text-5xl uppercase text-[#f5f5f5] leading-[0.95] tracking-[-0.01em]"
                style={{
                  fontFamily: "var(--font-bayon), sans-serif",
                }}
              >
                {dict.whyUs.heading1} <br />
                <span className="text-primary">{dict.whyUs.heading2}</span>
              </h2>

              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-lg font-normal mt-3.5 sm:mt-4">
                {dict.whyUs.description}
              </p>
            </div>

            {/* ── 3 Key Value Pillars (Single-Line Precision Labels) ── */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-5 sm:pt-6 border-t border-white/[0.08] mt-5 sm:mt-6">
              <div>
                <div
                  className="font-bayon text-2xl xs:text-3xl lg:text-4xl text-primary leading-none"
                  style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                >
                  {dict.whyUs.pillar1Value}
                </div>
                <div className="text-xs sm:text-[0.8125rem] text-neutral-300 font-normal mt-1.5 leading-snug">
                  {dict.whyUs.pillar1Label}
                </div>
              </div>

              <div>
                <div
                  className="font-bayon text-2xl xs:text-3xl lg:text-4xl text-white leading-none"
                  style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                >
                  {dict.whyUs.pillar2Value}
                </div>
                <div className="text-xs sm:text-[0.8125rem] text-neutral-300 font-normal mt-1.5 leading-snug">
                  {dict.whyUs.pillar2Label}
                </div>
              </div>

              <div>
                <div
                  className="font-bayon text-2xl xs:text-3xl lg:text-4xl text-white leading-none"
                  style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                >
                  {dict.whyUs.pillar3Value}
                </div>
                <div className="text-xs sm:text-[0.8125rem] text-neutral-300 font-normal mt-1.5 leading-snug">
                  {dict.whyUs.pillar3Label}
                </div>
              </div>
            </div>

            {/* ── UNIFIED PRECISION ACTION DOCK ── */}
            <div className="mt-6 sm:mt-7">
              <div
                className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[#141417]/95 border border-white/[0.12] transition-all duration-300 hover:border-white/[0.22] select-none w-full max-w-[390px] sm:w-auto"
                style={{
                  boxShadow:
                    "0 20px 40px -15px rgba(0, 0, 0, 0.9), 0 0 30px -10px rgba(255, 107, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
                }}
              >
                {/* Primary Action Button: Cek Biaya Servis */}
                <Link
                  href={getLocalizedPath("/pricelist")}
                  className="group relative flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 sm:gap-2.5 min-h-[44px] px-4 sm:px-6 py-2.5 rounded-full bg-primary text-[#121212] font-semibold text-xs sm:text-[0.84rem] md:text-sm tracking-[-0.01em] whitespace-nowrap transition-all duration-200 ease-out hover:bg-primary-light active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 overflow-hidden text-center"
                  style={{
                    boxShadow:
                      "0 6px 20px -4px rgba(255, 107, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.45)",
                  }}
                >
                  <span className="relative z-10">{dict.whyUs.checkPriceBtn}</span>
                  <span className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black/10 flex items-center justify-center transition-all duration-200 ease-out group-hover:bg-black/15 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0">
                    <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#121212]" strokeWidth={2.5} />
                  </span>
                </Link>

                {/* Secondary Action: Konsultasi WhatsApp */}
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] px-3.5 sm:px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 hover:text-white font-medium text-xs sm:text-[0.84rem] md:text-sm tracking-[-0.01em] whitespace-nowrap transition-all duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 text-center"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="shrink-0 text-primary transition-transform duration-200 ease-out group-hover:scale-110"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                  <span>{dict.whyUs.waConsultBtn}</span>
                </a>
              </div>
            </div>

          </div>

          {/* ── SISI KANAN: STANDALONE AUTO-PLAYING IMAGE SHOWCASE ── */}
          <div
            className="lg:col-span-6 w-full max-w-2xl mx-auto lg:max-w-none touch-pan-y select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.12] bg-[#121216] shadow-[0_20px_50px_rgba(0,0,0,0.85)] sm:shadow-[0_30px_70px_rgba(0,0,0,0.85)] aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] xl:aspect-[16/11]">
              
              {/* Photo Slides */}
              {WORKSHOP_PHOTOS.map((photo, idx) => {
                const isActive = currentIdx === idx;
                return (
                  <div
                    key={photo.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                      isActive ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105 pointer-events-none"
                    }`}
                    style={{ transitionProperty: "opacity, transform" }}
                  >
                    <Image
                      src={photo.image}
                      alt={photo.title}
                      fill
                      priority={idx === 0}
                      loading={idx === 0 ? undefined : "lazy"}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center brightness-[0.88] contrast-[1.04]"
                    />

                    {/* Gradient Overlay for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                  </div>
                );
              })}

              {/* Top Slide Numbering Badge */}
              <div className="absolute top-4 sm:top-5 left-4 sm:left-5 z-20">
                <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-mono">
                  <span className="font-semibold text-primary">
                    {WORKSHOP_PHOTOS[currentIdx].number}
                  </span>
                  <span className="text-neutral-400">/ 04</span>
                </div>
              </div>

              {/* Bottom Caption & Controls */}
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 lg:p-7 z-20 flex flex-col justify-end">
                <div className="mb-3 sm:mb-4">
                  <h3
                    className="font-bayon text-xl sm:text-2xl lg:text-3xl uppercase text-white mb-1 leading-tight"
                    style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                  >
                    {WORKSHOP_PHOTOS[currentIdx].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md font-normal line-clamp-2 sm:line-clamp-none">
                    {WORKSHOP_PHOTOS[currentIdx].subtitle}
                  </p>
                </div>

                {/* Progress Indicators & Navigation */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  {/* Segmented Dots */}
                  <div className="flex items-center gap-2">
                    {WORKSHOP_PHOTOS.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setCurrentIdx(dotIdx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          currentIdx === dotIdx ? "w-6 bg-primary" : "w-2 bg-white/20 hover:bg-white/40"
                        }`}
                        aria-label={`Lihat foto ${dotIdx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Manual Arrow Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={prevSlide}
                      className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white hover:border-primary hover:text-primary flex items-center justify-center transition-all active:scale-90"
                      aria-label="Foto Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white hover:border-primary hover:text-primary flex items-center justify-center transition-all active:scale-90"
                      aria-label="Foto Selanjutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
