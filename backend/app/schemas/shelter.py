"""Shelter schemas — request/response models for emergency shelters.

Matches API_SPEC.md GET /shelters and GET /shelters/risk contracts.
"""

import uuid

from pydantic import BaseModel


class ShelterResponse(BaseModel):
    """Schema for a shelter in API responses.

    Matches: GET /shelters response items.
    """

    id: uuid.UUID
    name: str
    capacity: int
    current_occupancy: int
    latitude: float
    longitude: float
    risk_score: float

    model_config = {"from_attributes": True}

    @property
    def occupancy_display(self) -> str:
        """Human-readable occupancy string."""
        return f"{self.current_occupancy}/{self.capacity}"


class ShelterRiskResponse(BaseModel):
    """Schema for shelter risk predictions.

    Matches: GET /shelters/risk response items.
    """

    name: str
    overflow_probability: float

    model_config = {"from_attributes": True}
