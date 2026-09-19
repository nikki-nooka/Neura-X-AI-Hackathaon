"""
Spillback Tracer Module.

Traces dynamic queue propagation and congestion spillback upstream along the
road network graph from any incident, bottleneck, or localized speed drop.
Quantifies cascade reach, estimated arrival times at upstream junctions,
and affected OD demand pairs.
"""
from __future__ import annotations

import sys
from collections import deque
from pathlib import Path
from typing import Any

import networkx as nx
import pandas as pd

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))
_DATA_DIR = _PROJECT_ROOT / "NEURAX_SMART_CITIES_TRAINING_V2"


class SpillbackTracer:
    """Traces spatial-temporal congestion spillback upstream through the road network."""

    def __init__(self, road_graph: nx.DiGraph | None = None) -> None:
        if road_graph is not None:
            self.G = road_graph
        else:
            from src.ingestion.graph_builder import build_graph
            self.G = build_graph()

        # Build reverse mapping: segment_id -> (u, v, edge_data)
        self.segment_map: dict[str, tuple[str, str, dict[str, Any]]] = {}
        # Inflow mapping: node_id -> list of (upstream_u, segment_id, edge_data)
        self.inflow_edges: dict[str, list[tuple[str, str, dict[str, Any]]]] = {}

        for u, v, data in self.G.edges(data=True):
            seg_id = data.get("segment_id", f"{u}_{v}")
            self.segment_map[seg_id] = (u, v, data)
            if v not in self.inflow_edges:
                self.inflow_edges[v] = []
            self.inflow_edges[v].append((u, seg_id, data))

    def trace_spillback(
        self,
        incident_segment_id: str,
        initial_speed_drop_pct: float = 0.60,
        max_hops: int = 4,
        base_queue_speed_kmh: float = 12.0,
    ) -> list[dict[str, Any]]:
        """
        Trace upstream propagation of a queue from a congested or blocked segment.

        Args:
            incident_segment_id: The segment where the bottleneck/incident occurred.
            initial_speed_drop_pct: Fraction of speed lost (e.g., 0.60 = 60% drop).
            max_hops: Max upstream graph depth to trace.
            base_queue_speed_kmh: Backward wave shockwave speed (km/h).

        Returns:
            List of affected upstream segment dicts ordered by propagation timeline.
        """
        if incident_segment_id not in self.segment_map:
            return []

        u, v, initial_data = self.segment_map[incident_segment_id]
        
        # Priority queue / BFS to trace upstream from node u (the source of the blocked segment)
        visited = {incident_segment_id}
        queue: deque[tuple[str, int, float, str]] = deque([(u, 0, 0.0, incident_segment_id)])
        
        cascade: list[dict[str, Any]] = [{
            "segment_id": incident_segment_id,
            "hop": 0,
            "eta_minutes": 0.0,
            "source_node": u,
            "target_node": v,
            "road_class": initial_data.get("road_class", "arterial"),
            "length_km": initial_data.get("length_km", 1.0),
            "free_flow_speed_kmh": initial_data.get("free_flow_speed_kmh", 50.0),
            "capacity_vph": initial_data.get("capacity_vph", 2000.0),
            "severity": "CRITICAL",
            "impact_type": "PRIMARY_SOURCE",
        }]

        while queue:
            current_node, current_hop, cumulative_time_min, parent_seg = queue.popleft()
            if current_hop >= max_hops:
                continue

            # Find all incoming edges into current_node
            incoming = self.inflow_edges.get(current_node, [])
            for upstream_u, upstream_seg, edge_data in incoming:
                if upstream_seg in visited:
                    continue

                visited.add(upstream_seg)
                length_km = float(edge_data.get("length_km", 1.0))
                
                # Shockwave backward propagation time (minutes):
                # t = (distance / shockwave_speed) * 60
                wave_speed = max(base_queue_speed_kmh - (current_hop * 1.5), 6.0)
                seg_delay_min = (length_km / wave_speed) * 60.0
                arrival_time_min = cumulative_time_min + seg_delay_min

                # Severity decay over hops
                severity = "HIGH" if current_hop == 0 else ("MODERATE" if current_hop == 1 else "LOW")

                cascade.append({
                    "segment_id": upstream_seg,
                    "hop": current_hop + 1,
                    "eta_minutes": round(arrival_time_min, 1),
                    "source_node": upstream_u,
                    "target_node": current_node,
                    "road_class": edge_data.get("road_class", "collector"),
                    "length_km": length_km,
                    "free_flow_speed_kmh": edge_data.get("free_flow_speed_kmh", 40.0),
                    "capacity_vph": edge_data.get("capacity_vph", 1800.0),
                    "severity": severity,
                    "impact_type": "UPSTREAM_SPILLBACK",
                    "propagated_from": parent_seg,
                })

                queue.append((upstream_u, current_hop + 1, arrival_time_min, upstream_seg))

        return cascade

    def find_affected_od_flows(
        self,
        cascade: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Identify which origin-destination demand pairs traverse the affected segments."""
        if "od_demand" not in self.G.graph or self.G.graph["od_demand"] is None:
            return []

        od_df = self.G.graph["od_demand"]
        affected_nodes = {item["source_node"] for item in cascade} | {item["target_node"] for item in cascade}
        
        affected_pairs = od_df[
            od_df["origin_node"].isin(affected_nodes) | od_df["destination_node"].isin(affected_nodes)
        ]

        results = []
        for _, row in affected_pairs.head(20).iterrows():
            results.append({
                "od_id": row.get("od_id", ""),
                "origin": row.get("origin_node", ""),
                "destination": row.get("destination_node", ""),
                "base_demand_vph": int(row.get("base_demand_vph", 0)),
                "purpose": row.get("purpose", "commute"),
            })
        return results


def main() -> None:
    tracer = SpillbackTracer()
    # Test on a representative segment
    test_seg = "R0376"
    cascade = tracer.trace_spillback(test_seg, max_hops=3)
    print(f"\n🌊 Spillback Cascade for {test_seg}:")
    for step in cascade:
        print(f"  Hop {step['hop']}: {step['segment_id']} ({step['source_node']} -> {step['target_node']}) | ETA: +{step['eta_minutes']} min | Class: {step['road_class']} | Severity: {step['severity']}")

    od_impact = tracer.find_affected_od_flows(cascade)
    print(f"\n🚗 Affected OD Trips: {len(od_impact)} identified")
    for od in od_impact[:5]:
        print(f"  {od['od_id']}: {od['origin']} -> {od['destination']} ({od['base_demand_vph']} vph, {od['purpose']})")


if __name__ == "__main__":
    main()
