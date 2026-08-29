import type { Metadata } from "next";
import AboutHeroEditorial from "@/components/about/AboutHeroEditorial";
import AboutStatsBand from "@/components/about/AboutStatsBand";
import AboutJourneyTimeline from "@/components/about/AboutJourneyTimeline";
import AboutCtaBanner from "@/components/about/AboutCtaBanner";

export const metadata: Metadata = {
  title: "Tentang Kami — Rekam Jejak & Standar PT Fixmi Bali Digital",
  description:
    "Profil resmi PT Fixmi Bali Digital: laboratorium perbaikan perangkat pintar terpercaya sejak Agustus 2014 di Bali. Spesialis mikrosolder, FIXMI Tech Academy, dan kemitraan B2B di 3 gerai Bali.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Tentang Kami — Rekam Jejak & Standar PT Fixmi Bali Digital",
    description:
      "Perjalanan 10+ tahun PT Fixmi Bali Digital menghadirkan layanan perbaikan gadget terpercaya, lab mikrosolder, dan pusat pelatihan teknisi di Bali.",
    url: "/about",
    images: [
      {
        url: "/images/faq-portrait.jpg",
        width: 1200,
        height: 630,
        alt: "Tentang PT Fixmi Bali Digital",
      },
    ],
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-foreground">
      {/* ── Section 1: Editorial Split-Screen Hero ── */}
      <AboutHeroEditorial />

      {/* ── Section 2: Animated Stats Band ── */}
      <AboutStatsBand />

      {/* ── Section 3: Career & Journey Timeline ── */}
      <AboutJourneyTimeline />

      {/* ── Section 4: WhatsApp Consultation CTA ── */}
      <AboutCtaBanner />
    </main>
  );
}
