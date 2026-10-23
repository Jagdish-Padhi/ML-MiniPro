const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, { status = null, fieldErrors = [] } = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, options);
  } catch {
    throw new ApiError(
      "Cannot reach the backend. Start it from the backend folder with: uvicorn app.api.main:app --port 8000"
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(body?.detail ?? "The request failed.", {
      status: response.status,
      fieldErrors: body?.errors ?? [],
    });
  }
  return body;
}

export const getDatasetSummary = () => request("/api/dataset-summary");
export const getModelResults = () => request("/api/model-results");
export const getInputSchema = () => request("/api/input-schema");

export const predict = (application) =>
  request("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(application),
  });
