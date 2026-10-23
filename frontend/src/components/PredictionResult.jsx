import { percent } from "../format";
import { CheckCircleIcon, XCircleIcon } from "./Icons";

export default function PredictionResult({ result }) {
  const isApproved = result.predicted_class === 1 || result.predicted_label === "approved";
  const scorePct = percent(result.approval_score);

  return (
    <div
      className={`result ${isApproved ? "result-approved" : "result-rejected"}`}
      aria-live="polite"
    >
      <div className="result-header">
        <div className="result-title-row">
          <span className={`verdict-icon ${isApproved ? "icon-approved" : "icon-rejected"}`}>
            {isApproved ? <CheckCircleIcon /> : <XCircleIcon />}
          </span>
          <p className="result-label">
            Predicted outcome: <strong>{result.predicted_label}</strong>
          </p>
        </div>
        <span className={`result-tag ${isApproved ? "tag-approved" : "tag-rejected"}`}>
          {isApproved ? "APPROVED · CLASS 1" : "REJECTED · CLASS 0"}
        </span>
      </div>

      <div className="verdict-highlight-card">
        <div className="verdict-score-row">
          <div className="score-block">
            <span className="score-sub">Approval Confidence Score</span>
            <span className="score-num">{scorePct}</span>
          </div>
          <div className="score-meta-block">
            <div className="meta-row">
              <span className="meta-label">Selected Model:</span>
              <span className="meta-val">{result.model_name}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Decision Cutoff:</span>
              <span className="meta-val">&ge; 0.50 (50.0%)</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Classification:</span>
              <span className={`meta-status ${isApproved ? "status-pass" : "status-fail"}`}>
                {isApproved ? "Meets Approval Threshold" : "Below Approval Threshold"}
              </span>
            </div>
          </div>
        </div>

        <div className="result-score-meter" aria-hidden="true">
          <div className="result-score-bar">
            <div
              className={`result-score-fill ${isApproved ? "fill-approved" : "fill-rejected"}`}
              style={{ width: scorePct }}
            />
          </div>
          <div className="result-score-markers">
            <span>0.00</span>
            <span className="marker-threshold">Threshold: 0.50</span>
            <span>1.00</span>
          </div>
        </div>
      </div>

      <div className="result-summary-grid">
        <div className="summary-item">
          <span className="summary-label">Target Class</span>
          <span className="summary-value">{result.predicted_class}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Algorithm</span>
          <span className="summary-value">{result.model_name}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Threshold</span>
          <span className="summary-value">&ge; 50%</span>
        </div>
      </div>

      <p className="result-detail">
        Model score for approval: {scorePct}. This is the {result.model_name}{" "}
        model's raw output; it is not a calibrated probability.
      </p>

      <p className="muted result-disclaimer">{result.disclaimer}</p>
    </div>
  );
}