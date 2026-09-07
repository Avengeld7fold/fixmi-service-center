"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/lib/i18n/context";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const BAYON_STYLE = { fontFamily: "var(--font-bayon), sans-serif" } as const;

function getCardShadow(x = 0, y = 0) {
  return `${-18 - x * 1.5}px ${28 - y * 1.5}px 60px rgba(0,0,0,0.95), 0 0 35px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.8)`;
}

export default function FaqSection() {
  const { dict } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const photoCardRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const accordionListRef = useRef<HTMLDivElement | null>(null);

  // 3D Tilt via direct DOM mutations (zero re-renders on mousemove)
  const tiltStageRef = useRef<HTMLDivElement | null>(null);
  const tiltBackRef = useRef<HTMLDivElement | null>(null);
  const tiltMainRef = useRef<HTMLDivElement | null>(null);
  const tiltGlareRef = useRef<HTMLDivElement | null>(null);
  const tiltRafRef = useRef<number | null>(null);
  const tiltStateRef = useRef({ x: 0, y: 0, glareX: 50, glareY: 50, opacity: 0 });

  const applyTilt = () => {
    tiltRafRef.current = null;
    const t = tiltStateRef.current;
    if (tiltStageRef.current) {
      tiltStageRef.current.style.transform = `perspective(1200px) rotateY(${-12 + t.x}deg) rotateX(${4 + t.y}deg) skewY(-2deg)`;
    }
    if (tiltBackRef.current) {
      tiltBackRef.current.style.transform = `translateZ(-35px) translateX(${t.x * 0.4}px) translateY(${t.y * 0.4}px)`;
    }
    if (tiltMainRef.current) {
      tiltMainRef.current.style.boxShadow = getCardShadow(t.x, t.y);
    }
    if (tiltGlareRef.current) {
      tiltGlareRef.current.style.opacity = String(t.opacity);
      tiltGlareRef.current.style.background = `radial-gradient(circle at ${t.glareX}% ${t.glareY}%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)`;
    }
  };

  const scheduleTilt = () => {
    if (tiltRafRef.current === null) {
      tiltRafRef.current = requestAnimationFrame(applyTilt);
    }
  };

  useEffect(() => {
    return () => {
      if (tiltRafRef.current !== null) cancelAnimationFrame(tiltRafRef.current);
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        if (photoCardRef.current) {
          tl.from(photoCardRef.current, { y: 36, opacity: 0, scale: 0.96, duration: 0.85, ease: "power3.out" });
        }
        if (titleRef.current) {
          tl.from(titleRef.current, { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.6");
        }
        if (accordionListRef.current) {
          tl.from(
            accordionListRef.current.querySelectorAll(".faq-item-row"),
            { y: 16, opacity: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" },
            "-=0.4"
          );
        }
      });
    },
    { scope: sectionRef }
  );

  const toggleFaq = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    tiltStateRef.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 12,
      y: -((e.clientY - rect.top) / rect.height - 0.5) * 12,
      glareX: ((e.clientX - rect.left) / rect.width) * 100,
      glareY: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.35,
    };
    scheduleTilt();
  };

  const handleMouseLeave = () => {
    tiltStateRef.current = { x: 0, y: 0, glareX: 50, glareY: 50, opacity: 0 };
    scheduleTilt();
  };

  return (
    <section ref={sectionRef} className="relative w-full bg-[#121212] text-white py-12 sm:py-16 lg:py-20 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 lg:gap-x-16 items-start">
          {/* Row 1 (Desktop): Header Title above Accordion */}
          <div className="lg:col-start-6 lg:col-span-7 lg:row-start-1">
            <h2 ref={titleRef} className="font-bayon text-3xl sm:text-4xl lg:text-5xl uppercase text-[#f5f5f5] leading-[0.95] tracking-[-0.01em] mb-6 sm:mb-8" style={BAYON_STYLE}>
              {dict.faq.heading1} <span className="text-primary">{dict.faq.heading2}</span>
            </h2>
          </div>

          {/* Row 2 (Desktop): Left 3D Perspective Card — strictly aligned with Accordion List */}
          <div className="lg:col-start-1 lg:col-span-5 lg:row-start-2 flex items-start justify-center lg:justify-start self-start mb-10 lg:mb-0">
            <div
              ref={photoCardRef}
              className="relative [perspective:1200px] w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] py-2 group cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div
                ref={tiltStageRef}
                className="relative transition-transform duration-200 ease-out"
                style={{
                  transform: "perspective(1200px) rotateY(-12deg) rotateX(4deg) skewY(-2deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Back Wireframe Floating Rectangle */}
                <div
                  ref={tiltBackRef}
                  className="absolute -top-5 -right-5 sm:-top-6 sm:-right-6 w-full h-full rounded-2xl sm:rounded-3xl border border-white/[0.25] pointer-events-none transition-transform duration-200 ease-out"
                  style={{ transform: "translateZ(-35px) translateX(0px) translateY(0px)", boxShadow: "0 0 30px rgba(0,0,0,0.6)" }}
                  aria-hidden="true"
                />

                {/* Main 3D Photo Card */}
                <div
                  ref={tiltMainRef}
                  className="relative z-10 w-full h-[340px] sm:h-[380px] lg:h-[410px] xl:h-[430px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#161619] border border-white/[0.16] transition-shadow duration-200"
                  style={{
                    transform: "translateZ(25px)",
                    transformStyle: "preserve-3d",
                    boxShadow: getCardShadow(),
                  }}
                >
                  <Image
                    src="/images/admin1.webp"
                    alt="Kepuasan Pelanggan Layanan Servis FIXMI"
                    fill
                    priority={false}
                    className="object-cover object-center scale-105 transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 340px, (max-width: 1024px) 380px, 420px"
                  />
                  {/* Sheen reflection */}
                  <div
                    ref={tiltGlareRef}
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{
                      opacity: 0,
                      background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 (Desktop): Right FAQ Accordion List */}
          <div className="lg:col-start-6 lg:col-span-7 lg:row-start-2 flex flex-col justify-start">
            <div ref={accordionListRef} className="w-full border-t border-white/[0.08] font-sans">
              {dict.faq.items.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div key={item.id} className="faq-item-row border-b border-white/[0.08] transition-colors duration-200 hover:border-white/[0.16]">
                    <button
                      type="button"
                      id={`faq-btn-${item.id}`}
                      onClick={() => toggleFaq(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${item.id}`}
                      className="w-full py-5 sm:py-6 flex items-center justify-between text-left group transition-transform duration-150 active:scale-[0.995] cursor-pointer"
                    >
                      <span className="text-sm sm:text-base lg:text-base xl:text-lg text-[#e0e0e0] group-hover:text-white font-medium pr-4 transition-colors duration-200 leading-snug">
                        {item.question}
                      </span>
                      
                      <span
                        className={`shrink-0 w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] group-hover:border-white/[0.2] flex items-center justify-center text-neutral-400 group-hover:text-white transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isOpen ? "rotate-45 text-primary border-primary/40 bg-primary/10" : ""
                        }`}
                        aria-hidden="true"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                          <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>

                    <div
                      id={`faq-panel-${item.id}`}
                      role="region"
                      aria-labelledby={`faq-btn-${item.id}`}
                      className={`grid transition-[grid-template-rows,opacity] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isOpen ? "grid-rows-[1fr] opacity-100 pb-5 sm:pb-6" : "grid-rows-[0fr] opacity-0 pb-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className={`text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed pr-6 max-w-xl transition-transform duration-250 ease-out ${isOpen ? "translate-y-0" : "-translate-y-1.5"}`}>
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
