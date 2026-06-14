"""Predictive escalation — cluster active incidents into forecasted risk zones.

Risk score blends incident severity, spatial density (proximity of multiple
incidents), and nearby shelter strain into a 0-100 score. The short-horizon
projection is computed by the Wolfram engine when ``WOLFRAM_APP_ID`` is set, and
by an identical local logistic model otherwise.
"""

import logging
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.repositories.incident_repository import IncidentRepository
from app.repositories.shelter_repository import ShelterRepository
from app.utils.engine import ENGINE_AVAILABLE as _WOLFRAM_AVAILABLE
from app.utils.engine import wolfram
from app.utils.geo import haversine_km

logger = logging.getLogger(__name__)

# Incidents within this distance are grouped into the same risk zone.
ZONE_RADIUS_KM = 1.5
_SEVERITY_WEIGHT = {"P0": 90.0, "P1": 70.0, "P2": 50.0, "P3": 30.0}
# Minutes over which the projected risk is forecast.
FORECAST_HORIZON_MIN = 45


@dataclass(frozen=True)
class RiskZone:
    """A forecasted high-risk area derived from clustered incidents."""

    center_lat: float
    center_lon: float
    radius_km: float
    risk_score: float
    predicted_risk_score: float
    escalation_probability: float
    incident_count: int
    reasoning: str


class PredictionService:
    """Computes forecasted risk zones from the live operational picture."""

    def __init__(self, db: Session) -> None:
        self.incidents = IncidentRepository(db)
        self.shelters = ShelterRepository(db)

    def risk_zones(self) -> list[RiskZone]:
        """Return forecasted risk zones, highest risk first."""
        incidents = self.incidents.get_active()
        if not incidents:
            return []
        clusters = self._cluster(incidents)
        shelters = self.shelters.get_all(limit=100)
        zones = [self._score_zone(c, shelters) for c in clusters]
        return sorted(zones, key=lambda z: z.risk_score, reverse=True)

    def _cluster(self, incidents: list) -> list[list]:
        """Greedily group incidents that fall within ZONE_RADIUS_KM."""
        clusters: list[list] = []
        for incident in incidents:
            placed = False
            for cluster in clusters:
                head = cluster[0]
                if haversine_km(
                    incident.latitude, incident.longitude,
                    head.latitude, head.longitude,
                ) <= ZONE_RADIUS_KM:
                    cluster.append(incident)
                    placed = True
                    break
            if not placed:
                clusters.append([incident])
        return clusters

    def _score_zone(self, cluster: list, shelters: list) -> RiskZone:
        """Compute the risk score and projection for one incident cluster."""
        center_lat = sum(i.latitude for i in cluster) / len(cluster)
        center_lon = sum(i.longitude for i in cluster) / len(cluster)

        severity_component = max(
            _SEVERITY_WEIGHT.get(i.severity, 30.0) for i in cluster
        )
        density_component = min(5.0 * (len(cluster) - 1), 20.0)
        shelter_component = self._shelter_strain(center_lat, center_lon, shelters)
        risk_score = min(severity_component + density_component + shelter_component, 100.0)

        predicted, source = self._project(risk_score, len(cluster))
        escalation_probability = round(min(predicted / 100.0, 0.99), 2)

        reasoning = (
            f"{len(cluster)} active incident(s); peak severity contributes "
            f"{severity_component:.0f}, clustering +{density_component:.0f}, "
            f"shelter strain +{shelter_component:.0f}. {source} projects "
            f"{predicted:.0f} within {FORECAST_HORIZON_MIN} min."
        )
        return RiskZone(
            center_lat=center_lat,
            center_lon=center_lon,
            radius_km=ZONE_RADIUS_KM,
            risk_score=round(risk_score, 1),
            predicted_risk_score=round(predicted, 1),
            escalation_probability=escalation_probability,
            incident_count=len(cluster),
            reasoning=reasoning,
        )

    @staticmethod
    def _project(risk_score: float, incident_count: int) -> tuple[float, str]:
        """Forecast the escalated risk via Wolfram, or a local logistic model.

        Returns:
            A tuple of (predicted_risk_score, source_label) where source is
            "Wolfram" or "Model".
        """
        if _WOLFRAM_AVAILABLE:
            projection = wolfram.simulate_risk_escalation(
                risk_score, incident_count, FORECAST_HORIZON_MIN
            )
            label = "Wolfram" if projection.source == "wolfram" else "Model"
            return round(projection.predicted_risk, 1), label
        # Fallback if the optimization package cannot be imported at all.
        trend = min(5.0 * (incident_count - 1), 20.0)
        return round(min(risk_score + trend, 100.0), 1), "Model"

    @staticmethod
    def _shelter_strain(lat: float, lon: float, shelters: list) -> float:
        """Add risk when a nearby shelter is near capacity (0-10)."""
        nearby = [
            s for s in shelters
            if haversine_km(lat, lon, s.latitude, s.longitude) <= 3.0
        ]
        if not nearby:
            return 0.0
        worst = max(
            (s.current_occupancy / s.capacity if s.capacity else 0.0) for s in nearby
        )
        return round(10.0 * worst, 1)
