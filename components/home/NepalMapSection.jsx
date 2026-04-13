"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DISTRICTS } from "@/data/db";
import { NEPAL_MAP_CELLS } from "@/lib/nepalMapGrid";
import { resolveProductSlugFromCropLabel } from "@/lib/catalog";

const W = 920;
const H = 340;
const padding = 4;
const cols = 14;
const rows = 7;
const cellW = Math.floor((W - padding * 2) / cols);
const cellH = Math.floor((H - padding * 2) / rows);

const provColors = {
  1: "rgba(124,58,237,",
  2: "rgba(236,72,153,",
  3: "rgba(59,130,246,",
  4: "rgba(168,85,247,",
  5: "rgba(16,185,129,",
  6: "rgba(239,68,68,",
  7: "rgba(245,158,11,",
};

function DistrictLiveWeather({ districtId }) {
  const [state, setState] = useState({ loading: true, data: null, err: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, data: null, err: null });
    fetch(`/api/live/weather?id=${encodeURIComponent(districtId)}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) setState({ loading: false, data: null, err: j.message });
        else setState({ loading: false, data: j, err: null });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, data: null, err: "Weather unavailable" });
      });
    return () => {
      cancelled = true;
    };
  }, [districtId]);

  if (state.loading) {
    return (
      <div className="district-weather district-weather-loading">
        Live weather (Open-Meteo)…
      </div>
    );
  }
  if (state.err || !state.data) {
    return (
      <div className="district-weather district-weather-error">
        {state.err || "Could not load weather"}
      </div>
    );
  }
  const w = state.data;
  return (
    <div className="district-weather">
      <div className="district-weather-title">Live weather · Open-Meteo</div>
      <div className="district-weather-row">
        <span>{w.temperatureC}°C</span>
        <span>humidity {w.humidity}%</span>
        <span>rain {w.precipitationMm} mm</span>
      </div>
      <div className="district-weather-sub">Updated {w.time} (Asia/Kathmandu)</div>
    </div>
  );
}

const LEGENDS = {
  opportunity: (
    <>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: "rgba(52,211,153,0.65)" }} />
        High Opportunity
      </div>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: "rgba(52,211,153,0.32)" }} />
        Medium
      </div>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: "rgba(52,211,153,0.12)" }} />
        Lower
      </div>
    </>
  ),
  import: (
    <>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: "rgba(192,57,43,0.6)" }} />
        Heavy Importer
      </div>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: "rgba(232,151,26,0.5)" }} />
        Medium
      </div>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: "rgba(52,211,153,0.2)" }} />
        Low Import
      </div>
    </>
  ),
  food: (
    <>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: "rgba(192,57,43,0.55)" }} />
        Food Deficit
      </div>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: "rgba(251,146,60,0.3)" }} />
        Partial
      </div>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: "rgba(52,211,153,0.45)" }} />
        Sufficient
      </div>
    </>
  ),
};

export function NepalMapSection() {
  const distMap = useMemo(
    () => Object.fromEntries(DISTRICTS.map((d) => [d.id, d])),
    []
  );

  const [mode, setMode] = useState("opportunity");
  const [selectedId, setSelectedId] = useState(null);
  const [tip, setTip] = useState({ show: false, x: 0, y: 0, d: null });

  const selected = selectedId ? distMap[selectedId] : null;

  return (
    <section className="map-section" id="map">
      <div className="section-header fade-in-section visible">
        <div>
          <div className="section-eyebrow">Interactive district map</div>
          <h2 className="section-title">
            All 77 Districts.
            <br />
            Click to <span className="italic">Explore.</span>
          </h2>
        </div>
      </div>
      <div className="map-mode-btns" style={{ marginBottom: 20 }}>
        <button
          type="button"
          className={`map-mode-btn${mode === "opportunity" ? " active" : ""}`}
          onClick={() => setMode("opportunity")}
        >
          Opportunity Score
        </button>
        <button
          type="button"
          className={`map-mode-btn${mode === "import" ? " active" : ""}`}
          onClick={() => setMode("import")}
        >
          Import Drain
        </button>
        <button
          type="button"
          className={`map-mode-btn${mode === "food" ? " active" : ""}`}
          onClick={() => setMode("food")}
        >
          Food Security
        </button>
      </div>
      <div className="map-container">
        <div>
          <div className="map-wrapper">
            <div className="map-hint">Click a district — details open in the panel →</div>
            <svg
              id="nepalSvg"
              viewBox={`0 0 ${W} ${H}`}
              xmlns="http://www.w3.org/2000/svg"
              className={`mode-${mode}`}
            >
              {NEPAL_MAP_CELLS.map((g) => {
                const dist = distMap[g.id];
                if (!dist) return null;
                const x = padding + g.c * cellW;
                const y = padding + g.r * cellH;
                const pc = provColors[dist.prov] || "rgba(52,211,153,";
                const scoreClass =
                  dist.score >= 85 ? "dist-high" : dist.score >= 70 ? "dist-med" : "dist-low";
                const foodClass =
                  dist.food === "sufficient"
                    ? "dist-sufficient"
                    : dist.food === "partial"
                      ? "dist-partial"
                      : "dist-deficit";
                const displayName =
                  dist.name.length > 10 ? dist.name.substring(0, 9) + "." : dist.name;
                const fontSize = dist.name.length > 8 ? 5.5 : 6;
                return (
                  <g
                    key={g.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${dist.name}, ${dist.province}. Click for details.`}
                    className={`district ${scoreClass} ${foodClass}${selectedId === g.id ? " selected" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedId(g.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(g.id);
                      }
                    }}
                    onMouseEnter={(e) =>
                      setTip({
                        show: true,
                        x: e.clientX + 16,
                        y: e.clientY,
                        d: dist,
                      })
                    }
                    onMouseMove={(e) =>
                      setTip((t) => (t.show ? { ...t, x: e.clientX + 16, y: e.clientY } : t))
                    }
                    onMouseLeave={() => setTip((t) => ({ ...t, show: false }))}
                  >
                    <rect
                      x={x + 1}
                      y={y + 1}
                      width={cellW - 2}
                      height={cellH - 2}
                      rx={2}
                      fill={`${pc}0.28)`}
                      stroke={`${pc}0.45)`}
                      strokeWidth={0.8}
                    />
                    <text
                      x={x + cellW / 2}
                      y={y + cellH / 2 + 2}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.85)"
                      fontSize={fontSize}
                      fontFamily="JetBrains Mono, monospace"
                      style={{ pointerEvents: "none" }}
                    >
                      {displayName}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="map-legend">{LEGENDS[mode]}</div>
          </div>
        </div>
        <div className={`district-panel${selected ? " active" : ""}`}>
          {!selected ? (
            <div className="panel-placeholder">
              <span className="panel-placeholder-icon">Map</span>
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "var(--t4)",
                }}
              >
                Select a district
                <br />
                जिल्ला छान्ुस्
              </div>
            </div>
          ) : (
            <>
              <div className="district-name">{selected.name}</div>
              <div className="district-province">{selected.province} Province · प्रदेश</div>
              <div className="district-stats-grid">
                <div className="dst">
                  <div className="dst-label">Import Bill/yr</div>
                  <div className="dst-value">Rs.{selected.import} Crore</div>
                </div>
                <div className="dst">
                  <div className="dst-label">Opp. Score</div>
                  <div className="dst-value">{selected.score}/100</div>
                </div>
                <div className="dst">
                  <div className="dst-label">Food Status</div>
                  <div className="dst-value" style={{ fontSize: 13, textTransform: "capitalize" }}>
                    {selected.food}
                  </div>
                </div>
                <div className="dst">
                  <div className="dst-label">Province</div>
                  <div className="dst-value" style={{ fontSize: 13 }}>
                    {selected.province}
                  </div>
                </div>
              </div>
              <DistrictLiveWeather districtId={selected.id} />
              <div className="climate-soil">Climate: {selected.climate}</div>
              <div className="climate-soil">Soil: {selected.soil}</div>
              <div className="narc-soil-link">
                <a href="https://soil.narc.gov.np" target="_blank" rel="noopener noreferrer">
                  NARC digital soil maps (pH, OM, types) →
                </a>
              </div>
              <div className="crops-list-title">
                Top products to grow &amp; export ({selected.crops.length} crops)
              </div>
              <div>
                {selected.crops.map((c) => {
                  const ps = resolveProductSlugFromCropLabel(c);
                  return ps ? (
                    <Link key={c} href={`/products/${ps}`} className="crop-tag">
                      {c}
                    </Link>
                  ) : (
                    <span key={c} className="crop-tag">
                      {c}
                    </span>
                  );
                })}
              </div>
              <div className="district-insight">Insight: {selected.insight}</div>
              <div className="opp-track-wrap">
                <div className="opp-track-label">
                  <span>Opportunity Score — अवसर अंक</span>
                  <span>{selected.score}/100</span>
                </div>
                <div className="opp-track">
                  <div className="opp-fill" style={{ width: `${selected.score}%` }} />
                </div>
              </div>
              <Link href={`/districts/${selected.slug}`} className="view-products-btn">
                Optional: open full page (bookmark / share) →
              </Link>
            </>
          )}
        </div>
      </div>

      <div
        className={`tooltip${tip.show && tip.d ? " visible" : ""}`}
        style={{
          left: tip.x,
          top: tip.y,
        }}
      >
        {tip.d && (
          <>
            <div className="tooltip-name">{tip.d.name}</div>
            <div className="tooltip-row">
              Import <span>Rs.{tip.d.import}Cr</span>
            </div>
            <div className="tooltip-row">
              Top Crop <span>{tip.d.crops[0]}</span>
            </div>
            <div className="tooltip-row">
              Score <span>{tip.d.score}/100</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
