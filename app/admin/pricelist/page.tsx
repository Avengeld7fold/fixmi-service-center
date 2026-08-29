import { createHash } from "node:crypto";
import { getPricelist } from "@/lib/pricelist-server";
import { listBackups } from "@/lib/admin/pricelist-write";
import AdminNav from "@/components/admin/AdminNav";
import PricelistEditor from "@/components/admin/PricelistEditor";
import ImportPanel from "@/components/admin/ImportPanel";
import BackupPanel from "@/components/admin/BackupPanel";

export const dynamic = "force-dynamic";

export default async function AdminPricelistPage() {
  const categories = await getPricelist();
  const backups = await listBackups();
  // Versi data → key editor, agar draft di-remount saat data berubah (import/restore).
  const version = createHash("md5").update(JSON.stringify(categories)).digest("hex").slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-[75rem] px-3.5 sm:px-6 md:px-10 py-6 sm:py-10 lg:py-14">
      {/* ── Shared Admin Navigation Switcher ── */}
      <AdminNav showExport />

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
              <br />
              <span style={{ color: "var(--fixmi-primary)" }}>& Layanan</span>
            </h1>

            <p
              className="mt-4 sm:mt-5 max-w-[56ch] text-sm sm:text-base leading-relaxed text-text-secondary"
              style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
            >
              Atur jenis perbaikan, pilihan kualitas suku cadang, dan harga model perangkat. Semua perubahan langsung aktif di halaman website setelah disimpan.
            </p>
          </div>
        </div>
      </header>

      <ImportPanel
        categories={categories.map((c) => ({
          Name: c.Name,
          Slug: c.Slug,
          // Service bertingkat diberi konteks merk/series di label — tanpa ini
          // dropdown tujuan import berisi 5 "Harga LCD" yang tak terbedakan.
          services: c.service_types.map((s) => ({
            Slug: s.Slug,
            title: s.Brand ? `${s.Brand} · ${s.Series} · ${s.title}` : s.title,
          })),
        }))}
      />
      <PricelistEditor key={version} categories={categories} />
      <BackupPanel backups={backups} />
    </div>
  );
}
