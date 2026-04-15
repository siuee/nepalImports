import { getProducersBySlug } from "@/data/producers";

/**
 * Get producer data for a product
 */
export function getProducerData(productSlug) {
  return getProducersBySlug(productSlug);
}
