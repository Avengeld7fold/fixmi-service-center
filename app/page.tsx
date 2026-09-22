"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import WaveDividerSection from "@/components/home/WaveDividerSection";

// ponytail: code-split Three.js & R3F (841KB) — loads asynchronously without blocking initial HTML & LCP text
const Hero3D = dynamic(() => import("@/components/Hero3D"), {
  ssr: false,
});
import { useRef, useState, useEffect, useCallback, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/lib/i18n/context";
import { whatsappUrl, SOCIAL_LINKS } from "@/lib/constants";

const heroTitleStyle = (lineHeight: number): CSSProperties => ({
  fontFamily: "var(--font-bayon), sans-serif",
  fontWeight: 400,
  lineHeight,
  letterSpacing: "-0.01em",
  color: "var(--fixmi-primary)",
  textTransform: "uppercase",
  margin: 0,
});

const ICON_SIZE = "w-[1.125rem] h-[1.125rem]";

const HERO_SOCIALS: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: "Instagram",
    href: SOCIAL_LINKS.instagram,
    icon: (
      <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: SOCIAL_LINKS.tiktok,
    icon: (
      <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.12v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.51a8.27 8.27 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.92z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: whatsappUrl(),
    icon: (
      <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
];

export default function Home() {
  const { dict, locale } = useI18n();
  const leftTitleRef = useRef<HTMLHeadingElement>(null);
  const rightTitle1Ref = useRef<HTMLHeadingElement>(null);
  const rightTitle2Ref = useRef<HTMLHeadingElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  const [load3D, setLoad3D] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const load3DTimerRef = useRef<number | null>(null);
  const handleHeroReady = useCallback(() => setHeroReady(true), []);

  const activate3D = useCallback(() => {
    if (load3D || load3DTimerRef.current !== null) return;

    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (
      window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches ||
      nav.connection?.saveData ||
      (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
      (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4)
    ) return;

    load3DTimerRef.current = window.setTimeout(() => {
      load3DTimerRef.current = null;
      setLoad3D(true);
    }, 650);
  }, [load3D]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const updateVisibility = (visible: boolean) => {
      setHeroVisible(visible && document.visibilityState === "visible");
    };
    const observer = new IntersectionObserver(([entry]) => updateVisibility(entry.isIntersecting));
    observer.observe(hero);
    const onVisibilityChange = () => updateVisibility(hero.getBoundingClientRect().bottom > 0 && hero.getBoundingClientRect().top < window.innerHeight);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => () => {
    if (load3DTimerRef.current !== null) window.clearTimeout(load3DTimerRef.current);
  }, []);

  useGSAP(() => {
    if (!leftTitleRef.current || !rightTitle1Ref.current || !rightTitle2Ref.current || !captionRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.7 } });

    tl.fromTo(leftTitleRef.current.querySelectorAll(".line-anim"),
      { y: 12 },
      { y: 0, stagger: 0.1 }
    )
    .fromTo([rightTitle1Ref.current, rightTitle2Ref.current],
      { y: 12 },
      { y: 0, stagger: 0.1 },
      "-=0.55"
    )
    .fromTo(captionRef.current,
      { y: 8 },
      { y: 0 },
      "-=0.55"
    );
  });

  return (
    <>
      <section ref={heroRef} className="relative flex min-h-hero items-center justify-center">
        {/* Background gradient orbs — desktop only */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="absolute left-1/4 top-1/4 h-[31.25rem] w-[31.25rem] rounded-full bg-primary/5 blur-[7.5rem]" />
          <div className="absolute right-1/4 bottom-1/4 h-[25rem] w-[25rem] rounded-full bg-accent/4 blur-[6.25rem]" />
        </div>

        {/* Ambient Stage Glow */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          <div className="w-[36rem] sm:w-[50rem] h-[28rem] sm:h-[38rem] rounded-full bg-primary/[0.07] blur-[100px] sm:blur-[140px]" />
        </div>

        {/* Keep the phone as the initial visual; WebGL is an opt-in desktop enhancement. */}
        <div
          className="absolute inset-x-0 -top-[4.5rem] -bottom-20 sm:-bottom-28 md:-bottom-36 lg:-bottom-44 z-0"
          onPointerMove={(event) => {
            if (event.pointerType === "mouse") activate3D();
          }}
        >
          <div className={`absolute inset-x-0 top-[4.5rem] bottom-20 sm:bottom-28 md:bottom-36 lg:bottom-44 flex items-center justify-center transition-opacity duration-300 ${heroReady ? "opacity-0" : "opacity-100"}`}>
            <Image src="/images/iphone-broken.webp" alt="" aria-hidden="true" width={2000} height={1500} sizes="(max-width: 767px) 100vw, 80vw" loading="eager" fetchPriority="high" className="h-auto w-full max-w-full object-contain md:h-full md:w-auto" />
          </div>
          {load3D ? <Hero3D active={heroVisible} onReady={handleHeroReady} /> : null}
        </div>

        {/* Content overlay — pointer-events-none lets mouse interact with Canvas */}
        <div className="relative z-10 w-full max-w-[90rem] mx-auto px-3 sm:px-4 md:px-12 lg:px-16 min-h-hero flex flex-col justify-between py-6 sm:py-10 pointer-events-none box-border">
          <div className="h-2 md:h-6 lg:h-12" />

          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 sm:gap-6 md:gap-0">
            {/* Left — Big Title */}
            <div className="md:col-span-3 flex flex-col justify-start items-center text-center md:items-start md:text-left md:self-start">
              <h1
                ref={leftTitleRef}
                className="font-bayon text-[clamp(2.25rem,9.5vw,3.125rem)] md:text-[clamp(3.25rem,4.5vw,4.25rem)] lg:text-[clamp(4.5rem,5vw,5.75rem)] xl:text-[clamp(5.75rem,5.5vw,6.75rem)] leading-none"
                style={heroTitleStyle(0.9)}
              >
                <span className="block line-anim">
                  {locale === "en" ? "DEVICE" : "HP KAMU"}
                </span>
                <span className="block line-anim">
                  {locale === "en" ? "BROKEN?" : "RUSAK?"}
                </span>
              </h1>
            </div>

            {/* Center — 3D iPhone stage */}
            <div className="md:col-span-6 flex items-center justify-center w-full min-h-[15rem] sm:min-h-[18rem] md:min-h-[22rem] lg:min-h-[31.25rem]" />

            {/* Right — Subtitle + Titles */}
            <div className="md:col-span-3 flex flex-col justify-end items-center md:items-end text-center md:text-right md:translate-y-8">
              <p
                ref={captionRef}
                className="text-center md:text-right text-[0.75rem] sm:text-[0.8125rem] lg:text-[0.6875rem] mb-2 md:mb-3 tracking-[0.15em] leading-relaxed"
                style={{
                  fontFamily: "var(--font-neue-montreal), sans-serif",
                  fontWeight: 500,
                  color: "var(--fixmi-text-secondary)",
                  textTransform: "uppercase",
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
                style={heroTitleStyle(0.85)}
              >
                {dict.hero.titleSolusinya1}
              </h2>
              <h2
                ref={rightTitle2Ref}
                className="font-bayon text-[clamp(2.25rem,9.5vw,3.125rem)] md:text-[clamp(3.25rem,4.5vw,4.25rem)] lg:text-[clamp(4.5rem,5vw,5.75rem)] xl:text-[clamp(5.75rem,5.5vw,6.75rem)] leading-none"
                style={heroTitleStyle(0.85)}
              >
                {dict.hero.titleSolusinya2}
              </h2>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 pointer-events-auto mt-4 sm:mt-6 md:mt-0 md:-translate-y-14">
            {HERO_SOCIALS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-full border border-border text-text-secondary transition-all duration-300 hover:scale-110 hover:border-primary hover:text-primary"
                aria-label={label}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </section>

      <WaveDividerSection />
    </>
  );
}
