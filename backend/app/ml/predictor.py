"""Load the saved pipeline and score one loan application.

The saved pipeline already contains preprocessing, feature selection and the model, so
prediction never re-implements any training logic.
"""
from dataclasses import dataclass
from pathlib import Path

import joblib
import pandas as pd


class ModelNotAvailable(Exception):
    """Raised when no trained model file exists yet."""


@dataclass(frozen=True)
class Prediction:
    predicted_class: int      # 1 = approved, 0 = rejected
    approval_score: float     # model's probability for class 1 (not calibrated)


def to_feature_row(application: dict) -> pd.DataFrame:
    """One raw dataset-style row. loan_percent_income is derived exactly as in the dataset:
    loan amount / income, rounded to 2 decimals (matches the CSV on 99.99% of rows)."""
    row = dict(application)
    row["loan_percent_income"] = round(row["loan_amnt"] / row["person_income"], 2)
    return pd.DataFrame([row])


class Predictor:
    def __init__(self, pipeline) -> None:
        self._pipeline = pipeline

    @classmethod
    def load(cls, path: Path) -> "Predictor":
        if not path.exists():
            raise ModelNotAvailable("No trained model found. Run: python -m app.ml.train")
        return cls(joblib.load(path))

    def predict(self, application: dict) -> Prediction:
        # The pipeline checks column names and order; use the order it was trained with.
        row = to_feature_row(application)[list(self._pipeline.feature_names_in_)]
        probability = float(self._pipeline.predict_proba(row)[0, 1])
        return Prediction(
            predicted_class=int(self._pipeline.predict(row)[0]),
            approval_score=round(probability, 4),
        )
