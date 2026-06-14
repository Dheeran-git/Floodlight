"""Tests for the flood-aware road graph builder."""

from __future__ import annotations

import networkx as nx

from optimization.engine.graph import (
    FloodZone,
    GeoNode,
    build_road_graph,
    haversine_km,
)

# Realistic Bengaluru landmarks.
MG_ROAD = (12.9756, 77.6068)
KORAMANGALA = (12.9352, 77.6245)
INDIRANAGAR = (12.9719, 77.6412)
WHITEFIELD = (12.9698, 77.7500)


def _bengaluru_nodes() -> list[GeoNode]:
    return [
        GeoNode("mg", *MG_ROAD, "junction"),
        GeoNode("kora", *KORAMANGALA, "shelter"),
        GeoNode("indi", *INDIRANAGAR, "unit"),
        GeoNode("white", *WHITEFIELD, "incident"),
    ]


def test_haversine_bengaluru_sanity() -> None:
    # MG Road to Koramangala is roughly 4-5 km.
    d = haversine_km(*MG_ROAD, *KORAMANGALA)
    assert 3.0 < d < 6.0
    # Symmetric and zero for identical points.
    assert haversine_km(*MG_ROAD, *MG_ROAD) == 0.0
    assert abs(d - haversine_km(*KORAMANGALA, *MG_ROAD)) < 1e-9


def test_graph_is_connected_and_has_attributes() -> None:
    g = build_road_graph(_bengaluru_nodes(), k=1)
    assert nx.is_connected(g)
    for _, data in g.nodes(data=True):
        assert "lat" in data and "lon" in data and "kind" in data
    for _, _, data in g.edges(data=True):
        assert data["distance_km"] > 0
        assert "flooded" in data
        # weight >= raw distance (penalty is non-negative).
        assert data["weight"] >= data["distance_km"] - 1e-9


def test_flood_zone_increases_weight_and_flags_edge() -> None:
    nodes = [
        GeoNode("a", 12.9700, 77.6000, "unit"),
        GeoNode("b", 12.9700, 77.6100, "incident"),
    ]
    mid_lat, mid_lon = 12.9700, 77.6050
    zone = FloodZone(lat=mid_lat, lon=mid_lon, radius_km=1.0, intensity=0.5)

    clear = build_road_graph(nodes, flood_zones=[], k=1)
    flooded = build_road_graph(nodes, flood_zones=[zone], k=1)

    assert flooded.edges["a", "b"]["flooded"] is True
    assert clear.edges["a", "b"]["flooded"] is False
    # Penalty multiplies weight by (1 + intensity).
    assert flooded.edges["a", "b"]["weight"] > clear.edges["a", "b"]["weight"]


def test_disconnected_clusters_are_bridged() -> None:
    # Two tight clusters far apart; k=1 within clusters would leave them split.
    nodes = [
        GeoNode("c1a", 12.90, 77.50, "junction"),
        GeoNode("c1b", 12.901, 77.501, "junction"),
        GeoNode("c2a", 13.10, 77.80, "junction"),
        GeoNode("c2b", 13.101, 77.801, "junction"),
    ]
    g = build_road_graph(nodes, k=1)
    assert nx.is_connected(g)
