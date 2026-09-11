import { createHash } from "node:crypto";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPricelist } from "@/lib/pricelist-server";
import { listBackups } from "@/lib/admin/pricelist-write";
import AdminNav from "@/components/admin/AdminNav";
import PricelistEditor from "@/components/admin/PricelistEditor";
import ImportPanel from "@/components/admin/ImportPanel";
import BackupPanel from "@/components/admin/BackupPanel";

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
    title: `Kelola Daftar Harga ${categoryName} — FIXMI Admin`,
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
    <div className="mx-auto w-full max-w-[75rem] px-3.5 sm:px-6 md:px-10 py-6 sm:py-10 lg:py-14 min-h-[120vh]">
      {/* ── Shared Admin Navigation Switcher ── */}
      <AdminNav
        showExport
        exportCategories={importDestinations}
      />

      {/* Header — Mengikuti tipografi dan ukuran halaman /pricelist */}
      <header className="mb-10 lg:mb-14">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
                aria-hidden="true"
              />
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-text-muted">
                KATALOG PRICELIST & LAYANAN
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-bayon), sans-serif",
                fontWeight: 400,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                color: "var(--fixmi-text-primary)",
                textTransform: "uppercase" as const,
              }}
              className="text-[clamp(2.25rem,7vw,3.125rem)] md:text-[clamp(3.125rem,5.5vw,4rem)] lg:text-[clamp(4rem,5vw,4.75rem)]"
            >
              Kelola Daftar Harga
            </h1>
            <p className="mt-4 max-w-2xl text-sm md:text-base text-text-secondary leading-relaxed">
              Atur varian harga, spesifikasi garansi, dan model perangkat secara real-time.
              Perubahan langsung aktif di website tanpa perlu build ulang.
            </p>
          </div>

          {/* Panel Impor & Riwayat Backup */}
          <div className="flex flex-wrap items-center gap-3">
            <ImportPanel categories={importDestinations} />
            <BackupPanel backups={backups} />
          </div>
        </div>
      </header>

      {/* Editor Tab per Kategori */}
      <PricelistEditor
        key={version}
        categories={categories}
        initialCategorySlug={targetCategory.Slug}
      />
    </div>
  );
}
