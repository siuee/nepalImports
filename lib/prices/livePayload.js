import { AMPIS_MARKETS, fetchAmpisMarketPrices } from "@/lib/live/ampis";
import { buildCategoryTabs, normalizeCategoryId } from "@/lib/live/commodityCategory";
import { fetchKalimatiPrices } from "@/lib/live/kalimati";

function mapKalimatiItems(items) {
  return items.map((row) => ({
    commodity: row.nameNepali,
    englishLabel: row.name !== row.nameNepali ? row.name : undefined,
    minimum: row.min,
    maximum: row.max,
    average: row.avg,
    unit: row.unit,
    cat: normalizeCategoryId(row.cat),
    catalogMatch: row.catalogMatch,
  }));
}

function mapAmpisItems(items) {
  return items.map((row) => ({
    commodity: row.nameNepali,
    englishLabel: row.name,
    minimum: row.min,
    maximum: row.max,
    average: row.avg,
    unit: row.unit,
    cat: normalizeCategoryId(row.cat),
    catalogMatch: row.catalogMatch,
  }));
}

/** @returns {Promise<Record<string, unknown>>} */
export async function buildKalimatiPricesPayload() {
  const data = await fetchKalimatiPrices();
  const items = mapKalimatiItems(data.items);
  return {
    ok: true,
    fallback: false,
    source: data.source,
    sourceUrl: data.sourceUrl,
    heading: data.heading,
    dateNepali: null,
    fetchedAt: data.fetchedAt,
    market: { id: "kalimati", name: "Kalimati, Kathmandu", nepali: "कालीमाटी, काठमाडौं" },
    markets: [],
    categoryTabs: buildCategoryTabs(items),
    count: data.count,
    items,
  };
}

/**
 * @param {string} marketId
 * @returns {Promise<Record<string, unknown>>}
 */
export async function buildAmpisPricesPayload(marketId) {
  const data = await fetchAmpisMarketPrices(marketId);
  const items = mapAmpisItems(data.items);
  return {
    ok: true,
    fallback: false,
    source: data.source,
    sourceUrl: data.sourceUrl,
    heading: data.heading,
    dateNepali: data.dateNepali,
    fetchedAt: data.fetchedAt,
    market: data.market,
    markets: AMPIS_MARKETS,
    categoryTabs: buildCategoryTabs(items),
    count: data.count,
    items,
  };
}
