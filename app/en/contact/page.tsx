import type { Metadata } from "next";
import ContactPageContent from "@/components/contact/ContactPageContent";
import { enDictionary } from "@/lib/i18n/dictionaries/en";

export const metadata: Metadata = {
  title: enDictionary.contact.metaTitle,
  description: enDictionary.contact.metaDescription,
  alternates: {
    canonical: "/en/contact",
  },
  openGraph: {
    title: enDictionary.contact.metaTitle,
    description: enDictionary.contact.metaDescription,
    url: "/en/contact",
    images: [
      {
        url: "/images/faq-portrait.jpg",
        width: 1200,
        height: 630,
        alt: "FIXMI Bali Store Locations",
      },
    ],
  },
};

export default function EnglishContactPage() {
  return <ContactPageContent />;
}
