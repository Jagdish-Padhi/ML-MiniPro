import { useEffect } from "react";

export default function SystemGuideModal({ isOpen, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-tag">TECHNICAL ARCHITECTURE &amp; METHODOLOGY</span>
            <h2 className="modal-title">End-to-End System Architecture &amp; ML Workflow</h2>
            <p className="modal-subtitle">
              Based on the empirical methodology of Zhang et al. (2025) adapted for loan approval prediction.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Section 1 */}
          <section className="guide-step">
            <div className="step-badge">STAGE 01</div>
            <div className="step-content">
              <h3>Problem Formulation &amp; Prediction Target</h3>
              <p>
                This system automates and benchmarks commercial credit decisioning. While Zhang et al.
                (2025) use the term "default" in their academic paper, the underlying Kaggle dataset
                (TaweiLo) explicitly records <strong><code>loan_status = 1</code> as Approved</strong> and{" "}
                <strong><code>loan_status = 0</code> as Rejected</strong>. This project strictly adheres to
                the dataset's true data dictionary, framing the objective as a <strong>Loan Approval Classification</strong> task.
              </p>
              <div className="spec-callout">
                <strong>Target Column:</strong> <code>loan_status</code> (Binary: 1 = Approved, 0 = Rejected)
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="guide-step">
            <div className="step-badge">STAGE 02</div>
            <div className="step-content">
              <h3>Data Quality Ingestion &amp; Automated Audit</h3>
              <p>
                The ingestion pipeline processes 45,000 raw application rows. An automated audit
                (<code>app.data.audit</code>) verifies bounds, duplicates, and data sanity before any modeling:
              </p>
              <ul className="guide-list">
                <li>
                  <strong>Sanity Exclusions:</strong> Records with implausible ages (e.g. <code>person_age &gt; 100</code>)
                  or negative values are systematically dropped (7 rows removed, 44,993 validated rows retained).
                </li>
                <li>
                  <strong>Class Imbalance:</strong> The verified class distribution shows{" "}
                  <strong>22.2% Approved (10,000)</strong> vs. <strong>77.8% Rejected (34,993)</strong>.
                </li>
                <li>
                  <strong>Dimensionality:</strong> 12 input features covering borrower demographics,
                  employment history, loan characteristics, and credit bureau flags.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="guide-step">
            <div className="step-badge">STAGE 03</div>
            <div className="step-content">
              <h3>Pipeline Preprocessing &amp; Leakage Prevention</h3>
              <p>
                To prevent test-set data leakage, all preprocessing estimators are encapsulated inside a{" "}
                <code>scikit-learn.pipeline.Pipeline</code> fitted <em>strictly</em> on the training partition:
              </p>
              <ul className="guide-list">
                <li>
                  <strong>Stratified 80/20 Partition:</strong> 35,994 training instances and 8,999 test
                  holdout instances, maintaining the exact 22.2% positive class ratio in both splits.
                </li>
                <li>
                  <strong>Numeric Pipeline:</strong> Median imputation followed by <code>StandardScaler</code>{" "}
                  to normalize feature variances.
                </li>
                <li>
                  <strong>Categorical Pipeline:</strong> <code>OneHotEncoder(handle_unknown="ignore")</code>{" "}
                  applied to gender, education, home ownership, intent, and previous default history.
                </li>
                <li>
                  <strong>Engineered Features:</strong> Integration of debt-to-income (<code>loan_percent_income</code>)
                  and career stability indicators.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="guide-step">
            <div className="step-badge">STAGE 04</div>
            <div className="step-content">
              <h3>Ensemble Algorithm Zoo &amp; Imbalance Mitigation</h3>
              <p>
                Four state-of-the-art tree ensemble algorithms are trained and compared under identical conditions:
              </p>
              <div className="algo-grid">
                <div className="algo-card">
                  <h4>Random Forest</h4>
                  <p>Bagging ensemble of decorrelated deep decision trees; reduces variance across random feature subspaces.</p>
                </div>
                <div className="algo-card">
                  <h4>Gradient Boosting</h4>
                  <p>Sequential boosting minimizing pseudo-residuals along the negative gradient of the binomial deviance loss.</p>
                </div>
                <div className="algo-card">
                  <h4>XGBoost</h4>
                  <p>Regularized gradient boosting employing second-order Taylor expansion loss and optimal tree pruning.</p>
                </div>
                <div className="algo-card">
                  <h4>LightGBM</h4>
                  <p>Histogram-based gradient boosting with leaf-wise tree growth, maximizing split gain efficiency.</p>
                </div>
              </div>
              <p className="sub-p">
                <strong>Class Weighting:</strong> To handle the 22.2% minority class without generating synthetic
                SMOTE samples inside cross-validation folds, cost-sensitive balanced class weights (<code>class_weight="balanced"</code>)
                are integrated into tree split criteria.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="guide-step">
            <div className="step-badge">STAGE 05</div>
            <div className="step-content">
              <h3>Model Selection: Why F1 Score Over Accuracy</h3>
              <p>
                Due to the 78% rejection class majority, an uninformative model predicting rejection on every loan
                would trivially report a 78% Accuracy while providing zero utility to the institution.
              </p>
              <div className="formula-box">
                <code>Precision = TP / (TP + FP)</code> &nbsp;|&nbsp; <code>Recall = TP / (TP + FN)</code>
                <br />
                <strong>F1 Score = 2 &times; (Precision &times; Recall) / (Precision + Recall)</strong>
              </div>
              <p>
                The primary selection metric is <strong>5-Fold Cross-Validated F1</strong> computed on the training partition.
                The holdout test set is never used to select models, guaranteeing honest generalization diagnostics.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="guide-step">
            <div className="step-badge">STAGE 06</div>
            <div className="step-content">
              <h3>Confusion Matrix &amp; Risk Diagnostics</h3>
              <p>
                The selected champion model is evaluated against the 8,999 unseen holdout test samples:
              </p>
              <div className="matrix-explainer">
                <div className="matrix-item">
                  <strong>True Negatives (TN):</strong> Correctly identified rejections; prevents capital default.
                </div>
                <div className="matrix-item">
                  <strong>False Positives (FP):</strong> Disapproved applicants incorrectly approved; direct credit loss risk.
                </div>
                <div className="matrix-item">
                  <strong>False Negatives (FN):</strong> Qualified applicants rejected; represents lost loan revenue.
                </div>
                <div className="matrix-item">
                  <strong>True Positives (TP):</strong> Correctly approved creditworthy borrowers; generates profitable interest yield.
                </div>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="guide-step">
            <div className="step-badge">STAGE 07</div>
            <div className="step-content">
              <h3>Real-Time Inference &amp; Decision Protocol</h3>
              <p>
                When a user submits borrower parameters in the Inference Console:
              </p>
              <ol className="flow-steps">
                <li>Client validates types and boundaries (e.g. credit score 300–850).</li>
                <li>FastAPI endpoint (<code>POST /api/predict</code>) executes strict Pydantic validation.</li>
                <li>The pre-fitted preprocessing pipeline scales inputs and transforms categoricals.</li>
                <li>The saved champion ensemble model (<code>.joblib</code>) outputs raw approval probability score.</li>
                <li>
                  <strong>Decision Rule:</strong> If <code>approval_score &ge; 0.50</code> &rarr; <strong>Approved</strong>. Otherwise &rarr; <strong>Rejected</strong>.
                </li>
              </ol>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <span>Machine Learning Mini Project · Traditional Machine Learning Approach</span>
          <button type="button" className="primary-btn btn-sm" onClick={onClose}>
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
}
