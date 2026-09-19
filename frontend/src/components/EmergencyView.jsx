import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Clock, HeartPulse, Radio, ShieldAlert, Zap } from 'lucide-react';
import { dispatchGreenWave } from '../services/api';

export default function EmergencyView({ onEmergencyDispatched }) {
  const [origin, setOrigin] = useState('N001');
  const [dest, setDest] = useState('N085');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDispatch = async () => {
    setLoading(true);
    try {
      const res = await dispatchGreenWave(origin, dest);
      setResult(res);
      if (onEmergencyDispatched && res.corridor_segments) {
        onEmergencyDispatched(res.corridor_segments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '20px' }}>
      {/* Dispatch Controls */}
      <div className="hud-card" style={{ borderTop: '4px solid var(--neon-red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <HeartPulse size={20} color="var(--neon-red)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Ambulance Green Wave Preemption</h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Real-time emergency vehicle corridor clearance. Overrides all intermediate signals along the fastest hospital route.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Incident Origin Junction
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              placeholder="e.g. N001"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Hospital Destination
            </label>
            <input
              type="text"
              value={dest}
              onChange={(e) => setDest(e.target.value.toUpperCase())}
              placeholder="e.g. N085"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>
        </div>

        <button className="btn-emergency" onClick={handleDispatch} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }}>
          <Radio size={16} />
          <span>{loading ? 'ENGAGING SIGNAL PREEMPTION...' : 'DISPATCH EMERGENCY GREEN WAVE'}</span>
        </button>

        <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={14} color="var(--neon-amber)" />
          <span>Preemption preempts opposing phases and locks target approaches to 100% green.</span>
        </div>
      </div>

      {/* Dispatch Telemetry Result */}
      <div className="hud-card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Emergency Dispatch Telemetry
        </h3>

        {result ? (
          <div>
            {/* ETA Comparison Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Standard Traffic ETA</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--neon-red)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {result.normal_travel_time_min} <span style={{ fontSize: '11px' }}>min</span>
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Green Wave ETA</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--neon-green)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {result.green_wave_eta_min} <span style={{ fontSize: '11px' }}>min</span>
                </div>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Critical Time Saved</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--neon-cyan)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  -{result.time_saved_min} <span style={{ fontSize: '11px' }}>min</span>
                </div>
              </div>
            </div>

            {/* Path Breadcrumbs */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Corridor Routing Nodes ({result.path_nodes.length} Intersections)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {result.path_nodes.join(' → ')}
              </div>
            </div>

            {/* Preempted Signals */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Preempted Signals ({result.signals_preempted_count} Controllers)</span>
                <span className="badge badge-green" style={{ fontSize: '9px' }}>OVERRIDE ACTIVE</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.preempted_signals.map((sig, idx) => (
                  <div key={idx} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '6px 10px', fontSize: '11px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>{sig.node_id}</span>: Force Green (90s)
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            Select an origin and destination hospital junction, then click <b>Dispatch Emergency Green Wave</b>.
          </div>
        )}
      </div>
    </div>
  );
}
