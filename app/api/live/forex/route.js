import { fetchNrbForex } from "@/lib/live/nrb";

export const revalidate = 900;

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
