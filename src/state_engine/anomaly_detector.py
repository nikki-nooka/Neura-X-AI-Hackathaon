"""
Anomaly Detector — statistical anomaly detection, incident signature
detection, and incident classification via RandomForest.

Anomaly types:
  - Statistical: readings > 3σ from hourly segment baselines
  - Incident signature: sudden speed drop >30% + flow drop >20% +
    queue spike >2× baseline within a 15-min window
  - ML-based: RandomForest trained on labelled incident windows
"""

from __future__ import annotations

import os
import sys
import warnings
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings("ignore", category=FutureWarning)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_RAW = BASE_DIR / "NEURAX_SMART_CITIES_TRAINING_V2"
DATA_PROCESSED = BASE_DIR / "data" / "processed"


# ---------------------------------------------------------------------------
# Data loading helpers
# ---------------------------------------------------------------------------

def _load_traffic(path: str | Path | None = None) -> pd.DataFrame:
    if path is not None:
        p = Path(path)
    else:
        clean = DATA_PROCESSED / "traffic_train_clean.csv"
        raw = DATA_RAW / "traffic_train.csv"
        p = clean if clean.exists() else raw
    return pd.read_csv(p, parse_dates=["timestamp"])


def _load_network(path: str | Path | None = None) -> pd.DataFrame:
    if path is not None:
        return pd.read_csv(Path(path))
    return pd.read_csv(DATA_RAW / "network.csv")


def _load_incidents(path: str | Path | None = None) -> pd.DataFrame:
    if path is not None:
        return pd.read_csv(Path(path), parse_dates=["start_time", "end_time"])
    return pd.read_csv(
        DATA_RAW / "incidents_train.csv",
        parse_dates=["start_time", "end_time"],
    )


def _load_incidents_val() -> pd.DataFrame:
    return pd.read_csv(
        DATA_RAW / "incidents_validation.csv",
        parse_dates=["start_time", "end_time"],
    )


# ---------------------------------------------------------------------------
# 1. Statistical anomaly detection (3σ from hourly baseline)
# ---------------------------------------------------------------------------

