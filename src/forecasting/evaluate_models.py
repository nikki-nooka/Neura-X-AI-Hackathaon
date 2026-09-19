"""
Validation Evaluation Suite for Multi-Horizon Forecaster.

Performs strict chronological time-based validation on the held-out 4-day validation period
(Jan 16–19, 2026) with true multi-step lag and rolling window features.
Computes MAE and RMSE across 15m, 30m, 45m, and 60m horizons for:
- speed (km/h)
- flow (vph)
- congestion (index 0-1)
"""
from __future__ import annotations

import sys
import time
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from src.forecasting.forecaster import HORIZONS, TARGET_TYPES, TrafficForecaster


def evaluate_on_validation(sample_size: int = 150000) -> pd.DataFrame:
    print(f"📊 Loading held-out chronological validation dataset...")
    
    val_traffic_path = _PROJECT_ROOT / "data" / "processed" / "traffic_validation_clean.csv"
    val_target_path = _PROJECT_ROOT / "NEURAX_SMART_CITIES_TRAINING_V2" / "forecast_targets_validation.csv"

    if not val_traffic_path.exists():
        val_traffic_path = _PROJECT_ROOT / "NEURAX_SMART_CITIES_TRAINING_V2" / "traffic_validation.csv"

    # Initialize forecaster
    forecaster = TrafficForecaster()
    model_checkpoint_path = _PROJECT_ROOT / "data" / "processed" / "forecaster_models.joblib"
    
    if model_checkpoint_path.exists():
        ckpt = joblib.load(model_checkpoint_path)
        forecaster.models = ckpt["models"]
        forecaster.feature_cols = ckpt["feature_cols"]
        print(f"✓ Loaded {len(forecaster.models)} pre-trained forecaster models.")
    else:
        print("⚡ Training forecaster models first...")
        forecaster.train(sample_size=sample_size)

    # Load validation traffic data with temporal lags
    print(f"  Reading validation telemetry from {val_traffic_path.name}...")
    df_val_raw = pd.read_csv(val_traffic_path, dtype={"event_id": str})
    print(f"  Loaded {len(df_val_raw):,} validation rows across {df_val_raw['segment_id'].nunique()} segments.")
    
    print("  Engineering temporal lags (5m, 10m, 15m, 30m) & rolling windows (15m, 30m)...")
    t0 = time.time()
    val_feat = forecaster.prepare_features(df_val_raw, compute_lags=True)
    print(f"  ✓ Feature engineering completed in {time.time() - t0:.1f}s.")

    # Load ground truth forecast labels
    print(f"  Reading ground truth targets from {val_target_path.name}...")
    val_y = pd.read_csv(val_target_path)

    # Format timestamp keys for strict alignment
    val_feat["timestamp_str"] = val_feat["timestamp"].astype(str)
    val_y["timestamp_str"] = val_y["timestamp"].astype(str)

    # STRICT INNER JOIN on timestamp + segment_id
    merged = val_feat.merge(
        val_y,
        on=["timestamp_str", "segment_id"],
        suffixes=("_feat", "_tgt"),
    )
    print(f"✓ Successfully joined {len(merged):,} held-out validation records.")

    # Subsample if requested for fast benchmark
    if sample_size and len(merged) > sample_size:
        eval_df = merged.sample(n=sample_size, random_state=42).reset_index(drop=True)
    else:
        eval_df = merged

    # Generate predictions using the 12 models
    print(f"🔮 Generating predictions across 12 horizons for {len(eval_df):,} test records...")
    feature_cols = forecaster.feature_cols
    X_val = eval_df[feature_cols].fillna(0).values

    eval_records = []
    print("\n" + "=" * 72)
    print(f"{'Target Metric':<16} | {'Horizon':<8} | {'MAE':<10} | {'RMSE':<10} | {'Evaluated'}")
    print("=" * 72)

    for t in TARGET_TYPES:
        for h in HORIZONS:
            model_key = f"{t}_{h}"
            truth_col = f"target_{t}_{h}"

            if model_key in forecaster.models and truth_col in eval_df.columns:
                reg = forecaster.models[model_key]
                y_pred = reg.predict(X_val)
                y_true = eval_df[truth_col].fillna(0).values

                mae = float(mean_absolute_error(y_true, y_pred))
                rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))

                print(f"{t.capitalize():<16} | {h:<8} | {mae:<10.3f} | {rmse:<10.3f} | {len(eval_df):,}")

                eval_records.append({
                    "target": t,
                    "horizon": h,
                    "validation_mae": round(mae, 3),
                    "validation_rmse": round(rmse, 3),
                    "evaluated_samples": len(eval_df),
                })

    print("=" * 72)
    df_eval = pd.DataFrame(eval_records)
    out_path = _PROJECT_ROOT / "data" / "processed" / "forecaster_validation_metrics.csv"
    df_eval.to_csv(out_path, index=False)
    print(f"✅ Strict chronological validation scorecard exported to {out_path}")
    return df_eval


if __name__ == "__main__":
    evaluate_on_validation()
