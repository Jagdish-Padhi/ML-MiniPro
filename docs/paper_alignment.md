# Paper alignment

Reference: Zhang et al. (2025), "Data-Driven Loan Default Prediction: A Machine Learning
Approach for Enhancing Business Process Management", *Systems* 13(7), 581.
https://doi.org/10.3390/systems13070581

This is a status table, not a measured percentage. Rows marked "planned" are filled in as
phases are completed.

## Important difference: the prediction target

The Kaggle dataset documents `loan_status` as 1 = approved, 0 = rejected. The paper calls the
same column "loan default status". This project follows the dataset's own definition and is
therefore a **loan approval prediction** project that reuses the paper's methodology.
The paper's reported scores are not reused anywhere; every number comes from our own run.

## Mapping

| Paper element | Status | Notes |
|---|---|---|
| Kaggle dataset (taweilo) as data source | Implemented as described | Paper uses a synthetic, SMOTENC-enlarged variant; exact file/version recorded after the audit |
| Stratified 80/20 train-test split | Implemented as described | Fixed seed, `preprocessing.stratified_split` |
| Median/mode imputation, categorical encoding | Adapted | One-hot encoding instead of LabelEncoder, inside a sklearn Pipeline fitted on training data only |
| Age-to-experience ratio | Implemented as described | `age_to_experience` |
| Debt-to-income ratio | Adapted | Dataset already provides `loan_percent_income` |
| Random Forest, Gradient Boosting, XGBoost, LightGBM | Implemented as described | `ml/models.py` |
| Class weighting and SMOTE | Adapted | Audit showed 22.2% approved / 77.8% rejected (moderate imbalance), so balanced class weights are used at fit time; SMOTE not used (synthetic rows add complexity and would need care to keep out of validation folds) |
| RFECV feature selection | Implemented, SelectFromModel omitted | RFECV (LightGBM ranker, 3-fold) kept 26 of 28 encoded features; fitted on the training split only |
| GridSearchCV, cross-validation | Adapted | Small 4-combination grids; 3-fold instead of the paper's 5-fold to keep tuning fast on a single-core machine |
| Accuracy, precision, recall, F1, ROC-AUC, confusion matrix | Implemented as described | `ml/evaluate.py`; metrics are for the approved class; best model picked by unweighted CV F1, never by test score |
| Threshold tuning, voting ensemble, SHAP | Not planned | Out of scope for a mini project |
