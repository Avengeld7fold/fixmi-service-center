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
    <section className="relative w-full py-8 sm:py-10 md:py-14">
      {/* Soft ambient backlight aura behind the pods */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-4xl h-48 rounded-full bg-primary/[0.04] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-[90rem] px-4 sm:px-6 md:px-12 lg:px-16">
        <div
          ref={containerRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6"
        >
          {statsData.map((item, idx) => (
            <div
              key={idx}
              className="stat-block group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.035] to-white/[0.01] backdrop-blur-xl p-4 sm:p-6 lg:p-7 shadow-[0_12px_30px_-15px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:border-primary/40 hover:bg-white/[0.05] hover:shadow-[0_20px_40px_-15px_rgba(255,107,0,0.15)] hover:-translate-y-1 overflow-hidden"
            >
              {/* Card internal hover glow */}
              <div
                className="pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/0 blur-2xl transition-all duration-500 group-hover:bg-primary/20"
                aria-hidden="true"
              />

              {/* Card top bar: micro status indicator + watermark index */}
              <div className="relative z-10 flex items-center justify-between mb-3 sm:mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors duration-300" />
                <span className="font-mono text-[0.6875rem] sm:text-xs font-semibold tracking-wider text-white/20 select-none transition-colors duration-300 group-hover:text-primary/70">
                  {`0${idx + 1}`}
                </span>
              </div>

              {/* Stat number */}
              <div className="relative z-10">
                <div
                  className="font-bayon text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] text-primary leading-none tracking-tight mb-2 font-mono"
                  style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                >
                  <span className="stat-number-text">
                    0{item.suffix}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-white tracking-[-0.01em] leading-snug">
                  {item.label}
                </h3>
              </div>

              {/* Sublabel */}
              <p className="relative z-10 mt-2 text-[0.6875rem] sm:text-xs text-text-secondary leading-relaxed">
                {item.sublabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
