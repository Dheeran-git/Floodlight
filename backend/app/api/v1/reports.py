"""Reports API endpoints.

Matches API_SPEC.md:
- POST /reports — Create a new citizen report
- GET /reports — Retrieve all reports
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.report_repository import ReportRepository
from app.schemas.report import ReportCreate, ReportCreateResponse, ReportResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])


def _get_service(db: Session = Depends(get_db)) -> ReportService:
    """Compose report service with its dependencies."""
    return ReportService(repository=ReportRepository(db))


@router.post("", response_model=ReportCreateResponse, status_code=201)
def create_report(
    data: ReportCreate,
    service: ReportService = Depends(_get_service),
) -> ReportCreateResponse:
    """Create a new citizen flood report.

    Accepts text content and GPS coordinates. The report is created
    with 'pending' status and will be processed by AI triage.

    Args:
        data: Report creation payload.
        service: Injected report service.

    Returns:
        Success response with the new report ID.
    """
    report = service.create_report(data)
    return ReportCreateResponse(report_id=report.id)


@router.get("", response_model=list[ReportResponse])
def list_reports(
    limit: int = 100,
    offset: int = 0,
    service: ReportService = Depends(_get_service),
) -> list[ReportResponse]:
    """Retrieve a paginated list of all reports.

    Args:
        limit: Maximum number of reports to return.
        offset: Number of reports to skip.
        service: Injected report service.

    Returns:
        List of report objects.
    """
    reports = service.list_reports(limit=limit, offset=offset)
    return [ReportResponse.model_validate(r) for r in reports]
