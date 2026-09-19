import React, { useEffect, useState } from 'react';
import { Award, CheckCircle, LineChart as ChartIcon, Gauge, RefreshCw, TrendingDown } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchForecast, fetchScorecard } from '../services/api';

export default function ForecastView({ activeSegment = 'R0062' }) {
  const [segmentId, setSegmentId] = useState(activeSegment);
  const [forecastData, setForecastData] = useState(null);
  const [scorecard, setScorecard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeSegment) setSegmentId(activeSegment);
  }, [activeSegment]);

  const loadForecast = async (seg) => {
    setLoading(true);
    try {
      const fRes = await fetchForecast(seg);
      setForecastData(fRes);
      const sRes = await fetchScorecard();
      setScorecard(sRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast(segmentId);
  }, [segmentId]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
      {/* Forecast Panel & Chart */}
      <div className="hud-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChartIcon size={18} color="var(--neon-cyan)" />
              <span>Multi-Horizon Spatial-Temporal Forecaster</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Histogram Gradient Boosting predictions targeting 15m, 30m, 45m, and 60m future states.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value.toUpperCase())}
              placeholder="e.g. R0062"
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
            <button className="btn-primary" onClick={() => loadForecast(segmentId)} disabled={loading} style={{ padding: '6px 12px' }}>
              <RefreshCw size={12} className={loading ? 'spin' : ''} />
              <span>Predict</span>
            </button>
          </div>
        </div>

        {/* 4 Horizons Cards */}
        {forecastData && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {forecastData.horizons.map((h, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--neon-cyan)' }}>+{h.horizon}</span>
                    <span className={`badge ${h.status === 'NORMAL' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '8px', padding: '1px 6px' }}>
                      {h.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {h.predicted_speed_kmh} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>km/h</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Flow: <b>{h.predicted_flow_vph}</b> vph · CI: <b>{h.predicted_congestion_index}</b>
                  </div>
                </div>
              ))}
            </div>

            {/* Recharts Area Chart */}
            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData.horizons}>
                  <defs>
                    <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="horizon" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="predicted_speed_kmh" name="Speed (km/h)" stroke="#06b6d4" strokeWidth={2} fill="url(#speedGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Validation Benchmark Scorecard */}
      <div className="hud-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Award size={18} color="var(--neon-green)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Validation Benchmark Scorecard</h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Verified on 100,000 unseen validation observations.
        </p>

        <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
          <table className="hud-table">
            <thead>
              <tr>
                <th>Target</th>
                <th>Horizon</th>
                <th>MAE</th>
                <th>RMSE</th>
              </tr>
            </thead>
            <tbody>
              {scorecard.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.target_metric || row.target}</td>
                  <td><span className="badge badge-cyan" style={{ fontSize: '9px' }}>{row.horizon}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--neon-green)' }}>{row.mae}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{row.rmse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
