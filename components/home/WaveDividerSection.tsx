"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";

// ponytail: code-split below-fold sections — SSR stays on, only JS parse cost reduced
const WhyChooseFixmiSection = dynamic(() => import("./WhyChooseFixmiSection"));
const ExplodedPhoneSection = dynamic(() => import("./ExplodedPhoneSection"));
const RepairJourneySection = dynamic(() => import("./RepairJourneySection"));
const CustomerReviewsSection = dynamic(() => import("./CustomerReviewsSection"));
const FaqSection = dynamic(() => import("./FaqSection"));

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ponytail: 5 identical wrapper <div>s → one array
const SECTIONS = [
  WhyChooseFixmiSection,
  ExplodedPhoneSection,
  RepairJourneySection,
  CustomerReviewsSection,
  FaqSection,
] as const;

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
    <section ref={sectionRef} className="relative w-full" style={{ background: "transparent" }}>
      {/* Wave curve with tapered orange crest glow */}
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

          {/* Wave body — #121212 matches page background */}
          <path
            d="M0,35 C260,120 500,145 760,70 C1020,5 1260,90 1440,35 L1440,160 L0,160 Z"
            fill="#121212"
          />

          {/* Tapered orange crest stroke */}
          <path
            d="M0,35 C260,120 500,145 760,70 C1020,5 1260,90 1440,35"
            stroke="url(#taperedCrestGlow)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#waveCrestFilter)"
          />
        </svg>
      </div>

      {/* Content sections */}
      {SECTIONS.map((Section, idx) => (
        <div key={idx} className="relative w-full bg-[#121212] cursor-default">
          <Section />
        </div>
      ))}
    </section>
  );
}
