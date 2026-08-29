import type { Metadata } from "next";
import PromoPageContent from "@/components/promo/PromoPageContent";
import { getPromoItems } from "@/lib/promo-server";
import { idDictionary } from "@/lib/i18n/dictionaries/id";

// Dibaca langsung dari backend / filesystem tiap request → sinkron otomatis saat upload gambar promo (§7.2).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: idDictionary.promo.title,
  description: idDictionary.promo.subtitle,
  alternates: {
    canonical: "/promo",
  },
  openGraph: {
    title: idDictionary.promo.title,
    description: idDictionary.promo.subtitle,
    url: "/promo",
  },
};

export default async function PromoPage() {
  const promos = await getPromoItems();

  return <PromoPageContent promos={promos} />;
}
