"""End-to-end flow: citizen report -> incident -> optimization -> dispatch."""

from fastapi.testclient import TestClient

from app.services.simulation_service import SimulationService

PREFIX = "/api/v1"


def test_report_to_incident_to_optimization_to_dispatch(
    seeded_client: TestClient,
) -> None:
    # 1. Citizen submits a life-threatening report.
    create = seeded_client.post(
        f"{PREFIX}/reports",
        json={
            "text": "Family trapped on rooftop, water rising fast in Whitefield.",
            "latitude": 12.9698,
            "longitude": 77.7500,
        },
    )
    assert create.status_code == 201

    # 2. An active incident exists (the report fused into one).
    incidents = seeded_client.get(f"{PREFIX}/incidents").json()
    active = [i for i in incidents if i["status"] == "active"]
    assert active

    # 3. Run optimization and fetch the deployment plan.
    run_id = seeded_client.post(f"{PREFIX}/optimization/run").json()["run_id"]
    result = seeded_client.get(f"{PREFIX}/optimization/{run_id}").json()
    plan = result["deployment_plan"]
    assert plan, "optimization should produce a non-empty deployment plan"
    for entry in plan:
        assert entry["unit_id"]
        assert entry["incident_id"]
        assert entry["reasoning"].strip()

    # 4. Dispatch: assign the first planned unit to its incident.
    first = plan[0]
    assign = seeded_client.post(
        f"{PREFIX}/resources/assign",
        json={
            "resource_id": first["unit_id"],
            "incident_id": first["incident_id"],
        },
    )
    assert assign.status_code == 200
    assert assign.json()["success"] is True

    units = seeded_client.get(f"{PREFIX}/resources").json()
    dispatched = next(u for u in units if u["id"] == first["unit_id"])
    assert dispatched["status"] == "assigned"


def test_simulation_drives_full_pipeline(
    seeded_client: TestClient, seeded_db
) -> None:
    # Run the scripted heavy-rain scenario through the live pipeline.
    summary = SimulationService(seeded_db).run_heavy_rain()
    assert summary["reports_created"] == 7

    # Reports were triaged and incidents now exist.
    reports = seeded_client.get(f"{PREFIX}/reports").json()
    assert any(r["severity"] == "P0" for r in reports)

    incidents = seeded_client.get(f"{PREFIX}/incidents").json()
    assert incidents
