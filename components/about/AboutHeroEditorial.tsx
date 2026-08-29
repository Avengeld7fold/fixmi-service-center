"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HoverImageTrigger {
  key: string;
  label: string;
  image: string;
  caption: string;
}

const HOVER_PREVIEWS: Record<string, HoverImageTrigger> = {
  microsolder: {
    key: "microsolder",
    label: "lab mikrosolder",
    image: "/images/iphone-depth.png",
    caption: "Fasilitas mikroskop presisi & penanganan logic board tingkat komponen dan IC.",
  },
  cleanroom: {
    key: "cleanroom",
    label: "peralatan presisi",
    image: "/images/iphone-broken.png",
    caption: "Peralatan pembedahan LCD dan housing aman tanpa risiko kerusakan sekunder.",
  },
  originalParts: {
    key: "originalParts",
    label: "sparepart bersertifikasi",
    image: "/images/iphone-fixed.png",
    caption: "Suku cadang pilihan berkualitas tinggi dengan jaminan garansi resmi.",
  },
  academy: {
    key: "academy",
    label: "FIXMI Tech Academy",
    image: "/images/faq-portrait.jpg",
    caption: "Pusat pelatihan & sertifikasi keahlian teknisi profesional di Bali.",
  },
  partners: {
    key: "partners",
    label: "jaringan retail terkemuka di Bali",
    image: "/images/services/1.webp",
    caption: "Dipercaya Cellular World ID, iUsed Phone, RA Gadget, dan ribuan pelanggan.",
  },
};

const STACK_PHOTOS = [
  {
    id: 1,
    title: "Teknisi Ahli & Bersertifikasi",
    subtitle: "Pengalaman Sejak Agustus 2014",
    src: "/images/faq-portrait.jpg",
    tag: "SERVICE CENTER",
    desktopOffset: "lg:self-end lg:z-10 lg:sm:-translate-x-2",
    desktopTiltClass: "lg:-rotate-[3.5deg]",
  },
  {
    id: 2,
    title: "Hardware Lab & Mikrosolder",
    subtitle: "Penanganan Motherboard & Chip-Level",
    src: "/images/iphone-depth.png",
    tag: "MICROSOLDER LAB",
    desktopOffset: "lg:self-start lg:-ml-12 lg:z-20",
    desktopTiltClass: "",
  },
  {
    id: 3,
    title: "Pusat Solusi Gadget Bali",
    subtitle: "Kedonganan, Kuta, dan Denpasar",
    src: "/images/services/1.webp",
    tag: "INTEGRATED ECOSYSTEM",
    desktopOffset: "lg:self-end lg:z-30",
    desktopTiltClass: "",
  },
  {
    id: 4,
    title: "Presisi & Garansi Resmi",
    subtitle: "iPhone, Android, dan MacBook",
    src: "/images/iphone-fixed.png",
    tag: "QUALITY ASSURANCE",
    desktopOffset: "lg:self-start lg:-ml-8 lg:z-40",
    desktopTiltClass: "",
  },
];

