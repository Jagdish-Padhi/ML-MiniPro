"""Dataset audit: facts about the file, saved as JSON for the API, report and slides.

Run from the backend folder:  python -m app.data.audit
"""
import json

import pandas as pd

from app import config
from app.data import loader


def summarize(raw: pd.DataFrame, cleaned: pd.DataFrame, removed: dict[str, int]) -> dict:
    target = config.TARGET_COLUMN
    counts = cleaned[target].value_counts().sort_index()
    features = cleaned.drop(columns=[target])
    return {
        "rows_raw": int(len(raw)),
        "rows_after_cleaning": int(len(cleaned)),
        "removed": removed,
        "columns": int(cleaned.shape[1]),
        "target_column": target,
        "target_meaning": {"1": "approved", "0": "rejected"},
        "target_counts": {str(k): int(v) for k, v in counts.items()},
        "positive_class_share": round(float(counts.get(config.POSITIVE_LABEL, 0) / len(cleaned)), 4),
        "missing_values": {c: int(n) for c, n in cleaned.isna().sum().items() if n > 0},
        "numeric_features": features.select_dtypes("number").columns.tolist(),
        "categorical_features": features.select_dtypes(exclude="number").columns.tolist(),
        "numeric_ranges": {
            c: {"min": float(features[c].min()), "max": float(features[c].max())}
            for c in features.select_dtypes("number").columns
        },
        "categorical_values": {
            c: sorted(features[c].dropna().unique().tolist())
            for c in features.select_dtypes(exclude="number").columns
        },
    }


def main() -> None:
    try:
        raw = loader.load_raw()
        loader.validate(raw)
    except loader.DatasetError as err:
        raise SystemExit(f"Dataset problem: {err}")
    cleaned, removed = loader.clean(raw)
    summary = summarize(raw, cleaned, removed)
    config.ARTIFACTS_DIR.mkdir(exist_ok=True)
    out = config.ARTIFACTS_DIR / "dataset_summary.json"
    out.write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))
    print(f"\nSaved to {out.relative_to(config.PROJECT_ROOT)}")


if __name__ == "__main__":
    main()
