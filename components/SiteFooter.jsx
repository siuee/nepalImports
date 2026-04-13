import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <div>
        <div className="footer-brand">
          कृषि<span>Nepal</span>
        </div>
        <div className="footer-desc">
          Nepal&apos;s agricultural intelligence platform. Real data. Real opportunities.
          Programmatic guides for every district and export product.
        </div>
      </div>
      <div>
        <div className="footer-col-title">Explore</div>
        <div className="footer-links">
          <Link href="/#map">77 District Map</Link>
          <Link href="/#products">Products Database</Link>
          <Link href="/#market">Kalimati Prices</Link>
        </div>
      </div>
      <div>
        <div className="footer-col-title">SEO Index</div>
        <div className="footer-links">
          <Link href="/sitemap.xml">Sitemap</Link>
          <Link href="/robots.txt">Robots</Link>
        </div>
      </div>
      <div>
        <div className="footer-col-title">Resources</div>
        <div className="footer-links">
          <a href="https://narc.gov.np" target="_blank" rel="noopener noreferrer">
            NARC
          </a>
          <a href="https://tepc.gov.np" target="_blank" rel="noopener noreferrer">
            TEPC
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} कृषि Nepal Intelligence Platform</span>
        <span>Static pages generated for programmatic SEO</span>
      </div>
    </footer>
  );
}
