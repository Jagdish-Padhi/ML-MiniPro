import json
import typing

import joblib
import pytest
from fastapi.testclient import TestClient
from sklearn.ensemble import RandomForestClassifier

from app import config
from app.api.main import create_app
from app.api.schemas import LoanApplication
from app.ml import preprocessing as prep
from app.ml import train

VALID = {
    "person_age": 30, "person_gender": "female", "person_education": "Bachelor",
    "person_income": 65000, "person_emp_exp": 6, "person_home_ownership": "RENT",
    "loan_amnt": 9000, "loan_intent": "EDUCATION", "loan_int_rate": 11.5,
    "cb_person_cred_hist_length": 5, "credit_score": 640,
    "previous_loan_defaults_on_file": "No",
}


@pytest.fixture
def client(toy_df, tmp_path):
    """App wired to a tiny model trained on the synthetic fixture. Test-only artifacts."""
    X_train, _, y_train, _ = prep.stratified_split(toy_df)
    features = train.fit_feature_pipeline(X_train, y_train)
    candidates = {"Tiny RF": (RandomForestClassifier(n_estimators=10, random_state=0, n_jobs=1),
                              {"n_estimators": [10]})}
    pipeline = train.train_models(features, X_train, y_train, candidates)["Tiny RF"]["pipeline"]
    joblib.dump(pipeline, tmp_path / "model.joblib")
    (tmp_path / "model_results.json").write_text(json.dumps({"best_model": "Tiny RF", "models": {}}))
    with TestClient(create_app(tmp_path / "model.joblib", tmp_path)) as test_client:
        yield test_client


def test_health_reports_model_loaded(client):
    assert client.get("/api/health").json() == {"status": "ok", "model_loaded": True}


def test_predict_returns_class_score_and_disclaimer(client):
    response = client.post("/api/predict", json=VALID)
    body = response.json()
    assert response.status_code == 200
    assert body["predicted_class"] in (0, 1)
    assert body["predicted_label"] == ("approved" if body["predicted_class"] else "rejected")
    assert 0 <= body["approval_score"] <= 1
    assert body["model_name"] == "Tiny RF"
    assert "not a real lending decision" in body["disclaimer"]


def test_predict_is_deterministic(client):
    assert client.post("/api/predict", json=VALID).json() == client.post("/api/predict", json=VALID).json()


def test_out_of_range_value_names_the_field(client):
    response = client.post("/api/predict", json={**VALID, "credit_score": 1200})
    assert response.status_code == 422
    assert response.json()["errors"][0]["field"] == "credit_score"


def test_unknown_category_is_rejected(client):
    response = client.post("/api/predict", json={**VALID, "loan_intent": "VACATION"})
    assert response.status_code == 422


def test_missing_field_is_rejected(client):
    incomplete = {k: v for k, v in VALID.items() if k != "person_income"}
    response = client.post("/api/predict", json=incomplete)
    assert response.status_code == 422
    assert response.json()["errors"][0]["field"] == "person_income"


def test_experience_greater_than_age_is_rejected_with_readable_message(client):
    response = client.post("/api/predict", json={**VALID, "person_age": 22, "person_emp_exp": 30})
    assert response.status_code == 422
    assert "cannot be greater than age" in response.json()["errors"][0]["message"]


def test_missing_results_file_gives_503_without_paths(client, tmp_path):
    response = client.get("/api/dataset-summary")
    assert response.status_code == 503
    assert "python -m app.data.audit" in response.json()["detail"]
    assert str(tmp_path) not in response.text


def test_model_results_served_from_saved_file(client):
    assert client.get("/api/model-results").json()["best_model"] == "Tiny RF"


def test_input_schema_lists_every_form_field(client):
    properties = client.get("/api/input-schema").json()["properties"]
    assert set(properties) == set(VALID)


def test_predict_without_trained_model_gives_503(tmp_path):
    with TestClient(create_app(tmp_path / "missing.joblib", tmp_path)) as no_model:
        assert no_model.get("/api/health").json()["model_loaded"] is False
        response = no_model.post("/api/predict", json=VALID)
    assert response.status_code == 503
    assert "python -m app.ml.train" in response.json()["detail"]


def test_cors_allows_vite_origin_only(client):
    allowed = client.get("/api/health", headers={"Origin": "http://localhost:5173"})
    other = client.get("/api/health", headers={"Origin": "http://evil.example"})
    assert allowed.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert "access-control-allow-origin" not in other.headers


needs_real_artifacts = pytest.mark.skipif(
    not (config.BEST_MODEL_PATH.exists() and (config.ARTIFACTS_DIR / "dataset_summary.json").exists()),
    reason="train the real model first")


@needs_real_artifacts
def test_schema_categories_cover_every_value_in_the_real_dataset():
    summary = json.loads((config.ARTIFACTS_DIR / "dataset_summary.json").read_text())
    for column, values in summary["categorical_values"].items():
        allowed = set(typing.get_args(LoanApplication.model_fields[column].annotation))
        assert set(values) == allowed, column


@needs_real_artifacts
def test_real_model_predicts_a_plausible_profile():
    with TestClient(create_app()) as real:
        strong = real.post("/api/predict", json=VALID).json()
        weak = real.post("/api/predict", json={**VALID, "previous_loan_defaults_on_file": "Yes",
                                               "credit_score": 450, "loan_amnt": 30000,
                                               "person_income": 20000, "loan_int_rate": 19}).json()
    assert weak["approval_score"] < strong["approval_score"]
