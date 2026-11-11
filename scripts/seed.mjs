import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tcoCents } from "./tco.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(root, "data/catalog.json"), "utf8"));
const remote = process.argv.includes("--remote");
const now = new Date().toISOString();

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "NULL";
    return String(Math.round(value));
  }
  if (typeof value === "boolean") return value ? "1" : "0";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function requiredFlag(value) {
  if (value === true) return 1;
  if (value === false) return 0;
  return null;
}

const statements = [];

for (const category of catalog.categories) {
  statements.push(
    `INSERT OR REPLACE INTO categories (id, slug, name, summary, spec_schema, sort_order) VALUES (${[
      sqlValue(category.id),
      sqlValue(category.slug),
      sqlValue(category.name),
      sqlValue(category.summary),
      sqlValue(JSON.stringify(category.spec_schema)),
      sqlValue(category.sort_order),
    ].join(", ")});`,
  );
}

for (const entry of catalog.entries) {
  const required = requiredFlag(entry.subscription_required);
  const tco = tcoCents(entry.price_cents, required, entry.subscription_annual_cents);
  const links = [
    {
      slug: `src-${entry.slug}`,
      href: entry.source_url,
      label: entry.source_label,
      kind: "outbound",
    },
    ...(entry.extra_links ?? []).map((link) => ({
      slug: `${link.role}-${entry.slug}`,
      href: link.href,
      label: link.label,
      kind: link.kind,
    })),
  ];
  if (entry.specs?.gspro_note) {
    links.push({
      slug: `gspro-${entry.slug}`,
      href: catalog.gspro_url,
      label: "GSPro supported launch monitors",
      kind: "outbound",
    });
  }

  statements.push(
    `INSERT OR REPLACE INTO entries (
      id, category_id, slug, brand, name, summary, specs, price_cents, compare_at_cents,
      currency, price_notes, price_source_url, price_source_label, price_checked_on,
      subscription_annual_cents, subscription_required, subscription_name, subscription_notes,
      subscription_source_url, tco_3yr_cents, tco_notes, links, featured, status, created_at, updated_at
    ) VALUES (${[
      sqlValue(entry.slug),
      sqlValue(entry.category),
      sqlValue(entry.slug),
      sqlValue(entry.brand),
      sqlValue(entry.name),
      sqlValue(entry.summary),
      sqlValue(JSON.stringify(entry.specs ?? {})),
      sqlValue(entry.price_cents),
      sqlValue(entry.compare_at_cents),
      sqlValue("USD"),
      sqlValue(entry.price_notes),
      sqlValue(entry.source_url),
      sqlValue(entry.source_label),
      sqlValue(entry.checked_on),
      sqlValue(entry.subscription_annual_cents),
      sqlValue(required),
      sqlValue(entry.subscription_name),
      sqlValue(entry.subscription_notes),
      sqlValue(entry.subscription_source_url),
      sqlValue(tco.cents),
      sqlValue(tco.notes),
      sqlValue(JSON.stringify(links)),
      sqlValue(entry.featured ? 1 : 0),
      sqlValue("published"),
      sqlValue(now),
      sqlValue(now),
    ].join(", ")});`,
  );
}

const sponsor = catalog.sponsor;
statements.push(
  `INSERT OR REPLACE INTO sponsor_weeks (
    id, slug, name, tagline, url, starts_on, ends_on, active, created_at
  ) VALUES (${[
    sqlValue(sponsor.slug),
    sqlValue(sponsor.slug),
    sqlValue(sponsor.name),
    sqlValue(sponsor.tagline),
    sqlValue(sponsor.url),
    sqlValue(sponsor.starts_on),
    sqlValue(sponsor.ends_on),
    sqlValue(1),
    sqlValue(now),
  ].join(", ")});`,
);

const file = join(root, "data/seed.sql");
writeFileSync(file, statements.join("\n") + "\n");

const args = ["d1", "execute", "protocol-golf-lab", remote ? "--remote" : "--local", `--file=${file}`];
const result = spawnSync("npx", ["wrangler", ...args], { cwd: root, stdio: "inherit" });
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
console.log(`Seeded ${catalog.entries.length} entries (${remote ? "remote" : "local"}).`);
