import pandas as pd
from sklearn.ensemble import RandomForestClassifier

from app.ml import preprocessing as prep
from app.ml import train
from app.ml.predictor import Predictor, to_feature_row


def test_loan_percent_income_is_derived_like_the_dataset():
    row = to_feature_row({"loan_amnt": 35000, "person_income": 71948})
    assert row.loc[0, "loan_percent_income"] == 0.49  # matches the first CSV row


def test_prediction_does_not_depend_on_input_key_order(toy_df):
    X_train, X_test, y_train, _ = prep.stratified_split(toy_df)
    features = train.fit_feature_pipeline(X_train, y_train)
    candidates = {"RF": (RandomForestClassifier(n_estimators=10, random_state=0, n_jobs=1), {"n_estimators": [10]})}
    predictor = Predictor(train.train_models(features, X_train, y_train, candidates)["RF"]["pipeline"])

    application = X_test.drop(columns=["loan_percent_income"]).iloc[0].to_dict()
    reversed_order = dict(reversed(list(application.items())))
    assert predictor.predict(application) == predictor.predict(reversed_order)
