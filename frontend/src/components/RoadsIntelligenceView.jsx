import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  Layers,
  LineChart,
  Navigation,
  RefreshCw,
  Search,
  Shield,
  Zap,
} from 'lucide-react';
import { fetchAllRoadsIntelligence } from '../services/api';

export default function RoadsIntelligenceView({ onSelectRoad, onOpenModal, onNavigateView }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'ELEVATED' | 'ANOMALY' | 'OPTIMAL'
  const [sortBy, setSortBy] = useState('congestion'); // 'congestion' | 'speed_low' | 'queue' | 'flow' | 'id'
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 30;

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAllRoadsIntelligence();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const roads = data?.roads || [];
  const summary = data?.summary || {
    critical_roads: 4,
    elevated_roads: 18,
    optimal_roads: 414,
    anomalies_detected: 22,
    network_health_score: 95.0,
  };

  // Filter and search logic across all 436 roads
  const filteredRoads = useMemo(() => {
    return roads.filter((r) => {
      // Search matching
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        r.segment_id.toLowerCase().includes(query) ||
        r.road_class.toLowerCase().includes(query) ||
        r.source_node.toLowerCase().includes(query) ||
        r.target_node.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Risk level filtering
      if (filterRisk === 'CRITICAL') return r.ai_risk_level === 'CRITICAL';
      if (filterRisk === 'ELEVATED') return r.ai_risk_level === 'ELEVATED';
      if (filterRisk === 'ANOMALY') return r.is_anomaly;
      if (filterRisk === 'OPTIMAL') return r.ai_risk_level === 'OPTIMAL';
      return true;
    });
  }, [roads, searchQuery, filterRisk]);

  // Sort logic
  const sortedRoads = useMemo(() => {
    const arr = [...filteredRoads];
    if (sortBy === 'congestion') {
      arr.sort((a, b) => b.congestion_index - a.congestion_index);
    } else if (sortBy === 'speed_low') {
      arr.sort((a, b) => a.speed_kmh - b.speed_kmh);
    } else if (sortBy === 'queue') {
      arr.sort((a, b) => b.queue_length_veh - a.queue_length_veh);
    } else if (sortBy === 'flow') {
      arr.sort((a, b) => b.flow_vph - a.flow_vph);
    } else if (sortBy === 'id') {
      arr.sort((a, b) => a.segment_id.localeCompare(b.segment_id));
    }
    return arr;
  }, [filteredRoads, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedRoads.length / PAGE_SIZE) || 1;
  const paginatedRoads = sortedRoads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="var(--accent-blue)" />
            <span>436 Road Network Directory · AI Corridor Intelligence</span>
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Continuously tracking all 436 urban segments with live telemetry, multi-horizon AI risk ratings, and operational advisories.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={loadData}
          disabled={loading}
          style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={12} className={loading ? 'spin' : ''} />
          <span>Refresh All 436 Telemetry</span>
        </button>
      </div>

      {/* Top 5 Citywide KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        <div className="clean-card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Monitored</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            436
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>100% network coverage</div>
        </div>

        <div className="clean-card" style={{ padding: '14px', borderLeft: '3px solid var(--status-red)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Critical Bottlenecks</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--status-red)', fontFamily: 'monospace' }}>
            {summary.critical_roads}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--status-red)' }}>Congestion &gt; 60%</div>
        </div>

        <div className="clean-card" style={{ padding: '14px', borderLeft: '3px solid var(--status-amber)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Elevated Inflow</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--status-amber)', fontFamily: 'monospace' }}>
            {summary.elevated_roads}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Approaching capacity</div>
        </div>

        <div className="clean-card" style={{ padding: '14px', borderLeft: '3px solid var(--status-green)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Optimal Flow</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--status-green)', fontFamily: 'monospace' }}>
            {summary.optimal_roads}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--status-green)' }}>Free flowing links</div>
        </div>

        <div className="clean-card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Active Anomalies</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'monospace' }}>
            {summary.anomalies_detected}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>&gt; 3σ speed deviations</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="clean-card" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search all 436 roads (e.g. R0435, arterial, N024)..."
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All (${roads.length})` },
            { id: 'CRITICAL', label: `Critical (${summary.critical_roads})` },
            { id: 'ELEVATED', label: `Elevated (${summary.elevated_roads})` },
            { id: 'ANOMALY', label: `Anomalies (${summary.anomalies_detected})` },
            { id: 'OPTIMAL', label: `Optimal (${summary.optimal_roads})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                setFilterRisk(pill.id);
                setPage(1);
              }}
              style={{
                background: filterRisk === pill.id ? 'var(--accent-blue)' : 'rgba(255,255,255,0.04)',
                color: filterRisk === pill.id ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowUpDown size={14} color="var(--text-muted)" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              padding: '5px 10px',
              fontSize: '11px',
              outline: 'none',
            }}
          >
            <option value="congestion">Highest Congestion</option>
            <option value="speed_low">Lowest Speed</option>
            <option value="queue">Longest Queue</option>
            <option value="flow">Highest Volume</option>
            <option value="id">Segment ID (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main 436 Roads Table */}
      <div className="clean-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Showing {paginatedRoads.length} of {sortedRoads.length} Road Segments
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="clean-table" style={{ width: '100%', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>Segment ID</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Corridor Nodes</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Classification</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Speed</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Flow Volume</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Queue</th>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>Congestion & AI Risk</th>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>AI Predictive Intelligence</th>
                <th style={{ textAlign: 'right', padding: '10px 14px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRoads.map((road) => {
                const congPct = Math.round(road.congestion_index * 100);
                const isCritical = road.ai_risk_level === 'CRITICAL';
                const isElevated = road.ai_risk_level === 'ELEVATED';

                return (
                  <tr
                    key={road.segment_id}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      background: isCritical ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                    }}
                  >
                    {/* Segment ID */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)' }}>
                          {road.segment_id}
                        </span>
                        {road.is_anomaly && (
                          <span className="badge badge-amber" style={{ fontSize: '8px', padding: '1px 5px' }}>
                            Anomaly
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Nodes */}
                    <td style={{ padding: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '11px' }}>
                      {road.source_node} → {road.target_node}
                    </td>

                    {/* Classification */}
                    <td style={{ padding: '10px' }}>
                      <div style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {road.road_class}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {road.lanes} lanes · {road.capacity_vph} vph
                      </div>
                    </td>

                    {/* Speed */}
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: isCritical ? 'var(--status-red)' : 'var(--text-primary)' }}>
                        {road.speed_kmh} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>km/h</span>
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                        limit {road.free_flow_speed_kmh}
                      </div>
                    </td>

                    {/* Flow */}
                    <td style={{ textAlign: 'center', padding: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {Math.round(road.flow_vph).toLocaleString()} vph
                    </td>

                    {/* Queue */}
                    <td style={{ textAlign: 'center', padding: '10px', fontFamily: 'monospace', color: road.queue_length_veh > 5 ? 'var(--status-amber)' : 'var(--text-muted)' }}>
                      {road.queue_length_veh} veh
                    </td>

                    {/* Congestion Progress Bar & Risk */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span
                          className={`badge ${isCritical ? 'badge-red' : isElevated ? 'badge-amber' : 'badge-green'}`}
                          style={{ fontSize: '9px', padding: '1px 6px' }}
                        >
                          {road.ai_risk_level} ({congPct}%)
                        </span>
                      </div>
                      <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(congPct, 100)}%`,
                            height: '100%',
                            background: isCritical ? 'var(--status-red)' : isElevated ? 'var(--status-amber)' : 'var(--status-green)',
                          }}
                        />
                      </div>
                    </td>

                    {/* AI Predictive Intelligence */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: isCritical ? 'var(--status-red)' : 'var(--text-primary)' }}>
                        {road.ai_predicted_trend}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Action: {road.ai_recommendation}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => {
                            if (onSelectRoad) onSelectRoad(road.segment_id);
                            if (onNavigateView) onNavigateView('forecast');
                          }}
                          style={{
                            background: 'rgba(37, 99, 235, 0.12)',
                            color: 'var(--accent-blue)',
                            border: '1px solid rgba(37, 99, 235, 0.3)',
                            borderRadius: '5px',
                            padding: '4px 8px',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Forecast
                        </button>

                        <button
                          onClick={() => {
                            if (onSelectRoad) onSelectRoad(road.segment_id);
                            if (onNavigateView) onNavigateView('spillback');
                          }}
                          style={{
                            background: 'rgba(234, 179, 8, 0.12)',
                            color: 'var(--status-amber)',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            borderRadius: '5px',
                            padding: '4px 8px',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Spillback
                        </button>

                        <button
                          onClick={() => {
                            if (onSelectRoad) onSelectRoad(road.segment_id);
                            if (onOpenModal) onOpenModal();
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '5px',
                            padding: '4px 8px',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Simulate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, sortedRoads.length)} to {Math.min(page * PAGE_SIZE, sortedRoads.length)} of {sortedRoads.length} roads
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: '5px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <div style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: '5px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
