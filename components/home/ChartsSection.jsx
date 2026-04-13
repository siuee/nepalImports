"use client";

import { useEffect, useRef } from "react";

const EXPORT_DEST = [
  { flag: "IN", name: "India", pct: 90, value: "Rs.248B", color: "#f59e0b" },
  { flag: "DE", name: "Germany", pct: 3, value: "Rs.8B", color: "#a855f7" },
  { flag: "US", name: "USA", pct: 2, value: "Rs.5B", color: "#ec4899" },
  { flag: "JP", name: "Japan", pct: 2, value: "Rs.5B", color: "#22d3ee" },
  { flag: "AU", name: "Australia", pct: 0.3, value: "Rs.0.8B", color: "rgba(168,85,247,0.4)" },
  { flag: "~", name: "Rest of World", pct: 2.7, value: "Rs.7B", color: "rgba(255,255,255,0.12)" },
];

const IMPORT_PRODUCTS = [
  { flag: "*", name: "Cereals (Rice/Wheat)", val: 60.76, pct: 100, color: "#f43f5e" },
  { flag: "*", name: "Vegetables & Lentils", val: 37.73, pct: 62, color: "#ec4899" },
  { flag: "*", name: "Fruits", val: 21.17, pct: 35, color: "#a855f7" },
  { flag: "*", name: "Potatoes", val: 7.67, pct: 13, color: "#fbbf24" },
  { flag: "*", name: "Garlic", val: 6.75, pct: 11, color: "#f59e0b" },
  { flag: "*", name: "Onions", val: 4.42, pct: 7, color: "rgba(245,158,11,0.6)" },
];

const DONUT = [
  { name: "Edible Oil Re-export", pct: 44, color: "#f59e0b" },
  { name: "Large Cardamom", pct: 11, color: "#a855f7" },
  { name: "Carpets & Textiles", pct: 10, color: "#22d3ee" },
  { name: "Tea & Coffee", pct: 5, color: "#ec4899" },
  { name: "Iron & Steel", pct: 8, color: "#3b82f6" },
  { name: "Herbs & Spices", pct: 4, color: "#f43f5e" },
  { name: "Others", pct: 18, color: "rgba(255,255,255,0.1)" },
];

const VALUE_CHAIN = [
  { flag: "1", name: "Fresh (Farm Gate)", pct: 2, color: "rgba(168,85,247,0.4)", fmt: "Rs.94/kg" },
  { flag: "2", name: "Sun-dried (Sutho)", pct: 7, color: "rgba(168,85,247,0.55)", fmt: "Rs.300/kg" },
  { flag: "3", name: "Ground Powder", pct: 14, color: "rgba(236,72,153,0.55)", fmt: "Rs.600/kg" },
  { flag: "4", name: "Organic Certified", pct: 23, color: "rgba(251,191,36,0.6)", fmt: "Rs.1,000/kg" },
  { flag: "5", name: "Direct USA Export", pct: 100, color: "#a855f7", fmt: "Rs.4,300/kg" },
];

const POTENTIAL = [
  { country: "USA", cur: "$30,000", pot: "$7.6M", pct: 0.4, col: "#f43f5e" },
  { country: "Australia", cur: "$5,000", pot: "$1.2M", pct: 0.4, col: "#ec4899" },
  { country: "Germany", cur: "$2.7M", pot: "$5.4M", pct: 50, col: "#fbbf24" },
];

function barSecondary(d) {
  if ("fmt" in d) return `${d.fmt} · ${d.pct}%`;
  if ("val" in d) return `${d.val}B NPR · ${d.pct}%`;
  return `${d.value} · ${d.pct}%`;
}

