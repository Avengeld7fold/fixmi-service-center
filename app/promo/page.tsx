import type { Metadata } from "next";
import PromoPageContent from "@/components/promo/PromoPageContent";
import { getPromoItems } from "@/lib/promo-server";
import { idDictionary } from "@/lib/i18n/dictionaries/id";

// ISR: HTML di-generate secara statis dan di-revalidate tiap 30 detik, atau instan via revalidatePath() / sync button.
export const revalidate = 30;

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
