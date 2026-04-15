"use client";

import { spring } from "remotion";
import { useCallback, useEffect, useRef, useState } from "react";

const FPS = 30;
const MAX_FRAMES = 110;

/** Lowercase keys — TEPC partner names as in workbook */
const FLAG_BY_COUNTRY = {
  india: "🇮🇳",
  "united states": "🇺🇸",
  germany: "🇩🇪",
  "united kingdom": "🇬🇧",
  france: "🇫🇷",
  japan: "🇯🇵",
  china: "🇨🇳",
  australia: "🇦🇺",
  "united arab emirates": "🇦🇪",
  italy: "🇮🇹",
  netherlands: "🇳🇱",
  canada: "🇨🇦",
  afghanistan: "🇦🇫",
  turkey: "🇹🇷",
  ukraine: "🇺🇦",
  argentina: "🇦🇷",
  indonesia: "🇮🇩",
  malaysia: "🇲🇾",
  qatar: "🇶🇦",
  thailand: "🇹🇭",
  bahrain: "🇧🇭",
  others: "🌐",
};

/** 3-letter style codes for vertical strip under bars */
const SHORT_BY_COUNTRY = {
  india: "IND",
  "united states": "USA",
  germany: "DEU",
  "united kingdom": "GBR",
  france: "FRA",
  japan: "JPN",
  china: "CHN",
  australia: "AUS",
  "united arab emirates": "UAE",
  italy: "ITA",
  netherlands: "NLD",
  canada: "CAN",
  afghanistan: "AFG",
  turkey: "TUR",
  ukraine: "UKR",
  argentina: "ARG",
  indonesia: "IDN",
  malaysia: "MYS",
  qatar: "QAT",
  thailand: "THA",
  bahrain: "BHR",
  others: "OTH",
};

function normalizeCountryKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getFlagForPartner(name) {
  const k = normalizeCountryKey(name);
  if (k.startsWith("all remaining")) return "🌐";
  return FLAG_BY_COUNTRY[k] ?? "🏳️";
}

function shortCodeForPartner(name) {
  const k = normalizeCountryKey(name);
  if (k.startsWith("all remaining")) return "REST";
  return SHORT_BY_COUNTRY[k] ?? "···";
}

