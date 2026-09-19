"""
Pydantic Schemas for NeuraX Smart Cities API.
"""
from __future__ import annotations

from typing import Any, List, Optional
from pydantic import BaseModel, Field


class NodeModel(BaseModel):
    id: str
    lat: float
    lon: float
    is_signalized: bool = False
    name: str = ""


class EdgeModel(BaseModel):
    segment_id: str
    source: str
    target: str
    road_class: str = "arterial"
    length_km: float = 1.0
    free_flow_speed_kmh: float = 50.0
    capacity_vph: float = 2000.0
    speed_kmh: float = 50.0
    flow_vph: float = 500.0
    congestion_level: str = "FREE_FLOW"
    congestion_index: float = 0.0
    delay_min: float = 0.0
    queue_length_veh: float = 0.0


class CityKPIsModel(BaseModel):
    timestamp: str
    total_segments: int
    avg_speed_kmh: float
    total_flow_vph: float
    free_flow_pct: float
    moderate_pct: float
    heavy_pct: float
    gridlock_pct: float
    active_incidents_count: int
    active_bottlenecks_count: int


class ForecastRequest(BaseModel):
    segment_id: str
    timestamp: Optional[str] = None


class SpillbackRequest(BaseModel):
    segment_id: str
    max_hops: int = 4
    speed_drop_pct: float = 0.60


class DiversionRequest(BaseModel):
    segment_id: str
    k_paths: int = 3


class SignalOptimizeRequest(BaseModel):
    node_id: str
    congestion_level: str = "HEAVY"
    queue_length_veh: float = 30.0
    is_spillback_upstream: bool = False


class EmergencyRouteRequest(BaseModel):
    origin_node: str
    destination_node: str


class BriefingRequest(BaseModel):
    incident_id: str = "INC_LIVE_001"
    segment_id: str
    incident_type: str = "stalled_vehicle"
    severity: int = 2
    lanes_blocked: int = 1
    current_speed: float = 14.5
    current_flow: float = 650.0
    capacity: float = 1800.0
    spillback_segments: List[str] = Field(default_factory=list)
    diversion_route: Optional[List[str]] = None
    signal_advisory: Optional[str] = None
    language: str = "en"
