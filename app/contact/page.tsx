import type { Metadata } from "next";
import ContactPageContent from "@/components/contact/ContactPageContent";
import { idDictionary } from "@/lib/i18n/dictionaries/id";

export const metadata: Metadata = {
  title: idDictionary.contact.metaTitle,
  description: idDictionary.contact.metaDescription,
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: idDictionary.contact.metaTitle,
    description: idDictionary.contact.metaDescription,
    url: "/contact",
    images: [
      {
        url: "/images/faq-portrait.jpg",
        width: 1200,
        height: 630,
        alt: "Lokasi Outlet FIXMI Service Center",
      },
    ],
  },
};

export default function ContactPage() {
  return <ContactPageContent />;
}

