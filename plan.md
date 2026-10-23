# Loan Default Prediction — Mini Project Build Plan

## 1. Final project decision

**Project title:** Loan Default Prediction Using Traditional Machine Learning

**One-line idea:** Given historical borrower and loan details, predict whether a loan is likely to default. The application demonstrates the prediction and provides a small model-evaluation view based on a held-out test set.

**This is a supervised binary-classification project.** Use only traditional machine-learning methods on tabular data. Do not add NLP, deep learning, LLMs, chatbots, generative AI, external AI APIs, or unnecessary features.

### Research paper selected

Zhang, X. et al. (2025), **“Data-Driven Loan Default Prediction: A Machine Learning Approach for Enhancing Business Process Management,”** *Systems*, 13(7), 581.

Paper: https://www.mdpi.com/2079-8954/13/7/581  
DOI: https://doi.org/10.3390/systems13070581

The paper describes a synthetic loan-risk dataset inspired by the Kaggle dataset below. It reports an 80/20 stratified train-test split and evaluates four traditional tabular ML boosting/tree models: XGBoost, Random Forest, LightGBM, and Gradient Boosting. It also discusses preprocessing, feature selection, class imbalance, and classification metrics.

### Dataset

Use the paper-linked source dataset as the starting point:

**Loan Approval Classification Data**  
https://www.kaggle.com/datasets/taweilo/loan-approval-classification-data

The paper says its own dataset is a synthetic version inspired by this source and augmented using SMOTENC. Do not claim that the raw Kaggle file is byte-for-byte the paper's exact dataset. In the report and PPT, clearly state which exact file/version was used, its source, record count, feature count, and target column after inspecting it.

**Target:** use the dataset's actual default/loan-status target column. Inspect the CSV first and confirm the positive class from the data dictionary and paper. Do not silently assume that “loan approved” and “loan defaulted” mean the same thing; they are different prediction tasks. The project must predict **default**, not merely approval. If the chosen file's target is approval rather than default, explain the limitation and either obtain the paper-compatible default target/data or stop and ask the student before switching the project to loan approval prediction.

### Alignment honesty

Aim for close methodological alignment with the paper, but never claim “90% aligned” as a measured fact unless a written checklist verifies it. Record a paper-to-implementation mapping in `docs/paper_alignment.md`. Distinguish:
- **Implemented as described**
- **Adapted for student-project simplicity**
- **Not implemented**

Do not copy the paper's reported scores into our results. All displayed metrics must come from our own run. The paper reports Gradient Boosting as strong on accuracy/recall/F1 and XGBoost as strong on ROC-AUC, but our results may differ.

---

## 2. Scope and non-goals

### Must have
1. A clean, small React UI with only the screens that are useful.
2. A Python backend containing all data processing, training, evaluation, and prediction logic.
3. A dataset information section showing the actual loaded dataset's shape, target distribution, and feature list.
4. A reproducible training pipeline using an 80/20 stratified split.
5. Four paper-aligned traditional ML models:
   - Random Forest
   - Gradient Boosting
   - XGBoost
   - LightGBM
6. Evaluation with confusion matrix, precision, recall, F1-score, accuracy, and ROC-AUC where valid.
7. A prediction form with sensible fields derived from the actual dataset features.
8. Clear labels explaining that the output is a model estimate for academic demonstration, not a real lending decision.
9. A presentation matching the college-provided PDF structure.
10. A README with exact setup and run instructions.

### Explicitly out of scope
- NLP, text embeddings, neural networks, deep learning, LLMs, generative AI, external AI services.
- Login/authentication, roles, admin dashboards, payments, databases, cloud deployment, or real lender integrations.
- Excessive animations, gradients, badges, icon decorations, charts without purpose, or many screens.
- Claiming a prediction is financial advice or using it to approve/deny real applicants.
- Fabricating results, data, citations, screenshots, team details, or paper claims.

