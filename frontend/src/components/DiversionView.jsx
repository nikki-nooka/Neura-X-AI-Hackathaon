import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CornerDownRight,
  Navigation,
  RefreshCw,
  ShieldAlert,
  Sliders,
  Zap,
} from 'lucide-react';
import { fetchDiversions, fetchSignalTune } from '../services/api';

export default function DiversionView({ activeSegment = 'R0435' }) {
  const [segmentId, setSegmentId] = useState(activeSegment);
  const [diversionData, setDiversionData] = useState(null);
  const [signalData, setSignalData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeSegment) setSegmentId(activeSegment);
  }, [activeSegment]);

  const loadAdvisories = async (seg) => {
    setLoading(true);
    try {
      const dRes = await fetchDiversions(seg);
      setDiversionData(dRes);

      if (dRes && dRes.origin_node) {
        const sRes = await fetchSignalTune(dRes.origin_node, 'HEAVY', 40);
        setSignalData(sRes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisories(segmentId);
  }, [segmentId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={20} color="var(--status-green)" />
            <span>Response Simulator: Turn-Restricted Diversions & Signal Optimization</span>
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Constraint-aware network rerouting enforcing municipal turn restrictions with spare capacity validation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-amber" style={{ fontSize: '10px', padding: '4px 10px', fontWeight: 700 }}>
            SIMULATED / ADVISORY ONLY
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            <button className="btn-primary" onClick={() => loadAdvisories(segmentId)} disabled={loading} style={{ padding: '7px 12px' }}>
              <RefreshCw size={12} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Row: Diversion Paths (Left) + Adaptive Signal Optimization (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '18px' }}>
        {/* Recommended Diversion Paths */}
        <div className="clean-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
              RECOMMENDED OPERATIONAL DIVERSIONS
            </div>
            <div className="badge badge-green" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={11} />
              <span>Turn Restrictions Enforced</span>
            </div>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Candidate detours around blocked link <b>{segmentId}</b>, ranked by available bottleneck capacity:
          </p>

          {diversionData && diversionData.alternative_paths && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {diversionData.alternative_paths.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    background: idx === 0 ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${idx === 0 ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-light)'}`,
                    borderRadius: '8px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${idx === 0 ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '10px' }}>
                        Option {idx + 1} {idx === 0 ? '· Optimal' : ''}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Score: {p.recommendation_score}
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--status-amber)', fontWeight: 600 }}>
                      ADVISORY
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', fontFamily: 'monospace' }}>
                    Route: {p.path_segments ? p.path_segments.join(' → ') : p.path_nodes.join(' → ')}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', marginBottom: '8px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Distance: </span>
                      <b style={{ color: 'var(--text-primary)' }}>{p.total_length_km} km</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Est. Time: </span>
                      <b style={{ color: 'var(--text-primary)' }}>{p.travel_time_min} min</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Spare Capacity: </span>
                      <b style={{ color: 'var(--status-green)' }}>{p.bottleneck_spare_capacity_vph} vph</b>
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <b>Reason:</b> Alternative corridor has {p.bottleneck_spare_capacity_vph} vph spare capacity while the incident corridor is overloaded.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upstream Signal Timing Optimization */}
        <div className="clean-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sliders size={18} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Upstream Signal Plan Adjustment
            </h3>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Recommends Webster green-ratio extensions at upstream junction signals to meter inflow.
          </p>

          {signalData && signalData.has_signal ? (
            <div style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.25)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                  Intersection {signalData.node_id} ({signalData.signal_id})
                </span>
                <span className="badge badge-blue">{signalData.action}</span>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                {signalData.rationale}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Green Ratio</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--status-green)', marginTop: '2px', fontFamily: 'monospace' }}>
                    {signalData.base_green_ratio} → {signalData.target_green_ratio}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Cycle Length</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '2px', fontFamily: 'monospace' }}>
                    {signalData.base_cycle_s}s → {signalData.target_cycle_s}s
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} />
                <span>Estimated Queue Reduction / Throughput Gain: <b>+{signalData.estimated_throughput_gain_pct}%</b></span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No upstream signalized junction directly feeding link {segmentId}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
