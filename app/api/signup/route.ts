import { clip, sameOrigin } from "@/lib/auth";
import { getEnv, logError } from "@/lib/db";
import { emailBlockReason, syncResendContact } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, error: "Bad origin." }, { status: 403 });
  const env = await getEnv();
  if (!env?.DB) return Response.json({ ok: false, error: "Database unavailable." }, { status: 503 });
  const body = (await request.json().catch(() => null)) as { email?: string; source?: string; website?: string } | null;
  if (body?.website) return Response.json({ ok: true });
  const email = clip(body?.email, 254).toLowerCase();
  const reason = emailBlockReason(email);
  if (reason === "invalid") return Response.json({ ok: false, error: "Enter a real email address." }, { status: 400 });
  if (reason) return Response.json({ ok: false, error: "That address looks like a test, junk, or disposable inbox." }, { status: 400 });
  const source = clip(body?.source, 40) || "site";
  const existing = await env.DB.prepare("SELECT id FROM signups WHERE email = ?").bind(email).first();
  if (existing) return Response.json({ ok: true });
  const id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO signups (id, email, source, resend_synced, created_at) VALUES (?, ?, ?, 0, ?)").bind(id, email, source, new Date().toISOString()).run();
  try {
    const sync = await syncResendContact(env, email);
    if (sync.synced) {
      await env.DB.prepare("UPDATE signups SET resend_synced = 1 WHERE id = ?").bind(id).run();
    } else if (sync.detail) {
      await logError("/api/signup", "Resend sync failed", sync.detail);
    }
  } catch (error) {
    await logError("/api/signup", "Resend sync threw", error instanceof Error ? error.message : String(error));
  }
  return Response.json({ ok: true });
}
