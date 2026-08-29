import type { Metadata } from "next";
import { Suspense } from "react";
import PromoViewer from "@/components/promo/PromoViewer";
import { getPromoItems } from "@/lib/promo-server";

// Dibaca langsung dari backend / filesystem tiap request → sinkron otomatis saat upload gambar promo (§7.2).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Promo & Penawaran Spesial Service — FIXMI Bali",
  description:
    "Nikmati program promo dan penawaran spesial perbaikan gadget di FIXMI Bali. Garansi resmi, diagnosa gratis, dan suku cadang berkualitas.",
  alternates: {
    canonical: "/promo",
  },
  openGraph: {
    title: "Promo & Penawaran Spesial Service — FIXMI Bali",
    description:
      "Dapatkan potongan harga dan penawaran terbaik perbaikan iPhone, Android, MacBook & iPad di 3 gerai FIXMI Bali.",
    url: "/promo",
  },
};

export default async function PromoPage() {
  const promos = await getPromoItems();

  return (
    <main className="min-h-screen bg-[#121212] text-foreground pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-28">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        
        {/* ── Header Section (Consistent with Pricelist) ── */}
        <header className="mb-12 lg:mb-16">
          <div className="mb-5 flex items-center gap-2.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            <span
              className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-text-muted"
            >
              PROMO &amp; PENAWARAN SPESIAL
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
            Promo Eksklusif
            <br />
            <span style={{ color: "var(--fixmi-primary)" }}>Layanan Service</span>
          </h1>

          <p
            className="mt-6 max-w-[46ch] text-sm md:text-base leading-relaxed text-text-secondary"
            style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
          >
            Informasi penawaran khusus dan promo layanan service perangkat pintar di seluruh outlet FIXMI Bali.
          </p>
        </header>

        {/* ── Dynamic Promo Cards ── */}
        <Suspense fallback={null}>
          <PromoViewer promos={promos} />
        </Suspense>

      </div>
    </main>
  );
}
