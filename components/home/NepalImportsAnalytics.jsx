"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { nprPerUsdFromNrbForex } from "@/lib/live/nrb";
import nepalImports from "@/data/nepalImportsByHs.json";

const PALETTE = [
  "#a855f7",
  "#f59e0b",
  "#22d3ee",
  "#ec4899",
  "#3b82f6",
  "#f43f5e",
  "#84cc16",
  "#eab308",
  "rgba(168,85,247,0.55)",
  "rgba(245,158,11,0.55)",
  "rgba(34,211,238,0.55)",
  "rgba(236,72,153,0.55)",
  "rgba(59,130,246,0.55)",
  "rgba(244,63,94,0.55)",
  "rgba(255,255,255,0.14)",
];

function formatUsdMillion(m) {
  if (m >= 1000) return `$${(m / 1000).toFixed(2)}B`;
  if (m >= 100) return `$${Math.round(m)}M`;
  return `$${m.toFixed(0)}M`;
}

function formatNprApprox(usdMillion, nprPerUsd) {
  const npr = usdMillion * 1_000_000 * nprPerUsd;
  try {
    return new Intl.NumberFormat("ne-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(npr);
  } catch {
    return `रू ${Math.round(npr / 1e8) / 10} अरब`;
  }
}

/** Annual import bill — Western digit grouping only (no currency prefix). */
function formatAnnualNprLatin(totalUsdBillion, nprPerUsd) {
  const npr = totalUsdBillion * 1e9 * nprPerUsd;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(npr));
}

