import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://nepal-imports.vercel.app").replace(
  /\/$/,
  ""
);

function xmlEscape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

const { DISTRICTS, PRODUCTS } = await import(pathToFileURL(join(root, "data/db.js")).href);

const lastmod = new Date().toISOString().split("T")[0];

const entries = [
  { loc: `${siteUrl}/`, changefreq: "daily", priority: "1.0" },
  ...PRODUCTS.map((p) => ({
    loc: `${siteUrl}/products/${p.slug}`,
    changefreq: "weekly",
    priority: "0.85",
  })),
  ...DISTRICTS.map((d) => ({
    loc: `${siteUrl}/districts/${d.slug}`,
    changefreq: "weekly",
    priority: "0.8",
  })),
];

const body = entries
  .map(
    (u) => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "sitemap.xml"), xml, "utf8");

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

writeFileSync(join(publicDir, "robots.txt"), robots, "utf8");

console.log(`generate-sitemap: wrote public/sitemap.xml (${entries.length} URLs) and public/robots.txt`);
