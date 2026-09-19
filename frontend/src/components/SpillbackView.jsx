import React, { useEffect, useState } from 'react';
import { AlertOctagon, Clock, GitCommit, Layers, RefreshCw, Users } from 'lucide-react';
import { fetchSpillback } from '../services/api';

export default function SpillbackView({ activeSegment = 'R0376', onHighlightSegments }) {
  const [segmentId, setSegmentId] = useState(activeSegment);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeSegment) setSegmentId(activeSegment);
  }, [activeSegment]);

  const loadSpillback = async (targetId) => {
    setLoading(true);
    try {
      const res = await fetchSpillback(targetId, 3);
      setData(res);
      if (onHighlightSegments && res.cascade_steps) {
        onHighlightSegments(res.cascade_steps.map((s) => s.segment_id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpillback(segmentId);
  }, [segmentId]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
      {/* Cascade Tree Panel */}
      <div className="hud-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--neon-amber)" />
              <span>Upstream Queue Shockwave Cascade</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Kinematic wave backward wavefront propagation based on graph topology.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value.toUpperCase())}
              placeholder="e.g. R0376"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                padding: '6px 10px',
                fontSize: '12px',
                width: '90px',
                fontFamily: 'var(--font-mono)',
              }}
            />
            <button className="btn-primary" onClick={() => loadSpillback(segmentId)} disabled={loading} style={{ padding: '6px 12px' }}>
              <RefreshCw size={12} className={loading ? 'spin' : ''} />
              <span>Trace</span>
            </button>
          </div>
        </div>

        {loading && <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>Tracing graph propagation...</div>}

        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
            {data.cascade_steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: step.hop === 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${step.hop === 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`,
                  borderLeft: `4px solid ${step.hop === 0 ? '#ef4444' : step.hop === 1 ? '#f97316' : '#eab308'}`,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {step.segment_id}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ({step.source_node} → {step.target_node})
                    </span>
                    <span className={`badge ${step.severity === 'CRITICAL' ? 'badge-red' : step.severity === 'HIGH' ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                      {step.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Road: <b style={{ color: 'var(--text-primary)' }}>{step.road_class}</b> · Speed: {step.free_flow_speed_kmh} km/h · Capacity: {step.capacity_vph} vph
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: step.hop === 0 ? 'var(--neon-red)' : 'var(--neon-amber)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>+{step.eta_minutes} min</span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Hop {step.hop} Upstream</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Affected Origin-Destination Demand */}
      <div className="hud-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Users size={18} color="var(--neon-cyan)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Affected Commuter OD Trips</h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Origin-Destination travel demands passing through the active queue shockwave corridor.
        </p>

        {data && data.affected_od_pairs && (
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table className="hud-table">
              <thead>
                <tr>
                  <th>OD ID</th>
                  <th>Corridor</th>
                  <th>Demand</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {data.affected_od_pairs.map((od, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--neon-cyan)' }}>{od.od_id}</td>
                    <td>{od.origin} → {od.destination}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{od.base_demand_vph} vph</td>
                    <td>
                      <span className="badge badge-purple" style={{ fontSize: '9px', padding: '2px 6px' }}>{od.purpose}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
