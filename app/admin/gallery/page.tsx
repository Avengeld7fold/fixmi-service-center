import type { Metadata } from "next";
import { getGalleryImages } from "@/lib/gallery-server";
import AdminNav from "@/components/admin/AdminNav";
import GalleryEditor from "@/components/admin/GalleryEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Galeri Dokumentasi Repair — FIXMI Admin",
  robots: { index: false, follow: false },
};

export default async function AdminGalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="mx-auto w-full max-w-[75rem] px-3.5 sm:px-6 md:px-10 py-6 sm:py-10 lg:py-14">
      {/* ── Shared Admin Navigation Switcher ── */}
      <AdminNav />

      {/* Header — Mengikuti tipografi dan standar visual FIXMI */}
      <header className="mb-10 lg:mb-14">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
                aria-hidden="true"
              />
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-text-muted">
                PORTOFOLIO DOKUMENTASI REPAIR
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
              Kelola Galeri
              <br />
              <span style={{ color: "var(--fixmi-primary)" }}>&amp; Dokumentasi Servis</span>
            </h1>

            <p
              className="mt-4 sm:mt-5 max-w-[56ch] text-sm sm:text-base leading-relaxed text-text-secondary"
              style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
            >
              Unggah dan kelola portofolio visual hasil pengerjaan nyata teknisi FIXMI Bali. Foto yang diunggah akan langsung muncul di halaman galeri publik dengan tag kategori perangkat.
            </p>
          </div>
        </div>
      </header>

      {/* ── Gallery Editor Component ── */}
      <GalleryEditor initialImages={images} />
    </div>
  );
}
