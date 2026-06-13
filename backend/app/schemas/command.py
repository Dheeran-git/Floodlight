"""Command schemas — request/response models for operational intelligence.

Matches API_SPEC.md POST /command/query contract.
"""

from pydantic import BaseModel, Field


class CommandQueryRequest(BaseModel):
    """Schema for submitting an operational query.

    Matches: POST /command/query request.
    """

    query: str = Field(
        ..., min_length=1, description="Operational question to answer"
    )


class CommandQueryResponse(BaseModel):
    """Schema for command query response.

    Matches: POST /command/query response.
    """

    answer: str
