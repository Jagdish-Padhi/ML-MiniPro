export const metric = (value) => (typeof value === "number" ? value.toFixed(3) : "n/a");

export const percent = (share) => `${(share * 100).toFixed(1)}%`;

export const count = (n) => n.toLocaleString("en-US");

const OPTION_LABELS = {
  HOMEIMPROVEMENT: "Home improvement",
  DEBTCONSOLIDATION: "Debt consolidation",
};

/** Dropdown text for a categorical value from the dataset (RENT -> Rent, female -> Female). */
export function optionLabel(value) {
  if (OPTION_LABELS[value]) return OPTION_LABELS[value];
  const text = String(value);
  const singleCase = text === text.toUpperCase() || text === text.toLowerCase();
  return singleCase ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : text;
}
