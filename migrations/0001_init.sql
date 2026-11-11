-- Protocol Golf Lab v1. Categories are generic so later gear (clubs, balls,
-- shafts, grips, training aids) is another row plus a spec_schema, not a new table.

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  spec_schema TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  specs TEXT NOT NULL,
  price_cents INTEGER,
  compare_at_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  price_notes TEXT,
  price_source_url TEXT,
  price_source_label TEXT,
  price_checked_on TEXT,
  subscription_annual_cents INTEGER,
  subscription_required INTEGER,
  subscription_name TEXT,
  subscription_notes TEXT,
  subscription_source_url TEXT,
  tco_3yr_cents INTEGER,
  tco_notes TEXT,
  links TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_entries_category ON entries (category_id, status);
CREATE INDEX idx_entries_featured ON entries (featured, tco_3yr_cents);

CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_note TEXT,
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);

CREATE INDEX idx_submissions_status ON submissions (status, created_at);

CREATE TABLE owner_reports (
  id TEXT PRIMARY KEY,
  entry_id TEXT,
  product_name TEXT NOT NULL,
  author_name TEXT NOT NULL,
  email TEXT NOT NULL,
  months_owned INTEGER,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_note TEXT,
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);

CREATE INDEX idx_owner_reports_entry ON owner_reports (entry_id, status);

CREATE TABLE signups (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  source TEXT NOT NULL,
  resend_synced INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE zero_result_searches (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  category TEXT,
  filters TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE pageviews (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_pageviews_created ON pageviews (created_at);

CREATE TABLE sponsor_weeks (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  url TEXT NOT NULL,
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE sponsor_clicks (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  kind TEXT NOT NULL,
  referrer TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_sponsor_clicks_created ON sponsor_clicks (created_at);

CREATE TABLE sponsor_inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE errors (
  id TEXT PRIMARY KEY,
  path TEXT,
  message TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL
);
