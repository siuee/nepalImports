/**
 * Per-market price API (Kalimati vs AMPIS districts use different upstream pages, same behavior).
 *
 * For each request:
 * 1. Fetch live from the official source for that market.
 * 2. If the response has price rows → upsert Redis snapshot (replaces previous) and return live JSON.
 * 3. If live fails or has no rows → return the last Redis snapshot for that market when present
 *    (marked fromCache); otherwise return the empty/error JSON shape the UI handles.
 *
 * Scheduled bulk warm: GET /api/cron/refresh-prices (Vercel Cron, every 3h UTC) — see vercel.json.
 */
import { AMPIS_MARKETS } from "@/lib/live/ampis";
import { buildAmpisPricesPayload, buildKalimatiPricesPayload } from "@/lib/prices/livePayload";
import { priceRowCount } from "@/lib/prices/priceRowCount";
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
  let liveErrorMessage = null;
  try {
    const payload = await buildAmpisPricesPayload(marketId);
    const n = priceRowCount(payload);
    if (n > 0) {
      await setSnapshot(key, payload);
      return Response.json(payload);
    }
    liveErrorMessage = "Official source returned no price rows for this market.";
  } catch (err) {
    liveErrorMessage = err instanceof Error ? err.message : "AMPIS scrape failed";
  }
  const cached = await getSnapshot(key);
  if (priceRowCount(cached) > 0) {
    return Response.json(withCacheMeta(cached, liveErrorMessage));
  }
  return Response.json(ampisErrorJson(marketId, liveErrorMessage || "AMPIS scrape failed"), { status: 200 });
}

async function tryServeKalimati() {
  const key = snapshotKeyKalimati();
  let liveErrorMessage = null;
  try {
    const payload = await buildKalimatiPricesPayload();
    const n = priceRowCount(payload);
    if (n > 0) {
      await setSnapshot(key, payload);
      return Response.json(payload);
    }
    liveErrorMessage = "Official source returned no price rows for today.";
  } catch (err) {
    liveErrorMessage = err instanceof Error ? err.message : "Kalimati scrape failed";
  }
  const cached = await getSnapshot(key);
  if (priceRowCount(cached) > 0) {
    return Response.json(withCacheMeta(cached, liveErrorMessage));
  }
  return Response.json(kalimatiErrorJson(liveErrorMessage || "Kalimati scrape failed"), { status: 200 });
}

/**
 * GET /api/prices — one market per request (see file header for save vs cache fallback).
 * - ?source=kalimati — Kalimati
 * - ?source=ampis&market=<uuid> — AMPIS district
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
