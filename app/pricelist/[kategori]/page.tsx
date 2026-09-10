import type { Metadata } from "next";
import { Suspense } from "react";
import PricelistExplorer from "@/components/pricelist/PricelistExplorer";
import { getPricelist, getPricelistLastUpdated } from "@/lib/pricelist-server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    kategori: string;
  }>;
}

export async function generateStaticParams() {
  const categories = await getPricelist();
  return categories.map((c) => ({
    kategori: c.Slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kategori } = await params;
  const categories = await getPricelist();
  const category = categories.find((c) => c.Slug.toLowerCase() === kategori.toLowerCase());

  const categoryName = category?.Name || (kategori.charAt(0).toUpperCase() + kategori.slice(1));
  const title = `Daftar Harga Service ${categoryName} — FIXMI Service Center`;
  const description = category?.description ||
    `Estimasi biaya perbaikan & harga sparepart resmi ${categoryName} (LCD, Baterai, Kamera, Logicboard) di FIXMI Service Center. Bergaransi resmi & transparan.`;
  const image = category?.Image || "/images/faq-portrait.jpg";

  return {
    title,
    description,
    alternates: {
      canonical: `/pricelist/${kategori.toLowerCase()}`,
    },
    openGraph: {
      title,
      description,
      url: `/pricelist/${kategori.toLowerCase()}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `Daftar Harga Service ${categoryName} FIXMI Service Center`,
        },
      ],
    },
  };
}

export default async function CategoryPricelistPage({ params }: PageProps) {
  const { kategori } = await params;
  const categories = await getPricelist();
  const lastUpdated = await getPricelistLastUpdated();

  return (
    <Suspense fallback={null}>
      <PricelistExplorer
        categories={categories}
        lastUpdated={lastUpdated}
        initialCategorySlug={kategori.toLowerCase()}
      />
    </Suspense>
  );
}
