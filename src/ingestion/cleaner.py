"""
Data cleaning pipeline for urban traffic sensor data.

Handles the 6 known noise types in the NEURAX dataset:
  1. Missing values  → forward-fill + linear interpolation
  2. Duplicates      → deduplicate on (timestamp, segment_id)
  3. Spikes          → rolling-median clipping (4σ)
  4. Stuck sensors   → flag sensor_quality=0 for zero-variance runs ≥6
  5. Negative values → set to NaN
  6. Row shuffle     → sort by (timestamp, segment_id)

Also merges context weather data and roadworks into a binary feature.

Usage:
    python src/ingestion/cleaner.py
"""

from __future__ import annotations

import time
from pathlib import Path

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
DATA_DIR = Path(__file__).resolve().parents[2] / "NEURAX_SMART_CITIES_TRAINING_V2"
OUTPUT_DIR = Path(__file__).resolve().parents[2] / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Columns that must be non-negative
NON_NEG_COLS = [
    "speed_kmh",
    "flow_vph",
    "occupancy_pct",
    "queue_length_veh",
    "congestion_index",
]

# All numeric measurement columns (for spike/stuck detection + imputation)
NUMERIC_COLS = [
    "speed_kmh",
    "flow_vph",
    "occupancy_pct",
    "travel_time_min",
    "free_flow_time_min",
    "delay_min",
    "queue_length_veh",
    "congestion_index",
]

SPIKE_WINDOW = 12       # rolling window for spike detection (12 × 5 min = 1 hr)
SPIKE_SIGMA = 4.0       # threshold multiplier for spike clipping
STUCK_MIN_RUN = 6       # minimum consecutive identical readings to flag stuck
FFILL_LIMIT = 3         # forward-fill gap limit per segment


# ---------------------------------------------------------------------------
# 1. Load raw data
# ---------------------------------------------------------------------------
def load_traffic(split: str) -> pd.DataFrame:
    """Load traffic_{split}.csv with correct dtypes."""
    path = DATA_DIR / f"traffic_{split}.csv"
    df = pd.read_csv(path, parse_dates=["timestamp"])
    print(f"  Loaded {path.name}: {len(df):,} rows")
    return df


def load_context(split: str) -> pd.DataFrame:
    """Load context_{split}.csv."""
    path = DATA_DIR / f"context_{split}.csv"
    df = pd.read_csv(path, parse_dates=["timestamp"])
    print(f"  Loaded {path.name}: {len(df):,} rows")
    return df


def load_roadworks(split: str) -> pd.DataFrame:
    """Load roadworks_{split}.csv."""
    path = DATA_DIR / f"roadworks_{split}.csv"
    df = pd.read_csv(path, parse_dates=["start_time", "end_time"])
    print(f"  Loaded {path.name}: {len(df):,} rows")
    return df


