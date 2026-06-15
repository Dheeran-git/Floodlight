"""Tests for A* safe routing and evacuation routing."""

from __future__ import annotations

from optimization.engine.graph import FloodZone, GeoNode, build_road_graph
from optimization.engine.routing import find_evacuation_route, find_safe_route


def _grid_nodes() -> list[GeoNode]:
    # A small Bengaluru-area mesh of junctions plus a unit and shelters.
    return [
        GeoNode("unit", 12.9352, 77.6245, "unit"),
        GeoNode("j1", 12.9450, 77.6300, "junction"),
        GeoNode("j2", 12.9550, 77.6350, "junction"),
        GeoNode("shelter_near", 12.9600, 77.6380, "shelter"),
        GeoNode("shelter_far", 12.9900, 77.7000, "shelter"),
    ]


def test_find_safe_route_returns_path() -> None:
    g = build_road_graph(_grid_nodes(), k=3)
    route = find_safe_route(g, "unit", "shelter_far")
    assert route is not None
    assert route.node_path[0] == "unit"
    assert route.node_path[-1] == "shelter_far"
    assert route.distance_km > 0
    assert route.eta_minutes >= 1
    assert len(route.coordinates) == len(route.node_path)
    # Direct edge distance is a lower bound on any actual path distance.
    direct = find_safe_route(g, "unit", "shelter_near")
    assert direct is not None
    assert route.distance_km >= direct.distance_km - 1e-6


def test_missing_node_returns_none() -> None:
    g = build_road_graph(_grid_nodes(), k=3)
    assert find_safe_route(g, "unit", "nope") is None
    assert find_safe_route(g, "ghost", "shelter_near") is None


def test_route_safety_flag_reflects_flooding() -> None:
    nodes = [
        GeoNode("unit", 12.9352, 77.6245, "unit"),
        GeoNode("shelter", 12.9450, 77.6300, "shelter"),
    ]
    mid = (12.9401, 77.62725)
    zone = FloodZone(lat=mid[0], lon=mid[1], radius_km=2.0, intensity=0.8)
    g = build_road_graph(nodes, flood_zones=[zone], k=1)
    route = find_safe_route(g, "unit", "shelter")
    assert route is not None
    assert route.safe is False


def test_evacuation_picks_nearest_shelter() -> None:
    g = build_road_graph(_grid_nodes(), k=3)
    route = find_evacuation_route(g, "unit", ["shelter_far", "shelter_near"])
    assert route is not None
    assert route.node_path[-1] == "shelter_near"


def test_evacuation_none_when_no_shelters_present() -> None:
    g = build_road_graph(_grid_nodes(), k=3)
    assert find_evacuation_route(g, "unit", ["missing1", "missing2"]) is None
