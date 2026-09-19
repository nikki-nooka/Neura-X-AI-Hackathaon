"""
Natural Language Operational Dispatch Briefing Endpoints.
"""
from __future__ import annotations

from typing import Any, Dict
from fastapi import APIRouter

from api.schemas import BriefingRequest
from src.advisory.briefing_generator import BriefingGenerator

router = APIRouter(prefix="/api/briefing", tags=["Briefings"])

_GENERATOR: BriefingGenerator | None = None


def _get_generator() -> BriefingGenerator:
    global _GENERATOR
    if _GENERATOR is None:
        _GENERATOR = BriefingGenerator()
    return _GENERATOR


@router.post("/generate")
def generate_briefing(req: BriefingRequest) -> Dict[str, Any]:
    """Generate situational briefing in requested language (EN/HI/TE)."""
    generator = _get_generator()
    text = generator.generate_briefing(
        incident_id=req.incident_id,
        segment_id=req.segment_id,
        incident_type=req.incident_type,
        severity=req.severity,
        lanes_blocked=req.lanes_blocked,
        current_speed=req.current_speed,
        current_flow=req.current_flow,
        capacity=req.capacity,
        spillback_segments=req.spillback_segments,
        diversion_route=req.diversion_route,
        signal_advisory=req.signal_advisory,
        language=req.language.lower(),
    )

    provider = "Groq Llama 3.3 70B Cloud" if generator.client is not None else "Deterministic Offline AI Engine"

    return {
        "incident_id": req.incident_id,
        "segment_id": req.segment_id,
        "language": req.language.upper(),
        "provider": provider,
        "briefing": text,
    }
