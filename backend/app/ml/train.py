"""Training pipeline.

Order of work (all fitting uses the training split only):
  1. stratified 80/20 split
  2. preprocessing + RFECV feature selection, fitted once on the training split
  3. per model: GridSearchCV (3-fold, F1) on the selected features
  4. best model chosen by cross-validated F1, NOT by test score
  5. every model evaluated once on the untouched test split

Run from the backend folder:  python -m app.ml.train
"""
import json
import time
import warnings
from datetime import datetime, timezone

import joblib
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.feature_selection import RFECV
from sklearn.metrics import f1_score
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.utils.class_weight import compute_sample_weight

from app import config
from app.data import loader
from app.ml import evaluate as ev
from app.ml import models as model_defs
from app.ml import preprocessing as prep


def fit_feature_pipeline(X_train: pd.DataFrame, y_train: pd.Series) -> Pipeline:
    """Preprocessing followed by RFECV (LightGBM as the ranking estimator)."""
    selector = RFECV(
        LGBMClassifier(n_estimators=100, random_state=config.RANDOM_SEED, n_jobs=-1, verbose=-1),
        step=1,
        cv=StratifiedKFold(config.SELECTION_CV_FOLDS, shuffle=True, random_state=config.RANDOM_SEED),
        scoring=config.TUNING_METRIC,
        n_jobs=-1,
    )
    return Pipeline([("prep", prep.build_preprocessor()), ("select", selector)]).fit(X_train, y_train)


def unweighted_f1(estimator, X, y) -> float:
    """F1 of the approved class on plain, unweighted rows.

    Class weights are only for fitting. With a built-in scorer, scikit-learn also applies the
    fit-time sample weights when scoring, which inflates CV F1 and makes it incomparable with
    the unweighted test F1. This callable scorer keeps CV and test scores on the same footing.
    """
    return f1_score(y, estimator.predict(X))


def tune_model(estimator, grid, X, y, sample_weight):
    search = GridSearchCV(
        estimator, grid,
        scoring=unweighted_f1,
        cv=StratifiedKFold(config.CV_FOLDS, shuffle=True, random_state=config.RANDOM_SEED),
        n_jobs=1,  # the estimators already use all cores
        refit=True,
    )
    with warnings.catch_warnings():
        # Expected: weights are deliberately used for fitting only (see unweighted_f1).
        warnings.filterwarnings("ignore", message=".*does not support sample_weight.*")
        search.fit(X, y, sample_weight=sample_weight)
    return search


def train_models(features: Pipeline, X_train, y_train, candidates) -> dict:
    """Returns name -> {'pipeline', 'best_params', 'cv_f1', 'cv_f1_std', 'seconds'}."""
    Xt = features.transform(X_train)
    weights = (compute_sample_weight("balanced", y_train)
               if config.IMBALANCE_STRATEGY == "class_weight" else None)
    trained = {}
    for name, (estimator, grid) in candidates.items():
        start = time.time()
        search = tune_model(estimator, grid, Xt, y_train, weights)
        best = search.best_index_
        trained[name] = {
            "pipeline": Pipeline([("features", features), ("model", search.best_estimator_)]),
            "best_params": search.best_params_,
            "cv_f1": round(float(search.cv_results_["mean_test_score"][best]), 4),
            "cv_f1_std": round(float(search.cv_results_["std_test_score"][best]), 4),
            "seconds": round(time.time() - start, 1),
        }
        print(f"{name}: cv_f1={trained[name]['cv_f1']} params={search.best_params_} ({trained[name]['seconds']}s)")
    return trained


def select_best(trained: dict) -> str:
    return max(trained, key=lambda name: trained[name]["cv_f1"])


def main() -> None:
    df, removed = loader.load_clean()
    X_train, X_test, y_train, y_test = prep.stratified_split(df)
    print(f"train={len(X_train)} test={len(X_test)} approved_share_train={y_train.mean():.4f} test={y_test.mean():.4f}")

    features = fit_feature_pipeline(X_train, y_train)
    names = features.get_feature_names_out()
    selector = features.named_steps["select"]
    print(f"RFECV kept {selector.n_features_} of {selector.n_features_in_} features")

    trained = train_models(features, X_train, y_train, model_defs.default_candidates())
    best_name = select_best(trained)

    results = {}
    config.MODELS_DIR.mkdir(parents=True, exist_ok=True)
    for name, info in trained.items():
        results[name] = {
            "test_metrics": ev.evaluate(info["pipeline"], X_test, y_test),
            "cv_f1": info["cv_f1"],
            "cv_f1_std": info["cv_f1_std"],
            "best_params": info["best_params"],
            "train_seconds": info["seconds"],
            "top_features": ev.top_feature_importances(info["pipeline"]),
        }
        joblib.dump(info["pipeline"], config.MODELS_DIR / f"{name.lower().replace(' ', '_')}.joblib")

    joblib.dump(trained[best_name]["pipeline"], config.MODELS_DIR / "best_model.joblib")
    report = {
        "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "best_model": best_name,
        "best_model_rule": f"highest {config.CV_FOLDS}-fold cross-validated (unweighted) F1 on the training split",
        "split": {"train_rows": len(X_train), "test_rows": len(X_test), "test_size": config.TEST_SIZE, "seed": config.RANDOM_SEED},
        "imbalance_strategy": config.IMBALANCE_STRATEGY,
        "feature_selection": {
            "method": "RFECV (LightGBM ranker)",
            "kept": int(selector.n_features_),
            "of": int(selector.n_features_in_),
            "selected_features": [str(n) for n in names],
        },
        "cleaning_removed": removed,
        "models": results,
    }
    config.ARTIFACTS_DIR.mkdir(exist_ok=True)
    (config.ARTIFACTS_DIR / "model_results.json").write_text(json.dumps(report, indent=2))
    print(f"\nBest by CV F1: {best_name}. Saved artifacts/model_results.json")


if __name__ == "__main__":
    main()
