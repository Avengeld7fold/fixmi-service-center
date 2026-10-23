import { createHash } from "node:crypto";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPricelist } from "@/lib/pricelist-server";
import { listBackups } from "@/lib/admin/pricelist-write";
import AdminNav from "@/components/admin/AdminNav";
import PricelistEditor from "@/components/admin/PricelistEditor";
import ImportPanel from "@/components/admin/ImportPanel";
import BackupPanel from "@/components/admin/BackupPanel";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { ADMIN_IDENTITY } from "@/lib/admin/identity";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    kategori: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kategori } = await params;
  const categories = await getPricelist();
  const category = categories.find((c) => c.Slug.toLowerCase() === kategori.toLowerCase());
  const categoryName = category?.Name || (kategori.charAt(0).toUpperCase() + kategori.slice(1));
  return {
    title: `Kelola Daftar Harga ${categoryName} — ${ADMIN_IDENTITY.adminName}`,
  };
}

export default async function CategoryAdminPricelistPage({ params }: PageProps) {
  const { kategori } = await params;
  const categories = await getPricelist();
  const backups = await listBackups();

  const targetCategory = categories.find(
    (c) => c.Slug.toLowerCase() === kategori.toLowerCase()
  );

  // Jika kategori tidak ditemukan di daftar, fallback ke kategori pertama
  if (!targetCategory) {
    redirect(`/admin/pricelist/${categories[0]?.Slug || "iphone"}`);
  }

  // Versi data → key editor, agar draft di-remount saat data berubah (import/restore).
  const version = createHash("md5").update(JSON.stringify(categories)).digest("hex").slice(0, 8);

  const importDestinations = categories.map((c) => ({
    Name: c.Name,
    Slug: c.Slug,
    services: c.service_types.map((s) => {
      const t = s.title || s.Name;
      return {
        Slug: s.Slug,
        title: s.Brand ? `${s.Brand} · ${s.Series ? `${s.Series} · ` : ""}${t}` : t,
      };
    }),
  }));

  return (
    <div className="admin-page">
      <AdminNav
        showExport
        exportCategories={importDestinations}
      />

      <AdminPageHeader title="Daftar Harga" description="Atur layanan, varian harga, garansi, dan model perangkat. Perubahan aktif tanpa build ulang." />

      {/* Panel Impor Data Excel / CSV */}
      <ImportPanel categories={importDestinations} />

      {/* Editor Tab per Kategori */}
      <PricelistEditor
        key={version}
        categories={categories}
        initialCategorySlug={targetCategory.Slug}
      />

      {/* Riwayat Cadangan Data (Backup) */}
      <BackupPanel backups={backups} />
    </div>
  );
}
