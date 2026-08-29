import type { Metadata } from "next";
import { Suspense } from "react";
import PricelistExplorer from "@/components/pricelist/PricelistExplorer";
import { getPricelist, getPricelistLastUpdated } from "@/lib/pricelist-server";
import type { Category } from "@/lib/data";

// Dibaca dari filesystem tiap request → perubahan data admin tampil tanpa rebuild (§7.2).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daftar Harga Service iPhone, iPad, MacBook & Android — FIXMI Bali",
  description:
    "Estimasi harga service transparan & bergaransi resmi untuk iPhone, iPad, MacBook, Apple Watch, dan Android di FIXMI Bali. Cek biaya ganti LCD, baterai, kamera, dan perbaikan motherboard.",
  alternates: {
    canonical: "/pricelist",
  },
  openGraph: {
    title: "Daftar Harga Service iPhone, iPad, MacBook & Android — FIXMI Bali",
    description:
      "Cek biaya perbaikan perangkat Apple & Android di FIXMI Bali. Transparan, bergaransi resmi, tanpa biaya tersembunyi.",
    url: "/pricelist",
    images: [
      {
        url: "/images/faq-portrait.jpg",
        width: 1200,
        height: 630,
        alt: "Daftar Harga Service FIXMI Bali",
      },
    ],
  },
};

export default async function PricelistPage() {
  let categories: Category[] = [];
  let lastUpdated = "Update Terbaru";
  let failed = false;
  try {
    categories = await getPricelist();
    lastUpdated = await getPricelistLastUpdated();
  } catch {
    failed = true;
  }

  if (failed || categories.length === 0) {
    return (
      <section className="mx-auto w-full max-w-[90rem] px-4 md:px-12 lg:px-16 py-24">
        <h1 className="font-display text-4xl font-bold text-foreground">Daftar Harga</h1>
        <p className="mt-4 text-text-secondary">
          Daftar harga sedang diperbarui. Silakan hubungi kami untuk penawaran terbaru.
        </p>
      </section>
    );
  }

  return (
    <Suspense fallback={null}>
      <PricelistExplorer categories={categories} lastUpdated={lastUpdated} />
    </Suspense>
  );
}
