"""
End-to-End System Test Suite.
Validates all core modules across CP1, CP2, and CP3 pipelines.
"""
from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
import pytest

_PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from src.advisory.briefing_generator import BriefingGenerator
from src.advisory.diversion_planner import DiversionPlanner
from src.advisory.signal_optimizer import SignalOptimizer
from src.forecasting.forecaster import TrafficForecaster
from src.infrastructure.intervention_simulator import InterventionSimulator
from src.ingestion.graph_builder import build_graph
from src.state_engine.anomaly_detector import detect_anomalies
from src.state_engine.congestion_tracker import classify_congestion
from src.state_engine.spillback_tracer import SpillbackTracer


def test_graph_construction():
    G = build_graph()
    assert G.number_of_nodes() == 120
    assert G.number_of_edges() == 436
    assert "od_demand" in G.graph


def test_spillback_tracer():
    tracer = SpillbackTracer()
    cascade = tracer.trace_spillback("R0376", max_hops=2)
    assert len(cascade) > 0
    assert cascade[0]["segment_id"] == "R0376"
    assert cascade[0]["hop"] == 0


def test_diversion_planner():
    planner = DiversionPlanner()
    plan = planner.compute_diversions("R0376", k_paths=2)
    assert "status" in plan
    assert "recommended_routes" in plan
    assert len(plan["recommended_routes"]) > 0


def test_signal_optimizer():
    optimizer = SignalOptimizer()
    res = optimizer.optimize_signal_for_corridor("N023", congestion_level="HEAVY", queue_length_veh=30.0)
    assert res.get("has_signal") is True
    assert res.get("action") == "FLUSH_QUEUE"
    assert res.get("target_green_ratio", 0) > res.get("base_green_ratio", 0)


def test_briefing_generator():
    gen = BriefingGenerator()
    for lang in ["en", "hi", "te"]:
        text = gen.generate_briefing(
            incident_id="INC_TEST",
            segment_id="R0001",
            incident_type="stalled_vehicle",
            severity=1,
            lanes_blocked=1,
            current_speed=20.0,
            current_flow=500.0,
            capacity=2700.0,
            spillback_segments=["R0002"],
            language=lang,
        )
        assert len(text) > 20


def test_intervention_simulator():
    sim = InterventionSimulator()
    cands = sim.simulate_all_candidates()
    assert len(cands) == 90
    assert "roi_score" in cands.columns
    assert cands.iloc[0]["roi_score"] >= cands.iloc[-1]["roi_score"]

    scenarios = sim.evaluate_scenario_examples()
    assert len(scenarios) == 30


def test_forecaster_snapshot():
    forecaster = TrafficForecaster()
    net = pd.read_csv(_PROJECT_ROOT / "NEURAX_SMART_CITIES_TRAINING_V2" / "network.csv")
    sample_df = pd.DataFrame([{
        "segment_id": "R0001",
        "speed_kmh": 50.0,
        "flow_vph": 1200.0,
        "occupancy_pct": 18.0,
        "travel_time_min": 2.0,
        "delay_min": 0.2,
        "queue_length_veh": 0.0,
        "congestion_index": 0.01,
        "timestamp": pd.Timestamp.now(),
    }])
    preds = forecaster.predict_snapshot(sample_df)
    assert "pred_speed_15m" in preds.columns
    assert "pred_speed_60m" in preds.columns
    assert "pred_congestion_15m" in preds.columns
