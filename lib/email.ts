export { emailBlockReason } from "./email-rules.mjs";

type SyncEnv = {
  RESEND_API_KEY?: string;
  RESEND_AUDIENCE_ID?: string;
};

export async function syncResendContact(env: SyncEnv, email: string): Promise<{ synced: boolean; detail?: string }> {
  const key = env.RESEND_API_KEY;
  const audience = env.RESEND_AUDIENCE_ID;
  if (!key || !audience) return { synced: false };
  const response = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      unsubscribed: false,
      segments: [{ id: audience }],
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    return { synced: false, detail: detail.slice(0, 500) };
  }
  return { synced: true };
}