### Keep the UI simple
Use a restrained layout, readable typography, plain backgrounds, modest borders, and consistent spacing. Avoid decorative gradients, excessive icons, badges, large hero sections, or marketing copy. The UI should look like a well-made student engineering project, not a generic AI-generated SaaS template.

---

## 3. Suggested technology stack

### Frontend
- React + Vite
- Plain CSS or a small, consistent styling approach
- Fetch API for backend requests
- Recharts only if a chart genuinely improves the model-results page; otherwise use simple tables

### Backend
- Python 3.11+
- FastAPI
- pandas, NumPy
- scikit-learn
- imbalanced-learn only if a documented, training-only imbalance method is used
- xgboost
- lightgbm
- joblib
- matplotlib/seaborn only for offline evaluation plots if needed

Use a `requirements.txt` with tested, compatible versions. If XGBoost or LightGBM cannot be installed in the target environment, explain the issue and ask before replacing a paper-aligned model. Do not silently omit a model.

---

## 4. Phase-wise implementation plan

Claude: work phase by phase. Before editing, inspect the existing repository and preserve useful code. Do not overwrite a working project blindly. After every phase, run relevant checks and report what changed, what passed, and what remains.

### Phase 0 — Inspect and verify the source material
1. Inspect the existing repository, if any: folders, dependencies, entry points, current behavior.
2. Read the selected research paper carefully, especially dataset, preprocessing, feature selection, model training, split strategy, and evaluation.
3. Download or obtain the dataset only through a legitimate user-accessible source. Do not scrape or bypass access restrictions.
4. Inspect column names, data types, missing values, target values, class distribution, and duplicates.
5. Confirm whether the dataset target actually represents **default**. If it represents loan approval instead, stop and explain the mismatch before implementing the wrong use case.
6. Record dataset source, access date, license/usage notes if available, exact filename, rows, columns, target column, and class mapping.
7. Create `docs/paper_alignment.md` with a concise paper-to-project mapping.

**Deliverable:** verified project specification and data audit. Do not start UI work until the target meaning is confirmed.

### Phase 1 — Set up a clean modular structure
Use a structure similar to this (adapt if the repository already has a sensible layout):

```text
loan-default-prediction/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── ...
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   └── routes.py
│   │   ├── data/
│   │   │   └── loader.py
│   │   ├── ml/
│   │   │   ├── preprocessing.py
│   │   │   ├── train.py
│   │   │   ├── evaluate.py
│   │   │   └── predict.py
│   │   ├── schemas.py
│   │   └── config.py
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
├── data/
│   └── README.md
├── artifacts/
│   └── .gitkeep
├── docs/
│   ├── paper_alignment.md
│   ├── dataset_notes.md
│   └── presentation_outline.md
├── plan.md
└── README.md
```

Do not commit a large dataset or trained binary model unless permitted and necessary. Include instructions explaining where the student should place the downloaded CSV. Never invent a dataset path or pretend the file is present if it is not.

### Phase 2 — Data loading and audit
1. Load the chosen CSV using a configurable path.
2. Validate required columns and the target.
3. Handle missing values using transformations fitted on training data only.
4. Separate numeric and categorical columns.
5. Use a scikit-learn `ColumnTransformer` and `Pipeline` where appropriate so preprocessing is reproducible and there is no train-test leakage.
6. Use one-hot encoding for categorical columns unless the paper's exact encoding must be reproduced for a specific model; document any difference.
7. Use stratified 80/20 train-test split with a fixed random seed.
8. Display the actual row/column count, target distribution, and summary of features.
9. Keep the test set untouched until final evaluation.

**Deliverable:** working data audit and leakage-safe preprocessing pipeline.

### Phase 3 — Traditional ML training
1. Implement the four paper-aligned models: Random Forest, Gradient Boosting, XGBoost, and LightGBM.
2. Use a shared training/evaluation interface to avoid duplicated code.
3. Start with sensible, documented defaults; only use small, justified hyperparameter searches if time allows.
4. If using class weights or SMOTE/SMOTENC, apply it to the training data only and document exactly why and how. Never oversample the test set. Do not add imbalance handling automatically without checking class distribution.
5. If reproducing the paper's feature selection, implement RFECV and/or SelectFromModel in a leakage-safe pipeline and document any practical simplification. If this makes the student project unreliable or too complex, ask before dropping a paper method that materially affects alignment.
6. Save fitted preprocessing and model artifacts with joblib, together with model metadata and the exact training configuration.
7. Set random seeds where supported.

