"""
Natural Language Situational Briefing Generator.

Transforms structured sensor telemetry, incident classifications, spillback paths,
and diversion advisories into plain-language situational reports.
Supports Groq Llama 3.3 70B free-tier API and an offline multi-lingual generator
(English, Hindi, Telugu).
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))


class BriefingGenerator:
    """Generates human-readable situational briefs for command center personnel."""

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        self.client = None
        if self.api_key:
            try:
                from groq import Groq
                self.client = Groq(api_key=self.api_key)
            except Exception:
                self.client = None

    def generate_briefing(
        self,
        incident_id: str,
        segment_id: str,
        incident_type: str,
        severity: int,
        lanes_blocked: int,
        current_speed: float,
        current_flow: float,
        capacity: float,
        spillback_segments: list[str],
        diversion_route: list[str] | None = None,
        signal_advisory: str | None = None,
        language: str = "en",
    ) -> str:
        """
        Generate a concise situational briefing in the requested language.

        Languages supported: 'en' (English), 'hi' (Hindi), 'te' (Telugu).
        """
        prompt = (
            f"You are the NeuraX Smart Cities Traffic Intelligence Agent for a Hyderabad-scale network.\n"
            f"Generate a concise, authoritative, professional 3-4 sentence operational briefing for the Command Center.\n"
            f"Details:\n"
            f"- Incident: {incident_id} on segment {segment_id}\n"
            f"- Type: {incident_type} (Severity {severity}/3, {lanes_blocked} lane(s) blocked)\n"
            f"- Current Telemetry: Speed {current_speed:.1f} km/h, Flow {current_flow:.0f} vph vs Capacity {capacity:.0f} vph\n"
            f"- Spillback Risk: Propagating to upstream segments {', '.join(spillback_segments[:3]) if spillback_segments else 'Localized'}\n"
            f"- Recommended Diversion: Via {', '.join(diversion_route) if diversion_route else 'No bypass needed'}\n"
            f"- Signal Action: {signal_advisory or 'Maintain baseline timing'}\n"
            f"Language: {language.upper()} (Respond strictly in the requested language)."
        )

        if self.client is not None:
            try:
                resp = self.client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": "You are a concise smart-city traffic dispatch intelligence system."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=250,
                    temperature=0.2,
                )
                content = resp.choices[0].message.content
                if content:
                    return content.strip()
            except Exception:
                pass

        # Robust Offline Multi-Lingual Fallback Template Engine
        return self._generate_offline_template(
            incident_id=incident_id,
            segment_id=segment_id,
            incident_type=incident_type,
            severity=severity,
            lanes_blocked=lanes_blocked,
            current_speed=current_speed,
            current_flow=current_flow,
            capacity=capacity,
            spillback_segments=spillback_segments,
            diversion_route=diversion_route,
            signal_advisory=signal_advisory,
            language=language,
        )

    def _generate_offline_template(
        self,
        incident_id: str,
        segment_id: str,
        incident_type: str,
        severity: int,
        lanes_blocked: int,
        current_speed: float,
        current_flow: float,
        capacity: float,
        spillback_segments: list[str],
        diversion_route: list[str] | None,
        signal_advisory: str | None,
        language: str,
    ) -> str:
        occ_ratio = (current_flow / max(capacity, 1.0)) * 100.0
        spill_str = ", ".join(spillback_segments[:3]) if spillback_segments else "Localized"
        div_str = " -> ".join(diversion_route) if diversion_route else "Direct corridor"

        if language.lower() == "hi":
            return (
                f"🚨 **यातायात चेतावनी [{incident_id}]**: सेगमेंट **{segment_id}** पर **{incident_type}** (गंभीरता {severity}, {lanes_blocked} लेन अवरुद्ध) दर्ज किया गया है। "
                f"वर्तमान गति {current_speed:.1f} किमी/घंटा और प्रवाह क्षमता का {occ_ratio:.0f}% है। "
                f"कतार का फैलाव (Spillback) {spill_str} तक पहुंचने की संभावना है। "
                f"अनुशंसा: यातायात को **{div_str}** के माध्यम से डायवर्ट करें। {signal_advisory or ''}"
            )
        elif language.lower() == "te":
            return (
                f"🚨 **ట్రాఫిక్ హెచ్చరిక [{incident_id}]**: సెగ్మెంట్ **{segment_id}** వద్ద **{incident_type}** (తీవ్రత {severity}, {lanes_blocked} లేన్లు బ్లాక్) గుర్తించబడింది. "
                f"ప్రస్తుత వేగం {current_speed:.1f} km/h మరియు రద్దీ సామర్థ్యంలో {occ_ratio:.0f}% ఉంది. "
                f"జామ్ ప్రభావం {spill_str} వైపు విస్తరిస్తోంది. "
                f"సిఫార్సు: ట్రాఫిక్ను **{div_str}** ద్వారా మళ్లించండి. {signal_advisory or ''}"
            )
        else:
            return (
                f"🚨 **OPERATIONAL ADVISORY [{incident_id}]**: An active **{incident_type.replace('_', ' ').title()}** "
                f"(Severity {severity}/3, {lanes_blocked} lane blocked) has been detected on corridor **{segment_id}**. "
                f"Current speed dropped to {current_speed:.1f} km/h with flow at {occ_ratio:.0f}% of capacity. "
                f"Queue spillback is actively propagating to upstream segments: **{spill_str}**. "
                f"Action Recommended: Divert corridor flow via **{div_str}**. {signal_advisory or 'Maintain adaptive signal phases.'}"
            )


def main() -> None:
    gen = BriefingGenerator()
    for lang in ["en", "hi", "te"]:
        brief = gen.generate_briefing(
            incident_id="INC_501_00001",
            segment_id="R0435",
            incident_type="stalled_vehicle",
            severity=2,
            lanes_blocked=1,
            current_speed=14.5,
            current_flow=1850.0,
            capacity=2700.0,
            spillback_segments=["R0434", "R0420", "R0418"],
            diversion_route=["R0430", "R0422", "R0410"],
            signal_advisory="Extend green ratio at N023 by 15% for 3 cycles.",
            language=lang,
        )
        print(f"\n[{lang.upper()} BRIEFING]:\n{brief}\n")


if __name__ == "__main__":
    main()
