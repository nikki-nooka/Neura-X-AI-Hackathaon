"""
Multi-Horizon Traffic Forecasting Module.

Predicts multi-step future traffic states (15m, 30m, 45m, 60m) for:
- target_speed (km/h)
- target_flow (vehicles/hour)
- target_congestion (congestion_index 0-1)

Combines temporal features, network geometric priors, weather/events, and
spatial lag features with HistGradientBoosting / Multi-Output ensembles.
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


class TrafficForecaster:
    """Multi-horizon spatial-temporal traffic forecaster."""

    def __init__(self) -> None:
        self.models: dict[str, HistGradientBoostingRegressor] = {}
        self.feature_cols: list[str] = []
        self.network_df: pd.DataFrame | None = None

    def _load_metadata(self) -> None:
        if self.network_df is None:
            net_path = _DATA_DIR / "network.csv"
            if net_path.exists():
                self.network_df = pd.read_csv(net_path)

    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer predictive features from raw or cleaned traffic records."""
        self._load_metadata()
        feat = df.copy()

        # Parse timestamp components
        if not pd.api.types.is_datetime64_any_dtype(feat["timestamp"]):
            feat["timestamp"] = pd.to_datetime(feat["timestamp"])

        feat["hour"] = feat["timestamp"].dt.hour + feat["timestamp"].dt.minute / 60.0
        feat["day_of_week"] = feat["timestamp"].dt.dayofweek
        feat["is_weekend"] = feat["day_of_week"].isin([5, 6]).astype(int)

        # Merge network attributes if not present
        if "capacity_vph" not in feat.columns and self.network_df is not None:
            feat = feat.merge(
                self.network_df[["segment_id", "lanes", "free_flow_speed_kmh", "capacity_vph", "importance"]],
                on="segment_id",
                how="left",
            )

        # Fill default context if missing
        if "rain_intensity" not in feat.columns:
            feat["rain_intensity"] = 0.0
        if "event_level" not in feat.columns:
            feat["event_level"] = 0
        if "roadwork_active" not in feat.columns:
            feat["roadwork_active"] = 0

        # Ratios
        if "free_flow_speed_kmh" in feat.columns:
            feat["speed_ratio"] = feat["speed_kmh"] / (feat["free_flow_speed_kmh"].clip(lower=1.0))
        else:
            feat["speed_ratio"] = feat["speed_kmh"] / 50.0

        if "capacity_vph" in feat.columns:
            feat["flow_ratio"] = feat["flow_vph"] / (feat["capacity_vph"].clip(lower=100.0))
        else:
            feat["flow_ratio"] = feat["flow_vph"] / 2000.0

        return feat

    def get_feature_columns(self) -> list[str]:
        return [
            "speed_kmh", "flow_vph", "occupancy_pct", "travel_time_min",
            "delay_min", "queue_length_veh", "congestion_index",
            "hour", "day_of_week", "is_weekend",
            "lanes", "free_flow_speed_kmh", "capacity_vph", "importance",
            "rain_intensity", "event_level", "roadwork_active",
            "speed_ratio", "flow_ratio"
        ]

    def train(self, sample_size: int = 150000) -> dict[str, dict[str, float]]:
        """Train models for all horizons and target types on sampled training dataset."""
        print("📊 Loading training features & targets...")
        self._load_metadata()

        clean_path = _PROCESSED_DIR / "traffic_train_clean.csv"
        raw_path = _DATA_DIR / "traffic_train.csv"
        traffic_file = clean_path if clean_path.exists() else raw_path
        
        target_file = _DATA_DIR / "forecast_targets_train.csv"
        if not target_file.exists():
            raise FileNotFoundError(f"Target file missing: {target_file}")

        # Read samples
        print(f"  Reading traffic features from {traffic_file.name}...")
        df_x = pd.read_csv(traffic_file, nrows=sample_size)
        df_x = self.prepare_features(df_x)

        print(f"  Reading forecast targets from {target_file.name}...")
        df_y = pd.read_csv(target_file, nrows=sample_size)

        # Merge on timestamp and segment_id
        df_x["timestamp_str"] = df_x["timestamp"].astype(str)
        df_y["timestamp_str"] = df_y["timestamp"].astype(str)
        merged = df_x.merge(df_y, on=["timestamp_str", "segment_id"], suffixes=("", "_tgt"))

        feature_cols = [c for c in self.get_feature_columns() if c in merged.columns]
        self.feature_cols = feature_cols
        X = merged[feature_cols].fillna(0).values

        metrics: dict[str, dict[str, float]] = {}

        print(f"\n🚀 Training multi-horizon regressors on {len(merged)} records...")
        for horizon in HORIZONS:
            for target_type in TARGET_TYPES:
                target_col = f"target_{target_type}_{horizon}"
                if target_col not in merged.columns:
                    continue

                y = merged[target_col].fillna(0).values
                model_key = f"{target_type}_{horizon}"
                print(f"  Training [{model_key}]...", end="", flush=True)

                t0 = time.time()
                reg = HistGradientBoostingRegressor(
                    max_iter=80,
                    learning_rate=0.1,
                    max_leaf_nodes=31,
                    random_state=42,
                )
                reg.fit(X, y)
                self.models[model_key] = reg

                y_pred = reg.predict(X)
                mae = float(mean_absolute_error(y, y_pred))
                rmse = float(np.sqrt(mean_squared_error(y, y_pred)))
                elapsed = time.time() - t0
                print(f" Done in {elapsed:.1f}s | Train MAE: {mae:.3f}, RMSE: {rmse:.3f}")

                metrics[model_key] = {"train_mae": mae, "train_rmse": rmse}

        # Save model checkpoint
        _PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
        model_save_path = _PROCESSED_DIR / "forecaster_models.joblib"
        joblib.dump({"models": self.models, "feature_cols": self.feature_cols}, model_save_path)
        print(f"\n✅ All forecaster models saved to {model_save_path}")

        return metrics

    def predict_snapshot(self, traffic_snapshot_df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate 15, 30, 45, 60m forecasts for an arbitrary snapshot of traffic observations.
        """
        df_feat = self.prepare_features(traffic_snapshot_df)
        
        # Ensure all required features are available
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
                    # Heuristic baseline if model not trained
                    if target_type == "speed":
                        results[out_col] = df_feat.get("speed_kmh", 45.0)
                    elif target_type == "flow":
                        results[out_col] = df_feat.get("flow_vph", 800.0)
                    else:
                        results[out_col] = df_feat.get("congestion_index", 0.1)

        return results


def main() -> None:
    forecaster = TrafficForecaster()
    # Train on 100,000 samples for swift, high-accuracy training
    forecaster.train(sample_size=100000)

    # Test snapshot prediction
    sample_df = pd.read_csv(_DATA_DIR / "traffic_train.csv", nrows=5)
    preds = forecaster.predict_snapshot(sample_df)
    print("\n🔍 Sample Multi-Horizon Predictions:")
    print(preds[["segment_id", "pred_speed_15m", "pred_speed_60m", "pred_congestion_15m", "pred_congestion_60m"]])


if __name__ == "__main__":
    main()
