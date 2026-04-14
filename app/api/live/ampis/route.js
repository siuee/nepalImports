import { AMPIS_MARKETS, fetchAmpisMarketPrices } from "@/lib/live/ampis";

export const revalidate = 1800;

export async function GET(request) {
  const url = new URL(request.url);
  const marketId = url.searchParams.get("market") || AMPIS_MARKETS[0]?.id;
  try {
    const data = await fetchAmpisMarketPrices(marketId);
    return Response.json(data);
  } catch (e) {
    return Response.json(
      { error: true, message: e?.message || "AMPIS fetch failed" },
      { status: 502 }
    );
  }
}
