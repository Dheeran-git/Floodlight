"""Graph operations using NetworkX.

Constructs weighted, flood-aware road network graphs for Bengaluru by
connecting geographic nodes to their nearest neighbours. Edge weights blend
great-circle distance with flood penalties so routing can avoid hazards.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import asin, cos, radians, sin, sqrt

import networkx as nx

EARTH_RADIUS_KM = 6371.0088


@dataclass(frozen=True)
class GeoNode:
    """A geographic point in the road network."""

    id: str
    lat: float
    lon: float
    kind: str  # "incident" | "unit" | "shelter" | "junction"


@dataclass(frozen=True)
class FloodZone:
    """A circular flood hazard zone with an intensity penalty multiplier."""

    lat: float
    lon: float
    radius_km: float
    intensity: float  # 0..1, extra penalty multiplier


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in kilometers between two lat/lon points."""
    rlat1, rlon1, rlat2, rlon2 = map(radians, (lat1, lon1, lat2, lon2))
    dlat = rlat2 - rlat1
    dlon = rlon2 - rlon1
    a = sin(dlat / 2) ** 2 + cos(rlat1) * cos(rlat2) * sin(dlon / 2) ** 2
    return 2 * EARTH_RADIUS_KM * asin(sqrt(a))


def _midpoint(a: GeoNode, b: GeoNode) -> tuple[float, float]:
    """Approximate midpoint (lat, lon) of an edge — fine at city scale."""
    return ((a.lat + b.lat) / 2.0, (a.lon + b.lon) / 2.0)


def _flood_penalty(
    mid_lat: float, mid_lon: float, flood_zones: list[FloodZone]
) -> tuple[bool, float]:
    """Return (flooded, penalty) for an edge midpoint across all flood zones.

    flooded is True if the midpoint falls within any zone; penalty is the sum
    of intensities for every containing zone.
    """
    penalty = 0.0
    flooded = False
    for zone in flood_zones:
        if haversine_km(mid_lat, mid_lon, zone.lat, zone.lon) <= zone.radius_km:
            flooded = True
            penalty += zone.intensity
    return flooded, penalty


def _add_edge(graph: nx.Graph, a: GeoNode, b: GeoNode, flood_zones: list[FloodZone]) -> None:
    """Add a weighted, flood-aware undirected edge between two nodes."""
    distance_km = haversine_km(a.lat, a.lon, b.lat, b.lon)
    mid_lat, mid_lon = _midpoint(a, b)
    flooded, penalty = _flood_penalty(mid_lat, mid_lon, flood_zones)
    graph.add_edge(
        a.id,
        b.id,
        distance_km=distance_km,
        flooded=flooded,
        weight=distance_km * (1.0 + penalty),
    )


def build_road_graph(
    nodes: list[GeoNode],
    flood_zones: list[FloodZone] | None = None,
    k: int = 4,
) -> nx.Graph:
    """Build an undirected weighted graph connecting each node to k neighbours.

    Node attributes: lat, lon, kind. Edge attributes: distance_km (raw
    great-circle distance), flooded (bool — True if the edge midpoint falls
    inside any flood zone), weight (= distance_km * (1 + penalty), where penalty
    is the summed intensity of containing flood zones). After k-NN wiring, any
    disconnected components are joined by their nearest cross-component edge so
    routing always succeeds.
    """
    flood_zones = flood_zones or []
    graph: nx.Graph = nx.Graph()
    by_id: dict[str, GeoNode] = {n.id: n for n in nodes}

    for n in nodes:
        graph.add_node(n.id, lat=n.lat, lon=n.lon, kind=n.kind)

    # k-nearest-neighbour wiring.
    for a in nodes:
        neighbours = sorted(
            (b for b in nodes if b.id != a.id),
            key=lambda b: haversine_km(a.lat, a.lon, b.lat, b.lon),
        )
        for b in neighbours[: max(0, k)]:
            if not graph.has_edge(a.id, b.id):
                _add_edge(graph, a, b, flood_zones)

    _connect_components(graph, by_id, flood_zones)
    return graph


def _connect_components(
    graph: nx.Graph,
    by_id: dict[str, GeoNode],
    flood_zones: list[FloodZone],
) -> None:
    """Join disconnected components with their nearest cross-component edge."""
    while True:
        components = list(nx.connected_components(graph))
        if len(components) <= 1:
            return
        # Connect the first component to its nearest other component.
        base = components[0]
        others = set().union(*components[1:])
        best: tuple[float, str, str] | None = None
        for a_id in base:
            a = by_id[a_id]
            for b_id in others:
                b = by_id[b_id]
                d = haversine_km(a.lat, a.lon, b.lat, b.lon)
                if best is None or d < best[0]:
                    best = (d, a_id, b_id)
        assert best is not None  # noqa: S101 - components non-empty by construction
        _add_edge(graph, by_id[best[1]], by_id[best[2]], flood_zones)
