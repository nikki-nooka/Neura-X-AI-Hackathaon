"""
Multi-Horizon Traffic Forecasting Module.

Predicts multi-step future traffic states (15m, 30m, 45m, 60m) for:
- target_speed (km/h)
- target_flow (vehicles/hour)
- target_congestion (congestion_index 0-1)

Hybrid Traffic Intelligence Architecture:
Combines:
  1. Current telemetry (speed, flow, occupancy, queue length, congestion index, delay)
  2. Temporal lags: 5m, 10m, 15m, 30m (speed, flow, queue, congestion)
  3. Rolling window statistics: 15m & 30m mean, std
  4. Contextual factors: hour, day of week, weekend flag, rain, event level, roadwork
  5. Road geometric priors: lanes, capacity, free-flow speed, road class, bottleneck status, importance
with high-performance HistGradientBoosting multi-target regressors.
"""
from __future__ import annotations

import os
import sys
import time
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

_DATA_DIR = _PROJECT_ROOT / "NEURAX_SMART_CITIES_TRAINING_V2"
_PROCESSED_DIR = _PROJECT_ROOT / "data" / "processed"

HORIZONS = ["15m", "30m", "45m", "60m"]
TARGET_TYPES = ["speed", "flow", "congestion"]

FEATURE_COLUMNS = [
    # 1. Current Observation
    "speed_kmh",
    "flow_vph",
    "occupancy_pct",
    "queue_length_veh",
    "congestion_index",
    "delay_min",
    "travel_time_min",
    "speed_ratio",
    "flow_ratio",
    # 2. Lag Features
    "speed_5m",
    "speed_10m",
    "speed_15m",
    "speed_30m",
    "flow_5m",
    "flow_10m",
    "flow_15m",
    "flow_30m",
    "queue_5m",
    "queue_15m",
    "congestion_5m",
    "congestion_15m",
    # 3. Rolling Window Features
    "speed_mean_15m",
    "speed_mean_30m",
    "flow_mean_15m",
    "flow_std_30m",
    "queue_mean_15m",
    # 4. Contextual Features
    "hour",
    "day_of_week",
    "is_weekend",
    "rain_intensity",
    "event_level",
    "roadwork_active",
    # 5. Road & Network Geometry Priors
    "lanes",
    "capacity_vph",
    "free_flow_speed_kmh",
    "importance",
    "is_arterial",
    "structural_bottleneck",
]


