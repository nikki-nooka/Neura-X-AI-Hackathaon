import React from 'react';
import { AlertTriangle, ArrowRight, Cone, TrendingUp, Users } from 'lucide-react';

export default function CriticalAlertsCard({ onSelectAlert }) {
  const alerts = [
    {
      id: 'a1',
      code: 'R0435',
      title: 'R0435 - Severe congestion',
      desc: 'Queue length exceeded 600 m',
      time: '12 min ago',
      icon: AlertTriangle,
      color: 'var(--status-red)',
      bg: '#fef2f2',
    },
    {
      id: 'a2',
      code: 'J023',
      title: 'J023 - Minor accident',
      desc: 'One lane blocked, slow movement',
      time: '28 min ago',
      icon: AlertTriangle,
      color: 'var(--status-amber)',
      bg: '#fffbeb',
    },
    {
      id: 'a3',
      code: 'R0211',
      title: 'R0211 - Road work',
      desc: '61% capacity reduction',
      time: '1 hr ago',
      icon: Cone,
      color: 'var(--status-orange)',
      bg: '#fff7ed',
    },
    {
      id: 'a4',
      code: 'R0176',
      title: 'R0176 - High volume',
      desc: 'Unusual demand surge detected',
      time: '2 hr ago',
      icon: TrendingUp,
      color: 'var(--status-purple)',
      bg: '#f5f3ff',
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
                transition: 'background 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: '8px',
                  background: item.bg,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={15} />
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

              <div style={{ fontSize: '10px', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                {item.time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
