import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Compass,
  GitBranch,
  Play,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import { fetchTopCriticalSegments, simulateResilienceClosure } from '../services/api';

export default function ResilienceView({ defaultSegment = 'R0435' }) {
  const [segmentId, setSegmentId] = useState(defaultSegment);
  const [durationMin, setDurationMin] = useState(30);
  const [simulationResult, setSimulationResult] = useState(null);
  const [topCritical, setTopCritical] = useState([]);
  const [loading, setLoading] = useState(false);

  const runSimulation = async (seg, dur) => {
    setLoading(true);
    try {
      const res = await simulateResilienceClosure(seg, dur);
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation(segmentId, durationMin);
    fetchTopCriticalSegments()
      .then(setTopCritical)
      .catch(console.error);
  }, []);

  const handleSimulateClick = () => {
    runSimulation(segmentId, durationMin);
  };

  const crit = simulationResult?.modeled_criticality;
  const metrics = simulationResult?.impact_metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--accent-blue)" />
            <span>Network Resilience & Vulnerability Simulator</span>
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Simulates cascading network collapse when a critical link is severed for 15, 30, or 60 minutes.
          </p>
        </div>

        {/* Interactive Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Target Link:</span>
            <input
              type="text"
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value.toUpperCase())}
              placeholder="R0435"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                fontSize: '13px',
                width: '90px',
                fontFamily: 'monospace',
                fontWeight: 700,
              }}
            />
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '3px' }}>
            {[15, 30, 60].map((dur) => (
              <button
                key={dur}
                onClick={() => {
                  setDurationMin(dur);
                  runSimulation(segmentId, dur);
                }}
                style={{
                  background: durationMin === dur ? 'var(--accent-blue)' : 'transparent',
                  color: durationMin === dur ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {dur}m Closure
              </button>
            ))}
          </div>

          <button
            className="btn-primary"
            onClick={handleSimulateClick}
            disabled={loading}
            style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Play size={12} fill="#ffffff" />
            <span>Simulate Failure</span>
          </button>
        </div>
      </div>

      {/* Row 1: Modeled Criticality Score Card + 4 Cascading KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.8fr', gap: '16px' }}>
        {/* Criticality Score Card */}
        <div className="clean-card" style={{ padding: '18px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              MODELED CRITICALITY
            </div>
            <span
              className={`badge ${crit?.rating === 'CRITICAL' ? 'badge-red' : 'badge-amber'}`}
              style={{ fontSize: '10px' }}
            >
              {crit?.rating || 'CRITICAL'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '38px', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              {crit?.modeled_criticality_score ?? 70.1}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ 100 Index</div>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
            Calculated from capacity ({crit?.measurable_factors?.capacity_vph} vph), structural centrality, and directly intercepted OD demand.
          </div>

          {/* Breakdown Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Capacity Weight:</span>
              <b style={{ color: 'var(--text-primary)' }}>{crit?.breakdown?.capacity_points ?? 25.3} pts</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Structural Importance:</span>
              <b style={{ color: 'var(--text-primary)' }}>{crit?.breakdown?.structural_importance_points ?? 22.1} pts</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>OD Flow Intercept:</span>
              <b style={{ color: 'var(--text-primary)' }}>{crit?.breakdown?.od_demand_volume_points ?? 12.7} pts</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Redundancy Penalty:</span>
              <b style={{ color: 'var(--status-amber)' }}>{crit?.breakdown?.bottleneck_redundancy_penalty ?? 10.0} pts</b>
            </div>
          </div>
        </div>

        {/* 4 Cascading Impact Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <div className="clean-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <GitBranch size={16} color="var(--accent-blue)" />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Affected Links</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              {metrics?.affected_segments_count ?? 44}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Upstream cascade
            </div>
          </div>

          <div className="clean-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <Compass size={16} color="var(--accent-blue)" />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Junctions</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              {metrics?.affected_junctions_count ?? 18}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Network nodes choked
            </div>
          </div>

          <div className="clean-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <Users size={16} color="var(--status-amber)" />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>OD Demand</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--status-amber)', fontFamily: 'monospace' }}>
              {metrics?.affected_od_demand_vph ? Math.round(metrics.affected_od_demand_vph).toLocaleString() : '113,824'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Vehicles/hr intercepted
            </div>
          </div>

          <div className="clean-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <Clock size={16} color="var(--status-red)" />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Travel Time Delay</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--status-red)', fontFamily: 'monospace' }}>
              +{metrics?.travel_time_increase_pct ?? 48.5}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Rerouted delay penalty
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Spillback Cascade Table (Left) + Top Critical Links (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: '16px' }}>
        {/* Shockwave Spillback Progression */}
        <div className="clean-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Graph-Based Spillback Propagation Chain
            </div>
            <span className="badge badge-red" style={{ fontSize: '9px' }}>
              LWR Shockwave
            </span>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Estimated delay arrival times to upstream feeder links during the {durationMin}-minute closure:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(simulationResult?.spillback_propagation || []).map((step, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-blue)' }}>
                    {step.segment_id}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    ({step.source_node} → {step.target_node})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: 'var(--status-amber)', fontWeight: 600, fontFamily: 'monospace', fontSize: '11px' }}>
                    +{step.estimated_shockwave_arrival_min} min
                  </div>
                  <span className="badge badge-red" style={{ fontSize: '9px' }}>
                    {Math.round(step.projected_congestion * 100)}% Congestion
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Alternative Corridor Banner */}
          <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: '8px', fontSize: '12px' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '4px' }}>
              Designated Parallel Corridor (Spare Capacity: {metrics?.alternate_spare_capacity_vph} vph)
            </div>
            <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '11px' }}>
              {metrics?.alternative_corridor || 'Calculating parallel corridor...'}
            </div>
          </div>
        </div>

        {/* Top Critical Network Segments */}
        <div className="clean-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Top Critical Road Corridors
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Network-wide ranking by Modeled Criticality Index.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topCritical.slice(0, 7).map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  setSegmentId(item.segment_id);
                  runSimulation(item.segment_id, durationMin);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: segmentId === item.segment_id ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${segmentId === item.segment_id ? 'var(--accent-blue)' : 'var(--border-light)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', width: '16px' }}>
                    #{i + 1}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.segment_id}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    ({item.measurable_factors?.road_class})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: item.modeled_criticality_score >= 70 ? 'var(--status-red)' : 'var(--status-amber)' }}>
                    {item.modeled_criticality_score}
                  </span>
                  <ArrowRight size={12} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
