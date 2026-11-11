import { clip, sameOrigin } from "@/lib/auth";
import { logError } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const body = (await request.json().catch(() => null)) as { message?: string; path?: string } | null;
  await logError(clip(body?.path, 300) || null, clip(body?.message, 500) || "client error");
  return new Response(null, { status: 204 });
}
