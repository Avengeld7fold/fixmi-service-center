"use client";

import Hero3D from "@/components/Hero3D";
import WaveDividerSection from "@/components/home/WaveDividerSection";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/lib/i18n/context";
import { whatsappUrl } from "@/lib/constants";

export default function Home() {
  const { dict, locale } = useI18n();
  const leftTitleRef = useRef<HTMLHeadingElement>(null);
  const rightTitle1Ref = useRef<HTMLHeadingElement>(null);
  const rightTitle2Ref = useRef<HTMLHeadingElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    if (!leftTitleRef.current || !rightTitle1Ref.current || !rightTitle2Ref.current || !captionRef.current) return;
    const leftLines = leftTitleRef.current.querySelectorAll(".line-anim");

    const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.8 } });

    // 1. Left Title lines (HP KAMU -> RUSAK?)
    tl.fromTo(leftLines,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.25 }
    )
    // 2. Right Title lines (FIXMI BALI -> SOLUSINYA!)
    .fromTo([rightTitle1Ref.current, rightTitle2Ref.current],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.25 },
      "-=1.3"
    )
    // 3. Caption (YOUR TRUSTED...)
    .fromTo(captionRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0 },
      "-=1.3"
    );
  });

  return (
    <>
      {/* Hero Section with cursor-none to hide browser pointer */}
      <section className="relative flex min-h-hero items-center justify-center cursor-none">
        {/* Background gradient orbs — desktop only; di layar kecil tampak sebagai banding kotak samar */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="absolute left-1/4 top-1/4 h-[31.25rem] w-[31.25rem] rounded-full bg-primary/5 blur-[7.5rem]" />
          <div className="absolute right-1/4 bottom-1/4 h-[25rem] w-[25rem] rounded-full bg-accent/4 blur-[6.25rem]" />
        </div>

        {/* Ambient Stage Glow — Simetris di belakang iPhone, memudar alami tanpa memotong batas bawah section */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          <div className="w-[36rem] sm:w-[50rem] h-[28rem] sm:h-[38rem] rounded-full bg-primary/[0.07] blur-[100px] sm:blur-[140px]" />
        </div>

        {/* WebGL Canvas backdrop. ABSOLUTE — ikut menggulir bersama hero.
            -top-[4.5rem]: menembus ke belakang navbar.
            -bottom-20~44: meluas ke belakang wave divider agar fluid sim
            aktif & terlihat sampai akhir wave. iPhone tetap ukuran asli
            karena shader menggunakan uPhoneAspect (window viewport). */}
        <div className="absolute inset-x-0 -top-[4.5rem] -bottom-20 sm:-bottom-28 md:-bottom-36 lg:-bottom-44 z-0">
          <Hero3D />
        </div>

        {/* Content grid sitting on top - pointer-events-none lets mouse interact with Canvas below */}
        {/* Content & Layout Container (min-h fills the section, aligning elements properly) */}
        <div className="relative z-10 w-full max-w-[90rem] mx-auto px-3 sm:px-4 md:px-12 lg:px-16 min-h-hero flex flex-col justify-between py-6 sm:py-10 pointer-events-none box-border">
          
          {/* Top Spacer to balance the layout and keep the grid centered vertically */}
          <div className="h-2 md:h-6 lg:h-12" />

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 sm:gap-6 md:gap-0">

            {/* Left Column — Big Title (poster terpusat di mobile, kiri di desktop/tablet) */}
            <div className="md:col-span-3 flex flex-col justify-start items-center text-center md:items-start md:text-left md:self-start">
              <h1
                ref={leftTitleRef}
                className="font-bayon text-[clamp(2.25rem,9.5vw,3.125rem)] md:text-[clamp(3.25rem,4.5vw,4.25rem)] lg:text-[clamp(4.5rem,5vw,5.75rem)] xl:text-[clamp(5.75rem,5.5vw,6.75rem)] leading-none"
                style={{
                  fontFamily: "var(--font-bayon), sans-serif",
                  fontWeight: 400,
                  lineHeight: 0.9,
                  letterSpacing: "-0.01em",
                  color: "var(--fixmi-primary)",
                  textTransform: "uppercase" as const,
                  margin: 0,
                }}
              >
                <span className="block line-anim" style={{ opacity: 0 }}>
                  {locale === "en" ? "DEVICE" : "HP KAMU"}
                </span>
                <span className="block line-anim" style={{ opacity: 0 }}>
                  {locale === "en" ? "BROKEN?" : "RUSAK?"}
                </span>
              </h1>
            </div>

            {/* Center Column — 6-Column Stage for 3D iPhone canvas backdrop */}
            <div className="md:col-span-6 flex items-center justify-center w-full min-h-[15rem] sm:min-h-[18rem] md:min-h-[22rem] lg:min-h-[31.25rem]" />

            {/* Right Column — Subtitle (Top) + Big Title (FIXMI BALI & SOLUSINYA!) */}
            <div className="md:col-span-3 flex flex-col justify-end items-center md:items-end text-center md:text-right md:translate-y-8">
              {/* Subtitle placed consistently ABOVE "FIXMI BALI" — zero layout jump on resize */}
              <p
                ref={captionRef}
                className="text-center md:text-right text-[0.75rem] sm:text-[0.8125rem] lg:text-[0.6875rem] mb-2 md:mb-3 tracking-[0.15em] leading-relaxed"
                style={{
                  fontFamily: "var(--font-neue-montreal), sans-serif",
                  fontWeight: 500,
                  color: "var(--fixmi-text-secondary)",
                  textTransform: "uppercase" as const,
                  opacity: 0,
                }}
              >
                {dict.hero.subtitlePrefix}{" "}
                <br className="block md:hidden" />
                {dict.hero.subtitleMiddle}{" "}
                <br className="block md:hidden" />
                {dict.hero.subtitleSuffix}
              </p>

              <h2
                ref={rightTitle1Ref}
                className="font-bayon text-[clamp(2.25rem,9.5vw,3.125rem)] md:text-[clamp(3.25rem,4.5vw,4.25rem)] lg:text-[clamp(4.5rem,5vw,5.75rem)] xl:text-[clamp(5.75rem,5.5vw,6.75rem)] leading-none"
                style={{
                  fontFamily: "var(--font-bayon), sans-serif",
                  fontWeight: 400,
                  lineHeight: 0.85,
                  letterSpacing: "-0.01em",
                  color: "var(--fixmi-primary)",
                  textTransform: "uppercase" as const,
                  margin: 0,
                  opacity: 0,
                }}
              >
                {dict.hero.titleSolusinya1}
              </h2>

              <h2
                ref={rightTitle2Ref}
                className="font-bayon text-[clamp(2.25rem,9.5vw,3.125rem)] md:text-[clamp(3.25rem,4.5vw,4.25rem)] lg:text-[clamp(4.5rem,5vw,5.75rem)] xl:text-[clamp(5.75rem,5.5vw,6.75rem)] leading-none"
                style={{
                  fontFamily: "var(--font-bayon), sans-serif",
                  fontWeight: 400,
                  lineHeight: 0.85,
                  letterSpacing: "-0.01em",
                  color: "var(--fixmi-primary)",
                  textTransform: "uppercase" as const,
                  margin: 0,
                  opacity: 0,
                }}
              >
                {dict.hero.titleSolusinya2}
              </h2>
            </div>
          </div>

          {/* Social Media Icons — Bottom Left (placed inside the same max-w container as a normal layout flow child to guarantee 100% perfect vertical alignment with the text padding) */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 pointer-events-auto mt-4 sm:mt-6 md:mt-0 md:-translate-y-14">
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-11 h-11 rounded-full border border-border text-text-secondary transition-all duration-300 hover:scale-110 hover:border-primary hover:text-primary"
              aria-label="Instagram"
            >
              <svg className="w-[1.125rem] h-[1.125rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-11 h-11 rounded-full border border-border text-text-secondary transition-all duration-300 hover:scale-110 hover:border-primary hover:text-primary"
              aria-label="TikTok"
            >
              <svg className="w-[1.125rem] h-[1.125rem]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.12v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.51a8.27 8.27 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.92z" />
              </svg>
            </a>
            {/* WhatsApp */}
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-11 h-11 rounded-full border border-border text-text-secondary transition-all duration-300 hover:scale-110 hover:border-primary hover:text-primary"
              aria-label="WhatsApp"
            >
              <svg className="w-[1.125rem] h-[1.125rem]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Wave Divider + Content Section (#121212 → #0B0B0D) ── */}
      <WaveDividerSection />
    </>
  );
}
