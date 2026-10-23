import pandas as pd
import pytest

from app.data import loader
from app.data.audit import summarize


def test_missing_file_gives_clear_error(tmp_path):
    with pytest.raises(loader.DatasetError, match="not found"):
        loader.load_raw(tmp_path / "nope.csv")


def test_validate_rejects_missing_target(toy_df):
    with pytest.raises(loader.DatasetError, match="not found"):
        loader.validate(toy_df.drop(columns=["loan_status"]))


def test_validate_rejects_non_binary_target(toy_df):
    toy_df["loan_status"] = 2
    with pytest.raises(loader.DatasetError, match="exactly the values 0 and 1"):
        loader.validate(toy_df)


def test_clean_drops_duplicates_and_implausible_age(toy_df):
    dirty = pd.concat([toy_df, toy_df.iloc[[0]]], ignore_index=True)
    dirty.loc[1, "person_age"] = 144
    cleaned, removed = loader.clean(dirty)
    assert removed == {"duplicate_rows": 1, "implausible_age_rows": 1}
    assert len(cleaned) == len(toy_df) - 1


def test_summary_reports_counts_and_feature_types(toy_df):
    summary = summarize(toy_df, toy_df, {})
    assert summary["rows_after_cleaning"] == 400
    assert sum(summary["target_counts"].values()) == 400
    assert "loan_amnt" in summary["numeric_features"]
    assert "loan_intent" in summary["categorical_features"]
