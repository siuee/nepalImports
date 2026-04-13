import * as cheerio from "cheerio";
import catalog from "@/data/marketData.json";
import { parseNprAmount } from "@/lib/live/devanagari";
import { BROWSER_HEADERS } from "@/lib/live/http";

const KALIMATI_PRICE_URL = "https://kalimatimarket.gov.np/price";

function normalizeUnit(u) {
  const t = (u || "").replace(/\s+/g, "");
  if (t.includes("\u0926\u0930\u094d\u091c\u0928")) return "dozen";
  if (t.includes("\u0917\u094b\u091f\u093e")) return "piece";
  const compact = t.replace(/\./g, "");
  if (
    compact.includes("\u0915\u0947\u091c\u0940") ||
    (compact.includes("\u0915\u0947") && compact.includes("\u091c\u0940"))
  ) {
    return "KG";
  }
  return u?.trim() || "KG";
}

function inferCategory(nameNepali) {
  const n = nameNepali;
  if (n.includes("\u091a\u094d\u092f\u093e\u0909")) return "mushroom";
  const spiceHints = [
    "\u0916\u0941\u0930\u094d\u0938\u093e\u0928\u0940",
    "\u0932\u0938\u0941\u0928",
    "\u0905\u0926\u0941\u0935\u093e",
    "\u0927\u0928\u093f\u092f\u093e",
    "\u092a\u0941\u0926\u0940\u0928\u093e",
    "\u0907\u092e\u0932\u0940",
    "\u091b\u094d\u092f\u093e\u092a\u0940",
  ];
  if (spiceHints.some((s) => n.includes(s))) return "spice";
  const fruitHints = [
    "\u0938\u094d\u092f\u093e\u0909",
    "\u0915\u0947\u0930\u093e",
    "\u0915\u093e\u0917\u0924\u0940",
    "\u0905\u0928\u093e\u0930",
    "\u0905\u0902\u0917\u0941\u0930",
    "\u0938\u0941\u0928\u094d\u0924\u0932\u093e",
    "\u0924\u0930\u092c\u0941\u091c\u093e",
    "\u092e\u0947\u0935\u093e",
    "\u0928\u093e\u0938\u092a\u093e\u0924\u0940",
    "\u0915\u093f\u0935\u093f",
    "\u0906\u092d\u094b\u0915\u093e\u0921\u094b",
    "\u0915\u091f\u0939\u0930",
    "\u0915\u093e\u0915\u094d\u0930\u094b",
  ];
  if (fruitHints.some((s) => n.includes(s))) return "fruit";
  return "vegetable";
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

/**
 * Scrape Kalimati daily wholesale table (official site; no public JSON).
 */
export async function fetchKalimatiPrices() {
  const res = await fetch(KALIMATI_PRICE_URL, {
    headers: BROWSER_HEADERS,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Kalimati HTTP ${res.status}`);
  }
  const html = await res.text();
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
    const cat = match?.cat || inferCategory(nameNepali);
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
