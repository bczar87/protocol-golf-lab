import { clip } from "@/lib/auth";
import { isRefusal, requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const gate = await requireAdmin(request);
  if (isRefusal(gate)) return gate;
  const body = (await request.json().catch(() => null)) as {
    type?: string;
    id?: string;
    decision?: string;
    note?: string;
    entry_id?: string;
  } | null;
  const type = body?.type;
  const id = clip(body?.id, 80);
  const decision = body?.decision === "approve" ? "approved" : body?.decision === "reject" ? "rejected" : "";
  if (!id || (type !== "submission" && type !== "owner_report") || !decision) {
    return Response.json({ error: "type, id, and decision are required" }, { status: 400 });
  }
  const note = clip(body?.note, 500) || null;
  const reviewed = new Date().toISOString();
  if (type === "submission") {
    const result = await gate.DB.prepare("UPDATE submissions SET status = ?, reviewer_note = ?, reviewed_at = ? WHERE id = ?").bind(decision, note, reviewed, id).run();
    return Response.json({ ok: true, updated: result.meta.changes ?? 0, published: false });
  }
  let entryId: string | null = null;
  const requested = clip(body?.entry_id, 120);
  if (requested) {
    const entry = await gate.DB.prepare("SELECT id FROM entries WHERE id = ?").bind(requested).first<{ id: string }>();
    entryId = entry?.id ?? null;
  }
  const result = entryId
    ? await gate.DB.prepare("UPDATE owner_reports SET status = ?, reviewer_note = ?, reviewed_at = ?, entry_id = ? WHERE id = ?").bind(decision, note, reviewed, entryId, id).run()
    : await gate.DB.prepare("UPDATE owner_reports SET status = ?, reviewer_note = ?, reviewed_at = ? WHERE id = ?").bind(decision, note, reviewed, id).run();
  return Response.json({ ok: true, updated: result.meta.changes ?? 0 });
}
