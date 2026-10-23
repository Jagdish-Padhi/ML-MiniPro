from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import RFECV

from app.ml import evaluate as ev
from app.ml import preprocessing as prep
from app.ml import train


def tiny_candidates():
    return {"Tiny RF": (RandomForestClassifier(random_state=0, n_jobs=1), {"n_estimators": [10, 20]})}


def test_pipeline_trains_and_predicts_raw_rows(toy_df):
    X_train, X_test, y_train, y_test = prep.stratified_split(toy_df)
    features = train.fit_feature_pipeline(X_train, y_train)
    trained = train.train_models(features, X_train, y_train, tiny_candidates())
    pipeline = trained["Tiny RF"]["pipeline"]
    assert pipeline.predict(X_test.iloc[[0]]).shape == (1,)
    assert isinstance(features.named_steps["select"], RFECV)


def test_evaluate_returns_all_required_metrics(toy_df):
    X_train, X_test, y_train, y_test = prep.stratified_split(toy_df)
    features = train.fit_feature_pipeline(X_train, y_train)
    pipeline = train.train_models(features, X_train, y_train, tiny_candidates())["Tiny RF"]["pipeline"]
    result = ev.evaluate(pipeline, X_test, y_test)
    assert {"accuracy", "precision", "recall", "f1", "roc_auc", "confusion_matrix"} <= set(result)
    assert sum(result["confusion_matrix"].values()) == len(y_test)


def test_best_model_is_chosen_by_cv_score_only():
    trained = {"A": {"cv_f1": 0.7}, "B": {"cv_f1": 0.9}, "C": {"cv_f1": 0.8}}
    assert train.select_best(trained) == "B"


def test_top_feature_names_map_to_real_columns(toy_df):
    X_train, X_test, y_train, _ = prep.stratified_split(toy_df)
    features = train.fit_feature_pipeline(X_train, y_train)
    pipeline = train.train_models(features, X_train, y_train, tiny_candidates())["Tiny RF"]["pipeline"]
    top = ev.top_feature_importances(pipeline, n=3)
    assert len(top) == 3 and all(isinstance(t["feature"], str) for t in top)


def test_cv_f1_is_unweighted_so_it_is_comparable_with_test_f1(toy_df):
    """Regression test: class weights must not leak into the CV score."""
    import numpy as np
    from sklearn.base import clone
    from sklearn.metrics import f1_score
    from sklearn.model_selection import StratifiedKFold
    from sklearn.utils.class_weight import compute_sample_weight
    from app import config

    X_train, _, y_train, _ = prep.stratified_split(toy_df)
    features = train.fit_feature_pipeline(X_train, y_train)
    Xt = features.transform(X_train)
    estimator = RandomForestClassifier(n_estimators=10, random_state=0, n_jobs=1)
    weights = compute_sample_weight("balanced", y_train)

    search = train.tune_model(estimator, {"n_estimators": [10]}, Xt, y_train, weights)

    folds = StratifiedKFold(config.CV_FOLDS, shuffle=True, random_state=config.RANDOM_SEED)
    scores = []
    for fit_idx, val_idx in folds.split(Xt, y_train):
        model = clone(estimator).fit(Xt[fit_idx], y_train.iloc[fit_idx], sample_weight=weights[fit_idx])
        scores.append(f1_score(y_train.iloc[val_idx], model.predict(Xt[val_idx])))
    assert np.isclose(search.best_score_, np.mean(scores))
