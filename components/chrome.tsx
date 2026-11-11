"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Sponsor } from "@/lib/types";

const NAV = [
  ["Search", "/search"],
  ["How we test", "/how-we-test"],
  ["Sponsors", "/sponsors"],
  ["Submit", "/submit"],
];

export function Header() {
  return (
    <>
      <div className="classify">
        <div className="wrap">
          <span>PGL-REV-1 · Public data sheet</span>
          <span>Lab score not issued</span>
        </div>
      </div>
      <header className="site-header">
        <div className="wrap header-row">
          <a className="brand" href="/">
            <span className="mark">PGL</span>
            <span>
              <strong>Protocol Golf Lab</strong>
              <span>Specs, checked prices, 3-year cost</span>
            </span>
          </a>
          <nav aria-label="Primary">
            {NAV.map(([label, href]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <p className="kicker">Mailing list</p>
          <p className="small muted">First lab scores, when a protocol is actually signed off. Stored in our database.</p>
          <Newsletter source="footer" />
        </div>
        <div>
          <p className="kicker">Sheet</p>
          <div className="footer-links">
            {NAV.map(([label, href]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
            <a href="/go/gspro-supported-list">GSPro list</a>
          </div>
          <p className="small muted">Outbound links go through /go so the click is counted here. No third-party analytics pixel.</p>
        </div>
      </div>
    </footer>
  );
}

export function Newsletter({ source }: { source: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: data.get("email"), source, website: data.get("website") }),
    });
    const body = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !body.ok) {
      setError(body.error || "Could not save that address.");
      return;
    }
    form.reset();
    setMessage("Saved. We will use it when the first scores are ready.");
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor={`email-${source}`}>Email</label>
        <input id={`email-${source}`} name="email" type="email" autoComplete="email" required maxLength={254} />
      </div>
      <Honeypot />
      <button className="button" type="submit">
        Send the first results
      </button>
      {message ? <p className="ok small">{message}</p> : null}
      {error ? <p className="error small">{error}</p> : null}
    </form>
  );
}

export function Honeypot() {
  return (
    <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
      <label>
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function SponsorBar({ sponsor }: { sponsor: Sponsor | null }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!sponsor) return;
    const closed = window.localStorage.getItem("pgl-sponsor-dismissed");
    setOpen(closed !== sponsor.id);
  }, [sponsor]);
  useEffect(() => {
    document.body.classList.toggle("has-sponsor", Boolean(sponsor && open));
  }, [sponsor, open]);
  if (!sponsor || !open) return null;
  return (
    <aside className="sponsor-bar" aria-label="Sponsor">
      <div className="wrap">
        <p>
          <span className="kicker" style={{ color: "#d9d3c3" }}>
            Sponsor ·{" "}
          </span>
          <a href={`/go/${sponsor.slug}`}>
            {sponsor.name}
            {sponsor.tagline ? ` — ${sponsor.tagline}` : ""}
          </a>
        </p>
        <button
          type="button"
          aria-label="Close sponsor bar"
          onClick={() => {
            window.localStorage.setItem("pgl-sponsor-dismissed", sponsor.id);
            setOpen(false);
          }}
        >
          ×
        </button>
      </div>
    </aside>
  );
}

export function Pageview() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/api") || pathname.startsWith("/go")) return;
    const key = `pgl-pv:${pathname}:${new Date().toISOString().slice(0, 16)}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    void fetch("/api/pageview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    });
  }, [pathname]);
  return null;
}

export function LabBadge() {
  return (
    <span className="badge">
      <span>Lab score</span>
      <span>Coming soon</span>
    </span>
  );
}
