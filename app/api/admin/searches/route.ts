import { isRefusal, requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = await requireAdmin(request);
  if (isRefusal(gate)) return gate;
  const rows = await gate.DB.prepare("SELECT * FROM zero_result_searches ORDER BY created_at DESC LIMIT 100").all();
  return Response.json({ searches: rows.results ?? [] });
}
