import { AMPIS_MARKETS } from "@/lib/live/ampis";
import { buildAmpisPricesPayload, buildKalimatiPricesPayload } from "@/lib/prices/livePayload";
import {
  getSnapshot,
  setSnapshot,
  snapshotKeyAmpis,
  snapshotKeyKalimati,
} from "@/lib/prices/snapshotStore";

/** Always try live first; avoid CDN caching stale error bodies. */
export const dynamic = "force-dynamic";

function ampisErrorJson(marketId, message) {
  const market = AMPIS_MARKETS.find((m) => m.id === marketId) || AMPIS_MARKETS[0];
  return {
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
  };
}

function kalimatiErrorJson(message) {
  return {
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
  };
}

function withCacheMeta(stored, liveErrorMessage) {
  const cacheServedAt = new Date().toISOString();
  return {
    ...stored,
    fromCache: true,
    cacheServedAt,
    ...(liveErrorMessage ? { liveErrorMessage } : {}),
  };
}

async function tryServeAmpis(marketId) {
  const key = snapshotKeyAmpis(marketId);
  try {
    const payload = await buildAmpisPricesPayload(marketId);
    await setSnapshot(key, payload);
    return Response.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AMPIS scrape failed";
    const cached = await getSnapshot(key);
    const items = Array.isArray(cached?.items) ? cached.items : [];
    if (cached && items.length > 0) {
      return Response.json(withCacheMeta(cached, message));
    }
    return Response.json(ampisErrorJson(marketId, message), { status: 200 });
  }
}

async function tryServeKalimati() {
  const key = snapshotKeyKalimati();
  try {
    const payload = await buildKalimatiPricesPayload();
    await setSnapshot(key, payload);
    return Response.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kalimati scrape failed";
    const cached = await getSnapshot(key);
    const items = Array.isArray(cached?.items) ? cached.items : [];
    if (cached && items.length > 0) {
      return Response.json(withCacheMeta(cached, message));
    }
    return Response.json(kalimatiErrorJson(message), { status: 200 });
  }
}

/**
 * GET /api/prices
 * - ?source=kalimati — live Kalimati (session + POST for table rows)
 * - ?source=ampis&market=<uuid> — AMPIS market page
 * On live failure, returns last Redis snapshot when configured and non-empty.
 */
export async function GET(request) {
  const url = new URL(request.url);
  const source = (url.searchParams.get("source") || "kalimati").toLowerCase();
  const marketId = url.searchParams.get("market") || AMPIS_MARKETS[0]?.id;

  if (source === "ampis") {
    return tryServeAmpis(marketId);
  }

  return tryServeKalimati();
}
