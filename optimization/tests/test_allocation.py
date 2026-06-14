"""Tests for resource allocation and shelter balancing."""

from __future__ import annotations

from optimization.engine.allocation import (
    IncidentInput,
    ShelterInput,
    UnitInput,
    allocate_resources,
    balance_shelters,
)


def test_allocation_prioritizes_p0() -> None:
    units = [
        UnitInput("alpha", 12.9352, 77.6245, "Boat Team", 6),
        UnitInput("bravo", 12.9756, 77.6068, "Boat Team", 6),
    ]
    incidents = [
        IncidentInput("p3", 12.9700, 77.6400, "P3", 10),
        IncidentInput("p0", 12.9360, 77.6250, "P0", 95),
    ]
    result = allocate_resources(units, incidents)
    assert len(result) == 2
    # P0 must be first after sorting.
    assert result[0].incident_id == "p0"
    # Closest unit (alpha) should serve the nearby P0 incident.
    assert result[0].unit_id == "alpha"
    assert "P0" in result[0].reasoning
    assert result[0].eta_minutes >= 0


def test_allocation_more_units_than_incidents() -> None:
    units = [
        UnitInput("u1", 12.93, 77.62, "Boat Team", 6),
        UnitInput("u2", 12.94, 77.63, "Boat Team", 6),
        UnitInput("u3", 12.95, 77.64, "Boat Team", 6),
    ]
    incidents = [IncidentInput("i1", 12.935, 77.625, "P1", 50)]
    result = allocate_resources(units, incidents)
    assert len(result) == 1
    assert result[0].incident_id == "i1"


def test_allocation_more_incidents_than_units() -> None:
    units = [UnitInput("u1", 12.93, 77.62, "Boat Team", 6)]
    incidents = [
        IncidentInput("i_p2", 12.99, 77.70, "P2", 30),
        IncidentInput("i_p0", 12.931, 77.621, "P0", 99),
    ]
    result = allocate_resources(units, incidents)
    assert len(result) == 1
    # The single unit should be assigned to the high-priority nearby P0.
    assert result[0].incident_id == "i_p0"


def test_allocation_empty_inputs() -> None:
    assert allocate_resources([], []) == []
    assert allocate_resources([UnitInput("u", 12.9, 77.6, "x", 1)], []) == []


def test_shelter_balancing_flags_near_full_with_redirect() -> None:
    shelters = [
        ShelterInput("s_full", "Hall A", capacity=100, current_occupancy=96, risk_score=0.7),
        ShelterInput("s_low", "Hall B", capacity=100, current_occupancy=10, risk_score=0.1),
    ]
    advice = balance_shelters(shelters, arrival_rate_per_min=2.0)
    # Highest overflow risk first.
    assert advice[0].shelter_id == "s_full"
    top = advice[0]
    assert top.occupancy_ratio == 0.96
    assert 0.0 <= top.overflow_risk <= 1.0
    assert "Hall B" in top.recommendation  # redirect to lowest-occupancy shelter
    # remaining 4 / 2 per min = 2 min.
    assert top.time_to_saturation_min == 2.0


def test_shelter_full_has_no_saturation_time() -> None:
    shelters = [
        ShelterInput("s", "Full Hall", capacity=50, current_occupancy=50, risk_score=0.5),
        ShelterInput("s2", "Open Hall", capacity=50, current_occupancy=5, risk_score=0.1),
    ]
    advice = balance_shelters(shelters)
    full = next(a for a in advice if a.shelter_id == "s")
    assert full.time_to_saturation_min is None
    assert full.occupancy_ratio == 1.0


def test_shelter_no_arrivals_means_no_saturation() -> None:
    shelters = [ShelterInput("s", "Hall", capacity=100, current_occupancy=50, risk_score=0.2)]
    advice = balance_shelters(shelters, arrival_rate_per_min=0.0)
    assert advice[0].time_to_saturation_min is None
