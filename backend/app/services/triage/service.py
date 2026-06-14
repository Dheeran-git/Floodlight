"""Triage orchestration — classify a report, persist results, fuse incidents."""

import logging
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.models.report import Report
from app.services.triage.classifier import TriageResult, classify
from app.services.triage.fusion import fuse_report

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class TriageOutcome:
    """Result of triaging and fusing a single report."""

    report: Report
    incident: Incident
    triage: TriageResult
    incident_created: bool


class TriageService:
    """Runs the triage pipeline for incoming reports."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def triage_report(self, report: Report) -> TriageOutcome:
        """Classify a report, store the result, and fuse it into an incident.

        Args:
            report: The newly created report to process.

        Returns:
            A TriageOutcome describing the classification and fused incident.
        """
        result = classify(report.text)
        report.severity = result.severity
        report.credibility = result.credibility
        report.status = "triaged"
        self.db.commit()

        report_id = report.id
        incident, created = fuse_report(self.db, report)
        logger.info(
            "Triaged report %s → %s (%s)",
            report_id, result.severity, result.category,
        )
        return TriageOutcome(
            report=report,
            incident=incident,
            triage=result,
            incident_created=created,
        )
