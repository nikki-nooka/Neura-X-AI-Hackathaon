import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Database } from 'lucide-react';

export default function WelcomeBanner({ dataTimestamp = 'Jan 19, 23:55' }) {
  const [systemTime, setSystemTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [systemDate, setSystemDate] = useState(() =>
    new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSystemTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSystemDate(now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
      paddingBottom: '4px',
    }}>
      {/* Welcome Title */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Operational Mission Control
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', marginTop: '2px' }}>
          Hyderabad Urban Traffic Command Center
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
          436 road segments • 120 junctions • 89 signals • Live multi-horizon intelligence
        </p>
      </div>

      {/* Right System Clock & Data Freshness */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Live System Time */}
        <div style={{
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--card-border, #e2e8f0)',
          borderRadius: '12px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <Clock size={16} color="var(--primary-blue, #2563eb)" />
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              System Time ({systemDate})
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              {systemTime}
            </div>
          </div>
        </div>

        {/* Data Telemetry Timestamp */}
        <div style={{
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--card-border, #e2e8f0)',
          borderRadius: '12px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <Database size={16} color="#10b981" />
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Data Freshness
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              Data as of {dataTimestamp}
            </div>
          </div>
        </div>

        {/* Charminar Illustration & Motto */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: 0.85 }}>
          {/* Stylized Charminar SVG */}
          <svg width="68" height="52" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 15 75 L 15 25 L 20 20 L 25 25 L 25 75 Z" fill="#94a3b8" />
            <path d="M 75 75 L 75 25 L 80 20 L 85 25 L 85 75 Z" fill="#94a3b8" />
            <path d="M 35 75 L 35 30 L 40 25 L 45 30 L 45 75 Z" fill="#cbd5e1" />
            <path d="M 55 75 L 55 30 L 60 25 L 65 30 L 65 75 Z" fill="#cbd5e1" />
            <path d="M 20 35 L 80 35 L 80 40 L 20 40 Z" fill="#94a3b8" />
            <path d="M 20 50 L 80 50 L 80 54 L 20 54 Z" fill="#94a3b8" />
            <path d="M 35 75 C 35 55 65 55 65 75 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="20" cy="18" r="3" fill="#64748b" />
            <circle cx="80" cy="18" r="3" fill="#64748b" />
            <circle cx="40" cy="23" r="2.5" fill="#94a3b8" />
            <circle cx="60" cy="23" r="2.5" fill="#94a3b8" />
          </svg>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '140px', lineHeight: 1.3 }}>
            "Smoother traffic.<br />A smarter Hyderabad."
          </div>
        </div>
      </div>
    </div>
  );
}
