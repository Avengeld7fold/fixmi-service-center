import type { Metadata } from "next";
import PromoPage from "../../promo/page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Special Offers & Promos — FIXMI Bali Repair Center",
  description:
    "Enjoy exclusive discounts and complimentary repair services for your smart devices at FIXMI Bali. Official store warranty & free diagnostics.",
  alternates: {
    canonical: "/en/promo",
  },
};

export default PromoPage;
