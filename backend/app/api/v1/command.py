"""Command API endpoints.

Matches API_SPEC.md:
- POST /command/query — Submit operational intelligence query
"""

from fastapi import APIRouter

from app.schemas.command import CommandQueryRequest, CommandQueryResponse
from app.services.command_service import CommandService

router = APIRouter(prefix="/command", tags=["command"])


@router.post("/query", response_model=CommandQueryResponse)
def submit_query(
    data: CommandQueryRequest,
) -> CommandQueryResponse:
    """Submit an operational intelligence query.

    Processes the query through the command intelligence layer
    to generate actionable insights based on current operational data.

    Args:
        data: Query payload with the operational question.

    Returns:
        AI-generated response with actionable intelligence.
    """
    service = CommandService()
    answer = service.process_query(data)
    return CommandQueryResponse(answer=answer)
