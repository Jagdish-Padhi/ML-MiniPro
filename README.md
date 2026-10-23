# Loan Approval Prediction Using Traditional Machine Learning

College mini project. Predicts whether a loan application is approved from borrower and loan
details by comparing Random Forest, Gradient Boosting, XGBoost and LightGBM, following the
methodology of Zhang et al. (2025). `docs/paper_alignment.md` lists what matches the paper and
what was adapted.

**Prediction target:** the Kaggle dataset defines `loan_status` as 1 = approved, 0 = rejected.
This is loan *approval* prediction, not default prediction, even though the paper uses the word
"default" for the same column.

## Project layout

```
backend/   FastAPI app, data loading, preprocessing, training, evaluation, tests
frontend/  React + Vite interface, tests
data/      put loan_data.csv here (not committed, see data/README.md)
artifacts/ generated: dataset_summary.json, model_results.json, models/*.joblib
docs/      paper_alignment.md
plan.md    the phase-wise implementation plan
```

## Run it

**1. Backend** (Python 3.12)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Place the dataset at `data/loan_data.csv` (see `data/README.md`), then:

```bash
python -m app.data.audit        # dataset facts -> artifacts/dataset_summary.json
python -m app.ml.train          # trains 4 models (~6 min on one CPU core) -> artifacts/
uvicorn app.api.main:app --port 8000
```

The zip you received includes a pre-trained model and results in `artifacts/`, so you can start the
API straight away and retrain only if you want to. Git ignores `artifacts/` (see `.gitignore`), so a
fresh clone needs the audit and training commands above first.

**2. Frontend** (Node 20+), in a second terminal

```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

The backend address defaults to `http://localhost:8000`; copy `.env.example` to `.env` to change it.

## Tests

```bash
cd backend && python -m pytest -q                # data, preprocessing, training, API
cd frontend && npm test                          # form, validation, error states
cd frontend && LIVE_API=1 npm test               # also runs the UI against the running backend
```

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | status and whether a model is loaded |
| `GET /api/input-schema` | form fields, allowed values and bounds (the form is built from this) |
| `GET /api/dataset-summary` | dataset audit |
| `GET /api/model-results` | metrics for all four models |
| `POST /api/predict` | predicted class and model score for one application |

## Method in short

1. Clean: drop duplicates and ages above 100 (the source data contains ages up to 144).
2. Stratified 80/20 split with a fixed seed. All fitting uses the training split only.
3. Pipeline: median/most-frequent imputation, one-hot encoding, age-to-experience feature, RFECV feature selection.
4. Balanced class weights because only 22% of records are approved.
5. Grid search per model with cross-validated F1; the best model is chosen on that, never on test scores.
6. Every model is scored once on the untouched test split.

## Limitations

- The dataset is public and likely synthetic. Scores show how well the models reproduce its approval labels, not how real lenders decide.
- The model score is the model's raw output, not a calibrated probability.
- Gender is a model input because it is a dataset column; a real system would need a fairness review.
- Cross-validation is 3-fold instead of the paper's 5, and grids are small, to keep training fast.
