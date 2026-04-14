import * as cheerio from "cheerio";
import ampisMarkets from "@/data/ampisMarkets.json";
import catalog from "@/data/marketData.json";
import { resolveCommodityCategory } from "@/lib/live/commodityCategory";
import { parseNprAmount } from "@/lib/live/devanagari";
import { BROWSER_HEADERS } from "@/lib/live/http";

const AMPIS_BASE = "https://ampis.gov.np";

export const AMPIS_MARKETS = ampisMarkets;

function normalizeUnit(unitRaw) {
  const unit = (unitRaw || "").replace(/\s+/g, " ").trim();
  if (!unit) return "KG";
  if (unit.includes("लिटर")) return "Litre";
  if (unit.includes("दर्जन")) return "Dozen";
  if (unit.includes("के.जी") || unit.includes("केजी") || unit.includes("किलो") || unit === "के जी") return "KG";
  if (unit.includes("गोटा")) return "Piece";
  return unit;
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

function englishLabelForRow(nameNepali, match) {
  if (match?.name) return match.name;
  return nameNepali;
}

export function getAmpisMarketById(id) {
  return AMPIS_MARKETS.find((m) => m.id === id) || AMPIS_MARKETS[0];
}

/**
 * Scrape AMPIS daily market table (official HTML; multiple category tables per page).
 */
export async function fetchAmpisMarketPrices(marketId) {
  const market = getAmpisMarketById(marketId);
  const url = `${AMPIS_BASE}/market-price/${market.id}`;
  const res = await fetch(url, { headers: BROWSER_HEADERS, cache: "no-store" });
  if (!res.ok) throw new Error(`AMPIS HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const dateNepali = $(".export-title-date").first().text().replace(/\s+/g, " ").trim() || null;
  const heading = $("h3").first().text().replace(/\s+/g, " ").trim() || "दैनिक बजार मूल्य सूची";

  const items = [];
  $("table.cols-5").each((_, tableEl) => {
    $(tableEl)
      .find("tbody tr")
      .each((__, el) => {
        const tds = $(el).find("td");
        if (tds.length < 5) return;
        const nameNepali = $(tds[0]).text().replace(/\s+/g, " ").trim();
        const unitRaw = $(tds[1]).text().replace(/\s+/g, " ").trim();
        const min = parseNprAmount($(tds[2]).text());
        const max = parseNprAmount($(tds[3]).text());
        const avg = parseNprAmount($(tds[4]).text());
        if (!nameNepali || min == null || max == null || avg == null) return;

        const match = matchCatalogRow(nameNepali);
        const name = englishLabelForRow(nameNepali, match);
        const cat = resolveCommodityCategory(nameNepali, match);

        items.push({
          name,
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
  });

  if (!items.length) throw new Error("AMPIS parse: no rows");

  return {
    source: "Agriculture Market Price Information System (AMPIS)",
    sourceUrl: url,
    heading,
    dateNepali,
    fetchedAt: new Date().toISOString(),
    market,
    count: items.length,
    items,
  };
}
