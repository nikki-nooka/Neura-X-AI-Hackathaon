"""
Automated Test Suite for NeuraX Full-Stack FastAPI Endpoints.
"""
from __future__ import annotations

import sys
from pathlib import Path
from fastapi.testclient import TestClient

_PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from api.main import app

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert data["active_nodes"] == 120
    assert data["active_segments"] == 436


def test_network_topology_endpoint():
    res = client.get("/api/network/topology")
    assert res.status_code == 200
    data = res.json()
    assert len(data["nodes"]) == 120
    assert len(data["edges"]) == 436


def test_city_kpis_endpoint():
    res = client.get("/api/network/kpis")
    assert res.status_code == 200
    data = res.json()
    assert "avg_speed_kmh" in data
    assert "total_flow_vph" in data


def test_forecasting_endpoint():
    res = client.post("/api/forecast/predict", json={"segment_id": "R0062"})
    assert res.status_code == 200
    data = res.json()
    assert len(data["horizons"]) == 4
    assert data["horizons"][0]["horizon"] == "15m"


def test_emergency_green_wave_endpoint():
    res = client.post("/api/emergency/green-wave", json={"origin_node": "N001", "destination_node": "N085"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "GREEN_WAVE_DISPATCHED"
    assert data["time_saved_min"] > 0
    assert len(data["path_nodes"]) >= 2


def test_infrastructure_candidates_endpoint():
    res = client.get("/api/infrastructure/candidates")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 90
    assert data[0]["rank"] == 1


def test_briefing_generation_endpoint():
    res = client.post("/api/briefing/generate", json={
        "segment_id": "R0435",
        "incident_type": "stalled_vehicle",
        "severity": 2,
        "lanes_blocked": 1,
        "current_speed": 15.0,
        "current_flow": 700.0,
        "capacity": 1800.0,
        "language": "hi",
    })
    assert res.status_code == 200
    data = res.json()
    assert "briefing" in data
    assert len(data["briefing"]) > 10
