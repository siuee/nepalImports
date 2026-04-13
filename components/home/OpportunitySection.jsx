import Link from "next/link";
import { PRODUCTS } from "@/data/db";

export function OpportunitySection() {
  const top = [...PRODUCTS].sort((a, b) => b.opportunity - a.opportunity).slice(0, 9);

  return (
    <section className="opp-section" id="opportunity">
      <div className="section-header fade-in-section visible">
        <div>
          <div className="section-eyebrow">Investment intelligence</div>
          <h2 className="section-title">
            Top Export Opportunities
            <br />
            <span className="italic">Ranked by Potential</span>
          </h2>
        </div>
      </div>
      <div className="opp-grid">
        {top.map((p, i) => {
          const factors = [
            { name: "Global Demand", val: Math.min(p.opportunity + 3, 100) },
            { name: "Value Gap", val: Math.min(p.multiplier * 0.7, 100) },
            { name: "Nepal Fit", val: Math.min(p.opportunity + 5, 100) },
          ];
          return (
            <Link key={p.id} href={`/products/${p.slug}`} className="opp-card-link">
              <article className="opp-card">
                <div className="opp-rank">{i + 1}</div>
                <div className="opp-product">{p.name}</div>
                <div className="opp-nepali">{p.nepali}</div>
                <div className="opp-score-ring">
                  <div
                    className="score-circle"
                    style={{ ["--pct"]: `${p.opportunity}%` }}
                  >
                    <span className="score-num">{p.opportunity}</span>
                  </div>
                  <div className="opp-factors">
                    {factors.map((f) => (
                      <div key={f.name} className="factor-row">
                        <span className="factor-name">{f.name}</span>
                        <div className="factor-mini-bar">
                          <div className="factor-mini-fill" style={{ width: `${f.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
