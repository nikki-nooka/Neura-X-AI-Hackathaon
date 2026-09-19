"""
Weekly Traffic Intelligence API Endpoints.
"""
from __future__ import annotations

from typing import Any, Dict
from fastapi import APIRouter

from src.analytics.weekly_analyzer import WeeklyIntelligenceAnalyzer

router = APIRouter(prefix="/api/intelligence", tags=["Weekly Intelligence"])

_ANALYZER: WeeklyIntelligenceAnalyzer | None = None


def _get_analyzer() -> WeeklyIntelligenceAnalyzer:
    global _ANALYZER
    if _ANALYZER is None:
        _ANALYZER = WeeklyIntelligenceAnalyzer()
    return _ANALYZER


@router.get("/weekly-summary")
def get_weekly_summary() -> Dict[str, Any]:
    """Return comprehensive 15-day historical intelligence summary."""
    analyzer = _get_analyzer()
    return analyzer.generate_weekly_report()
