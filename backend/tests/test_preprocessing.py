import numpy as np

from app import config
from app.ml import preprocessing as prep


def test_split_is_80_20_and_stratified(toy_df):
    X_train, X_test, y_train, y_test = prep.stratified_split(toy_df)
    assert len(X_test) == int(len(toy_df) * config.TEST_SIZE)
    assert abs(y_train.mean() - y_test.mean()) < 0.01


def test_split_is_reproducible(toy_df):
    a = prep.stratified_split(toy_df)[1].index
    b = prep.stratified_split(toy_df)[1].index
    assert list(a) == list(b)


def test_engineered_feature_handles_zero_experience(toy_df):
    toy_df.loc[0, "person_emp_exp"] = 0
    out = prep.add_engineered_features(toy_df)
    assert np.isfinite(out["age_to_experience"]).all()


def test_preprocessor_outputs_no_missing_values(toy_df):
    X_train, X_test, _, _ = prep.stratified_split(toy_df)
    X_train = X_train.copy()
    X_train.loc[X_train.index[:5], "person_income"] = np.nan
    X_train.loc[X_train.index[5:10], "loan_intent"] = None
    pipe = prep.build_preprocessor().fit(X_train)
    assert not np.isnan(pipe.transform(X_train)).any()
    assert not np.isnan(pipe.transform(X_test)).any()


def test_imputer_is_fitted_on_training_data_only(toy_df):
    X_train, X_test, _, _ = prep.stratified_split(toy_df)
    pipe = prep.build_preprocessor().fit(X_train)
    numeric_imputer = pipe.named_steps["columns"].named_transformers_["numeric"].named_steps["impute"]
    names = pipe.named_steps["columns"].transformers_[0][2]
    learned = dict(zip(names, numeric_imputer.statistics_))
    assert learned["person_income"] == X_train["person_income"].median()
    assert learned["person_income"] != toy_df["person_income"].median()


def test_unseen_category_does_not_crash(toy_df):
    X_train, X_test, _, _ = prep.stratified_split(toy_df)
    pipe = prep.build_preprocessor().fit(X_train)
    row = X_test.iloc[[0]].copy()
    row["loan_intent"] = "SOMETHING_NEW"
    assert pipe.transform(row).shape[0] == 1
