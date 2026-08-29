"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface StatItem {
  number: number;
  suffix: string;
  prefix?: string;
  label: string;
  sublabel: string;
}

const STATS_DATA: StatItem[] = [
  {
    number: 10,
    suffix: "+",
    label: "Tahun Pengalaman Profesional",
    sublabel: "Berdiri di Bali Sejak Agustus 2014",
  },
  {
    number: 15000,
    suffix: "+",
    label: "Perangkat Berhasil Diperbaiki",
    sublabel: "iPhone, Android, MacBook, dan iPad",
  },
  {
    number: 3,
    suffix: " Solusi",
    label: "Layanan Terintegrasi",
    sublabel: "Service Center, Academy & B2B",
  },
  {
    number: 100,
    suffix: "%",
    label: "Transparansi & Garansi",
    sublabel: "Diagnosa Terbuka Tanpa Biaya Tersembunyi",
  },
];

export default function AboutStatsBand() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const statBlocks = containerRef.current.querySelectorAll(".stat-block");

      statBlocks.forEach((block, index) => {
        const numElem = block.querySelector(".stat-number-text");
        const targetData = STATS_DATA[index];
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
                numElem.textContent = `${targetData.prefix ?? ""}${formatted}${targetData.suffix}`;
              },
            });
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <section className="relative w-full border-y border-white/[0.08] bg-black/40 backdrop-blur-md">
      <div
        ref={containerRef}
        className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 md:px-12 lg:px-16 py-8 sm:py-10 md:py-12 lg:py-14"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 sm:gap-x-6 lg:gap-x-8">
          {STATS_DATA.map((item, idx) => (
            <div
              key={idx}
              className={`stat-block relative flex flex-col justify-between ${
                idx % 2 === 0
                  ? "pl-0 lg:pl-6 border-l-0 lg:border-l lg:first:border-l-0 lg:first:pl-0"
                  : "pl-4 sm:pl-6 border-l border-white/[0.08]"
              }`}
            >
              <div>
                <div
                  className="font-bayon text-2xl sm:text-3xl md:text-4xl lg:text-[3rem] text-primary leading-none tracking-tight mb-1.5 sm:mb-2 font-mono"
                  style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                >
                  <span className="stat-number-text">
                    {item.prefix ?? ""}0{item.suffix}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-white tracking-[-0.01em] leading-snug">
                  {item.label}
                </h3>
              </div>
              <p className="mt-1 text-[0.6875rem] sm:text-xs text-text-secondary leading-normal">
                {item.sublabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
