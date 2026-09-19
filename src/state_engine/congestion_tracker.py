"""
Congestion Tracker — classifies congestion levels per (timestamp, segment_id)
and identifies recurring bottlenecks.

Congestion levels (based on speed_ratio = speed_kmh / free_flow_speed_kmh):
  FREE_FLOW  : speed_ratio > 0.8
  MODERATE   : 0.5 < speed_ratio <= 0.8
  HEAVY      : 0.3 < speed_ratio <= 0.5
  GRIDLOCK   : speed_ratio <= 0.3
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from enum import IntEnum

import numpy as np
import pandas as pd


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_RAW = BASE_DIR / "NEURAX_SMART_CITIES_TRAINING_V2"
DATA_PROCESSED = BASE_DIR / "data" / "processed"

PEAK_HOURS_AM = range(7, 11)   # 7,8,9,10 → 07:00-10:59
PEAK_HOURS_PM = range(17, 20)  # 17,18,19 → 17:00-19:59
BOTTLENECK_THRESHOLD = 0.40    # ≥40% of peak-hour readings HEAVY/GRIDLOCK


class CongestionLevel(IntEnum):
    FREE_FLOW = 0
    MODERATE = 1
    HEAVY = 2
    GRIDLOCK = 3


LEVEL_LABELS = {
    CongestionLevel.FREE_FLOW: "FREE_FLOW",
    CongestionLevel.MODERATE: "MODERATE",
    CongestionLevel.HEAVY: "HEAVY",
    CongestionLevel.GRIDLOCK: "GRIDLOCK",
}


# ---------------------------------------------------------------------------
# Data loading helpers
# ---------------------------------------------------------------------------

def _load_traffic(path: str | Path | None = None) -> pd.DataFrame:
    """Load traffic data — prefer processed/clean, fall back to raw."""
    if path is not None:
        p = Path(path)
    else:
        clean = DATA_PROCESSED / "traffic_train_clean.csv"
        raw = DATA_RAW / "traffic_train.csv"
        p = clean if clean.exists() else raw

    df = pd.read_csv(p, parse_dates=["timestamp"])
    return df


def _load_network(path: str | Path | None = None) -> pd.DataFrame:
    if path is not None:
        p = Path(path)
    else:
        p = DATA_RAW / "network.csv"
    return pd.read_csv(p)


# ---------------------------------------------------------------------------
# Core classification
# ---------------------------------------------------------------------------

def classify_congestion(
    traffic_df: pd.DataFrame,
    network_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Add ``congestion_level`` (str) and ``tti`` (float) columns.

    Parameters
    ----------
    traffic_df : DataFrame with at least
        [timestamp, segment_id, speed_kmh, travel_time_min, free_flow_time_min]
    network_df : DataFrame with [segment_id, free_flow_speed_kmh, capacity_vph]

    Returns
    -------
    DataFrame — copy of traffic_df with extra columns:
        speed_ratio, flow_ratio, tti, congestion_level, congestion_level_int
    """
    # Merge network attributes
    net_cols = ["segment_id", "free_flow_speed_kmh", "capacity_vph"]
    df = traffic_df.merge(
        network_df[net_cols],
        on="segment_id",
        how="left",
    )

    # Ratios
    df["speed_ratio"] = df["speed_kmh"] / df["free_flow_speed_kmh"].replace(0, np.nan)
    df["flow_ratio"] = df["flow_vph"] / df["capacity_vph"].replace(0, np.nan)

    # Travel Time Index
    df["tti"] = df["travel_time_min"] / df["free_flow_time_min"].replace(0, np.nan)

    # Classify
    conditions = [
        df["speed_ratio"] > 0.8,
        df["speed_ratio"] > 0.5,
        df["speed_ratio"] > 0.3,
    ]
    choices = [
        CongestionLevel.FREE_FLOW,
        CongestionLevel.MODERATE,
        CongestionLevel.HEAVY,
    ]
    df["congestion_level_int"] = np.select(
        conditions, choices, default=CongestionLevel.GRIDLOCK
    ).astype(int)
    df["congestion_level"] = df["congestion_level_int"].map(LEVEL_LABELS)

    return df


# ---------------------------------------------------------------------------
# Recurring bottleneck detection
# ---------------------------------------------------------------------------

def _is_peak_hour(hour: int) -> bool:
    return hour in PEAK_HOURS_AM or hour in PEAK_HOURS_PM


