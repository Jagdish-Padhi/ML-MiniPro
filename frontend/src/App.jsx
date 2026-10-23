import { useEffect, useState } from "react";
import DatasetPanel from "./components/DatasetPanel";
import { BarChartIcon, ExternalLinkIcon, MoonIcon, SlidersIcon, SunIcon } from "./components/Icons";
import PredictForm from "./components/PredictForm";
import ResultsPanel from "./components/ResultsPanel";
import SystemGuideModal from "./components/SystemGuideModal";

const PAPER_URL = "https://www.mdpi.com/2079-8954/13/7/581";
const DATASET_URL = "https://www.kaggle.com/datasets/taweilo/loan-approval-classification-data";

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [activeTab, setActiveTab] = useState("predict");
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-container">
          <div className="header-left">
            <span className="app-tag">ML</span>
            <div className="header-branding">
              <h1>Loan Approval Prediction</h1>
              <p className="header-subtitle">
                Ensemble Benchmark ·{" "}
                <a href={PAPER_URL} target="_blank" rel="noopener noreferrer">
                  Zhang et al. (2025)
                </a>
              </p>
            </div>
          </div>

          <div className="header-center">
            <div className="tab-nav" role="tablist" aria-label="Workstation View">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "predict"}
                className={`tab-btn ${activeTab === "predict" ? "active" : ""}`}
                onClick={() => setActiveTab("predict")}
              >
                <SlidersIcon />
                <span>Inference</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "results"}
                className={`tab-btn ${activeTab === "results" ? "active" : ""}`}
                onClick={() => setActiveTab("results")}
              >
                <BarChartIcon />
                <span>Benchmarks</span>
              </button>
            </div>

            <nav aria-label="Sections" className="sr-nav">
              <a href="#results" onClick={() => setActiveTab("results")}>
                Model results
              </a>
              <a href="#predict" onClick={() => setActiveTab("predict")}>
                Predict
              </a>
            </nav>
          </div>

          <div className="header-right">
            <a
              href={DATASET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="header-link"
              title="Kaggle Dataset"
            >
              <span>Dataset</span>
              <ExternalLinkIcon />
            </a>
            <a
              href={PAPER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="header-link"
              title="MDPI Research Paper"
            >
              <span>Paper</span>
              <ExternalLinkIcon />
            </a>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
            <button
              type="button"
              className="navbar-info-btn"
              onClick={() => setShowGuideModal(true)}
              aria-label="System Architecture & Methodology Guide"
              title="System Architecture & Methodology Guide"
            >
              i
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Predict Section */}
        <section
          id="predict"
          className={`app-pane ${activeTab === "predict" ? "pane-visible" : "pane-hidden"}`}
        >
          <PredictForm />
        </section>

        {/* Results Section (Clean, no redundant header) */}
        <section
          id="results"
          className={`app-pane ${activeTab === "results" ? "pane-visible" : "pane-hidden"}`}
        >
          <DatasetPanel />
          <ResultsPanel />
        </section>
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <span>Academic demonstration only. Not a real lending decision or financial advice.</span>
          <span className="footer-meta">
            Zhang et al. (2025) · 5-Fold Cross-Validation F1 Criterion
          </span>
        </div>
      </footer>

      {/* In-depth System Architecture Modal */}
      <SystemGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}
