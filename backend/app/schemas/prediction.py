"""Prediction schemas — response models for forecasted risk zones.

Matches GET /prediction/risk.
"""

from pydantic import BaseModel


class RiskZoneResponse(BaseModel):
    """A forecasted high-risk zone for the crisis map's risk layer."""

    center_lat: float
    center_lon: float
    radius_km: float
    risk_score: float
    predicted_risk_score: float
    escalation_probability: float
    incident_count: int
    reasoning: str

    model_config = {"from_attributes": True}
