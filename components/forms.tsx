"use client";

import { useState } from "react";
import { Honeypot } from "./chrome";

type ProductOption = { slug: string; label: string };

function Status({ message, error }: { message: string | null; error: string | null }) {
  return (
    <>
      {message ? <p className="ok small">{message}</p> : null}
      {error ? <p className="error small">{error}</p> : null}
    </>
  );
}

async function postForm(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { ok?: boolean; error?: string };
  return { ok: response.ok && Boolean(body.ok), error: body.error || "Could not save that." };
}

export function ReportForm({ products }: { products: ProductOption[] }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const result = await postForm("/api/reports", data);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    form.reset();
    setMessage("Queued for review. It does not go on the gear page until someone approves it.");
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="report-name">Name</label>
        <input id="report-name" name="author_name" required maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="report-email">Email</label>
        <input id="report-email" name="email" type="email" required maxLength={254} />
      </div>
      <div className="field">
        <label htmlFor="report-product">Gear</label>
        <select id="report-product" name="entry_slug" defaultValue="">
          <option value="">Not in the sheet yet</option>
          {products.map((product) => (
            <option key={product.slug} value={product.slug}>
              {product.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="report-product-name">Product name if it is not listed</label>
        <input id="report-product-name" name="product_name" maxLength={160} />
      </div>
      <div className="field">
        <label htmlFor="report-months">Months owned</label>
        <input id="report-months" name="months_owned" type="number" min={0} max={240} />
      </div>
      <div className="field">
        <label htmlFor="report-body">What you would put in a test log</label>
        <textarea id="report-body" name="body" required minLength={40} maxLength={4000} rows={6} />
      </div>
      <Honeypot />
      <button className="button" type="submit">
        Submit for review
      </button>
      <Status message={message} error={error} />
    </form>
  );
}

export function GearSubmitForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const result = await postForm("/api/submissions", data);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    form.reset();
    setMessage("Queued. A submission is not a catalog row until the specs are checked and entered by hand.");
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="gear-name">Your name</label>
        <input id="gear-name" name="name" required maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="gear-email">Email</label>
        <input id="gear-email" name="email" type="email" required maxLength={254} />
      </div>
      <div className="field">
        <label htmlFor="gear-category">Category</label>
        <select id="gear-category" name="category" required defaultValue="hitting-mats">
          <option value="hitting-mats">Hitting mat</option>
          <option value="launch-monitors">Launch monitor</option>
          <option value="other">Something else</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="gear-brand">Brand</label>
        <input id="gear-brand" name="brand" required maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="gear-product">Product</label>
        <input id="gear-product" name="product" required maxLength={160} />
      </div>
      <div className="field">
        <label htmlFor="gear-url">Page where the spec or price is printed</label>
        <input id="gear-url" name="source_url" type="url" required maxLength={500} />
      </div>
      <div className="field">
        <label htmlFor="gear-notes">What should be checked</label>
        <textarea id="gear-notes" name="notes" required minLength={20} maxLength={2000} rows={5} />
      </div>
      <Honeypot />
      <button className="button" type="submit">
        Submit gear
      </button>
      <Status message={message} error={error} />
    </form>
  );
}

export function InquiryForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const result = await postForm("/api/inquiries", data);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    form.reset();
    setMessage("Saved. This goes to the same database as the signup count.");
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="inq-name">Name</label>
        <input id="inq-name" name="name" required maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="inq-email">Email</label>
        <input id="inq-email" name="email" type="email" required maxLength={254} />
      </div>
      <div className="field">
        <label htmlFor="inq-company">Company</label>
        <input id="inq-company" name="company" maxLength={120} />
      </div>
      <div className="field">
        <label htmlFor="inq-message">What you want the slot to say</label>
        <textarea id="inq-message" name="message" required minLength={20} maxLength={2000} rows={5} />
      </div>
      <Honeypot />
      <button className="button" type="submit">
        Get in touch
      </button>
      <Status message={message} error={error} />
    </form>
  );
}
