# Data

The dataset is not committed to the repository.

1. Download **Loan Approval Classification Data** from
   https://www.kaggle.com/datasets/taweilo/loan-approval-classification-data
2. Place the CSV here as `data/loan_data.csv`
   (or set the `LOAN_DATA_PATH` environment variable to its location).
3. From `backend/`, run `python -m app.data.audit` to verify it.

Target column: `loan_status` (1 = approved, 0 = rejected, per the dataset's data dictionary).
