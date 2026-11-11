import { adminAuthorized } from "./auth";
import { getEnv } from "./db";

export async function requireAdmin(request: Request): Promise<CloudflareEnv | Response> {
  const env = await getEnv();
  if (!env?.DB) return Response.json({ error: "database unavailable" }, { status: 503 });
  const allowed = await adminAuthorized(request, env.ADMIN_TOKEN);
  if (!allowed) return Response.json({ error: "unauthorized" }, { status: 401 });
  return env;
}

export function isRefusal(value: CloudflareEnv | Response): value is Response {
  return value instanceof Response;
}
