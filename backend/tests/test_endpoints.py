"""Endpoint smoke and integration tests.

Exercises every GET/POST route through the FastAPI TestClient, asserting
expected status codes and schema-shaped JSON. The API is mounted at /api/v1.
"""

import io

from fastapi.testclient import TestClient

PREFIX = "/api/v1"


# --- Health ---------------------------------------------------------------

def test_health_returns_healthy(client: TestClient) -> None:
    resp = client.get(f"{PREFIX}/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "healthy"}


# --- Reports --------------------------------------------------------------

def test_create_report_returns_201_and_id(client: TestClient) -> None:
    resp = client.post(
        f"{PREFIX}/reports",
        json={
            "text": "Family trapped on rooftop, water rising fast.",
            "latitude": 12.9698,
            "longitude": 77.7500,
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["success"] is True
    assert body["report_id"]


def test_create_report_stores_and_triages_report(client: TestClient) -> None:
    create = client.post(
        f"{PREFIX}/reports",
        json={
            "text": "Family trapped on rooftop, water rising fast.",
            "latitude": 12.9698,
            "longitude": 77.7500,
        },
    )
    report_id = create.json()["report_id"]

    listing = client.get(f"{PREFIX}/reports")
    assert listing.status_code == 200
    reports = listing.json()
    stored = next(r for r in reports if r["id"] == report_id)
    # Triage ran: severity set and status progressed past "pending".
    assert stored["severity"] == "P0"
    assert stored["status"] != "pending"


def test_create_report_validation_error(client: TestClient) -> None:
    resp = client.post(
        f"{PREFIX}/reports",
        json={"text": "", "latitude": 12.0, "longitude": 77.0},
    )
    assert resp.status_code == 422


def test_list_reports_returns_list(client: TestClient) -> None:
    resp = client.get(f"{PREFIX}/reports")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_voice_report_without_key_returns_503(client: TestClient) -> None:
    resp = client.post(
        f"{PREFIX}/reports/voice",
        data={"latitude": 12.97, "longitude": 77.75},
        files={"audio": ("clip.webm", io.BytesIO(b"fake-audio"), "audio/webm")},
    )
    assert resp.status_code == 503


# --- Incidents ------------------------------------------------------------

def test_list_incidents_returns_list(seeded_client: TestClient) -> None:
    resp = seeded_client.get(f"{PREFIX}/incidents")
    assert resp.status_code == 200
    incidents = resp.json()
    assert len(incidents) == 4
    first = incidents[0]
    for key in ("id", "title", "severity", "priority_score", "status"):
        assert key in first


def test_get_incident_detail(seeded_client: TestClient) -> None:
    incident_id = seeded_client.get(f"{PREFIX}/incidents").json()[0]["id"]
    resp = seeded_client.get(f"{PREFIX}/incidents/{incident_id}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == incident_id
    assert "reports" in body


def test_get_missing_incident_returns_404(client: TestClient) -> None:
    missing = "00000000-0000-0000-0000-000000000000"
    resp = client.get(f"{PREFIX}/incidents/{missing}")
    assert resp.status_code == 404


# --- Resources ------------------------------------------------------------

def test_list_resources_returns_list(seeded_client: TestClient) -> None:
    resp = seeded_client.get(f"{PREFIX}/resources")
    assert resp.status_code == 200
    units = resp.json()
    assert len(units) == 5
    for key in ("id", "name", "type", "status", "capacity"):
        assert key in units[0]


def test_assign_resource_flips_status_to_assigned(
    seeded_client: TestClient,
) -> None:
    units = seeded_client.get(f"{PREFIX}/resources").json()
    available = next(u for u in units if u["status"] == "available")
    incident_id = seeded_client.get(f"{PREFIX}/incidents").json()[0]["id"]

    resp = seeded_client.post(
        f"{PREFIX}/resources/assign",
        json={"resource_id": available["id"], "incident_id": incident_id},
    )
    assert resp.status_code == 200
    assert resp.json()["success"] is True

    refreshed = seeded_client.get(f"{PREFIX}/resources").json()
    updated = next(u for u in refreshed if u["id"] == available["id"])
    assert updated["status"] == "assigned"


def test_assign_missing_resource_returns_404(seeded_client: TestClient) -> None:
    missing = "00000000-0000-0000-0000-000000000000"
    incident_id = seeded_client.get(f"{PREFIX}/incidents").json()[0]["id"]
    resp = seeded_client.post(
        f"{PREFIX}/resources/assign",
        json={"resource_id": missing, "incident_id": incident_id},
    )
    assert resp.status_code == 404


# --- Shelters -------------------------------------------------------------

def test_list_shelters_returns_list(seeded_client: TestClient) -> None:
    resp = seeded_client.get(f"{PREFIX}/shelters")
    assert resp.status_code == 200
    shelters = resp.json()
    assert len(shelters) == 5
    for key in ("id", "name", "capacity", "current_occupancy", "risk_score"):
        assert key in shelters[0]


def test_shelter_risk_sorted_descending(seeded_client: TestClient) -> None:
    resp = seeded_client.get(f"{PREFIX}/shelters/risk")
    assert resp.status_code == 200
    risks = resp.json()
    assert risks
    probs = [r["overflow_probability"] for r in risks]
    assert probs == sorted(probs, reverse=True)


# --- Optimization ---------------------------------------------------------

def test_optimization_run_and_get_result(seeded_client: TestClient) -> None:
    run = seeded_client.post(f"{PREFIX}/optimization/run")
    assert run.status_code == 200
    run_id = run.json()["run_id"]

    result = seeded_client.get(f"{PREFIX}/optimization/{run_id}")
    assert result.status_code == 200
    body = result.json()
    assert body["id"] == run_id
    assert isinstance(body["deployment_plan"], list)


def test_get_missing_optimization_run_returns_404(client: TestClient) -> None:
    missing = "00000000-0000-0000-0000-000000000000"
    resp = client.get(f"{PREFIX}/optimization/{missing}")
    assert resp.status_code == 404


# --- Prediction -----------------------------------------------------------

def test_prediction_risk_returns_zones(seeded_client: TestClient) -> None:
    resp = seeded_client.get(f"{PREFIX}/prediction/risk")
    assert resp.status_code == 200
    zones = resp.json()
    assert isinstance(zones, list)
    assert zones
    for key in ("center_lat", "risk_score", "incident_count", "reasoning"):
        assert key in zones[0]


# --- Command --------------------------------------------------------------

def test_command_query_returns_answer(seeded_client: TestClient) -> None:
    resp = seeded_client.post(
        f"{PREFIX}/command/query",
        json={"query": "What is the highest-risk area?"},
    )
    assert resp.status_code == 200
    assert resp.json()["answer"].strip()


def test_command_query_validation_error(client: TestClient) -> None:
    resp = client.post(f"{PREFIX}/command/query", json={"query": ""})
    assert resp.status_code == 422


# --- Simulation -----------------------------------------------------------

def test_simulation_run_injects_reports(client: TestClient) -> None:
    resp = client.post(f"{PREFIX}/simulation/run")
    assert resp.status_code == 200
    body = resp.json()
    assert body["scenario"] == "heavy_rain"
    assert body["reports_created"] == 7
    assert len(body["report_ids"]) == 7
