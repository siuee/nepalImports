import { Redis } from "@upstash/redis";

const PREFIX = "prices:v1";

function getClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** @returns {Redis | null} */
export function getRedis() {
  return getClient();
}

export function snapshotKeyKalimati() {
  return `${PREFIX}:kalimati`;
}

export function snapshotKeyAmpis(marketId) {
  return `${PREFIX}:ampis:${marketId}`;
}

/**
 * @param {string} key
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function getSnapshot(key) {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    if (raw == null) return null;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    if (typeof raw === "object") return /** @type {Record<string, unknown>} */ (raw);
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {string} key
 * @param {Record<string, unknown>} payload
 * @returns {Promise<{ ok: boolean; error?: string }>}
 */
export async function setSnapshotResult(key, payload) {
  const redis = getRedis();
  if (!redis) {
    return { ok: false, error: "Redis not configured (set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)" };
  }
  try {
    await redis.set(key, JSON.stringify(payload));
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

/**
 * @param {string} key
 * @param {Record<string, unknown>} payload
 */
export async function setSnapshot(key, payload) {
  const r = await setSnapshotResult(key, payload);
  return r.ok;
}

export function isSnapshotStoreConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
