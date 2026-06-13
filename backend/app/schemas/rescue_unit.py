"""Rescue unit schemas — request/response models for resources.

Matches API_SPEC.md GET /resources and POST /resources/assign contracts.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel


class RescueUnitResponse(BaseModel):
    """Schema for a rescue unit in API responses.

    Matches: GET /resources response items.
    """

    id: uuid.UUID
    name: str
    type: str
    status: str
    latitude: float
    longitude: float
    capacity: int
    last_updated: datetime

    model_config = {"from_attributes": True}


class ResourceAssignRequest(BaseModel):
    """Schema for assigning a resource to an incident.

    Matches: POST /resources/assign request.
    """

    resource_id: uuid.UUID
    incident_id: uuid.UUID


class ResourceAssignResponse(BaseModel):
    """Response for successful resource assignment.

    Matches: POST /resources/assign response.
    """

    success: bool = True
