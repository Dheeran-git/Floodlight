"""Route optimization algorithms.

Implements A* pathfinding on the flood-aware road graph, minimizing edge
weight (distance plus flood penalty) and reporting whether a route is safe.
"""

from __future__ import annotations

from dataclasses import dataclass

import networkx as nx

from optimization.engine.graph import haversine_km


@dataclass(frozen=True)
class RouteResult:
    """A computed route with geometry, distance, ETA, and safety flag."""

    node_path: list[str]
    coordinates: list[tuple[float, float]]  # (lat, lon) for each node on the path
    distance_km: float  # sum of raw distance_km along the path
    eta_minutes: int  # round(distance_km / speed_kmh * 60)
    safe: bool  # False if any edge on the path has flooded=True


def _heuristic(graph: nx.Graph):
    """Admissible haversine heuristic (node -> target) in graph weight units (km).

    NetworkX calls the heuristic as ``h(node, target)``.
    """

    def h(node_id: str, target_id: str) -> float:
        n = graph.nodes[node_id]
        t = graph.nodes[target_id]
        return haversine_km(n["lat"], n["lon"], t["lat"], t["lon"])

    return h


def _build_result(graph: nx.Graph, path: list[str], speed_kmh: float) -> RouteResult:
    """Assemble a RouteResult from a node path, summing raw distances."""
    coordinates: list[tuple[float, float]] = [
        (graph.nodes[n]["lat"], graph.nodes[n]["lon"]) for n in path
    ]
    distance_km = 0.0
    safe = True
    for u, v in zip(path[:-1], path[1:], strict=True):
        edge = graph.edges[u, v]
        distance_km += edge["distance_km"]
        if edge.get("flooded", False):
            safe = False
    eta_minutes = round(distance_km / speed_kmh * 60) if speed_kmh > 0 else 0
    return RouteResult(
        node_path=path,
        coordinates=coordinates,
        distance_km=distance_km,
        eta_minutes=eta_minutes,
        safe=safe,
    )


def find_safe_route(
    graph: nx.Graph,
    source_id: str,
    target_id: str,
    speed_kmh: float = 30.0,
) -> RouteResult | None:
    """A* shortest path minimizing edge 'weight' with a haversine heuristic.

    Returns None if either node is missing or no path exists.
    """
    if source_id not in graph or target_id not in graph:
        return None
    try:
        path = nx.astar_path(
            graph,
            source_id,
            target_id,
            heuristic=_heuristic(graph),
            weight="weight",
        )
    except nx.NetworkXNoPath:
        return None
    return _build_result(graph, path, speed_kmh)


def find_evacuation_route(
    graph: nx.Graph,
    source_id: str,
    shelter_ids: list[str],
    speed_kmh: float = 30.0,
) -> RouteResult | None:
    """Return the safe route to the nearest reachable shelter by route weight."""
    if source_id not in graph:
        return None
    best: RouteResult | None = None
    best_weight = float("inf")
    for shelter_id in shelter_ids:
        if shelter_id not in graph:
            continue
        try:
            weight = nx.astar_path_length(
                graph,
                source_id,
                shelter_id,
                heuristic=_heuristic(graph),
                weight="weight",
            )
        except nx.NetworkXNoPath:
            continue
        if weight < best_weight:
            route = find_safe_route(graph, source_id, shelter_id, speed_kmh)
            if route is not None:
                best_weight = weight
                best = route
    return best
