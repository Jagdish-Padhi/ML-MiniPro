"""The four paper-aligned models and their small tuning grids."""
from sklearn.base import ClassifierMixin
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from lightgbm import LGBMClassifier
from xgboost import XGBClassifier

from app import config

Candidate = tuple[ClassifierMixin, dict[str, list]]


def default_candidates() -> dict[str, Candidate]:
    """name -> (estimator, grid). Grids are kept to 4-8 combinations on purpose."""
    seed = config.RANDOM_SEED
    return {
        "Random Forest": (
            RandomForestClassifier(random_state=seed, n_jobs=-1),
            {"n_estimators": [200, 400], "max_depth": [12, None]},
        ),
        "Gradient Boosting": (
            GradientBoostingClassifier(random_state=seed),
            {"n_estimators": [200], "learning_rate": [0.05, 0.1], "max_depth": [3, 5]},
        ),
        "XGBoost": (
            XGBClassifier(random_state=seed, n_jobs=-1, eval_metric="logloss"),
            {"n_estimators": [300], "learning_rate": [0.05, 0.1], "max_depth": [4, 6]},
        ),
        "LightGBM": (
            LGBMClassifier(random_state=seed, n_jobs=-1, verbose=-1),
            {"n_estimators": [300], "learning_rate": [0.05, 0.1], "num_leaves": [31, 63]},
        ),
    }
