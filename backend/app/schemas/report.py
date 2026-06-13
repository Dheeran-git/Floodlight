"""Report schemas — request/response models for citizen reports.

Matches API_SPEC.md POST /reports and GET /reports contracts.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    """Schema for creating a new citizen report.

    Matches: POST /api/v1/reports
    """

    text: str = Field(..., min_length=1, description="Report text content")
    latitude: float = Field(..., ge=-90, le=90, description="GPS latitude")
    longitude: float = Field(..., ge=-180, le=180, description="GPS longitude")
    source: str = Field(default="citizen_app", description="Report source")


class ReportResponse(BaseModel):
    """Schema for a single report in API responses."""

    id: uuid.UUID
    text: str
    latitude: float
    longitude: float
    source: str
    severity: str | None = None
    credibility: int | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportCreateResponse(BaseModel):
    """Response for successful report creation.

    Matches: POST /reports response { success, report_id }
    """

    success: bool = True
    report_id: uuid.UUID
