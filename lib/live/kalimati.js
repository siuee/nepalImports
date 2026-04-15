import * as cheerio from "cheerio";
import catalog from "@/data/marketData.json";
import { resolveCommodityCategory } from "@/lib/live/commodityCategory";
import { parseNprAmount } from "@/lib/live/devanagari";
import { BROWSER_HEADERS } from "@/lib/live/http";

const KALIMATI_PRICE_URL = "https://kalimatimarket.gov.np/price";

function cookieHeaderFromResponse(res) {
  const list = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : null;
  if (list?.length) {
    return list.map((c) => c.split(";")[0]).join("; ");
  }
  const single = res.headers.get("set-cookie");
  if (!single) return "";
  return single
    .split(/,(?=[^=]+=)/)
    .map((p) => p.split(";")[0].trim())
    .join("; ");
}

function kathmanduDateYYYYMMDD() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

function extractCsrf(html) {
  const m =
    html.match(/id="csrf"[^>]*value="([^"]+)"/) ||
    html.match(/name="_token"[^>]*value="([^"]+)"/);
  return m?.[1] || null;
}

function normalizeUnit(u) {
  const t = (u || "").replace(/\s+/g, "");
  if (t.includes("\u0926\u0930\u094d\u091c\u0928")) return "dozen";
  if (t.includes("\u0917\u094b\u091f\u093e")) return "piece";
  const compact = t.replace(/\./g, "");
  if (
    compact.includes("\u0915\u0947\u091c\u0940") ||
    (compact.includes("\u0915\u0947") && compact.includes("\u091c\u0940")) ||
    compact.includes("\u0915\u0947\u091c")
  ) {
    return "KG";
  }
  return u?.trim() || "KG";
}

function matchCatalogRow(nepaliRaw) {
  const norm = nepaliRaw.replace(/\s+/g, " ").trim();
  const head = norm.split("(")[0].trim();
  let best = null;
  let bestLen = 0;
  for (const m of catalog) {
    if (!m.nepali) continue;
    const n = m.nepali.trim();
    if (norm.includes(n) || n.includes(head) || head.includes(n)) {
      if (n.length >= bestLen) {
        bestLen = n.length;
        best = m;
      }
    }
  }
  return best;
}

function parseKalimatiHtml(html) {
  const $ = cheerio.load(html);
  const heading = $("h4.bottom-head").first().text().replace(/\s+/g, " ").trim() || null;
  const rows = [];
  $("#commodityPriceParticular tbody tr").each((_, el) => {
    const tds = $(el).find("td");
    if (tds.length < 5) return;
    const nameNepali = $(tds[0]).text().replace(/\s+/g, " ").trim();
    const unitRaw = $(tds[1]).text().replace(/\s+/g, " ").trim();
    const min = parseNprAmount($(tds[2]).text());
    const max = parseNprAmount($(tds[3]).text());
    const avg = parseNprAmount($(tds[4]).text());
    if (!nameNepali || min == null || max == null || avg == null) return;

    const match = matchCatalogRow(nameNepali);
    const cat = resolveCommodityCategory(nameNepali, match);
    const displayName = match?.name || nameNepali;

    rows.push({
      name: displayName,
      nepali: match?.nepali || nameNepali,
      nameNepali,
      min,
      max,
      avg,
      unit: normalizeUnit(unitRaw),
      cat,
      catalogMatch: Boolean(match),
    });
  });
  return { heading, rows };
}

/**
 * Kalimati needs session cookies + CSRF, then a POST with Kathmandu calendar date for the table.
 * We always POST when a token exists so "today" is authoritative: if today's table is empty we do not
 * fall back to whatever rows the initial GET HTML might still show (avoids masking empty days).
 */
export async function fetchKalimatiPrices() {
  const res1 = await fetch(KALIMATI_PRICE_URL, {
    headers: BROWSER_HEADERS,
    cache: "no-store",
  });
  if (!res1.ok) throw new Error(`Kalimati HTTP ${res1.status}`);
  const cookie = cookieHeaderFromResponse(res1);
  const html1 = await res1.text();

  const parsedGet = parseKalimatiHtml(html1);
  let heading = parsedGet.heading;
  let rows = parsedGet.rows;

  const token = extractCsrf(html1);
  if (token) {
    const datePricing = kathmanduDateYYYYMMDD();
    const res2 = await fetch(KALIMATI_PRICE_URL, {
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookie,
        Origin: "https://kalimatimarket.gov.np",
        Referer: KALIMATI_PRICE_URL,
      },
      body: new URLSearchParams({ _token: token, datePricing }),
      cache: "no-store",
    });
    const html2 = await res2.text();
    if (!res2.ok) throw new Error(`Kalimati POST ${res2.status}`);
    const parsedPost = parseKalimatiHtml(html2);
    heading = parsedPost.heading || heading;
    rows = parsedPost.rows;
  } else if (!rows.length) {
    throw new Error("Kalimati: missing CSRF token");
  }

  if (!rows.length) {
    throw new Error("Kalimati parse: no rows");
  }

  return {
    source: "Kalimati Fruits & Vegetable Market Development Board",
    sourceUrl: KALIMATI_PRICE_URL,
    heading,
    fetchedAt: new Date().toISOString(),
    count: rows.length,
    items: rows,
  };
}
