"""FastAPI application. Run from backend/:  uvicorn app.api.main:app --reload"""
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import config
from app.api import artifacts, routes
from app.ml.predictor import ModelNotAvailable, Predictor

logger = logging.getLogger("loan_api")


def _best_model_name(artifacts_dir: Path) -> str:
    try:
        return artifacts.read_json(artifacts_dir, "model_results.json", "")["best_model"]
    except (artifacts.ArtifactMissing, KeyError):
        return "unknown"


def create_app(model_path: Path = config.BEST_MODEL_PATH,
               artifacts_dir: Path = config.ARTIFACTS_DIR) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        try:
            app.state.predictor = Predictor.load(model_path)
        except ModelNotAvailable:
            logger.warning("No trained model found; /api/predict will return 503.")
            app.state.predictor = None
        app.state.artifacts_dir = artifacts_dir
        app.state.model_name = _best_model_name(artifacts_dir)
        yield

    app = FastAPI(title="Loan Approval Prediction API", lifespan=lifespan)
    app.add_middleware(CORSMiddleware, allow_origins=config.FRONTEND_ORIGINS,
                       allow_methods=["GET", "POST"], allow_headers=["Content-Type"])
    app.include_router(routes.router)

    @app.exception_handler(RequestValidationError)
    async def invalid_input(_: Request, exc: RequestValidationError):
        errors = []
        for item in exc.errors():
            field = str(item["loc"][-1])
            message = str(item["msg"]).removeprefix("Value error, ")
            errors.append({"field": "application" if field == "body" else field, "message": message})
        return JSONResponse(status_code=422, content={"detail": "Some inputs are invalid.", "errors": errors})

    @app.exception_handler(artifacts.ArtifactMissing)
    async def missing_artifact(_: Request, exc: artifacts.ArtifactMissing):
        return JSONResponse(status_code=503, content={"detail": str(exc)})

    @app.exception_handler(Exception)
    async def unexpected(_: Request, exc: Exception):
        logger.exception("Unhandled error", exc_info=exc)
        return JSONResponse(status_code=500, content={"detail": "Something went wrong on the server."})

    return app


app = create_app()