**Deliverable:** reproducible model training and saved artifacts.

### Phase 4 — Evaluation and result reporting
For each model, calculate from the held-out test set:
- Accuracy
- Precision
- Recall
- F1-score
- ROC-AUC when probability scores and both classes are available
- Confusion matrix

Also include:
- Class distribution and why accuracy alone can be misleading with imbalanced data
- A small results table
- One clear comparison chart only if it makes the result easier to understand
- Optional feature importance for tree models, clearly labeled as model-derived importance rather than causal explanation

Do not report the paper's values as our own. Do not hardcode a “best model”; select it using a documented metric, with recall/F1 considered important because missing a true defaulter can be costly. Explain the metric choice in plain language.

**Deliverable:** evaluation report generated from the actual run and stored in a machine-readable JSON/CSV file.

### Phase 5 — Python API
Create only the endpoints needed by the UI, for example:
- `GET /api/health` — API status
- `GET /api/dataset-summary` — dataset dimensions, target counts, and input feature metadata
- `GET /api/model-results` — actual saved evaluation metrics
- `POST /api/predict` — validate input, apply the exact saved preprocessing/model pipeline, return predicted class and probability if supported

Requirements:
- Use Pydantic request/response schemas.
- Return helpful validation errors.
- Never retrain a model for every prediction request.
- Do not let frontend code duplicate ML preprocessing.
- Do not expose local filesystem paths or stack traces to the user.
- CORS should allow the local React development origin only.
- Add basic tests for endpoint success and invalid input.

**Deliverable:** tested FastAPI service.

### Phase 6 — React UI
Keep to two main views or one page with two clear sections:

**A. Overview / Model Results**
- Project title and one-sentence explanation
- Dataset source and actual record/feature counts
- Target class distribution
- Model-results table with metrics from the backend
- A short note on the selected model and why the chosen metric matters
- Research paper link and dataset link

**B. Predict Default Risk**
- A compact form containing only the required features expected by the saved model
- Use dropdowns for categorical fields and numeric inputs with validation
- A clear Predict button
- Results area showing predicted class and, only if calibrated/available, estimated probability
- Short explanation that this is a classroom model, not a real lending decision

Keep the flow obvious: inspect the model results, enter a borrower profile, submit, view the prediction. Do not add separate dashboard, settings, history, login, or profile pages.

**UI quality requirements**
- Clear headings and concise copy
- Good spacing and alignment
- Responsive on laptop and mobile widths
- Loading, empty, and error states
- No fake sample metrics
- No decorative badges, gradients, emoji, or excessive icons
- Use the same actual feature names/meanings as the dataset
- Ensure every visible button works

**Deliverable:** working React UI connected to the real backend.

### Phase 7 — Testing and reproducibility
Test:
1. Dataset validation and target mapping
2. Preprocessing on numeric and categorical features
3. Train/test split and no test leakage
4. Training all four models
5. Metrics generation
6. Prediction using the saved pipeline
7. API validation and error handling
8. UI with valid input, invalid input, loading, and backend unavailable
9. A clean start from documented setup instructions

Run the project from a fresh environment if feasible. Fix actual errors; do not hide them with mock responses.

**Deliverable:** reproducible, tested application and a short verification checklist.

### Phase 8 — Presentation and report materials
Create `docs/presentation_outline.md` and a presentation file only after actual metrics and screenshots exist. Follow the provided college PDF's slide headings and numbering exactly; the supplied template skips some slide numbers, so do not silently invent missing slides.

