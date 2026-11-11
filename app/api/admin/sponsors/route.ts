import { clip } from "@/lib/auth";
import { isRefusal, requireAdmin } from "@/lib/admin";
import { safeTarget } from "@/lib/redirects";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = await requireAdmin(request);
  if (isRefusal(gate)) return gate;
  const sponsors = await gate.DB.prepare("SELECT * FROM sponsor_weeks ORDER BY starts_on DESC").all();
  const clicks = await gate.DB.prepare("SELECT slug, COUNT(*) AS n FROM sponsor_clicks GROUP BY slug").all<{ slug: string; n: number }>();
  return Response.json({ sponsors: sponsors.results ?? [], clicks: clicks.results ?? [] });
}

export async function POST(request: Request) {
  const gate = await requireAdmin(request);
  if (isRefusal(gate)) return gate;
  const body = (await request.json().catch(() => null)) as Record<string, string> | null;
  const slug = clip(body?.slug, 80).toLowerCase().replace(/[^a-z0-9-]/g, "");
  const name = clip(body?.name, 120);
  const tagline = clip(body?.tagline, 180);
  const url = clip(body?.url, 500);
  const starts = clip(body?.starts_on, 10);
  const ends = clip(body?.ends_on, 10);
  const active = body?.active === "0" || body?.active === "false" ? 0 : 1;
  if (!slug || !name || !safeTarget(url) || !/^\d{4}-\d{2}-\d{2}$/.test(starts) || !/^\d{4}-\d{2}-\d{2}$/.test(ends)) {
    return Response.json({ error: "slug, name, url, starts_on, and ends_on are required" }, { status: 400 });
  }
  await gate.DB.prepare(
    `INSERT OR REPLACE INTO sponsor_weeks (id, slug, name, tagline, url, starts_on, ends_on, active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(slug, slug, name, tagline || null, safeTarget(url), starts, ends, active, new Date().toISOString())
    .run();
  return Response.json({ ok: true, slug });
}
