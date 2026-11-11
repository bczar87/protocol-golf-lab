/// <reference types="@cloudflare/workers-types" />

declare module "*.css";

declare module "*email-rules.mjs" {
  export function emailBlockReason(email: string): string | null;
}

interface CloudflareEnv {
  DB: D1Database;
  ADMIN_TOKEN?: string;
  RESEND_API_KEY?: string;
  RESEND_AUDIENCE_ID?: string;
  SITE_URL?: string;
  ASSETS: Fetcher;
}