class TrafficForecaster:
    """Multi-horizon spatial-temporal traffic forecaster using temporal lags and HistGradientBoosting."""

    def __init__(self) -> None:
        self.models: dict[str, HistGradientBoostingRegressor] = {}
        self.feature_cols: list[str] = FEATURE_COLUMNS
        self.network_df: pd.DataFrame | None = None

    def _load_metadata(self) -> None:
        if self.network_df is None:
            net_path = _DATA_DIR / "network.csv"
            if net_path.exists():
                self.network_df = pd.read_csv(net_path)

    def prepare_features(self, df: pd.DataFrame, compute_lags: bool = True) -> pd.DataFrame:
        """
        Engineer predictive features from raw or cleaned traffic records.
        Computes temporal lags (5m, 10m, 15m, 30m) and rolling metrics (15m, 30m).
        """
        self._load_metadata()
        feat = df.copy()

        # Parse timestamp components
        if not pd.api.types.is_datetime64_any_dtype(feat["timestamp"]):
            feat["timestamp"] = pd.to_datetime(feat["timestamp"])

        feat["hour"] = feat["timestamp"].dt.hour + feat["timestamp"].dt.minute / 60.0
        feat["day_of_week"] = feat["timestamp"].dt.dayofweek
        feat["is_weekend"] = feat["day_of_week"].isin([5, 6]).astype(int)

        # Merge network attributes if missing
        if "capacity_vph" not in feat.columns and self.network_df is not None:
            net_subset = self.network_df[[
                "segment_id", "lanes", "free_flow_speed_kmh", "capacity_vph",
                "importance", "road_class", "structural_bottleneck"
            ]].copy()
            feat = feat.merge(net_subset, on="segment_id", how="left")

        if "road_class" in feat.columns:
            feat["is_arterial"] = (feat["road_class"] == "arterial").astype(int)
        elif "is_arterial" not in feat.columns:
            feat["is_arterial"] = 0

        if "structural_bottleneck" not in feat.columns:
            feat["structural_bottleneck"] = 0
        if "lanes" not in feat.columns:
            feat["lanes"] = 2
        if "free_flow_speed_kmh" not in feat.columns:
            feat["free_flow_speed_kmh"] = 50.0
        if "capacity_vph" not in feat.columns:
            feat["capacity_vph"] = 2000.0
        if "importance" not in feat.columns:
            feat["importance"] = 1.0

        # Fill default context if missing
        if "rain_intensity" not in feat.columns:
            feat["rain_intensity"] = 0.0
        if "event_level" not in feat.columns:
            feat["event_level"] = 0.0
        if "roadwork_active" not in feat.columns:
            feat["roadwork_active"] = 0.0

        # Derived dynamic ratios
        ff = feat["free_flow_speed_kmh"].clip(lower=1.0)
        cap = feat["capacity_vph"].clip(lower=100.0)
        feat["speed_ratio"] = feat["speed_kmh"] / ff
        feat["flow_ratio"] = feat["flow_vph"] / cap

        # Ensure base numeric columns exist
        for col in ["occupancy_pct", "queue_length_veh", "congestion_index", "delay_min", "travel_time_min"]:
            if col not in feat.columns:
                feat[col] = 0.0

        # Compute multi-step temporal lag and rolling features if multiple records exist
        if compute_lags and "segment_id" in feat.columns and len(feat) > 500:
            feat = feat.sort_values(["segment_id", "timestamp"]).reset_index(drop=True)
            grouped = feat.groupby("segment_id", sort=False)

            # Lags (5m=1, 10m=2, 15m=3, 30m=6 steps)
            feat["speed_5m"] = grouped["speed_kmh"].shift(1)
            feat["speed_10m"] = grouped["speed_kmh"].shift(2)
            feat["speed_15m"] = grouped["speed_kmh"].shift(3)
            feat["speed_30m"] = grouped["speed_kmh"].shift(6)

            feat["flow_5m"] = grouped["flow_vph"].shift(1)
            feat["flow_10m"] = grouped["flow_vph"].shift(2)
            feat["flow_15m"] = grouped["flow_vph"].shift(3)
            feat["flow_30m"] = grouped["flow_vph"].shift(6)

            feat["queue_5m"] = grouped["queue_length_veh"].shift(1)
            feat["queue_15m"] = grouped["queue_length_veh"].shift(3)

            feat["congestion_5m"] = grouped["congestion_index"].shift(1)
            feat["congestion_15m"] = grouped["congestion_index"].shift(3)

            # Rolling window metrics
            feat["speed_mean_15m"] = grouped["speed_kmh"].rolling(3, min_periods=1).mean().values
            feat["speed_mean_30m"] = grouped["speed_kmh"].rolling(6, min_periods=1).mean().values
            feat["flow_mean_15m"] = grouped["flow_vph"].rolling(3, min_periods=1).mean().values
            feat["flow_std_30m"] = grouped["flow_vph"].rolling(6, min_periods=1).std().fillna(0.0).values
            feat["queue_mean_15m"] = grouped["queue_length_veh"].rolling(3, min_periods=1).mean().values

        self._fill_fallback_lags(feat)
        return feat

    def _fill_fallback_lags(self, feat: pd.DataFrame) -> None:
        """Fill missing lag/rolling values with current observations for consistent vectors."""
        for col in ["speed_5m", "speed_10m", "speed_15m", "speed_30m", "speed_mean_15m", "speed_mean_30m"]:
            if col not in feat.columns:
                feat[col] = feat["speed_kmh"]
            else:
                feat[col] = feat[col].fillna(feat["speed_kmh"])

        for col in ["flow_5m", "flow_10m", "flow_15m", "flow_30m", "flow_mean_15m"]:
            if col not in feat.columns:
                feat[col] = feat["flow_vph"]
            else:
                feat[col] = feat[col].fillna(feat["flow_vph"])

        if "flow_std_30m" not in feat.columns:
            feat["flow_std_30m"] = 0.0
        else:
            feat["flow_std_30m"] = feat["flow_std_30m"].fillna(0.0)

        for col in ["queue_5m", "queue_15m", "queue_mean_15m"]:
            if col not in feat.columns:
                feat[col] = feat["queue_length_veh"]
            else:
                feat[col] = feat[col].fillna(feat["queue_length_veh"])

        for col in ["congestion_5m", "congestion_15m"]:
            if col not in feat.columns:
                feat[col] = feat["congestion_index"]
            else:
                feat[col] = feat[col].fillna(feat["congestion_index"])

    def build_features_from_history_sequence(
        self,
        segment_id: str,
        history_records: list[dict[str, Any]],
        overrides: dict[str, Any] | None = None,
    ) -> pd.DataFrame:
        """
        Build feature vector for a segment from its recent 7-step telemetry history (T-30m to T_now).
        Allows real-time user/incident overrides to alter T_now.
        """
        self._load_metadata()
        if not history_records:
            return pd.DataFrame()

        # Last record is T_now
        current_rec = history_records[-1].copy()
        if overrides:
            current_rec.update(overrides)

        # Static network metadata
        seg_net = self.network_df[self.network_df["segment_id"] == segment_id] if self.network_df is not None else pd.DataFrame()
        ff_speed = float(seg_net["free_flow_speed_kmh"].iloc[0]) if not seg_net.empty else 50.0
        capacity = float(seg_net["capacity_vph"].iloc[0]) if not seg_net.empty else 2000.0
        lanes = int(seg_net["lanes"].iloc[0]) if not seg_net.empty else 2
        importance = float(seg_net["importance"].iloc[0]) if not seg_net.empty else 1.0
        road_class = str(seg_net["road_class"].iloc[0]) if not seg_net.empty else "collector"
        structural_bottleneck = int(seg_net["structural_bottleneck"].iloc[0]) if not seg_net.empty else 0

        # Lags from history list
        # Expected order: [T-30, T-25, T-20, T-15, T-10, T-5, T_now]
        n_hist = len(history_records)
        r_5m = history_records[-2] if n_hist >= 2 else current_rec
        r_10m = history_records[-3] if n_hist >= 3 else r_5m
        r_15m = history_records[-4] if n_hist >= 4 else r_10m
        r_30m = history_records[0] if n_hist >= 7 else r_15m

        past_3_speeds = [r.get("speed_kmh", current_rec.get("speed_kmh", 50.0)) for r in history_records[-4:-1]] or [current_rec.get("speed_kmh", 50.0)]
        past_6_speeds = [r.get("speed_kmh", current_rec.get("speed_kmh", 50.0)) for r in history_records[-7:-1]] or past_3_speeds
        past_3_flows = [r.get("flow_vph", current_rec.get("flow_vph", 800.0)) for r in history_records[-4:-1]] or [current_rec.get("flow_vph", 800.0)]
        past_6_flows = [r.get("flow_vph", current_rec.get("flow_vph", 800.0)) for r in history_records[-7:-1]] or past_3_flows
        past_3_queues = [r.get("queue_length_veh", current_rec.get("queue_length_veh", 0.0)) for r in history_records[-4:-1]] or [current_rec.get("queue_length_veh", 0.0)]

        ts = pd.to_datetime(current_rec.get("timestamp", "2026-01-19 23:55:00"))
        hour = ts.hour + ts.minute / 60.0
        dow = ts.dayofweek
        weekend = 1 if dow in [5, 6] else 0

        spd = float(current_rec.get("speed_kmh", 50.0))
        flw = float(current_rec.get("flow_vph", 800.0))

        feat_dict = {
            "segment_id": segment_id,
            "timestamp": ts,
            # Current
            "speed_kmh": spd,
            "flow_vph": flw,
            "occupancy_pct": float(current_rec.get("occupancy_pct", 25.0)),
            "queue_length_veh": float(current_rec.get("queue_length_veh", 0.0)),
            "congestion_index": float(current_rec.get("congestion_index", 0.1)),
            "delay_min": float(current_rec.get("delay_min", 0.0)),
            "travel_time_min": float(current_rec.get("travel_time_min", 1.5)),
            "speed_ratio": spd / max(ff_speed, 1.0),
            "flow_ratio": flw / max(capacity, 100.0),
            # Lags
            "speed_5m": float(r_5m.get("speed_kmh", spd)),
            "speed_10m": float(r_10m.get("speed_kmh", spd)),
            "speed_15m": float(r_15m.get("speed_kmh", spd)),
            "speed_30m": float(r_30m.get("speed_kmh", spd)),
            "flow_5m": float(r_5m.get("flow_vph", flw)),
            "flow_10m": float(r_10m.get("flow_vph", flw)),
            "flow_15m": float(r_15m.get("flow_vph", flw)),
            "flow_30m": float(r_30m.get("flow_vph", flw)),
            "queue_5m": float(r_5m.get("queue_length_veh", 0.0)),
            "queue_15m": float(r_15m.get("queue_length_veh", 0.0)),
            "congestion_5m": float(r_5m.get("congestion_index", 0.1)),
            "congestion_15m": float(r_15m.get("congestion_index", 0.1)),
            # Rolling
            "speed_mean_15m": float(np.mean(past_3_speeds)),
            "speed_mean_30m": float(np.mean(past_6_speeds)),
            "flow_mean_15m": float(np.mean(past_3_flows)),
            "flow_std_30m": float(np.std(past_6_flows)),
            "queue_mean_15m": float(np.mean(past_3_queues)),
            # Context
            "hour": hour,
            "day_of_week": dow,
            "is_weekend": weekend,
            "rain_intensity": float(current_rec.get("rain_intensity", 0.0)),
            "event_level": float(current_rec.get("event_level", 0.0)),
            "roadwork_active": float(current_rec.get("roadwork_active", 0.0)),
            # Road
            "lanes": lanes,
            "capacity_vph": capacity,
            "free_flow_speed_kmh": ff_speed,
            "importance": importance,
            "is_arterial": 1 if road_class == "arterial" else 0,
            "structural_bottleneck": structural_bottleneck,
        }

        return pd.DataFrame([feat_dict])

    def get_feature_columns(self) -> list[str]:
        return FEATURE_COLUMNS

    def train(self, sample_size: int = 150000) -> dict[str, dict[str, float]]:
        """
        Train all 12 multi-horizon regressors (15m, 30m, 45m, 60m for speed, flow, congestion)
        with temporal lag and rolling features.
        """
        print("📊 Loading training features with temporal lags...")
        self._load_metadata()

        clean_path = _PROCESSED_DIR / "traffic_train_clean.csv"
        raw_path = _DATA_DIR / "traffic_train.csv"
        traffic_file = clean_path if clean_path.exists() else raw_path

        target_file = _DATA_DIR / "forecast_targets_train.csv"
        if not target_file.exists():
            raise FileNotFoundError(f"Target file missing: {target_file}")

        print(f"  Reading traffic features from {traffic_file.name}...")
        # Read enough rows to compute proper lags per segment across time
        # Reading first 400,000 rows covers full multi-day contiguous sequences for all segments
        df_raw = pd.read_csv(traffic_file, nrows=min(sample_size * 2, 500000))
        print("  Computing temporal lag and rolling window features...")
        df_x = self.prepare_features(df_raw, compute_lags=True)

        print(f"  Reading forecast targets from {target_file.name}...")
        df_y = pd.read_csv(target_file, nrows=sample_size * 2)

        # Merge on timestamp and segment_id
        df_x["timestamp_str"] = df_x["timestamp"].astype(str)
        df_y["timestamp_str"] = df_y["timestamp"].astype(str)
        merged = df_x.merge(df_y, on=["timestamp_str", "segment_id"], suffixes=("", "_tgt"))
        print(f"✓ Matched {len(merged):,} records with ground truth multi-horizon labels.")

        if len(merged) > sample_size:
            # Chronological or stratified subsample for fast high-capacity convergence
            merged = merged.sample(n=sample_size, random_state=42).reset_index(drop=True)

        feature_cols = [c for c in self.get_feature_columns() if c in merged.columns]
        self.feature_cols = feature_cols
        X = merged[feature_cols].fillna(0).values

        metrics: dict[str, dict[str, float]] = {}

        print(f"\n🚀 Training 12 multi-horizon HistGradientBoosting models on {len(merged):,} samples...")
        for horizon in HORIZONS:
            for target_type in TARGET_TYPES:
                target_col = f"target_{target_type}_{horizon}"
                if target_col not in merged.columns:
                    continue

                y = merged[target_col].fillna(0).values
                model_key = f"{target_type}_{horizon}"
                print(f"  Training [{model_key:<15}]...", end="", flush=True)

                t0 = time.time()
                reg = HistGradientBoostingRegressor(
                    max_iter=80,
                    learning_rate=0.1,
                    max_leaf_nodes=31,
                    min_samples_leaf=20,
                    random_state=42,
                )
                reg.fit(X, y)
                self.models[model_key] = reg

                y_pred = reg.predict(X)
                mae = float(mean_absolute_error(y, y_pred))
                rmse = float(np.sqrt(mean_squared_error(y, y_pred)))
                elapsed = time.time() - t0
                print(f" Done in {elapsed:.1f}s | Train MAE: {mae:.3f}, RMSE: {rmse:.3f}")

                metrics[model_key] = {"train_mae": round(mae, 3), "train_rmse": round(rmse, 3)}

        # Save checkpoint
        _PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
        model_save_path = _PROCESSED_DIR / "forecaster_models.joblib"
        joblib.dump({"models": self.models, "feature_cols": self.feature_cols}, model_save_path)
        print(f"\n✅ All 12 forecaster models saved to {model_save_path}")

        return metrics

    def predict_snapshot(self, traffic_snapshot_df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate 15, 30, 45, 60m forecasts for a snapshot of traffic observations.
        """
        df_feat = self.prepare_features(traffic_snapshot_df, compute_lags=False)

        feature_cols = self.feature_cols if self.feature_cols else self.get_feature_columns()
        for col in feature_cols:
            if col not in df_feat.columns:
                df_feat[col] = 0.0

        X = df_feat[feature_cols].fillna(0).values

        if "timestamp" in df_feat.columns:
            results = df_feat[["segment_id", "timestamp"]].copy()
        else:
            results = pd.DataFrame({"segment_id": df_feat["segment_id"].values})

        for horizon in HORIZONS:
            for target_type in TARGET_TYPES:
                model_key = f"{target_type}_{horizon}"
                out_col = f"pred_{target_type}_{horizon}"
                if model_key in self.models:
                    results[out_col] = self.models[model_key].predict(X)
                else:
                    if target_type == "speed":
                        results[out_col] = df_feat.get("speed_kmh", 45.0)
                    elif target_type == "flow":
                        results[out_col] = df_feat.get("flow_vph", 800.0)
                    else:
                        results[out_col] = df_feat.get("congestion_index", 0.1)

        return results


def main() -> None:
    forecaster = TrafficForecaster()
    forecaster.train(sample_size=150000)

    # Test snapshot prediction
    sample_df = pd.read_csv(_DATA_DIR / "traffic_train.csv", nrows=5)
    preds = forecaster.predict_snapshot(sample_df)
    print("\n🔍 Sample Multi-Horizon Predictions:")
    print(preds[["segment_id", "pred_speed_15m", "pred_speed_60m", "pred_congestion_15m", "pred_congestion_60m"]])


if __name__ == "__main__":
    main()
