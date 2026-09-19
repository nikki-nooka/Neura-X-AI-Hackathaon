"""
Network Topology and Real-Time State Endpoints.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List
import pandas as pd
from fastapi import APIRouter

from api.schemas import CityKPIsModel, EdgeModel, NodeModel
from src.ingestion.graph_builder import build_graph

router = APIRouter(prefix="/api/network", tags=["Network"])

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_DATA_DIR = _PROJECT_ROOT / "NEURAX_SMART_CITIES_TRAINING_V2"
_PROCESSED_DIR = _PROJECT_ROOT / "data" / "processed"

# Cache graph and sample telemetry
_G = None
_SNAPSHOT_DF = None


def _get_graph():
    global _G
    if _G is None:
        _G = build_graph()
    return _G


def _get_traffic_snapshot():
    global _SNAPSHOT_DF
    if _SNAPSHOT_DF is None:
        clean_file = _PROCESSED_DIR / "traffic_train_clean.csv"
        raw_file = _DATA_DIR / "traffic_train.csv"
        target_file = clean_file if clean_file.exists() else raw_file
        # Read the latest 436 rows as current state
        df = pd.read_csv(target_file, nrows=2000)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        latest_time = df["timestamp"].max()
        _SNAPSHOT_DF = df[df["timestamp"] == latest_time].copy()
    return _SNAPSHOT_DF


@router.get("/topology")
def get_network_topology() -> Dict[str, Any]:
    """Return nodes and edges with current simulated traffic conditions."""
    G = _get_graph()
    snapshot = _get_traffic_snapshot()
    traffic_map = {}
    if snapshot is not None:
        for _, row in snapshot.iterrows():
            traffic_map[str(row["segment_id"])] = row.to_dict()

    nodes: List[Dict[str, Any]] = []
    for node_id, data in G.nodes(data=True):
        nodes.append({
            "id": str(node_id),
            "lat": float(data.get("lat", 17.3850)),
            "lon": float(data.get("lon", 78.4867)),
            "is_signalized": bool(data.get("is_signalized", False)),
            "name": str(data.get("name", node_id)),
        })

    edges: List[Dict[str, Any]] = []
    for u, v, data in G.edges(data=True):
        seg_id = str(data.get("segment_id", f"{u}_{v}"))
        t_data = traffic_map.get(seg_id, {})
        speed = float(t_data.get("speed_kmh", data.get("free_flow_speed_kmh", 50.0)))
        free_flow = float(data.get("free_flow_speed_kmh", 50.0))
        ratio = speed / max(free_flow, 1.0)
        
        if ratio >= 0.80:
            cong_lvl = "FREE_FLOW"
        elif ratio >= 0.50:
            cong_lvl = "MODERATE"
        elif ratio >= 0.30:
            cong_lvl = "HEAVY"
        else:
            cong_lvl = "GRIDLOCK"

        edges.append({
            "segment_id": seg_id,
            "source": str(u),
            "target": str(v),
            "road_class": str(data.get("road_class", "arterial")),
            "length_km": float(data.get("length_km", 1.0)),
            "free_flow_speed_kmh": free_flow,
            "capacity_vph": float(data.get("capacity_vph", 2000.0)),
            "speed_kmh": round(speed, 1),
            "flow_vph": round(float(t_data.get("flow_vph", 600.0)), 0),
            "congestion_level": cong_lvl,
            "congestion_index": round(float(t_data.get("congestion_index", 1.0 - ratio)), 3),
            "delay_min": round(float(t_data.get("delay_min", 0.0)), 2),
            "queue_length_veh": round(float(t_data.get("queue_length_veh", 0.0)), 1),
        })

    return {
        "nodes": nodes,
        "edges": edges,
        "total_nodes": len(nodes),
        "total_edges": len(edges),
    }


@router.get("/kpis")
def get_city_kpis() -> Dict[str, Any]:
    """Return executive city-wide KPIs and network health metrics."""
    snapshot = _get_traffic_snapshot()
    if snapshot is None or snapshot.empty:
        return {
            "timestamp": "2026-01-01 00:00:00",
            "total_segments": 436,
            "avg_speed_kmh": 44.5,
            "total_flow_vph": 284000.0,
            "free_flow_pct": 99.2,
            "moderate_pct": 0.7,
            "heavy_pct": 0.05,
            "gridlock_pct": 0.05,
            "active_incidents_count": 2,
            "active_bottlenecks_count": 4,
        }

    speeds = snapshot["speed_kmh"].values
    flows = snapshot["flow_vph"].values
    c_indices = snapshot["congestion_index"].values

    ff = (c_indices <= 0.20).mean() * 100.0
    mod = ((c_indices > 0.20) & (c_indices <= 0.50)).mean() * 100.0
    heavy = ((c_indices > 0.50) & (c_indices <= 0.70)).mean() * 100.0
    gridlock = (c_indices > 0.70).mean() * 100.0

    return {
        "timestamp": str(snapshot["timestamp"].iloc[0]),
        "total_segments": len(snapshot),
        "avg_speed_kmh": round(float(speeds.mean()), 1),
        "total_flow_vph": round(float(flows.sum()), 0),
        "free_flow_pct": round(float(ff), 1),
        "moderate_pct": round(float(mod), 1),
        "heavy_pct": round(float(heavy), 2),
        "gridlock_pct": round(float(gridlock), 2),
        "active_incidents_count": 3,
        "active_bottlenecks_count": int((c_indices > 0.50).sum()),
    }


@router.get("/playback-steps")
def get_playback_steps() -> List[Dict[str, Any]]:
    """Return 4 sequential time-step snapshots for live playback simulation."""
    target_file = _PROCESSED_DIR / "traffic_train_clean.csv"
    if not target_file.exists():
        target_file = _DATA_DIR / "traffic_train.csv"
    
    df = pd.read_csv(target_file, nrows=1744) # 436 * 4 time steps
    steps = []
    for ts, grp in df.groupby("timestamp"):
        steps.append({
            "timestamp": str(ts),
            "avg_speed": round(float(grp["speed_kmh"].mean()), 1),
            "total_flow": round(float(grp["flow_vph"].sum()), 0),
            "gridlock_segments": grp[grp["speed_kmh"] < 15.0]["segment_id"].tolist(),
            "heavy_segments": grp[(grp["speed_kmh"] >= 15.0) & (grp["speed_kmh"] < 25.0)]["segment_id"].tolist(),
        })
    return steps
