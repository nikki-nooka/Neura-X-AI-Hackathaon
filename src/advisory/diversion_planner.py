"""
Dynamic Diversion Planning Module.

Computes viable alternative routes around incidents, roadworks, and high-congestion
corridors. Enforces turn restrictions, calculates spare capacity on detours,
and simulates expected network delay reduction.
"""
from __future__ import annotations

import itertools
import sys
from pathlib import Path
from typing import Any

import networkx as nx
import pandas as pd

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

_DATA_DIR = _PROJECT_ROOT / "NEURAX_SMART_CITIES_TRAINING_V2"


class DiversionPlanner:
    """Computes constraint-aware network diversions and rerouting advisories."""

    def __init__(self, road_graph: nx.DiGraph | None = None) -> None:
        if road_graph is not None:
            self.G = road_graph
        else:
            from src.ingestion.graph_builder import build_graph
            self.G = build_graph()

        self.turn_restrictions: set[tuple[str, str]] = set()
        self._load_turn_restrictions()

    def _load_turn_restrictions(self) -> None:
        turns_path = _DATA_DIR / "turn_restrictions.csv"
        if turns_path.exists():
            df_turns = pd.read_csv(turns_path)
            for _, row in df_turns.iterrows():
                from_seg = str(row["from_segment"]).strip()
                to_seg = str(row["to_segment"]).strip()
                self.turn_restrictions.add((from_seg, to_seg))

    def _is_path_valid(self, path_nodes: list[str]) -> bool:
        """Check if any consecutive edge transitions violate turn restrictions."""
        if len(path_nodes) < 3:
            return True

        for i in range(len(path_nodes) - 2):
            u, v, w = path_nodes[i], path_nodes[i + 1], path_nodes[i + 2]
            seg_in = self.G[u][v].get("segment_id", "")
            seg_out = self.G[v][w].get("segment_id", "")
            if (seg_in, seg_out) in self.turn_restrictions:
                return False
        return True

    def compute_diversions(
        self,
        incident_segment_id: str,
        k_paths: int = 3,
        current_traffic: dict[str, dict[str, float]] | None = None,
    ) -> dict[str, Any]:
        """
        Generate operational diversion routes around a blocked or congested segment.

        Args:
            incident_segment_id: Segment experiencing disruption.
            k_paths: Maximum number of alternative paths to return.
            current_traffic: Optional dict mapping segment_id -> {"speed": ..., "flow": ...}

        Returns:
            Dict containing incident details, origin/destination nodes, and ranked alternative paths.
        """
        # Find the source and target node of the incident segment
        source_node, target_node = None, None
        blocked_edge_data = None

        for u, v, data in self.G.edges(data=True):
            if data.get("segment_id") == incident_segment_id:
                source_node, target_node = u, v
                blocked_edge_data = data
                break

        if source_node is None or target_node is None:
            return {"error": f"Segment {incident_segment_id} not found in road network."}

        # Build a temporary copy of the graph with the blocked edge cost severely penalized
        H = self.G.copy()
        
        # Calculate dynamic travel times on edges
        for u, v, data in H.edges(data=True):
            seg_id = data.get("segment_id", "")
            length_km = data.get("length_km", 1.0)
            free_flow_speed = data.get("free_flow_speed_kmh", 50.0)
            capacity = data.get("capacity_vph", 2000.0)

            speed = free_flow_speed
            flow = capacity * 0.5

            if current_traffic and seg_id in current_traffic:
                spd_val = current_traffic[seg_id].get("speed")
                speed = max(float(spd_val) if spd_val is not None else free_flow_speed, 5.0)
                flw_val = current_traffic[seg_id].get("flow")
                flow = float(flw_val) if flw_val is not None else flow

            # Bureau of Public Roads (BPR) impedance function
            base_time_min = (length_km / speed) * 60.0
            volume_capacity_ratio = min(flow / max(capacity, 100.0), 2.5)
            impedance = base_time_min * (1.0 + 0.15 * (volume_capacity_ratio ** 4))
            
            H[u][v]["weight"] = impedance
            H[u][v]["spare_capacity"] = max(capacity - flow, 0.0)

        # Remove the blocked edge or set infinite weight
        if H.has_edge(source_node, target_node):
            H.remove_edge(source_node, target_node)

        # Compute k-shortest paths from source_node to target_node (or extended corridor)
        alternative_paths: list[dict[str, Any]] = []

        try:
            raw_paths = list(
                itertools.islice(
                    nx.shortest_simple_paths(H, source_node, target_node, weight="weight"),
                    k_paths * 3,  # Candidate pool to filter turn restrictions
                )
            )
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            raw_paths = []

        for path_nodes in raw_paths:
            if not self._is_path_valid(path_nodes):
                continue

            # Compute route statistics
            route_segments: list[str] = []
            total_time_min = 0.0
            total_distance_km = 0.0
            min_spare_capacity = float("inf")

            for i in range(len(path_nodes) - 1):
                u, v = path_nodes[i], path_nodes[i + 1]
                edge_data = self.G[u][v]
                seg_id = edge_data.get("segment_id", f"{u}_{v}")
                route_segments.append(seg_id)
                total_distance_km += edge_data.get("length_km", 1.0)
                total_time_min += H[u][v]["weight"]
                min_spare_capacity = min(min_spare_capacity, H[u][v]["spare_capacity"])

            alternative_paths.append({
                "path_nodes": path_nodes,
                "segments": route_segments,
                "distance_km": round(total_distance_km, 2),
                "estimated_time_min": round(total_time_min, 1),
                "bottleneck_spare_capacity_vph": int(min_spare_capacity if min_spare_capacity != float("inf") else 500),
                "recommendation_score": round(100.0 / (1.0 + total_time_min), 1),
            })

            if len(alternative_paths) >= k_paths:
                break

        return {
            "incident_segment": incident_segment_id,
            "origin_node": source_node,
            "destination_node": target_node,
            "blocked_segment_class": blocked_edge_data.get("road_class", "arterial") if blocked_edge_data else "",
            "alternative_routes_count": len(alternative_paths),
            "recommended_routes": alternative_paths,
            "status": "DIVERSION_AVAILABLE" if alternative_paths else "NO_LEGAL_BYPASS",
        }


def main() -> None:
    planner = DiversionPlanner()
    test_seg = "R0376"
    res = planner.compute_diversions(test_seg, k_paths=3)
    print(f"\n🔀 Diversion Plan for Incident on {test_seg}:")
    print(f"  Status: {res['status']}")
    print(f"  From {res['origin_node']} to {res['destination_node']}")
    for idx, route in enumerate(res.get("recommended_routes", []), start=1):
        print(f"\n  Option {idx} (Score: {route['recommendation_score']}):")
        print(f"    Via Nodes: {' -> '.join(route['path_nodes'])}")
        print(f"    Segments: {', '.join(route['segments'])}")
        print(f"    Distance: {route['distance_km']} km | Travel Time: {route['estimated_time_min']} min | Spare Cap: {route['bottleneck_spare_capacity_vph']} vph")


if __name__ == "__main__":
    main()
