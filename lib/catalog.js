import { DISTRICTS, PRODUCTS } from "@/data/db";

export const districtBySlug = Object.fromEntries(DISTRICTS.map((d) => [d.slug, d]));
export const productBySlug = Object.fromEntries(PRODUCTS.map((p) => [p.slug, p]));

/** Match a district label from product data or crop list to a district slug. */
export function resolveDistrictSlug(label) {
  const clean = String(label)
    .replace(/\s*\([^)]*\)/g, "")
    .trim();
  const lower = clean.toLowerCase();

  const exact = DISTRICTS.find((d) => d.name.toLowerCase() === lower);
  if (exact) return exact.slug;

  const byId = DISTRICTS.find((d) => d.id.toLowerCase() === lower.replace(/\s+/g, "-"));
  if (byId) return byId.slug;

  const contains = DISTRICTS.find(
    (d) =>
      lower.includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().includes(lower) ||
      lower.includes(d.id.replace(/-/g, " "))
  );
  if (contains) return contains.slug;

  if (lower === "rukum") {
    const east = districtBySlug["rukum-e"];
    if (east) return east.slug;
  }

  return null;
}

/** Match crop text on a district page to a product slug (if any). */
export function resolveProductSlugFromCropLabel(label) {
  const clean = String(label)
    .replace(/\s*\([^)]*\)/g, "")
    .trim()
    .toLowerCase();

  const exact = PRODUCTS.find((p) => p.name.toLowerCase() === clean);
  if (exact) return exact.slug;

  const word = clean.split(/[\s/]+/)[0] || clean;
  const starts = PRODUCTS.find(
    (p) =>
      p.name.toLowerCase().startsWith(word) ||
      word.length > 3 && p.name.toLowerCase().includes(word)
  );
  if (starts) return starts.slug;

  const fuzzy = PRODUCTS.find(
    (p) => clean.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(clean)
  );
  return fuzzy?.slug ?? null;
}
