"use client";

import { useI18n } from "@/lib/i18n/context";
import PromoViewer from "@/components/promo/PromoViewer";
import type { PromoImageItem } from "@/lib/promo-server";

interface PromoPageContentProps {
  promos: PromoImageItem[];
}

export default function PromoPageContent({ promos }: PromoPageContentProps) {
  const { dict, locale } = useI18n();
  const isEn = locale === "en";

  return (
    <main className="min-h-screen bg-[#121212] text-foreground pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-28">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        {/* ── Header Section ── */}
        <header className="mb-12 lg:mb-16">
          <div className="mb-5 flex items-center gap-2.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-text-muted">
              {dict.promo.badge}
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
            {isEn ? "EXCLUSIVE PROMOS" : "PROMO EKSKLUSIF"}
            <br />
            <span style={{ color: "var(--fixmi-primary)" }}>
              {isEn ? "SPECIAL OFFERS" : "LAYANAN SERVICE"}
            </span>
          </h1>

          <p
            className="mt-6 max-w-[46ch] text-sm md:text-base leading-relaxed text-text-secondary"
            style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
          >
            {dict.promo.subtitle}
          </p>
        </header>

        {/* ── Dynamic Photo-Only Promo Grid ── */}
        <PromoViewer promos={promos} />
      </div>
    </main>
  );
}
