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
  const name = clip(body?.name, 80);
  const email = clip(body?.email, 254).toLowerCase();
  const brand = clip(body?.brand, 80);
  const product = clip(body?.product, 160);
  const sourceUrl = clip(body?.source_url, 500);
  const notes = clip(body?.notes, 2000);
  const category = clip(body?.category, 40);
  let parsed: URL | null = null;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    parsed = null;
  }
  if (!name || emailBlockReason(email) || !brand || !product || !parsed || !["http:", "https:"].includes(parsed.protocol) || notes.length < 20) {
    return Response.json({ ok: false, error: "Name, email, brand, product, an http(s) source URL, and a note are required." }, { status: 400 });
  }
  await db
    .prepare("INSERT INTO submissions (id, kind, payload, status, created_at) VALUES (?, 'gear', ?, 'pending', ?)")
    .bind(
      crypto.randomUUID(),
      JSON.stringify({ name, email, brand, product, category, source_url: parsed.toString(), notes }),
      new Date().toISOString(),
    )
    .run();
  return Response.json({ ok: true });
}
