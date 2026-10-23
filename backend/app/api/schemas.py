"""Request and response shapes. Field bounds follow the range of the training data, so the
model is never asked about borrowers far outside what it has seen."""
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class LoanApplication(BaseModel):
    model_config = ConfigDict(extra="forbid")

    person_age: int = Field(ge=20, le=100, title="Age (years)")
    person_gender: Literal["female", "male"] = Field(title="Gender")
    person_education: Literal["High School", "Associate", "Bachelor", "Master", "Doctorate"] = Field(
        title="Education level")
    person_income: float = Field(ge=8000, le=2_500_000, title="Annual income")
    person_emp_exp: int = Field(ge=0, le=60, title="Employment experience (years)")
    person_home_ownership: Literal["RENT", "OWN", "MORTGAGE", "OTHER"] = Field(title="Home ownership")
    loan_amnt: float = Field(ge=500, le=35000, title="Loan amount")
    loan_intent: Literal["PERSONAL", "EDUCATION", "MEDICAL", "VENTURE", "HOMEIMPROVEMENT",
                         "DEBTCONSOLIDATION"] = Field(title="Loan purpose")
    loan_int_rate: float = Field(ge=5, le=20, title="Interest rate (%)")
    cb_person_cred_hist_length: int = Field(ge=2, le=30, title="Credit history length (years)")
    credit_score: int = Field(ge=300, le=850, title="Credit score")
    previous_loan_defaults_on_file: Literal["Yes", "No"] = Field(title="Previous loan default on file")

    @model_validator(mode="after")
    def experience_cannot_exceed_age(self):
        if self.person_emp_exp > self.person_age:
            raise ValueError("Employment experience cannot be greater than age.")
        return self


class PredictionResponse(BaseModel):
    predicted_class: Literal[0, 1]
    predicted_label: Literal["approved", "rejected"]
    approval_score: float = Field(description="Model probability of approval; not calibrated.")
    model_name: str
    disclaimer: str


class HealthResponse(BaseModel):
    status: Literal["ok"]
    model_loaded: bool
