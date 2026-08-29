"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TimelineEvent {
  year: string;
  role: string;
  company: string;
  description: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: "2024 – Sekarang",
    role: "EKOSISTEM TERPADU: SERVICE, ACADEMY & B2B",
    company: "PT FIXMI BALI DIGITAL",
    description:
      "Memperluas layanan perbaikan perangkat cerdas, standarisasi laboratorium mikrosolder bersertifikasi, serta penyediaan dukungan teknis dan operasional B2B untuk jaringan perusahaan di Bali.",
  },
  {
    year: "2021 – 2024",
    role: "MITRA RESMI JARINGAN RETAIL GADGET",
    company: "BALI REGIONAL",
    description:
      "Dipercaya sebagai partner perbaikan resmi bagi jaringan toko elektronik dan retail ternama di Bali termasuk Cellular World ID, iUsed Phone, dan RA Gadget.",
  },
  {
    year: "2017 – 2021",
    role: "PEMBENTUKAN FIXMI TECH ACADEMY",
    company: "KEDONGANAN, KUTA",
    description:
      "Menyelenggarakan program pelatihan dan sertifikasi teknisi profesional berkolaborasi dengan institusi pendidikan teknis nasional seperti Borneo Flasher Indonesia.",
  },
  {
    year: "2014 – 2017",
    role: "PENDIRIAN PT FIXMI BALI DIGITAL",
    company: "JL. RAYA ULUWATU",
    description:
      "Didirikan pada Agustus 2014 di Kedonganan, Badung oleh Dedik Bowo Sutrisno dengan komitmen menghadirkan layanan perbaikan gadget yang cepat, presisi, transparan, dan bergaransi resmi.",
  },
];

export default function AboutJourneyTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowsContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !rowsContainerRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const rows = rowsContainerRef.current.querySelectorAll(".exp-timeline-row");

      rows.forEach((row, i) => {
        gsap.fromTo(
          row,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 90%",
              once: true,
            },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20 lg:py-24"
    >
      {/* ── Section Title: PERJALANAN KAMI (Solid Orange + Outline White) ── */}
      <h2
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-[-0.03em] leading-none mb-8 sm:mb-12 md:mb-16 select-none"
        style={{ fontFamily: "var(--font-bayon), sans-serif" }}
      >
        <span className="text-primary">PERJALANAN</span>{" "}
        <span className="text-transparent [-webkit-text-stroke:1.25px_#fff] sm:[-webkit-text-stroke:1.5px_#fff]">
          KAMI
        </span>
      </h2>

      {/* ── Minimalist Ledger Rows (Exact layout matching reference) ── */}
      <div ref={rowsContainerRef} className="w-full border-t border-white/[0.08]">
        {TIMELINE_EVENTS.map((item, idx) => (
          <div
            key={idx}
            className="exp-timeline-row group relative w-full border-b border-white/[0.08] py-6 sm:py-8 md:py-10 transition-colors duration-300 hover:border-white/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 md:gap-6 lg:gap-8 items-baseline">
              
              {/* Col 1: Year / Period (Monospace muted text) */}
              <div className="md:col-span-3 lg:col-span-2">
                <span className="font-mono text-xs sm:text-sm md:text-base text-neutral-400 tracking-wider">
                  {item.year}
                </span>
              </div>

              {/* Col 2: Role Headline & Description Prose */}
              <div className="md:col-span-6 lg:col-span-7 mt-1 md:mt-0">
                <h3 className="timeline-role-title text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white uppercase tracking-[-0.01em] transition-colors duration-200">
                  {item.role}
                </h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-[0.9375rem] text-neutral-400 leading-relaxed max-w-3xl">
                  {item.description}
                </p>
              </div>

              {/* Col 3: Company / Location (Right aligned on desktop, left on mobile) */}
              <div className="md:col-span-3 lg:col-span-3 text-left md:text-right mt-2 md:mt-0">
                <span className="font-mono text-[0.6875rem] sm:text-xs md:text-sm uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">
                  {item.company}
                </span>
              </div>

            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
