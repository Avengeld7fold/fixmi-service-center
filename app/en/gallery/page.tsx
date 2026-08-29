import type { Metadata } from "next";
import GalleryPage from "../../gallery/page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Repair Showcase & Workbench Gallery — FIXMI Bali",
  description:
    "Explore genuine repair documentation from FIXMI Bali: screen reconditioning, battery renewals, motherboard micro-soldering, and hardware restorations.",
  alternates: {
    canonical: "/en/gallery",
  },
};

export default GalleryPage;
