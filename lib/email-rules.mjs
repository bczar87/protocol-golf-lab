const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "sharklasers.com",
  "guerrillamailblock.com",
  "grr.la",
  "yopmail.com",
  "yopmail.fr",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "10minutemail.com",
  "10minutemail.net",
  "trashmail.com",
  "trashmail.de",
  "dispostable.com",
  "discard.email",
  "getnada.com",
  "nada.email",
  "maildrop.cc",
  "mailnesia.com",
  "mintemail.com",
  "moakt.com",
  "emailondeck.com",
  "throwawaymail.com",
  "fakeinbox.com",
  "mytemp.email",
  "spamgourmet.com",
  "inboxkitten.com",
  "mailcatch.com",
  "tempinbox.com",
  "burnermail.io",
  "guerrillamail.biz",
]);

const TEST_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.test",
  "localhost",
  "invalid",
]);

const JUNK_LOCAL = /^(test|testing|fake|asdf|asdfasdf|qwerty|spam|junk|nobody|noreply|no-reply|null|void|example|abc|abcd|foo|bar|aaa+)$/i;

export function emailBlockReason(email) {
  const trimmed = String(email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "invalid";
  const [local, domain] = trimmed.split("@");
  if (!local || !domain || local.length < 2) return "junk";
  if (JUNK_LOCAL.test(local)) return "test";
  if (/^(test|fake|asdf)\d*$/i.test(local)) return "test";
  if (/(.)\1{6,}/.test(local)) return "junk";
  if (TEST_DOMAINS.has(domain)) return "test";
  if (domain.endsWith(".test") || domain.endsWith(".invalid") || domain.endsWith(".example") || domain.endsWith(".localhost")) {
    return "test";
  }
  if (DISPOSABLE_DOMAINS.has(domain)) return "disposable";
  return null;
}
