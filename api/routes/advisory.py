"""
Advisory Intelligence Endpoints: Spillback Tracing, Diversions & Signals.
"""
from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter

from api.schemas import DiversionRequest, SignalOptimizeRequest, SpillbackRequest
from src.advisory.diversion_planner import DiversionPlanner
from src.advisory.signal_optimizer import SignalOptimizer
from src.state_engine.spillback_tracer import SpillbackTracer

router = APIRouter(prefix="/api/advisory", tags=["Advisory"])

_TRACER: SpillbackTracer | None = None
_PLANNER: DiversionPlanner | None = None
_OPTIMIZER: SignalOptimizer | None = None


def _get_tracer() -> SpillbackTracer:
    global _TRACER
    if _TRACER is None:
        _TRACER = SpillbackTracer()
    return _TRACER


def _get_planner() -> DiversionPlanner:
    global _PLANNER
    if _PLANNER is None:
        _PLANNER = DiversionPlanner()
    return _PLANNER


def _get_optimizer() -> SignalOptimizer:
    global _OPTIMIZER
    if _OPTIMIZER is None:
        _OPTIMIZER = SignalOptimizer()
    return _OPTIMIZER


@router.post("/spillback")
def trace_spillback(req: SpillbackRequest) -> Dict[str, Any]:
    """Calculate upstream shockwave propagation and affected OD demand pairs."""
    tracer = _get_tracer()
    cascade = tracer.trace_spillback(
        incident_segment_id=req.segment_id,
        initial_speed_drop_pct=req.speed_drop_pct,
        max_hops=req.max_hops,
    )
    affected_ods = tracer.find_affected_od_flows(cascade)

    return {
        "incident_segment": req.segment_id,
        "total_impacted_segments": len(cascade),
        "cascade_steps": cascade,
        "affected_od_pairs": affected_ods[:10],
    }


@router.post("/diversions")
def plan_diversions(req: DiversionRequest) -> Dict[str, Any]:
    """Generate viable alternative routes enforcing turn restrictions and capacity checks."""
    planner = _get_planner()
    plan = planner.compute_diversions(
        incident_segment_id=req.segment_id,
        k_paths=req.k_paths,
    )
    return plan


@router.post("/signal-tune")
def optimize_signal(req: SignalOptimizeRequest) -> Dict[str, Any]:
    """Generate advisory signal plan adjustments for queue flushing or inflow metering."""
    optimizer = _get_optimizer()
    advisory = optimizer.optimize_signal_for_corridor(
        node_id=req.node_id,
        congestion_level=req.congestion_level,
        queue_length_veh=req.queue_length_veh,
        is_spillback_upstream=req.is_spillback_upstream,
    )
    return advisory
