import React from 'react';
import { Activity, AlertTriangle, ArrowUpRight, Gauge, Layers, ShieldCheck } from 'lucide-react';

export default function KPIRibbon({ kpis }) {
  if (!kpis) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '20px' }}>
      {/* Avg Speed */}
      <div className="hud-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>City-Wide Speed</span>
          <Gauge size={16} color="var(--neon-cyan)" />
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          {kpis.avg_speed_kmh} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>km/h</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11px', color: 'var(--neon-green)' }}>
          <ArrowUpRight size={13} />
          <span>Optimal Arterial Flow</span>
        </div>
      </div>

      {/* Network Traffic Flow */}
      <div className="hud-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Network Flow</span>
          <Activity size={16} color="var(--neon-blue)" />
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          {Number(kpis.total_flow_vph).toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>vph</span>
        </div>
        <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          Across 436 Monitored Links
        </div>
      </div>

      {/* Congestion Free Flow % */}
      <div className="hud-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Free-Flow Links</span>
          <ShieldCheck size={16} color="var(--neon-green)" />
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>
          {kpis.free_flow_pct}%
        </div>
        <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          Moderate: {kpis.moderate_pct}%
        </div>
      </div>

      {/* Active Disruption & Incidents */}
      <div className="hud-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Incidents</span>
          <AlertTriangle size={16} color="var(--neon-red)" />
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--neon-red)', fontFamily: 'var(--font-mono)' }}>
          {kpis.active_incidents_count} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>Live</span>
        </div>
        <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--neon-amber)' }}>
          Queue Spillback Tracing Active
        </div>
      </div>

      {/* Active Bottlenecks */}
      <div className="hud-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Bottlenecks</span>
          <Layers size={16} color="var(--neon-purple)" />
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--neon-purple)', fontFamily: 'var(--font-mono)' }}>
          {kpis.active_bottlenecks_count} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>Choke Points</span>
        </div>
        <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          Signal Retiming Available
        </div>
      </div>
    </div>
  );
}
