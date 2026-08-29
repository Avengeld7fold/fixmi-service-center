import type { Metadata } from "next";
import GalleryPageContent from "@/components/gallery/GalleryPageContent";
import { getGalleryImages } from "@/lib/gallery-server";
import { idDictionary } from "@/lib/i18n/dictionaries/id";

// Dibaca langsung dari backend / filesystem tiap request → sinkron otomatis saat upload (§7.2).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: idDictionary.gallery.title,
  description: idDictionary.gallery.subtitle,
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: idDictionary.gallery.title,
    description: idDictionary.gallery.subtitle,
    url: "/gallery",
  },
};

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return <GalleryPageContent images={images} />;
}
