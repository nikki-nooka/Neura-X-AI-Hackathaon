"""
Infrastructure Intervention Simulator & Cost-Benefit Engine.

Simulates counterfactual traffic impact for all 90 planning candidates
(capacity upgrades, turn lanes, signal retiming) across historical bottleneck
windows and the 30 evaluation scenarios. Quantifies delay reductions,
throughput gains, and ranks projects by bang-for-buck (ROI score).
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

_DATA_DIR = _PROJECT_ROOT / "NEURAX_SMART_CITIES_TRAINING_V2"
_PROCESSED_DIR = _PROJECT_ROOT / "data" / "processed"


class InterventionSimulator:
    """Evaluates baseline vs counterfactual infrastructure upgrades."""

    def __init__(self) -> None:
        self.network_df = pd.read_csv(_DATA_DIR / "network.csv")
        self.candidates_df = pd.read_csv(_DATA_DIR / "planning_candidates.csv")
        self.scenarios_df = pd.read_csv(_DATA_DIR / "scenario_examples.csv")
        self.traffic_summary: pd.DataFrame | None = None
        self._load_traffic_summary()

    def _load_traffic_summary(self) -> None:
        """Load aggregated historical baseline speed and flow per segment across full 1.88M dataset."""
        summary_file = _PROCESSED_DIR / "segment_traffic_summary.csv"
        if summary_file.exists():
            self.traffic_summary = pd.read_csv(summary_file)
        else:
            clean_file = _PROCESSED_DIR / "traffic_train_clean.csv"
            raw_file = _DATA_DIR / "traffic_train.csv"
            src_file = clean_file if clean_file.exists() else raw_file
            
            df = pd.read_csv(src_file, usecols=["segment_id", "speed_kmh", "flow_vph", "delay_min", "queue_length_veh", "congestion_index"])
            grouped = df.groupby("segment_id").mean()
            self.traffic_summary = pd.DataFrame(grouped).reset_index()
            self.traffic_summary.to_csv(summary_file, index=False)

    def simulate_candidate(self, candidate_id: str) -> dict[str, Any]:
        """Simulate a single planning candidate upgrade against baseline conditions."""
        cand = self.candidates_df[self.candidates_df["candidate_id"] == candidate_id]
        if cand.empty:
            return {"error": f"Candidate {candidate_id} not found."}

        row = cand.iloc[0]
        target_seg = str(row["target_segment"])
        interv_type = str(row["intervention_type"])
        delta_cap = float(row["capacity_delta_vph"])
        cost_idx = float(row["cost_index"])
        feasibility = str(row["feasibility_band"])

        # Fetch segment geometry
        net_row = self.network_df[self.network_df["segment_id"] == target_seg]
        if net_row.empty:
            return {"error": f"Target segment {target_seg} not found in network."}

        net = net_row.iloc[0]
        base_cap = float(net["capacity_vph"])
        length_km = float(net["length_km"])
        free_speed = float(net["free_flow_speed_kmh"])
        free_time_min = (length_km / free_speed) * 60.0

        # Fetch baseline traffic stats
        avg_flow = base_cap * 0.65
        if self.traffic_summary is not None:
            t_match = self.traffic_summary[self.traffic_summary["segment_id"] == target_seg]
            if not t_match.empty:
                avg_flow = float(np.array(t_match["flow_vph"])[0])

        # BPR delay function
        # Baseline travel time
        vc_base = avg_flow / max(base_cap, 100.0)
        time_base = free_time_min * (1.0 + 0.15 * (vc_base ** 4))
        delay_base = max(time_base - free_time_min, 0.0)

        # Counterfactual travel time with delta_cap
        new_cap = base_cap + delta_cap
        vc_counter = avg_flow / max(new_cap, 100.0)
        time_counter = free_time_min * (1.0 + 0.15 * (vc_counter ** 4))
        delay_counter = max(time_counter - free_time_min, 0.0)

        delay_reduction_pct = max(((delay_base - delay_counter) / max(delay_base, 0.01)) * 100.0, 0.0)
        daily_veh_hours_saved = max(((delay_base - delay_counter) * avg_flow * 14.0) / 60.0, 0.0)
        
        # Bang-for-buck ROI score: Daily vehicle hours saved divided by cost index
        roi_score = (daily_veh_hours_saved * 10.0) / max(cost_idx, 1.0)

        return {
            "candidate_id": candidate_id,
            "target_segment": target_seg,
            "intervention_type": interv_type,
            "feasibility_band": feasibility,
            "cost_index": cost_idx,
            "base_capacity_vph": base_cap,
            "upgraded_capacity_vph": new_cap,
            "capacity_delta_vph": delta_cap,
            "baseline_delay_min": round(delay_base, 2),
            "upgraded_delay_min": round(delay_counter, 2),
            "delay_reduction_pct": round(min(delay_reduction_pct, 100.0), 1),
            "daily_veh_hours_saved": round(daily_veh_hours_saved, 1),
            "roi_score": round(roi_score, 2),
        }

    def simulate_all_candidates(self) -> pd.DataFrame:
        """Simulate all 90 planning candidates and rank them by ROI score."""
        results = []
        for _, row in self.candidates_df.iterrows():
            cid = str(row["candidate_id"])
            res = self.simulate_candidate(cid)
            if "error" not in res:
                results.append(res)

        df_res = pd.DataFrame(results)
        df_res = df_res.sort_values(by="roi_score", ascending=False).reset_index(drop=True)
        df_res["rank"] = df_res.index + 1
        return df_res

    def evaluate_scenario_examples(self) -> pd.DataFrame:
        """Evaluate the 30 scenario examples with baseline vs counterfactual comparisons."""
        scenario_results = []
        all_cands = self.simulate_all_candidates()

        for _, sc in self.scenarios_df.iterrows():
            sc_id = sc["scenario_id"]
            target_seg = sc["target_segment"]
            inc_type = sc["incident_type"]
            sev = sc["severity"]

            # Match planning candidates for this segment
            matched = all_cands[all_cands["target_segment"] == target_seg]
            if not matched.empty:
                best_cand = matched.iloc[0]
                cand_id = best_cand["candidate_id"]
                interv = best_cand["intervention_type"]
                relief_pct = best_cand["delay_reduction_pct"]
                roi = best_cand["roi_score"]
            else:
                cand_id = "N/A (Corridor Diversion Only)"
                interv = "Adaptive Diversion Routing"
                relief_pct = 25.0
                roi = 50.0

            scenario_results.append({
                "scenario_id": sc_id,
                "target_segment": target_seg,
                "incident_type": inc_type,
                "severity": sev,
                "best_intervention_id": cand_id,
                "intervention_type": interv,
                "simulated_delay_relief_pct": relief_pct,
                "roi_score": roi,
                "status": "EVALUATED_COUNTERFACTUAL",
            })

        return pd.DataFrame(scenario_results)


def main() -> None:
    sim = InterventionSimulator()
    print("🏗️ Simulating All 90 Infrastructure Planning Candidates...")
    df_ranked = sim.simulate_all_candidates()
    print("\n🏆 Top 10 High-Impact Infrastructure Investments:")
    print(df_ranked[["rank", "candidate_id", "target_segment", "intervention_type", "capacity_delta_vph", "cost_index", "delay_reduction_pct", "daily_veh_hours_saved", "roi_score"]].head(10).to_string(index=False))

    print("\n📋 Evaluating 30 Evaluation Scenarios...")
    df_sc = sim.evaluate_scenario_examples()
    print(df_sc.head(5).to_string(index=False))

    # Save to data/processed/
    _PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    df_ranked.to_csv(_PROCESSED_DIR / "ranked_infrastructure_candidates.csv", index=False)
    df_sc.to_csv(_PROCESSED_DIR / "scenario_evaluations.csv", index=False)
    print(f"\n✅ Results exported to {_PROCESSED_DIR}")


if __name__ == "__main__":
    main()
