import { fetchKalimatiPrices } from "@/lib/live/kalimati";
import { fetchNrbForex } from "@/lib/live/nrb";
import { COORDS_BY_ID } from "@/lib/live/districtCoords";
import { fetchOpenMeteoCurrent } from "@/lib/live/weather";

export const revalidate = 900;

function formatFxLabel(code, r) {
  if (!r) return "";
  const n = r.nprForQuote;
  if (code === "INR") return `Rs.${n.toFixed(2)}/100 INR`;
  if (code === "JPY") return `Rs.${n.toFixed(2)}/¥10`;
  return `Rs.${n.toFixed(2)}/${code}`;
}

export async function GET() {
  const [kalimati, forex, ktm] = await Promise.all([
    fetchKalimatiPrices().catch(() => null),
    fetchNrbForex().catch(() => null),
    (async () => {
      const c = COORDS_BY_ID.kathmandu;
      if (!c) return null;
      return fetchOpenMeteoCurrent(c.lat, c.lon).catch(() => null);
    })(),
  ]);

  const ticker = [];

  if (kalimati?.items?.length) {
    const slice = [...kalimati.items].sort((a, b) => b.avg - a.avg).slice(0, 6);
    for (const it of slice) {
      ticker.push({
        kind: "kalimati",
        name: it.name,
        price: `Rs.${it.avg}/${it.unit}`,
        deltaLabel: "wholesale",
        up: null,
      });
    }
  }

  if (forex?.rates) {
    for (const code of ["USD", "INR", "EUR", "AUD"]) {
      const r = forex.rates[code];
      if (!r) continue;
      const d = r.deltaPct;
      ticker.push({
        kind: "forex",
        name: `${code}/NPR`,
        price: formatFxLabel(code, r),
        deltaLabel: d == null ? "NRB sell" : `${d >= 0 ? "+" : ""}${d.toFixed(2)}%`,
        up: d == null ? null : d >= 0,
      });
    }
  }

  return Response.json({
    kalimati: kalimati
      ? {
          heading: kalimati.heading,
          count: kalimati.count,
          fetchedAt: kalimati.fetchedAt,
          source: kalimati.source,
          sourceUrl: kalimati.sourceUrl,
        }
      : null,
    forex: forex
      ? {
          publishedDate: forex.publishedDate,
          previousDate: forex.previousDate,
          rates: forex.rates,
          source: forex.source,
          sourceUrl: forex.sourceUrl,
        }
      : null,
    kathmanduWeather: ktm,
    ticker,
  });
}
