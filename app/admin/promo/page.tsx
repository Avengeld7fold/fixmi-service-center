import type { Metadata } from "next";
import { getPromoItems } from "@/lib/promo-server";
import AdminNav from "@/components/admin/AdminNav";
import PromoEditor from "@/components/admin/PromoEditor";
import { ADMIN_IDENTITY } from "@/lib/admin/identity";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Kelola Promo & Banner — ${ADMIN_IDENTITY.adminName}`,
  robots: { index: false, follow: false },
};

export default async function AdminPromoPage() {
  const promos = await getPromoItems();

  return (
    <div className="admin-page">
      <AdminNav />
      <AdminPageHeader title="Promo & Banner" description="Unggah dan atur penawaran yang tampil pada halaman promo publik." />

      <PromoEditor initialPromos={promos} />
    </div>
  );
}
