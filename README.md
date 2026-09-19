<h1 align="center">🚦 Urban Traffic Flow & Incident Intelligence</h1>

<p align="center">
  <b>Neurax Hackathon 3.0 — Domain 1: AI in Smart Cities</b><br>
  <i>A Decision-Support System for Hyderabad-like Dense Urban Networks</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/PyTorch-Graph_NN-EE4C2C?logo=pytorch&logoColor=white" alt="PyTorch">
  <img src="https://img.shields.io/badge/LightGBM-Forecasting-02569B" alt="LightGBM">
  <img src="https://img.shields.io/badge/Streamlit-Dashboard-FF4B4B?logo=streamlit&logoColor=white" alt="Streamlit">
  <img src="https://img.shields.io/badge/Groq-LLM_Briefings-F55036" alt="Groq">
  <img src="https://img.shields.io/badge/Status-Simulation_Only-orange" alt="Advisory Only">
</p>

---

## 📌 Problem Understanding

### The Challenge
Managing large, rapidly changing urban road networks is extremely difficult. Traffic conditions shift within minutes — a single stalled auto-rickshaw on a narrow Hyderabad flyover ramp can cascade into gridlock across an entire corridor within 15 minutes. Human operators in traffic command centers react too slowly and lack the tools to anticipate problems before they escalate.

### What We're Building
**Not** a navigation app. **Not** a chatbot. 

We're building an **AI-powered traffic command center brain** that sits alongside human operators and provides:

| Capability | What It Does |
|---|---|
| 🔍 **Real-Time Inference** | Understands what is happening across 436 road segments right now |
| 🔮 **Predictive Forecasting** | Anticipates traffic states 15, 30, 45, and 60 minutes ahead |
| 🌊 **Causal Spillback Tracing** | Traces WHY a road is congested and which roads will be affected next |
| 🔀 **Diversion Advisories** | Recommends alternate routes with spare capacity and expected impact |
| 🏗️ **Infrastructure Planning** | Identifies where to invest in road upgrades for maximum long-term benefit |
| 📝 **Natural Language Briefings** | Generates plain-English situational reports that any traffic officer can read |

### Operating Environment (Hyderabad-Like Context)
- **Dense mixed traffic** — autos, bikes, buses, trucks, cars sharing narrow arterials
- **Peak-hour commuter flows** — massive directional surges 7–10 AM and 5–8 PM
- **Signalized junctions** — 89 traffic signals with varying cycle times and green ratios
- **Flyovers & arterial corridors** — multi-level road structures with merge/diverge points
- **Recurring bottlenecks** — persistent geometric/capacity limitations at known choke points
- **Road works, weather, events** — construction closures, monsoon waterlogging, festival surges
- **Incident spillback** — accidents and breakdowns cascading congestion to neighboring segments

> ⚠️ **Compliance:** All actions, diversion plans, and infrastructure suggestions remain **simulated/advisory**. No live signal control, camera access, GPS integration, roadside sensors, or municipal infrastructure access is used.

---

## 📊 Dataset Overview

The organizer-provided dataset simulates a Hyderabad-scale urban network with realistic noise patterns.

### Network Topology
| Component | Count | Description |
|---|---|---|
| Road Segments | 436 | Directed edges with lanes, capacity, speed limits, grade |
| Junctions/Nodes | 120 | Intersection points with lat/lon (~17.3°N, ~78.4°E) |
| Traffic Signals | 89 | Cycle time, green ratio, offset per signal |
| Turn Restrictions | 61 | No-turn and time-window restrictions at junctions |
| OD Demand Pairs | 1,500 | Origin-destination flows by purpose (commercial, school, etc.) |

### Traffic Observations
| Dataset | Rows | Days | Resolution |
|---|---|---|---|
| Training | 1,883,520 | 15 days | 5-minute intervals |
| Validation | 502,272 | 4 days | 5-minute intervals |
| Hidden Test | 1,004,544 | 8 days | Held by organizers |

**Sensor Features (per 5-min reading):**
`speed_kmh` · `flow_vph` · `occupancy_pct` · `travel_time_min` · `free_flow_time_min` · `delay_min` · `queue_length_veh` · `congestion_index` · `sensor_quality`

