"""
Traffic Signal Optimization Advisory Module.

Analyzes active signal plans (signal_plans.csv) across 89 junction controllers.
Generates advisory signal timing recommendations (green ratio adjustments,
offset shifts, and cycle extensions) to meter inflow before congestion builds
and accelerate queue clearance during incidents.
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

import pandas as pd

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

_DATA_DIR = _PROJECT_ROOT / "NEURAX_SMART_CITIES_TRAINING_V2"


class SignalOptimizer:
    """Computes simulated green-ratio adjustments for network junctions."""

    def __init__(self) -> None:
        self.signal_df: pd.DataFrame = pd.DataFrame()
        self._load_signals()

    def _load_signals(self) -> None:
        sig_path = _DATA_DIR / "signal_plans.csv"
        if sig_path.exists():
            self.signal_df = pd.read_csv(sig_path)

    def optimize_signal_for_corridor(
        self,
        node_id: str,
        congestion_level: str,
        queue_length_veh: float = 0.0,
        is_spillback_upstream: bool = False,
    ) -> dict[str, Any]:
        """
        Generate advisory signal timing modifications for a specific junction node.

        Args:
            node_id: Intersection identifier (e.g. N023).
            congestion_level: FREE_FLOW, MODERATE, HEAVY, or GRIDLOCK.
            queue_length_veh: Current vehicle queue in meters or vehicles.
            is_spillback_upstream: If True, node is upstream and needs inflow metering.
        """
        if self.signal_df.empty or node_id not in self.signal_df["node_id"].values:
            return {
                "node_id": node_id,
                "has_signal": False,
                "action": "NO_CONTROLLED_SIGNAL",
                "recommendation": "Junction operates under unsignalized priority rule.",
            }

        sig_row = self.signal_df[self.signal_df["node_id"] == node_id].iloc[0]
        sig_id = str(sig_row["signal_id"])
        base_cycle_s = int(sig_row["cycle_s"])
        base_green_ratio = float(sig_row["green_ratio"])
        base_offset_s = int(sig_row["offset_s"])

        # Advisory logic based on state
        if is_spillback_upstream:
            # Meter inflow: reduce green time on feeding approach by 15-25%
            target_green_ratio = max(base_green_ratio - 0.15, 0.30)
            target_cycle_s = base_cycle_s
            target_offset_s = (base_offset_s + 10) % base_cycle_s
            action = "METER_INFLOW"
            rationale = (
                f"Upstream bottleneck detected. Reduce green ratio from {base_green_ratio:.2f} "
                f"to {target_green_ratio:.2f} for 3-5 cycles to restrict inflow and prevent gridlock."
            )
        elif congestion_level in ["HEAVY", "GRIDLOCK"]:
            # Flush queue: increase green time by 20-30%
            target_green_ratio = min(base_green_ratio + 0.20, 0.80)
            target_cycle_s = min(base_cycle_s + 20, 150)
            target_offset_s = base_offset_s
            action = "FLUSH_QUEUE"
            rationale = (
                f"Heavy queue ({queue_length_veh:.0f} veh) detected. Extend green ratio from {base_green_ratio:.2f} "
                f"to {target_green_ratio:.2f} and cycle from {base_cycle_s}s to {target_cycle_s}s."
            )
        elif congestion_level == "MODERATE":
            target_green_ratio = min(base_green_ratio + 0.08, 0.70)
            target_cycle_s = base_cycle_s
            target_offset_s = base_offset_s
            action = "PROGRESSION_SYNC"
            rationale = f"Slight congestion building. Adjust green ratio to {target_green_ratio:.2f} to sustain smooth flow."
        else:
            target_green_ratio = base_green_ratio
            target_cycle_s = base_cycle_s
            target_offset_s = base_offset_s
            action = "MAINTAIN_BASE_PLAN"
            rationale = "Traffic is free-flowing. Maintain standard baseline timing plan."

        # Compute estimated throughput improvement (%)
        delta_green = target_green_ratio - base_green_ratio
        est_throughput_gain_pct = round(delta_green * 100.0 * 0.85, 1)

        return {
            "node_id": node_id,
            "signal_id": sig_id,
            "has_signal": True,
            "action": action,
            "base_cycle_s": base_cycle_s,
            "target_cycle_s": target_cycle_s,
            "base_green_ratio": base_green_ratio,
            "target_green_ratio": round(target_green_ratio, 3),
            "base_offset_s": base_offset_s,
            "target_offset_s": target_offset_s,
            "est_throughput_gain_pct": est_throughput_gain_pct,
            "rationale": rationale,
            "simulation_mode": "ADVISORY_ONLY",
        }


def main() -> None:
    optimizer = SignalOptimizer()
    nodes = ["N015", "N023", "N001"]
    print("🚦 Signal Plan Optimization Advisories:")
    for nid in nodes:
        plan = optimizer.optimize_signal_for_corridor(nid, congestion_level="HEAVY", queue_length_veh=45.0)
        print(f"\nNode {nid} ({plan.get('signal_id', 'N/A')}): Action = {plan['action']}")
        print(f"  {plan['rationale']}")
        if plan.get("has_signal"):
            print(f"  Green Ratio: {plan['base_green_ratio']} -> {plan['target_green_ratio']} | Cycle: {plan['base_cycle_s']}s -> {plan['target_cycle_s']}s")


if __name__ == "__main__":
    main()
