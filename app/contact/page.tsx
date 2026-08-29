import type { Metadata } from "next";
import ServiceRequestForm from "@/components/contact/ServiceRequestForm";
import StoreLocator from "@/components/contact/StoreLocator";

export const metadata: Metadata = {
  title: "Lokasi & Kontak — 3 Outlet Service Center FIXMI di Bali",
  description:
    "Kunjungi 3 outlet resmi FIXMI Bali di Kedonganan (Kuta), Jimbaran (Taman Griya), dan Denpasar (Teuku Umar). Konsultasi online via WhatsApp dan form perbaikan.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Lokasi & Kontak — 3 Outlet Service Center FIXMI di Bali",
    description:
      "Alamat lengkap, rute Google Maps, dan kontak WhatsApp 3 gerai FIXMI Service Center di Bali.",
    url: "/contact",
    images: [
      {
        url: "/images/faq-portrait.jpg",
        width: 1200,
        height: 630,
        alt: "Lokasi Outlet FIXMI Bali",
      },
    ],
  },
};

const SECTION = "mx-auto w-full max-w-[80rem] px-4 sm:px-6 md:px-10 lg:px-14";
const DISPLAY = "var(--font-bayon), sans-serif";

export default function ContactPage() {
  return (
    <>
      {/* Request service */}
      <section className={`${SECTION} pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 md:pb-20 flex flex-col items-center`}>
        <div className="w-full max-w-3xl mx-auto mb-6 sm:mb-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[0.7rem] sm:text-xs font-mono tracking-wider text-neutral-300 uppercase mb-3 sm:mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>KONSULTASI & PERBAIKAN</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] uppercase leading-[1.05] text-[#f5f5f5] tracking-[-0.01em]"
            style={{ fontFamily: DISPLAY }}
          >
            HUBUNGI KAMI & <span className="text-primary">REQUEST SERVIS</span>
          </h1>
          <p className="mt-2.5 sm:mt-3.5 max-w-[54ch] text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary mx-auto">
            Kirimkan rincian kendala perangkat Anda. Teknisi kami akan segera memberikan estimasi biaya dan durasi perbaikan.
          </p>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          <ServiceRequestForm />
        </div>
      </section>

      {/* Store locator */}
      <section className="border-t border-white/[0.08] bg-[#121212]">
        <div className={`${SECTION} pt-12 sm:pt-16 md:pt-20 pb-12`}>
          <div className="max-w-3xl mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[0.7rem] sm:text-xs font-mono tracking-wider text-neutral-300 uppercase mb-3 sm:mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>3 OUTLET DI BALI</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] uppercase leading-[1.05] text-[#f5f5f5] tracking-[-0.01em]"
              style={{ fontFamily: DISPLAY }}
            >
              KUNJUNGI <span className="text-primary">OUTLET KAMI</span>
            </h2>
            <p className="mt-2.5 sm:mt-3.5 max-w-[50ch] text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary">
              Tersedia 3 outlet resmi di Bali. Pilih lokasi untuk melihat alamat lengkap, jam buka, dan rute Google Maps.
            </p>
          </div>

          <StoreLocator />

          {/* Minimal Copyright Bar */}
          <div className="mt-12 sm:mt-16 border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <p>© {new Date().getFullYear()} FIXMI Service Center. All rights reserved.</p>
            <div className="flex items-center gap-4 text-neutral-400">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">TikTok</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Facebook</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
