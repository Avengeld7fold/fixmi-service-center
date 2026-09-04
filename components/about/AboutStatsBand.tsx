"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/lib/i18n/context";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutStatsBand() {
  const { dict } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  const statsData = [
    {
      number: 10,
      suffix: dict.about.stats[0]?.suffix ?? "+",
      label: dict.about.stats[0]?.label ?? "Tahun Pengalaman Profesional",
      sublabel: dict.about.stats[0]?.sublabel ?? "Berdiri di Bali Sejak Agustus 2014",
    },
    {
      number: 15000,
      suffix: dict.about.stats[1]?.suffix ?? "+",
      label: dict.about.stats[1]?.label ?? "Perangkat Berhasil Diperbaiki",
      sublabel: dict.about.stats[1]?.sublabel ?? "iPhone, Android, MacBook, dan iPad",
    },
    {
      number: 3,
      suffix: dict.about.stats[2]?.suffix ?? (dict.locale === "en" ? " Pillars" : " Solusi"),
      label: dict.about.stats[2]?.label ?? "Layanan Terintegrasi",
      sublabel: dict.about.stats[2]?.sublabel ?? "Service Center, Academy & B2B",
    },
    {
      number: 100,
      suffix: dict.about.stats[3]?.suffix ?? "%",
      label: dict.about.stats[3]?.label ?? "Transparansi & Garansi",
      sublabel: dict.about.stats[3]?.sublabel ?? "Diagnosa Terbuka Tanpa Biaya Tersembunyi",
    },
  ];

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const statBlocks = containerRef.current.querySelectorAll(".stat-block");

      statBlocks.forEach((block, index) => {
        const numElem = block.querySelector(".stat-number-text");
        const targetData = statsData[index];
        if (!numElem || !targetData) return;

        const counterObj = { val: 0 };

        ScrollTrigger.create({
          trigger: block,
          start: "top 90%",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              block,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.5, delay: index * 0.08, ease: "power3.out" }
            );

            gsap.to(counterObj, {
              val: targetData.number,
              duration: 1.5,
              delay: index * 0.08 + 0.1,
              ease: "power2.out",
              onUpdate: () => {
                const formatted =
                  targetData.number >= 1000
                    ? Math.round(counterObj.val).toLocaleString("id-ID")
                    : Math.round(counterObj.val).toString();
                numElem.textContent = `${formatted}${targetData.suffix}`;
              },
            });
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <section className="relative w-full py-10 sm:py-14 md:py-20">
      <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 md:px-12 lg:px-16">
        <div
          ref={containerRef}
          className="relative border-y border-white/[0.08] py-8 sm:py-10 md:py-14"
        >
          {/* Subtle warm backlight aura behind the grid */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,107,0,0.035),transparent_70%)]"
            aria-hidden="true"
          />

          {/* Architectural Crosshair Corner Markers */}
          <span className="pointer-events-none absolute -top-2.5 -left-1.5 font-mono text-xs font-light text-white/30 select-none">
            +
          </span>
          <span className="pointer-events-none absolute -top-2.5 -right-1.5 font-mono text-xs font-light text-white/30 select-none">
            +
          </span>
          <span className="pointer-events-none absolute -bottom-2.5 -left-1.5 font-mono text-xs font-light text-white/30 select-none">
            +
          </span>
          <span className="pointer-events-none absolute -bottom-2.5 -right-1.5 font-mono text-xs font-light text-white/30 select-none">
            +
          </span>

          {/* Desktop Crosshairs along intersection points */}
          <span className="hidden lg:block pointer-events-none absolute -top-2.5 left-1/4 -translate-x-1/2 font-mono text-xs font-light text-white/25 select-none">
            +
          </span>
          <span className="hidden lg:block pointer-events-none absolute -top-2.5 left-2/4 -translate-x-1/2 font-mono text-xs font-light text-white/25 select-none">
            +
          </span>
          <span className="hidden lg:block pointer-events-none absolute -top-2.5 left-3/4 -translate-x-1/2 font-mono text-xs font-light text-white/25 select-none">
            +
          </span>
          <span className="hidden lg:block pointer-events-none absolute -bottom-2.5 left-1/4 -translate-x-1/2 font-mono text-xs font-light text-white/25 select-none">
            +
          </span>
          <span className="hidden lg:block pointer-events-none absolute -bottom-2.5 left-2/4 -translate-x-1/2 font-mono text-xs font-light text-white/25 select-none">
            +
          </span>
          <span className="hidden lg:block pointer-events-none absolute -bottom-2.5 left-3/4 -translate-x-1/2 font-mono text-xs font-light text-white/25 select-none">
            +
          </span>

          {/* 4-column Blueprint Spec Grid */}
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4">
            {statsData.map((item, idx) => (
              <div
                key={idx}
                className={`stat-block group relative flex flex-col justify-between ${
                  idx === 0
                    ? "pr-4 sm:pr-8 pb-8 lg:pb-0 border-r border-b lg:border-b-0 border-white/[0.08]"
                    : idx === 1
                    ? "pl-4 sm:pl-8 pb-8 lg:pb-0 lg:px-8 border-b lg:border-b-0 lg:border-r border-white/[0.08]"
                    : idx === 2
                    ? "pr-4 sm:pr-8 pt-8 lg:pt-0 lg:px-8 border-r border-white/[0.08]"
                    : "pl-4 sm:pl-8 pt-8 lg:pt-0 lg:pl-8"
                }`}
              >
                {/* Tech spec index */}
                <div className="flex items-center gap-1.5 mb-2 sm:mb-3 font-mono text-[0.6875rem] text-white/25 transition-colors duration-300 group-hover:text-primary/70 select-none">
                  <span>// 0{idx + 1}</span>
                </div>

                {/* Stat number */}
                <div>
                  <div
                    className="font-bayon text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-primary leading-none tracking-tight mb-2 sm:mb-2.5 font-mono"
                    style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                  >
                    <span className="stat-number-text">
                      0{item.suffix}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-white tracking-[-0.01em] leading-snug">
                    {item.label}
                  </h3>
                </div>

                {/* Sublabel */}
                <p className="mt-2 text-[0.6875rem] sm:text-xs md:text-sm text-text-secondary leading-relaxed">
                  {item.sublabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
