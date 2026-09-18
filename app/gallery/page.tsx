import type { Metadata } from "next";
import GalleryPageContent from "@/components/gallery/GalleryPageContent";
import { getGalleryImages } from "@/lib/gallery-server";
import { idDictionary } from "@/lib/i18n/dictionaries/id";

// ISR: HTML di-generate secara statis dan di-revalidate tiap 30 detik, atau instan via revalidatePath() / sync button.
export const revalidate = 30;

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
