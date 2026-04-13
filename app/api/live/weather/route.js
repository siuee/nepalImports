import { COORDS_BY_ID } from "@/lib/live/districtCoords";
import { fetchOpenMeteoCurrent } from "@/lib/live/weather";

export const revalidate = 600;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id || !COORDS_BY_ID[id]) {
    return Response.json({ error: true, message: "Unknown district id" }, { status: 400 });
  }
  const { lat, lon } = COORDS_BY_ID[id];
  try {
    const current = await fetchOpenMeteoCurrent(lat, lon);
    return Response.json({ districtId: id, lat, lon, ...current });
  } catch (e) {
    return Response.json(
      { error: true, message: e?.message || "Weather fetch failed" },
      { status: 502 }
    );
  }
}
