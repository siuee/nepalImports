import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nepal-imports.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "कृषि Nepal — Nepal Agriculture Intelligence",
    template: "%s | कृषि Nepal",
  },
  description:
    "Programmatic SEO guides for Nepal agriculture: 77 districts, export products, prices, soil, climate, and growing intelligence.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "कृषि Nepal",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CustomCursor />
        <div className="app-shell">
          <SiteNav />
          {children}
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
