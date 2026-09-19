# What Are We Building? (Simple Explanation)

## One-Line Answer
A **smart traffic brain** for a city like Hyderabad that watches roads, predicts jams before they happen, suggests shortcuts, and tells the city where to build better roads.

---

## Think of It Like This

Imagine you're sitting in a **city traffic control room** with 100 TV screens showing every major road. Right now, a human operator stares at those screens and reacts when things go wrong. Our system **replaces that human guessing** with an AI that:

1. **Sees everything** — processes data from 436 road segments and 120 junctions every 5 minutes
2. **Thinks ahead** — predicts what traffic will look like 15, 30, 45, and 60 minutes from now
3. **Explains why** — doesn't just say "Road X is jammed," but traces the cause: "There's a stalled truck on Road 376, and the backup will reach Road 374 in 14 minutes"
4. **Suggests fixes** — recommends alternate routes, signal timing changes, and which roads to upgrade

---

## The 5 Things Our System Does

### 🧹 Step 1: Clean the Messy Data
The organizers gave us **1.8 million rows** of traffic sensor data — but it's intentionally dirty. Some sensors are broken, some readings are negative (impossible), some rows are duplicated. Our first job is to clean all of this up so the AI doesn't learn garbage.

**Input:** Raw messy CSV files  
**Output:** Clean, reliable traffic data ready for analysis

---

### 🔍 Step 2: Understand What's Happening Right Now
Look at every road segment and figure out:
- Is it flowing freely or jammed?
- Is this normal rush-hour congestion, or did something unusual happen?
- If there's an incident (accident, stalled vehicle, road work), detect it automatically from the sensor patterns

**Think of it as:** A doctor reading vital signs — "heart rate is abnormal" → "probable cause: X"

---

### 🔮 Step 3: Predict What Will Happen Next
Using patterns from 15 days of historical data, predict:
- What will the speed be on each road in 15 minutes? 30? 45? 60?
- Will congestion spread to neighboring roads?
- How bad will it get?

We use two approaches:
- **Traditional ML (LightGBM):** Fast, works well per individual road
- **Graph Neural Network:** Understands that roads are connected — a jam on Road A affects Roads B, C, D connected to it

**Think of it as:** Weather forecasting, but for traffic

---

### 🚗 Step 4: Recommend What To Do About It
When we predict a problem, we suggest:
- **Diversion routes:** "Reroute 400 vehicles/hour from Road 377 to Road 380 — it has spare capacity"
- **Signal changes:** "Extend green light at Junction N023 by 8 seconds to flush the queue"
- **Plain-English briefings:** An AI (Groq Llama 3.3) writes a human-readable report like:

> *"08:27 — Demand surge on R0376. Flow at 68% capacity and rising. Congestion will hit 0.72 by 08:42. Recommend diverting via R0380→R0392. Adjust signal SIG088 green ratio from 0.58 to 0.72 for 3 cycles. Expected relief: 12 minutes."*

---

### 🏗️ Step 5: Tell the City What to Build
Some jams happen every single day at the same spot — no amount of rerouting fixes a road that's simply too narrow. We identify these **recurring bottlenecks** and simulate:

- "If you add 500 vehicles/hour capacity to Road 377, average delay drops 34%"
- "This upgrade costs index 12 but saves X vehicle-hours per day"
- Rank all 90 possible infrastructure projects by bang-for-buck

**Think of it as:** A city planner's cheat sheet — "spend money HERE for maximum impact"

---

## What Makes Ours Different From Other Teams?

| Most teams will build | We build instead |
|---|---|
| A heatmap showing red/green roads | A **causal chain** showing WHY a road is red and which roads will turn red next |
| A basic prediction model | A **graph-aware model** that knows roads are connected, not independent |
| Static charts | An **interactive what-if simulator** where judges can trigger incidents and watch the network respond |
| Numbers and tables | **Natural language briefings** a traffic officer can actually read and act on |
| "This road is congested" | "This bottleneck costs ₹X/year in fuel+delays. Upgrading it ranks #3 out of 90 candidates by cost-effectiveness" |

---

## What It Looks Like (The Dashboard)

A web-based **Command Center** with:

1. **Live Map** — Hyderabad road network colored by congestion level, animated spillback propagation
2. **Forecast Panel** — Click any road → see predicted speed/flow/congestion for next 60 min
3. **Alert Feed** — Auto-detected incidents with severity, affected area, and recommended response
4. **What-If Console** — Drop an incident on any road, apply a planning candidate, see before/after
5. **Infrastructure Planner** — Ranked table of all 90 upgrade candidates with simulated impact
6. **Briefing Generator** — One-click natural language situation report for any scenario

---

## The Data We're Working With

```
436 road segments (with lanes, speed limits, capacity)
120 junctions (with real Hyderabad coordinates)
89 traffic signals (with timing plans)
61 turn restrictions
1,500 origin-destination travel demand pairs
90 infrastructure upgrade candidates
49 labeled incidents (training) + 11 (validation)
30 evaluation scenarios (+ 36 hidden test scenarios)
~1.9 million traffic readings (training)
~500K traffic readings (validation)
```

All at **5-minute resolution** over **15 training days + 4 validation days** (8 hidden test days held by organizers).

---

## Tech Stack (All Free)

| Component | Tool |
|---|---|
| Language | Python 3.10+ |
| Graph & Network | NetworkX, OSMnx |
| ML / Forecasting | Scikit-Learn (`HistGradientBoostingRegressor`, `RandomForestClassifier`) |
| Data Processing | Pandas, NumPy, SciPy |
| Geospatial | GeoPandas, Shapely, Folium |
| Dashboard | Streamlit + Plotly |
| LLM Briefings | Groq API (Llama 3.3 70B, free tier) |
| API Backend | FastAPI |

---

## In Summary

We're building an **AI traffic control room assistant** that:
- Watches 436 roads every 5 minutes
- Cleans noisy sensor data automatically
- Detects incidents from sensor patterns
- Predicts traffic 15–60 minutes ahead using graph-aware AI
- Suggests diversions, signal changes, and explains reasoning in plain English
- Ranks infrastructure investments by cost-effectiveness
- Lets judges interact with a live what-if simulator

**Not a navigation app. Not a chatbot. A decision-support system with evidence.**
