import { percent } from "../format";

export default function PredictionResult({ result }) {
  return (
    <div className="result" aria-live="polite">
      <p className="result-label">
        Predicted outcome: <strong>{result.predicted_label}</strong>
      </p>
      <p>
        Model score for approval: {percent(result.approval_score)}. This is the {result.model_name}{" "}
        model's raw output; it is not a calibrated probability.
      </p>
      <p className="muted">{result.disclaimer}</p>
    </div>
  );
}
