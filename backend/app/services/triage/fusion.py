"""Incident fusion — merge nearby reports into operational incidents.

Reports within a proximity radius of an existing active incident are linked to
it; otherwise a new incident is created. Keeps the operational picture free of
duplicate markers for the same real-world event.
"""

import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.incident import Incident, IncidentReport
from app.models.report import Report
from app.utils.geo import meters_between

logger = logging.getLogger(__name__)

# Reports within this distance of an incident are treated as the same event.
FUSION_RADIUS_METERS = 500.0

_SEVERITY_BASE = {"P0": 90, "P1": 70, "P2": 50, "P3": 30}
_SEVERITY_RANK = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}


def fuse_report(db: Session, report: Report) -> tuple[Incident, bool]:
    """Link a triaged report to a nearby incident, or create a new one.

    Args:
        db: Active database session.
        report: A report that has already been triaged (severity set).

    Returns:
        A tuple of (incident, created) where ``created`` is True if a new
        incident was opened for this report rather than reusing an existing one.
    """
    incident = _find_matching_incident(db, report)
    created = incident is None
    if incident is None:
        incident = _create_incident(db, report)
    _link_report(db, incident, report)
    _recompute_priority(db, incident)
    report.status = "merged"
    db.commit()
    db.refresh(incident)
    logger.info("Report %s fused into incident %s", report.id, incident.id)
    return incident, created


def _find_matching_incident(db: Session, report: Report) -> Incident | None:
    """Return the nearest active incident within the fusion radius, if any."""
    stmt = select(Incident).where(Incident.status == "active")
    active = list(db.execute(stmt).scalars().all())

    best: Incident | None = None
    best_distance = FUSION_RADIUS_METERS
    for incident in active:
        if not _severity_compatible(report.severity, incident.severity):
            continue
        distance = meters_between(
            report.latitude, report.longitude,
            incident.latitude, incident.longitude,
        )
        if distance <= best_distance:
            best = incident
            best_distance = distance
    return best


def _severity_compatible(report_sev: str | None, incident_sev: str) -> bool:
    """Allow fusion when severities are within one level of each other."""
    if report_sev is None:
        return False
    return abs(_SEVERITY_RANK[report_sev] - _SEVERITY_RANK[incident_sev]) <= 1


def _create_incident(db: Session, report: Report) -> Incident:
    """Create a new incident seeded from a report."""
    severity = report.severity or "P3"
    incident = Incident(
        title=_title_for(report),
        description=report.text[:255],
        severity=severity,
        priority_score=_SEVERITY_BASE.get(severity, 30),
        status="active",
        latitude=report.latitude,
        longitude=report.longitude,
    )
    db.add(incident)
    db.flush()
    return incident


def _title_for(report: Report) -> str:
    """Derive a short incident title from the report text."""
    snippet = report.text.strip().split(".")[0]
    return (snippet[:80] or "Flood incident").strip()


def _link_report(db: Session, incident: Incident, report: Report) -> None:
    """Create the incident↔report association if not already present."""
    existing = db.get(IncidentReport, (incident.id, report.id))
    if existing is None:
        db.add(IncidentReport(incident_id=incident.id, report_id=report.id))
        db.flush()


def _recompute_priority(db: Session, incident: Incident) -> None:
    """Raise incident severity/priority based on linked reports."""
    stmt = (
        select(Report)
        .join(IncidentReport, IncidentReport.report_id == Report.id)
        .where(IncidentReport.incident_id == incident.id)
    )
    reports = list(db.execute(stmt).scalars().all())
    severities = [r.severity for r in reports if r.severity]
    if severities:
        incident.severity = min(severities, key=lambda s: _SEVERITY_RANK[s])
    base = _SEVERITY_BASE.get(incident.severity, 30)
    incident.priority_score = min(base + 2 * len(reports), 100)
