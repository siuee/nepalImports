import Link from "next/link";
import { DISTRICTS } from "@/data/db";
import { districtBySlug, resolveProductSlugFromCropLabel } from "@/lib/catalog";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return DISTRICTS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const d = districtBySlug[slug];
  if (!d) return { title: "District not found" };
  const title = `${d.name} Agriculture Profile — Nepal`;
  const climateClip =
    d.climate.length > 90 ? `${d.climate.slice(0, 90)}…` : d.climate;
  const description = `${d.name} (${d.province}): ${climateClip} Opportunity score ${d.score}/100.`;
  return {
    title,
    description,
    keywords: [d.name, d.province, "Nepal district", "agriculture", "crops Nepal"],
    openGraph: {
      title,
      description,
      type: "article",
    },
    alternates: {
      canonical: `/districts/${slug}`,
    },
  };
}

export default async function DistrictPage({ params }) {
  const { slug } = await params;
  const d = districtBySlug[slug];
  if (!d) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${d.name}, Nepal`,
    description: d.insight,
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: `${d.province} Province, Nepal`,
    },
  };

  return (
    <main className="section" style={{ paddingTop: 120 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="district-name">{d.name}</div>
      <div className="district-province">
        {d.province} Province · Opportunity score {d.score}/100
      </div>
      <div className="district-stats-grid" style={{ marginTop: 24 }}>
        <div className="dst">
          <div className="dst-label">Import bill / yr</div>
          <div className="dst-value">Rs.{d.import} Crore</div>
        </div>
        <div className="dst">
          <div className="dst-label">Food status</div>
          <div className="dst-value" style={{ fontSize: 13, textTransform: "capitalize" }}>
            {d.food}
          </div>
        </div>
      </div>
      <div className="climate-soil" style={{ marginTop: 20 }}>
        Climate: {d.climate}
      </div>
      <div className="climate-soil">Soil: {d.soil}</div>
      <div className="district-insight" style={{ marginTop: 20 }}>
        {d.insight}
      </div>
      <div className="crops-list-title" style={{ marginTop: 28 }}>
        Crops &amp; products linked to this district
      </div>
      <div>
        {d.crops.map((c) => {
          const ps = resolveProductSlugFromCropLabel(c);
          return ps ? (
            <Link key={c} href={`/products/${ps}`} className="crop-tag">
              {c}
            </Link>
          ) : (
            <span key={c} className="crop-tag">
              {c}
            </span>
          );
        })}
      </div>
      <p style={{ marginTop: 32, color: "var(--t3)" }}>
        <Link href="/#map" style={{ color: "var(--purple)" }}>
          ← Back to interactive map
        </Link>
      </p>
    </main>
  );
}
