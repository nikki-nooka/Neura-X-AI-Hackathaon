"""
Road network graph construction module.

Builds a NetworkX DiGraph from the NEURAX Smart Cities dataset,
attaching node/edge attributes, signal plans, turn restrictions,
and OD demand profiles. Provides utility functions for querying
the graph and a folium-based HTML map visualizer.
"""

import os
import pickle
from collections import defaultdict
from pathlib import Path

import networkx as nx
import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_DATA_DIR = _PROJECT_ROOT / "NEURAX_SMART_CITIES_TRAINING_V2"
_PROCESSED_DIR = _PROJECT_ROOT / "data" / "processed"

NODES_CSV = _DATA_DIR / "nodes.csv"
NETWORK_CSV = _DATA_DIR / "network.csv"
SIGNAL_PLANS_CSV = _DATA_DIR / "signal_plans.csv"
TURN_RESTRICTIONS_CSV = _DATA_DIR / "turn_restrictions.csv"
OD_DEMAND_CSV = _DATA_DIR / "od_demand_profiles.csv"
GRAPH_PICKLE = _PROCESSED_DIR / "road_network.gpickle"


# ---------------------------------------------------------------------------
# Core builder
# ---------------------------------------------------------------------------

def build_graph() -> nx.DiGraph:
    """
    Build a NetworkX DiGraph from the CSV dataset files.

    Returns:
        nx.DiGraph with node/edge attributes, signal plans, turn
        restrictions, and OD demand stored as graph-level metadata.
    """
    # ---- load data --------------------------------------------------------
    nodes_df = pd.read_csv(NODES_CSV)
    network_df = pd.read_csv(NETWORK_CSV)
    signal_df = pd.read_csv(SIGNAL_PLANS_CSV)
    turns_df = pd.read_csv(TURN_RESTRICTIONS_CSV)
    od_df = pd.read_csv(OD_DEMAND_CSV)

    G = nx.DiGraph()

    # ---- nodes ------------------------------------------------------------
    # Index signal plans by node_id for fast lookup (a node can have
    # multiple signals on different approaches, so collect as list).
    signal_by_node: dict[str, list[dict]] = defaultdict(list)
    for _, row in signal_df.iterrows():
        signal_by_node[row["node_id"]].append(row.to_dict())

    # Index turn restrictions by node_id.
    turns_by_node: dict[str, list[dict]] = defaultdict(list)
    for _, row in turns_df.iterrows():
        turns_by_node[row["node_id"]].append({
            "from_segment": row["from_segment"],
            "to_segment": row["to_segment"],
            "restriction": row["restriction"],
        })

    for _, row in nodes_df.iterrows():
        nid = row["node_id"]
        attrs = {
            "x": row["x"],
            "y": row["y"],
            "lat": row["lat"],
            "lon": row["lon"],
        }
        # Attach signal plans if present.
        if nid in signal_by_node:
            attrs["signal_plans"] = signal_by_node[nid]
        # Attach turn restrictions if present.
        if nid in turns_by_node:
            attrs["turn_restrictions"] = turns_by_node[nid]
        G.add_node(nid, **attrs)

    # ---- edges (directed segments) ----------------------------------------
    edge_attr_cols = [
        "segment_id", "road_class", "lanes", "free_flow_speed_kmh",
        "capacity_vph", "length_km", "grade_pct", "signal_id",
        "structural_bottleneck", "importance", "peak_capacity_factor",
    ]
    for _, row in network_df.iterrows():
        attrs = {col: row[col] for col in edge_attr_cols}
        G.add_edge(row["source_node"], row["target_node"], **attrs)

    # ---- OD demand as graph-level attribute --------------------------------
    G.graph["od_demand"] = od_df

    return G


# ---------------------------------------------------------------------------
# Query helpers
# ---------------------------------------------------------------------------

def _build_segment_index(G: nx.DiGraph) -> dict[str, tuple[str, str]]:
    """Return {segment_id: (source, target)} for the whole graph."""
    return {
        d["segment_id"]: (u, v)
        for u, v, d in G.edges(data=True)
    }


