import type { Metadata } from "next";
import { getPromoItems } from "@/lib/promo-server";
import AdminNav from "@/components/admin/AdminNav";
import PromoEditor from "@/components/admin/PromoEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Promo & Banner — FIXMI Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPromoPage() {
  const promos = await getPromoItems();

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
                PROMO &amp; PENAWARAN SPESIAL
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
              Kelola Promo
              <br />
              <span style={{ color: "var(--fixmi-primary)" }}>&amp; Banner Penawaran</span>
            </h1>

            <p
              className="mt-4 sm:mt-5 max-w-[56ch] text-sm sm:text-base leading-relaxed text-text-secondary"
              style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
            >
              Unggah dan atur banner promosi, diskon khusus, dan masa berlaku voucher. Banner yang diunggah akan langsung tampil di halaman promo publik website.
            </p>
          </div>
        </div>
      </header>

      {/* ── Promo Editor Management Component ── */}
      <PromoEditor initialPromos={promos} />
    </div>
  );
}
