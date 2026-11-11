import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { tcoCents } from "./tco.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(root, "data/catalog.json"), "utf8"));

assert.ok(catalog.entries.length >= 30, "need at least 30 products");
const slugs = new Set();
for (const entry of catalog.entries) {
  assert.ok(!slugs.has(entry.slug), `duplicate slug ${entry.slug}`);
  slugs.add(entry.slug);
  assert.equal(typeof entry.price_cents, "number");
  assert.ok(entry.price_cents > 0);
  assert.ok(entry.source_url.startsWith("https://"));
  assert.ok(entry.summary.length > 20);
  const tco = tcoCents(
    entry.price_cents,
    entry.subscription_required === true ? 1 : entry.subscription_required === false ? 0 : null,
    entry.subscription_annual_cents,
  );
  if (entry.subscription_required !== true) {
    assert.equal(tco.cents, entry.price_cents);
  }
}

const required = tcoCents(10000, 1, 2000);
assert.equal(required.cents, 16000);
const optional = tcoCents(10000, 0, 2000);
assert.equal(optional.cents, 10000);
const unknown = tcoCents(10000, null, null);
assert.equal(unknown.cents, 10000);
const missingSub = tcoCents(10000, 1, null);
assert.equal(missingSub.cents, null);

const { emailBlockReason } = await import("../lib/email-rules.mjs");
assert.equal(emailBlockReason("ada@example.com"), "test");
assert.equal(emailBlockReason("someone@mailinator.com"), "disposable");
assert.equal(emailBlockReason("test@gmail.com"), "test");
assert.equal(emailBlockReason("asdf@gmail.com"), "test");
assert.equal(emailBlockReason("a@b.co"), "junk");
assert.equal(emailBlockReason("not-an-email"), "invalid");
assert.equal(emailBlockReason("golfer@proton.me"), null);

console.log(`self-check ok (${catalog.entries.length} entries)`);