def compute_hourly_baselines(traffic_df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute per-segment, per-hour-of-day baselines (mean, std) for
    speed_kmh, flow_vph, and queue_length_veh.
    """
    df = traffic_df.copy()
    df["hour"] = df["timestamp"].dt.hour

    metrics = ["speed_kmh", "flow_vph", "queue_length_veh"]
    agg_dict = {}
    for m in metrics:
        agg_dict[f"{m}_mean"] = (m, "mean")
        agg_dict[f"{m}_std"] = (m, "std")

    baselines = df.groupby(["segment_id", "hour"]).agg(**agg_dict).reset_index()

    # Fill zero std with a small floor so we don't flag everything
    for m in metrics:
        baselines[f"{m}_std"] = baselines[f"{m}_std"].clip(lower=1e-3)

    return baselines


def detect_anomalies(
    traffic_df: pd.DataFrame,
    network_df: pd.DataFrame | None = None,
    sigma: float = 3.0,
) -> pd.DataFrame:
    """
    Flag readings deviating > ``sigma`` σ from the per-segment hourly baseline
    in speed_kmh or flow_vph.

    Returns a copy of traffic_df with boolean column ``is_anomaly`` and
    per-metric flags ``speed_anomaly``, ``flow_anomaly``, ``queue_anomaly``.
    """
    df = traffic_df.copy()
    df["hour"] = df["timestamp"].dt.hour

    baselines = compute_hourly_baselines(df)
    df = df.merge(baselines, on=["segment_id", "hour"], how="left", suffixes=("", "_bl"))

    for m in ["speed_kmh", "flow_vph", "queue_length_veh"]:
        z = (df[m] - df[f"{m}_mean"]).abs() / df[f"{m}_std"]
        df[f"{m.split('_')[0]}_anomaly"] = z > sigma

    df["is_anomaly"] = (
        df["speed_anomaly"] | df["flow_anomaly"] | df["queue_anomaly"]
    )

    # Clean up helper cols
    drop_cols = [c for c in df.columns if c.endswith("_mean") or c.endswith("_std")]
    df.drop(columns=drop_cols, inplace=True)

    return df


# ---------------------------------------------------------------------------
# 2. Incident signature detection
# ---------------------------------------------------------------------------

def detect_incident_signatures(
    traffic_df: pd.DataFrame,
    network_df: pd.DataFrame | None = None,
    speed_drop_pct: float = 0.30,
    flow_drop_pct: float = 0.20,
    queue_spike_mult: float = 2.0,
    window_minutes: int = 15,
) -> pd.DataFrame:
    """
    Detect incident-like signatures: a window where speed drops >30% below
    baseline, flow drops >20% below baseline, and queue spikes >2× baseline
    on a single segment.

    Returns DataFrame of detected incident windows:
        segment_id, window_start, window_end, min_speed_ratio, min_flow_ratio,
        max_queue_ratio
    """
    df = traffic_df.copy()
    df["hour"] = df["timestamp"].dt.hour
    df = df.sort_values(["segment_id", "timestamp"])

    baselines = compute_hourly_baselines(df)
    df = df.merge(baselines, on=["segment_id", "hour"], how="left")

    # Compute deviations from baseline
    df["speed_dev"] = (df["speed_kmh"] - df["speed_kmh_mean"]) / df["speed_kmh_mean"].clip(lower=1e-3)
    df["flow_dev"] = (df["flow_vph"] - df["flow_vph_mean"]) / df["flow_vph_mean"].clip(lower=1e-3)
    df["queue_ratio"] = df["queue_length_veh"] / df["queue_length_veh_mean"].clip(lower=0.1)

    # Per-reading flags
    df["speed_drop"] = df["speed_dev"] < -speed_drop_pct
    df["flow_drop"] = df["flow_dev"] < -flow_drop_pct
    df["queue_spike"] = df["queue_ratio"] > queue_spike_mult

    # Incident co-occurrence: significant speed drop paired with flow drop or queue spike
    df["sig_flag"] = df["speed_drop"] & (df["flow_drop"] | df["queue_spike"])

    # Group consecutive flagged readings into windows per segment
    results = []
    for seg_id, seg_df in df[df["sig_flag"]].groupby("segment_id"):
        seg_df = seg_df.sort_values("timestamp")
        times = seg_df["timestamp"].values

        if len(times) == 0:
            continue

        # Merge readings within window_minutes of each other
        groups: list[list[int]] = [[0]]
        for i in range(1, len(times)):
            gap = (times[i] - times[groups[-1][-1]]) / np.timedelta64(1, "m")
            if gap <= window_minutes:
                groups[-1].append(i)
            else:
                groups.append([i])

        for g in groups:
            subset = seg_df.iloc[g]
            results.append({
                "segment_id": seg_id,
                "window_start": subset["timestamp"].min(),
                "window_end": subset["timestamp"].max(),
                "duration_min": (subset["timestamp"].max() - subset["timestamp"].min()) / pd.Timedelta(minutes=1),
                "readings_count": len(g),
                "min_speed_ratio": (1 + subset["speed_dev"]).min(),
                "min_flow_ratio": (1 + subset["flow_dev"]).min(),
                "max_queue_ratio": subset["queue_ratio"].max(),
            })

    if not results:
        return pd.DataFrame(columns=[
            "segment_id", "window_start", "window_end", "duration_min",
            "readings_count", "min_speed_ratio", "min_flow_ratio",
            "max_queue_ratio",
        ])

    return pd.DataFrame(results).sort_values("window_start").reset_index(drop=True)


# ---------------------------------------------------------------------------
# 3. ML incident classifier (RandomForest)
# ---------------------------------------------------------------------------

def _label_traffic_with_incidents(
    traffic_df: pd.DataFrame,
    incidents_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Label each (timestamp, segment_id) as 1/incident_type if it falls within
    an incident window, 0/'none' otherwise.
    """
    df = traffic_df.copy()
    df["incident_label"] = 0
    df["incident_type_label"] = "none"

    for _, inc in incidents_df.iterrows():
        mask = (
            (df["segment_id"] == inc["segment_id"])
            & (df["timestamp"] >= inc["start_time"])
            & (df["timestamp"] <= inc["end_time"])
        )
        df.loc[mask, "incident_label"] = 1
        df.loc[mask, "incident_type_label"] = inc["incident_type"]

    return df


FEATURE_COLS = [
    "speed_ratio",
    "flow_ratio",
    "occupancy_pct",
    "delay_min",
    "queue_length_veh",
    "congestion_index",
    "hour",
    "day_of_week",
]


def _prepare_features(
    traffic_df: pd.DataFrame,
    network_df: pd.DataFrame | None = None,
) -> pd.DataFrame:
    """Ensure derived feature columns exist in traffic_df."""
    df = traffic_df.copy()

    # Add temporal features
    df["hour"] = df["timestamp"].dt.hour
    df["day_of_week"] = df["timestamp"].dt.dayofweek

    # Speed & flow ratios (may already exist from congestion_tracker)
    if "speed_ratio" not in df.columns:
        if network_df is not None:
            net = network_df[["segment_id", "free_flow_speed_kmh", "capacity_vph"]]
            df = df.merge(net, on="segment_id", how="left")
            df["speed_ratio"] = df["speed_kmh"] / df["free_flow_speed_kmh"].replace(0, np.nan)
            df["flow_ratio"] = df["flow_vph"] / df["capacity_vph"].replace(0, np.nan)
        else:
            # Approximate from travel times
            df["speed_ratio"] = df["free_flow_time_min"] / df["travel_time_min"].replace(0, np.nan)
            df["flow_ratio"] = 0.5  # placeholder

    if "flow_ratio" not in df.columns:
        if network_df is not None and "capacity_vph" in network_df.columns:
            net = network_df[["segment_id", "capacity_vph"]].drop_duplicates()
            df = df.merge(net, on="segment_id", how="left", suffixes=("", "_net"))
            cap_col = "capacity_vph_net" if "capacity_vph_net" in df.columns else "capacity_vph"
            df["flow_ratio"] = df["flow_vph"] / df[cap_col].replace(0, np.nan)
        else:
            df["flow_ratio"] = 0.5

    # Fill NaN features
    for col in FEATURE_COLS:
        if col in df.columns:
            df[col] = df[col].fillna(0)

    return df


def train_incident_classifier(
    traffic_df: pd.DataFrame,
    incidents_df: pd.DataFrame,
    network_df: pd.DataFrame | None = None,
    classifier_type: str = "binary",  # 'binary' or 'multiclass'
) -> dict[str, Any]:
    """
    Train a RandomForest to classify incident vs. normal readings.

    Parameters
    ----------
    traffic_df : training traffic data
    incidents_df : labeled incidents with start_time, end_time, segment_id
    network_df : optional network for ratio computation
    classifier_type : 'binary' (incident yes/no) or 'multiclass' (incident type)

    Returns
    -------
    dict with keys: model, label_encoder (if multiclass), feature_cols,
                    cv_scores, classification_report_str
    """
    df = _prepare_features(traffic_df, network_df)
    df = _label_traffic_with_incidents(df, incidents_df)

    # Balance dataset — undersample majority class
    incident_rows = df[df["incident_label"] == 1]
    normal_rows = df[df["incident_label"] == 0]

    n_incident = len(incident_rows)
    if n_incident == 0:
        raise ValueError("No incident-labelled rows found — check overlap between traffic & incidents")

    # Sample 5× incident size for negatives (or all if fewer)
    n_sample = min(len(normal_rows), n_incident * 5)
    normal_sample = normal_rows.sample(n=n_sample, random_state=42)
    train_data = pd.concat([incident_rows, normal_sample]).sample(frac=1, random_state=42)

    available_features = [c for c in FEATURE_COLS if c in train_data.columns]
    X = train_data[available_features].values

    le = None
    if classifier_type == "multiclass":
        le = LabelEncoder()
        y = le.fit_transform(train_data["incident_type_label"])
    else:
        y = train_data["incident_label"].values

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=5,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    # Cross-validate
    cv_scores = cross_val_score(model, X, y, cv=5, scoring="f1_macro")
    model.fit(X, y)

    # In-sample report
    y_pred = model.predict(X)
    if le is not None:
        target_names = le.classes_.tolist()
    else:
        target_names = ["normal", "incident"]
    report = classification_report(y, y_pred, target_names=target_names)

    return {
        "model": model,
        "label_encoder": le,
        "feature_cols": available_features,
        "cv_f1_macro": cv_scores,
        "classification_report": report,
        "n_incident_samples": n_incident,
        "n_normal_samples": n_sample,
    }


def classify_incidents(
    model_info: dict[str, Any],
    traffic_df: pd.DataFrame,
    network_df: pd.DataFrame | None = None,
) -> pd.DataFrame:
    """
    Apply trained incident classifier to traffic data.

    Returns traffic_df with columns:
        incident_pred (int/str), incident_prob (float for binary)
    """
    df = _prepare_features(traffic_df, network_df)
    feature_cols = model_info["feature_cols"]
    model = model_info["model"]
    le = model_info.get("label_encoder")

    X = df[feature_cols].values
    preds = model.predict(X)
    probs = model.predict_proba(X)

    if le is not None:
        df["incident_pred"] = le.inverse_transform(preds)
        # Per-class probabilities
        for i, cls_name in enumerate(le.classes_):
            df[f"prob_{cls_name}"] = probs[:, i]
    else:
        df["incident_pred"] = preds
        df["incident_prob"] = probs[:, 1] if probs.shape[1] > 1 else probs[:, 0]

    return df


# ---------------------------------------------------------------------------
# Evaluate on validation incidents
# ---------------------------------------------------------------------------

def evaluate_on_validation(
    model_info: dict[str, Any],
    traffic_df: pd.DataFrame,
    val_incidents: pd.DataFrame,
    network_df: pd.DataFrame | None = None,
) -> dict[str, float]:
    """
    Evaluate classifier against validation incident labels.
    """
    df = _prepare_features(traffic_df, network_df)
    df = _label_traffic_with_incidents(df, val_incidents)

    feature_cols = model_info["feature_cols"]
    model = model_info["model"]
    le = model_info.get("label_encoder")

    # Filter to segments present in validation incidents
    val_segments = val_incidents["segment_id"].unique()
    # Use time range of validation incidents (+1hr buffer)
    t_min = val_incidents["start_time"].min() - pd.Timedelta(hours=1)
    t_max = val_incidents["end_time"].max() + pd.Timedelta(hours=1)

    eval_df = df[
        (df["segment_id"].isin(val_segments))
        & (df["timestamp"] >= t_min)
        & (df["timestamp"] <= t_max)
    ].copy()

    if len(eval_df) == 0:
        print("WARNING: no validation data overlaps with incident time range")
        return {"accuracy": 0, "f1": 0, "precision": 0, "recall": 0}

    X = eval_df[feature_cols].values
    y_true = eval_df["incident_label"].values
    y_pred = model.predict(X)

    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "f1": f1_score(y_true, y_pred, average="macro", zero_division=0),
        "precision": precision_score(y_true, y_pred, average="macro", zero_division=0),
        "recall": recall_score(y_true, y_pred, average="macro", zero_division=0),
        "n_eval_rows": len(eval_df),
        "n_incident_rows": int(y_true.sum()),
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("=" * 60)
    print("  Anomaly Detector — processing training data")
    print("=" * 60)

    traffic_df = _load_traffic()
    network_df = _load_network()
    incidents_df = _load_incidents()

    print(f"Traffic rows   : {len(traffic_df):,}")
    print(f"Segments       : {network_df['segment_id'].nunique()}")
    print(f"Incidents      : {len(incidents_df)}")

    # ------------------------------------------------------------------
    # 1. Statistical anomalies
    # ------------------------------------------------------------------
    print("\n--- Statistical Anomaly Detection (3σ) ---")
    anomaly_df = detect_anomalies(traffic_df, network_df)
    n_anom = anomaly_df["is_anomaly"].sum()
    pct = n_anom / len(anomaly_df) * 100
    print(f"  Anomalies found : {n_anom:,} / {len(anomaly_df):,} ({pct:.2f}%)")
    print(f"    Speed anomalies : {anomaly_df['speed_anomaly'].sum():,}")
    print(f"    Flow anomalies  : {anomaly_df['flow_anomaly'].sum():,}")
    print(f"    Queue anomalies : {anomaly_df['queue_anomaly'].sum():,}")

    # ------------------------------------------------------------------
    # 2. Incident signatures
    # ------------------------------------------------------------------
    print("\n--- Incident Signature Detection ---")
    sigs = detect_incident_signatures(traffic_df, network_df)
    print(f"  Incident signatures detected : {len(sigs)}")
    if len(sigs) > 0:
        print(f"  Unique segments involved    : {sigs['segment_id'].nunique()}")
        print(f"  Avg duration (min)          : {sigs['duration_min'].mean():.1f}")
        print("\n  Top 10 signatures:")
        print(sigs.head(10).to_string(index=False))

    # ------------------------------------------------------------------
    # 3. ML incident classifier
    # ------------------------------------------------------------------
    print("\n--- ML Incident Classifier (RandomForest) ---")
    print("  Training binary classifier...")
    model_info = train_incident_classifier(traffic_df, incidents_df, network_df, "binary")

    print(f"  Incident samples : {model_info['n_incident_samples']:,}")
    print(f"  Normal samples   : {model_info['n_normal_samples']:,}")
    print(f"  5-fold CV F1 (macro): {model_info['cv_f1_macro'].mean():.4f} "
          f"(± {model_info['cv_f1_macro'].std():.4f})")
    print("\n  In-sample classification report:")
    print(model_info["classification_report"])

    # Feature importance
    importances = model_info["model"].feature_importances_
    fi = sorted(zip(model_info["feature_cols"], importances), key=lambda x: -x[1])
    print("  Feature importances:")
    for feat, imp in fi:
        print(f"    {feat:20s}: {imp:.4f}")

    # Multiclass
    print("\n  Training multiclass (incident type) classifier...")
    mc_info = train_incident_classifier(traffic_df, incidents_df, network_df, "multiclass")
    print(f"  5-fold CV F1 (macro): {mc_info['cv_f1_macro'].mean():.4f}")
    print(mc_info["classification_report"])

    # Validation
    try:
        val_incidents = _load_incidents_val()
        print("\n--- Validation Evaluation ---")
        val_metrics = evaluate_on_validation(model_info, traffic_df, val_incidents, network_df)
        for k, v in val_metrics.items():
            if isinstance(v, float):
                print(f"  {k}: {v:.4f}")
            else:
                print(f"  {k}: {v}")
    except FileNotFoundError:
        print("  Validation incidents file not found — skipping.")

    # ------------------------------------------------------------------
    # Save results
    # ------------------------------------------------------------------
    DATA_PROCESSED.mkdir(parents=True, exist_ok=True)

    anomaly_out = DATA_PROCESSED / "anomaly_results.csv"
    # Save only anomalous rows to keep file size manageable
    anomaly_df[anomaly_df["is_anomaly"]].to_csv(anomaly_out, index=False)
    print(f"\nSaved anomaly results → {anomaly_out}")

    sigs_out = DATA_PROCESSED / "incident_signatures.csv"
    sigs.to_csv(sigs_out, index=False)
    print(f"Saved incident signatures → {sigs_out}")

    print("\nDone.")


if __name__ == "__main__":
    main()
