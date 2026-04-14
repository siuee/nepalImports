import ampisMarkets from "@/data/ampisMarkets.json";
import { buildAmpisPricesPayload, buildKalimatiPricesPayload } from "@/lib/prices/livePayload";
import {
  setSnapshot,
  snapshotKeyAmpis,
  snapshotKeyKalimati,
} from "@/lib/prices/snapshotStore";

/** Allow enough time for batched AMPIS fetches + Kalimati. */
export const maxDuration = 120;

function authorize(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

async function runInBatches(items, concurrency, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const slice = items.slice(i, i + concurrency);
    /* sequential batches: at most `concurrency` parallel AMPIS calls */
    results.push(...(await Promise.all(slice.map(fn))));
  }
  return results;
}

/**
 * Vercel Cron invokes this route with GET (see vercel.json).
 * Secure with Authorization: Bearer CRON_SECRET (set in project env).
 */
export async function GET(request) {
  if (!authorize(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  const kalimati = { key: "kalimati", ok: false, error: null };
  const ampisResults = [];

  try {
    const k = await buildKalimatiPricesPayload();
    await setSnapshot(snapshotKeyKalimati(), k);
    kalimati.ok = true;
  } catch (e) {
    kalimati.error = e instanceof Error ? e.message : "Kalimati failed";
  }

  const marketRows = await runInBatches(ampisMarkets, 3, async (m) => {
    const id = m.id;
    try {
      const payload = await buildAmpisPricesPayload(id);
      await setSnapshot(snapshotKeyAmpis(id), payload);
      return { id, ok: true, error: null };
    } catch (e) {
      return { id, ok: false, error: e instanceof Error ? e.message : "AMPIS failed" };
    }
  });

  ampisResults.push(...marketRows);

  const finishedAt = new Date().toISOString();
  return Response.json({
    ok: true,
    startedAt,
    finishedAt,
    kalimati,
    ampis: ampisResults,
    ampisOk: ampisResults.filter((r) => r.ok).length,
    ampisFail: ampisResults.filter((r) => !r.ok).length,
  });
}
