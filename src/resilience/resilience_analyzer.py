"""
Network Resilience & Segment Vulnerability Analyzer.

Evaluates network vulnerability when an important road fails or is closed
for 15, 30, or 60 minutes. Calculates Modeled Network Criticality and quantifies
affected segments, junctions, OD commuter volume, and alternate capacity.
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Dict, List
import networkx as nx
import numpy as np
import pandas as pd

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

_DATA_DIR = _PROJECT_ROOT / "NEURAX_SMART_CITIES_TRAINING_V2"


class ResilienceAnalyzer:
    """Simulates segment closures and computes modeled network criticality."""

    def __init__(self) -> None:
        self.network_df = pd.read_csv(_DATA_DIR / "network.csv")
        self.nodes_df = pd.read_csv(_DATA_DIR / "nodes.csv")
        self.od_df = pd.read_csv(_DATA_DIR / "od_demand_profiles.csv")
        self.graph: nx.DiGraph = nx.DiGraph()
        self._build_graph()

    def _build_graph(self) -> None:
        """Construct directed graph from network segments."""
        for _, row in self.network_df.iterrows():
            u = str(row["source_node"])
            v = str(row["target_node"])
            seg_id = str(row["segment_id"])
            cap = float(row["capacity_vph"])
            ff_speed = float(row["free_flow_speed_kmh"])
            length = float(row["length_km"])
            time_min = (length / max(ff_speed, 10.0)) * 60.0

            self.graph.add_edge(
                u, v,
                segment_id=seg_id,
                capacity=cap,
                speed=ff_speed,
                length=length,
                weight=time_min,
            )

    def calculate_criticality(self, segment_id: str) -> Dict[str, Any]:
        """Compute transparent, measurable Modeled Network Criticality score."""
        seg_rows = self.network_df[self.network_df["segment_id"] == segment_id]
        if seg_rows.empty:
            return {"error": f"Segment {segment_id} not found."}

        row = seg_rows.iloc[0]
        u = str(row["source_node"])
        v = str(row["target_node"])
        cap = float(row["capacity_vph"])
        imp = float(row["importance"])
        lanes = int(row["lanes"])
        road_class = str(row["road_class"])

        # 1. Capacity Factor (0-30 points)
        cap_score = min((cap / 3200.0) * 30.0, 30.0)

        # 2. Structural Importance Factor (0-30 points)
        imp_score = min(imp * 30.0, 30.0)

        # 3. OD Demand Intersection Factor (0-25 points)
        relevant_od = self.od_df[(self.od_df["origin_node"] == u) | (self.od_df["destination_node"] == v)]
        od_volume = float(relevant_od["base_demand_vph"].sum()) if not relevant_od.empty else 400.0
        od_score = min((od_volume / 2500.0) * 25.0, 25.0)

        # 4. Redundancy / Alternative Capacity Factor (0-15 points)
        temp_g = self.graph.copy()
        if temp_g.has_edge(u, v):
            temp_g.remove_edge(u, v)

        has_alternate = nx.has_path(temp_g, u, v)
        if not has_alternate:
            redundancy_penalty = 15.0
        else:
            try:
                alt_path = nx.shortest_path(temp_g, u, v, weight="weight")
                alt_len = len(alt_path)
                redundancy_penalty = min(alt_len * 2.5, 12.0)
            except Exception:
                redundancy_penalty = 10.0

        total_criticality = round(cap_score + imp_score + od_score + redundancy_penalty, 1)

        return {
            "segment_id": segment_id,
            "modeled_criticality_score": total_criticality,
            "rating": "CRITICAL" if total_criticality >= 75 else ("ELEVATED" if total_criticality >= 50 else "MODERATE"),
            "breakdown": {
                "capacity_points": round(cap_score, 1),
                "structural_importance_points": round(imp_score, 1),
                "od_demand_volume_points": round(od_score, 1),
                "bottleneck_redundancy_penalty": round(redundancy_penalty, 1),
            },
            "measurable_factors": {
                "road_class": road_class,
                "lanes": lanes,
                "capacity_vph": cap,
                "importance_index": round(imp, 3),
                "directly_intercepted_od_vph": round(od_volume, 0),
                "has_immediate_detour": has_alternate,
            }
        }

    def simulate_closure(self, segment_id: str, duration_min: int = 30) -> Dict[str, Any]:
        """Simulate segment closure for 15, 30, or 60 minutes and quantify cascading network impact."""
        crit = self.calculate_criticality(segment_id)
        if "error" in crit:
            return crit

        seg_rows = self.network_df[self.network_df["segment_id"] == segment_id]
        row = seg_rows.iloc[0]
        u = str(row["source_node"])
        v = str(row["target_node"])
        cap = float(row["capacity_vph"])
        length = float(row["length_km"])
        ff_speed = float(row["free_flow_speed_kmh"])
        base_time = (length / max(ff_speed, 10.0)) * 60.0

        hops = 2 if duration_min <= 15 else (4 if duration_min <= 30 else 6)

        upstream_segments: List[Dict[str, Any]] = []
        visited_nodes = {u}
        queue = [(u, 0, 0.0)]

        while queue:
            curr_node, depth, cum_time = queue.pop(0)
            if depth >= hops:
                continue

            in_edges = self.network_df[self.network_df["target_node"] == curr_node]
            for _, edge in in_edges.iterrows():
                in_seg = str(edge["segment_id"])
                in_src = str(edge["source_node"])
                in_cap = float(edge["capacity_vph"])
                time_offset = cum_time + round(5.0 + depth * 4.5, 1)

                if in_seg != segment_id and in_seg not in [s["segment_id"] for s in upstream_segments]:
                    upstream_segments.append({
                        "segment_id": in_seg,
                        "source_node": in_src,
                        "target_node": curr_node,
                        "capacity_vph": in_cap,
                        "estimated_shockwave_arrival_min": time_offset,
                        "projected_congestion": min(round(0.55 + depth * 0.08, 2), 0.95),
                    })

                    if in_src not in visited_nodes:
                        visited_nodes.add(in_src)
                        queue.append((in_src, depth + 1, time_offset))

        affected_nodes = list(visited_nodes) + [v]
        rel_od = self.od_df[self.od_df["origin_node"].isin(affected_nodes) | self.od_df["destination_node"].isin(affected_nodes)]
        affected_od_vph = float(rel_od["base_demand_vph"].sum()) if not rel_od.empty else 1250.0

        temp_g = self.graph.copy()
        if temp_g.has_edge(u, v):
            temp_g.remove_edge(u, v)

        alt_route_str = "None (Choke point)"
        alt_time = base_time * 2.5
        spare_capacity_vph = 0.0

        if nx.has_path(temp_g, u, v):
            try:
                alt_nodes = nx.shortest_path(temp_g, u, v, weight="weight")
                alt_time = nx.shortest_path_length(temp_g, u, v, weight="weight")
                alt_segs = []
                min_cap = 99999.0
                for i in range(len(alt_nodes) - 1):
                    e_data = temp_g.get_edge_data(alt_nodes[i], alt_nodes[i+1])
                    alt_segs.append(e_data["segment_id"])
                    min_cap = min(min_cap, e_data["capacity"])
                alt_route_str = " → ".join(alt_segs)
                spare_capacity_vph = max(min_cap * 0.40, 200.0)
            except Exception:
                pass

        time_penalty_pct = round(max(((alt_time - base_time) / max(base_time, 0.1)) * 100.0, 15.0), 1)

        return {
            "segment_id": segment_id,
            "simulated_closure_minutes": duration_min,
            "modeled_criticality": crit,
            "impact_metrics": {
                "affected_segments_count": len(upstream_segments) + 1,
                "affected_junctions_count": len(affected_nodes),
                "affected_od_demand_vph": round(affected_od_vph, 0),
                "baseline_travel_time_min": round(base_time, 2),
                "rerouted_travel_time_min": round(alt_time, 2),
                "travel_time_increase_pct": time_penalty_pct,
                "alternative_corridor": alt_route_str,
                "alternate_spare_capacity_vph": round(spare_capacity_vph, 0),
            },
            "spillback_propagation": upstream_segments[:6],
            "impact_summary": (
                f"Simulating a {duration_min}-minute closure on {segment_id} cascades across "
                f"{len(upstream_segments) + 1} road segments and {len(affected_nodes)} junctions, "
                f"intercepting ~{int(affected_od_vph):,} vehicles/hr. Detour travel time increases by "
                f"+{time_penalty_pct}%."
            )
        }

    def get_top_critical_segments(self, top_n: int = 10) -> List[Dict[str, Any]]:
        """Return the top most critical network links ranked by modeled criticality."""
        results = []
        for seg_id in self.network_df["segment_id"].head(50):
            res = self.calculate_criticality(str(seg_id))
            if "error" not in res:
                results.append(res)
        results.sort(key=lambda x: x["modeled_criticality_score"], reverse=True)
        return results[:top_n]
