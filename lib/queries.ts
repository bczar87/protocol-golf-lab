import type { Entry, LinkRecord, OwnerReport, SearchInput, SpecSchema, SpecValue, Sponsor } from "./types";

type EntryRow = {
  id: string;
  category_id: string;
  category_slug: string;
  category_name: string;
  spec_schema: string;
  slug: string;
  brand: string;
  name: string;
  summary: string;
  specs: string;
  price_cents: number | null;
  compare_at_cents: number | null;
  price_notes: string | null;
  price_source_url: string | null;
  price_source_label: string | null;
  price_checked_on: string | null;
  subscription_annual_cents: number | null;
  subscription_required: number | null;
  subscription_name: string | null;
  subscription_notes: string | null;
  subscription_source_url: string | null;
  tco_3yr_cents: number | null;
  tco_notes: string | null;
  links: string;
  featured: number;
};

const ENTRY_SQL = `
  SELECT e.id, e.category_id, e.slug, e.brand, e.name, e.summary, e.specs,
         e.price_cents, e.compare_at_cents, e.price_notes, e.price_source_url,
         e.price_source_label, e.price_checked_on, e.subscription_annual_cents,
         e.subscription_required, e.subscription_name, e.subscription_notes,
         e.subscription_source_url, e.tco_3yr_cents, e.tco_notes, e.links, e.featured,
         c.slug AS category_slug, c.name AS category_name, c.spec_schema
  FROM entries e
  JOIN categories c ON c.id = e.category_id
  WHERE e.status = 'published'
`;

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapEntry(row: EntryRow): Entry {
  return {
    ...row,
    spec_schema: parseJson<SpecSchema>(row.spec_schema, { filters: [], columns: [] }),
    specs: parseJson<Record<string, SpecValue>>(row.specs, {}),
    links: parseJson<LinkRecord[]>(row.links, []),
  };
}

export async function listEntries(db: D1Database): Promise<Entry[]> {
  const result = await db.prepare(ENTRY_SQL).all<EntryRow>();
  return (result.results ?? []).map(mapEntry);
}

export async function getEntry(db: D1Database, slug: string): Promise<Entry | null> {
  const row = await db.prepare(`${ENTRY_SQL} AND e.slug = ?`).bind(slug).first<EntryRow>();
  return row ? mapEntry(row) : null;
}

export async function approvedReports(db: D1Database, entryId: string): Promise<OwnerReport[]> {
  const result = await db
    .prepare(
      `SELECT id, entry_id, product_name, author_name, months_owned, body, created_at
       FROM owner_reports
       WHERE entry_id = ? AND status = 'approved'
       ORDER BY created_at DESC`,
    )
    .bind(entryId)
    .all<OwnerReport>();
  return result.results ?? [];
}

export async function currentSponsor(db: D1Database): Promise<Sponsor | null> {
  return db
    .prepare(
      `SELECT id, slug, name, tagline, url
       FROM sponsor_weeks
       WHERE active = 1
       ORDER BY starts_on DESC
       LIMIT 1`,
    )
    .first<Sponsor>();
}

export function matchesSearch(entry: Entry, input: SearchInput): boolean {
  if (input.category && entry.category_slug !== input.category) return false;
  if (input.q) {
    const haystack = `${entry.brand} ${entry.name} ${entry.summary}`.toLowerCase();
    if (!haystack.includes(input.q.toLowerCase())) return false;
  }
  if (input.maxPrice != null) {
    if (entry.price_cents == null || entry.price_cents > input.maxPrice * 100) return false;
  }
  if (input.maxSub != null) {
    if (entry.subscription_annual_cents == null || entry.subscription_annual_cents > input.maxSub * 100) return false;
  }
  if (input.roomFt != null) {
    const depth = entry.specs.room_depth_ft;
    if (typeof depth !== "number" || depth > input.roomFt) return false;
  }
  for (const [key, raw] of Object.entries(input.flags)) {
    if (!raw) continue;
    const field = entry.spec_schema.filters.find((item) => item.key === key);
    if (!field) return false;
    const value = entry.specs[key];
    if (field.type === "boolean") {
      if (raw === "yes" && value !== true) return false;
      if (raw === "no" && value !== false) return false;
    } else if (field.type === "enum" || key === "environment") {
      if (key === "environment" && (raw === "indoor" || raw === "outdoor")) {
        if (value !== raw && value !== "both") return false;
      } else if (value !== raw) return false;
    } else if (key === "data_points") {
      const points = Array.isArray(value) ? value.join(" ") : String(value ?? "");
      if (!points.toLowerCase().includes(raw.toLowerCase())) return false;
    } else if (String(value ?? "") !== raw) {
      return false;
    }
  }
  return true;
}

export function sortEntries(entries: Entry[], sort: SearchInput["sort"]): Entry[] {
  const copy = [...entries];
  copy.sort((a, b) => {
    if (sort === "brand") return a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name);
    const key = sort === "price" ? "price_cents" : "tco_3yr_cents";
    const av = a[key];
    const bv = b[key];
    if (av == null && bv == null) return a.name.localeCompare(b.name);
    if (av == null) return 1;
    if (bv == null) return -1;
    return av - bv || a.name.localeCompare(b.name);
  });
  return copy;
}

export function readSearch(params: URLSearchParams): SearchInput {
  const numberOrNull = (key: string) => {
    const raw = params.get(key);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : null;
  };
  const sort = params.get("sort");
  const flags: Record<string, string> = {};
  for (const key of ["ok_on_concrete", "real_tee", "replaceable_insert", "joint_feel", "environment", "gspro_compatible", "data_points"]) {
    const value = params.get(key);
    if (value) flags[key] = value;
  }
  return {
    q: (params.get("q") ?? "").trim().slice(0, 80),
    category: params.get("category") ?? "",
    maxPrice: numberOrNull("max_price"),
    maxSub: numberOrNull("max_sub"),
    roomFt: numberOrNull("room_ft"),
    sort: sort === "price" || sort === "brand" ? sort : "tco",
    flags,
  };
}

export function searchIsConstrained(input: SearchInput): boolean {
  return Boolean(input.q || input.category || input.maxPrice != null || input.maxSub != null || input.roomFt != null || Object.keys(input.flags).length);
}
