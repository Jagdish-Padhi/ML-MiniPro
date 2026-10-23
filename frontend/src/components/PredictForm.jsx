import { useMemo, useState } from "react";
import { getInputSchema, predict } from "../api";
import { EXAMPLE_BORROWER } from "../exampleBorrower";
import { buildFields, toRequestBody, validateValues } from "../formFields";
import { optionLabel } from "../format";
import { useApiData } from "../hooks/useApiData";
import { SlidersIcon } from "./Icons";
import InfoGuide from "./InfoGuide";
import PredictionResult from "./PredictionResult";
import { ErrorNotice, Loading } from "./Status";

export default function PredictForm() {
  const { data: schema, error: schemaError, loading } = useApiData(getInputSchema);
  const fields = useMemo(() => (schema ? buildFields(schema) : []), [schema]);

  const [values, setValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Loading what="form" />;
  if (schemaError) return <ErrorNotice error={schemaError} />;

  const setValue = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  const reset = () => {
    setValues({});
    setFieldErrors({});
    setFormError(null);
    setResult(null);
  };

  const showBackendErrors = (error) => {
    const byField = {};
    let general = null;
    for (const { field, message } of error.fieldErrors) {
      if (fields.some((f) => f.name === field)) byField[field] = message;
      else general = message;
    }
    setFieldErrors(byField);
    setFormError(general ?? (Object.keys(byField).length ? null : error.message));
  };

  const submit = async (event) => {
    event.preventDefault();
    setResult(null);
    setFormError(null);
    const problems = validateValues(fields, values);
    setFieldErrors(problems);
    if (Object.keys(problems).length) return;

    setSubmitting(true);
    try {
      setResult(await predict(toRequestBody(fields, values)));
    } catch (error) {
      showBackendErrors(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="inference-workspace">
      <div className="inference-form-col">
        <form onSubmit={submit} noValidate>
          <div className="form-head">
            <div className="form-head-title">
              <span>Borrower Application Parameters</span>
              <InfoGuide title="Feature Space Boundaries">
                <p>
                  Inputs are validated against dataset boundaries to prevent out-of-distribution
                  inference errors. Categorical options reflect standardized credit bureau categories.
                </p>
              </InfoGuide>
            </div>
            <div className="form-head-actions">
              <button
                type="button"
                className="secondary btn-sm"
                onClick={() => setValues(EXAMPLE_BORROWER)}
              >
                Fill example values
              </button>
              <button type="button" className="secondary btn-sm" onClick={reset}>
                Clear
              </button>
            </div>
          </div>

          <div className="form-grid">
            {fields.map((field) => (
              <div className="field" key={field.name}>
                <div className="field-label-row">
                  <label htmlFor={field.name}>{field.label}</label>
                  {field.kind === "number" && (
                    <span className="hint">
                      {field.min} to {field.max}
                    </span>
                  )}
                </div>
                {field.kind === "select" ? (
                  <select
                    id={field.name}
                    value={values[field.name] ?? ""}
                    onChange={(e) => setValue(field.name, e.target.value)}
                    aria-invalid={Boolean(fieldErrors[field.name])}
                  >
                    <option value="">Select…</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {optionLabel(option)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    type="number"
                    inputMode="decimal"
                    step={field.integer ? 1 : "any"}
                    min={field.min}
                    max={field.max}
                    value={values[field.name] ?? ""}
                    onChange={(e) => setValue(field.name, e.target.value)}
                    aria-invalid={Boolean(fieldErrors[field.name])}
                  />
                )}
                {fieldErrors[field.name] && (
                  <span className="field-error" role="alert">
                    {fieldErrors[field.name]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {formError && (
            <p className="notice error" role="alert">
              {formError}
            </p>
          )}

          <div className="actions">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Predicting…" : "Predict"}
            </button>
          </div>
        </form>
      </div>

      <div className="inference-result-col">
        {result ? (
          <PredictionResult result={result} />
        ) : (
          <div className="result-placeholder">
            <div className="placeholder-header">
              <div className="placeholder-icon" aria-hidden="true">
                <SlidersIcon />
              </div>
              <h4>Inference Output</h4>
            </div>
            <p className="placeholder-desc">
              Configure borrower parameters on the left or click <strong>Fill example values</strong>, then submit to generate an approval prediction.
            </p>
            <div className="standby-card-specs">
              <div className="spec-row">
                <span className="spec-name">Ensemble Model</span>
                <span className="spec-val">LightGBM (Zhang et al. 2025)</span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Evaluation Metric</span>
                <span className="spec-val">5-Fold Cross-Validation F1</span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Decision Rule</span>
                <span className="spec-val">Score &ge; 0.50 &rarr; Approved</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}