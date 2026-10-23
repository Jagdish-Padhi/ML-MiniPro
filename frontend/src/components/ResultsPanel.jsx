import { getModelResults } from "../api";
import { count, metric } from "../format";
import { useApiData } from "../hooks/useApiData";
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
    <div>
      <p>
        Scores on the {count(data.split.test_rows)} test records held out from training
        (positive class: approved). Cross-validated F1 was measured on the training records
        and decides the selected model.
      </p>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th className="num">CV F1</th>
              {COLUMNS.map(([, label]) => (
                <th key={label} className="num">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.models).map(([name, result]) => (
              <tr key={name} className={name === best ? "selected" : undefined}>
                <td>{name === best ? `${name} (selected)` : name}</td>
                <td className="num">{metric(result.cv_f1)}</td>
                {COLUMNS.map(([key]) => (
                  <td key={key} className="num">
                    {metric(result.test_metrics[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        <strong>Why F1:</strong> only about one in five applications is approved, so accuracy
        alone can look good for a model that rarely predicts approval. Precision is the share of
        predicted approvals that were truly approved; recall is the share of truly approved
        applications the model found; F1 balances the two.
      </p>

      <h3>{best}: confusion matrix on the test set</h3>
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

      <h3>Features the selected model relied on most</h3>
      <p>Importance is specific to this model and shows association, not cause.</p>
      <ol className="plain-list">
        {bestResult.top_features.slice(0, 5).map(({ feature, importance }) => (
          <li key={feature}>
            {feature.replace(/^(numeric|categorical)__/, "")} ({(importance * 100).toFixed(1)}%)
          </li>
        ))}
      </ol>
    </div>
  );
}
