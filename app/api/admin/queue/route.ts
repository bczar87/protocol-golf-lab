import { isRefusal, requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = await requireAdmin(request);
  if (isRefusal(gate)) return gate;
  const submissions = await gate.DB.prepare("SELECT * FROM submissions WHERE status = 'pending' ORDER BY created_at DESC").all();
  const reports = await gate.DB.prepare("SELECT * FROM owner_reports WHERE status = 'pending' ORDER BY created_at DESC").all();
  return Response.json({ submissions: submissions.results ?? [], owner_reports: reports.results ?? [] });
}
