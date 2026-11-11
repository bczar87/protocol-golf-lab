import { GearCard } from "@/components/gear-card";
import { getDb } from "@/lib/db";
import { listEntries, sortEntries } from "@/lib/queries";

export default async function HomePage() {
  const db = await getDb();
  const entries = db ? await listEntries(db) : [];
  const mats = sortEntries(
    entries.filter((entry) => entry.featured && entry.category_slug === "hitting-mats"),
    "tco",
  ).slice(0, 6);
  const monitors = sortEntries(
    entries.filter((entry) => entry.featured && entry.category_slug === "launch-monitors"),
    "tco",
  ).slice(0, 6);
  const matCount = entries.filter((entry) => entry.category_slug === "hitting-mats").length;
  const monitorCount = entries.filter((entry) => entry.category_slug === "launch-monitors").length;

  return (
    <div className="wrap">
      <section className="hero">
        <p className="kicker">Bench sheet · not a survey</p>
        <h1>We measured it, not surveyed it.</h1>
        <p className="lede">
          The lab scores are not printed yet. What is on this sheet is the part that can be checked without a protocol: the product, the spec a maker or major retailer actually published, the price on that page, the day we read it, and a 3-year cost.
        </p>
        <form action="/search">
          <label className="kicker" htmlFor="q">
            Search the sheet
          </label>
          <div className="search-bar">
            <input id="q" name="q" placeholder="Mat, monitor, brand" />
            <button className="button" type="submit">
              Search
            </button>
          </div>
        </form>
        <p className="small muted">
          {matCount} hitting mats and {monitorCount} launch monitors. The rows below are the featured bench, sorted by verified 3-year cost. That is not a ranking.
        </p>
      </section>
      {!db ? <p className="note">The database binding is not available in this process.</p> : null}
      <div className="bench">
        <section>
          <div className="section-head">
            <div>
              <p className="kicker">01 · Hitting mats</p>
              <h2>On the bench</h2>
            </div>
            <a href="/search?category=hitting-mats">All mats</a>
          </div>
          <div className="cards">
            {mats.map((entry) => (
              <GearCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </section>
        <section>
          <div className="section-head">
            <div>
              <p className="kicker">02 · Launch monitors</p>
              <h2>On the bench</h2>
            </div>
            <a href="/search?category=launch-monitors">All monitors</a>
          </div>
          <div className="cards">
            {monitors.map((entry) => (
              <GearCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
