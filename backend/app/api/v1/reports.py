"""Reports API endpoints.

Matches API_SPEC.md:
- POST /reports — Create a new citizen report
- POST /reports/voice — Create a report from a voice recording
- GET /reports — Retrieve all reports
"""

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.report_repository import ReportRepository
from app.schemas.report import ReportCreate, ReportCreateResponse, ReportResponse
from app.services.report_service import ReportService
from app.services.triage.transcription import transcribe, transcription_available

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


@router.post("/voice", response_model=ReportCreateResponse, status_code=201)
def create_voice_report(
    latitude: float = Form(...),
    longitude: float = Form(...),
    audio: UploadFile = File(...),
    service: ReportService = Depends(_get_service),
) -> ReportCreateResponse:
    """Create a report from a voice recording.

    Transcribes the uploaded audio with Whisper, then runs the standard
    triage pipeline. Returns 503 if transcription is not configured.

    Args:
        latitude: GPS latitude of the report.
        longitude: GPS longitude of the report.
        audio: Uploaded audio file.
        service: Injected report service.

    Returns:
        Success response with the new report ID.

    Raises:
        HTTPException: 503 if transcription is unavailable, 422 if empty.
    """
    if not transcription_available():
        raise HTTPException(
            status_code=503,
            detail="Voice transcription is not configured (set WHISPER_API_KEY).",
        )
    text = transcribe(audio.file.read(), filename=audio.filename or "audio.webm")
    if not text:
        raise HTTPException(status_code=422, detail="Could not transcribe audio.")
    report = service.create_report(
        ReportCreate(text=text, latitude=latitude, longitude=longitude,
                     source="voice_app")
    )
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
