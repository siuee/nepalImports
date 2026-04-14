"use client";

import { useEffect, useMemo, useState } from "react";
import ampisMarkets from "@/data/ampisMarkets.json";
import { buildCategoryTabs, formatTabLabel, normalizeCategoryId } from "@/lib/live/commodityCategory";

const KALIMATI_PLACE = {
  id: "kalimati",
  name: "Kalimati, Kathmandu",
  nepali: "कालीमाटी, काठमाडौं",
};

const PLACES = [
  { id: KALIMATI_PLACE.id, label: `${KALIMATI_PLACE.name} — ${KALIMATI_PLACE.nepali}` },
  ...ampisMarkets.map((m) => ({ id: m.id, label: `${m.name} — ${m.nepali}` })),
];

/** Shown when a place has no rows (scrape/API failure or empty official table). */
const OFFICIAL_DATA_UNAVAILABLE =
  "The Nepal government website is not working to provide data currently. Please try again later.";

/**
 * Isolated filter/search/grid state. Remounted via `key` when place or loaded payload changes
 * so we never reuse a stale `tab` after an empty or error response.
 */
function MarketPricesListing({ data, err, placeLabel, officialHref }) {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  const items = useMemo(
    () =>
      (data?.items ?? []).map((m, rowIndex) => ({
        rowKey: rowIndex,
        name: m.englishLabel || m.commodity,
        nepali: m.commodity,
        avg: m.average,
        min: m.minimum,
        max: m.maximum,
        unit: m.unit,
        cat: normalizeCategoryId(m.cat),
        catalogMatch: Boolean(m.catalogMatch),
      })),
    [data]
  );

  const categoryTabs = useMemo(() => {
    if (Array.isArray(data?.categoryTabs) && data.categoryTabs.length) {
      return data.categoryTabs.map((t) => ({
        ...t,
        id: normalizeCategoryId(t.id),
      }));
    }
    return buildCategoryTabs(items);
  }, [data?.categoryTabs, items]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const active = normalizeCategoryId(tab);
    return items.filter((m) => {
      const okTab = active === "all" || normalizeCategoryId(m.cat) === active;
      const okQ =
        !qq ||
        m.name.toLowerCase().includes(qq) ||
        (m.nepali && m.nepali.toLowerCase().includes(qq)) ||
        (m.nepali && m.nepali.includes(qq));
      return okTab && okQ;
    });
  }, [tab, q, items]);

  return (
    <>
      <input
        className="market-search"
        placeholder="Search English or Nepali…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        disabled={!items.length}
      />
      <div className="market-tabs" role="tablist" aria-label="Filter by commodity type">
        {categoryTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={normalizeCategoryId(tab) === normalizeCategoryId(t.id)}
            className={`market-tab${normalizeCategoryId(tab) === normalizeCategoryId(t.id) ? " active" : ""}`}
            onClick={() => setTab(normalizeCategoryId(t.id))}
            disabled={!items.length}
          >
            <span className="market-tab-label">{formatTabLabel(t)}</span>
            {typeof t.count === "number" ? <span className="market-tab-count">{t.count}</span> : null}
          </button>
        ))}
      </div>
      <div className="results-count">
        Showing <span>{filtered.length}</span> of {items.length || "—"} items · {placeLabel}
      </div>
      {!items.length && !err ? (
        <div className="market-skeleton-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="market-skeleton-card" />
          ))}
        </div>
      ) : !items.length && err ? (
        <div className="market-error-line market-error-block">
          {err}{" "}
          <a href={officialHref} target="_blank" rel="noopener noreferrer" className="source-link">
            Open official price page
          </a>
        </div>
      ) : (
        <div className="market-grid">
          {filtered.map((m) => (
            <div key={m.rowKey} className="market-card">
              <div className="mc-name" title={m.name}>
                {m.name}
              </div>
              <span className="mc-nepali" lang="ne">
                {m.nepali}
              </span>
              <div className="mc-prices">
                <div className="mc-avg">Rs.{m.avg}</div>
                <div className="mc-range-block">
                  <div className="mc-range">Min: Rs.{m.min}</div>
                  <div className="mc-range">Max: Rs.{m.max}</div>
                </div>
              </div>
              <div className="mc-unit">
                per {m.unit} · wholesale
                {!m.catalogMatch ? <span className="mc-hint"> · board label</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/** Stable key: new listing state whenever place changes or a new payload arrives (incl. empty vs full). */
function listingKey(placeId, data) {
  if (data === null) return `${placeId}-pending`;
  const ok = data.ok !== false;
  const count = typeof data.count === "number" ? data.count : (data.items?.length ?? 0);
  const at = data.fetchedAt || "unknown";
  return `${placeId}-${ok}-${count}-${at}`;
}

export function MarketSection() {
  const [placeId, setPlaceId] = useState("kalimati");
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const url =
      placeId === "kalimati"
        ? "/api/prices?source=kalimati"
        : `/api/prices?source=ampis&market=${encodeURIComponent(placeId)}`;

    setData(null);
    setErr(null);

    fetch(url)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.message || "Request failed");
        return j;
      })
      .then((j) => {
        if (cancelled) return;
        setData(j);
        setErr(j.ok === false ? j.message || "Could not load prices" : null);
      })
      .catch((e) => {
        if (!cancelled) {
          setErr(e.message || "Could not load prices");
          setData(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [placeId]);

  const placeLabel =
    placeId === "kalimati"
      ? KALIMATI_PLACE.nepali
      : ampisMarkets.find((m) => m.id === placeId)?.nepali || "बजार मूल्य";

  const officialHref =
    placeId === "kalimati" ? "https://kalimatimarket.gov.np/price" : data?.sourceUrl || "https://ampis.gov.np/";

  const itemsLength = data?.items?.length ?? 0;
  const loadedWithoutRows = data != null && itemsLength === 0;
  const userFacingError =
    err || loadedWithoutRows || data?.ok === false ? OFFICIAL_DATA_UNAVAILABLE : null;

  return (
    <section className="market-section" id="market">
      <div className="market-header">
        <div className="market-title-block fade-in-section visible">
          <div className="live-badge">
            <span className="live-pulse" />
            Live market prices — प्रत्यक्ष बजार मूल्य
          </div>
          <h2 className="section-title market-title-with-select">
            <span className="market-title-lines">
              Today&apos;s wholesale prices
              <br />
              <span className="italic">{placeLabel}</span>
            </span>
            <select
              className="market-place-select"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              aria-label="Select market or region"
            >
              {PLACES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </h2>
          <div className="market-date">
            {userFacingError ? (
              <span className="market-error-line">
                {userFacingError}{" "}
                <a href={officialHref} target="_blank" rel="noopener noreferrer" className="source-link">
                  Open official price page
                </a>
              </span>
            ) : data ? (
              <>
                <span>{data.heading || "Daily table"}</span>
                {data.dateNepali ? (
                  <>
                    {" · "}
                    Latest: {data.dateNepali}
                  </>
                ) : null}
                {" · "}
                <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-link">
                  {data.source}
                </a>
                {" · "}
                Fetched {new Date(data.fetchedAt).toLocaleString("en-NP", { timeZone: "Asia/Kathmandu" })}
              </>
            ) : (
              <>Loading latest official prices…</>
            )}
          </div>
        </div>
      </div>

      <MarketPricesListing
        key={listingKey(placeId, data)}
        data={data}
        err={userFacingError}
        placeLabel={placeLabel}
        officialHref={officialHref}
      />
    </section>
  );
}
