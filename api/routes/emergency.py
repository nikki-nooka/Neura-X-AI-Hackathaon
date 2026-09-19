"""
Emergency Vehicle Priority & Green Wave Corridor Dispatch.
"""
from __future__ import annotations

from typing import Any, Dict, List
import networkx as nx
from fastapi import APIRouter

from api.schemas import EmergencyRouteRequest
from src.ingestion.graph_builder import build_graph

router = APIRouter(prefix="/api/emergency", tags=["Emergency"])

_G = None


def _get_graph():
    global _G
    if _G is None:
        _G = build_graph()
    return _G


@router.post("/green-wave")
def dispatch_green_wave(req: EmergencyRouteRequest) -> Dict[str, Any]:
    """
    Calculate high-priority emergency path and force green-wave overrides
    across all intervening signalized intersections.
    """
    G = _get_graph()
    origin = req.origin_node.upper()
    dest = req.destination_node.upper()

    if origin not in G or dest not in G:
        return {
            "error": f"Invalid node selection. Available range: N001 to N120."
        }

    try:
        # Calculate fastest path weighted by length and free flow speed
        path_nodes = nx.shortest_path(
            G,
            source=origin,
            target=dest,
            weight=lambda u, v, d: d.get("length_km", 1.0) / max(d.get("free_flow_speed_kmh", 50.0), 10.0),
        )
    except nx.NetworkXNoPath:
        return {"error": f"No connected roadway between {origin} and {dest}."}

    # Extract corridor segments and signalized nodes
    corridor_segments: List[str] = []
    overridden_signals: List[Dict[str, Any]] = []
    total_distance_km = 0.0
    normal_eta_min = 0.0

    for i in range(len(path_nodes) - 1):
        u, v = path_nodes[i], path_nodes[i + 1]
        edge_data = G[u][v]
        seg_id = edge_data.get("segment_id", f"{u}_{v}")
        corridor_segments.append(seg_id)
        
        length = float(edge_data.get("length_km", 1.0))
        ff_speed = float(edge_data.get("free_flow_speed_kmh", 50.0))
        total_distance_km += length
        normal_eta_min += (length / max(ff_speed * 0.65, 10.0)) * 60.0  # standard traffic speed

        # Check if node v or u is a signalized intersection
        v_data = G.nodes[v]
        if v_data.get("is_signalized", False):
            overridden_signals.append({
                "node_id": v,
                "action": "EMERGENCY_FORCE_GREEN",
                "green_split": 1.00,
                "clearing_window_s": 90,
                "status": "SIGNAL_PREEMPTION_ACTIVE",
            })

    # Emergency vehicle with green wave moves at free flow speed + preemption bonus
    green_wave_eta_min = max(round((total_distance_km / 65.0) * 60.0, 1), 1.2)
    time_saved_min = round(max(normal_eta_min - green_wave_eta_min, 0.8), 1)

    return {
        "status": "GREEN_WAVE_DISPATCHED",
        "priority_level": "CODE_3_CRITICAL",
        "origin_node": origin,
        "destination_node": dest,
        "path_nodes": path_nodes,
        "corridor_segments": corridor_segments,
        "total_distance_km": round(total_distance_km, 2),
        "normal_travel_time_min": round(normal_eta_min, 1),
        "green_wave_eta_min": green_wave_eta_min,
        "time_saved_min": time_saved_min,
        "signals_preempted_count": len(overridden_signals),
        "preempted_signals": overridden_signals,
    }
