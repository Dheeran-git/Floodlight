"""Service-layer integration tests for the report/triage pipeline."""

from sqlalchemy.orm import Session

from app.models.report import Report
from app.repositories.report_repository import ReportRepository
from app.schemas.report import ReportCreate
from app.services.report_service import ReportService
from app.services.triage.service import TriageOutcome, TriageService


def test_triage_service_sets_severity_and_fuses(db_session: Session) -> None:
    report = Report(
        text="Family trapped on rooftop, water rising fast.",
        latitude=12.9698, longitude=77.7500, status="pending",
    )
    db_session.add(report)
    db_session.commit()
    db_session.refresh(report)

    outcome = TriageService(db_session).triage_report(report)

    assert isinstance(outcome, TriageOutcome)
    assert outcome.report.severity == "P0"
    assert 1 <= outcome.report.credibility <= 5
    assert outcome.incident.id is not None
    assert outcome.incident_created is True


def test_report_service_creates_triaged_report(db_session: Session) -> None:
    service = ReportService(repository=ReportRepository(db_session))
    report = service.create_report(
        ReportCreate(
            text="Underpass fully flooded, vehicles stuck.",
            latitude=12.9548, longitude=77.6998,
        )
    )
    assert report.id is not None
    assert report.severity == "P2"
    # After triage + fusion the report is merged into an incident.
    assert report.status == "merged"


def test_report_service_lists_created_reports(db_session: Session) -> None:
    service = ReportService(repository=ReportRepository(db_session))
    service.create_report(
        ReportCreate(text="Minor waterlogging, traffic slow.",
                     latitude=13.0355, longitude=77.5975)
    )
    service.create_report(
        ReportCreate(text="Drain overflow on service road.",
                     latitude=12.9120, longitude=77.6450)
    )
    reports = service.list_reports()
    assert len(reports) == 2


def test_report_service_get_by_id(db_session: Session) -> None:
    service = ReportService(repository=ReportRepository(db_session))
    created = service.create_report(
        ReportCreate(text="Family trapped on rooftop.",
                     latitude=12.9698, longitude=77.7500)
    )
    fetched = service.get_report(str(created.id))
    assert fetched is not None
    assert fetched.id == created.id
