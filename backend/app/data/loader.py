"""Load, validate and clean the loan CSV. No model code lives here."""
from pathlib import Path

import pandas as pd

from app import config


class DatasetError(Exception):
    """Raised when the dataset file is missing or does not look as expected."""


def load_raw(path: Path = config.DATA_PATH) -> pd.DataFrame:
    if not path.exists():
        raise DatasetError(
            f"Dataset not found at '{path.name}'. Download the CSV from Kaggle and "
            f"place it in the data/ folder (see data/README.md)."
        )
    return pd.read_csv(path)


def validate(df: pd.DataFrame, target: str = config.TARGET_COLUMN) -> None:
    if target not in df.columns:
        raise DatasetError(f"Target column '{target}' not found. Columns: {list(df.columns)}")
    values = set(df[target].dropna().unique())
    if values != {0, 1}:
        raise DatasetError(f"Target '{target}' must contain exactly the values 0 and 1, found {sorted(values)}")
    if df[target].isna().any():
        raise DatasetError(f"Target '{target}' has missing values; rows without a label cannot be used.")


def clean(df: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, int]]:
    """Drop exact duplicates and implausible ages. Returns the data and what was removed."""
    removed = {}
    before = len(df)
    df = df.drop_duplicates()
    removed["duplicate_rows"] = before - len(df)

    if "person_age" in df.columns:
        before = len(df)
        df = df[df["person_age"] <= config.MAX_PLAUSIBLE_AGE]
        removed["implausible_age_rows"] = before - len(df)
    return df.reset_index(drop=True), removed


def load_clean(path: Path = config.DATA_PATH) -> tuple[pd.DataFrame, dict[str, int]]:
    df = load_raw(path)
    validate(df)
    return clean(df)
