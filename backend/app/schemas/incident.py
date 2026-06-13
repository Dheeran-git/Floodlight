"""Incident schemas — request/response models for operational incidents.

Matches API_SPEC.md GET /incidents and GET /incidents/{id} contracts.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.report import ReportResponse


class IncidentResponse(BaseModel):
    """Schema for an incident in list responses.

    Matches: GET /incidents response items.
    """

    id: uuid.UUID
    severity: str
    priority_score: int

    model_config = {"from_attributes": True}


class IncidentDetail(BaseModel):
    """Schema for detailed incident view.

    Matches: GET /incidents/{id} response.
    """

    id: uuid.UUID
    title: str
    description: str
    severity: str
    priority_score: int
    status: str
    latitude: float
    longitude: float
    created_at: datetime
    updated_at: datetime
    reports: list[ReportResponse] = []

    model_config = {"from_attributes": True}
