import { DISTRICTS, PRODUCTS } from "@/data/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nepal-imports.vercel.app";

export default function sitemap() {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...PRODUCTS.map((p) => ({
      url: `${siteUrl}/products/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    })),
    ...DISTRICTS.map((d) => ({
      url: `${siteUrl}/districts/${d.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  ];
}
