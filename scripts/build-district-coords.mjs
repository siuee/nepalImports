/**
 * One-off: geocode all districts via Open-Meteo (Nepal filter).
 * Run: node scripts/build-district-coords.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const { DISTRICTS } = await import(join(root, "data/db.js"));

/** Search queries that match Nepal better than the short dashboard label */
const GEO_ALIASES = {
  "nawalparasi-e": "Kawasoti",
  "nawalparasi-w": "Ramgram",
  "rukum-e": "Musikot Rukum",
  "rukum-w": "Chaurjahari",
  terhathum: "Terhathum",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function geocodeDistrict(d) {
  const q = GEO_ALIASES[d.id] || d.name;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&country=Nepal&count=8`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocode HTTP ${res.status} for ${d.id}`);
  const j = await res.json();
  const results = j.results || [];
  const np = results.filter((r) => r.country_code === "NP");
  const pick =
    np.find((r) => (r.admin2 || "").toLowerCase().includes(d.name.toLowerCase().split(" ")[0])) ||
    np[0] ||
    results.find((r) => r.country_code === "NP");
  if (!pick) throw new Error(`No Nepal result for ${d.id} (${q})`);
  return {
    id: d.id,
    lat: pick.latitude,
    lon: pick.longitude,
    geocodeName: pick.name,
  };
}

const out = [];
for (const d of DISTRICTS) {
  try {
    const row = await geocodeDistrict(d);
    out.push(row);
    console.log("ok", d.id, row.lat, row.lon);
  } catch (e) {
    console.error("fail", d.id, e.message);
    process.exitCode = 1;
    out.push({ id: d.id, lat: 27.70169, lon: 85.3206, geocodeName: "Kathmandu (fallback)" });
  }
  await sleep(120);
}

writeFileSync(join(root, "data/districtCoords.json"), JSON.stringify(out, null, 2) + "\n");
console.log("Wrote data/districtCoords.json", out.length);
