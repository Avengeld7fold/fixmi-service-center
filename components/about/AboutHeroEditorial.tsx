"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/lib/i18n/context";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HoverImageTrigger {
  key: string;
  label: string;
  image: string;
  caption: string;
}

export default function AboutHeroEditorial() {
  const { dict } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const leftStickyRef = useRef<HTMLDivElement>(null);
  const rightStackRef = useRef<HTMLDivElement>(null);

  const hoverPreviews: Record<string, HoverImageTrigger> = {
    microsolder: {
      key: "microsolder",
      label: dict.about.microsolderLabel,
      image: "/images/fixmi-lab1.webp",
      caption: dict.about.microsolderCaption,
    },
    cleanroom: {
      key: "cleanroom",
      label: dict.about.cleanroomLabel,
      image: "/images/fixmi-lab2.webp",
      caption: dict.about.cleanroomCaption,
    },
    originalParts: {
      key: "originalParts",
      label: dict.about.originalPartsLabel,
      image: "/images/spareparts.webp",
      caption: dict.about.originalPartsCaption,
    },
    academy: {
      key: "academy",
      label: dict.about.academyLabel,
      image: "/images/toko1.webp",
      caption: dict.about.academyCaption,
    },
    partners: {
      key: "partners",
      label: dict.about.partnersLabel,
      image: "/images/services/1.webp",
      caption: dict.about.partnersCaption,
    },
  };

  const stackPhotos = [
    {
      id: 1,
      title: dict.about.cards[0]?.title || "Teknisi Ahli & Bersertifikasi",
      subtitle: dict.about.cards[0]?.subtitle || "Pengalaman Sejak Agustus 2014",
      src: "/images/teknisi-2.webp",
      tag: dict.about.cards[0]?.tag || "SERVICE CENTER",
      desktopOffset: "lg:self-end lg:z-10 lg:sm:-translate-x-2",
      tiltClass: "-rotate-2 sm:-rotate-3 lg:-rotate-[3.5deg]",
    },
    {
      id: 2,
      title: dict.about.cards[1]?.title || "Hardware Lab & Mikrosolder",
      subtitle: dict.about.cards[1]?.subtitle || "Penanganan Motherboard & Chip-Level",
      src: "/images/fixmi-lab1.webp",
      tag: dict.about.cards[1]?.tag || "MICROSOLDER LAB",
      desktopOffset: "lg:self-start lg:-ml-12 lg:z-20",
      tiltClass: "",
    },
    {
      id: 3,
      title: dict.about.cards[2]?.title || "Pusat Solusi Gadget Bali",
      subtitle: dict.about.cards[2]?.subtitle || "Kedonganan, Kuta, dan Denpasar",
      src: "/images/toko1.webp",
      tag: dict.about.cards[2]?.tag || "INTEGRATED ECOSYSTEM",
      desktopOffset: "lg:self-end lg:z-30",
      tiltClass: "",
    },
    {
      id: 4,
      title: dict.about.cards[3]?.title || "Presisi & Garansi Resmi",
      subtitle: dict.about.cards[3]?.subtitle || "iPhone, Android, dan MacBook",
      src: "/images/spareparts.webp",
      tag: dict.about.cards[3]?.tag || "QUALITY ASSURANCE",
      desktopOffset: "lg:self-start lg:-ml-8 lg:z-40",
      tiltClass: "",
    },
  ];

  // Floating hover preview state
  const [hoveredData, setHoveredData] = useState<HoverImageTrigger | null>(null);

  // Posisi kursor disimpan di ref + ditulis langsung ke DOM tooltip
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const targetXRef = useRef<number>(0);
  const targetYRef = useRef<number>(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    targetXRef.current = e.clientX + 16;
    targetYRef.current = e.clientY + 16;
    if (tooltipRef.current) {
      tooltipRef.current.style.transform = `translate3d(${targetXRef.current}px, ${targetYRef.current}px, 0)`;
    }
  };

  // ── GSAP Stacking & Parallax Animation on Desktop (≥ lg) ──
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Only enable vertical stacking parallax on desktop screens (≥ 1024px)
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        if (!rightStackRef.current) return;

        const items = rightStackRef.current.querySelectorAll(".stack-photo-item");
        if (!items.length) return;

        items.forEach((item, index) => {
          gsap.fromTo(
            item,
            {
              y: 50 * (index + 1),
              opacity: 0.85,
              scale: 0.95,
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                start: "top 90%",
                end: "top 40%",
                scrub: 1.2,
              },
            }
          );
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 lg:pb-24"
    >
      {/* ── Floating Cursor-Following Image Preview Tooltip ── */}
      {hoveredData && (
        <div
          ref={tooltipRef}
          className="fixed top-0 left-0 z-50 pointer-events-none transition-opacity duration-200"
          style={{
            transform: `translate3d(${targetXRef.current}px, ${targetYRef.current}px, 0)`,
          }}
        >
          <div className="w-56 sm:w-64 rounded-xl border border-white/20 bg-black/90 backdrop-blur-xl p-2 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-900">
              <Image
                src={hoveredData.image}
                alt={hoveredData.label}
                fill
                className="object-cover"
                sizes="260px"
              />
            </div>
            <div className="p-2 pt-2.5">
              <div className="font-mono text-[0.625rem] uppercase tracking-widest text-primary font-semibold">
                PT FIXMI BALI DIGITAL
              </div>
              <p className="mt-1 text-xs text-neutral-300 leading-snug">
                {hoveredData.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 2-Column Layout (Left: Sticky Editorial Narrative, Right: Horizontal Slider / Vertical Stack) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 xl:gap-20 items-start">
        
        {/* ── Left Column: Sticky Editorial Narrative (3 Points) ── */}
        <div
          ref={leftStickyRef}
          className="lg:col-span-6 lg:sticky lg:top-28 flex flex-col justify-start lg:pr-4"
        >
          {/* Main Display Headline */}
          <h1
            style={{
              fontFamily: "var(--font-bayon), sans-serif",
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "var(--fixmi-text-primary)",
              textTransform: "uppercase" as const,
            }}
            className="text-[clamp(2.25rem,7vw,3.125rem)] md:text-[clamp(3.125rem,5.5vw,4rem)] lg:text-[clamp(4rem,5vw,4.75rem)] mb-8 lg:mb-10"
          >
            {(() => {
              const parts = dict.about.headline.split(" ");
              if (parts.length >= 2) {
                const prefix = parts.slice(0, -1).join(" ");
                const last = parts[parts.length - 1];
                return (
                  <>
                    {prefix} <span className="text-primary">{last}</span>
                  </>
                );
              }
              return dict.about.headline;
            })()}
          </h1>

          {/* ── 01 / THE DRIVE ── */}
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/[0.08] mb-4 sm:mb-5">
              <span className="font-mono text-xs sm:text-[0.8125rem] uppercase tracking-[0.15em] text-primary font-bold">
                {dict.about.driveBadge}
              </span>
            </div>

            <h2
              className="text-base sm:text-lg lg:text-[1.375rem] xl:text-[1.4375rem] font-medium text-white leading-[1.38] tracking-[-0.015em] mb-4 sm:mb-5"
              style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
            >
              {dict.about.driveHeadline}
            </h2>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary mb-3.5 sm:mb-4">
              {dict.about.driveP1}
            </p>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary">
              {dict.about.driveP2}{" "}
              <button
                type="button"
                onMouseEnter={() => setHoveredData(hoverPreviews.microsolder)}
                onMouseLeave={() => setHoveredData(null)}
                className="inline-flex items-center text-white underline underline-offset-4 decoration-white/40 hover:text-primary hover:decoration-primary font-medium cursor-help transition-colors"
              >
                {dict.about.microsolderLabel}
              </button>
              , {dict.locale === "en" ? "all repairs are performed using" : "setiap penanganan dikerjakan menggunakan"}{" "}
              <button
                type="button"
                onMouseEnter={() => setHoveredData(hoverPreviews.cleanroom)}
                onMouseLeave={() => setHoveredData(null)}
                className="inline-flex items-center text-white underline underline-offset-4 decoration-white/40 hover:text-primary hover:decoration-primary font-medium cursor-help transition-colors"
              >
                {dict.about.cleanroomLabel}
              </button>{" "}
              {dict.locale === "en" ? "and backed by" : "dan jaminan"}{" "}
              <button
                type="button"
                onMouseEnter={() => setHoveredData(hoverPreviews.originalParts)}
                onMouseLeave={() => setHoveredData(null)}
                className="inline-flex items-center text-white underline underline-offset-4 decoration-white/40 hover:text-primary hover:decoration-primary font-medium cursor-help transition-colors"
              >
                {dict.about.originalPartsLabel}
              </button>
              .
            </p>
          </div>

          {/* ── 02 / BEHIND THE BENCH ── */}
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/[0.08] mb-4 sm:mb-5">
              <span className="font-mono text-xs sm:text-[0.8125rem] uppercase tracking-[0.15em] text-primary font-bold">
                {dict.about.behindBadge}
              </span>
            </div>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary mb-3.5 sm:mb-4">
              {dict.about.behindP1}{" "}
              <button
                type="button"
                onMouseEnter={() => setHoveredData(hoverPreviews.academy)}
                onMouseLeave={() => setHoveredData(null)}
                className="inline-flex items-center text-white underline underline-offset-4 decoration-white/40 hover:text-primary hover:decoration-primary font-medium cursor-help transition-colors"
              >
                {dict.about.academyLabel}
              </button>
              . {dict.locale === "en" ? "We firmly believe that supreme repair quality stems from an exhaustive understanding of device hardware architecture." : "Kami meyakini bahwa kualitas perbaikan terbaik berakar dari pemahaman menyeluruh terhadap arsitektur hardware perangkat."}
            </p>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary">
              {dict.about.behindP2}
            </p>
          </div>

          {/* ── 03 / THE COMMUNITY & TRUST ── */}
          <div>
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/[0.08] mb-4 sm:mb-5">
              <span className="font-mono text-xs sm:text-[0.8125rem] uppercase tracking-[0.15em] text-primary font-bold">
                {dict.about.communityBadge}
              </span>
            </div>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary mb-3.5 sm:mb-4">
              {dict.about.communityP1}{" "}
              <button
                type="button"
                onMouseEnter={() => setHoveredData(hoverPreviews.partners)}
                onMouseLeave={() => setHoveredData(null)}
                className="inline-flex items-center text-white underline underline-offset-4 decoration-white/40 hover:text-primary hover:decoration-primary font-medium cursor-help transition-colors"
              >
                {dict.about.partnersLabel}
              </button>{" "}
              {dict.locale === "en" ? "including Cellular World ID, iUsed Phone, RA Gadget, and gadget rental enterprises." : "seperti Cellular World ID, iUsed Phone, RA Gadget, hingga mitra rental gadget."}
            </p>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary">
              {dict.about.communityP2}
            </p>
          </div>

        </div>

        {/* ── Right Column: Mobile Horizontal Slider (< lg) / Desktop Vertical Stacking (lg:) ── */}
        <div
          ref={rightStackRef}
          className="lg:col-span-6 w-full"
        >
          {/* Mobile & Tablet Horizontal Scroll Hint */}
          <div className="flex lg:hidden items-center justify-between mb-3 text-neutral-400 font-mono text-[0.6875rem] uppercase tracking-wider px-1">
            <span>{dict.about.workshopHint}</span>
            <span className="text-primary font-medium">{dict.about.swipeHint}</span>
          </div>

          {/* Cards Container: Horizontal Slider on Mobile/Tablet, Vertical Overlapping on Desktop */}
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none gap-4 sm:gap-6 lg:gap-0 lg:space-y-[-130px] pb-4 lg:pb-0 pt-1 lg:pt-14 -mx-4 sm:-mx-6 lg:mx-0 px-4 sm:px-6 lg:px-0 scrollbar-none items-stretch">
            {stackPhotos.map((photo) => (
              <div
                key={photo.id}
                className={`stack-photo-item relative w-[78vw] sm:w-[50vw] md:w-[42vw] lg:w-[84%] shrink-0 lg:shrink snap-center lg:snap-align-none ${photo.desktopOffset}`}
              >
                <div
                  className={`stack-photo-card group relative aspect-[4/5] w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#0c0c0c] shadow-[0_16px_40px_rgba(0,0,0,0.85)] transition-all duration-500 ease-out hover:border-primary/50 hover:shadow-[0_24px_60px_rgba(255,107,0,0.2)] hover:rotate-0 origin-center ${photo.tiltClass}`}
                >
                  {/* Photo Image with Grayscale default -> Full Color on Hover */}
                  <div className="relative h-full w-full overflow-hidden">
                    <Image
                      src={photo.src}
                      alt={photo.title}
                      fill
                      className="object-cover grayscale contrast-105 transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0 group-hover:contrast-100"
                      sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 40vw"
                      priority={photo.id === 1}
                    />
                    
                    {/* Subtle vignette gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                    {/* Top Badge */}
                    <div className="absolute top-3.5 sm:top-4 left-3.5 sm:left-4 rounded-full border border-white/20 bg-black/60 px-2.5 sm:px-3 py-0.5 sm:py-1 font-mono text-[0.625rem] sm:text-[0.6875rem] tracking-wider text-white backdrop-blur-md">
                      {photo.tag}
                    </div>

                    {/* Bottom Metadata */}
                    <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-4 sm:right-5">
                      <h4 className="text-sm sm:text-base lg:text-lg font-bold text-white tracking-[-0.01em] leading-snug">
                        {photo.title}
                      </h4>
                      <p className="mt-0.5 text-[0.6875rem] sm:text-xs text-neutral-300">
                        {photo.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
