import type { Metadata } from "next";
import { GearCard } from "@/components/gear-card";
import { getDb, logError } from "@/lib/db";
import { listEntries, matchesSearch, readSearch, searchIsConstrained, sortEntries } from "@/lib/queries";
import type { Entry } from "@/lib/types";

export const metadata: Metadata = {
  title: "Search",
  description: "Filter hitting mats and launch monitors by the specs that were actually published.",
};

function distinct(entries: Entry[], key: string): string[] {
  const values = new Set<string>();
  for (const entry of entries) {
    const value = entry.specs[key];
    if (typeof value === "string" && value) values.add(value);
  }
  return [...values].sort();
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") params.set(key, value);
  }
  const input = readSearch(params);
  const db = await getDb();
  const entries = db ? await listEntries(db) : [];
  const results = sortEntries(entries.filter((entry) => matchesSearch(entry, input)), input.sort);
  const jointOptions = distinct(entries, "joint_feel");

  if (db && searchIsConstrained(input) && results.length === 0) {
    try {
      await db
        .prepare("INSERT INTO zero_result_searches (id, query, category, filters, created_at) VALUES (?, ?, ?, ?, ?)")
        .bind(crypto.randomUUID(), input.q || "(no query)", input.category || null, JSON.stringify(input), new Date().toISOString())
        .run();
    } catch (error) {
      await logError("/search", "zero-result log failed", error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <div className="wrap" style={{ padding: "1.2rem 0 2rem" }}>
      <p className="kicker">Search</p>
      <h1 className="page-title">Filter the sheet</h1>
      <div className="layout">
        <form className="filters sheet" action="/search">
          <div className="field">
            <label htmlFor="q">Text</label>
            <input id="q" name="q" defaultValue={input.q} />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue={input.category}>
              <option value="">All</option>
              <option value="hitting-mats">Hitting mats</option>
              <option value="launch-monitors">Launch monitors</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="max_price">Max price (USD)</label>
            <input id="max_price" name="max_price" type="number" min={0} defaultValue={input.maxPrice ?? ""} />
          </div>
          <fieldset>
            <legend className="kicker">Mats</legend>
            <div className="field">
              <label htmlFor="ok_on_concrete">OK on concrete</label>
              <select id="ok_on_concrete" name="ok_on_concrete" defaultValue={input.flags.ok_on_concrete ?? ""}>
                <option value="">Any</option>
                <option value="yes">Yes, the page says so</option>
                <option value="no">Page says no</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="real_tee">Real tee</label>
              <select id="real_tee" name="real_tee" defaultValue={input.flags.real_tee ?? ""}>
                <option value="">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="replaceable_insert">Replaceable insert</label>
              <select id="replaceable_insert" name="replaceable_insert" defaultValue={input.flags.replaceable_insert ?? ""}>
                <option value="">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="joint_feel">Joint feel, as published</label>
              <select id="joint_feel" name="joint_feel" defaultValue={input.flags.joint_feel ?? ""}>
                <option value="">Any</option>
                {jointOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>
          <fieldset>
            <legend className="kicker">Launch monitors</legend>
            <div className="field">
              <label htmlFor="room_ft">Your room depth (ft)</label>
              <input id="room_ft" name="room_ft" type="number" min={0} defaultValue={input.roomFt ?? ""} />
            </div>
            <p className="small muted">Only monitors with a published depth number are kept. Most makers do not print one number.</p>
            <div className="field">
              <label htmlFor="environment">Indoor / outdoor</label>
              <select id="environment" name="environment" defaultValue={input.flags.environment ?? ""}>
                <option value="">Any</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="both">Both, as stated</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="data_points">Data point contains</label>
              <input id="data_points" name="data_points" defaultValue={input.flags.data_points ?? ""} placeholder="spin, club path" />
            </div>
            <div className="field">
              <label htmlFor="gspro_compatible">GSPro</label>
              <select id="gspro_compatible" name="gspro_compatible" defaultValue={input.flags.gspro_compatible ?? ""}>
                <option value="">Any</option>
                <option value="yes">On the GSPro list</option>
                <option value="no">Named as not supported</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="max_sub">Max published subscription (USD / year)</label>
              <input id="max_sub" name="max_sub" type="number" min={0} defaultValue={input.maxSub ?? ""} />
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="sort">Sort</label>
            <select id="sort" name="sort" defaultValue={input.sort}>
              <option value="tco">3-year cost</option>
              <option value="price">Price</option>
              <option value="brand">Brand</option>
            </select>
          </div>
          <button className="button" type="submit">
            Apply
          </button>
        </form>
        <div>
          <p className="kicker">{results.length} rows</p>
          <div className="cards">
            {results.map((entry) => (
              <GearCard key={entry.slug} entry={entry} />
            ))}
          </div>
          {results.length === 0 ? <p>Nothing on the sheet matches. The miss is logged.</p> : null}
        </div>
      </div>
    </div>
  );
}