def get_segment_neighbors(G: nx.DiGraph, segment_id: str) -> list[str]:
    """
    Return segment_ids of edges that are adjacent to *segment_id*
    (share a common endpoint node).
    """
    idx = _build_segment_index(G)
    if segment_id not in idx:
        raise KeyError(f"Segment {segment_id} not found in graph")
    src, tgt = idx[segment_id]
    neighbors: set[str] = set()
    # Edges entering src or leaving src, and edges entering tgt or leaving tgt.
    for node in (src, tgt):
        for _, _, d in G.in_edges(node, data=True):
            if d["segment_id"] != segment_id:
                neighbors.add(d["segment_id"])
        for _, _, d in G.out_edges(node, data=True):
            if d["segment_id"] != segment_id:
                neighbors.add(d["segment_id"])
    return sorted(neighbors)


def get_bottleneck_segments(G: nx.DiGraph) -> list[str]:
    """Return segment_ids where structural_bottleneck == 1."""
    return sorted(
        d["segment_id"]
        for _, _, d in G.edges(data=True)
        if d.get("structural_bottleneck") == 1
    )


def get_path_capacity(G: nx.DiGraph, path_nodes: list[str]) -> float:
    """
    Return the minimum *capacity_vph* along a path defined as an
    ordered list of node ids.

    Raises KeyError if any consecutive pair is not an edge.
    """
    if len(path_nodes) < 2:
        raise ValueError("Path must contain at least two nodes")
    min_cap = float("inf")
    for u, v in zip(path_nodes[:-1], path_nodes[1:]):
        if not G.has_edge(u, v):
            raise KeyError(f"No edge from {u} to {v}")
        cap = G[u][v]["capacity_vph"]
        if cap < min_cap:
            min_cap = cap
    return min_cap


# ---------------------------------------------------------------------------
# Visualisation
# ---------------------------------------------------------------------------

_ROAD_CLASS_COLORS = {
    "arterial": "#e63946",       # red
    "collector": "#457b9d",      # blue
    "local": "#2a9d8f",          # teal
    "highway": "#f77f00",        # orange
    "expressway": "#7209b7",     # purple
    "freeway": "#d62828",        # dark red
    "residential": "#588157",    # green
}
_DEFAULT_COLOR = "#999999"


