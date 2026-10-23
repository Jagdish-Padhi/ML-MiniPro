# Loan Approval Prediction System

An end-to-end Machine Learning system and enterprise benchmarking console for credit approval decisioning. Evaluates and benchmarks traditional tree ensemble algorithms (**Random Forest**, **Gradient Boosting**, **XGBoost**, and **LightGBM**) using the empirical methodology of [Zhang et al. (2025)](https://www.mdpi.com/2079-8954/13/7/581) adapted for loan approval classification.

---

## Key Highlights & Real Project Facts

- **Prediction Target:** Predicts `loan_status` from borrower and loan parameters, where **`1` = Approved** and **`0` = Rejected** (conforming to the Kaggle dataset data dictionary, distinguishing it from default prediction).
- **Data Source:** [Kaggle Loan Approval Classification Data](https://www.kaggle.com/datasets/taweilo/loan-approval-classification-data) (TaweiLo).
- **Data Quality Audit:** 45,000 raw instances ingested &rarr; 7 implausible age/sanity records filtered &rarr; **44,993 validated records**.
- **Class Distribution:** Moderate class imbalance with **22.2% Approved** (10,000) vs. **77.8% Rejected** (34,993).
- **Leakage Prevention:** All scalers, imputers, encoders, and feature selectors are fitted *strictly* on the 80% stratified training partition via `scikit-learn` Pipelines.
- **Selection Criterion:** Champion model selected strictly via **Cross-Validated F1 Score** on training data, penalizing both false approvals (lending risk) and false rejections (lost revenue).
- **Frontend Console:** High-contrast, monochromatic single-screen workstation (React 19 + Vite) featuring Lucide icons, hover-activated methodology guides `(i)`, real-time inference, and an in-depth system architecture modal.

---

## System Architecture & Layout

```
ML-MiniPro/
├── backend/                  # FastAPI application & ML pipeline
│   ├── app/
│   │   ├── api/              # REST routes, request/response Pydantic schemas
│   │   ├── data/             # Ingestion audit and loader logic
│   │   └── ml/               # Training, grid tuning, evaluation & inference engine
│   ├── tests/                # Pytest unit & integration test suite
│   ├── requirements.txt      # Python dependencies
│   └── venv/                 # Virtual environment
├── frontend/                 # React 19 + Vite enterprise console
│   ├── src/
│   │   ├── components/       # PredictForm, ResultsPanel, DatasetPanel, SystemGuideModal
│   │   ├── hooks/            # Custom API data hooks
│   │   ├── styles.css        # Monochromatic B&W design system
│   │   └── App.jsx           # Main workstation layout & view switching
│   └── package.json          # Node dependencies & Vitest config
├── data/
│   ├── loan_data.csv         # Kaggle dataset (required for audit & training)
│   └── README.md             # Dataset instructions
├── artifacts/                # Generated audit summary, trained models & benchmark results
│   ├── dataset_summary.json  # Output from python -m app.data.audit
│   ├── model_results.json    # Benchmark metrics for all 4 models
│   └── models/               # Serialized champion model (.joblib)
└── docs/
    └── paper_alignment.md    # Methodology alignment & adaptations vs. Zhang et al. (2025)
```

---

## Quickstart: Running Locally

### Prerequisites
- **Python 3.12+**
- **Node.js 20+** and **npm**

---

### Step 1: Place the Dataset
1. Download `loan_data.csv` from [Kaggle Loan Approval Classification Data](https://www.kaggle.com/datasets/taweilo/loan-approval-classification-data).
2. Save the CSV at:
   ```bash
   data/loan_data.csv
   ```

---

### Step 2: Backend Setup & Training

Open a terminal in the project root:

```bash
cd backend

# 1. Activate the virtual environment
# On Linux / macOS / WSL:
source venv/bin/activate

# On Windows PowerShell:
# .\venv\Scripts\Activate.ps1

# (If creating a fresh virtual environment from scratch:)
# python -m venv venv && source venv/bin/activate
# pip install -r requirements.txt
```

#### Run Data Quality Audit
Analyzes the dataset, verifies sanity bounds, and creates `artifacts/dataset_summary.json`:
```bash
python -m app.data.audit
```

#### Train & Benchmark All 4 Ensemble Models
Trains Random Forest, Gradient Boosting, XGBoost, and LightGBM with stratified cross-validation, selects the best model by CV F1 score, and saves the trained pipeline:
```bash
python -m app.ml.train
```
*(Takes ~4–6 minutes depending on your CPU; outputs `artifacts/model_results.json` and `artifacts/models/best_model.joblib`)*.

#### Start the FastAPI Server
```bash
uvicorn app.api.main:app --port 8000 --reload
```
The REST API is now live at `http://localhost:8000` (Swagger documentation at `http://localhost:8000/docs`).

---

### Step 3: Frontend Console Setup

Open a **second terminal** in the project root:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite development workstation
npm run dev
```

Open your browser at:
```
http://localhost:5173
```

---

## Automated Test Suites

### Backend Unit & Integration Tests (pytest)
Runs preprocessing validation, schema bounds checking, model training pipelines, and API routes:
```bash
cd backend
source venv/bin/activate
python -m pytest -q
```

### Frontend Unit & Component Tests (vitest)
Validates form building, schema parsing, validation bounds, error alerts, and prediction state transitions:
```bash
cd frontend
npm test
```

### Full-Stack Live Integration Tests
Runs the React frontend against the actively running FastAPI backend and real trained model:
```bash
# Make sure uvicorn is running on port 8000 first, then:
cd frontend
LIVE_API=1 npm test
```

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & model load status |
| `GET` | `/api/input-schema` | Dynamic JSON schema for form bounds & allowed categorical enums |
| `GET` | `/api/dataset-summary` | Ingestion statistics, class shares, and data cleaning exclusions |
| `GET` | `/api/model-results` | Benchmark metrics (F1, Accuracy, Precision, Recall, ROC-AUC, Confusion Matrix) |
| `POST` | `/api/predict` | Computes loan approval classification for an applicant profile |

### Example Prediction Request (`POST /api/predict`)

```json
{
  "person_age": 30,
  "person_gender": "female",
  "person_education": "Bachelor",
  "person_income": 65000,
  "person_emp_exp": 6,
  "person_home_ownership": "RENT",
  "loan_amnt": 9000,
  "loan_intent": "EDUCATION",
  "loan_int_rate": 11.5,
  "cb_person_cred_hist_length": 5,
  "credit_score": 640,
  "previous_loan_defaults_on_file": "No"
}
```

### Example Prediction Response

```json
{
  "predicted_class": 1,
  "predicted_label": "approved",
  "approval_score": 0.842,
  "model_name": "LightGBM",
  "disclaimer": "Classroom demonstration of a machine learning model trained on a public dataset. It is not a real lending decision or financial advice."
}
```

---

## Machine Learning Methodology

1. **Class Imbalance Strategy:**
   Because only ~22.2% of loans are approved, raw Accuracy is a deceptive metric (a naive model predicting 100% rejection achieves 77.8% accuracy). We use cost-sensitive **balanced class weights** at fit time rather than synthetic SMOTE oversampling to keep cross-validation folds completely unbiased.
2. **Model Selection:**
   The champion model is picked strictly by **unweighted Cross-Validated F1** on training records. The test partition is evaluated exactly once after model selection to verify true generalization.
3. **Decision Cutoff:**
   Standard threshold rule:
   $$\hat{y} = \begin{cases} 1 \text{ (Approved)} & \text{if } P(\text{Approved}) \ge 0.50 \\ 0 \text{ (Rejected)} & \text{if } P(\text{Approved}) < 0.50 \end{cases}$$

---

## Troubleshooting Common Issues

- **`Command 'python' not found` or `ModuleNotFoundError: No module named 'joblib'`:**  
  The virtual environment is not activated in your current terminal. Run `source venv/bin/activate` from the `backend/` directory.
- **`Dataset problem: Dataset not found at 'loan_data.csv'`:**  
  Ensure `loan_data.csv` is placed in `data/loan_data.csv` relative to the repository root.
- **`Cannot reach the backend` alert in UI:**  
  Make sure the FastAPI backend is running via `uvicorn app.api.main:app --port 8000` in a separate terminal.

---

## References

- **Zhang et al. (2025):** *"Data-Driven Loan Default Prediction: A Machine Learning Approach for Enhancing Business Process Management"*, Systems 13(7), 581. [DOI: 10.3390/systems13070581](https://doi.org/10.3390/systems13070581)
- **Dataset:** [Kaggle Loan Approval Classification Data](https://www.kaggle.com/datasets/taweilo/loan-approval-classification-data) (TaweiLo).
