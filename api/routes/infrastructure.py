"""
Strategic Infrastructure Simulation & Planning ROI Endpoints.
"""
from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter

from src.infrastructure.intervention_simulator import InterventionSimulator

router = APIRouter(prefix="/api/infrastructure", tags=["Infrastructure"])

_SIMULATOR: InterventionSimulator | None = None


def _get_simulator() -> InterventionSimulator:
    global _SIMULATOR
    if _SIMULATOR is None:
        _SIMULATOR = InterventionSimulator()
    return _SIMULATOR


@router.get("/candidates")
def get_all_candidates() -> List[Dict[str, Any]]:
    """Return all 90 simulated planning candidates ranked by ROI."""
    sim = _get_simulator()
    df = sim.simulate_all_candidates()
    return df.to_dict(orient="records")


@router.get("/candidate/{candidate_id}")
def inspect_candidate(candidate_id: str) -> Dict[str, Any]:
    """Return detailed before-and-after metrics for a specific upgrade candidate."""
    sim = _get_simulator()
    detail = sim.simulate_candidate(candidate_id)
    return detail


@router.get("/scenarios")
def get_scenario_evaluations() -> List[Dict[str, Any]]:
    """Return counterfactual evaluations for all 30 competition scenario examples."""
    sim = _get_simulator()
    df = sim.evaluate_scenario_examples()
    return df.to_dict(orient="records")
