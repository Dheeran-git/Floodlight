"""Command API endpoints.

Matches API_SPEC.md:
- POST /command/query — Submit operational intelligence query
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.command import CommandQueryRequest, CommandQueryResponse
from app.services.command_service import CommandService

router = APIRouter(prefix="/command", tags=["command"])


def _get_service(db: Session = Depends(get_db)) -> CommandService:
    """Compose the command service with a database session."""
    return CommandService(db=db)


@router.post("/query", response_model=CommandQueryResponse)
def submit_query(
    data: CommandQueryRequest,
    service: CommandService = Depends(_get_service),
) -> CommandQueryResponse:
    """Submit an operational intelligence query.

    Processes the query against the live operational picture (incidents,
    shelters, units) to generate an actionable, reasoned answer.

    Args:
        data: Query payload with the operational question.
        service: Injected command service.

    Returns:
        AI-generated response with actionable intelligence.
    """
    answer = service.process_query(data)
    return CommandQueryResponse(answer=answer)
