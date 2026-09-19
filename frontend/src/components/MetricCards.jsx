import React from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Car,
  ChevronRight,
  Clock,
  Cone,
  Gauge,
} from 'lucide-react';

export default function MetricCards({ kpis, onNavigate }) {
  // Semi-circle gauge arc for Network Health (68/100)
  const score = kpis ? Math.round(100 - (kpis.gridlock_pct * 10 + kpis.heavy_pct * 4)) : 68;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '14px',
      }}
    >
      {/* 1. Network Health */}
      <div
        className="kpi-card"
        onClick={() => onNavigate && onNavigate('resilience')}
        style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
        title="Click to inspect Network Resilience & Critical Corridors"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Network Health</span>
          <ChevronRight size={14} color="var(--primary-blue)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
          {/* Semi-Circle SVG Gauge */}
          <div style={{ width: 54, height: 32, position: 'relative' }}>
            <svg width="54" height="32" viewBox="0 0 54 32">
              <path
                d="M 5 28 A 22 22 0 0 1 49 28"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 5 28 A 22 22 0 0 1 49 28"
                fill="none"
                stroke="#10b981"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="69"
                strokeDashoffset={69 - (score / 100) * 69}
              />
            </svg>
          </div>

          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {score}<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>/100</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--status-green)', fontWeight: 600 }}>
          <ArrowUp size={12} />
          <span>6% from yesterday</span>
        </div>
      </div>

      {/* 2. Average Speed */}
      <div
        className="kpi-card"
        onClick={() => onNavigate && onNavigate('forecast')}
        style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
        title="Click to view Multi-Horizon Speed Predictor"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Average Speed</span>
          <ChevronRight size={14} color="var(--primary-blue)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
          <div className="kpi-icon-circle" style={{ background: '#eff6ff', color: 'var(--primary-blue)' }}>
            <Gauge size={18} />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {kpis ? kpis.avg_speed_kmh : '28.4'} <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>km/h</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--status-red)', fontWeight: 600 }}>
          <ArrowDown size={12} />
          <span>8%</span>
        </div>
      </div>

      {/* 3. Active Incidents */}
      <div
        className="kpi-card"
        onClick={() => onNavigate && onNavigate('spillback')}
        style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
        title="Click to analyze Incident Spillback & Shockwaves"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Active Incidents</span>
          <ChevronRight size={14} color="var(--status-red)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
          <div className="kpi-icon-circle" style={{ background: '#fef2f2', color: 'var(--status-red)' }}>
            <AlertTriangle size={18} />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {kpis ? kpis.active_incidents_count : 3}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--status-red)', fontWeight: 600 }}>
          <ArrowUp size={12} />
          <span>1</span>
        </div>
      </div>

      {/* 4. Congested Segments */}
      <div
        className="kpi-card"
        onClick={() => onNavigate && onNavigate('roads')}
        style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
        title="Click to filter 436 Roads by Congestion Level"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Congested Segments</span>
          <ChevronRight size={14} color="var(--status-red)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
          <div className="kpi-icon-circle" style={{ background: '#fef2f2', color: 'var(--status-red)' }}>
            <Car size={18} />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {kpis ? kpis.active_bottlenecks_count || 34 : 34}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--status-red)', fontWeight: 600 }}>
          <ArrowUp size={12} />
          <span>12%</span>
        </div>
      </div>

      {/* 5. Average Delay */}
      <div
        className="kpi-card"
        onClick={() => onNavigate && onNavigate('response')}
        style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
        title="Click to simulate Diversion Rerouting to cut Delay"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Average Delay</span>
          <ChevronRight size={14} color="var(--primary-blue)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
          <div className="kpi-icon-circle" style={{ background: '#eff6ff', color: 'var(--primary-blue)' }}>
            <Clock size={18} />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            8.7 <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>min</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--status-red)', fontWeight: 600 }}>
          <ArrowUp size={12} />
          <span>18%</span>
        </div>
      </div>

      {/* 6. Roadworks */}
      <div
        className="kpi-card"
        onClick={() => onNavigate && onNavigate('infrastructure')}
        style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
        title="Click to view Infrastructure Upgrade Candidates & Works"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Roadworks</span>
          <ChevronRight size={14} color="var(--status-orange)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
          <div className="kpi-icon-circle" style={{ background: '#fff7ed', color: 'var(--status-orange)' }}>
            <Cone size={18} />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            5
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
          <ArrowRight size={12} />
          <span>0</span>
        </div>
      </div>
    </div>
  );
}
