"""Metrics on the held-out test set."""
import numpy as np
import pandas as pd
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             precision_score, recall_score, roc_auc_score)


def evaluate(model, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
    """`model` is a fitted pipeline that accepts raw feature rows."""
    predicted = model.predict(X_test)
    tn, fp, fn, tp = confusion_matrix(y_test, predicted, labels=[0, 1]).ravel()
    result = {
        "accuracy": accuracy_score(y_test, predicted),
        "precision": precision_score(y_test, predicted, zero_division=0),
        "recall": recall_score(y_test, predicted, zero_division=0),
        "f1": f1_score(y_test, predicted, zero_division=0),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
    }
    if len(np.unique(y_test)) == 2:
        result["roc_auc"] = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])
    return {k: round(v, 4) if isinstance(v, float) else v for k, v in result.items()}


def top_feature_importances(model, n: int = 10) -> list[dict]:
    """Model-derived importance of the features the model actually used (not causal)."""
    names = model.named_steps["features"].get_feature_names_out()
    importances = model.named_steps["model"].feature_importances_
    order = np.argsort(importances)[::-1][:n]
    total = importances.sum() or 1.0
    return [{"feature": str(names[i]), "importance": round(float(importances[i] / total), 4)} for i in order]
