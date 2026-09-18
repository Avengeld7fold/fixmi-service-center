import type { Metadata } from "next";
import PromoPage from "../../promo/page";

// ISR: HTML di-generate secara statis dan di-revalidate tiap 30 detik, atau instan via revalidatePath() / sync button.
export const revalidate = 30;

export const metadata: Metadata = {
  title: "Special Offers & Promos — FIXMI Service Center",
  description:
    "Enjoy exclusive discounts and complimentary repair services for your smart devices at FIXMI Service Center. Official store warranty & free diagnostics.",
  alternates: {
    canonical: "/en/promo",
  },
};

export default PromoPage;
