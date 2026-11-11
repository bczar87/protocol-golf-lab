import type { MetadataRoute } from "next";
import { getDb, siteUrl } from "@/lib/db";
import { listEntries } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await siteUrl();
  const staticRoutes = ["", "/search", "/how-we-test", "/sponsors", "/submit"].map((path) => ({
    url: `${site}${path || "/"}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));
  const db = await getDb();
  const entries = db ? await listEntries(db) : [];
  return [
    ...staticRoutes,
    ...entries.map((entry) => ({
      url: `${site}/gear/${entry.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
