"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
import { MessageCircle, Wrench, ShieldCheck, ArrowRight } from "lucide-react";
import CategoryCards from "./CategoryCards";
import ServiceAccordion from "./ServiceAccordion";
import BrandExplorer from "./BrandExplorer";
import WarrantyModal from "./WarrantyModal";
import { useI18n } from "@/lib/i18n/context";
import { whatsappUrl } from "@/lib/constants";
import type { Category } from "@/lib/data";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function PricelistExplorer({
  categories,
  lastUpdated,
  initialCategorySlug,
}: {
  categories: Category[];
  lastUpdated?: string;
  initialCategorySlug?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { dict, getLocalizedPath } = useI18n();
  const [warrantyOpen, setWarrantyOpen] = useState(false);

  // Slugs valid dari data categories
  const slugs = categories.map((c) => c.Slug);

  // Deteksi slug aktif dari:
  // 1. props initialCategorySlug (server segment)
  // 2. pathname (misal /pricelist/iphone atau /en/pricelist/iphone)
  // 3. searchParams ?device=slug (backward compatibility)
  // 4. fallback ke category pertama
  let pathSlug = "";
  const pathParts = pathname.split("/").filter(Boolean);
  const lastPart = pathParts[pathParts.length - 1];
  if (lastPart && slugs.includes(lastPart)) {
    pathSlug = lastPart;
  }

  const legacyParam = searchParams.get("device");
  const activeSlug =
    (initialCategorySlug && slugs.includes(initialCategorySlug) ? initialCategorySlug : "") ||
    pathSlug ||
    (legacyParam && slugs.includes(legacyParam) ? legacyParam : "") ||
    categories[0]?.Slug ||
    "";

  // Backward compatibility: jika user mengakses url lama ?device=slug, redirect mulus ke clean path
  useEffect(() => {
    if (legacyParam && slugs.includes(legacyParam)) {
      router.replace(getLocalizedPath(`/pricelist/${legacyParam}`), { scroll: false });
    }
  }, [legacyParam, slugs, router, getLocalizedPath]);

  const activeCategory = categories.find((c) => c.Slug === activeSlug) ?? categories[0];
  const hasPricingData = Boolean(
    activeCategory &&
      activeCategory.service_types.length > 0 &&
      activeCategory.service_types.some(
        (s) => Array.isArray(s.device_prices) && s.device_prices.length > 0
      )
  );

  const selectCategory = (slug: string) => {
    if (slug === activeSlug) return;
    router.push(getLocalizedPath(`/pricelist/${slug}`), { scroll: false });
  };

  // Entrance header: badge → judul → subtitle (sekali).
  const headerRef = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion() || !headerRef.current) return;
      const [badge, h1, p] = [
        headerRef.current.querySelector("div"),
        headerRef.current.querySelector("h1"),
        headerRef.current.querySelector("p"),
      ];
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(badge, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 })
        .fromTo(h1, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.3")
        .fromTo(p, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.45");
    },
    { scope: headerRef }
  );

  // Entrance kartu kategori (sekali, menyusul header).
  const cardsRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion() || !cardsRef.current) return;
      gsap.fromTo(
        cardsRef.current.querySelectorAll("button"),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out", delay: 0.25 }
      );
    },
    { scope: cardsRef }
  );

  // CTA konversi: fade-in saat masuk viewport.
  const ctaRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion() || !ctaRef.current) return;
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: ctaRef.current, start: "top 92%", once: true },
        }
      );
    },
    { scope: ctaRef }
  );

  // Reveal berjenjang kartu akordeon ([data-reveal]) saat masuk viewport —
  // kartu di atas langsung tampil, yang di bawah menyusul mengikuti scroll
  // (sekali saja per kartu). Di-reset setiap ganti kategori.
  const listRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion() || !listRef.current) return;
      // Hanya kartu level ATAS — kartu bersarang (service di dalam merk/series)
      // dikecualikan: ScrollTrigger hanya recalc saat scroll, sehingga kartu
      // dalam panel yang dibuka tanpa scroll akan tertinggal opacity 0.
      const items = [...listRef.current.querySelectorAll("[data-reveal]")].filter(
        (el) => !el.parentElement?.closest("[data-reveal]")
      );
      if (!items.length) return;
      gsap.set(items, { opacity: 0, y: 14 });
      const batchTriggers = ScrollTrigger.batch(items, {
        start: "top 94%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.06,
            ease: "power2.out",
            clearProps: "opacity,transform",
          }),
      });

      return () => {
        batchTriggers.forEach((st) => st.kill());
      };
    },
    { dependencies: [activeSlug], scope: listRef }
  );

  return (
    <div className="mx-auto w-full max-w-[90rem] px-3 md:px-12 lg:px-16 py-16 lg:py-24">
      {/* ── Header Section — Diagnostic Personality ── */}
      <header ref={headerRef} className="mb-14 lg:mb-20">
        {/* Diagnostic badge — dynamically rendered from backend last modified date */}
        <div className="mb-5 flex items-center gap-2.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          <span
            className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-text-muted"
          >
            {lastUpdated ?? "Update Real-time"}
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-bayon), sans-serif",
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            color: "var(--fixmi-text-primary)",
            textTransform: "uppercase" as const,
          }}
          className="text-[clamp(2.25rem,7vw,3.125rem)] md:text-[clamp(3.125rem,5.5vw,4rem)] lg:text-[clamp(4rem,5vw,4.75rem)]"
        >
          {dict.pricelist.title1}
          <br />
          <span style={{ color: "var(--fixmi-primary)" }}>{dict.pricelist.title2}</span>
        </h1>

        <p
          className="mt-4 sm:mt-5 max-w-[56ch] text-sm sm:text-base leading-relaxed text-text-secondary"
          style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
        >
          {dict.pricelist.description}
        </p>

        {/* Ketentuan Garansi Service — buka modal S&K */}
        <button
          type="button"
          onClick={() => setWarrantyOpen(true)}
          className="group mt-5 sm:mt-6 inline-flex items-center gap-2 sm:gap-2.5 rounded-[10px] border border-panel-border bg-panel px-3.5 py-2.5 sm:px-4 sm:py-3 text-left transition-colors hover:border-primary"
        >
          <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="text-xs sm:text-sm font-medium text-foreground">
            {dict.pricelist.warrantyDetailsBtn}
          </span>
          <span className="font-mono text-[0.625rem] sm:text-[0.6875rem] uppercase tracking-widest text-primary transition-transform duration-300 ease-out group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </header>

      {/* Kartu kategori */}
      <div ref={cardsRef} className="mb-14 lg:mb-20">
        <CategoryCards
          categories={categories}
          activeSlug={activeSlug}
          onSelect={selectCategory}
        />
      </div>

      {/* Daftar jenis service / empty-state. Service ber-Brand (pola Android
          fixmibali.com) dirender bertingkat Merk → Series → service; service
          tanpa Brand tetap daftar akordeon datar. Keduanya bisa hidup
          berdampingan dalam satu kategori. */}
      <div key={activeSlug} ref={listRef}>
        {hasPricingData ? (
          <>
            {activeCategory.service_types.some((s) => s.Brand) && (
              <BrandExplorer
                services={activeCategory.service_types.filter(
                  (s) => s.Brand && Array.isArray(s.device_prices) && s.device_prices.length > 0
                )}
                categoryName={activeCategory.Name}
                brandIcons={activeCategory.brand_icons}
              />
            )}
            {activeCategory.service_types.some((s) => !s.Brand) && (
              <div className={activeCategory.service_types.some((s) => s.Brand) ? "mt-2.5 lg:mt-4" : ""}>
                <ServiceAccordion
                  services={activeCategory.service_types.filter(
                    (s) => !s.Brand && Array.isArray(s.device_prices) && s.device_prices.length > 0
                  )}
                  categoryName={activeCategory.Name}
                />
              </div>
            )}
          </>
        ) : (
          /* ── Ultra-Clean Snug Banner (Model 1: Minimalist, No AI Slop, In Harmony with Category Cards) ── */
          <div className="relative overflow-hidden rounded-[16px] lg:rounded-[20px] border border-panel-border bg-panel p-5 sm:p-6 lg:py-7 lg:px-8 transition-colors duration-200">
            <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                {/* Status Pill Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[0.6875rem] font-mono tracking-wider text-neutral-300 uppercase mb-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{dict.pricelist.emptyTitle}</span>
                </div>

                <h3
                  className="font-bayon text-xl sm:text-2xl lg:text-[1.75rem] text-white uppercase tracking-tight leading-tight"
                  style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                >
                  {dict.locale === "en" ? (
                    <>
                      {activeCategory?.Name ?? "Device"} Price List{" "}
                      <span className="text-primary">Coming Soon</span>
                    </>
                  ) : (
                    <>
                      Daftar Harga {activeCategory?.Name ?? "Perangkat"}{" "}
                      <span className="text-primary">Belum Tersedia</span>
                    </>
                  )}
                </h3>

                <p
                  className="mt-2 text-xs sm:text-sm leading-relaxed text-text-secondary max-w-xl"
                  style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
                >
                  {dict.pricelist.emptyDescription}
                </p>
              </div>

              {/* Direct WhatsApp Action Button */}
              <a
                href={whatsappUrl(
                  dict.locale === "en"
                    ? `Hello FIXMI Service Center, I would like to inquire about repair costs for ${activeCategory?.Name ?? "Gadget"}:\n\n• Model: \n• Issue / Damage: `
                    : `Halo FIXMI Service Center, saya ingin menanyakan estimasi biaya servis untuk kategori ${activeCategory?.Name ?? "Gadget"}:\n\n• Tipe / Model: \n• Kendala / Kerusakan: `
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2.5 rounded-xl bg-primary px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-white tracking-[-0.01em] transition-all duration-150 ease-out hover:bg-primary-light hover:brightness-105 active:scale-[0.98] shadow-[0_4px_16px_rgba(255,107,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <MessageCircle className="h-4 w-4 text-white stroke-[2]" aria-hidden="true" />
                <span>{dict.pricelist.emptyCtaBtn}</span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-white/80 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-white"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── CTA Konversi — Snug Banner Style (Seragam dengan Model 1, HANYA tampil bila daftar layanan ADA di atasnya) ── */}
      {hasPricingData && (
        <div
          ref={ctaRef}
          className="relative mt-10 sm:mt-14 md:mt-16 lg:mt-20 overflow-hidden rounded-[16px] lg:rounded-[20px] border border-panel-border bg-panel p-5 sm:p-6 lg:py-7 lg:px-8 transition-colors duration-200"
        >
          <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              {/* Status Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[0.6875rem] font-mono tracking-wider text-neutral-300 uppercase mb-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{dict.pricelist.unlistedBadge}</span>
              </div>

              <h3
                className="font-bayon text-xl sm:text-2xl lg:text-[1.75rem] text-white uppercase tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-bayon), sans-serif" }}
              >
                {dict.locale === "en" ? (
                  <>
                    Device Model{" "}
                    <span className="text-primary">Not Listed Above?</span>
                  </>
                ) : (
                  <>
                    Tipe Perangkat Anda{" "}
                    <span className="text-primary">Belum Tercantum di Atas?</span>
                  </>
                )}
              </h3>

              <p
                className="mt-2 text-xs sm:text-sm leading-relaxed text-text-secondary max-w-xl"
                style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
              >
                {dict.pricelist.unlistedDescription}
              </p>
            </div>

            {/* Direct WhatsApp Action Button */}
            <a
              href={whatsappUrl(
                dict.locale === "en"
                  ? `Hello FIXMI Service Center, my device model is not listed in the website pricelist. I would like to inquire about repair costs:\n\n• Category: ${activeCategory?.Name ?? "Gadget"}\n• Device Model: \n• Issue / Damage: `
                  : `Halo FIXMI Service Center, tipe perangkat saya belum ada di daftar harga website. Saya mau tanya estimasi biaya servis:\n\n• Kategori: ${activeCategory?.Name ?? "Gadget"}\n• Tipe / Seri Model: \n• Kendala / Kerusakan: `
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2.5 rounded-xl bg-primary px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-white tracking-[-0.01em] transition-all duration-150 ease-out hover:bg-primary-light hover:brightness-105 active:scale-[0.98] shadow-[0_4px_16px_rgba(255,107,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <MessageCircle className="h-4 w-4 text-white stroke-[2]" aria-hidden="true" />
              <span>{dict.pricelist.unlistedCtaBtn}</span>
              <ArrowRight
                className="h-3.5 w-3.5 text-white/80 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-white"
                strokeWidth={2}
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      )}

      <WarrantyModal open={warrantyOpen} onClose={() => setWarrantyOpen(false)} />
    </div>
  );
}
