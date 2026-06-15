"""Tests for the predictive escalation (risk zone) service."""

from sqlalchemy.orm import Session

from app.services.prediction.escalation import PredictionService


def test_risk_zones_empty_when_no_incidents(db_session: Session) -> None:
    zones = PredictionService(db_session).risk_zones()
    assert zones == []


def test_risk_zones_returns_zones_for_seeded_incidents(
    seeded_db: Session,
) -> None:
    zones = PredictionService(seeded_db).risk_zones()
    assert zones, "expected at least one risk zone from active incidents"


def test_risk_score_within_bounds(seeded_db: Session) -> None:
    zones = PredictionService(seeded_db).risk_zones()
    for zone in zones:
        assert 0.0 <= zone.risk_score <= 100.0
        assert 0.0 <= zone.predicted_risk_score <= 100.0
        assert 0.0 <= zone.escalation_probability <= 1.0
        assert zone.incident_count >= 1


def test_risk_zones_sorted_by_risk_descending(seeded_db: Session) -> None:
    zones = PredictionService(seeded_db).risk_zones()
    scores = [z.risk_score for z in zones]
    assert scores == sorted(scores, reverse=True)


def test_risk_zone_reasoning_is_non_empty(seeded_db: Session) -> None:
    zones = PredictionService(seeded_db).risk_zones()
    for zone in zones:
        assert isinstance(zone.reasoning, str)
        assert zone.reasoning.strip()


def test_predicted_risk_at_least_current_risk(seeded_db: Session) -> None:
    zones = PredictionService(seeded_db).risk_zones()
    for zone in zones:
        assert zone.predicted_risk_score >= zone.risk_score
