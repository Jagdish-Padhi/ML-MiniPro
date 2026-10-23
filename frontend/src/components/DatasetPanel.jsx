import { getDatasetSummary } from "../api";
import { count, percent } from "../format";
import { useApiData } from "../hooks/useApiData";
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
    <div>
      <dl className="facts">
        <div>
          <dt>Records used</dt>
          <dd>{count(total)}</dd>
        </div>
        <div>
          <dt>Removed during cleaning</dt>
          <dd>
            {count(removed)} of {count(data.rows_raw)}
          </dd>
        </div>
        <div>
          <dt>Input features</dt>
          <dd>{data.columns - 1}</dd>
        </div>
        <div>
          <dt>Target column</dt>
          <dd>{data.target_column}</dd>
        </div>
      </dl>

      <h3>Target classes</h3>
      <div className="share-bar" aria-hidden="true">
        <span style={{ width: percent(data.positive_class_share) }} />
      </div>
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

      <h3>Features</h3>
      <p>
        <strong>Numeric:</strong> {data.numeric_features.join(", ")}
      </p>
      <p>
        <strong>Categorical:</strong> {data.categorical_features.join(", ")}
      </p>
    </div>
  );
}
