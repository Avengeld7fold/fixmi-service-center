import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fixmibali.com";
  const now = new Date();

  const categories = ["iphone", "ipad", "macbook", "iwatch", "android"];

  const categoryEntries: MetadataRoute.Sitemap = categories.flatMap((cat) => [
    {
      url: `${siteUrl}/pricelist/${cat}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    },
    {
      url: `${siteUrl}/en/pricelist/${cat}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    },
  ]);

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/en`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/pricelist`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/en/pricelist`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...categoryEntries,
    {
      url: `${siteUrl}/promo`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/en/promo`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/gallery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/en/gallery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/en/about`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/en/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
