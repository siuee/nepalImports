"use client";

import { useEffect, useState } from "react";

export function Ticker() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/live/pulse")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data?.ticker?.length) return;
        setItems(data.ticker);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const doubled = items?.length ? [...items, ...items] : null;

  return (
    <div className="ticker">
      <div className="ticker-meta" aria-live="polite">
        <span className="ticker-meta-label">Live strip</span>
        <span className="ticker-meta-src">
          Kalimati wholesale · NRB forex (Kathmandu date) · updates on refresh
        </span>
      </div>
      <div className="ticker-inner">
        {!doubled ? (
          <span className="ticker-item ticker-loading">
            <span className="dot" />
            Loading Kalimati &amp; Nepal Rastra Bank rates…
          </span>
        ) : (
          doubled.map((i, idx) => (
            <span key={idx} className="ticker-item">
              <span className="dot" />
              <span className={`ticker-kind ticker-kind-${i.kind}`}>{i.kind}</span>
              {i.name} — <span className="price">{i.price}</span>{" "}
              <span
                className={
                  i.up === null ? "flat" : i.up ? "up" : "down"
                }
              >
                {i.deltaLabel}
              </span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
