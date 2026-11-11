export function tcoCents(price, required, annual) {
  if (price == null) {
    return { cents: null, notes: "No checked price, so the 3-year cost is blank." };
  }
  if (required === 1 || required === true) {
    if (annual == null) {
      return {
        cents: null,
        notes: "A subscription is required, and no annual price was published, so the 3-year cost is blank.",
      };
    }
    return {
      cents: price + annual * 3,
      notes: "Checked price plus three years of the required published subscription.",
    };
  }
  if (required === 0 || required === false) {
    return {
      cents: price,
      notes: annual
        ? "Checked price only. A paid plan is published, and the source says it is not required to use the gear."
        : "Checked price only. The source says a paid subscription is not required.",
    };
  }
  return {
    cents: price,
    notes: "Checked price only. The source did not say whether a subscription is required.",
  };
}
