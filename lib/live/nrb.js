/** Nepal Rastra Bank official forex JSON */

export function kathmanduYmd(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year").value;
  const mo = parts.find((p) => p.type === "month").value;
  const da = parts.find((p) => p.type === "day").value;
  return `${y}-${mo}-${da}`;
}

/** NPR `sell` is for `currency.unit` units of foreign currency (e.g. 100 INR, 10 JPY). */
function sellNprQuote(rate) {
  const sell = parseFloat(rate.sell);
  if (!Number.isFinite(sell)) return null;
  return sell;
}

/**
 * Latest published day vs previous day (sell), for % change.
 */
export async function fetchNrbForex() {
  const end = kathmanduYmd();
  const startD = new Date();
  startD.setDate(startD.getDate() - 10);
  const start = kathmanduYmd(startD);

  const url = `https://www.nrb.org.np/api/forex/v1/rates?from=${start}&to=${end}&page=1&per_page=40`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`NRB HTTP ${res.status}`);
  const j = await res.json();
  const payload = j?.data?.payload;
  if (!Array.isArray(payload) || !payload.length) {
    throw new Error("NRB: empty payload");
  }

  const days = [...payload].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const latest = days[0];
  const prev = days[1];

  const pick = (iso) =>
    latest.rates?.find((r) => r.currency?.iso3 === iso) ?? null;

  const codes = ["USD", "INR", "EUR", "GBP", "AUD", "JPY", "CNY"];
  const rates = {};
  for (const code of codes) {
    const r = pick(code);
    if (!r) continue;
    const sell = sellNprQuote(r);
    if (sell == null) continue;
    const unit = r.currency?.unit ?? 1;
    let deltaPct = null;
    if (prev) {
      const pr = prev.rates?.find((x) => x.currency?.iso3 === code);
      if (pr) {
        const prevSell = sellNprQuote(pr);
        if (prevSell && prevSell > 0) {
          deltaPct = ((sell - prevSell) / prevSell) * 100;
        }
      }
    }
    rates[code] = {
      name: r.currency?.name || code,
      unit,
      buy: r.buy,
      sell: r.sell,
      /** NPR for `unit` units of foreign currency (per NRB table). */
      nprForQuote: Math.round(sell * 10000) / 10000,
      deltaPct: deltaPct == null ? null : Math.round(deltaPct * 100) / 100,
    };
  }

  return {
    source: "Nepal Rastra Bank",
    sourceUrl: "https://www.nrb.org.np/api/forex/",
    publishedDate: latest.date,
    previousDate: prev?.date ?? null,
    publishedOn: latest.published_on ?? null,
    rates,
  };
}
