import { getModelResults } from "../api";
import { count, metric } from "../format";
import { useApiData } from "../hooks/useApiData";
import InfoGuide from "./InfoGuide";
import { ErrorNotice, Loading } from "./Status";

const COLUMNS = [
  ["accuracy", "Accuracy"],
  ["precision", "Precision"],
  ["recall", "Recall"],
  ["f1", "F1"],
  ["roc_auc", "ROC-AUC"],
];

export default function ResultsPanel() {
  const { data, error, loading } = useApiData(getModelResults);

  if (loading) return <Loading what="model results" />;
  if (error) return <ErrorNotice error={error} />;

  const best = data.best_model;
  const bestResult = data.models[best];
  const matrix = bestResult.test_metrics.confusion_matrix;

  return (
    <div className="results-panel-layout">
      <div className="benchmark-columns">
        <div className="benchmark-col-left">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>
                    <span>Model</span>
                    <InfoGuide title="Algorithms Evaluated">
                      <p>Compares four ensemble models: Random Forest, Gradient Boosting, XGBoost, and LightGBM per Zhang et al. (2025).</p>
                    </InfoGuide>
                  </th>
                  <th className="num">
                    <span>CV F1</span>
                    <InfoGuide title="5-Fold Cross-Validation F1">
                      <p>Primary selection criterion. 5-fold cross-validation balances precision and recall while preventing train-set overfitting.</p>
                    </InfoGuide>
                  </th>
                  {COLUMNS.map(([, label]) => (
                    <th key={label} className="num">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.models).map(([name, result]) => {
                  const isBest = name === best;
                  return (
                    <tr key={name} className={isBest ? "selected" : undefined}>
                      <td>
                        {isBest ? `${name} (selected)` : name}
                      </td>
                      <td className="num">{metric(result.cv_f1)}</td>
                      {COLUMNS.map(([key]) => (
                        <td key={key} className="num">
                          {metric(result.test_metrics[key])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="benchmark-col-right">
          <h3>
            <span>{best}: confusion matrix on test set</span>
            <InfoGuide title="Confusion Matrix Guide">
              <p>TN: Correctly rejected. FP: Incorrectly approved (risk). FN: Incorrectly rejected (missed loans). TP: Correctly approved.</p>
            </InfoGuide>
          </h3>
          <table className="matrix">
            <thead>
              <tr>
                <th />
                <th className="num">Predicted rejected</th>
                <th className="num">Predicted approved</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Actually rejected</th>
                <td className="num">{count(matrix.tn)}</td>
                <td className="num">{count(matrix.fp)}</td>
              </tr>
              <tr>
                <th>Actually approved</th>
                <td className="num">{count(matrix.fn)}</td>
                <td className="num">{count(matrix.tp)}</td>
              </tr>
            </tbody>
          </table>

          <h3>
            <span>Top feature importances</span>
            <InfoGuide title="Feature Importance">
              <p>Relative importance measured by Gini split frequency. Shows empirical association with loan approval, not economic causality.</p>
            </InfoGuide>
          </h3>
          <ol className="plain-list">
            {bestResult.top_features.slice(0, 5).map(({ feature, importance }) => {
              const cleanName = feature.replace(/^(numeric|categorical)__/, "");
              const pct = (importance * 100).toFixed(1);
              return (
                <li key={feature}>
                  <span>{cleanName} ({pct}%)</span>
                  <div className="feature-bar-wrap" aria-hidden="true">
                    <div className="feature-bar">
                      <div
                        className="feature-bar-fill"
                        style={{ width: `${Math.min(100, Math.max(0, importance * 100))}%` }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}