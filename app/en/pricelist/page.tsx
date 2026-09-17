import type { Metadata } from "next";
import PricelistPage from "../../pricelist/page";

// ISR: HTML di-generate secara statis dan di-revalidate tiap 1 jam, atau instan via revalidatePath() dari admin.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "iPhone, iPad, MacBook & Android Repair Price List — FIXMI Service Center",
  description:
    "Transparent & certified repair pricing with official warranty for iPhone, iPad, MacBook, Apple Watch, and Android at FIXMI Service Center. Instant walk-in LCD, battery, and motherboard repair.",
  alternates: {
    canonical: "/en/pricelist",
  },
};

export default PricelistPage;
