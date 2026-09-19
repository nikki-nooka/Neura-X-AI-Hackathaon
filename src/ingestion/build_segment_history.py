"""
Extract latest cleaned telemetry sequences for real-time inference.
Generates:
1. data/processed/latest_segment_snapshot.json (latest state at T_now)
2. data/processed/latest_segment_history.json (last 7 steps: T-30m to T_now)
"""
from __future__ import annotations

import json
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

def build_history():
    val_clean = PROCESSED_DIR / "traffic_validation_clean.csv"
    train_clean = PROCESSED_DIR / "traffic_train_clean.csv"
    src_file = val_clean if val_clean.exists() else train_clean
    
    print(f"Reading latest observations from {src_file.name}...")
    df = pd.read_csv(src_file)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    # Sort chronologically per segment
    df = df.sort_values(["segment_id", "timestamp"]).reset_index(drop=True)
    
    # Get last 7 records for each segment (covers 30 mins of history + current step)
    history_df = df.groupby("segment_id").tail(7).reset_index(drop=True)
    
    history_dict = {}
    snapshot_list = []
    
    cols_to_keep = [
        "timestamp", "speed_kmh", "flow_vph", "occupancy_pct",
        "travel_time_min", "free_flow_time_min", "delay_min",
        "queue_length_veh", "congestion_index", "sensor_quality",
        "rain_intensity", "event_level", "roadwork_active"
    ]
    
    for seg_id, group in history_df.groupby("segment_id"):
        records = []
        for _, row in group.iterrows():
            item = {"timestamp": str(row["timestamp"])}
            for c in cols_to_keep:
                if c != "timestamp":
                    val = row.get(c, 0.0)
                    item[c] = float(val) if pd.notnull(val) else 0.0
            records.append(item)
        
        history_dict[seg_id] = records
        # Latest record is snapshot
        latest_rec = records[-1].copy()
        latest_rec["segment_id"] = seg_id
        snapshot_list.append(latest_rec)
        
    hist_out = PROCESSED_DIR / "latest_segment_history.json"
    with open(hist_out, "w") as f:
        json.dump(history_dict, f, indent=2)
    print(f"✓ Saved latest segment history (7 steps per segment) to {hist_out}")
    
    snap_out = PROCESSED_DIR / "latest_segment_snapshot.json"
    with open(snap_out, "w") as f:
        json.dump(snapshot_list, f, indent=2)
    print(f"✓ Saved latest segment snapshot ({len(snapshot_list)} segments) to {snap_out}")

if __name__ == "__main__":
    build_history()
