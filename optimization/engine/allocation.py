"""Resource allocation algorithms.

Min-cost assignment of rescue units to incidents (severity-weighted proximity)
and shelter load balancing with overflow-risk and saturation estimates.
"""

from __future__ import annotations

from dataclasses import dataclass

from scipy.optimize import linear_sum_assignment

from optimization.engine.graph import haversine_km

SEVERITY_LABEL: dict[str, str] = {
    "P0": "immediate life threat",
    "P1": "urgent",
    "P2": "moderate",
    "P3": "low",
}
# Severity must dominate proximity: a more severe incident is always preferred
# over a less severe one, regardless of distance. Distance only breaks ties
# within the same severity tier. The scale exceeds any plausible intra-city
# distance (km), so one severity level outweighs any distance difference.
_SEVERITY_TIER: dict[str, int] = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}
_PRIORITY_SCALE = 100_000.0


@dataclass(frozen=True)
class UnitInput:
    """An available rescue unit."""

    id: str
    lat: float
    lon: float
    type: str
    capacity: int


@dataclass(frozen=True)
class IncidentInput:
    """An active incident needing a unit."""

    id: str
    lat: float
    lon: float
    severity: str  # "P0".."P3"
    priority_score: int


@dataclass(frozen=True)
class Assignment:
    """A unit-to-incident pairing with rationale."""

    unit_id: str
    incident_id: str
    distance_km: float
    eta_minutes: int
    reasoning: str  # human-readable WHY this unit->incident (severity + proximity)


def _severity_rank(severity: str) -> int:
    """Sort rank: P0 -> 0, P1 -> 1, ... so P0 sorts first."""
    order = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}
    return order.get(severity, 99)


def allocate_resources(
    units: list[UnitInput],
    incidents: list[IncidentInput],
    speed_kmh: float = 30.0,
) -> list[Assignment]:
    """Min-cost assignment of units to incidents via Hungarian algorithm.

    Cost[u][i] = severity_tier(incident) * SCALE + haversine_km(unit, incident),
    where SCALE exceeds any intra-city distance. Severity therefore dominates:
    a P0 incident is always served before a less severe one regardless of
    distance, with proximity breaking ties within a severity tier. Non-square
    matrices (unequal counts) are handled — only real pairings are returned.
    Results are sorted by incident severity (P0 first) then distance.
    """
    if not units or not incidents:
        return []

    cost: list[list[float]] = [
        [
            _SEVERITY_TIER.get(inc.severity, 3) * _PRIORITY_SCALE
            + haversine_km(u.lat, u.lon, inc.lat, inc.lon)
            for inc in incidents
        ]
        for u in units
    ]

    row_ind, col_ind = linear_sum_assignment(cost)

    assignments: list[Assignment] = []
    for r, c in zip(row_ind, col_ind, strict=True):
        unit = units[r]
        incident = incidents[c]
        distance_km = haversine_km(unit.lat, unit.lon, incident.lat, incident.lon)
        eta_minutes = round(distance_km / speed_kmh * 60) if speed_kmh > 0 else 0
        label = SEVERITY_LABEL.get(incident.severity, "incident")
        reasoning = (
            f"{unit.type} {unit.id} -> {incident.severity} incident: assigned "
            f"at {distance_km:.1f} km (ETA {eta_minutes} min); "
            f"{incident.severity} prioritized for {label} ahead of lower-severity "
            f"incidents."
        )
        assignments.append(
            Assignment(
                unit_id=unit.id,
                incident_id=incident.id,
                distance_km=distance_km,
                eta_minutes=eta_minutes,
                reasoning=reasoning,
            )
        )

    incident_by_id = {inc.id: inc for inc in incidents}
    assignments.sort(
        key=lambda a: (_severity_rank(incident_by_id[a.incident_id].severity), a.distance_km)
    )
    return assignments


@dataclass(frozen=True)
class ShelterInput:
    """Current state of a shelter."""

    id: str
    name: str
    capacity: int
    current_occupancy: int
    risk_score: float


@dataclass(frozen=True)
class ShelterAdvice:
    """Computed advice for one shelter."""

    shelter_id: str
    name: str
    occupancy_ratio: float
    overflow_risk: float  # 0..1
    time_to_saturation_min: float | None  # None if not filling / already full
    recommendation: str


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    """Clamp a value into [low, high]."""
    return max(low, min(high, value))


def balance_shelters(
    shelters: list[ShelterInput],
    arrival_rate_per_min: float = 1.0,
) -> list[ShelterAdvice]:
    """Compute occupancy, overflow risk, saturation ETA, and advice per shelter.

    occupancy_ratio = occupancy / capacity. overflow_risk =
    clamp(0.6*ratio + 0.4*risk_score). time_to_saturation_min =
    remaining_capacity / arrival_rate_per_min (None if full or no arrivals).
    Recommendations redirect arrivals to the lowest-occupancy shelter. Sorted by
    overflow_risk descending.
    """
    if not shelters:
        return []

    def _ratio(s: ShelterInput) -> float:
        return (s.current_occupancy / s.capacity) if s.capacity > 0 else 1.0

    redirect_target = min(shelters, key=_ratio)
    # Only safe to redirect arrivals if the emptiest shelter has real headroom.
    system_overflow = _ratio(redirect_target) >= 0.9

    advice: list[ShelterAdvice] = []
    for s in shelters:
        ratio = _ratio(s)
        overflow_risk = _clamp(0.6 * ratio + 0.4 * s.risk_score)
        remaining = s.capacity - s.current_occupancy
        if remaining <= 0 or arrival_rate_per_min <= 0:
            time_to_saturation: float | None = None
        else:
            time_to_saturation = remaining / arrival_rate_per_min

        advice.append(
            ShelterAdvice(
                shelter_id=s.id,
                name=s.name,
                occupancy_ratio=ratio,
                overflow_risk=overflow_risk,
                time_to_saturation_min=time_to_saturation,
                recommendation=_shelter_recommendation(
                    s, ratio, redirect_target, system_overflow
                ),
            )
        )

    advice.sort(key=lambda a: a.overflow_risk, reverse=True)
    return advice


def _shelter_recommendation(
    shelter: ShelterInput,
    ratio: float,
    redirect_target: ShelterInput,
    system_overflow: bool,
) -> str:
    """Build an actionable recommendation for one shelter."""
    pct = round(ratio * 100)
    if system_overflow and ratio >= 0.9:
        return (
            f"At {pct}%; all shelters near capacity — escalate for additional "
            f"shelter capacity, do not redirect."
        )
    if ratio >= 1.0:
        return (
            f"At capacity ({pct}%); stop intake and redirect new arrivals to "
            f"{redirect_target.name}."
        )
    if ratio >= 0.9 and shelter.id != redirect_target.id:
        return (
            f"Near capacity ({pct}%); redirect new arrivals to "
            f"{redirect_target.name}."
        )
    if shelter.id == redirect_target.id:
        return (
            f"Lowest occupancy ({pct}%); accept redirected arrivals from fuller "
            f"shelters."
        )
    return f"Stable ({pct}%); continue accepting arrivals."
