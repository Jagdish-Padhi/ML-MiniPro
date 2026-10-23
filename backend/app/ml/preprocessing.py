"""Leakage-safe preprocessing. The same pipeline object is used for training and prediction.

Column types are detected from the data (numbers vs text), so the pipeline adapts to the
actual CSV instead of a hardcoded column list.
"""
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer, make_column_selector
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder

from app import config


def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """Age-to-experience ratio, one of the two features engineered in the reference paper.

    +1 on experience avoids division by zero for borrowers with no work experience.
    The paper's debt-to-income ratio is not added: the dataset has loan_percent_income instead.
    """
    df = df.copy()
    if {"person_age", "person_emp_exp"} <= set(df.columns):
        df["age_to_experience"] = df["person_age"] / (df["person_emp_exp"] + 1)
    return df


def engineered_feature_names(_transformer, input_features) -> list[str]:
    names = list(input_features)
    if {"person_age", "person_emp_exp"} <= set(names):
        names.append("age_to_experience")
    return names


def build_preprocessor() -> Pipeline:
    numeric = Pipeline([("impute", SimpleImputer(strategy="median"))])
    categorical = Pipeline([
        ("impute", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])
    columns = ColumnTransformer([
        ("numeric", numeric, make_column_selector(dtype_include=np.number)),
        ("categorical", categorical, make_column_selector(dtype_exclude=np.number)),
    ])
    return Pipeline([
        ("engineer", FunctionTransformer(add_engineered_features, feature_names_out=engineered_feature_names)),
        ("columns", columns),
    ])


def split_features_target(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    return df.drop(columns=[config.TARGET_COLUMN]), df[config.TARGET_COLUMN]


def stratified_split(df: pd.DataFrame):
    """80/20 split that keeps the approved/rejected ratio in both parts."""
    X, y = split_features_target(df)
    return train_test_split(
        X, y,
        test_size=config.TEST_SIZE,
        stratify=y,
        random_state=config.RANDOM_SEED,
    )
