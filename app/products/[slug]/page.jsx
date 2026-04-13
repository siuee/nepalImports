import { ProductDetailTabs } from "@/components/ProductDetailTabs";
import { PRODUCTS } from "@/data/db";
import { productBySlug } from "@/lib/catalog";
import { getGrowingGuide } from "@/lib/growingGuide";
import { getSoilData } from "@/lib/soilData";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = productBySlug[slug];
  if (!p) return { title: "Product not found" };
  const title = `Export ${p.name} from Nepal`;
  const description = `${p.nepali} — ${p.insight.slice(0, 155)}${p.insight.length > 155 ? "…" : ""}`;
  return {
    title,
    description,
    keywords: [p.name, p.category, "Nepal export", p.nepali, "agriculture Nepal"],
    openGraph: {
      title,
      description,
      type: "article",
    },
    alternates: {
      canonical: `/products/${slug}`,
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const raw = productBySlug[slug];
  if (!raw) notFound();

  const product = getSoilData({ ...raw });
  const guide = getGrowingGuide(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.insight,
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "NPR",
      description:
        "Nepal wholesale pricing is loaded live from the Kalimati board table on this site (not embedded in static data).",
    },
    areaServed: {
      "@type": "Country",
      name: "Nepal",
    },
  };

  return (
    <main className="section" style={{ paddingTop: 120 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailTabs product={product} guide={guide} />
    </main>
  );
}
