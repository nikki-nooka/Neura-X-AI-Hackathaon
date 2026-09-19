"""
Network Resilience & Vulnerability API Endpoints.
"""
from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter
from pydantic import BaseModel

from src.resilience.resilience_analyzer import ResilienceAnalyzer

router = APIRouter(prefix="/api/resilience", tags=["Network Resilience"])

_ANALYZER: ResilienceAnalyzer | None = None


def _get_analyzer() -> ResilienceAnalyzer:
    global _ANALYZER
    if _ANALYZER is None:
        _ANALYZER = ResilienceAnalyzer()
    return _ANALYZER


class ClosureSimulationRequest(BaseModel):
    segment_id: str
    duration_min: int = 30


@router.post("/simulate")
def simulate_segment_closure(req: ClosureSimulationRequest) -> Dict[str, Any]:
    """Simulate a 15, 30, or 60 minute closure of a segment and quantify cascading impact."""
    analyzer = _get_analyzer()
    return analyzer.simulate_closure(req.segment_id, duration_min=req.duration_min)


@router.get("/criticality/{segment_id}")
def get_segment_criticality(segment_id: str) -> Dict[str, Any]:
    """Compute transparent Modeled Network Criticality score for a road segment."""
    analyzer = _get_analyzer()
    return analyzer.calculate_criticality(segment_id)


@router.get("/top-critical")
def get_top_critical_segments() -> List[Dict[str, Any]]:
    """Return top 10 most critical segments across the road network."""
    analyzer = _get_analyzer()
    return analyzer.get_top_critical_segments(top_n=10)
