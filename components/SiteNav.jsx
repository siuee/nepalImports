import Link from "next/link";

export function SiteNav() {
  return (
    <nav>
      <Link href="/" className="nav-logo" style={{ textDecoration: "none" }}>
        कृषि<span>Nepal</span>
      </Link>
      <div className="nav-links">
        <Link href="/#map">Map</Link>
        <Link href="/#market">Market Prices</Link>
        <Link href="/#products">Products</Link>
        <Link href="/#charts">Analytics</Link>
        <Link href="/#opportunity">Opportunities</Link>
        <span className="nav-badge">● Live Data</span>
      </div>
    </nav>
  );
}