function shortCodeFromLabel(label) {
  const words = String(label || "")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "···";
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function toNepaliDigits(value) {
  const map = { "0": "०", "1": "१", "2": "२", "3": "३", "4": "४", "5": "५", "6": "६", "7": "७", "8": "८", "9": "९" };
  return String(value).replace(/[0-9]/g, (d) => map[d] ?? d);
}

function formatArbaLabelFrom000(v000) {
  const billions = Number(v000 || 0) / 1_000_000;
  if (!Number.isFinite(billions) || billions <= 0) return "०";
  if (billions >= 1) {
    const d = billions >= 10 ? 1 : 2;
    return `${toNepaliDigits(billions.toFixed(d))} अर्ब`;
  }
  const crore = Number(v000 || 0) / 10_000;
  return `${toNepaliDigits(crore.toFixed(crore >= 10 ? 1 : 2))} करोड`;
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

/**
 * Vertical column chart with Remotion-style spring easing.
 *
 * @param {object} props
 * @param {number[]} props.data
 * @param {string[]} [props.labels] — full names (tooltip + <title>)
 * @param {string[]} [props.flags]
 * @param {string[]} [props.tooltips] — one line each; shown on hover (optional; defaults from labels + valueLabels)
 * @param {string[]} [props.barColors]
 * @param {string[]} [props.valueLabels]
 * @param {string[]} [props.shortCodes]
 * @param {number} [props.minBarWidth]
 * @param {string} [props.chartAriaLabel]
 */
export function AnimatedVerticalBarChart({
  data = [],
  labels = [],
  flags = [],
  tooltips = [],
  barColors = [],
  valueLabels = [],
  shortCodes = [],
  minBarWidth,
  gap = 8,
  staggerFrames = 5,
  speed = 1,
  className = "",
  chartAriaLabel = "TEPC partner share by country",
}) {
  const wrapRef = useRef(null);
  const [frame, setFrame] = useState(0);
  const [size, setSize] = useState({ w: 400, h: 300 });
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const playingRef = useRef(false);
  const [hoverTip, setHoverTip] = useState(null);

  const clearTip = useCallback(() => setHoverTip(null), []);

  const moveTip = useCallback((e, index) => {
    const root = wrapRef.current;
    if (!root || index == null) return;
    const r = root.getBoundingClientRect();
    const line =
      tooltips[index] ||
      (labels[index]
        ? `${labels[index]} — ${valueLabels[index] ?? ""}`.trim()
        : "");
    if (!line) return;
    setHoverTip({
      left: e.clientX - r.left,
      top: e.clientY - r.top,
      text: line,
    });
  }, [labels, tooltips, valueLabels]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root || !data.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || playingRef.current) return;
          playingRef.current = true;
          startRef.current = null;

          const tick = (t) => {
            if (startRef.current == null) startRef.current = t;
            const elapsed = (t - startRef.current) / 1000;
            const f = Math.min(Math.floor(elapsed * FPS * speed), MAX_FRAMES);
            setFrame(f);
            if (f < MAX_FRAMES) {
              rafRef.current = requestAnimationFrame(tick);
            }
          };
          rafRef.current = requestAnimationFrame(tick);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    io.observe(root);
    return () => {
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [data.length, speed]);

  const n = data.length;
  const max = Math.max(...data, 1);
  const padding = 40;
  const containerW = size.w;
  const height = size.h;
  const labelBand = labels.length > 0 ? 52 : 0;
  const valueTagSpace = valueLabels.length ? 22 : 0;
  const minBarW =
    typeof minBarWidth === "number"
      ? minBarWidth
      : n > 0
        ? containerW < 400
          ? 44
          : containerW < 720
            ? 40
            : 36
        : 16;
  const bottomGap = 6;
  const innerHeight = Math.max(
    height - padding - valueTagSpace - labelBand - bottomGap,
    52
  );
  const innerFromContainer = Math.max(containerW - padding * 2, 0);
  let barWidth =
    n > 0 ? (innerFromContainer - gap * Math.max(0, n - 1)) / n : 0;
  if (n > 0 && barWidth < minBarW) barWidth = minBarW;
  const innerWidth = n * barWidth + gap * Math.max(0, n - 1);
  const viewW = padding * 2 + innerWidth;
  const baseY = padding + valueTagSpace + innerHeight;

  return (
    <div
      ref={wrapRef}
      className={`tepc-animated-vbars ${className}`.trim()}
      onPointerLeave={clearTip}
    >
      {hoverTip ? (
        <div
          className="tepc-vbar-float-tip"
          style={{ left: hoverTip.left, top: hoverTip.top }}
          role="tooltip"
        >
          {hoverTip.text}
        </div>
      ) : null}

      <svg
        width={viewW}
        height={height}
        viewBox={`0 0 ${viewW} ${height}`}
        preserveAspectRatio="xMinYMid meet"
        role="img"
        aria-label={chartAriaLabel}
      >
        <line
          x1={padding}
          x2={padding + innerWidth}
          y1={baseY}
          y2={baseY}
          stroke="rgba(139,92,246,0.35)"
          strokeWidth={1.5}
        />

        {data.map((value, index) => {
          const targetHeight = (value / max) * innerHeight;
          const x = padding + index * (barWidth + gap);
          const isTiny = value > 0 && value < 1;
          const visibleHeight = isTiny
            ? Math.max(targetHeight, 14)
            : Math.max(targetHeight, 0.5);
          const y = baseY - visibleHeight;
          const f = Math.max(0, frame - index * staggerFrames);
          const scaleY = spring({
            frame: f,
            fps: FPS,
            config: { damping: 12, stiffness: 100, mass: 0.8 },
            from: 0,
            to: 1,
          });
          const fill = barColors[index] ?? "#a78bfa";
          const shadow = `${fill}44`;
          const cx = x + barWidth / 2;
          const titleText =
            tooltips[index] ||
            (labels[index]
              ? `${labels[index]} — ${valueLabels[index] ?? ""}`.replace(
                  /\s+—\s*$/,
                  ""
                )
              : "");

          return (
            <g key={`col-${index}`}>
              {titleText ? <title>{titleText}</title> : null}
              {valueLabels[index] ? (
                <text
                  x={cx}
                  y={y - (isTiny ? 8 : 6)}
                  fill="#fbbf24"
                  fontSize={10}
                  fontWeight={700}
                  textAnchor="middle"
                  style={{
                    opacity: scaleY,
                    fontFamily: "JetBrains Mono, ui-monospace, monospace",
                  }}
                >
                  {valueLabels[index]}
                </text>
              ) : null}
              {isTiny ? (
                <rect
                  x={x}
                  y={baseY - 16}
                  width={barWidth}
                  height={16}
                  rx={6}
                  ry={6}
                  fill="rgba(255,255,255,0.09)"
                  stroke="rgba(167,139,250,0.45)"
                  strokeWidth={1}
                  style={{ opacity: scaleY }}
                />
              ) : null}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={visibleHeight}
                rx={6}
                ry={6}
                fill={fill}
                style={{
                  transform: `scaleY(${scaleY})`,
                  transformOrigin: `${cx}px ${baseY}px`,
                  transformBox: "fill-box",
                  filter: `drop-shadow(0 3px 12px ${shadow})`,
                }}
              />
              {isTiny ? (
                <>
                  <circle
                    cx={cx}
                    cy={baseY - 8}
                    r={5}
                    fill="rgba(255,255,255,0.18)"
                    stroke="rgba(139,92,246,0.55)"
                    strokeWidth={1}
                    style={{
                      opacity: scaleY,
                      filter: `drop-shadow(0 0 8px ${fill}88)`,
                    }}
                  />
                  <circle
                    cx={cx}
                    cy={baseY - 8}
                    r={2.2}
                    fill="#fff"
                    style={{ opacity: scaleY }}
                  />
                </>
              ) : null}
              {labels[index] && flags[index] ? (
                <text
                  x={cx}
                  y={baseY + 28}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={22}
                  style={{
                    opacity: scaleY,
                    fontFamily:
                      "Noto Color Emoji, Apple Color Emoji, Segoe UI Emoji, sans-serif",
                  }}
                >
                  {flags[index]}
                </text>
              ) : null}
              {labels[index] ? (
                flags[index] ? (
                  <g
                    transform={`translate(${cx}, ${baseY + 46})`}
                    style={{ opacity: scaleY }}
                  >
                    <text
                      transform="rotate(-90)"
                      x={0}
                      y={0}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#6b6790"
                      fontSize={9}
                      fontWeight={700}
                      letterSpacing="0.12em"
                      style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
                    >
                      {shortCodes[index] || shortCodeFromLabel(labels[index])}
                    </text>
                  </g>
                ) : (
                  <g style={{ opacity: scaleY }}>
                    <rect
                      x={cx - Math.max(12, barWidth * 0.44)}
                      y={baseY + 10}
                      width={Math.max(24, barWidth * 0.88)}
                      height={16}
                      rx={8}
                      ry={8}
                      fill="rgba(255,255,255,0.05)"
                      stroke="rgba(139,92,246,0.28)"
                      strokeWidth={0.8}
                    />
                    <text
                      x={cx}
                      y={baseY + 18}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#b8b4d8"
                      fontSize={8}
                      fontWeight={700}
                      letterSpacing="0.08em"
                      style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
                    >
                      {shortCodes[index] || shortCodeFromLabel(labels[index])}
                    </text>
                  </g>
                )
              ) : null}
              {titleText ? (
                <rect
                  x={x}
                  y={padding}
                  width={barWidth}
                  height={baseY - padding + labelBand}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onPointerEnter={(e) => moveTip(e, index)}
                  onPointerMove={(e) => moveTip(e, index)}
                  onPointerLeave={clearTip}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Shared TEPC partner rows → animated vertical bars (exports or imports).
 * @param {{ rows: Array<{ name: string; pct: number; value: string; color: string }>; chartAriaLabel: string }} props
 */
function TepcAnimatedPartnerBars({ rows, chartAriaLabel }) {
  const data = rows.map((r) => r.pct);
  const labels = rows.map((r) => r.name);
  const flags = rows.map((r) => getFlagForPartner(r.name));
  const shortCodes = rows.map((r) => shortCodeForPartner(r.name));
  const valueLabels = rows.map((r) => `${Number(r.pct).toFixed(1)}%`);
  const tooltips = rows.map(
    (r) => `${r.name}\n${Number(r.pct).toFixed(2)}% · ${r.value}`
  );
  const barColors = rows.map((r) => r.color);

  return (
    <AnimatedVerticalBarChart
      data={data}
      labels={labels}
      flags={flags}
      shortCodes={shortCodes}
      tooltips={tooltips}
      valueLabels={valueLabels}
      barColors={barColors}
      gap={6}
      staggerFrames={5}
      chartAriaLabel={chartAriaLabel}
    />
  );
}

/**
 * TEPC export destinations — where Nepal’s exports go.
 * @param {{ rows: Array<{ name: string; pct: number; value: string; color: string }> }} props
 */
export function TepcAnimatedExportDestinations({ rows }) {
  return (
    <TepcAnimatedPartnerBars
      rows={rows}
      chartAriaLabel="Nepal export share by destination country"
    />
  );
}

/**
 * TEPC import partners — where Nepal’s imports come from.
 * @param {{ rows: Array<{ name: string; pct: number; value: string; color: string }> }} props
 */
export function TepcAnimatedImportPartners({ rows }) {
  return (
    <TepcAnimatedPartnerBars
      rows={rows}
      chartAriaLabel="Nepal import share by partner country"
    />
  );
}

/**
 * TEPC import commodities — annual import bill by product.
 * @param {{ rows: Array<{ name: string; pct: number; val000: number; color: string }> }} props
 */
export function TepcAnimatedImportCommodities({ rows }) {
  const data = rows.map((r) => r.pct);
  const labels = rows.map((r) => r.name);
  const valueLabels = rows.map((r) => formatArbaLabelFrom000(r.val000));
  const tooltips = rows.map(
    (r) => `${r.name}\n${Number(r.pct).toFixed(2)}% · ${formatNprFullNepaliFrom000(r.val000)}`
  );
  const commodityCodeMap = {
    "Aircraft and parts thereof": "AIR",
    "Copper and articles thereof": "COP",
    "Wool, fine or coarse animal hair": "WOL",
    "Zinc and articles thereof": "ZNC",
    Silver: "SLV",
  };
  const shortCodes = rows.map((r) => commodityCodeMap[r.name] || shortCodeFromLabel(r.name));
  const barColors = rows.map((r) => r.color);

  return (
    <AnimatedVerticalBarChart
      data={data}
      labels={labels}
      shortCodes={shortCodes}
      tooltips={tooltips}
      valueLabels={valueLabels}
      barColors={barColors}
      gap={4}
      minBarWidth={24}
      staggerFrames={5}
      chartAriaLabel="Nepal annual import bill by product categories"
    />
  );
}