# ---------------------------------------------------------------------------
# 2. Sort & deduplicate
# ---------------------------------------------------------------------------
def sort_and_dedup(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """Sort by (timestamp, segment_id) and remove exact duplicate keys."""
    df = df.sort_values(["timestamp", "segment_id"]).reset_index(drop=True)
    n_before = len(df)
    df = df.drop_duplicates(subset=["timestamp", "segment_id"], keep="first").reset_index(drop=True)
    n_dupes = n_before - len(df)
    return df, n_dupes


# ---------------------------------------------------------------------------
# 3. Fix negatives
# ---------------------------------------------------------------------------
def fix_negatives(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """Replace negative values in non-negative columns with NaN."""
    count = 0
    for col in NON_NEG_COLS:
        mask = df[col] < 0
        count += mask.sum()
        df.loc[mask, col] = np.nan
    return df, count


# ---------------------------------------------------------------------------
# 4. Detect stuck sensors
# ---------------------------------------------------------------------------
def flag_stuck_sensors(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """
    For each segment_id (sorted by timestamp), detect runs of ≥STUCK_MIN_RUN
    consecutive identical values across numeric columns (zero variance).
    Mark those rows' sensor_quality = 0.
    """
    stuck_count = 0
    # We work per-segment to detect runs
    segments = df["segment_id"].unique()

    # Pre-sort is already done, but ensure groupby preserves order
    stuck_mask = pd.Series(False, index=df.index)

    for seg in segments:
        seg_mask = df["segment_id"] == seg
        seg_idx = df.index[seg_mask]

        if len(seg_idx) < STUCK_MIN_RUN:
            continue

        # For each numeric col, compute diff from previous row
        seg_data = df.loc[seg_idx, NUMERIC_COLS]
        # A row is "same as previous" if all numeric cols are identical
        diffs = seg_data.diff().abs()
        # Row is identical to previous if all diffs are 0 (or both NaN)
        all_zero = (diffs.fillna(0) == 0).all(axis=1)

        # Find runs of True in all_zero (first row of each segment is always diff=NaN → 0)
        run_lengths = []
        run_start = None
        for i, (idx, val) in enumerate(all_zero.items()):
            if val:
                if run_start is None:
                    run_start = idx
            else:
                if run_start is not None:
                    run_end = all_zero.index[i - 1] if i > 0 else run_start
                    # Count the run length
                    start_pos = all_zero.index.get_loc(run_start)
                    end_pos = all_zero.index.get_loc(run_end)
                    run_len = end_pos - start_pos + 1
                    if run_len >= STUCK_MIN_RUN:
                        run_lengths.append((run_start, run_end))
                    run_start = None
        # Handle trailing run
        if run_start is not None:
            run_end = all_zero.index[-1]
            start_pos = all_zero.index.get_loc(run_start)
            end_pos = all_zero.index.get_loc(run_end)
            run_len = end_pos - start_pos + 1
            if run_len >= STUCK_MIN_RUN:
                run_lengths.append((run_start, run_end))

        for rs, re in run_lengths:
            stuck_mask.loc[rs:re] = True

    stuck_count = stuck_mask.sum()
    df.loc[stuck_mask, "sensor_quality"] = 0.0
    return df, int(stuck_count)


def flag_stuck_sensors_fast(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """
    Vectorised stuck-sensor detection using groupby + rolling.
    For each segment, compute rolling variance (window=STUCK_MIN_RUN) on each
    numeric col. If ALL numeric cols have zero variance in a window → stuck.
    """
    grouped = df.groupby("segment_id", sort=False)
    all_zero_var = None

    for col in NUMERIC_COLS:
        roll_var = grouped[col].transform(
            lambda s: s.rolling(window=STUCK_MIN_RUN, min_periods=STUCK_MIN_RUN).var()
        )
        col_zero = (roll_var.fillna(1) == 0)
        if all_zero_var is None:
            all_zero_var = col_zero
        else:
            all_zero_var = all_zero_var & col_zero

    # all_zero_var flags the LAST row of each stuck window.
    # Expand backward: shift the flag by 0..STUCK_MIN_RUN-1 positions within each group.
    # Convert to int to avoid type issues, then accumulate.
    flag_int = all_zero_var.astype(np.int8)
    expanded = flag_int.copy()
    for shift_n in range(1, STUCK_MIN_RUN):
        shifted = flag_int.groupby(df["segment_id"], sort=False).shift(-shift_n).fillna(0).astype(np.int8)
        expanded = expanded | shifted

    stuck_mask = expanded.astype(bool)
    stuck_count = int(stuck_mask.sum())
    df.loc[stuck_mask, "sensor_quality"] = 0.0
    return df, stuck_count


# ---------------------------------------------------------------------------
# 5. Detect and clip spikes
# ---------------------------------------------------------------------------
def clip_spikes(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """
    For each segment_id and each numeric column:
      - Compute rolling median and rolling std (window=SPIKE_WINDOW).
      - Where |value - rolling_median| > SPIKE_SIGMA * rolling_std, clip to rolling_median.
    Returns the clipped dataframe and total number of spikes clipped.
    """
    total_clipped = 0
    grouped = df.groupby("segment_id", sort=False)

    for col in NUMERIC_COLS:
        roll_med = grouped[col].transform(
            lambda s: s.rolling(window=SPIKE_WINDOW, center=True, min_periods=3).median()
        )
        roll_std = grouped[col].transform(
            lambda s: s.rolling(window=SPIKE_WINDOW, center=True, min_periods=3).std()
        )

        # Avoid zero std: use a floor
        roll_std = roll_std.clip(lower=1e-6)

        deviation = (df[col] - roll_med).abs()
        spike_mask = deviation > (SPIKE_SIGMA * roll_std)
        # Don't clip NaN values
        spike_mask = spike_mask & df[col].notna() & roll_med.notna()

        n_clipped = spike_mask.sum()
        total_clipped += n_clipped

        df.loc[spike_mask, col] = roll_med.loc[spike_mask]

    return df, int(total_clipped)


# ---------------------------------------------------------------------------
# 6. Impute missing values
# ---------------------------------------------------------------------------
def impute_missing(df: pd.DataFrame) -> pd.DataFrame:
    """Forward-fill within each segment (limit=FFILL_LIMIT), then linear interpolate."""
    grouped = df.groupby("segment_id", sort=False)

    for col in NUMERIC_COLS:
        # Forward fill within group
        df[col] = grouped[col].transform(lambda s: s.ffill(limit=FFILL_LIMIT))
        # Linear interpolation for remaining gaps
        df[col] = grouped[col].transform(lambda s: s.interpolate(method="linear", limit_direction="both"))

    return df


# ---------------------------------------------------------------------------
# 7. Merge context data
# ---------------------------------------------------------------------------
def merge_context(df: pd.DataFrame, context: pd.DataFrame) -> pd.DataFrame:
    """Left-join context (weather/events) onto traffic by timestamp."""
    df = df.merge(context, on="timestamp", how="left")
    return df


# ---------------------------------------------------------------------------
# 8. Merge roadworks as binary feature
# ---------------------------------------------------------------------------
def merge_roadworks(df: pd.DataFrame, roadworks: pd.DataFrame) -> pd.DataFrame:
    """
    Create binary 'roadwork_active' column:
    For each (timestamp, segment_id), check if any roadwork overlaps.
    Uses an interval-based merge for efficiency.
    """
    df["roadwork_active"] = 0

    if roadworks.empty:
        return df

    # For each roadwork row, we know segment_id, start_time, end_time
    # Build a lookup: for each segment, list of (start, end) intervals
    rw_segments = roadworks.groupby("segment_id")

    for seg_id, rw_group in rw_segments:
        seg_mask = df["segment_id"] == seg_id
        if not seg_mask.any():
            continue

        seg_timestamps = df.loc[seg_mask, "timestamp"]

        for _, rw in rw_group.iterrows():
            active_mask = seg_mask & (df["timestamp"] >= rw["start_time"]) & (df["timestamp"] <= rw["end_time"])
            df.loc[active_mask, "roadwork_active"] = 1

    return df


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------
def clean_split(split: str) -> None:
    """Run the full cleaning pipeline for a single split (train or validation)."""
    t0 = time.time()
    print(f"\n{'='*60}")
    print(f"  CLEANING: {split}")
    print(f"{'='*60}")

    # --- Load ---
    print("\n[1/8] Loading data...")
    df = load_traffic(split)
    context = load_context(split)
    roadworks = load_roadworks(split)

    rows_before = len(df)
    nulls_before = df[NUMERIC_COLS].isna().sum().sum()

    # --- Sort & Dedup ---
    print("\n[2/8] Sorting & deduplicating...")
    df, n_dupes = sort_and_dedup(df)
    print(f"  Removed {n_dupes:,} duplicate (timestamp, segment_id) rows")

    # --- Fix negatives ---
    print("\n[3/8] Fixing negative values...")
    df, n_neg = fix_negatives(df)
    print(f"  Set {n_neg:,} negative values to NaN")

    # --- Stuck sensors ---
    print("\n[4/8] Detecting stuck sensors...")
    df, n_stuck = flag_stuck_sensors_fast(df)
    print(f"  Flagged {n_stuck:,} rows as stuck (sensor_quality → 0)")

    # --- Clip spikes ---
    print("\n[5/8] Clipping spikes...")
    df, n_spikes = clip_spikes(df)
    print(f"  Clipped {n_spikes:,} spike values")

    # --- Impute ---
    print("\n[6/8] Imputing missing values...")
    df = impute_missing(df)

    # --- Merge context ---
    print("\n[7/8] Merging context data...")
    df = merge_context(df, context)

    # --- Merge roadworks ---
    print("\n[8/8] Merging roadworks...")
    df = merge_roadworks(df, roadworks)

    # --- Save ---
    out_path = OUTPUT_DIR / f"traffic_{split}_clean.csv"
    df.to_csv(out_path, index=False)
    print(f"\n  Saved to {out_path}")

    rows_after = len(df)
    nulls_after = df[NUMERIC_COLS].isna().sum().sum()
    elapsed = time.time() - t0

    # --- Summary ---
    print(f"\n{'─'*60}")
    print(f"  SUMMARY — {split}")
    print(f"{'─'*60}")
    print(f"  Rows before:        {rows_before:>12,}")
    print(f"  Rows after:         {rows_after:>12,}")
    print(f"  Duplicates removed: {n_dupes:>12,}")
    print(f"  Negatives → NaN:    {n_neg:>12,}")
    print(f"  Stuck rows flagged: {n_stuck:>12,}")
    print(f"  Spikes clipped:     {n_spikes:>12,}")
    print(f"  Nulls before clean: {int(nulls_before):>12,}")
    print(f"  Nulls after clean:  {int(nulls_after):>12,}")
    print(f"  Time elapsed:       {elapsed:>11.1f}s")
    print(f"{'─'*60}")

    # Per-column null breakdown
    remaining = df[NUMERIC_COLS].isna().sum()
    if remaining.sum() > 0:
        print("  Remaining nulls per column:")
        for col, cnt in remaining.items():
            if cnt > 0:
                print(f"    {col}: {cnt:,}")
    else:
        print("  ✓ No remaining nulls in numeric columns")


def main() -> None:
    print("=" * 60)
    print("  NEURAX Traffic Data Cleaning Pipeline")
    print(f"  Data dir:   {DATA_DIR}")
    print(f"  Output dir: {OUTPUT_DIR}")
    print("=" * 60)

    for split in ("train", "validation"):
        clean_split(split)

    print("\n✓ Pipeline complete.")


if __name__ == "__main__":
    main()
