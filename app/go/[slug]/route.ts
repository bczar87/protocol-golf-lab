import { getDb, logError } from "@/lib/db";
import { EDITORIAL_LINKS, safeTarget } from "@/lib/redirects";

export const dynamic = "force-dynamic";

type LinkRow = { href: string; kind: string };

async function resolveLink(db: D1Database, slug: string): Promise<LinkRow | null> {
  const editorial = EDITORIAL_LINKS[slug];
  if (editorial) return editorial;
  const sponsor = await db.prepare("SELECT url AS href FROM sponsor_weeks WHERE slug = ?").bind(slug).first<{ href: string }>();
  if (sponsor?.href) return { href: sponsor.href, kind: "sponsor" };
  const rows = await db.prepare("SELECT links FROM entries").all<{ links: string }>();
  for (const row of rows.results ?? []) {
    try {
      const links = JSON.parse(row.links) as { slug: string; href: string; kind: string }[];
      const match = links.find((link) => link.slug === slug);
      if (match) return { href: match.href, kind: match.kind || "outbound" };
    } catch {
      continue;
    }
  }
  return null;
}

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const db = await getDb();
  if (!db) return new Response("Database unavailable", { status: 503 });
  try {
    const link = await resolveLink(db, slug);
    const target = link ? safeTarget(link.href) : null;
    if (!link || !target) return new Response("Unknown link", { status: 404 });
    const referrer = request.headers.get("referer");
    await db
      .prepare("INSERT INTO sponsor_clicks (id, slug, kind, referrer, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), slug, link.kind, referrer?.slice(0, 500) ?? null, new Date().toISOString())
      .run();
    return Response.redirect(new URL(target, request.url), 302);
  } catch (error) {
    await logError(`/go/${slug}`, "redirect failed", error instanceof Error ? error.message : String(error));
    return new Response("Redirect failed", { status: 500 });
  }
}
