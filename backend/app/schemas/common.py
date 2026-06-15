"""Common response schemas.

Standardized API response wrapper per CLAUDE.md specification:
{ "success": true, "data": {}, "timestamp": "" }
"""

from datetime import datetime

from pydantic import BaseModel, Field


class APIResponse[T](BaseModel):
    """Standard API response wrapper.

    All API responses follow this structure per CLAUDE.md:
    - success: boolean status
    - data: response payload
    - timestamp: ISO 8601 timestamp
    """

    success: bool = True
    data: T
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorResponse(BaseModel):
    """Standard error response."""

    success: bool = False
    error: str
    detail: str | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "healthy"
