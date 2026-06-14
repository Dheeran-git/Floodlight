"""Tests for the optimization service output shape and persistence."""

from sqlalchemy.orm import Session

from app.models.route import Route
from app.services.optimization_service import OptimizationService


def test_trigger_run_produces_reasoned_deployment_plan(
    seeded_db: Session,
) -> None:
    run = OptimizationService(seeded_db).trigger_run()

    assert run.id is not None
    assert run.algorithm == "networkx+scipy"

    plan = run.result["deployment_plan"]
    assert isinstance(plan, list)
    assert plan, "expected at least one assignment for seeded data"
    for entry in plan:
        assert entry["unit_id"]
        assert entry["incident_id"]
        assert isinstance(entry["reasoning"], str)
        assert entry["reasoning"].strip()
        assert entry["distance_km"] >= 0
        assert entry["eta_minutes"] >= 0


def test_trigger_run_includes_shelter_advice(seeded_db: Session) -> None:
    run = OptimizationService(seeded_db).trigger_run()
    advice = run.result["shelter_advice"]
    assert isinstance(advice, list)
    assert advice
    for item in advice:
        assert 0.0 <= item["occupancy_ratio"] <= 2.0
        assert 0.0 <= item["overflow_risk"] <= 1.0
        assert item["recommendation"]


def test_trigger_run_summary_counts(seeded_db: Session) -> None:
    run = OptimizationService(seeded_db).trigger_run()
    summary = run.result["summary"]
    assert summary["incidents"] == 4
    # Three seeded units are "available".
    assert summary["available_units"] == 3
    assert summary["assignments"] == len(run.result["deployment_plan"])


def test_trigger_run_persists_routes(seeded_db: Session) -> None:
    OptimizationService(seeded_db).trigger_run()
    routes = seeded_db.query(Route).all()
    assert routes
    for route in routes:
        assert route.status == "planned"
        assert route.distance >= 0


def test_get_result_returns_stored_run(seeded_db: Session) -> None:
    service = OptimizationService(seeded_db)
    run = service.trigger_run()
    fetched = service.get_result(run.id)
    assert fetched is not None
    assert fetched.id == run.id


def test_trigger_run_with_empty_db_yields_empty_plan(
    db_session: Session,
) -> None:
    run = OptimizationService(db_session).trigger_run()
    assert run.result["deployment_plan"] == []
