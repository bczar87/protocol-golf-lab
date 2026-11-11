export const EDITORIAL_LINKS: Record<string, { href: string; kind: string }> = {
  "gspro-supported-list": {
    href: "https://gsprogolf.com/supported-launch-monitors/index.html",
    kind: "outbound",
  },
};

export function safeTarget(url: string): string | null {
  if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.toString();
  } catch {
    return null;
  }
  return null;
}
