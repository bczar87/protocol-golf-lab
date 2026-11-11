import { clip, sameOrigin } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const db = await getDb();
  if (!db) return new Response(null, { status: 204 });
  const body = (await request.json().catch(() => null)) as { path?: string } | null;
  const path = clip(body?.path, 300);
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/api") || path.startsWith("/go")) {
    return new Response(null, { status: 204 });
  }
  const referrer = request.headers.get("referer");
  await db
    .prepare("INSERT INTO pageviews (id, path, referrer, created_at) VALUES (?, ?, ?, ?)")
    .bind(crypto.randomUUID(), path, referrer?.slice(0, 500) ?? null, new Date().toISOString())
    .run();
  return new Response(null, { status: 204 });
}
