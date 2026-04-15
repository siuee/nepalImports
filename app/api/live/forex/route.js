import { fetchNrbForex } from "@/lib/live/nrb";

/** NRB publishes once per working day; cache ~24h to match “daily” board rate. */
export const revalidate = 86400;

export async function GET() {
  try {
    const data = await fetchNrbForex();
    return Response.json(data);
  } catch (e) {
    return Response.json(
      { error: true, message: e?.message || "NRB fetch failed" },
      { status: 502 }
    );
  }
}
