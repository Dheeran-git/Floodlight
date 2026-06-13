"""Report service — business logic for citizen reports.

Handles report creation, listing, and delegates to the repository layer.
AI triage integration will be added in Phase 5.
"""

import logging

from app.models.report import Report
from app.repositories.report_repository import ReportRepository
from app.schemas.report import ReportCreate

logger = logging.getLogger(__name__)


class ReportService:
    """Business logic for citizen report operations."""

    def __init__(self, repository: ReportRepository) -> None:
        self.repository = repository

    def create_report(self, data: ReportCreate) -> Report:
        """Create a new citizen report.

        Creates the report with 'pending' status. AI triage
        will be triggered separately in Phase 5.

        Args:
            data: Validated report creation data.

        Returns:
            The created report entity.
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
        return created

    def list_reports(
        self, limit: int = 100, offset: int = 0
    ) -> list[Report]:
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
        import uuid

        return self.repository.get_by_id(uuid.UUID(report_id))
