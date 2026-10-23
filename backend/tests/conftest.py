"""Synthetic fixture used ONLY to test code paths. It is not the project dataset and
no metric or result in the project may come from it."""
import numpy as np
import pandas as pd
import pytest


@pytest.fixture
def toy_df() -> pd.DataFrame:
    rng = np.random.default_rng(0)
    n = 400
    df = pd.DataFrame({
        "person_age": rng.integers(21, 60, n).astype(float),
        "person_gender": rng.choice(["male", "female"], n),
        "person_education": rng.choice(["High School", "Bachelor", "Master"], n),
        "person_income": rng.normal(60000, 15000, n).round(),
        "person_emp_exp": rng.integers(0, 30, n),
        "person_home_ownership": rng.choice(["RENT", "OWN", "MORTGAGE"], n),
        "loan_amnt": rng.normal(9000, 3000, n).round(),
        "loan_intent": rng.choice(["EDUCATION", "MEDICAL", "VENTURE"], n),
        "loan_int_rate": rng.normal(11, 2, n).round(2),
        "cb_person_cred_hist_length": rng.integers(2, 20, n).astype(float),
        "credit_score": rng.integers(450, 800, n),
        "previous_loan_defaults_on_file": rng.choice(["Yes", "No"], n),
    })
    df["loan_percent_income"] = (df["loan_amnt"] / df["person_income"]).round(2)
    df["loan_status"] = (rng.random(n) < 0.25).astype(int)
    return df
