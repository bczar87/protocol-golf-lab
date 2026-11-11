import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getEnv(): Promise<CloudflareEnv | null> {
  try {
    const context = await getCloudflareContext({ async: true });
    return context.env as CloudflareEnv;
  } catch {
    return null;
  }
}

export async function getDb(): Promise<D1Database | null> {
  const env = await getEnv();
  return env?.DB ?? null;
}

export async function siteUrl(): Promise<string> {
  const env = await getEnv();
  const configured = env?.SITE_URL || process.env.SITE_URL || "";
  if (configured.startsWith("http") && !configured.includes("REPLACE_WITH_YOUR_WORKER")) {
    return configured.replace(/\/$/, "");
  }
  return "http://localhost:8787";
}

export async function logError(path: string | null, message: string, detail?: string | null): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db
      .prepare("INSERT INTO errors (id, path, message, detail, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), path?.slice(0, 300) ?? null, message.slice(0, 500), detail?.slice(0, 2000) ?? null, new Date().toISOString())
      .run();
  } catch {
    // Logging must not take down the request that failed.
  }
}
