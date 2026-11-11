import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabBadge } from "@/components/chrome";
import { getDb, siteUrl } from "@/lib/db";
import { checkedLabel, money, optionalPlanCost, specText } from "@/lib/format";
import { approvedReports, getEntry } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const entry = db ? await getEntry(db, slug) : null;
  if (!entry) return { title: "Gear" };
  const site = await siteUrl();
  const description = `${entry.name}. Price ${money(entry.price_cents)}, checked ${checkedLabel(entry.price_checked_on)}. 3-year cost ${money(entry.tco_3yr_cents)}. Lab score coming soon.`;
  return {
    title: entry.name,
    description,
    alternates: { canonical: `${site}/gear/${entry.slug}` },
    openGraph: { title: entry.name, description },
  };
}

export default async function GearPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  if (!db) notFound();
  const entry = await getEntry(db, slug);
  if (!entry) notFound();
  const reports = await approvedReports(db, entry.id);
  const source = entry.links.find((link) => link.slug === `src-${entry.slug}`);
  const plan = optionalPlanCost(entry.price_cents, entry.subscription_required, entry.subscription_annual_cents);

  return (
    <div className="wrap" style={{ padding: "1.2rem 0 2rem" }}>
      <p className="kicker">
        <a href={`/search?category=${entry.category_slug}`}>{entry.category_name}</a> · {entry.brand}
      </p>
      <div className="price-row" style={{ alignItems: "start" }}>
        <h1 className="page-title" style={{ marginRight: "1rem" }}>
          {entry.name}
        </h1>
        <LabBadge />
      </div>
      <p className="lede">{entry.summary}</p>
      <div className="detail">
        <section className="sheet">
          <p className="kicker">Checked price</p>
          <p className="price" style={{ fontSize: "1.8rem", margin: "0.2rem 0" }}>
            {money(entry.price_cents)}
          </p>
          {entry.compare_at_cents && entry.compare_at_cents !== entry.price_cents ? (
            <p className="small muted">Compare-at on the same record: {money(entry.compare_at_cents)}</p>
          ) : null}
          <p className="small">
            Source: {entry.price_source_label || "Source page"} · checked {checkedLabel(entry.price_checked_on)}
          </p>
          {source ? <a href={`/go/${source.slug}`}>Open the source page</a> : null}
          {entry.price_notes ? <p className="small muted">{entry.price_notes}</p> : null}
          <hr className="rule" />
          <p className="kicker">3-year cost</p>
          <p className="price" style={{ fontSize: "1.8rem", margin: "0.2rem 0" }}>
            {money(entry.tco_3yr_cents)}
          </p>
          <p className="small">{entry.tco_notes}</p>
          {plan != null ? (
            <p className="small">
              If you add {entry.subscription_name || "the published plan"} at {money(entry.subscription_annual_cents)} per year, three years is {money(plan)}. That plan is not in the figure above.
            </p>
          ) : null}
          <hr className="rule" />
          <p className="kicker">Subscription</p>
          <p className="small">
            {entry.subscription_name || "No plan name published"} ·{" "}
            {entry.subscription_required === 1 ? "Required" : entry.subscription_required === 0 ? "Not required" : "Requirement not published"} ·{" "}
            {entry.subscription_annual_cents == null ? "Annual price not published" : `${money(entry.subscription_annual_cents)} / year`}
          </p>
          {entry.subscription_notes ? <p className="small muted">{entry.subscription_notes}</p> : null}
          {entry.links
            .filter((link) => link.slug !== source?.slug)
            .map((link) => (
              <p key={link.slug} className="small">
                <a href={`/go/${link.slug}`}>{link.label}</a>
              </p>
            ))}
        </section>
        <section className="sheet">
          <p className="kicker">Spec sheet</p>
          <table className="spec">
            <tbody>
              {entry.spec_schema.columns.map((column) => (
                <tr key={column.key}>
                  <th scope="row">{column.label}</th>
                  <td>{specText(entry.specs[column.key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small muted">A dash means that field was not on the source we checked. It is not a zero and it is not a lab measurement.</p>
        </section>
      </div>
      <section style={{ marginTop: "1.4rem" }}>
        <div className="section-head">
          <h2>Owner reports</h2>
          <a href="/submit">Submit one</a>
        </div>
        {reports.length === 0 ? (
          <p className="muted">None approved yet. A report sits in the review queue until it is approved. Nothing on this form publishes itself.</p>
        ) : (
          <div className="reports">
            {reports.map((report) => (
              <article className="report" key={report.id}>
                <p className="kicker">
                  {report.author_name}
                  {report.months_owned != null ? ` · ${report.months_owned} months` : ""} · {report.created_at.slice(0, 10)}
                </p>
                <p>{report.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
