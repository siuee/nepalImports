/**
 * Map a catalog product to a Kalimati /api/prices row (Nepali commodity labels).
 */
export function matchProductToKalimati(product, items) {
  if (!product || !items?.length) return null;
  const nepali = (product.nepali || "").replace(/\s+/g, " ").trim();
  const head = nepali.split("(")[0].trim();
  if (!nepali) return null;

  let best = null;
  let bestScore = 0;
  for (const row of items) {
    const c = (row.commodity || "").replace(/\s+/g, " ").trim();
    if (!c) continue;
    const cHead = c.split("(")[0].trim();
    let score = 0;
    if (c.includes(nepali)) score = nepali.length;
    else if (nepali.includes(cHead) && cHead.length >= 2) score = cHead.length;
    else if (c.includes(head) && head.length >= 2) score = head.length;
    else if (cHead && head.includes(cHead) && cHead.length >= 2) score = cHead.length;

    if (score > bestScore) {
      bestScore = score;
      best = row;
    }
  }
  return bestScore > 0 ? best : null;
}

/** Numeric average for sorting; unmatched → end of list */
export function liveNepalAverageForSort(product, items) {
  const m = matchProductToKalimati(product, items);
  return m && typeof m.average === "number" ? m.average : Number.POSITIVE_INFINITY;
}
