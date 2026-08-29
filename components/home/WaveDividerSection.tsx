"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";

// Code-splitting: semua section di bawah fold dipecah ke chunk JS terpisah.
// SSR tetap aktif (default) sehingga HTML awal identik — tidak ada perubahan
// visual, layout shift, ataupun dampak SEO. Hanya beban parse JS awal yang
// berkurang signifikan untuk perangkat lawas.
const WhyChooseFixmiSection = dynamic(() => import("./WhyChooseFixmiSection"));
const ExplodedPhoneSection = dynamic(() => import("./ExplodedPhoneSection"));
const RepairJourneySection = dynamic(() => import("./RepairJourneySection"));
const CustomerReviewsSection = dynamic(() => import("./CustomerReviewsSection"));
const FaqSection = dynamic(() => import("./FaqSection"));

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * WaveDividerSection — Solusi bg-transparent definitif
 *
 * Kunci: body background = #121212 (sama dengan Hero section).
 * Dengan section menggunakan bg-transparent, area di atas wave curve
 * akan menampilkan body background (#121212) — identik dengan Hero.
 * Tidak ada lagi seam karena tidak ada dua CSS background yang berbeda.
 */
export default function WaveDividerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const frontWaveRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !frontWaveRef.current) return;

      gsap.fromTo(
        frontWaveRef.current,
        { scaleY: 0.95, xPercent: -1 },
        {
          scaleY: 1.06,
          xPercent: 1.2,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    /*
      bg-transparent: body (#121212) tembus ke area di atas wave curve.
      Ini membuat area atas wave identik dengan Hero background — no seam!
    */
    <section
      ref={sectionRef}
      className="relative w-full cursor-none"
      style={{ background: "transparent" }}
    >
      {/* Wave wrapper: transparan di atas, menyatu rapat tanpa celah/belang */}
      <div className="relative w-full pointer-events-none select-none z-10 -mb-px">
        <svg
          ref={frontWaveRef}
          viewBox="0 0 1440 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-20 sm:h-28 md:h-36 lg:h-44 block align-bottom"
          preserveAspectRatio="none"
          style={{ willChange: "transform", transformOrigin: "bottom center" }}
        >
          <defs>
            <linearGradient id="taperedCrestGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 107, 0, 0)" />
              <stop offset="15%" stopColor="rgba(255, 107, 0, 0.08)" />
              <stop offset="35%" stopColor="rgba(255, 107, 0, 0.45)" />
              <stop offset="52%" stopColor="rgba(255, 107, 0, 0.85)" />
              <stop offset="68%" stopColor="rgba(255, 107, 0, 0.5)" />
              <stop offset="85%" stopColor="rgba(255, 107, 0, 0.1)" />
              <stop offset="100%" stopColor="rgba(255, 107, 0, 0)" />
            </linearGradient>

            <filter id="waveCrestFilter" x="-10%" y="-20%" width="120%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="rgba(255, 107, 0, 0.4)" />
            </filter>
          </defs>

          {/*
            Wave Body = #121212 Murni, identik dengan Hero dan seluruh kanvas halaman
          */}
          <path
            d="M0,35 C260,120 500,145 760,70 C1020,5 1260,90 1440,35 L1440,160 L0,160 Z"
            fill="#121212"
          />

          {/* Garis puncak oranye tapered yang bersinar tajam dan elegan */}
          <path
            d="M0,35 C260,120 500,145 760,70 C1020,5 1260,90 1440,35"
            stroke="url(#taperedCrestGlow)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#waveCrestFilter)"
          />
        </svg>
      </div>

      {/* ── Section 1: MENGAPA MEMILIH FIXMI (Apple Dark Bento Trust Grid) ── */}
      <div className="relative w-full bg-[#121212] cursor-default">
        <WhyChooseFixmiSection />
      </div>

      {/* ── Section 2: APA YANG KAMI PERBAIKI (Exploded Assembly + Callout) ── */}
      <div className="relative w-full bg-[#121212] cursor-default">
        <ExplodedPhoneSection />
      </div>

      {/* ── Section 3: ALUR SERVIS TRANSPARAN (4-Step Repair Journey) ── */}
      <div className="relative w-full bg-[#121212] cursor-default">
        <RepairJourneySection />
      </div>

      {/* ── Section 4: CUSTOMER REVIEWS (Live Google Maps Rating & Reviews) ── */}
      <div className="relative w-full bg-[#121212] cursor-default">
        <CustomerReviewsSection />
      </div>

      {/* ── Section 5: FAQ (Ask Away - 3D Perspective Photo + Minimalist Accordion) ── */}
      <div className="relative w-full bg-[#121212] cursor-default">
        <FaqSection />
      </div>
    </section>
  );
}
