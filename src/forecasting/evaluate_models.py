"""
Validation Evaluation Suite for Multi-Horizon Forecaster.
Computes MAE, RMSE, and MAPE across 15m, 30m, 45m, and 60m horizons.
"""
from __future__ import annotations

import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from src.forecasting.forecaster import HORIZONS, TARGET_TYPES, TrafficForecaster


def evaluate_on_validation(sample_size: int = 100000) -> pd.DataFrame:
    print(f"📊 Loading validation datasets (evaluating on {sample_size:,} records)...")
    
    val_traffic_path = _PROJECT_ROOT / "data" / "processed" / "traffic_validation_clean.csv"
    val_target_path = _PROJECT_ROOT / "NEURAX_SMART_CITIES_TRAINING_V2" / "forecast_targets_validation.csv"

    if not val_traffic_path.exists():
        val_traffic_path = _PROJECT_ROOT / "NEURAX_SMART_CITIES_TRAINING_V2" / "traffic_validation.csv"

    val_x = pd.read_csv(val_traffic_path, nrows=sample_size)
    val_y = pd.read_csv(val_target_path, nrows=sample_size)

    # Initialize forecaster
    forecaster = TrafficForecaster()
    model_checkpoint_path = _PROJECT_ROOT / "data" / "processed" / "forecaster_models.joblib"
    
    if model_checkpoint_path.exists():
        ckpt = joblib.load(model_checkpoint_path)
        forecaster.models = ckpt["models"]
        forecaster.feature_cols = ckpt["feature_cols"]
        print(f"✓ Loaded {len(forecaster.models)} pre-trained forecaster models.")
    else:
        print("⚡ Training forecaster models...")
        forecaster.train(sample_size=150000)

    # Predict snapshot
    print("🔮 Generating validation predictions...")
    preds = forecaster.predict_snapshot(val_x)

    # Merge predictions with ground truth
    val_x_subset = val_x[["timestamp", "segment_id"]].copy()
    val_x_subset["timestamp"] = val_x_subset["timestamp"].astype(str)
    val_y["timestamp"] = val_y["timestamp"].astype(str)

    merged = pd.concat([preds.reset_index(drop=True), val_y.reset_index(drop=True)], axis=1)

    eval_records = []
    print("\n" + "=" * 65)
    print(f"{'Target Metric':<20} | {'Horizon':<8} | {'MAE':<10} | {'RMSE':<10} | {'Status'}")
    print("=" * 65)

    for h in HORIZONS:
        for t in TARGET_TYPES:
            truth_col = f"target_{t}_{h}"
            pred_col = f"pred_{t}_{h}"

            if truth_col in merged.columns and pred_col in merged.columns:
                y_true = merged[truth_col].fillna(0).values
                y_pred = merged[pred_col].fillna(0).values

                mae = float(mean_absolute_error(y_true, y_pred))
                rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
                
                status = "🟢 High Precision" if (t == "speed" and mae < 3.0) or (t == "congestion" and mae < 0.05) or (t == "flow" and mae < 250) else "🟡 Nominal"

                print(f"{t.capitalize():<20} | {h:<8} | {mae:<10.3f} | {rmse:<10.3f} | {status}")

                eval_records.append({
                    "target": t,
                    "horizon": h,
                    "validation_mae": round(mae, 3),
                    "validation_rmse": round(rmse, 3),
                    "status": status,
                })

    print("=" * 65)
    df_eval = pd.DataFrame(eval_records)
    out_path = _PROJECT_ROOT / "data" / "processed" / "forecaster_validation_metrics.csv"
    df_eval.to_csv(out_path, index=False)
    print(f"✅ Validation scorecard saved to {out_path}")
    return df_eval


if __name__ == "__main__":
    evaluate_on_validation()
