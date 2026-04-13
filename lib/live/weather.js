/** Open-Meteo — no API key */

export async function fetchOpenMeteoCurrent(lat, lon) {
  const u = new URL("https://api.open-meteo.com/v1/forecast");
  u.searchParams.set("latitude", String(lat));
  u.searchParams.set("longitude", String(lon));
  u.searchParams.set("current", "temperature_2m,relative_humidity_2m,precipitation,weather_code");
  u.searchParams.set("timezone", "Asia/Kathmandu");
  const res = await fetch(u.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  const j = await res.json();
  const c = j.current;
  if (!c) throw new Error("Open-Meteo: no current");
  return {
    source: "Open-Meteo",
    sourceUrl: "https://open-meteo.com",
    time: c.time,
    temperatureC: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    precipitationMm: c.precipitation,
    weatherCode: c.weather_code,
  };
}
