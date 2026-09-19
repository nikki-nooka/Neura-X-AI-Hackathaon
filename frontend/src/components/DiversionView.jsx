import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, CornerDownRight, Navigation, Sliders, Zap } from 'lucide-react';
import { fetchDiversions, fetchSignalTune } from '../services/api';

export default function DiversionView({ activeSegment = 'R0376' }) {
  const [segmentId, setSegmentId] = useState(activeSegment);
  const [diversionData, setDiversionData] = useState(null);
  const [signalData, setSignalData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadAdvisories = async (seg) => {
    setLoading(true);
    try {
      const dRes = await fetchDiversions(seg);
      setDiversionData(dRes);

      // Tune signal for source node
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
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
      {/* Detour Routes Card */}
      <div className="hud-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} color="var(--neon-green)" />
              <span>Turn-Restricted Operational Diversions</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Ranked K-shortest paths enforcing 61 municipal turn restrictions with spare capacity validation.
            </p>
          </div>

          <div className="badge badge-green">
            <CheckCircle2 size={12} />
            <span>Turn Constraints Enforced</span>
          </div>
        </div>

        {diversionData && diversionData.alternative_paths && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {diversionData.alternative_paths.map((p, idx) => (
              <div
                key={idx}
                style={{
                  background: idx === 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${idx === 0 ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '10px' }}>Option {idx + 1}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Via: {p.path_nodes.join(' → ')}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>
                    Score: {p.recommendation_score}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px' }}>
                  <div>Distance: <b style={{ color: 'var(--text-primary)' }}>{p.total_length_km} km</b></div>
                  <div>Travel Time: <b style={{ color: 'var(--text-primary)' }}>{p.travel_time_min} min</b></div>
                  <div>Spare Capacity: <b style={{ color: 'var(--neon-cyan)' }}>{p.bottleneck_spare_capacity_vph} vph</b></div>
                  <div>Segments: <b style={{ color: 'var(--text-primary)' }}>{p.path_segments.length} links</b></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signal Plan Timing Optimization */}
      <div className="hud-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sliders size={18} color="var(--neon-blue)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Adaptive Traffic Signal Split</h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Dynamic Webster/NEMA cycle adjustments to meter upstream inflow and flush backed-up queues.
        </p>

        {signalData && signalData.has_signal && (
          <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Intersection {signalData.node_id} ({signalData.signal_id})</span>
              <span className="badge badge-cyan">{signalData.action}</span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              {signalData.rationale}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Green Ratio</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--neon-green)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {signalData.base_green_ratio} → {signalData.target_green_ratio}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Cycle Length</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--neon-blue)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {signalData.base_cycle_s}s → {signalData.target_cycle_s}s
                </div>
              </div>
            </div>

            <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--neon-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} />
              <span>Estimated Throughput Improvement: <b>+{signalData.estimated_throughput_gain_pct}%</b></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
