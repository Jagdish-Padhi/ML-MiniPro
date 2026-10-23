// Stand-in for the backend used ONLY by tests. Values here are test data, not project results.
import { vi } from "vitest";

export const SCHEMA = {
  properties: {
    person_age: { title: "Age (years)", type: "integer", minimum: 20, maximum: 100 },
    person_gender: { title: "Gender", enum: ["female", "male"] },
    loan_intent: { title: "Loan purpose", enum: ["EDUCATION", "HOMEIMPROVEMENT"] },
  },
};

export const SUMMARY = {
  rows_raw: 1000, rows_after_cleaning: 990, removed: { duplicate_rows: 4, implausible_age_rows: 6 },
  columns: 14, target_column: "loan_status", target_counts: { 0: 770, 1: 220 },
  positive_class_share: 220 / 990,
  numeric_features: ["person_age"], categorical_features: ["person_gender"],
};

const model = (f1) => ({
  cv_f1: f1, test_metrics: { accuracy: 0.9, precision: 0.8, recall: 0.65, f1: f1 + 0.01, roc_auc: 0.95,
    confusion_matrix: { tn: 700, fp: 30, fn: 40, tp: 130 } },
  top_features: [{ feature: "numeric__loan_int_rate", importance: 0.3 }],
});

export const RESULTS = {
  best_model: "Model B", split: { test_rows: 900 },
  models: { "Model A": model(0.7), "Model B": model(0.8) },
};

export const PREDICTION = {
  predicted_class: 1, predicted_label: "approved", approval_score: 0.8, model_name: "Model B",
  disclaimer: "Classroom demonstration only.",
};

const json = (body, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

/** Installs a fake fetch. `predictResponse` can be overridden per test. */
export function installFetch({ predictResponse = () => json(PREDICTION) } = {}) {
  const calls = [];
  const fake = vi.fn((url, options) => {
    calls.push({ url, options });
    if (url.endsWith("/api/dataset-summary")) return json(SUMMARY);
    if (url.endsWith("/api/model-results")) return json(RESULTS);
    if (url.endsWith("/api/input-schema")) return json(SCHEMA);
    if (url.endsWith("/api/predict")) return predictResponse();
    return json({ detail: "not found" }, 404);
  });
  vi.stubGlobal("fetch", fake);
  return { calls, json };
}
