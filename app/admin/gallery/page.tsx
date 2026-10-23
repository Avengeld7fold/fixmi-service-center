import type { Metadata } from "next";
import { getGalleryImages } from "@/lib/gallery-server";
import AdminNav from "@/components/admin/AdminNav";
import GalleryEditor from "@/components/admin/GalleryEditor";
import { ADMIN_IDENTITY } from "@/lib/admin/identity";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Kelola Galeri Dokumentasi Repair — ${ADMIN_IDENTITY.adminName}`,
  robots: { index: false, follow: false },
};

export default async function AdminGalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="admin-page">
      <AdminNav />
      <AdminPageHeader title="Galeri" description={`Unggah dan kelola dokumentasi hasil pengerjaan ${ADMIN_IDENTITY.serviceCenterName}.`} />

      <GalleryEditor initialImages={images} />
    </div>
  );
}
