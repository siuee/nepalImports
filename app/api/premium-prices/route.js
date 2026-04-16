import { getPremiumDb } from '@/lib/db/premium';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getPremiumDb();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch premium prices' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
