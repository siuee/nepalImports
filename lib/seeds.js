import { getSeedsBySlug } from "@/data/seeds";

/**
 * Get seed data for a product
 */
export function getSeedData(productSlug) {
  return getSeedsBySlug(productSlug);
}