function BarChart({ rows }) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.querySelectorAll(".bar-fill").forEach((b) => {
            const w = b.dataset.w;
            if (w) setTimeout(() => (b.style.width = w), 200);
          });
          io.unobserve(e.target);
        });
      },
      { threshold: 0.15 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);
  return (
    <div className="bar-chart" ref={ref}>
      {rows.map((d) => (
        <div key={d.name} className="bar-row">
          <div className="bar-country">{d.flag}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: "0%", background: d.color, color: "white" }}
              data-w={`${d.pct}%`}
            >
              <span>{d.name}</span>
              <span className="bar-label">{barSecondary(d)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartsSection() {
  const r = 65;
  const cx = 80;
  const cy = 80;
  const circ = 2 * Math.PI * r;
  let off = 0;
  const segs = DONUT.map((d) => {
    const dl = (d.pct / 100) * circ;
    const gap = circ - dl;
    const rot = (off / 100) * 360;
    off += d.pct;
    return (
      <circle
        key={d.name}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={d.color}
        strokeWidth={20}
        strokeDasharray={`${dl} ${gap}`}
        strokeDashoffset={circ * 0.25}
        transform={`rotate(${rot - 90} ${cx} ${cy})`}
      />
    );
  });

  return (
    <section className="chart-section" id="charts">
      <div className="section-header fade-in-section visible">
        <div>
          <div className="section-eyebrow">Data analytics</div>
          <h2 className="section-title">
            The Numbers That
            <br />
            <span className="italic">Tell the Story</span>
          </h2>
          <p className="charts-live-note">
            Charts below use static reference aggregates for storytelling. Live official feeds on this page:
            Kalimati (wholesale), NRB (forex), Open-Meteo (weather), and NARC (soil portal). For machine-readable
            global trade series, wire{" "}
            <a href="https://comtradeapi.un.org" target="_blank" rel="noopener noreferrer">
              UN Comtrade
            </a>{" "}
            or{" "}
            <a href="https://www.fao.org/faostat/en/#data" target="_blank" rel="noopener noreferrer">
              FAOSTAT
            </a>{" "}
            with your own API keys and replace these blocks.
          </p>
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-card fade-in-section visible">
          <div className="chart-title">Nepal export destinations</div>
          <div className="chart-subtitle">Where Nepal&apos;s exports go</div>
          <BarChart rows={EXPORT_DEST} />
        </div>
        <div className="chart-card fade-in-section visible">
          <div className="chart-title">Annual import bill by product</div>
          <div className="chart-subtitle">Billion rupees</div>
          <BarChart rows={IMPORT_PRODUCTS} />
        </div>
        <div className="chart-card fade-in-section visible">
          <div className="chart-title">Nepal export composition</div>
          <div className="chart-subtitle">What Nepal exports</div>
          <div className="donut-container">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={20}
              />
              {segs}
              <text
                x={cx}
                y={cy - 5}
                textAnchor="middle"
                fill="var(--t1)"
                fontSize={12}
                fontWeight={700}
              >
                Export
              </text>
              <text
                x={cx}
                y={cy + 10}
                textAnchor="middle"
                fill="rgba(255,255,255,0.35)"
                fontSize={9}
              >
                mix
              </text>
            </svg>
            <div className="donut-legend">
              {DONUT.map((d) => (
                <div key={d.name} className="donut-item">
                  <div className="donut-color" style={{ background: d.color }} />
                  <div className="donut-name">{d.name}</div>
                  <div className="donut-pct">{d.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="chart-card fade-in-section visible">
          <div className="chart-title">Value chain — ginger</div>
          <div className="chart-subtitle">Farm to shelf</div>
          <BarChart rows={VALUE_CHAIN} />
        </div>
        <div className="chart-card full fade-in-section visible">
          <div className="chart-title">Direct export potential</div>
          <div className="chart-subtitle">Illustrative comparison</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 18,
              marginTop: 16,
            }}
          >
            {POTENTIAL.map((d) => (
              <div
                key={d.country}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  padding: 26,
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    fontFamily: "Bricolage Grotesque, sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 18,
                  }}
                >
                  {d.country}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 12,
                      letterSpacing: 1.5,
                      color: "var(--t4)",
                      marginBottom: 4,
                    }}
                  >
                    CURRENT
                  </div>
                  <div style={{ fontSize: 18, color: "var(--red)", fontWeight: 700 }}>{d.cur}</div>
                </div>
                <div style={{ fontSize: 22, color: "rgba(255,255,255,0.08)", fontWeight: 900 }}>
                  →
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 12,
                      letterSpacing: 1.5,
                      color: "var(--t4)",
                      marginBottom: 4,
                    }}
                  >
                    POTENTIAL
                  </div>
                  <div style={{ fontSize: 24, color: "var(--purple)", fontWeight: 700 }}>{d.pot}</div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      height: 5,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${d.pct}%`,
                        background: d.col,
                        borderRadius: 8,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
