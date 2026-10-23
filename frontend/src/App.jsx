import DatasetPanel from "./components/DatasetPanel";
import PredictForm from "./components/PredictForm";
import ResultsPanel from "./components/ResultsPanel";

const PAPER_URL = "https://www.mdpi.com/2079-8954/13/7/581";
const DATASET_URL = "https://www.kaggle.com/datasets/taweilo/loan-approval-classification-data";

export default function App() {
  return (
    <>
      <header className="site-header">
        <div className="container">
          <h1>Loan Approval Prediction Using Traditional Machine Learning</h1>
          <p>
            Compares Random Forest, Gradient Boosting, XGBoost and LightGBM on whether a loan
            application is approved, following the method of{" "}
            <a href={PAPER_URL}>Zhang et al. (2025)</a>.
          </p>
          <nav aria-label="Sections">
            <a href="#results">Model results</a>
            <a href="#predict">Predict</a>
          </nav>
        </div>
      </header>

      <main className="container">
        <section id="results">
          <h2>Dataset and model results</h2>
          <p>
            Data source: <a href={DATASET_URL}>Loan Approval Classification Data</a> (Kaggle). The
            target records whether the loan was approved, not whether the borrower later defaulted.
          </p>
          <DatasetPanel />
          <h3>Model comparison</h3>
          <ResultsPanel />
        </section>

        <section id="predict">
          <h2>Predict loan approval</h2>
          <p>Enter a borrower profile. The backend applies the saved model and returns its prediction.</p>
          <PredictForm />
        </section>
      </main>

      <footer className="container">
        <p>Academic demonstration only. Not a real lending decision or financial advice.</p>
      </footer>
    </>
  );
}
