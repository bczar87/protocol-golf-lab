export type SpecValue = string | number | boolean | string[] | null;

export type LinkRecord = {
  slug: string;
  href: string;
  label: string;
  kind: string;
};

export type SpecField = {
  key: string;
  label: string;
  type?: "boolean" | "text" | "enum" | "number";
  options?: string[];
};

export type SpecSchema = {
  filters: SpecField[];
  columns: SpecField[];
};

export type Entry = {
  id: string;
  category_id: string;
  category_slug: string;
  category_name: string;
  spec_schema: SpecSchema;
  slug: string;
  brand: string;
  name: string;
  summary: string;
  specs: Record<string, SpecValue>;
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
  links: LinkRecord[];
  featured: number;
};

export type OwnerReport = {
  id: string;
  entry_id: string | null;
  product_name: string;
  author_name: string;
  months_owned: number | null;
  body: string;
  created_at: string;
};

export type Sponsor = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  url: string;
};

export type SearchInput = {
  q: string;
  category: string;
  maxPrice: number | null;
  maxSub: number | null;
  roomFt: number | null;
  sort: "tco" | "price" | "brand";
  flags: Record<string, string>;
};
