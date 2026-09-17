import type { Metadata } from "next";
import PromoPage from "../../promo/page";

// ISR: HTML di-generate secara statis dan di-revalidate tiap 1 jam, atau instan via revalidatePath() dari admin.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Special Offers & Promos — FIXMI Service Center",
  description:
    "Enjoy exclusive discounts and complimentary repair services for your smart devices at FIXMI Service Center. Official store warranty & free diagnostics.",
  alternates: {
    canonical: "/en/promo",
  },
};

export default PromoPage;
