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
  const company = clip(body?.company, 120);
  const message = clip(body?.message, 2000);
  if (!name || emailBlockReason(email) || message.length < 20) {
    return Response.json({ ok: false, error: "Name, a usable email, and a message are required." }, { status: 400 });
  }
  await db
    .prepare("INSERT INTO sponsor_inquiries (id, name, email, company, message, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), name, email, company || null, message, new Date().toISOString())
    .run();
  return Response.json({ ok: true });
}
