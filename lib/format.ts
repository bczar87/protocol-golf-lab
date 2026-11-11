export function money(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function checkedLabel(iso: string | null): string {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${year}-${month}-${day}`;
}

export function specText(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

export function optionalPlanCost(price: number | null, required: number | null, annual: number | null): number | null {
  if (price == null || annual == null || annual <= 0) return null;
  if (required === 1) return null;
  return price + annual * 3;
}
