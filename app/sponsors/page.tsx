import type { Metadata } from "next";
import { InquiryForm } from "@/components/forms";
import { getDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Sponsors",
  description: "Sponsor slot for Protocol Golf Lab. Signup and pageview counts come from the same database as the gear sheet.",
};

async function count(db: D1Database, sql: string, bind: string[] = []) {
  const row = await db.prepare(sql).bind(...bind).first<{ n: number }>();
  return row?.n ?? 0;
}

export default async function SponsorsPage() {
  const db = await getDb();
  const month = new Date().toISOString().slice(0, 7);
  const signups = db ? await count(db, "SELECT COUNT(*) AS n FROM signups") : 0;
  const viewsMonth = db ? await count(db, "SELECT COUNT(*) AS n FROM pageviews WHERE created_at >= ?", [`${month}-01`]) : 0;
  const viewsAll = db ? await count(db, "SELECT COUNT(*) AS n FROM pageviews") : 0;
  const clicksMonth = db ? await count(db, "SELECT COUNT(*) AS n FROM sponsor_clicks WHERE created_at >= ?", [`${month}-01`]) : 0;

  return (
    <div className="wrap" style={{ padding: "1.2rem 0 2rem" }}>
      <p className="kicker">Sponsor slot</p>
      <h1 className="page-title">One bar. Counted here.</h1>
      <p className="lede">
        The bar at the bottom is a single slot. These numbers are rows in the same D1 database as the gear. There is no third-party analytics tag. A click on the bar, a source page, or any other outbound link is a row in the click log because it passes through /go.
      </p>
      <div className="stats">
        <div className="stat">
          <span className="kicker">Signups</span>
          <b>{signups}</b>
        </div>
        <div className="stat">
          <span className="kicker">Pageviews this month</span>
          <b>{viewsMonth}</b>
        </div>
        <div className="stat">
          <span className="kicker">Pageviews, all</span>
          <b>{viewsAll}</b>
        </div>
        <div className="stat">
          <span className="kicker">Outbound clicks this month</span>
          <b>{clicksMonth}</b>
        </div>
      </div>
      <div className="layout" style={{ marginTop: "1.2rem" }}>
        <section className="prose">
          <h2>What the slot is</h2>
          <p>
            The seeded slot is the lab&apos;s own open week, pointed at this page, so the bar is not pretending to be a paid brand. A real sponsor replaces that row. The admin API accepts a new sponsor week. It does not invent traffic.
          </p>
          <p>Revenue for the lab is this slot and affiliate links. Affiliate URLs can replace the outbound href on a gear row without changing the click logger.</p>
        </section>
        <section className="sheet">
          <p className="kicker">Get in touch</p>
          <InquiryForm />
        </section>
      </div>
    </div>
  );
}
