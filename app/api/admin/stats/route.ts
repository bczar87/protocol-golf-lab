import { isRefusal, requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function count(db: D1Database, sql: string, bind: string[] = []) {
  const row = await db.prepare(sql).bind(...bind).first<{ n: number }>();
  return row?.n ?? 0;
}

export async function GET(request: Request) {
  const gate = await requireAdmin(request);
  if (isRefusal(gate)) return gate;
  const month = `${new Date().toISOString().slice(0, 7)}-01`;
  const db = gate.DB;
  const [signups, pageviews, pageviewsMonth, clicks, clicksMonth, pendingReports, pendingSubmissions, inquiries, entries, errors] = await Promise.all([
    count(db, "SELECT COUNT(*) AS n FROM signups"),
    count(db, "SELECT COUNT(*) AS n FROM pageviews"),
    count(db, "SELECT COUNT(*) AS n FROM pageviews WHERE created_at >= ?", [month]),
    count(db, "SELECT COUNT(*) AS n FROM sponsor_clicks"),
    count(db, "SELECT COUNT(*) AS n FROM sponsor_clicks WHERE created_at >= ?", [month]),
    count(db, "SELECT COUNT(*) AS n FROM owner_reports WHERE status = 'pending'"),
    count(db, "SELECT COUNT(*) AS n FROM submissions WHERE status = 'pending'"),
    count(db, "SELECT COUNT(*) AS n FROM sponsor_inquiries"),
    count(db, "SELECT COUNT(*) AS n FROM entries WHERE status = 'published'"),
    count(db, "SELECT COUNT(*) AS n FROM errors"),
  ]);
  return Response.json({ signups, pageviews, pageviews_month: pageviewsMonth, clicks, clicks_month: clicksMonth, pending_reports: pendingReports, pending_submissions: pendingSubmissions, inquiries, entries, errors });
}