function ShareLadder({ rows, nprPerUsd, nprReady }) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.querySelectorAll(".nepal-imports-ladder-fill").forEach((b) => {
            const w = b.dataset.w;
            if (w) setTimeout(() => (b.style.width = w), 120);
          });
          io.unobserve(e.target);
        });
      },
      { threshold: 0.08 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <div className="nepal-imports-ladder-scroll" ref={ref}>
      <div className="nepal-imports-ladder">
        {rows.map((c) => (
          <div
            key={`${c.rank}-${c.chapter}`}
            className={`nepal-imports-ladder-row${c.agRelated ? " nepal-imports-ladder-row-ag" : ""}`}
          >
            <div className="nepal-imports-ladder-top">
              <div className="nepal-imports-ladder-left">
                <div className="nepal-imports-ladder-sn-line">
                  <span className="nepal-imports-ladder-sn" title="क्रम">
                    {c.rank}
                  </span>
                </div>
                <span className="nepal-imports-ladder-title">{c.title}</span>
                {c.detail ? <span className="nepal-imports-ladder-detail">{c.detail}</span> : null}
                {c.agRelated ? (
                  <span className="nepal-imports-ag-badge" title="Food, farm inputs, or primary ag commodities">
                    कृषि सम्बन्धी
                  </span>
                ) : null}
              </div>
              <div className="nepal-imports-ladder-right">
                <span className="nepal-imports-ladder-pct">{c.pct}%</span>
                <span className="nepal-imports-ladder-usd">{formatUsdMillion(c.usdMillion)}</span>
                <span className="nepal-imports-ladder-npr" lang="ne">
                  {nprReady ? formatNprApprox(c.usdMillion, nprPerUsd) : "…"}
                </span>
              </div>
            </div>
            <div className="nepal-imports-ladder-track">
              <div
                className="nepal-imports-ladder-fill"
                style={{ width: "0%", background: c.color }}
                data-w={`${Math.max(4, Math.min(100, c.pct * 2.85))}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NepalImportsAnalytics() {
  const { meta, chapters } = nepalImports;
  const fallbackNprPerUsd = meta.approxNprPerUsd ?? 133;
  const [nprPerUsd, setNprPerUsd] = useState(null);
  const [fxMeta, setFxMeta] = useState({ fromNrb: false, publishedDate: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/live/forex", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        const live = nprPerUsdFromNrbForex(data);
        if (live != null && live > 0) {
          setNprPerUsd(live);
          setFxMeta({ fromNrb: true, publishedDate: data.publishedDate ?? null });
        } else {
          setNprPerUsd(fallbackNprPerUsd);
          setFxMeta({ fromNrb: false, publishedDate: null });
        }
      } catch {
        if (!cancelled) {
          setNprPerUsd(fallbackNprPerUsd);
          setFxMeta({ fromNrb: false, publishedDate: null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fallbackNprPerUsd]);

  const nprReady = nprPerUsd != null;

  const annualNprHeadline = useMemo(() => {
    if (nprPerUsd == null) return null;
    return formatAnnualNprLatin(meta.totalUsdBillion, nprPerUsd);
  }, [meta.totalUsdBillion, nprPerUsd]);

  const colored = useMemo(
    () =>
      chapters.map((c, i) => ({
        ...c,
        color: PALETTE[i % PALETTE.length],
        agRelated: Boolean(c.agRelated),
      })),
    [chapters]
  );

  const sorted = useMemo(() => [...colored].sort((a, b) => b.pct - a.pct), [colored]);
  const rankedRows = useMemo(() => sorted.map((c, idx) => ({ ...c, rank: idx + 1 })), [sorted]);

  return (
    <div className="chart-card full nepal-imports-card fade-in-section visible">
      <div className="nepal-imports-header">
        <div className="nepal-imports-header-row">
          <div className="nepal-imports-header-copy">
            <div className="chart-title">Nepal import condition</div>
            <h3 className="nepal-imports-headline">
              Total imports by story — <span className="italic">HS chapters</span>
            </h3>
            <div className="nepal-imports-links">
              <span className="nepal-imports-source-prefix">Official source:</span>
              <a href={meta.sourceUrl} target="_blank" rel="noopener noreferrer">
                Department of Customs
              </a>
              <span className="nepal-imports-dot" aria-hidden>
                ·
              </span>
              <a href={meta.statisticsUrl} target="_blank" rel="noopener noreferrer">
                Foreign trade statistics archive
              </a>
            </div>
          </div>
          <div className="nepal-imports-header-kpi" aria-label="वार्षिक आयात सारांश">
            <div className="nepal-imports-kpi-orbit-wrap nepal-imports-kpi-header-mini">
              <div className="nepal-imports-kpi-orbit-spin" aria-hidden />
              <div className="nepal-imports-kpi nepal-imports-kpi-danger nepal-imports-kpi-orbit-inner" lang="ne">
                <div className="nepal-imports-kpi-nepali-label">वार्षिक कुल आयात (लगभग, ने.रू)</div>
                <div className="nepal-imports-kpi-value nepal-imports-kpi-value-latin">
                  {annualNprHeadline ?? (
                    <span className="nepal-imports-fx-loading" aria-busy="true">
                      NRB दर लोड हुँदै…
                    </span>
                  )}
                </div>
                <div className="nepal-imports-kpi-hint nepal-imports-kpi-hint-compact">
                  {nprReady ? (
                    <>
                      ~${meta.totalUsdBillion}B USD ×{" "}
                      {fxMeta.fromNrb ? (
                        <>
                          <strong>रू {nprPerUsd.toFixed(2)}</strong> / $1
                          {fxMeta.publishedDate ? (
                            <>
                              {" "}
                              <span className="nepal-imports-fx-date">({fxMeta.publishedDate})</span>
                            </>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <strong>रू {nprPerUsd.toFixed(2)}</strong> / $1 <span lang="ne">(लगभग)</span>
                        </>
                      )}
                    </>
                  ) : (
                    <span lang="ne">नेपाल राष्ट्र बैंकको USD दर लोड हुँदै…</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="nepal-imports-panel nepal-imports-panel-ladder">
        <div className="nepal-imports-panel-title">Share ladder</div>
        <div className="nepal-imports-panel-sub">
          सि.नं. = क्रम · हरु हरियो = कृषि सम्बन्धी · तल स्क्रोल गर्नुहोस्
        </div>
        <ShareLadder rows={rankedRows} nprPerUsd={nprPerUsd ?? 0} nprReady={nprReady} />
      </div>
    </div>
  );
}
