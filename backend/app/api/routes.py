from fastapi import APIRouter, HTTPException, Request

from app.api import artifacts
from app.api.schemas import HealthResponse, LoanApplication, PredictionResponse
from app.ml.predictor import Predictor

DISCLAIMER = ("Classroom demonstration of a machine learning model trained on a public dataset. "
              "It is not a real lending decision or financial advice.")

router = APIRouter(prefix="/api")


def _predictor(request: Request) -> Predictor:
    predictor = request.app.state.predictor
    if predictor is None:
        raise HTTPException(503, "The model is not trained yet. Run: python -m app.ml.train")
    return predictor


@router.get("/health", response_model=HealthResponse)
def health(request: Request):
    return HealthResponse(status="ok", model_loaded=request.app.state.predictor is not None)


@router.get("/input-schema")
def input_schema():
    """Field names, labels, allowed values and bounds, so the form never duplicates them."""
    return LoanApplication.model_json_schema()


@router.get("/dataset-summary")
def dataset_summary(request: Request):
    return artifacts.read_json(request.app.state.artifacts_dir, "dataset_summary.json",
                               "python -m app.data.audit")


@router.get("/model-results")
def model_results(request: Request):
    return artifacts.read_json(request.app.state.artifacts_dir, "model_results.json",
                               "python -m app.ml.train")


@router.post("/predict", response_model=PredictionResponse)
def predict(application: LoanApplication, request: Request):
    prediction = _predictor(request).predict(application.model_dump())
    return PredictionResponse(
        predicted_class=prediction.predicted_class,
        predicted_label="approved" if prediction.predicted_class == 1 else "rejected",
        approval_score=prediction.approval_score,
        model_name=request.app.state.model_name,
        disclaimer=DISCLAIMER,
    )
