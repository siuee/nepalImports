/** @param {unknown} payload */
export function priceRowCount(payload) {
  return Array.isArray(payload?.items) ? payload.items.length : 0;
}