def visualize_network(G: nx.DiGraph, output_path: str | os.PathLike) -> None:
    """
    Save an interactive Folium HTML map of the road network.

    Nodes are circle markers; edges are polylines coloured by road_class.
    """
    import folium

    # Centre map on the mean lat/lon.
    lats = [d["lat"] for _, d in G.nodes(data=True) if "lat" in d]
    lons = [d["lon"] for _, d in G.nodes(data=True) if "lon" in d]
    centre = [sum(lats) / len(lats), sum(lons) / len(lons)]

    m = folium.Map(location=centre, zoom_start=13, tiles="cartodbpositron")

    # Build a fast node-id -> (lat, lon) lookup.
    node_coords = {
        nid: (d["lat"], d["lon"])
        for nid, d in G.nodes(data=True)
        if "lat" in d and "lon" in d
    }

    # -- edges --------------------------------------------------------------
    for u, v, d in G.edges(data=True):
        if u not in node_coords or v not in node_coords:
            continue
        road_class = d.get("road_class", "")
        color = _ROAD_CLASS_COLORS.get(road_class, _DEFAULT_COLOR)
        popup_text = (
            f"<b>{d['segment_id']}</b><br>"
            f"Road class: {road_class}<br>"
            f"Lanes: {d.get('lanes')}<br>"
            f"Speed: {d.get('free_flow_speed_kmh')} km/h<br>"
            f"Capacity: {d.get('capacity_vph')} vph<br>"
            f"Length: {d.get('length_km')} km<br>"
            f"Bottleneck: {'Yes' if d.get('structural_bottleneck') == 1 else 'No'}"
        )
        folium.PolyLine(
            locations=[node_coords[u], node_coords[v]],
            color=color,
            weight=3,
            opacity=0.8,
            popup=folium.Popup(popup_text, max_width=250),
            tooltip=d["segment_id"],
        ).add_to(m)

    # -- nodes --------------------------------------------------------------
    for nid, d in G.nodes(data=True):
        if nid not in node_coords:
            continue
        has_signal = "signal_plans" in d
        has_restriction = "turn_restrictions" in d
        icon_color = "red" if has_signal else "blue"
        popup_parts = [f"<b>{nid}</b>"]
        if has_signal:
            for sp in d["signal_plans"]:
                popup_parts.append(
                    f"Signal {sp['signal_id']}: cycle={sp['cycle_s']}s, "
                    f"green={sp['green_ratio']:.0%}"
                )
        if has_restriction:
            for tr in d["turn_restrictions"]:
                popup_parts.append(
                    f"Restriction: {tr['from_segment']}→{tr['to_segment']} "
                    f"({tr['restriction']})"
                )
        folium.CircleMarker(
            location=node_coords[nid],
            radius=5,
            color=icon_color,
            fill=True,
            fill_opacity=0.8,
            popup=folium.Popup("<br>".join(popup_parts), max_width=300),
            tooltip=nid,
        ).add_to(m)

    # -- legend -------------------------------------------------------------
    legend_html = """
    <div style="position:fixed;bottom:30px;left:30px;z-index:9999;
                background:white;padding:10px;border-radius:5px;
                border:1px solid grey;font-size:12px;">
    <b>Road Class</b><br>
    """
    for cls, clr in _ROAD_CLASS_COLORS.items():
        legend_html += (
            f'<i style="background:{clr};width:14px;height:14px;'
            f'display:inline-block;margin-right:4px;"></i> {cls}<br>'
        )
    legend_html += "</div>"
    m.get_root().html.add_child(folium.Element(legend_html))

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    m.save(str(output_path))
    print(f"Map saved to {output_path}")


# ---------------------------------------------------------------------------
# Persistence
# ---------------------------------------------------------------------------

def save_graph(G: nx.DiGraph, path: str | os.PathLike | None = None) -> Path:
    """Pickle the graph to disk."""
    path = Path(path) if path else GRAPH_PICKLE
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "wb") as f:
        pickle.dump(G, f, protocol=pickle.HIGHEST_PROTOCOL)
    print(f"Graph saved to {path}")
    return path


def load_graph(path: str | os.PathLike | None = None) -> nx.DiGraph:
    """Load a previously-pickled graph."""
    path = Path(path) if path else GRAPH_PICKLE
    with open(path, "rb") as f:
        return pickle.load(f)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("Building road network graph …")
    G = build_graph()

    # ---- summary stats ----------------------------------------------------
    n_nodes = G.number_of_nodes()
    n_edges = G.number_of_edges()
    bottlenecks = get_bottleneck_segments(G)
    signal_nodes = [n for n, d in G.nodes(data=True) if "signal_plans" in d]
    restricted_nodes = [n for n, d in G.nodes(data=True) if "turn_restrictions" in d]
    od_df: pd.DataFrame = G.graph["od_demand"]

    print(f"  Nodes          : {n_nodes}")
    print(f"  Edges          : {n_edges}")
    print(f"  Bottlenecks    : {len(bottlenecks)}")
    print(f"  Signal nodes   : {len(signal_nodes)}")
    print(f"  Restricted nodes: {len(restricted_nodes)}")
    print(f"  OD pairs       : {len(od_df)}")

    # ---- road-class distribution ------------------------------------------
    class_counts = defaultdict(int)
    for _, _, d in G.edges(data=True):
        class_counts[d.get("road_class", "unknown")] += 1
    print("  Road class distribution:")
    for cls in sorted(class_counts):
        print(f"    {cls:15s}: {class_counts[cls]}")

    # ---- persist ----------------------------------------------------------
    save_graph(G)

    # ---- HTML map ---------------------------------------------------------
    map_path = _PROCESSED_DIR / "road_network_map.html"
    visualize_network(G, map_path)

    print("\nDone.")


if __name__ == "__main__":
    main()
