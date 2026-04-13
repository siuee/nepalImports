import { fetchKalimatiPrices } from "@/lib/live/kalimati";

export const revalidate = 1800;

export async function GET() {
  try {
    const data = await fetchKalimatiPrices();
    return Response.json(data);
  } catch (e) {
    return Response.json(
      { error: true, message: e?.message || "Kalimati fetch failed" },
      { status: 502 }
    );
  }
}
