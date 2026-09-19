import React from 'react';
import { AlertTriangle, ArrowRight, Cone, TrendingUp, Users } from 'lucide-react';

export default function CriticalAlertsCard({ onSelectAlert, onViewAll }) {
  const alerts = [
    {
      id: 'a1',
      code: 'R0435',
      title: 'R0435 - Severe Congestion',
      desc: 'RandomForest: Stalled vehicle detected · Queue > 600m',
      time: '12 min ago',
      icon: AlertTriangle,
      color: 'var(--status-red)',
      bg: '#fef2f2',
      speed: '18 km/h',
    },
    {
      id: 'a2',
      code: 'R0376',
      title: 'R0376 - Critical Demand Surge',
      desc: 'Volume approaching capacity · 72% congestion index',
      time: '24 min ago',
      icon: TrendingUp,
      color: 'var(--status-red)',
      bg: '#fef2f2',
      speed: '21 km/h',
    },
    {
      id: 'a3',
      code: 'R0211',
      title: 'R0211 - Road Work Resurfacing',
      desc: '61% capacity reduction · Single lane open',
      time: '1 hr ago',
      icon: Cone,
      color: 'var(--status-orange)',
      bg: '#fff7ed',
      speed: '22 km/h',
    },
    {
      id: 'a4',
      code: 'R0176',
      title: 'R0176 - High Volume Arterial',
      desc: 'Upstream shockwave forming · 15m delay expected',
      time: '2 hr ago',
      icon: AlertTriangle,
      color: 'var(--status-amber)',
      bg: '#fffbeb',
      speed: '26 km/h',
    },
  ];

  return (
    <div className="clean-card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} color="var(--status-red)" />
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
            Critical Alerts
          </h3>
        </div>

        <button
          onClick={onViewAll}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--primary-blue)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
          title="View all road segments in 436 Roads Intelligence"
        >
          <span>View All</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Alert Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {alerts.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onSelectAlert && onSelectAlert(item.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#f1f5f9';
              }}
              title={`Click to inspect corridor ${item.code}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '8px',
                    background: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {item.desc}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 500 }}>
                  {item.time}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: item.color }}>
                  {item.speed}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
