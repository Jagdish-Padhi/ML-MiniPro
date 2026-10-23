import { useMemo, useState } from "react";
import { getInputSchema, predict } from "../api";
import { EXAMPLE_BORROWER } from "../exampleBorrower";
import { buildFields, toRequestBody, validateValues } from "../formFields";
import { optionLabel } from "../format";
import { useApiData } from "../hooks/useApiData";
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
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        {fields.map((field) => (
          <div className="field" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
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
            {field.kind === "number" && (
              <span className="hint">
                {field.min} to {field.max}
              </span>
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
        <button type="submit" disabled={submitting}>
          {submitting ? "Predicting…" : "Predict"}
        </button>
        <button type="button" className="secondary" onClick={() => setValues(EXAMPLE_BORROWER)}>
          Fill example values
        </button>
        <button type="button" className="secondary" onClick={reset}>
          Clear
        </button>
      </div>

      {result && <PredictionResult result={result} />}
    </form>
  );
}
