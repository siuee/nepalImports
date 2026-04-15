/**
 * Vercel Cron: warm Redis for Kalimati + every AMPIS market (same payloads as /api/prices).
 * Schedule: every 3 hours UTC — vercel.json. Successful runs do ~1 + N Redis SETs (N = AMPIS count).
 *
 * Set CRON_SECRET in Vercel; invocations use Authorization: Bearer <CRON_SECRET>.
 */
import { AMPIS_MARKETS } from "@/lib/live/ampis";
import { buildAmpisPricesPayload, buildKalimatiPricesPayload } from "@/lib/prices/livePayload";
import { priceRowCount } from "@/lib/prices/priceRowCount";
import { setSnapshot, snapshotKeyAmpis, snapshotKeyKalimati } from "@/lib/prices/snapshotStore";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const GAP_MS = 600;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function refreshKalimati() {
  const key = snapshotKeyKalimati();
  try {
    const payload = await buildKalimatiPricesPayload();
    const n = priceRowCount(payload);
    if (n > 0) {
      await setSnapshot(key, payload);
      return { ok: true, rows: n };
    }
    return { ok: false, rows: 0, error: "no_rows" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "kalimati_failed";
    return { ok: false, rows: 0, error: msg };
  }
}

async function refreshAmpis(marketId) {
  const key = snapshotKeyAmpis(marketId);
  try {
    const payload = await buildAmpisPricesPayload(marketId);
    const n = priceRowCount(payload);
    if (n > 0) {
      await setSnapshot(key, payload);
      return { ok: true, rows: n, marketId };
    }
    return { ok: false, rows: 0, marketId, error: "no_rows" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ampis_failed";
    return { ok: false, rows: 0, marketId, error: msg };
  }
}

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  const kalimati = await refreshKalimati();
  await sleep(GAP_MS);

  const ampis = [];
  for (const m of AMPIS_MARKETS) {
    ampis.push(await refreshAmpis(m.id));
    await sleep(GAP_MS);
  }

  const okCount = (kalimati.ok ? 1 : 0) + ampis.filter((a) => a.ok).length;
  const durationMs = Date.now() - t0;

  return Response.json({
    ok: true,
    startedAt,
    durationMs,
    savedSnapshots: okCount,
    totalMarkets: 1 + AMPIS_MARKETS.length,
    kalimati,
    ampis,
  });
}
