import { clip, sameOrigin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { emailBlockReason } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, error: "Bad origin." }, { status: 403 });
  const db = await getDb();
  if (!db) return Response.json({ ok: false, error: "Database unavailable." }, { status: 503 });
  const body = (await request.json().catch(() => null)) as Record<string, string> | null;
  if (body?.website) return Response.json({ ok: true });
  const author = clip(body?.author_name, 80);
  const email = clip(body?.email, 254).toLowerCase();
  const productName = clip(body?.product_name, 160);
  const entrySlug = clip(body?.entry_slug, 120);
  const text = clip(body?.body, 4000);
  const months = Number(body?.months_owned);
  if (!author || emailBlockReason(email) || text.length < 40) {
    return Response.json({ ok: false, error: "Name, a usable email, and a report of at least 40 characters are required." }, { status: 400 });
  }
  let entryId: string | null = null;
  let name = productName;
  if (entrySlug) {
    const entry = await db.prepare("SELECT id, brand, name FROM entries WHERE slug = ? AND status = 'published'").bind(entrySlug).first<{ id: string; brand: string; name: string }>();
    if (entry) {
      entryId = entry.id;
      name = name || entry.name;
    }
  }
  if (!name) name = "Unlisted gear";
  await db
    .prepare(
      `INSERT INTO owner_reports (id, entry_id, product_name, author_name, email, months_owned, body, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    )
    .bind(
      crypto.randomUUID(),
      entryId,
      name,
      author,
      email,
      Number.isFinite(months) ? Math.max(0, Math.min(240, Math.round(months))) : null,
      text,
      new Date().toISOString(),
    )
    .run();
  return Response.json({ ok: true });
}
