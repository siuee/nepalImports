"use client";

import { useEffect, useMemo, useState } from "react";

const TABS = [
  { id: "all", label: "All Items" },
  { id: "vegetable", label: "Vegetables — तरकारी" },
  { id: "fruit", label: "Fruits — फलफूल" },
  { id: "spice", label: "Spices — मसला" },
  { id: "mushroom", label: "Mushrooms" },
  { id: "other", label: "Other — अन्य" },
];

export function MarketSection() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/live/kalimati")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.message || "Request failed");
        return j;
      })
      .then((j) => {
        if (!cancelled) {
          setData(j);
          setErr(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setErr(e.message || "Could not load prices");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = data?.items ?? [];

  const filtered = useMemo(() => {
    const qq = q.toLowerCase();
    return items.filter((m) => {
      const okTab = tab === "all" || m.cat === tab;
      const okQ =
        !qq ||
        m.name.toLowerCase().includes(qq) ||
        (m.nepali && m.nepali.includes(qq)) ||
        (m.nameNepali && m.nameNepali.toLowerCase().includes(qq));
      return okTab && okQ;
    });
  }, [tab, q, items]);

  return (
    <section className="market-section" id="market">
      <div className="market-header">
        <div className="market-title-block fade-in-section visible">
          <div className="live-badge">
            <span className="live-pulse" />
            Live Kalimati Market — कालीमाटी बजार
          </div>
          <h2 className="section-title">
            Today&apos;s Wholesale Prices
            <br />
            <span className="italic">कालीमाटी बजार मूल्य</span>
          </h2>
          <div className="market-date">
            {data ? (
              <>
                <span>{data.heading || "Daily table"}</span>
                {" · "}
                <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-link">
                  {data.source}
                </a>
                {" · "}
                Fetched {new Date(data.fetchedAt).toLocaleString("en-NP", { timeZone: "Asia/Kathmandu" })}
              </>
            ) : err ? (
              <span className="market-error-line">
                {err} —{" "}
                <a
                  href="https://kalimatimarket.gov.np/price"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-link"
                >
                  Open official price page
                </a>
              </span>
            ) : (
              <>Loading from kalimatimarket.gov.np…</>
            )}
          </div>
        </div>
        <input
          className="market-search"
          placeholder="Search vegetables, fruits..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={!items.length}
        />
      </div>
      <div className="market-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`market-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
            disabled={!items.length}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="results-count">
        Showing <span>{filtered.length}</span> of {items.length || "—"} items · कालीमाटी बजार मूल्य
      </div>
      {!items.length && !err ? (
        <div className="market-skeleton-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="market-skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="market-grid">
          {filtered.map((m) => (
            <div key={`${m.nameNepali}-${m.unit}`} className="market-card">
              <div className="mc-name" title={m.name}>
                {m.name}
              </div>
              <span className="mc-nepali">{m.nepali}</span>
              <div className="mc-prices">
                <div className="mc-avg">Rs.{m.avg}</div>
                <div className="mc-range-block">
                  <div className="mc-range">Min: Rs.{m.min}</div>
                  <div className="mc-range">Max: Rs.{m.max}</div>
                </div>
              </div>
              <div className="mc-unit">
                per {m.unit} · wholesale
                {!m.catalogMatch ? <span className="mc-hint"> · Nepali label from board</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
