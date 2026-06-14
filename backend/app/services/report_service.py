"""Report service — business logic for citizen reports.

Handles report creation (with AI triage + incident fusion) and listing,
delegating persistence to the repository layer and broadcasting real-time
events to connected operators.
"""

import logging
import uuid

from app.models.report import Report
from app.repositories.report_repository import ReportRepository
from app.schemas.report import ReportCreate
from app.services.events import (
    EVENT_INCIDENT_CREATED,
    EVENT_INCIDENT_UPDATED,
    EVENT_REPORT_CREATED,
    publish_event,
)
from app.services.triage.service import TriageService

logger = logging.getLogger(__name__)


class ReportService:
    """Business logic for citizen report operations."""

    def __init__(self, repository: ReportRepository) -> None:
        self.repository = repository

    def create_report(self, data: ReportCreate) -> Report:
        """Create a report, triage it, and fuse it into an incident.

        Args:
            data: Validated report creation data.

        Returns:
            The created (and triaged) report entity.
        """
        report = Report(
            text=data.text,
            latitude=data.latitude,
            longitude=data.longitude,
            source=data.source,
            status="pending",
        )
        created = self.repository.create(report)
        logger.info("Report created: id=%s", created.id)
        publish_event(
            EVENT_REPORT_CREATED,
            {"report_id": str(created.id), "text": created.text},
        )
        self._triage(created)
        return created

    def _triage(self, report: Report) -> None:
        """Run triage + fusion and broadcast the resulting incident event."""
        outcome = TriageService(self.repository.db).triage_report(report)
        event = (
            EVENT_INCIDENT_CREATED
            if outcome.incident_created
            else EVENT_INCIDENT_UPDATED
        )
        publish_event(event, {
            "incident_id": str(outcome.incident.id),
            "severity": outcome.incident.severity,
            "priority_score": outcome.incident.priority_score,
            "reasoning": outcome.triage.reasoning,
        })

    def list_reports(self, limit: int = 100, offset: int = 0) -> list[Report]:
        """Retrieve a paginated list of reports.

        Args:
            limit: Maximum number of reports to return.
            offset: Number of reports to skip.

        Returns:
            List of report entities.
        """
        return self.repository.get_all(limit=limit, offset=offset)

    def get_report(self, report_id: str) -> Report | None:
        """Retrieve a single report by ID.

        Args:
            report_id: UUID string of the report.

        Returns:
            Report if found, None otherwise.
        """
        return self.repository.get_by_id(uuid.UUID(report_id))
