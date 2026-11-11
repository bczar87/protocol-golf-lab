import { money } from "@/lib/format";
import type { Entry } from "@/lib/types";
import { LabBadge } from "./chrome";

export function GearCard({ entry }: { entry: Entry }) {
  const bits = [
    entry.specs.ok_on_concrete === true ? "OK on concrete" : null,
    entry.specs.real_tee === true ? "Real tee" : null,
    entry.specs.replaceable_insert === true ? "Replaceable insert" : null,
    typeof entry.specs.environment === "string" ? entry.specs.environment : null,
    entry.specs.gspro_compatible === true ? "GSPro list" : null,
  ].filter(Boolean);

  return (
    <a className="card" href={`/gear/${entry.slug}`}>
      <div className="card-top">
        <span className="kicker">
          {entry.category_name} · {entry.brand}
        </span>
        <LabBadge />
      </div>
      <h3>{entry.name}</h3>
      <div className="price-row">
        <span className="price">{money(entry.tco_3yr_cents)}</span>
        <span className="small muted">3-year</span>
      </div>
      <p className="small muted" style={{ margin: 0 }}>
        Price {money(entry.price_cents)}
        {entry.price_checked_on ? ` · checked ${entry.price_checked_on}` : ""}
      </p>
      {bits.length ? (
        <div className="chips">
          {bits.map((bit) => (
            <span className="chip" key={bit}>
              {bit}
            </span>
          ))}
        </div>
      ) : null}
    </a>
  );
}