export default function AboutHeroEditorial() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftStickyRef = useRef<HTMLDivElement>(null);
  const rightStackRef = useRef<HTMLDivElement>(null);

  // Floating hover preview state
  const [hoveredData, setHoveredData] = useState<HoverImageTrigger | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  useGSAP(
    () => {
      if (!containerRef.current || !rightStackRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (window.innerWidth < 1024) return; // Parallax stack only active on desktop viewports

      // Subtle parallax on desktop vertical stack
      const items = rightStackRef.current.querySelectorAll(".stack-photo-item");
      items.forEach((item, i) => {
        gsap.fromTo(
          item,
          { y: 24 * (i % 2 === 0 ? 1 : -1) },
          {
            y: -24 * (i % 2 === 0 ? 1 : -1),
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-28 overflow-x-clip"
    >
      {/* ── Interactive Floating Image Tooltip ── */}
      {hoveredData && (
        <div
          className="pointer-events-none fixed z-50 transition-transform duration-100 ease-out hidden md:block"
          style={{
            left: `${cursorPos.x + 24}px`,
            top: `${cursorPos.y - 120}px`,
          }}
        >
          <div className="overflow-hidden rounded-xl border border-white/20 bg-[#161616]/95 p-2 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl w-64">
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
          {/* Main Display Headline (Identical typography to Pricelist) */}
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
            TENTANG KAMI
          </h1>

          {/* ── 01 / THE DRIVE ── */}
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/[0.08] mb-4 sm:mb-5">
              <span className="font-mono text-xs sm:text-[0.8125rem] uppercase tracking-[0.15em] text-primary font-bold">
                01 / THE DRIVE
              </span>
            </div>

            <h2
              className="text-base sm:text-lg lg:text-[1.375rem] xl:text-[1.4375rem] font-medium text-white leading-[1.38] tracking-[-0.015em] mb-4 sm:mb-5"
              style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
            >
              Hadir sejak Agustus 2014 di Bali, kami membangun standar perbaikan perangkat pintar berlandaskan kejujuran, ketelitian teknis, dan kepastian garansi resmi.
            </h2>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary mb-3.5 sm:mb-4">
              Di FIXMI, kami mendedikasikan diri untuk memberikan rasa aman dan kenyamanan maksimal bagi setiap pemilik perangkat. Kami mengeliminasi keraguan terhadap keaslian suku cadang serta memastikan seluruh rincian estimasi biaya disampaikan secara transparan sejak tahap diagnosa awal.
            </p>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary">
              Mulai dari pergantian layar LCD, pemulihan performa baterai, perbaikan kamera, hingga rekonstruksi sirkuit motherboard pada{" "}
              <button
                type="button"
                onMouseEnter={() => setHoveredData(HOVER_PREVIEWS.microsolder)}
                onMouseLeave={() => setHoveredData(null)}
                className="inline-flex items-center text-white underline underline-offset-4 decoration-white/40 hover:text-primary hover:decoration-primary font-medium cursor-help transition-colors"
              >
                lab mikrosolder
              </button>
              , setiap penanganan dikerjakan menggunakan{" "}
              <button
                type="button"
                onMouseEnter={() => setHoveredData(HOVER_PREVIEWS.cleanroom)}
                onMouseLeave={() => setHoveredData(null)}
                className="inline-flex items-center text-white underline underline-offset-4 decoration-white/40 hover:text-primary hover:decoration-primary font-medium cursor-help transition-colors"
              >
                peralatan presisi
              </button>{" "}
              dan jaminan{" "}
              <button
                type="button"
                onMouseEnter={() => setHoveredData(HOVER_PREVIEWS.originalParts)}
                onMouseLeave={() => setHoveredData(null)}
                className="inline-flex items-center text-white underline underline-offset-4 decoration-white/40 hover:text-primary hover:decoration-primary font-medium cursor-help transition-colors"
              >
                sparepart bersertifikasi
              </button>
              .
            </p>
          </div>

          {/* ── 02 / BEHIND THE BENCH ── */}
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/[0.08] mb-4 sm:mb-5">
              <span className="font-mono text-xs sm:text-[0.8125rem] uppercase tracking-[0.15em] text-primary font-bold">
                02 / BEHIND THE BENCH
              </span>
            </div>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary mb-3.5 sm:mb-4">
              Keandalan layanan kami didukung oleh penguasaan teknis mendalam dan dedikasi pengembangan keahlian melalui{" "}
              <button
                type="button"
                onMouseEnter={() => setHoveredData(HOVER_PREVIEWS.academy)}
                onMouseLeave={() => setHoveredData(null)}
                className="inline-flex items-center text-white underline underline-offset-4 decoration-white/40 hover:text-primary hover:decoration-primary font-medium cursor-help transition-colors"
              >
                FIXMI Tech Academy
              </button>
              . Kami meyakini bahwa kualitas perbaikan terbaik berakar dari pemahaman menyeluruh terhadap arsitektur hardware perangkat.
            </p>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary">
              Setiap komponen yang dipasang kembali, jalur mikroelektronika yang direkonstruksi, hingga segel proteksi air yang diperbarui dikerjakan dengan disiplin tinggi, presisi, dan kepatuhan penuh terhadap standar keselamatan perangkat.
            </p>
          </div>

          {/* ── 03 / THE COMMUNITY & TRUST ── */}
          <div>
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/[0.08] mb-4 sm:mb-5">
              <span className="font-mono text-xs sm:text-[0.8125rem] uppercase tracking-[0.15em] text-primary font-bold">
                03 / THE COMMUNITY &amp; TRUST
              </span>
            </div>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary mb-3.5 sm:mb-4">
              Selain melayani ribuan pelanggan individu dan wisatawan di Bali, PT Fixmi Bali Digital dipercaya sebagai mitra teknis resmi oleh berbagai{" "}
              <button
                type="button"
                onMouseEnter={() => setHoveredData(HOVER_PREVIEWS.partners)}
                onMouseLeave={() => setHoveredData(null)}
                className="inline-flex items-center text-white underline underline-offset-4 decoration-white/40 hover:text-primary hover:decoration-primary font-medium cursor-help transition-colors"
              >
                jaringan retail terkemuka di Bali
              </button>{" "}
              seperti Cellular World ID, iUsed Phone, RA Gadget, hingga mitra rental gadget.
            </p>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary">
              Kami menyambut Anda untuk berkonsultasi langsung di workshop pusat kami di Jalan Raya Uluwatu No. 79, Kedonganan, Kuta, guna memperoleh diagnosa menyeluruh dan solusi perbaikan terbaik bagi perangkat Anda.
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
            <span>DOKUMENTASI WORKSHOP</span>
            <span className="text-primary font-medium">Geser Horizontal &rarr;</span>
          </div>

          {/* Cards Container: Horizontal Slider on Mobile/Tablet, Vertical Overlapping on Desktop */}
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none gap-4 sm:gap-6 lg:gap-0 lg:space-y-[-130px] pb-4 lg:pb-0 pt-1 lg:pt-14 -mx-4 sm:-mx-6 lg:mx-0 px-4 sm:px-6 lg:px-0 scrollbar-none items-stretch">
            {STACK_PHOTOS.map((photo) => (
              <div
                key={photo.id}
                className={`stack-photo-item relative w-[78vw] sm:w-[50vw] md:w-[42vw] lg:w-[84%] shrink-0 lg:shrink snap-center lg:snap-align-none ${photo.desktopOffset}`}
              >
                <div
                  className={`stack-photo-card group relative aspect-[4/5] w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#0c0c0c] shadow-[0_16px_40px_rgba(0,0,0,0.85)] transition-all duration-500 ease-out hover:border-primary/50 hover:shadow-[0_24px_60px_rgba(255,107,0,0.2)] ${photo.desktopTiltClass}`}
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
