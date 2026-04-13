"use client";

import { useEffect, useState } from "react";

export function LiveSourcesStrip() {
  const [pulse, setPulse] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/live/pulse")
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setPulse(j);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const usd = pulse?.forex?.rates?.USD;
  const k = pulse?.kalimati;
  const w = pulse?.kathmanduWeather;

  return (
    <section className="live-strip" aria-label="Live data sources">
      <div className="live-strip-inner">
        <article className="live-card">
          <div className="live-card-eyebrow">NRB · Forex</div>
          <h3 className="live-card-title">Official NPR rates</h3>
          {usd ? (
            <p className="live-card-stat">
              USD sell (per $1): <strong>Rs.{usd.nprForQuote?.toFixed(2)}</strong>
              {usd.deltaPct != null ? (
                <span className={usd.deltaPct >= 0 ? "live-delta-up" : "live-delta-down"}>
                  {" "}
                  ({usd.deltaPct >= 0 ? "+" : ""}
                  {usd.deltaPct.toFixed(2)}% vs prior day)
                </span>
              ) : null}
            </p>
          ) : (
            <p className="live-card-muted">Loading Nepal Rastra Bank…</p>
          )}
          <p className="live-card-date">
            {pulse?.forex?.publishedDate
              ? `Board date: ${pulse.forex.publishedDate}`
              : "—"}
          </p>
          <a className="live-card-link" href="https://www.nrb.org.np/api/forex/" target="_blank" rel="noopener noreferrer">
            nrb.org.np/api/forex →
          </a>
        </article>

        <article className="live-card">
          <div className="live-card-eyebrow">Kalimati · Wholesale</div>
          <h3 className="live-card-title">Vegetables &amp; fruits</h3>
          {k ? (
            <>
              <p className="live-card-stat">
                <strong>{k.count}</strong> commodities in today&apos;s table
              </p>
              <p className="live-card-date">{k.heading || "Daily snapshot"}</p>
            </>
          ) : (
            <p className="live-card-muted">Scraping official table…</p>
          )}
          <a
            className="live-card-link"
            href="https://kalimatimarket.gov.np/price"
            target="_blank"
            rel="noopener noreferrer"
          >
            kalimatimarket.gov.np →
          </a>
        </article>

        <article className="live-card">
          <div className="live-card-eyebrow">Open-Meteo · Climate</div>
          <h3 className="live-card-title">Kathmandu now</h3>
          {w ? (
            <p className="live-card-stat">
              <strong>{w.temperatureC}°C</strong>
              <span className="live-card-sub">
                {" "}
                · humidity {w.humidity}% · rain {w.precipitationMm} mm
              </span>
            </p>
          ) : (
            <p className="live-card-muted">Loading forecast API…</p>
          )}
          <p className="live-card-date">District weather loads in the map panel</p>
          <a className="live-card-link" href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">
            open-meteo.com →
          </a>
        </article>

        <article className="live-card live-card-soil">
          <div className="live-card-eyebrow">NARC · Soils</div>
          <h3 className="live-card-title">Digital soil maps</h3>
          <p className="live-card-muted">
            pH, organic matter, and soil types are published on the national soil portal (spatial layers —
            no simple JSON; we link to the official viewer).
          </p>
          <a className="live-card-link" href="https://soil.narc.gov.np" target="_blank" rel="noopener noreferrer">
            soil.narc.gov.np →
          </a>
        </article>
      </div>
    </section>
  );
}
