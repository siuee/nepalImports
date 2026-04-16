"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { resolveDistrictSlug } from "@/lib/catalog";
import { fmtPrice } from "@/lib/fmtPrice";
import { matchProductToKalimati } from "@/lib/matchKalimatiProduct";
import { bsMonthNameNpForAdMidMonth, localizeEnglishMonthsToBs } from "@/lib/bsCalendar";

/** English abbreviations — used only to match `plantMonth` / `harvestMonth` / `season` strings in data. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthClass(i, p) {
  const pm = p.plantMonth || "";
  const hm = p.harvestMonth || "";
  const s = (p.season || "").toLowerCase();
  const mi = MONTHS[i];
  if (pm.includes(mi)) return "plant";
  if (hm.includes(mi)) return "harvest";
  if (s.includes("process") && [2, 3, 4].includes(i)) return "process";
  if (pm && hm) {
    const pi = MONTHS.findIndex((x) => pm.includes(x));
    const hi = MONTHS.findIndex((x) => hm.includes(x));
    if (pi >= 0 && hi >= 0) {
      if (hi > pi && i > pi && i < hi) return "grow";
      if (hi < pi && (i > pi || i < hi)) return "grow";
    }
  }
  return "";
}

const TABS = [
  { id: "prices", label: "Prices" },
  { id: "soil", label: "Soil Analysis" },
  { id: "climate", label: "Climate & Season" },
  { id: "ai", label: "AI Suggestion" },
  { id: "grow", label: "Growing Guide" },
];

export function ProductDetailTabs({ product: p, guide }) {
  const [tab, setTab] = useState("prices");
  const [priceItems, setPriceItems] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [premiumDocs, setPremiumDocs] = useState({});

  const adYear = useMemo(() => new Date().getFullYear(), []);
  const loc = useCallback(
    (text) => (text == null || text === "" ? text : localizeEnglishMonthsToBs(String(text), adYear)),
    [adYear]
  );

  useEffect(() => {
    let cancelled = false;
    setPriceLoading(true);
    
    Promise.all([
      fetch("/api/prices").then((r) => r.json()).catch(() => ({ items: [] })),
      fetch("/api/premium-prices").then((r) => r.json()).catch(() => ({}))
    ]).then(([kalimatiData, premiumData]) => {
      if (cancelled) return;
      setPriceItems(Array.isArray(kalimatiData.items) ? kalimatiData.items : []);
      setPremiumDocs(premiumData || {});
    }).finally(() => {
      if (!cancelled) setPriceLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const kalimatiMatch = useMemo(() => {
    if (!priceItems?.length) return null;
    return matchProductToKalimati(p, priceItems);
  }, [p, priceItems]);

  const timeline = useMemo(
    () =>
      MONTHS.map((mn, i) => {
        const bs = bsMonthNameNpForAdMidMonth(i, adYear);
        return (
          <div
            key={mn}
            className={`season-month ${monthClass(i, p)}`}
            title={`${mn} ${adYear} (AD) — ${bs} (बिक्रम संवत, मध्य महिना)`}
            lang="ne"
          >
            {bs}
          </div>
        );
      }),
    [p, adYear]
  );

  const distKey = p.districts[0];
  const tipText =
    guide.districtTip[distKey] ||
    guide.districtTip.default ||
    guide.districtTip[Object.keys(guide.districtTip)[0]];

  const prem = premiumDocs[p.slug];

  return (
    <article>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
        <span style={{ fontSize: 50, lineHeight: 1 }}>{p.emoji}</span>
        <div style={{ flex: 1 }}>
          <h1 className="modal-product-name" style={{ marginTop: 0 }}>
            {p.name}
          </h1>
          <p className="modal-nepali" style={{ marginTop: 0 }}>
            {p.nepali}
          </p>
          {p.imported ? (
            <div className="import-drain-banner">
              <div className="import-drain-amount">Rs.{p.annualImportNPR} Crore</div>
              <div className="import-drain-label">
                Annual import from {p.importSource} — money leaving Nepal every year
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="modal-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`modal-tab-btn${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "prices" && (
        <div className="modal-tab-pane active">
          {priceLoading ? (
            <div style={{ color: "rgba(255,255,255,0.5)", padding: "20px 0" }}>
              <div className="modal-stat-skeleton" style={{ width: "60%", height: 28, marginBottom: 12 }} aria-hidden />
              <div className="modal-stat-skeleton" style={{ width: "40%", height: 20 }} aria-hidden />
            </div>
          ) : prem ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="modal-grid">
                <div className="modal-stat">
                  <div className="modal-stat-label">Nepal (Farmgate & Export)</div>
                  <div className="modal-stat-value">{prem.nepalFarmgate}</div>
                  <div className="modal-stat-hint">{prem.nepalHint}</div>
                </div>
                <div className="modal-stat">
                  <div className="modal-stat-label">India Wholesale</div>
                  <div className="modal-stat-value" style={{ fontSize: 18 }}>{prem.indiaWholesale}</div>
                  <div className="modal-stat-hint">{prem.indiaHint}</div>
                </div>
                <div className="modal-stat">
                  <div className="modal-stat-label">USA Retail</div>
                  <div className="modal-stat-value" style={{ color: "var(--purple)" }}>
                    {prem.usaRetail}
                  </div>
                  <div className="modal-stat-hint">{prem.usaHint}</div>
                </div>
                <div className="modal-stat">
                  <div className="modal-stat-label">Australia Retail</div>
                  <div className="modal-stat-value" style={{ color: "var(--purple)" }}>
                    {prem.auRetail}
                  </div>
                  <div className="modal-stat-hint">{prem.auHint}</div>
                </div>
                <div className="modal-stat" style={{ gridColumn: "1 / -1" }}>
                  <div className="modal-stat-label">Logistics & Shelf Life</div>
                  <div className="modal-stat-value" style={{ fontSize: 16 }}>
                    {prem.shelfLife}
                  </div>
                  <div className="modal-stat-hint" style={{ marginTop: 4 }}>
                    {prem.shelfLifeHint}
                  </div>
                </div>
              </div>

              <div className="modal-grid">
                <div className="modal-stat">
                  <div className="modal-stat-label">Opportunity Score</div>
                  <div className="modal-stat-value" style={{ color: "var(--gold)" }}>{prem.opportunityScore}</div>
                  <div className="modal-stat-hint">{prem.opportunityHint}</div>
                </div>
                <div className="modal-stat">
                  <div className="modal-stat-label">Current Export Value</div>
                  <div className="modal-stat-value" style={{ fontSize: 18 }}>{prem.exportValue}</div>
                  <div className="modal-stat-hint">{prem.exportValueHint}</div>
                </div>
                <div className="modal-stat" style={{ gridColumn: "1 / -1" }}>
                  <div className="modal-stat-label">Global Competitiveness</div>
                  <div className="modal-stat-hint" style={{ marginTop: 4, fontSize: 13, lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: prem.globalCompetitiveness }}>
                  </div>
                </div>
                <div className="modal-stat" style={{ gridColumn: "1 / -1" }}>
                  <div className="modal-stat-label">Market Verdict: Will It Be Consumed?</div>
                  <div className="modal-stat-hint" style={{ marginTop: 4, fontSize: 13, lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: prem.willBeConsumed }}>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="modal-grid">
              <div className="modal-stat">
                <div className="modal-stat-label">Nepal (Kalimati wholesale)</div>
                {kalimatiMatch ? (
                  <>
                    <div className="modal-stat-value">
                      {fmtPrice(kalimatiMatch.average)}/
                      {kalimatiMatch.unit === "KG" ? "kg" : kalimatiMatch.unit}
                    </div>
                    <div className="modal-stat-hint">
                      Min {fmtPrice(kalimatiMatch.minimum)} · Max {fmtPrice(kalimatiMatch.maximum)} · official
                      board table
                    </div>
                  </>
                ) : (
                  <>
                    <div className="modal-stat-value modal-stat-missing">—</div>
                    <div className="modal-stat-hint">
                      No row matched today&apos;s Kalimati list for &ldquo;{p.nepali}&rdquo;. See{" "}
                      <a href="https://kalimatimarket.gov.np/price" target="_blank" rel="noopener noreferrer">
                        full table
                      </a>
                      .
                    </div>
                  </>
                )}
              </div>
              <div className="modal-stat">
                <div className="modal-stat-label">India wholesale</div>
                <div className="modal-stat-value">
                  {p.indiaPrice ? `${fmtPrice(p.indiaPrice)}/kg` : "N/A"}
                </div>
              </div>
              <div className="modal-stat">
                <div className="modal-stat-label">USA retail</div>
                <div className="modal-stat-value" style={{ color: "var(--purple)" }}>
                  {fmtPrice(p.usaPrice, "$")}/kg
                </div>
              </div>
              <div className="modal-stat">
                <div className="modal-stat-label">Australia</div>
                <div className="modal-stat-value" style={{ color: "var(--purple)" }}>
                  {fmtPrice(p.auPrice, "A$")}/kg
                </div>
              </div>
              <div className="modal-stat">
                <div className="modal-stat-label">Shelf life</div>
                <div className="modal-stat-value">
                  {p.shelf === 999 ? "Indefinite" : `${p.shelf} months`}
                </div>
              </div>
              <div className="modal-stat">
                <div className="modal-stat-label">Opportunity score</div>
                <div className="modal-stat-value">{p.opportunity}/100</div>
              </div>
              {p.imported ? (
                <div
                  className="modal-stat"
                  style={{
                    gridColumn: "1 / -1",
                    background: "rgba(192,57,43,0.1)",
                    borderColor: "rgba(255,107,107,0.25)",
                  }}
                >
                  <div className="modal-stat-label" style={{ color: "#fb7185" }}>
                    Annual import drain
                  </div>
                  <div className="modal-stat-value" style={{ color: "#fb7185" }}>
                    Rs.{p.annualImportNPR} Crore/year from {p.importSource}
                  </div>
                </div>
              ) : (
                <div className="modal-stat">
                  <div className="modal-stat-label">Export value</div>
                  <div className="modal-stat-value">
                    {p.exportVal > 0 ? `Rs.${p.exportVal}M/yr` : "Near zero"}
                  </div>
                </div>
              )}
            </div>
          )}
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "var(--t4)",
                marginBottom: 8,
              }}
            >
              Best districts
            </div>
            {p.districts.map((d) => {
              const slug = resolveDistrictSlug(d);
              return slug ? (
                <Link key={d} href={`/districts/${slug}`} className="crop-tag">
                  {d}
                </Link>
              ) : (
                <span key={d} className="crop-tag">
                  {d}
                </span>
              );
            })}
          </div>
          <div className="modal-insight" style={{ marginTop: 14 }}>
            {p.insight}
          </div>
        </div>
      )}

      {tab === "soil" && (
        <div className="modal-tab-pane active">
          <div className="soil-grid">
            <div className="soil-card">
              <div className="soil-card-label">Soil type</div>
              <div className="soil-card-value">{p.soilType || "Loamy, well-drained"}</div>
            </div>
            <div className="soil-card">
              <div className="soil-card-label">Required pH</div>
              <div
                className="soil-card-value"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--gold)",
                }}
              >
                {p.soilPH || "6.0–7.0"}
              </div>
            </div>
            <div className="soil-card" style={{ gridColumn: "1 / -1" }}>
              <div className="soil-card-label">Organic matter</div>
              <div className="soil-card-value">
                {p.organicMatter || "Add 5-8 tonnes/ha well-rotted compost annually."}
              </div>
            </div>
          </div>
          <div
            style={{
              background: "rgba(139,90,43,0.08)",
              border: "1px solid rgba(139,90,43,0.2)",
              padding: 14,
              borderRadius: 8,
              marginTop: 10,
            }}
          >
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "var(--t4)",
                marginBottom: 8,
              }}
            >
              Irrigation
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }} lang="ne">
              {loc(p.irrigation || "Moderate — 3-4 irrigations during growing season.")}
            </div>
          </div>
          <div
            style={{
              background: "rgba(139,92,246,0.06)",
              border: "1px solid rgba(139,92,246,0.15)",
              padding: 14,
              borderRadius: 8,
              marginTop: 10,
            }}
          >
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "var(--purple)",
                marginBottom: 4,
              }}
            >
              Production zone
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{p.zone}</div>
          </div>
        </div>
      )}

      {tab === "climate" && (
        <div className="modal-tab-pane active">
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "var(--t4)",
              marginBottom: 10,
            }}
          >
            Growing season calendar
          </div>
          <div className="season-timeline-note" lang="ne">
            प्रत्येक कोलम ग्रेगोरियन महिना (जन–डिस) हो। लेबल सो महिनाको १५ गते अनुसारको बिक्रम संवत महिना हो।
          </div>
          <div className="season-timeline">{timeline}</div>
          <div className="climate-grid">
            <div className="climate-card">
              <div className="soil-card-label">Temperature range</div>
              <div className="soil-card-value">{p.tempRange || "15°C–30°C ideal"}</div>
            </div>
            <div className="climate-card">
              <div className="soil-card-label">Rainfall</div>
              <div className="soil-card-value">{p.rainfall || "400-800mm annual"}</div>
            </div>
            <div className="climate-card">
              <div className="soil-card-label">Climate type</div>
              <div className="soil-card-value">{p.climateType || "Subtropical"}</div>
            </div>
            <div className="climate-card">
              <div className="soil-card-label">Irrigation</div>
              <div className="soil-card-value">{p.irrigation || "Moderate"}</div>
            </div>
          </div>
          <div
            style={{
              background: "rgba(245,200,66,0.07)",
              border: "1px solid rgba(245,200,66,0.2)",
              padding: 14,
              borderRadius: 8,
              marginTop: 10,
            }}
          >
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 6,
              }}
            >
              Full season timeline
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }} lang="ne">
              {loc(p.season)}
            </div>
          </div>
        </div>
      )}

      {tab === "ai" && (
        <div className="modal-tab-pane active">
          <div className="ai-suggestion-box">
            <div className="ai-badge">Suggested summary — not official government advice</div>
            <div className="ai-suggestion-text" lang="ne">
              {loc(
                p.aiSuggestion ||
                  "This product has strong potential in Nepal. Contact your local Agricultural Knowledge Centre (AKC) or NARC for region-specific guidance."
              )}
            </div>
            <div className="ai-disclaimer">
              This text is based on agronomic and economic notes in the dataset. Always consult
              local agricultural experts and market conditions before investing.
            </div>
          </div>
        </div>
      )}

      {tab === "grow" && (
        <div className="modal-tab-pane active">
          <div className="district-tip">
            <div className="district-tip-header">District-specific advice — {distKey}</div>
            <div className="district-tip-text" lang="ne">
              {loc(tipText)}
            </div>
          </div>
          <div className="grow-guide-section">
            <div className="grow-guide-sub">Step-by-step growing instructions</div>
            {guide.steps.map((s, i) => (
              <div key={s.title} className="grow-step">
                <div className="grow-step-num">{i + 1}</div>
                <div>
                  <div className="grow-step-title" lang="ne">
                    {s.emoji} {loc(s.title)}
                  </div>
                  <div className="grow-step-desc" lang="ne">
                    {loc(s.desc)}
                  </div>
                  {s.nepal ? <div className="grow-step-nepal">{loc(s.nepal)}</div> : null}
                </div>
              </div>
            ))}
          </div>
          {guide.warnings ? (
            <div className="warning-box">
              <div className="warning-box-title">Critical warnings</div>
              <div className="warning-box-text" lang="ne">
              {loc(guide.warnings)}
            </div>
            </div>
          ) : null}
          <div className="video-section">
            <div className="video-section-title">Video tutorials</div>
            {guide.videos.map((v) => (
              <div key={v.id} className="video-card">
                <div className="video-embed">
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1`}
                    title={loc(v.title)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className="video-meta">
                  <div className="video-title" lang="ne">
                    {loc(v.title)}
                  </div>
                  <div className="video-desc" lang="ne">
                    {loc(v.desc)}
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${v.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 12,
                      color: "var(--purple)",
                      marginTop: 6,
                      display: "inline-block",
                    }}
                  >
                    Open in YouTube
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
