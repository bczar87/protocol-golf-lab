import type { Metadata } from "next";
import { GearSubmitForm, ReportForm } from "@/components/forms";
import { getDb } from "@/lib/db";
import { listEntries } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Submit",
  description: "Submit an owner report or a piece of gear. Both wait for review. Nothing publishes itself.",
};

export default async function SubmitPage() {
  const db = await getDb();
  const entries = db ? await listEntries(db) : [];
  const products = entries
    .map((entry) => ({ slug: entry.slug, label: `${entry.brand} ${entry.name}` }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="wrap" style={{ padding: "1.2rem 0 2rem" }}>
      <p className="kicker">Review queue</p>
      <h1 className="page-title">Nothing here publishes itself.</h1>
      <div className="layout">
        <section className="sheet">
          <h2>Owner report</h2>
          <p className="small muted">Use this for gear you actually own. Approved reports show on the matching gear page. Rejected ones stay in the queue.</p>
          <ReportForm products={products} />
        </section>
        <section className="sheet">
          <h2>New gear</h2>
          <p className="small muted">
            Suggest a product with the page that prints the spec or the price. Approval marks the suggestion reviewed. It does not create a catalog row. A row is added only after the fields are checked.
          </p>
          <GearSubmitForm />
        </section>
      </div>
    </div>
  );
}
