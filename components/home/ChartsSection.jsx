"use client";

import { useEffect, useRef } from "react";
import { NepalImportsAnalytics } from "@/components/home/NepalImportsAnalytics";
import {
  TepcAnimatedExportDestinations,
  TepcAnimatedImportPartners,
} from "@/components/ui/animated-vertical-bar-chart";
import tepcTrade from "@/data/tepcForeignTrade2081_82_shrawan_kartik.json";

function cleanOthersLabel(name) {
  return name === "Others"
    ? "All remaining (grouped by Trade and Export Promotion Centre - TEPC)"
    : name;
}

function TepcSourceLine() {
  const href = tepcTrade?.meta?.statisticsUrl;
  return (
    <p className="chart-tepc-source">
      {tepcTrade?.meta?.periodLabel ?? "FY 2081/82 Shrawan–Kartik (provisional)"} . Source:{" "}
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {tepcTrade?.meta?.sourceName ?? "Trade & Export Promotion Centre (TEPC)"}
        </a>
      ) : (
        <span>{tepcTrade?.meta?.sourceName ?? "Trade & Export Promotion Centre (TEPC)"}</span>
      )}{" "}
      — Government of Nepal.
    </p>
  );
}

const COLORS = ["#f59e0b", "#a855f7", "#22d3ee", "#ec4899", "#3b82f6", "#f43f5e", "#84cc16", "#eab308"];

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

function pct2(v) {
  return Number(v || 0).toFixed(2);
}

function toNepaliDigits(value) {
  const map = { "0": "०", "1": "१", "2": "२", "3": "३", "4": "४", "5": "५", "6": "६", "7": "७", "8": "८", "9": "९" };
  return String(value).replace(/[0-9]/g, (d) => map[d] ?? d);
}

function formatNprFullNepaliFrom000(v000) {
  let n = Math.max(0, Math.round(Number(v000 || 0) * 1000));
  if (!Number.isFinite(n) || n <= 0) return "रू ०";

  const KHARBA = 100_000_000_000;
  const ARBA = 1_000_000_000;
  const CRORE = 10_000_000;
  const LAKH = 100_000;
  const HAZAR = 1_000;
  const units = [
    [KHARBA, "खर्ब"],
    [ARBA, "अर्ब"],
    [CRORE, "करोड"],
    [LAKH, "लाख"],
    [HAZAR, "हजार"],
  ];
  const out = [];
  for (const [base, label] of units) {
    if (n >= base) {
      const q = Math.floor(n / base);
      n %= base;
      out.push(`${toNepaliDigits(q)} ${label}`);
    }
  }
  if (n > 0) out.push(`${toNepaliDigits(n)}`);
  return `रू ${out.join(" ")}`;
}

function barSecondary(d) {
  if ("fmt" in d) return `${d.fmt} · ${pct2(d.pct)}%`;
  if ("val000" in d) return `${formatNprFullNepaliFrom000(d.val000)} · ${pct2(d.pct)}%`;
  if ("val" in d) return `Rs.${d.val}B · ${pct2(d.pct)}%`;
  return `${d.value} · ${pct2(d.pct)}%`;
}

