import { AMPIS_MARKETS, fetchAmpisMarketPrices } from "@/lib/live/ampis";
import { buildCategoryTabs, normalizeCategoryId } from "@/lib/live/commodityCategory";
import { fetchKalimatiPrices } from "@/lib/live/kalimati";

/** Cache successful scrapes for 1 hour (ISR for route handlers). */
export const revalidate = 3600;

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

/**
 * GET /api/prices
 * - ?source=kalimati — live Kalimati (session + POST for table rows)
 * - ?source=ampis&market=<uuid> — AMPIS market page
 */
export async function GET(request) {
  const url = new URL(request.url);
  const source = (url.searchParams.get("source") || "kalimati").toLowerCase();
  const marketId = url.searchParams.get("market") || AMPIS_MARKETS[0]?.id;

  if (source === "ampis") {
    try {
      const data = await fetchAmpisMarketPrices(marketId);
      const items = mapAmpisItems(data.items);
      return Response.json({
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
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "AMPIS scrape failed";
      const market = AMPIS_MARKETS.find((m) => m.id === marketId) || AMPIS_MARKETS[0];
      return Response.json(
        {
          ok: false,
          fallback: true,
          message,
          source: "Agriculture Market Price Information System (AMPIS)",
          sourceUrl: market ? `https://ampis.gov.np/market-price/${market.id}` : "https://ampis.gov.np/",
          heading: "दैनिक बजार मूल्य सूची",
          dateNepali: null,
          fetchedAt: new Date().toISOString(),
          market: market || null,
          markets: AMPIS_MARKETS,
          categoryTabs: [{ id: "all", labelEn: "All", labelNp: "सबै", count: 0 }],
          count: 0,
          items: [],
        },
        { status: 200 }
      );
    }
  }

  try {
    const data = await fetchKalimatiPrices();
    const items = mapKalimatiItems(data.items);
    return Response.json({
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
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kalimati scrape failed";
    return Response.json(
      {
        ok: false,
        fallback: true,
        message,
        source: "Kalimati Fruits & Vegetable Market Development Board",
        sourceUrl: "https://kalimatimarket.gov.np/price",
        heading: null,
        dateNepali: null,
        fetchedAt: new Date().toISOString(),
        market: { id: "kalimati", name: "Kalimati, Kathmandu", nepali: "कालीमाटी, काठमाडौं" },
        markets: [],
        categoryTabs: [{ id: "all", labelEn: "All", labelNp: "सबै", count: 0 }],
        count: 0,
        items: [],
      },
      { status: 200 }
    );
  }
}
