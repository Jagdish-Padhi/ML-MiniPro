"""Central settings for the project. Nothing else should hardcode paths or seeds."""
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

# The CSV is not committed. Place it at data/loan_data.csv or set LOAN_DATA_PATH.
DATA_PATH = Path(os.getenv("LOAN_DATA_PATH", PROJECT_ROOT / "data" / "loan_data.csv"))
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"

# Target column of the Kaggle "Loan Approval Classification Data" file.
# Its data dictionary defines 1 = approved, 0 = rejected.
TARGET_COLUMN = "loan_status"
POSITIVE_LABEL = 1

RANDOM_SEED = 42
TEST_SIZE = 0.20

# The source data is documented to contain implausible ages (100+ years).
MAX_PLAUSIBLE_AGE = 100

# Training settings
CV_FOLDS = 3                      # paper uses 5; 3 keeps tuning fast on a laptop-class CPU
SELECTION_CV_FOLDS = 3            # RFECV is run with fewer folds to keep it fast
TUNING_METRIC = "f1"              # F1 on the approved class; also used to pick the best model
IMBALANCE_STRATEGY = "class_weight"   # "class_weight" or "none"
MODELS_DIR = ARTIFACTS_DIR / "models"

# API settings
BEST_MODEL_PATH = MODELS_DIR / "best_model.joblib"
FRONTEND_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]  # Vite dev server only
