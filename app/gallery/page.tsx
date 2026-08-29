import type { Metadata } from "next";
import { Suspense } from "react";
import GalleryViewer from "@/components/gallery/GalleryViewer";
import { getGalleryImages } from "@/lib/gallery-server";

// Dibaca langsung dari backend / filesystem tiap request → sinkron otomatis saat upload (§7.2).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeri Dokumentasi Hasil Perbaikan — FIXMI Bali",
  description:
    "Lihat dokumentasi visual hasil perbaikan gadget di FIXMI Bali: rekondisi layar LCD, penggantian baterai, mikrosolder logic board, dan pemulihan hardware.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Galeri Dokumentasi Hasil Perbaikan — FIXMI Bali",
    description:
      "Dokumentasi nyata hasil kerja teknisi bersertifikasi FIXMI Bali untuk iPhone, iPad, MacBook, dan Android.",
    url: "/gallery",
  },
};

export default async function GalleryPage() {
  const images = await getGalleryImages();

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
              PORTOFOLIO DOKUMENTASI
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
            Galeri Repair
            <br />
            <span style={{ color: "var(--fixmi-primary)" }}>Dokumentasi Servis</span>
          </h1>

          <p
            className="mt-6 max-w-[46ch] text-sm md:text-base leading-relaxed text-text-secondary"
            style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
          >
            Dokumentasi visual proses dan hasil perbaikan nyata dari laboratorium teknisi FIXMI Bali.
          </p>
        </header>

        {/* ── Dynamic Photo-Only Gallery Grid ── */}
        <Suspense fallback={null}>
          <GalleryViewer images={images} />
        </Suspense>

      </div>
    </main>
  );
}
