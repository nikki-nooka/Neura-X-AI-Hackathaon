import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  BarChart2,
  Car,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function BottomSection({ onSelectCorridor }) {
  // Traffic trend hourly data matching screenshot (peaks at 78% around 2 PM)
  const trendData = [
    { time: '12 AM', today: 18, yesterday: 22 },
    { time: '2 AM', today: 14, yesterday: 18 },
    { time: '4 AM', today: 26, yesterday: 24 },
    { time: '6 AM', today: 40, yesterday: 38 },
    { time: '8 AM', today: 55, yesterday: 48 },
    { time: '10 AM', today: 64, yesterday: 58 },
    { time: '12 PM', today: 70, yesterday: 62 },
    { time: '2 PM', today: 78, yesterday: 68 }, // Peak
    { time: '4 PM', today: 72, yesterday: 65 },
    { time: '6 PM', today: 75, yesterday: 70 },
    { time: '8 PM', today: 60, yesterday: 56 },
    { time: '10 PM', today: 42, yesterday: 40 },
  ];

  const topCorridors = [
    { rank: 1, code: 'R0435', name: 'R0435 - ORR (East)', congestion: '87%', speed: '18 km/h' },
    { rank: 2, code: 'R0211', name: 'R0211 - Hafeezpet', congestion: '82%', speed: '22 km/h' },
    { rank: 3, code: 'R0299', name: 'R0299 - Hitech City', congestion: '76%', speed: '24 km/h' },
    { rank: 4, code: 'R0176', name: 'R0176 - Miyapur', congestion: '71%', speed: '26 km/h' },
    { rank: 5, code: 'R0354', name: 'R0354 - LB Nagar', congestion: '68%', speed: '28 km/h' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr 1fr',
      gap: '16px',
    }}>
      {/* 1. Traffic Trend (Citywide) */}
      <div className="clean-card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
            Traffic Trend (Citywide)
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 12, height: 2, background: 'var(--primary-blue)' }} /> Today
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 12, height: 2, borderTop: '2px dashed #93c5fd' }} /> Yesterday
              </span>
            </div>

            <div className="header-pill" style={{ padding: '3px 8px', fontSize: '10px' }}>
              <span>Last 24 Hours</span>
              <ChevronDown size={11} color="var(--text-muted)" />
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div style={{ height: '170px', width: '100%', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="trendToday" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="yesterday" stroke="#93c5fd" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
              <Area type="monotone" dataKey="today" stroke="#2563eb" strokeWidth={2} fill="url(#trendToday)" />
            </AreaChart>
          </ResponsiveContainer>

          {/* 78% Peak Bubble Marker */}
          <div style={{
            position: 'absolute',
            top: '18px',
            left: '58%',
            transform: 'translateX(-50%)',
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '9px',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
          }}>
            78%
          </div>
        </div>
      </div>

      {/* 2. Top Congested Corridors */}
      <div className="clean-card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
            Top Congested Corridors
          </h3>

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
              gap: '2px',
            }}
          >
            <span>View All</span>
            <ArrowRight size={11} />
          </button>
        </div>

        {/* Table */}
        <table className="styled-table" style={{ fontSize: '12px' }}>
          <thead>
            <tr>
              <th style={{ width: '24px' }}>#</th>
              <th>Road / Corridor</th>
              <th>Congestion</th>
              <th>Avg. Speed</th>
            </tr>
          </thead>
          <tbody>
            {topCorridors.map((c) => (
              <tr
                key={c.code}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectCorridor && onSelectCorridor(c.code)}
              >
                <td style={{ fontWeight: 700, color: 'var(--status-red)' }}>{c.rank}</td>
                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</td>
                <td style={{ fontWeight: 700, color: 'var(--status-red)' }}>{c.congestion}</td>
                <td style={{ color: 'var(--status-red)', fontWeight: 600 }}>{c.speed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. City in Numbers (Today) */}
      <div className="clean-card">
        {/* Header */}
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
          City in Numbers (Today)
        </h3>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {/* Card 1: Vehicles */}
          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#eff6ff', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car size={14} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--status-green)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                <ArrowUp size={11} /> 8%
              </div>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              1.24M
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Vehicles (est.)</div>
          </div>

          {/* Card 2: Average Delay */}
          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#ecfdf5', color: 'var(--status-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={14} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--status-red)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                <ArrowUp size={11} /> 14%
              </div>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              8.9 <span style={{ fontSize: '10px', fontWeight: 500 }}>min</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Average Delay</div>
          </div>

          {/* Card 3: Congestion Index */}
          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#ecfeff', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={14} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--status-red)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                <ArrowUp size={11} /> 11%
              </div>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              64%
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Congestion Index</div>
          </div>

          {/* Card 4: Incidents */}
          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#fef2f2', color: 'var(--status-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={14} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--status-red)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                <ArrowUp size={11} /> 15%
              </div>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              23
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Incidents</div>
          </div>
        </div>
      </div>
    </div>
  );
}