### Supplementary Data
| File | Rows | Purpose |
|---|---|---|
| Incidents (train) | 49 | Labeled events: stalled_vehicle, demand_surge, lane_blockage |
| Incidents (validation) | 11 | Validation incident labels |
| Context (weather/events) | 4,320 | Temperature, rain, event level, holidays, day/hour |
| Roadworks | 8 + 3 | Active closures with fraction and work type |
| Planning Candidates | 90 | Infrastructure upgrades with cost index and feasibility |
| Scenario Examples | 30 | Evaluation scenarios (+ 36 hidden test scenarios) |
| Forecast Targets | 366K + 481K | Ground truth for 15/30/45/60 min speed, flow, congestion |

### Intentional Data Quality Issues
The dataset contains **6 types of realistic sensor noise** that must be handled:

| Noise Type | What It Looks Like | Our Fix |
|---|---|---|
| 🔀 Row Shuffle | Rows are not in chronological order | Sort by (timestamp, segment_id) |
| 📋 Duplicates | Same (timestamp, segment_id) appears multiple times | Deduplicate, keep first |
| ❌ Negative Readings | speed < 0, flow < 0 (physically impossible) | Set to NaN → interpolate |
| 📈 Spikes | Sudden jumps of 4σ+ from rolling median | Clip to rolling median |
| 🔒 Stuck Sensors | Zero variance across 6+ consecutive readings | Flag sensor_quality = 0 |
| 🕳️ Missing Values | NaN gaps in readings | Forward-fill (limit=3) → linear interpolation |

---

## 🏗️ System Architecture