def get_recurring_bottlenecks(
    classified_df: pd.DataFrame,
    threshold: float = BOTTLENECK_THRESHOLD,
) -> pd.DataFrame:
    """
    Return segments where congestion is HEAVY or GRIDLOCK for >= ``threshold``
    fraction of peak-hour readings across all training days.

    Returns DataFrame with columns:
        segment_id, total_peak_readings, heavy_gridlock_readings,
        heavy_gridlock_pct, is_bottleneck
    """
    df = classified_df.copy()
    df["hour"] = df["timestamp"].dt.hour
    peak = df[df["hour"].apply(_is_peak_hour)]

    stats = (
        peak
        .groupby("segment_id")
        .agg(
            total_peak_readings=("congestion_level_int", "count"),
            heavy_gridlock_readings=(
                "congestion_level_int",
                lambda s: (s >= CongestionLevel.HEAVY).sum(),
            ),
        )
        .reset_index()
    )
    stats["heavy_gridlock_pct"] = (
        stats["heavy_gridlock_readings"] / stats["total_peak_readings"]
    )
    stats["is_bottleneck"] = stats["heavy_gridlock_pct"] >= threshold
    stats = stats.sort_values("heavy_gridlock_pct", ascending=False).reset_index(drop=True)
    return stats


# ---------------------------------------------------------------------------
# Network state snapshot
# ---------------------------------------------------------------------------

def get_network_state_snapshot(
    classified_df: pd.DataFrame,
    timestamp: str | pd.Timestamp,
) -> dict[str, str]:
    """
    Return {segment_id: congestion_level} at a given timestamp.

    If the exact timestamp isn't present, the nearest reading within ±10 min
    is used.
    """
    ts = pd.Timestamp(timestamp)
    df = classified_df.copy()
    df["_delta"] = (df["timestamp"] - ts).abs()
    nearest = df.loc[df.groupby("segment_id")["_delta"].idxmin()]
    # Only keep if within 10 min
    nearest = nearest[nearest["_delta"] <= pd.Timedelta(minutes=10)]
    return dict(zip(nearest["segment_id"], nearest["congestion_level"]))


# ---------------------------------------------------------------------------
# Main — process training data & save
# ---------------------------------------------------------------------------

def main() -> None:
    print("=" * 60)
    print("  Congestion Tracker — processing training data")
    print("=" * 60)

    traffic_df = _load_traffic()
    network_df = _load_network()

    print(f"Traffic rows loaded : {len(traffic_df):,}")
    print(f"Network segments    : {len(network_df):,}")

    # Classify
    classified = classify_congestion(traffic_df, network_df)

    # Summary
    print("\n--- Congestion Level Distribution ---")
    dist = classified["congestion_level"].value_counts().sort_index()
    for level, count in dist.items():
        pct = count / len(classified) * 100
        print(f"  {level:12s}: {count:>10,}  ({pct:.1f}%)")

    print(f"\n--- TTI stats ---")
    print(f"  Mean TTI : {classified['tti'].mean():.3f}")
    print(f"  Median   : {classified['tti'].median():.3f}")
    print(f"  95th pct : {classified['tti'].quantile(0.95):.3f}")
    print(f"  Max      : {classified['tti'].max():.3f}")

    # Bottlenecks
    bottlenecks = get_recurring_bottlenecks(classified)
    bn = bottlenecks[bottlenecks["is_bottleneck"]]
    print(f"\n--- Recurring Bottlenecks (>={BOTTLENECK_THRESHOLD*100:.0f}% peak congested) ---")
    print(f"  Total segments : {len(bottlenecks)}")
    print(f"  Bottlenecks    : {len(bn)}")
    if len(bn) > 0:
        print(bn[["segment_id", "heavy_gridlock_pct", "total_peak_readings"]].head(20).to_string(index=False))

    # Save
    DATA_PROCESSED.mkdir(parents=True, exist_ok=True)
    out_path = DATA_PROCESSED / "congestion_classified.csv"
    classified.to_csv(out_path, index=False)
    print(f"\nSaved classified data → {out_path}")

    # Quick snapshot demo
    sample_ts = classified["timestamp"].iloc[len(classified) // 2]
    snap = get_network_state_snapshot(classified, sample_ts)
    print(f"\nSnapshot at {sample_ts}: {len(snap)} segments")
    heavy_count = sum(1 for v in snap.values() if v in ("HEAVY", "GRIDLOCK"))
    print(f"  Heavy/Gridlock segments at snapshot: {heavy_count}")

    print("\nDone.")


if __name__ == "__main__":
    main()
