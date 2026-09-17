import type { Metadata } from "next";
import GalleryPage from "../../gallery/page";

// ISR: HTML di-generate secara statis dan di-revalidate tiap 1 jam, atau instan via revalidatePath() dari admin.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Repair Showcase & Workbench Gallery — FIXMI Service Center",
  description:
    "Explore genuine repair documentation from FIXMI Service Center: screen reconditioning, battery renewals, motherboard micro-soldering, and hardware restorations.",
  alternates: {
    canonical: "/en/gallery",
  },
};

export default GalleryPage;
