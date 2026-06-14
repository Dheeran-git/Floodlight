"""Tests for incident fusion — merging nearby reports into incidents."""

from sqlalchemy.orm import Session

from app.models.incident import Incident, IncidentReport
from app.models.report import Report
from app.services.triage.fusion import FUSION_RADIUS_METERS, fuse_report


def _make_report(
    db: Session, text: str, lat: float, lon: float, severity: str
) -> Report:
    report = Report(
        text=text, latitude=lat, longitude=lon, severity=severity,
        credibility=4, status="triaged",
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def test_first_report_creates_new_incident(db_session: Session) -> None:
    report = _make_report(
        db_session, "Family trapped on rooftop.", 12.9698, 77.7500, "P0"
    )
    incident, created = fuse_report(db_session, report)
    assert created is True
    assert incident.id is not None
    assert incident.severity == "P0"
    assert report.status == "merged"


def test_two_nearby_compatible_reports_merge_into_one_incident(
    db_session: Session,
) -> None:
    first = _make_report(
        db_session, "Family trapped on rooftop.", 12.9698, 77.7500, "P0"
    )
    incident_a, created_a = fuse_report(db_session, first)

    # Second report ~50m away, compatible severity.
    second = _make_report(
        db_session, "Person on submerged car roof nearby.",
        12.9701, 77.7503, "P0",
    )
    incident_b, created_b = fuse_report(db_session, second)

    assert created_a is True
    assert created_b is False
    assert incident_a.id == incident_b.id

    links = db_session.query(IncidentReport).filter(
        IncidentReport.incident_id == incident_a.id
    ).all()
    assert len(links) == 2


def test_far_away_report_creates_separate_incident(
    db_session: Session,
) -> None:
    near = _make_report(
        db_session, "Family trapped on rooftop in Whitefield.",
        12.9698, 77.7500, "P0",
    )
    incident_near, _ = fuse_report(db_session, near)

    # ~14km away in Koramangala — well outside the 500m fusion radius.
    far = _make_report(
        db_session, "Family trapped on rooftop in Koramangala.",
        12.9352, 77.6245, "P0",
    )
    incident_far, created_far = fuse_report(db_session, far)

    assert created_far is True
    assert incident_near.id != incident_far.id
    assert db_session.query(Incident).count() == 2


def test_incompatible_severity_does_not_merge(db_session: Session) -> None:
    p0 = _make_report(
        db_session, "Family trapped on rooftop.", 12.9698, 77.7500, "P0"
    )
    incident_p0, _ = fuse_report(db_session, p0)

    # Same spot but P3 — severity rank differs by 3 (>1), so no merge.
    p3 = _make_report(
        db_session, "Minor waterlogging here.", 12.9698, 77.7500, "P3"
    )
    incident_p3, created = fuse_report(db_session, p3)

    assert created is True
    assert incident_p0.id != incident_p3.id


def test_priority_score_recomputed_after_merge(db_session: Session) -> None:
    first = _make_report(
        db_session, "Family trapped on rooftop.", 12.9698, 77.7500, "P0"
    )
    incident, _ = fuse_report(db_session, first)
    base_score = incident.priority_score

    second = _make_report(
        db_session, "Another person trapped nearby.", 12.9700, 77.7502, "P0"
    )
    incident, _ = fuse_report(db_session, second)

    # Score grows with linked report count (capped at 100).
    assert incident.priority_score >= base_score
    assert incident.priority_score <= 100


def test_fusion_radius_constant_is_sane() -> None:
    assert FUSION_RADIUS_METERS == 500.0
