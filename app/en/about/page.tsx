import type { Metadata } from "next";
import AboutHeroEditorial from "@/components/about/AboutHeroEditorial";
import AboutStatsBand from "@/components/about/AboutStatsBand";
import AboutJourneyTimeline from "@/components/about/AboutJourneyTimeline";
import AboutCtaBanner from "@/components/about/AboutCtaBanner";
import { enDictionary } from "@/lib/i18n/dictionaries/en";

export const metadata: Metadata = {
  title: enDictionary.about.metaTitle,
  description: enDictionary.about.metaDescription,
  alternates: {
    canonical: "/en/about",
  },
  openGraph: {
    title: enDictionary.about.metaTitle,
    description: enDictionary.about.metaDescription,
    url: "/en/about",
    images: [
      {
        url: "/images/faq-portrait.jpg",
        width: 1200,
        height: 630,
        alt: "About PT Fixmi Bali Digital",
      },
    ],
  },
};

export default function EnglishAboutPage() {
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