The supplied PDF specifies:
- Slide 1: Title Slide — project title, team names and roll numbers, department/college, guide, academic year
- Slide 2: Introduction — overview, motivation, real-world application
- Slide 3: Problem Statement and Objectives — problem, objectives, expected outcome
- Slide 4: Dataset Description — source, actual number of records/features, inputs/target, sample or visualization
- Slide 5: Methodology — approach, preprocessing, feature selection/engineering if applicable, algorithms, workflow/system architecture
- Slide 6: Implementation — tools, model development/training, train-test split, implementation steps
- Slide 7: Results and Evaluation — actual performance, appropriate metrics, graphs/tables, interpretation
- Slide 9: Output and Demonstration — real screenshots, sample inputs/predictions, working demonstration
- Slide 10: Conclusion — summary, findings, objective achievement
- Slide 12: References and Q&A — research paper, dataset, documentation, acknowledgements if applicable, Q&A

Presentation guidance from the supplied PDF:
- Prefer diagrams, graphs, and screenshots over long paragraphs.
- Explain the ML algorithm and why it was selected.
- Show actual model results; do not report unverified performance.
- Every team member should understand the project and contribute during the presentation.

Use simple student-style writing. Do not use fake team names, roll numbers, guide name, college name, screenshots, or results. Put clear placeholders where details are not supplied. Include a compact reference slide entry for the selected paper, dataset, and libraries. Ensure the research-paper methodology and our actual implementation differences are described honestly.

**Deliverable:** editable PPTX if the environment supports it, plus the outline and real screenshots. Use the exact template structure rather than adding decorative slides.

### Phase 9 — Final documentation and handoff
Update root `README.md` with:
- What the project does
- Research paper and dataset links
- Exact data placement/download instructions
- Requirements
- Backend setup/run commands
- Frontend setup/run commands
- Training command
- How to run tests
- API endpoints
- Known limitations
- How to reproduce the metrics
- Which parts match the paper and which are simplified

Create `docs/final_checklist.md` with all checks marked honestly. Do not mark a check complete unless it was actually run.

---

## 5. Design and code quality rules

- Keep functions short and named by responsibility.
- Separate data loading, preprocessing, training, evaluation, API, and UI.
- Avoid a single huge Python file or React component.
- Avoid duplicated preprocessing between training and inference.
- Use type hints where useful and comments only where they clarify a non-obvious decision.
- Use meaningful variable names and readable code suitable for a student viva.
- Do not add abstractions or dependencies without a clear reason.
- Do not fabricate a model artifact or metrics when data/training is unavailable.
- Do not put secrets or absolute machine-specific paths in source control.
- Handle errors explicitly and show understandable messages.
- Include a `.gitignore` for virtual environments, `node_modules`, local datasets, caches, and generated artifacts as appropriate.

## 6. Acceptance criteria

The project is ready only when:
- [ ] The task is genuinely loan-default prediction, not loan-approval prediction by accident.
- [ ] The selected dataset and target are verified and documented.
- [ ] The paper and dataset references are valid and included.
- [ ] The four selected traditional ML models train successfully, or any blocker is reported clearly.
- [ ] The 80/20 stratified split and preprocessing are reproducible.
- [ ] All evaluation metrics come from the held-out test data.
- [ ] The UI calls the real Python API and shows real outputs.
- [ ] Prediction uses the same saved preprocessing pipeline as training.
- [ ] No NLP, deep learning, LLMs, or external AI services are used.
- [ ] No fake results or fake screenshots are included.
- [ ] The app can be run using the README instructions.
- [ ] The PPT follows the supplied college template and contains actual results and screenshots.
- [ ] `docs/paper_alignment.md` accurately records matches, adaptations, and omissions.

## 7. How Claude should work with this plan

Work in phases, not as one giant code dump. Start with Phase 0 and report any uncertainty about target semantics, dataset access, or differences from the paper. Do not invent missing details. After each phase:
1. Summarize files created/changed.
2. Run relevant checks and report exact outcomes.
3. List blockers honestly.
4. Continue to the next phase only when the current phase is stable.

Prioritize correctness, reproducibility, paper alignment, and a simple working demonstration over adding features.
