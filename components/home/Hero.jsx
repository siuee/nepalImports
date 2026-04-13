export function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-content">
        <div className="hero-eyebrow">Nepal Agriculture Intelligence Platform</div>
        <h1 className="hero-title">
          Nepal&apos;s <span className="accent">Hidden</span>
          <br />
          Agricultural <span className="accent">Wealth</span>
          <span className="devnag">कृषि समृद्धि नेपाल — Agricultural Prosperity Nepal</span>
        </h1>
        <p className="hero-desc">
          Nepal spends{" "}
          <strong style={{ color: "var(--gold)" }}>394 billion rupees</strong> on food imports
          annually — of which{" "}
          <strong style={{ color: "#fb7185" }}>Rs.29 billion</strong> goes to spices and masalas
          that Nepal can produce itself. Explore what each district can grow, global prices, and
          export opportunity.
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-number">
              <span>394</span>
              <span className="stat-unit">B</span>
            </div>
            <div className="stat-label">Annual Food Imports</div>
            <div className="stat-nepali">वार्षिक खाद्य आयात</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              <span>77</span>
            </div>
            <div className="stat-label">Districts Mapped</div>
            <div className="stat-nepali">जिल्लाहरू</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              <span>44</span>
              <span className="stat-unit">+</span>
            </div>
            <div className="stat-label">Export Products</div>
            <div className="stat-nepali">निर्यात उत्पादन</div>
          </div>
        </div>
        <div className="hero-cta">
          <a href="/#map" className="btn-primary">
            Explore the map
          </a>
          <a href="/#market" className="btn-outline">
            Live Market Prices
          </a>
        </div>
      </div>
    </section>
  );
}
