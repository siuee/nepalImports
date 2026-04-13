import { fetchKalimatiPrices } from "@/lib/live/kalimati";

/** Cache successful scrapes for 1 hour (ISR for route handlers). */
export const revalidate = 3600;

/**
 * GET /api/prices — Kalimati wholesale table as JSON.
 * On failure: 200 + { fallback: true, items: [] } so clients never hard-crash.
 */
export async function GET() {
  try {
    const data = await fetchKalimatiPrices();
    const items = data.items.map((row) => ({
      commodity: row.nameNepali,
      minimum: row.min,
      maximum: row.max,
      average: row.avg,
      unit: row.unit,
      englishLabel: row.name !== row.nameNepali ? row.name : undefined,
    }));

    return Response.json({
      ok: true,
      fallback: false,
      source: data.source,
      sourceUrl: data.sourceUrl,
      heading: data.heading,
      fetchedAt: data.fetchedAt,
      count: items.length,
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
        fetchedAt: new Date().toISOString(),
        count: 0,
        items: [],
      },
      { status: 200 }
    );
  }
}
