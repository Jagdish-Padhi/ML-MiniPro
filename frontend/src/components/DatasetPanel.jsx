import { getDatasetSummary } from "../api";
import { count, percent } from "../format";
import { useApiData } from "../hooks/useApiData";
import InfoGuide from "./InfoGuide";
import { ErrorNotice, Loading } from "./Status";

export default function DatasetPanel() {
  const { data, error, loading } = useApiData(getDatasetSummary);

  if (loading) return <Loading what="dataset summary" />;
  if (error) return <ErrorNotice error={error} />;

  const total = data.rows_after_cleaning;
  const removed = Object.values(data.removed).reduce((sum, n) => sum + n, 0);
  const classes = [
    { key: "1", label: "Approved (1)" },
    { key: "0", label: "Rejected (0)" },
  ];

  return (
    <div className="dataset-panel-layout">
      <dl className="facts">
        <div className="fact-card">
          <dt>
            <span>Records used</span>
            <InfoGuide title="Cleaned Sample Size">
              <p>Total validated rows remaining after filtering duplicates and implausible records (e.g. age &gt; 100).</p>
            </InfoGuide>
          </dt>
          <dd>{count(total)}</dd>
        </div>
        <div className="fact-card">
          <dt>
            <span>Removed during cleaning</span>
            <InfoGuide title="Data Quality Audit">
              <p>Records filtered out during initial ingestion audit to avoid skewing model gradients.</p>
            </InfoGuide>
          </dt>
          <dd>
            {count(removed)} of {count(data.rows_raw)}
          </dd>
        </div>
        <div className="fact-card">
          <dt>
            <span>Input features</span>
            <InfoGuide title="Input Dimensions">
              <p>12 borrower attributes covering demographic, employment, loan intent, and credit history indicators.</p>
            </InfoGuide>
          </dt>
          <dd>{data.columns - 1}</dd>
        </div>
        <div className="fact-card">
          <dt>
            <span>Target column</span>
            <InfoGuide title="Prediction Target">
              <p>Historical approval decision (1 = approved, 0 = rejected) from Kaggle loan records.</p>
            </InfoGuide>
          </dt>
          <dd>{data.target_column}</dd>
        </div>
      </dl>

      <div className="dataset-columns">
        <div className="dataset-col">
          <h3>
            <span>Target classes</span>
            <InfoGuide title="Class Imbalance Reasoning">
              <p>Approximately 22% of applications are approved, while 78% are rejected. Because of this distribution, raw Accuracy is insufficient; F1-score balances precision and recall.</p>
            </InfoGuide>
          </h3>
          <div className="share-bar" aria-hidden="true">
            <span style={{ width: percent(data.positive_class_share) }} />
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th className="num">Records</th>
                  <th className="num">Share</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(({ key, label }) => (
                  <tr key={key}>
                    <td>{label}</td>
                    <td className="num">{count(data.target_counts[key])}</td>
                    <td className="num">{percent(data.target_counts[key] / total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dataset-col">
          <h3>
            <span>Features</span>
            <InfoGuide title="Feature Schema">
              <p>Numeric features are scaled and categorical features are one-hot encoded during preprocessing.</p>
            </InfoGuide>
          </h3>
          <div className="feature-box">
            <p>
              <strong>Numeric ({data.numeric_features.length}):</strong>{" "}
              {data.numeric_features.join(", ")}
            </p>
            <p>
              <strong>Categorical ({data.categorical_features.length}):</strong>{" "}
              {data.categorical_features.join(", ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