> 📎 **Interactive architecture diagram:** See `assets/architecture-flow.html` for the full visual flow.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      📡 DATA SOURCES (Organizer-Provided)              │
│  traffic.csv · network.csv · nodes.csv · incidents.csv · context.csv   │
│  signals.csv · turns.csv · od_demand.csv · roadworks.csv · planning.csv│
└───────────────────────────────┬─────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    STAGE 1: INGESTION & CLEANING                       │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐            │
│  │ Data Cleaner │→ │ Graph Builder │→ │ Feature Engineer │            │
│  │ (6 noise fix)│  │ (NetworkX)    │  │ (lags, context)  │            │
│  └──────────────┘  └───────────────┘  └──────────────────┘            │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    STAGE 2: NETWORK STATE ENGINE                       │
│  ┌──────────────────┐  ┌─────────────────┐  ┌───────────────────┐     │
│  │Congestion Tracker│→ │Anomaly Detector │→ │ Spillback Tracer  │     │
│  │(4-level classify)│  │(Stats + ML)     │  │ (BFS propagation) │     │
│  └──────────────────┘  └─────────────────┘  └───────────────────┘     │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               STAGE 3: MULTI-HORIZON FORECASTING                       │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │LightGBM Base  │→ │  ST-GNN      │→ │  Ensemble    │                │
│  │(per segment)  │  │(graph-aware) │  │ (weighted)   │                │
│  └───────────────┘  └──────────────┘  └──────────────┘                │
│            Targets: speed / flow / congestion @ 15, 30, 45, 60 min     │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 STAGE 4: OPERATIONAL ADVISORY ENGINE                    │
│  ┌──────────────────┐  ┌─────────────────┐  ┌───────────────────┐     │
│  │Diversion Planner │→ │Signal Optimizer │→ │ LLM Briefing Gen  │     │
│  │(k-shortest path) │  │(green ratio)    │  │(Groq Llama 3.3)   │     │
│  └──────────────────┘  └─────────────────┘  └───────────────────┘     │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              STAGE 5: INFRASTRUCTURE INTERVENTION SIMULATOR            │
│  ┌──────────────────┐  ┌─────────────────┐  ┌───────────────────┐     │
│  │Bottleneck Finder │→ │What-If Simulator│→ │Cost-Benefit Ranker│     │
│  │(recurring patterns│  │(counterfactual) │  │(ROI per upgrade)  │     │
│  └──────────────────┘  └─────────────────┘  └───────────────────┘     │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    🖥️ DECISION SUPPORT OUTPUTS                         │
│  🌐 3D Globe View  ·  🗺️ Network Map  ·  📊 Static Reports           │
│  🌍 Multi-Lingual  ·  🎮 What-If Console  ·  📋 Action Advisories    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
hack-in/
├── NEURAX_SMART_CITIES_TRAINING_V2/   # 📡 Organizer-provided raw dataset
├── data/
│   ├── raw/                           # Ingested data copies
│   └── processed/                     # Cleaned CSVs, graph pickle, features
├── src/
│   ├── ingestion/                     # Stage 1
│   │   ├── cleaner.py                 #   Data cleaning (6 noise types)
│   │   ├── graph_builder.py           #   Road network graph construction
│   │   └── feature_eng.py             #   Feature engineering pipeline
│   ├── state_engine/                  # Stage 2
│   │   ├── congestion_tracker.py      #   4-level congestion classification
│   │   ├── anomaly_detector.py        #   Statistical + ML anomaly detection
│   │   └── spillback_tracer.py        #   Congestion propagation tracing
│   ├── forecasting/                   # Stage 3
│   │   ├── lightgbm_baseline.py       #   Gradient boosting per segment
│   │   ├── stgnn_model.py             #   Spatial-Temporal Graph Neural Net
│   │   └── ensemble.py                #   Model ensemble & blending
│   ├── advisory/                      # Stage 4
│   │   ├── diversion_planner.py       #   K-shortest path rerouting
│   │   ├── signal_optimizer.py        #   Signal timing recommendations
│   │   └── briefing_generator.py      #   LLM natural-language reports
│   ├── infrastructure/                # Stage 5
│   │   ├── bottleneck_detector.py     #   Recurring bottleneck identification
│   │   ├── intervention_simulator.py  #   Before/after impact simulation
│   │   └── cost_benefit_analyzer.py   #   Investment ranking engine
│   └── api/
│       └── server.py                  # FastAPI backend for dashboard
├── dashboard/
│   └── app.py                         # Streamlit Command Center UI
├── assets/
│   └── architecture-flow.html         # Interactive architecture diagram
├── tests/                             # Unit & integration tests
├── notebooks/                         # EDA & model evaluation
├── requirements.txt                   # Dependencies
├── explain.md                         # Simple explanation document
└── README.md                          # This file
```

---

## 🎯 Module Details

### Module 1: Data Ingestion & Cleaning (`src/ingestion/`)

**Purpose:** Transform noisy, shuffled raw sensor data into a clean, reliable foundation.

| Component | Input | Output | Key Logic |
|---|---|---|---|
| `cleaner.py` | Raw CSVs (1.9M rows) | Cleaned CSVs | Sort → dedupe → fix negatives → clip spikes (4σ) → detect stuck sensors → fill gaps |
| `graph_builder.py` | network.csv + nodes.csv | NetworkX DiGraph + Folium HTML map | 120 nodes with lat/lon, 436 directed edges with capacity/class/signals |
| `feature_eng.py` | Cleaned traffic + context + roadworks | Feature matrix | Lag features, rolling stats, weather join, roadwork flags, signal attributes |

---

### Module 2: Network State Engine (`src/state_engine/`)

**Purpose:** Understand what is happening on the network right now — and trace why.

**Congestion Classification:**
| Level | Speed Ratio (vs Free Flow) | Color | Meaning |
|---|---|---|---|
| 🟢 FREE FLOW | > 80% | Green | Normal traffic |
| 🟡 MODERATE | 50–80% | Yellow | Slowing down, building queues |
| 🟠 HEAVY | 30–50% | Orange | Significant delays, long queues |
| 🔴 GRIDLOCK | < 30% | Red | Near-standstill, severe delays |

**Anomaly & Incident Detection:**
- Statistical baseline: hourly mean ± 3σ per segment for speed and flow
- Incident signature: speed drop >30% AND flow drop >20% AND queue spike >2× within 15-min window
- ML classifier (RandomForest) trained on 49 labeled incidents → classifies: stalled_vehicle, demand_surge, lane_blockage

**Spillback Tracing:**
- BFS traversal from incident segment along road graph
- Tracks delay propagation timing to upstream segments
- Output: causal chain with timestamps — e.g., *"R0376 → R0375 (+8 min) → R0374 (+14 min)"*

---

### Module 3: Multi-Horizon Forecasting (`src/forecasting/`)

**Purpose:** Predict traffic states 15, 30, 45, and 60 minutes into the future.

| Model | Type | Strengths |
|---|---|---|
| LightGBM | Tabular gradient boosting | Fast training, interpretable, strong per-segment baseline |
| ST-GNN | Spatial-Temporal Graph Neural Net | Captures cross-segment dependencies — jam on Road A affects connected Roads B, C, D |
| Ensemble | Weighted blend | Best of both — tabular precision + graph spatial awareness |

**Prediction Targets (per segment, per horizon):**
- `target_speed` — predicted average speed (km/h)
- `target_flow` — predicted vehicle flow (vehicles/hour)
- `target_congestion` — predicted congestion index (0–1)

---

### Module 4: Operational Advisory Engine (`src/advisory/`)

**Purpose:** When a problem is predicted, recommend what to do about it — in human-readable form.

**Diversion Planning:**
- When forecast shows congestion > threshold in T+15 min on segment R_x
- Compute k-shortest alternative paths respecting turn restrictions
- Weight paths by spare capacity (capacity_vph - current_flow_vph)
- Estimate vehicles affected using OD demand profiles

**Signal Optimization:**
- Recommend green-ratio adjustments at upstream signals to meter inflow
- Compute expected queue reduction from signal timing changes

**LLM Situational Briefings (Groq Llama 3.3 70B — Free Tier):**
> *"08:27 — Demand surge detected on R0376 (severity 1, 1 lane blocked). Current flow: 1,847 vph vs capacity 2,700 vph. Forecast: congestion index will reach 0.72 by 08:42 with spillback reaching R0374 by 08:41. Recommended: divert northbound traffic via R0380→R0392 (spare capacity: 800 vph). Signal SIG088 at N002: extend green ratio from 0.58 to 0.72 for 3 cycles. Expected relief: 12 minutes."*

---

### Module 5: Infrastructure Intervention Simulator (`src/infrastructure/`)

**Purpose:** Identify where long-term road improvements would have the most impact, backed by data.

- **Recurring Bottleneck Detection:** Segments with HEAVY/GRIDLOCK congestion for >40% of peak hours across all 15 training days
- **Counterfactual Simulation:** For each of the 90 planning candidates, simulate adding capacity_delta_vph and measure:
  - Average delay reduction (%)
  - Network throughput increase (vehicles/hr)
  - Spillback radius reduction (km)
  - Queue length reduction (vehicles)
- **Cost-Benefit Ranking:** Score = (delay_reduction × affected_vehicles) / cost_index
- **Scenario Evaluation:** Process all 30 scenario examples with baseline vs intervention comparison

---

## 🚀 Implementable Features

### 🌐 3D Globe Visualization
Interactive 3D globe (Deck.gl / CesiumJS) showing the Hyderabad road network rendered in 3D space with:
- Road segments as elevated arcs colored by congestion level
- Flyovers rendered at actual elevation
- Animated particle flow showing vehicle density and direction
- Incident markers with pulsing animation at detection point
- Spillback propagation shown as expanding red wave

### 🌍 Multi-Lingual Support
All system outputs available in three languages relevant to the operating context:
| Language | Code | Use Case |
|---|---|---|
| English | EN | Default for technical operators and reports |
| Hindi | HI | National language for broader accessibility |
| Telugu | TE | Local language for Hyderabad-based field officers |

LLM briefings generated in the selected language via Groq API with language-specific prompting.

### 📊 Static Reports & Graphs
Exportable evidence-based reports for decision-makers who don't use dashboards:
- **PDF Network State Report** — snapshot of all 436 segments with congestion levels, top bottlenecks, active incidents
- **Time-Series Charts** — speed/flow/congestion trends per corridor or segment over selected time window
- **Bottleneck Heatmap** — spatial heatmap of recurring congestion hotspots overlaid on city map
- **Forecast Accuracy Report** — model performance metrics (MAE, RMSE, MAPE) per segment and horizon
- **Infrastructure ROI Table** — ranked list of 90 planning candidates with simulated impact metrics

### 🎮 Interactive What-If Console
Judges and operators can:
| Action | What Happens |
|---|---|
| Drop an incident on any segment | System detects it, traces spillback, generates advisory |
| Close a road segment | Network reroutes traffic, shows capacity impact on alternatives |
| Apply a planning candidate | Before/after comparison with quantified metrics |
| Change signal timing | See effect on queue lengths and throughput at that junction |
| Trigger weather event | Rain/flooding impact propagated across affected segments |
| Simulate VIP corridor lockdown | Temporary closure cascade analysis |

### 📋 Implementable Advisories & Decisions
All recommendations are **simulated and advisory** — no live infrastructure control:

| Advisory Type | Example | Evidence Provided |
|---|---|---|
| **Immediate Diversion** | "Reroute 400 vph from R0377 to R0380→R0392" | Spare capacity math, estimated relief time |
| **Signal Timing Change** | "SIG088: green ratio 0.58 → 0.72 for 15 min" | Queue length projection, throughput gain |
| **Incident Response** | "Deploy response team to R0435 — stalled vehicle, 2 lanes blocked" | Detection confidence, estimated clearance impact |
| **Roadwork Scheduling** | "Shift RW_801_001 to off-peak (10 PM–6 AM) to reduce peak delay by 23%" | Peak vs off-peak congestion comparison |
| **Capacity Upgrade** | "PLAN0376: upgrade R0377 by +500 vph — reduces average delay 34%" | Simulated before/after, cost-benefit score |
| **One-Way Conversion** | "Convert R0212 to one-way during AM peak (7–10 AM)" | Directional flow imbalance data |
| **Emergency Response** | "Congestion on R0376 adds 7 min to ambulance route to nearest hospital" | Travel time simulation with/without congestion |

---

## 🏆 How This Differs From Google Maps

| Dimension | Google Maps | Our System |
|---|---|---|
| **Target User** | Individual driver | City traffic command center / planner |
| **Goal** | "Get me from A to B fastest" | "Keep the entire network flowing for everyone" |
| **Scope** | Single route at a time | All 436 segments simultaneously |
| **Prediction** | ETA for your trip | Network-wide state at 15/30/45/60 min horizons |
| **Causality** | "This road is slow" (no reason) | "Slow because of incident on R0376, spillback chain traced" |
| **Interventions** | None — just reroutes you | Recommends signal changes, diversions, infrastructure upgrades |
| **Infrastructure** | No planning capability | Simulates 90 upgrade candidates with before/after evidence |
| **Graph Awareness** | Hidden, proprietary | Explicit: 120 nodes, 436 edges, signals, turn restrictions, OD demand |
| **Spillback** | Not shown | Animated causal propagation with timing |
| **Cost Analysis** | Not available | ₹ cost of congestion per bottleneck per year |
| **Multi-Stakeholder** | Driver only | Traffic police, planners, emergency services, public transit |
| **Transparency** | Black box | Every recommendation comes with data evidence and expected impact |
| **Language** | ~80 languages (consumer) | EN/HI/TE with domain-specific traffic terminology |
| **Signal Control** | None | Advisory signal timing optimization per junction |
| **Scenario Testing** | Not possible | Interactive what-if: drop incidents, apply upgrades, see impact |

**In one line:** Google Maps helps one driver avoid traffic. We help the city **prevent** traffic.

---

## 📊 Evaluation Checkpoint Alignment

| Checkpoint | Marks | Deliverables |
|---|---|---|
| **CP1** | 15 | ✅ Data cleaning pipeline (6 noise types handled) · ✅ Road network graph (436 segments, 120 nodes) · ✅ Congestion classification (4 levels) · ✅ Anomaly & incident detection |
| **CP2** | 25 | Multi-horizon forecasting (15/30/45/60 min) · Spillback propagation tracing · Diversion advisory generation · Signal optimization |
| **CP3** | 60 | Interactive dashboard · 3D globe view · What-if scenario simulator · 30 scenario evaluations · 90 planning candidate analysis · LLM briefings · Multi-lingual output · Static reports · Cost-benefit rankings · Emergency response impact |
| **Total** | **100** | |

---

## 🚀 Quick Start

```bash
# 1. Navigate to project
cd /Users/nookanikshith/Desktop/hack-in

# 2. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run data cleaning
python -m src.ingestion.cleaner

# 5. Build road network graph
python -m src.ingestion.graph_builder

# 6. Run congestion classification
python -m src.state_engine.congestion_tracker

# 7. Run anomaly detection
python -m src.state_engine.anomaly_detector

# 8. Launch Command Center Dashboard
streamlit run dashboard/app.py
```

---

## 🛠️ Tech Stack (All Free / Open Source)

| Layer | Tools |
|---|---|
| **Language** | Python 3.10+ |
| **Data Processing** | Pandas, NumPy, SciPy |
| **Graph & Network** | NetworkX, OSMnx |
| **Geospatial** | GeoPandas, Shapely, Folium |
| **Machine Learning** | Scikit-learn (RandomForest, IsolationForest), LightGBM |
| **Deep Learning** | PyTorch (Spatial-Temporal GNN) |
| **LLM Briefings** | Groq API — Llama 3.3 70B (free tier) |
| **3D Visualization** | Deck.gl / PyDeck |
| **Dashboard** | Streamlit + Plotly |
| **API Backend** | FastAPI + Uvicorn |
| **Reports** | Matplotlib, Seaborn → PDF/PNG export |

---

## 🔒 Compliance & Simulation Notice

> **All system outputs are strictly simulated and advisory.**
> 
> No live traffic signal control, camera/CCTV access, GPS-device integration, roadside sensor integration, municipal infrastructure access, or actual construction work is performed, attempted, or required.
>
> The system operates entirely on organizer-provided datasets and produces recommendations for human decision-makers to evaluate and act upon through their own authority and existing infrastructure.

---

<p align="center">
  <i>Built for Neurax Hackathon 3.0 — AI in Smart Cities</i>
</p>
