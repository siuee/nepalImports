"use client";

import { spring } from "remotion";
import { useEffect, useMemo, useRef, useState } from "react";
import { nprPerUsdFromNrbForex } from "@/lib/live/nrb";
import tepcTrade from "@/data/tepcForeignTrade2081_82_shrawan_kartik.json";

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

function formatNprBillion(b) {
  return `Rs.${Number(b || 0).toFixed(3)}B`;
}

function toNepaliDigits(value) {
  const map = { "0": "०", "1": "१", "2": "२", "3": "३", "4": "४", "5": "५", "6": "६", "7": "७", "8": "८", "9": "९" };
  return String(value).replace(/[0-9]/g, (d) => map[d] ?? d);
}

function formatNprFullNepaliFrom000(v000) {
  // TEPC values are in "000 Rs", so convert to full rupees.
  let n = Math.max(0, Math.round(Number(v000 || 0) * 1000));
  if (!Number.isFinite(n) || n <= 0) return "रू ०";

  const KHARBA = 100_000_000_000;
  const ARBA = 1_000_000_000;
  const CRORE = 10_000_000;
  const LAKH = 100_000;
  const HAZAR = 1_000;

  const parts = [];
  const units = [
    [KHARBA, "खर्ब"],
    [ARBA, "अर्ब"],
    [CRORE, "करोड"],
    [LAKH, "लाख"],
    [HAZAR, "हजार"],
  ];

  for (const [base, label] of units) {
    if (n >= base) {
      const q = Math.floor(n / base);
      n %= base;
      parts.push(`${toNepaliDigits(q)} ${label}`);
    }
  }
  if (n > 0) parts.push(`${toNepaliDigits(n)}`);

  return `रू ${parts.join(" ")}`;
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
  const [frame, setFrame] = useState(0);
  const rafRef = useRef(null);
  const activeRef = useRef(false);
  const startTsRef = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const startAnimation = () => {
      if (activeRef.current) return;
      activeRef.current = true;
      startTsRef.current = null;
      setFrame(0);
      const tick = (ts) => {
        if (!activeRef.current) return;
        if (startTsRef.current == null) startTsRef.current = ts;
        const elapsedSec = (ts - startTsRef.current) / 1000;
        const nextFrame = Math.min(Math.floor(elapsedSec * 30), 150);
        setFrame(nextFrame);
        if (nextFrame < 150) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };
    const stopAnimation = () => {
      activeRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) startAnimation();
          else stopAnimation();
        });
      },
      { threshold: 0.08 }
    );
    io.observe(root);
    return () => {
      io.disconnect();
      activeRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [rows]);

  return (
    <div className="nepal-imports-ladder-scroll" ref={ref}>
      <div className="nepal-imports-ladder">
        {rows.map((c, index) => {
          const pctScaled = Math.max(4, Math.min(100, c.pct * 2.85));
          const grow = spring({
            frame: Math.max(0, frame - index * 3),
            fps: 30,
            config: { damping: 12, stiffness: 100, mass: 0.8 },
            from: 0,
            to: 1,
          });
          return (
            <div
              key={`${c.rank}-${c.chapter}`}
              className={`nepal-imports-ladder-row${c.agRelated ? " nepal-imports-ladder-row-ag" : ""}`}
              style={{
                opacity: Math.max(0.22, grow),
                transform: `translateY(${(1 - grow) * 8}px)`,
              }}
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
                  <span className="nepal-imports-ladder-pct">{Number(c.pct || 0).toFixed(2)}%</span>
                  <span className="nepal-imports-ladder-usd" lang="ne">
                    {formatNprFullNepaliFrom000(c.valueNpr000)}
                  </span>
                </div>
              </div>
              <div className="nepal-imports-ladder-track">
                <div
                  className="nepal-imports-ladder-fill"
                  style={{
                    width: `${pctScaled}%`,
                    background: c.color,
                    transform: `scaleX(${grow})`,
                    transformOrigin: "left center",
                    filter: `drop-shadow(0 2px 10px ${c.color}66)`,
                  }}
                />
                <span
                  className="nepal-imports-ladder-dot"
                  style={{
                    left: `${Math.min(pctScaled * grow, 99.2)}%`,
                    opacity: Math.max(0.25, grow),
                    boxShadow: `0 0 9px ${c.color}99`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function NepalImportsAnalytics() {
  const meta = tepcTrade?.meta || {};
  const importTotalNprBillion = meta.importTotalNprBillion ?? null;
  const periodNe = meta.periodLabelNe ?? "आयात";
  const periodEn = meta.periodLabel ?? "";
  const fallbackNprPerUsd = 133;
  const [nprPerUsd, setNprPerUsd] = useState(null);
  const [fxMeta, setFxMeta] = useState({ fromNrb: false, publishedDate: null });
  const [krishiOnly, setKrishiOnly] = useState(false);

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
    if (importTotalNprBillion != null) {
      return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
        Math.round(importTotalNprBillion * 1e9)
      );
    }
    // fallback: approximate from USD if present
    if (meta.totalUsdBillion != null) return formatAnnualNprLatin(meta.totalUsdBillion, nprPerUsd);
    return null;
  }, [importTotalNprBillion, meta.totalUsdBillion, nprPerUsd]);

  const commodities = useMemo(() => tepcTrade?.imports?.commodities || [], []);
  const colored = useMemo(() => {
    return commodities.map((c, i) => {
      const name =
        c?.name === "Others"
          ? "All remaining (grouped by Trade and Export Promotion Centre - TEPC)"
          : c?.name;
      const nprB = Number(c?.valueNprBillion) || 0;
      const valueNpr000 = Number(c?.valueNpr000) || Math.round(nprB * 1_000_000);
      const usdM = nprPerUsd ? (nprB * 1000) / nprPerUsd : 0;
      const pct = Number(c?.sharePct) || 0;
      const agRelated = /fertilizer|cereal|lentil|oil|seed|vegetable|fruit|animal|food/i.test(String(name || ""));
      return {
        chapter: String(c?.sn ?? i + 1),
        title: String(name || ""),
        detail: "",
        nprBillion: nprB,
        valueNpr000,
        usdMillion: usdM,
        pct,
        color: PALETTE[i % PALETTE.length],
        agRelated,
      };
    });
  }, [commodities, nprPerUsd]);

  const sorted = useMemo(() => {
    const isRemainderRow = (row) => row.title?.startsWith("All remaining");
    return [...colored].sort((a, b) => {
      const aIsRemainder = isRemainderRow(a);
      const bIsRemainder = isRemainderRow(b);
      if (aIsRemainder && !bIsRemainder) return 1;
      if (!aIsRemainder && bIsRemainder) return -1;
      return b.pct - a.pct;
    });
  }, [colored]);
  const rankedRows = useMemo(() => sorted.map((c, idx) => ({ ...c, rank: idx + 1 })), [sorted]);
  const visibleRows = useMemo(
    () => (krishiOnly ? rankedRows.filter((r) => r.agRelated) : rankedRows),
    [krishiOnly, rankedRows]
  );

  return (
    <div className="chart-card full nepal-imports-card fade-in-section visible">
      <div className="nepal-imports-header">
        <div className="nepal-imports-header-row">
          <div className="nepal-imports-header-copy">
            <div className="chart-title">Nepal import condition</div>
            <h3 className="nepal-imports-headline">
              Total imports by story — <span className="italic">major commodities</span>
            </h3>
            {periodEn ? (
              <p className="nepal-imports-period-en">{periodEn}</p>
            ) : null}
            <div className="nepal-imports-links">
              <span className="nepal-imports-source-prefix">Official source:</span>
              {meta.statisticsUrl ? (
                <a href={meta.statisticsUrl} target="_blank" rel="noopener noreferrer">
                  Nepal foreign trade statistics (TEPC · xlsx)
                </a>
              ) : null}
              <span className="nepal-imports-dot" aria-hidden>
                ·
              </span>
              {meta.sourceUrl ? (
                <a href={meta.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {meta.sourceName ?? "TEPC"}
                </a>
              ) : null}
            </div>
          </div>
          <div className="nepal-imports-header-kpi" aria-label="आयात सारांश">
            <div className="nepal-imports-kpi-orbit-wrap nepal-imports-kpi-header-mini">
              <div className="nepal-imports-kpi-orbit-spin" aria-hidden />
              <div className="nepal-imports-kpi nepal-imports-kpi-danger nepal-imports-kpi-orbit-inner" lang="ne">
                <div className="nepal-imports-kpi-nepali-label">
                  <span className="nepal-imports-kpi-period-ne">{periodNe}</span>
                  <span className="nepal-imports-kpi-nepali-sublabel"> · कुल आयात (लगभग, ने.रू)</span>
                </div>
                <div className="nepal-imports-kpi-value nepal-imports-kpi-value-latin">
                  {annualNprHeadline ?? (
                    <span className="nepal-imports-fx-loading" aria-busy="true">
                      NRB दर लोड हुँदै…
                    </span>
                  )}
                </div>
                <div className="nepal-imports-kpi-hint nepal-imports-kpi-hint-compact">
                  {importTotalNprBillion != null ? (
                    <span className="nepal-imports-tepc-benchmark">
                      TEPC Rs.{Number(importTotalNprBillion).toFixed(3)}B NPR (same window) ·{" "}
                    </span>
                  ) : null}
                  {nprReady ? (
                    <>
                      {importTotalNprBillion != null ? (
                        <>
                          ~${((importTotalNprBillion / nprPerUsd) * 1e0).toFixed(2)}B USD ×{" "}
                        </>
                      ) : meta.totalUsdBillion != null ? (
                        <>~${meta.totalUsdBillion}B USD × </>
                      ) : null}{" "}
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
        <div className="nepal-imports-panel-head">
          <div className="nepal-imports-panel-title">Share ladder</div>
          <button
            type="button"
            className={`nepal-imports-krishi-toggle${krishiOnly ? " is-active" : ""}`}
            onClick={() => setKrishiOnly((v) => !v)}
            aria-pressed={krishiOnly}
          >
            कृषि सम्बन्धी
          </button>
        </div>
        <div className="nepal-imports-panel-sub">
          सि.नं. = क्रम · हरियो = कृषि/खाद्य सम्बन्धी · TEPC (श्रावण–कार्तिक २०८१/८२) · तल स्क्रोल गर्नुहोस्
        </div>
        <ShareLadder
          key={krishiOnly ? "krishi-only" : "all-rows"}
          rows={visibleRows}
          nprPerUsd={nprPerUsd ?? 0}
          nprReady={nprReady}
        />
      </div>
    </div>
  );
}
