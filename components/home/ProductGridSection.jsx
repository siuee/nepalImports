"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "@/data/db";
import { fmtPrice } from "@/lib/fmtPrice";
import { liveNepalAverageForSort, matchProductToKalimati } from "@/lib/matchKalimatiProduct";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "spice", label: "Spices" },
  { id: "tea", label: "Tea & Coffee" },
  { id: "honey", label: "Honey" },
  { id: "herb", label: "Herbs" },
  { id: "dairy", label: "Dairy" },
  { id: "mushroom", label: "Mushrooms" },
  { id: "oil", label: "Oils" },
  { id: "processed", label: "Processed" },
  { id: "import-replace", label: "Imported — can make in Nepal", danger: true },
];

function NepalPriceCell({ loading, match }) {
  if (loading) {
    return (
      <>
        <div className="price-value price-value-skeleton" aria-hidden />
        <div className="price-location">Fetching live rates…</div>
      </>
    );
  }
  if (!match) {
    return (
      <>
        <div className="price-value price-value-missing">—</div>
        <div className="price-location">Not in today&apos;s Kalimati table</div>
      </>
    );
  }
  const u = match.unit === "KG" ? "kg" : match.unit;
  return (
    <>
      <div className="price-value">{fmtPrice(match.average)}</div>
      <div className="price-location">Kalimati avg / {u}</div>
    </>
  );
}

export function ProductGridSection() {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("opportunity");
  const [priceItems, setPriceItems] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceFallback, setPriceFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPriceLoading(true);
    fetch("/api/prices")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setPriceItems(Array.isArray(data.items) ? data.items : []);
        setPriceFallback(Boolean(data.fallback));
      })
      .catch(() => {
        if (!cancelled) {
          setPriceItems([]);
          setPriceFallback(true);
        }
      })
      .finally(() => {
        if (!cancelled) setPriceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => {
    const qq = q.toLowerCase();
    let rows = PRODUCTS.filter((p) => {
      const okF =
        filter === "all" ||
        p.category === filter ||
        (filter === "import-replace" && p.imported);
      const okQ =
        !qq ||
        p.name.toLowerCase().includes(qq) ||
        p.nepali.includes(qq) ||
        p.districts.join(" ").toLowerCase().includes(qq) ||
        p.insight.toLowerCase().includes(qq);
      return okF && okQ;
    });
    rows = [...rows].sort((a, b) => {
      if (sort === "opportunity") return b.opportunity - a.opportunity;
      if (sort === "multiplier") return b.multiplier - a.multiplier;
      if (sort === "usa_price") return b.usaPrice - a.usaPrice;
      if (sort === "nepal_price") {
        if (!priceItems?.length) return a.name.localeCompare(b.name);
        return (
          liveNepalAverageForSort(a, priceItems) - liveNepalAverageForSort(b, priceItems)
        );
      }
      if (sort === "shelf") return b.shelf - a.shelf;
      if (sort === "name") return a.name.localeCompare(b.name);
      return b.opportunity - a.opportunity;
    });
    return rows;
  }, [filter, q, sort, priceItems]);

  return (
    <section className="section products-section" id="products">
      <div className="section-header fade-in-section visible">
        <div>
          <div className="section-eyebrow">Export intelligence database</div>
          <h2 className="section-title">
            Products That Can
            <br />
            <span className="italic">Change Nepal</span>
          </h2>
          {priceFallback ? (
            <p className="products-live-note products-live-note-warn">
              Kalimati live prices are temporarily unavailable; Nepal column shows match status only.
            </p>
          ) : (
            <p className="products-live-note">
              Nepal wholesale column uses live{" "}
              <a href="https://kalimatimarket.gov.np/price" target="_blank" rel="noopener noreferrer">
                Kalimati
              </a>{" "}
              data (cached ~1h).
            </p>
          )}
        </div>
      </div>
      <div className="search-wrap">
        <input
          type="search"
          className="search-bar"
          placeholder="Search products, spices, herbs, districts..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="search-icon" aria-hidden>
          &#8987;
        </span>
      </div>
      <div className="filter-row">
        <span className="filter-label">Category:</span>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`filter-btn${filter === f.id ? " active" : ""}${f.danger ? " filter-btn-danger" : ""}`}
            style={
              f.danger
                ? {
                    background: "rgba(192,57,43,0.15)",
                    borderColor: "rgba(255,107,107,0.3)",
                    color: "#fb7185",
                  }
                : undefined
            }
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="opportunity">Sort: Highest Opportunity</option>
          <option value="multiplier">Sort: Value Multiplier</option>
          <option value="usa_price">Sort: USA Price</option>
          <option value="nepal_price">Sort: Nepal (Kalimati avg)</option>
          <option value="shelf">Sort: Shelf Life</option>
          <option value="name">Sort: Name A→Z</option>
        </select>
      </div>
      <div className="results-count">
        Showing <span>{list.length}</span> of {PRODUCTS.length} products
      </div>
      <div className="product-grid">
        {list.map((p) => {
          const shelf = p.shelf === 999 ? "Indefinite" : `${p.shelf}mo`;
          const shelfPct = Math.min((p.shelf / 60) * 100, 100);
          const match = priceItems ? matchProductToKalimati(p, priceItems) : null;
          return (
            <Link key={p.id} href={`/products/${p.slug}`} className="product-card-link">
              <article className="product-card">
                <div className="card-header">
                  <span className="card-emoji">{p.emoji}</span>
                  <div className="card-badges">
                    {p.badge.map((b) => (
                      <span key={b} className={`badge badge-${b}`}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                {p.imported ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                      padding: "6px 10px",
                      background: "rgba(244,63,94,0.08)",
                      border: "1px solid rgba(244,63,94,0.2)",
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ color: "#fb7185", fontSize: 12 }}>!</span>
                    <span
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 12,
                        letterSpacing: 1,
                        color: "#fb7185",
                      }}
                    >
                      Imported — Rs.{p.annualImportNPR} Cr/yr from {p.importSource}
                    </span>
                  </div>
                ) : null}
                <div className="card-name">{p.name}</div>
                <div className="card-nepali">{p.nepali}</div>
                <div className="price-row">
                  <div className="price-item">
                    <div className="price-flag">NP</div>
                    <NepalPriceCell loading={priceLoading} match={match} />
                  </div>
                  <div className="price-item">
                    <div className="price-flag">US</div>
                    <div className="price-value">{fmtPrice(p.usaPrice, "$")}</div>
                    <div className="price-location">USA/kg</div>
                  </div>
                  <div className="price-item">
                    <div className="price-flag">AU</div>
                    <div className="price-value">{fmtPrice(p.auPrice, "A$")}</div>
                    <div className="price-location">AUS/kg</div>
                  </div>
                </div>
                <div className="card-meta">
                  <span>{p.districts[0]}</span>
                  <span>{shelf}</span>
                  <span>{p.opportunity}/100</span>
                </div>
                <div className="shelf-bar">
                  <div className="shelf-fill" style={{ width: `${shelfPct}%` }} />
                </div>
                <div className="gap-multiplier">
                  <span className="gap-text">Value gap:</span>
                  <span className="gap-value">{p.multiplier}x</span>
                  <span className="gap-text">if exported direct</span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
