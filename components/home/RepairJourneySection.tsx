"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/lib/i18n/context";
import { whatsappUrl } from "@/lib/constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface JourneyStep {
  stepNumber: string;
  tabLabel: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetRotate: number;
  targetY: number; // in px
  zIndex: number;
}

export default function RepairJourneySection() {
  const { dict } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyTrackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);

  // Memoized: hanya dibuat ulang jika bahasa (dict) berubah — bukan setiap render
  const repairSteps: JourneyStep[] = useMemo(() => [
    {
      stepNumber: "01.",
      tabLabel: dict.journey.step1Tag,
      title: dict.journey.step1Title,
      description: dict.journey.step1Desc,
      imageUrl: "/images/teknisi-1.webp",
      targetRotate: -4.5,
      targetY: -12,
      zIndex: 10,
    },
    {
      stepNumber: "02.",
      tabLabel: dict.journey.step2Tag,
      title: dict.journey.step2Title,
      description: dict.journey.step2Desc,
      imageUrl: "/images/customer1.webp",
      targetRotate: 3.2,
      targetY: 24,
      zIndex: 20,
    },
    {
      stepNumber: "03.",
      tabLabel: dict.journey.step3Tag,
      title: dict.journey.step3Title,
      description: dict.journey.step3Desc,
      imageUrl: "/images/iphone-depth.png",
      targetRotate: -3.0,
      targetY: 4,
      zIndex: 30,
    },
    {
      stepNumber: "04.",
      tabLabel: dict.journey.step4Tag,
      title: dict.journey.step4Title,
      description: dict.journey.step4Desc,
      imageUrl: "/images/iphone-fixed.png",
      targetRotate: 6.0,
      targetY: 36,
      zIndex: 40,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [dict]);

  useGSAP(
    () => {
      if (!containerRef.current || !stickyTrackRef.current) return;

      const cards = [card1Ref.current, card2Ref.current, card3Ref.current, card4Ref.current];

      // Desktop Only Pinned Scroll Deck Timeline with Reduced-Motion Guard
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            reduceMotion: boolean;
          };

          if (!isDesktop) return;

          if (reduceMotion) {
            // Accessible fallback: render static fanned-out layout
            repairSteps.forEach((step, idx) => {
              gsap.set(cards[idx], {
                y: `${step.targetY}px`,
                opacity: 1,
                scale: 1,
                rotate: step.targetRotate,
              });
            });
            if (progressLineRef.current) {
              progressLineRef.current.style.width = "100%";
            }
            setActiveStep(4);
            return;
          }

          // Initially: cards start hidden below with natural scale & opacity
          gsap.set(cards[0], { y: "80vh", opacity: 0, scale: 0.96, rotate: -8 });
          gsap.set(cards[1], { y: "80vh", opacity: 0, scale: 0.96, rotate: 6 });
          gsap.set(cards[2], { y: "80vh", opacity: 0, scale: 0.96, rotate: -6 });
          gsap.set(cards[3], { y: "80vh", opacity: 0, scale: 0.96, rotate: 8 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "+=300%",
              pin: stickyTrackRef.current,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const progress = self.progress;
                if (progressLineRef.current) {
                  progressLineRef.current.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
                }
                const stepIndex = Math.min(4, Math.max(1, Math.floor(progress * 4) + 1));
                setActiveStep(stepIndex);
              },
            },
          });

          // ── FASE 1: Judul di tengah fokus penuh ──
          tl.to({}, { duration: 0.6 });

          // ── FASE 2: Kartu 1 meluncur naik miring -4.5deg & y: -12px (Power3 Easing) ──
          tl.to(
            cards[0],
            {
              y: `${repairSteps[0].targetY}px`,
              opacity: 1,
              scale: 1,
              rotate: repairSteps[0].targetRotate,
              ease: "power3.out",
              duration: 1.2,
            },
            "+=0.1"
          );

          // ── FASE 3: Kartu 2 meluncur naik miring +3.2deg & y: +24px ──
          tl.to(
            cards[1],
            {
              y: `${repairSteps[1].targetY}px`,
              opacity: 1,
              scale: 1,
              rotate: repairSteps[1].targetRotate,
              ease: "power3.out",
              duration: 1.2,
            },
            "+=0.2"
          );

          // ── FASE 4: Kartu 3 meluncur naik miring -3.0deg & y: +4px ──
          tl.to(
            cards[2],
            {
              y: `${repairSteps[2].targetY}px`,
              opacity: 1,
              scale: 1,
              rotate: repairSteps[2].targetRotate,
              ease: "power3.out",
              duration: 1.2,
            },
            "+=0.2"
          );

          // ── FASE 5: Kartu 4 meluncur naik miring +6.0deg & y: +36px ──
          tl.to(
            cards[3],
            {
              y: `${repairSteps[3].targetY}px`,
              opacity: 1,
              scale: 1,
              rotate: repairSteps[3].targetRotate,
              ease: "power3.out",
              duration: 1.2,
            },
            "+=0.2"
          );

          // ── FASE 6: Momen penguncian penuh sebelum unpinning ──
          tl.to({}, { duration: 0.6 });
        }
      );

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [mobileActiveStep, setMobileActiveStep] = useState(0);

  const handleMobileScroll = () => {
    if (!mobileScrollRef.current) return;
    const container = mobileScrollRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth + 16
      : 300;
    const activeIndex = Math.min(3, Math.max(0, Math.round(scrollLeft / cardWidth)));
    setMobileActiveStep(activeIndex);
  };

  const scrollToMobileStep = (index: number) => {
    if (!mobileScrollRef.current) return;
    const container = mobileScrollRef.current;
    const cardWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth + 16
      : 300;
    container.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
    setMobileActiveStep(index);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#121212] text-white select-none"
    >
      {/* ── DESKTOP PINNED STICKY STAGE (≥1024px) ── */}
      <div
        ref={stickyTrackRef}
        className="hidden lg:flex relative w-full h-screen items-center justify-center px-4 xl:px-8 overflow-hidden bg-[#121212]"
      >
        {/* ── BACKGROUND LAYER: JUDUL BESAR DI TENGAH LAYAR ── */}
        <div
          ref={headerRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-4xl w-full mx-auto px-4 z-0 pointer-events-none"
        >
          <h2
            className="font-bayon text-4xl xl:text-6xl uppercase text-[#f5f5f5] leading-[0.92] tracking-[-0.01em]"
            style={{ fontFamily: "var(--font-bayon), sans-serif" }}
          >
            {dict.journey.heading}
          </h2>
        </div>

        {/* ── FOREGROUND LAYER: FANNED-OUT TILTED PHYSICAL CARDS (60% TOP / 40% PHOTO BOTTOM) ── */}
        <div className="relative z-10 flex items-center justify-center w-full mx-auto px-4">
          <div className="relative inline-flex items-center">
            {repairSteps.map((step, idx) => {
              const refMapping = [card1Ref, card2Ref, card3Ref, card4Ref];
              const currentCardRef = refMapping[idx];

              return (
                <div
                  key={step.stepNumber}
                  ref={currentCardRef}
                  className={`group relative flex flex-col rounded-lg xl:rounded-xl bg-[#161619] border border-white/[0.16] w-[285px] xl:w-[315px] h-[420px] xl:h-[450px] shrink-0 ${
                    idx > 0 ? "-ml-10 xl:-ml-14" : ""
                  }`}
                  style={{
                    zIndex: step.zIndex,
                    willChange: "transform, opacity",
                    transformOrigin: "center center",
                    boxShadow:
                      "-18px 24px 50px rgba(0,0,0,0.92), 0 0 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  {/* ── CLIPBOARD CLAMP / METAL CLIP DESIGN ── */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
                    {/* Metal Clip Top Loop */}
                    <div className="w-8 h-2 -mb-0.5 rounded-t-full border-t-2 border-x-2 border-white/30 bg-transparent" />

                    {/* Clipboard Metal Clamp Body */}
                    <div className="relative flex items-center gap-2 px-3 py-0.5 rounded-sm bg-gradient-to-b from-[#383840] via-[#232328] to-[#141417] border border-white/25 shadow-[0_3px_8px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.35)]">
                      {/* Left Rivet Hole */}
                      <span className="w-1 h-1 rounded-full bg-[#0e0e11] border border-white/30 shadow-inner shrink-0" />

                      {/* Engraved Clipboard Text */}
                      <span className="text-[8.5px] font-mono font-bold tracking-[0.16em] text-neutral-200 uppercase whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {step.tabLabel}
                      </span>

                      {/* Right Rivet Hole */}
                      <span className="w-1 h-1 rounded-full bg-[#0e0e11] border border-white/30 shadow-inner shrink-0" />
                    </div>
                  </div>

                  {/* ── TOP SECTION: 58% HEIGHT (TYPOGRAPHY & CONTENT - TIGHT & HARMONIOUS) ── */}
                  <div className="h-[58%] px-4 xl:px-5 pt-4 xl:pt-4.5 pb-2 flex flex-col items-center justify-center text-center relative z-10 gap-1.5 -mt-1">
                    <h3
                      className="font-bayon text-[1.45rem] xl:text-[1.75rem] uppercase text-[#f5f5f5] leading-[0.92] tracking-tight group-hover:text-primary transition-colors text-center"
                      style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                    >
                      {step.title}
                    </h3>

                    {/* Big Step Number in Center */}
                    <div
                      className="font-bayon text-3xl xl:text-[2.65rem] text-primary leading-none text-center my-0.5"
                      style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                    >
                      {step.stepNumber}
                    </div>

                    {/* Description Copy Centered */}
                    <p className="text-[10.5px] xl:text-[11.5px] text-neutral-400 uppercase tracking-wide leading-relaxed font-normal text-center max-w-[250px] mx-auto">
                      {step.description}
                    </p>
                  </div>

                  {/* ── WHITE DIVIDER LINE ── */}
                  <div className="w-full h-px bg-white/[0.15] shrink-0" />

                  {/* ── BOTTOM SECTION: 42% HEIGHT (VINTAGE PHOTO FRAME WITH SNUG PROPORTIONS) ── */}
                  <div className="h-[42%] w-full relative bg-[#0d0d10] overflow-hidden rounded-b-lg xl:rounded-b-xl flex items-center justify-center p-2 sm:p-2.5">
                    {step.imageUrl ? (
                      <div className="relative w-full h-full bg-white p-1 sm:p-1.5 rounded-[3px] shadow-[0_8px_20px_rgba(0,0,0,0.55),0_2px_6px_rgba(0,0,0,0.35)] flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]">
                        <div className="relative w-full h-full overflow-hidden rounded-[2px] bg-[#1a1a1e]">
                          <Image
                            src={step.imageUrl}
                            alt={step.title}
                            fill
                            className="object-cover object-center brightness-[0.96] contrast-[1.04]"
                            sizes="(max-width: 1200px) 280px, 320px"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-white/[0.02] to-transparent" />
                    )}
                  </div>
                </div>
              );
            })}

            {/* ── BOTTOM-LEFT STEP PROGRESS DOCK (100% STRICTLY FLUSH-ALIGNED WITH CARD 1 LEFT EDGE) ── */}
            <div className="absolute top-[calc(100%+5.5rem)] xl:top-[calc(100%+6.5rem)] 2xl:top-[calc(100%+8rem)] left-0 z-40 flex items-center pointer-events-auto">
              <div
                role="progressbar"
                aria-valuenow={activeStep}
                aria-valuemin={1}
                aria-valuemax={4}
                aria-label="Progress alur servis"
                className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#161619]/90 border border-white/[0.14] backdrop-blur-md shadow-2xl transition-[border-color,box-shadow] duration-200 ease-out"
              >
                <span className="font-mono text-[11px] text-neutral-400 tracking-wider uppercase">LANGKAH:</span>
                <span
                  className="font-bayon text-xl text-primary leading-none"
                  style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                >
                  0{activeStep} / 04
                </span>
                <div className="w-24 xl:w-28 h-1 bg-white/[0.1] rounded-full overflow-hidden relative">
                  <div
                    ref={progressLineRef}
                    className="h-full bg-primary rounded-full transition-[width] duration-150 ease-out"
                    style={{ width: "25%" }}
                  />
                </div>
              </div>
            </div>

            {/* ── PRE-ANCHORED TILTED CTA BUTTON (STANDBY FROM START, MEETS CARD 4 ON SCROLL) ── */}
            <div
              className="absolute -bottom-5 xl:-bottom-6 -right-2 xl:-right-3 z-50 pointer-events-auto"
              style={{
                transform: "translateY(36px) rotate(-6deg)",
                transformOrigin: "center center",
              }}
            >
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Konsultasi Alur Servis via WhatsApp"
                className="group inline-flex items-center gap-2 px-4 xl:px-4.5 py-1.5 xl:py-2 rounded-full bg-primary text-[#121212] font-bayon text-xs xl:text-sm tracking-wider uppercase transition-[transform,box-shadow,background-color] duration-200 ease-out hover:scale-105 active:scale-[0.97] shadow-[0_8px_20px_rgba(0,0,0,0.85),0_2px_8px_rgba(255,107,0,0.35)] border border-black/20 whitespace-nowrap"
                style={{ fontFamily: "var(--font-bayon), sans-serif" }}
              >
                <span>KONSULTASI SEKARANG</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#121212] transition-transform duration-200 group-hover:scale-125" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE & TABLET LAYOUT (<1024px) (INSPIRED BY DONTBOARDME / APPLE COMPACT FLOW) ── */}
      <div className="lg:hidden relative w-full py-12 sm:py-16 px-4 overflow-hidden bg-[#121212]">
        {/* Mobile/Tablet Centered Header */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 px-2">
          <h2
            className="font-bayon text-3xl sm:text-4xl md:text-5xl uppercase text-[#f5f5f5] leading-[0.95] tracking-[-0.01em]"
            style={{ fontFamily: "var(--font-bayon), sans-serif" }}
          >
            {dict.journey.heading}
          </h2>

          {/* Interactive Step Navigator Pills */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 mt-6 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
            {repairSteps.map((step, idx) => (
              <button
                key={step.stepNumber}
                type="button"
                onClick={() => scrollToMobileStep(idx)}
                className={`px-3 sm:px-4 py-1 rounded-full font-mono text-[11px] sm:text-xs uppercase transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96] ${
                  mobileActiveStep === idx
                    ? "bg-primary text-[#121212] font-bold shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                0{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Swipeable Card Deck Carousel (Fluid Snap Container) */}
        <div
          ref={mobileScrollRef}
          onScroll={handleMobileScroll}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-4 px-[calc(50vw-145px)] sm:px-[calc(50vw-170px)] md:px-[calc(50vw-180px)] snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden items-center"
        >
          {repairSteps.map((step, idx) => {
            const isActive = mobileActiveStep === idx;
            return (
              <div
                key={step.stepNumber}
                className={`group relative flex flex-col rounded-xl bg-[#161619] border w-[290px] sm:w-[340px] h-[430px] sm:h-[460px] shrink-0 snap-center transition-[transform,opacity,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  isActive
                    ? "border-primary/50 shadow-[0_16px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(255,107,0,0.15)] scale-100 opacity-100"
                    : "border-white/[0.12] shadow-xl scale-[0.95] opacity-60"
                }`}
              >
                {/* ── CLIPBOARD CLAMP / METAL CLIP DESIGN (CENTERED) ── */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
                  <div className="w-8 h-2 -mb-0.5 rounded-t-full border-t-2 border-x-2 border-white/30 bg-transparent" />
                  <div className="relative flex items-center gap-2 px-3 py-0.5 rounded-sm bg-gradient-to-b from-[#383840] via-[#232328] to-[#141417] border border-white/25 shadow-[0_3px_8px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.35)]">
                    <span className="w-1 h-1 rounded-full bg-[#0e0e11] border border-white/30 shadow-inner shrink-0" />
                    <span className="text-[8.5px] font-mono font-bold tracking-[0.16em] text-neutral-200 uppercase whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {step.tabLabel}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#0e0e11] border border-white/30 shadow-inner shrink-0" />
                  </div>
                </div>

                {/* ── TOP SECTION: 58% HEIGHT ── */}
                <div className="h-[58%] px-4 sm:px-5 pt-4 sm:pt-5 pb-2 flex flex-col items-center justify-center text-center relative z-10 gap-1.5 -mt-1">
                  <h3
                    className="font-bayon text-[1.45rem] sm:text-[1.75rem] uppercase text-[#f5f5f5] leading-[0.92] tracking-tight group-hover:text-primary transition-colors text-center"
                    style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                  >
                    {step.title}
                  </h3>

                  <div
                    className="font-bayon text-3xl sm:text-[2.65rem] text-primary leading-none text-center my-0.5"
                    style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                  >
                    {step.stepNumber}
                  </div>

                  <p className="text-[10.5px] sm:text-[11.5px] text-neutral-400 uppercase tracking-wide leading-relaxed font-normal text-center max-w-[250px] mx-auto">
                    {step.description}
                  </p>
                </div>

                {/* ── WHITE DIVIDER LINE ── */}
                <div className="w-full h-px bg-white/[0.15] shrink-0" />

                {/* ── BOTTOM SECTION: 42% HEIGHT (VINTAGE PHOTO FRAME WITH SNUG PROPORTIONS) ── */}
                <div className="h-[42%] w-full relative bg-[#0d0d10] overflow-hidden rounded-b-xl flex items-center justify-center p-2 sm:p-2.5">
                  {step.imageUrl ? (
                    <div className="relative w-full h-full bg-white p-1 sm:p-1.5 rounded-[3px] shadow-[0_8px_20px_rgba(0,0,0,0.55),0_2px_6px_rgba(0,0,0,0.35)] flex items-center justify-center">
                      <div className="relative w-full h-full overflow-hidden rounded-[2px] bg-[#1a1a1e]">
                        <Image
                          src={step.imageUrl}
                          alt={step.title}
                          fill
                          className="object-cover object-center brightness-[0.96] contrast-[1.04]"
                          sizes="(max-width: 1024px) 340px, 320px"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-white/[0.02] to-transparent" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Swipe Indicators & Bottom CTA */}
        <div className="mt-6 sm:mt-8 flex flex-col items-center gap-6">
          {/* Active Step Indicator Dots */}
          <div className="flex items-center gap-2">
            {repairSteps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToMobileStep(idx)}
                aria-label={`Buka langkah ${idx + 1}`}
                className={`transition-[width,background-color,transform] duration-200 ease-out active:scale-[0.95] rounded-full ${
                  mobileActiveStep === idx
                    ? "w-7 h-1.5 bg-primary"
                    : "w-2 h-1.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          {/* Bottom WhatsApp CTA */}
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Konsultasi Alur Servis via WhatsApp"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-[#121212] font-bayon text-xs sm:text-sm tracking-wider uppercase shadow-[0_8px_20px_rgba(0,0,0,0.85),0_2px_8px_rgba(255,107,0,0.35)] border border-black/20 transition-[transform,box-shadow] duration-200 ease-out active:scale-[0.97] hover:scale-105"
            style={{ fontFamily: "var(--font-bayon), sans-serif" }}
          >
            <span>KONSULTASI SEKARANG</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#121212]" />
          </a>
        </div>
      </div>
    </div>
  );
}