function compactLabel(name, max = 22) {
  const clean = String(name || "").replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
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
      {rows.map((d) => {
        const secondary = barSecondary(d);
        const shortName = compactLabel(d.name, 20);
        return (
          <div key={d.name} className="bar-row">
            <div className="bar-country">{d.flag}</div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: "0%", background: d.color, color: "white" }}
                data-w={`${d.pct}%`}
                data-fulltext={`${d.name} — ${secondary}`}
              >
                <span className="bar-name-short">{shortName}</span>
                <span className="bar-label">{secondary}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** FY 2080/81 (2024–25) reference — major ag food import costs in billion NPR. */
const AG_FOOD_IMPORTS = [
  {
    emoji: "🌾",
    name: "Cereals (Includes Rice, Wheat, and Maize)",
    billions: 60.76,
    color: "#fb7185",
  },
  {
    emoji: "🧅",
    name: "Vegetables & Lentils (Includes fresh veggies and dried Dal)",
    billions: 37.73,
    color: "#ec4899",
  },
  {
    emoji: "🍎",
    name: "Fruits (Includes Apples, Bananas, and Citrus)",
    billions: 21.17,
    color: "#c084fc",
  },
  {
    emoji: "🥔",
    name: "Potatoes",
    billions: 7.67,
    color: "#fbbf24",
  },
  {
    emoji: "🧄",
    name: "Garlic",
    billions: 6.75,
    color: "#fb923c",
  },
  {
    emoji: "🧅",
    name: "Onions",
    billions: 4.42,
    color: "#b45309",
  },
];

function AgFoodImportBars() {
  const ref = useRef(null);
  const maxB = Math.max(...AG_FOOD_IMPORTS.map((r) => r.billions), 1);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.querySelectorAll(".ag-food-bar-fill").forEach((b) => {
            const w = b.dataset.w;
            if (w) setTimeout(() => (b.style.width = w), 200);
          });
          io.unobserve(e.target);
        });
      },
      { threshold: 0.12 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <div className="ag-food-bar-chart" ref={ref}>
      {AG_FOOD_IMPORTS.map((row) => {
        const pct = (row.billions / maxB) * 100;
        const label = `${row.name} ${row.billions}B Rupees`;
        const shortLabel = `${compactLabel(row.name, 26)} ${row.billions}B`;
        const hoverFull = [
          "Nepal's Major Agricultural Food Imports",
          "Fiscal Year 2080/81 (2024-2025)",
          `Item Name: ${row.name}`,
          `Annual Import Cost (NPR): ${row.billions} Billion`,
        ].join("\n");
        return (
          <div key={row.name} className="ag-food-bar-row">
            <div className="ag-food-bar-emoji" aria-hidden>
              {row.emoji}
            </div>
            <div className="ag-food-bar-track">
              <div
                className="ag-food-bar-fill"
                style={{ width: "0%", background: row.color }}
                data-w={`${pct}%`}
                data-fulltext={hoverFull}
              >
                <span className="ag-food-bar-text">{shortLabel}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ChartsSection() {
  const exportTotal = Number(tepcTrade?.meta?.exportTotalNprBillion) || null;
  const importTotal = Number(tepcTrade?.meta?.importTotalNprBillion) || null;

  const exportPartners = (tepcTrade?.exports?.partners || []).map((p, i) => {
    const val = Number(p.valueNprBillion) || 0;
    const pct = exportTotal ? (val / exportTotal) * 100 : 0;
    return {
      flag: String(p.sn),
      name: cleanOthersLabel(p.name),
      value: `Rs.${val.toFixed(val >= 10 ? 1 : 3)}B`,
      pct: Number(pct.toFixed(2)),
      color: COLORS[i % COLORS.length],
    };
  });

  const importPartners = (tepcTrade?.imports?.partners || []).map((p, i) => {
    const val = Number(p.valueNprBillion) || 0;
    const pct = importTotal ? (val / importTotal) * 100 : 0;
    return {
      flag: String(p.sn),
      name: cleanOthersLabel(p.name),
      value: `Rs.${val.toFixed(val >= 10 ? 1 : 3)}B`,
      pct: Number(pct.toFixed(2)),
      color: COLORS[i % COLORS.length],
    };
  });

  const exportCommodities = (tepcTrade?.exports?.commodities || []).map((c, i) => ({
    flag: String(c.sn),
    name: cleanOthersLabel(c.name),
    val: Number((Number(c.valueNprBillion) || 0).toFixed(3)),
    pct: Number((Number(c.sharePct) || 0).toFixed(2)),
    color: COLORS[i % COLORS.length],
  }));

  const importCommodities = (tepcTrade?.imports?.commodities || []).map((c, i) => ({
    flag: String(c.sn),
    name: cleanOthersLabel(c.name),
    val000: Number(c.valueNpr000) || Math.round((Number(c.valueNprBillion) || 0) * 1_000_000),
    pct: Number((Number(c.sharePct) || 0).toFixed(2)),
    color: COLORS[i % COLORS.length],
  }));

  const r = 65;
  const cx = 80;
  const cy = 80;
  const circ = 2 * Math.PI * r;

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
            Trade blocks (export mix, import mix, partners) use full-row FY 2081/82 Shrawan–Kartik provisional figures
            from TEPC&apos;s Nepal Foreign Trade Statistics workbook. The import share ladder uses the same TEPC import
            commodity table. Live official feeds on this page: Kalimati (wholesale), NRB (forex), Open-Meteo
            (weather), and NARC (soil portal). For machine-readable global trade series, wire{" "}
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
        <NepalImportsAnalytics />
        <div className="chart-card fade-in-section visible">
          <div className="chart-title">Nepal export destinations</div>
          <div className="chart-subtitle">Where Nepal&apos;s exports go</div>
          <TepcSourceLine />
          <div className="chart-scroll chart-scroll--tepc-spring">
            <TepcAnimatedExportDestinations rows={exportPartners} />
          </div>
        </div>
        <div className="chart-card fade-in-section visible">
          <div className="chart-title">Nepal import partners</div>
          <div className="chart-subtitle">Where Nepal&apos;s imports come from</div>
          <TepcSourceLine />
          <div className="chart-scroll chart-scroll--tepc-spring">
            <TepcAnimatedImportPartners rows={importPartners} />
          </div>
        </div>
        <div
          className="chart-card ag-food-imports-side fade-in-section visible"
          aria-label="Major agricultural food imports — FY 2080/81"
        >
          <div className="ag-food-imports-side-stack">
            <div className="chart-title">Major agricultural food imports</div>
            <div className="chart-subtitle ag-food-imports-side-subtitle">
              FY 2080/81 (2024–2025)
            </div>
            <p className="ag-food-imports-side-kicker">
              Billion rupees (NPR) · <span lang="ne">अर्ब रुपैयाँ</span>
            </p>
            <AgFoodImportBars />
          </div>
        </div>
        <div className="chart-card fade-in-section visible">
          <div className="chart-title">Nepal export composition</div>
          <div className="chart-subtitle">What Nepal exports</div>
          <TepcSourceLine />
          <div className="chart-scroll">
            <BarChart rows={exportCommodities} />
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
