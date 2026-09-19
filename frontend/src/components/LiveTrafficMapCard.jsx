import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Cone,
  Crosshair,
  Maximize2,
  Minus,
  Plus,
  Radio,
  X,
} from 'lucide-react';

export default function LiveTrafficMapCard({
  topology,
  selectedSegment = 'R0435',
  onSelectSegment,
  onOpenDetails,
  onSimulateResponse,
}) {
  const [activeFilter, setActiveFilter] = useState('live'); // 'live', 'forecast', 'incidents', 'bottlenecks', 'resilience'
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Hyderabad landmark labels
  const landmarks = [
    { name: 'Hussain Sagar', x: 440, y: 280, isLake: true },
    { name: 'Hitech City', x: 285, y: 255 },
    { name: 'Madhapur', x: 270, y: 285 },
    { name: 'Gachibowli', x: 235, y: 345 },
    { name: 'Kukatpally', x: 335, y: 175 },
    { name: 'Miyapur', x: 260, y: 145 },
    { name: 'Balanagar', x: 220, y: 265 },
    { name: 'Begumpet', x: 405, y: 225 },
    { name: 'Secunderabad', x: 470, y: 225 },
    { name: 'Hyderabad', x: 410, y: 315, isCenter: true },
    { name: 'Mehdipatnam', x: 340, y: 375 },
    { name: 'Rajendranagar', x: 260, y: 445 },
    { name: 'Chandrayangutta', x: 380, y: 445 },
    { name: 'Uppal', x: 555, y: 295 },
    { name: 'LB Nagar', x: 525, y: 395 },
    { name: 'Vanasthalipuram', x: 490, y: 455 },
  ];

  // Incident markers
  const incidentMarkers = [
    { id: 'inc1', x: 315, y: 345, type: 'incident', code: 'R0435' },
    { id: 'inc2', x: 380, y: 260, type: 'incident', code: 'J023' },
    { id: 'inc3', x: 440, y: 265, type: 'incident', code: 'R0176' },
    { id: 'inc4', x: 485, y: 300, type: 'roadwork', code: 'R0211' },
    { id: 'inc5', x: 445, y: 405, type: 'incident', code: 'R0354' },
  ];

  // Stylized road corridors across Hyderabad
  const roadCorridors = [
    // Outer Ring Road (ORR) Loop
    { d: 'M 180 200 C 170 120 300 80 460 100 C 580 120 630 250 620 360 C 600 480 460 520 320 500 C 180 480 170 320 180 200 Z', color: '#10b981', w: 3 },
    // Inner Ring Road Loop
    { d: 'M 290 240 C 310 180 430 180 480 220 C 530 260 510 370 470 410 C 400 450 330 420 300 370 C 270 320 280 270 290 240 Z', color: '#f59e0b', w: 2.8 },
    // Major arterials
    { d: 'M 180 200 L 285 255 L 405 225 L 470 225 L 555 295 L 620 360', color: '#ef4444', w: 3.5, id: 'R0435' },
    { d: 'M 260 145 L 335 175 L 405 225 L 410 315 L 380 445', color: '#10b981', w: 2.5 },
    { d: 'M 235 345 L 340 375 L 410 315 L 525 395', color: '#f97316', w: 3 },
    { d: 'M 285 255 L 270 285 L 235 345 L 260 445 L 320 500', color: '#10b981', w: 2.5 },
    { d: 'M 470 225 L 525 395 L 490 455', color: '#ef4444', w: 3 },
    { d: 'M 335 175 L 220 265 L 270 285 L 340 375', color: '#10b981', w: 2 },
    { d: 'M 405 225 L 440 280 L 410 315', color: '#10b981', w: 2.5 },
    { d: 'M 410 315 L 485 300 L 555 295', color: '#f59e0b', w: 2.5 },
  ];

  return (
    <div className="clean-card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      {/* Map Header Bar */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--card-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
            Live Traffic Network
          </h2>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`pill-tab-btn ${activeFilter === 'live' ? 'active' : ''}`}
              onClick={() => setActiveFilter('live')}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: activeFilter === 'live' ? '#ffffff' : '#10b981' }} />
              <span>Live Traffic</span>
            </button>
            <button
              className={`pill-tab-btn ${activeFilter === 'forecast' ? 'active' : ''}`}
              onClick={() => setActiveFilter('forecast')}
            >
              Forecast
            </button>
            <button
              className={`pill-tab-btn ${activeFilter === 'incidents' ? 'active' : ''}`}
              onClick={() => setActiveFilter('incidents')}
            >
              Incidents
            </button>
            <button
              className={`pill-tab-btn ${activeFilter === 'bottlenecks' ? 'active' : ''}`}
              onClick={() => setActiveFilter('bottlenecks')}
            >
              Bottlenecks
            </button>
            <button
              className={`pill-tab-btn ${activeFilter === 'resilience' ? 'active' : ''}`}
              onClick={() => setActiveFilter('resilience')}
            >
              Resilience
            </button>
          </div>
        </div>

        {/* Right Layer Dropdown & Expand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="header-pill" style={{ cursor: 'pointer', padding: '5px 12px', fontSize: '11px' }}>
            <span>All Layers</span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>
          <div className="header-icon-btn" style={{ width: 32, height: 32 }}>
            <Maximize2 size={14} />
          </div>
        </div>
      </div>

      {/* Map Canvas Box */}
      <div style={{
        position: 'relative',
        height: '520px',
        background: '#0a101f',
        overflow: 'hidden',
      }}>
        <svg width="100%" height="100%" viewBox="0 0 740 520" style={{ display: 'block' }}>
          {/* Subtle Background Water Bodies (e.g. Hussain Sagar) */}
          <path
            d="M 425 270 C 445 260 460 275 455 295 C 440 310 420 300 415 285 Z"
            fill="#1e3a8a"
            opacity="0.4"
          />

          {/* Road Corridors */}
          {roadCorridors.map((rc, idx) => (
            <path
              key={idx}
              d={rc.d}
              fill="none"
              stroke={rc.color}
              strokeWidth={rc.w}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.88}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectSegment && onSelectSegment(rc.id || 'R0435')}
            />
          ))}

          {/* Incident Alert Markers */}
          {incidentMarkers.map((inc) => (
            <g
              key={inc.id}
              transform={`translate(${inc.x - 12}, ${inc.y - 12})`}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (onSelectSegment) onSelectSegment(inc.code);
                setInspectorOpen(true);
              }}
            >
              {/* Outer pulsing circle */}
              <circle cx="12" cy="12" r="14" fill={inc.type === 'incident' ? 'rgba(239,68,68,0.25)' : 'rgba(249,115,22,0.25)'} />
              <circle cx="12" cy="12" r="10" fill={inc.type === 'incident' ? '#ef4444' : '#f97316'} />
              {inc.type === 'incident' ? (
                <text x="12" y="16" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">!</text>
              ) : (
                <text x="12" y="15" textAnchor="middle" fill="#ffffff" fontSize="9">▲</text>
              )}
            </g>
          ))}

          {/* City / Landmark Name Labels */}
          {landmarks.map((lm, idx) => (
            <g key={idx} transform={`translate(${lm.x}, ${lm.y})`}>
              {lm.isLake ? (
                <text textAnchor="middle" fill="#38bdf8" fontSize="10" fontStyle="italic" opacity="0.8">
                  {lm.name}
                </text>
              ) : lm.isCenter ? (
                <text textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="800" letterSpacing="0.5px">
                  {lm.name}
                </text>
              ) : (
                <text textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="500">
                  {lm.name}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Floating Zoom Controls (+ / - / Crosshair) */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 15,
        }}>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.8))}
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Minus size={14} />
          </button>
          <button
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Crosshair size={14} />
          </button>
        </div>

        {/* Floating Bottom Legend */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 70,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontSize: '11px',
          color: '#cbd5e1',
          zIndex: 15,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} /> Normal
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b' }} /> Moderate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f97316' }} /> Heavy
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} /> Severe
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <AlertTriangle size={12} color="#ef4444" /> Incident
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Cone size={12} color="#f97316" /> Road Work
          </span>
        </div>

        {/* Floating Segment Inspector Card (R0435) */}
        {inspectorOpen && (
          <div className="map-inspector-card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '16px', fontFamily: 'var(--font-mono)' }}>R0435</span>
                  <span style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                  }}>
                    Severe Congestion
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Outer Ring Road (East)
                </div>
              </div>

              <button
                onClick={() => setInspectorOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Road Camera Thumbnail */}
            <div style={{
              width: '100%',
              height: '80px',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '12px',
              background: '#1e293b',
              position: 'relative',
            }}>
              {/* Traffic camera photo representation */}
              <svg width="100%" height="80" viewBox="0 0 260 80">
                <rect width="260" height="80" fill="#1e293b" />
                <path d="M 0 80 L 80 45 L 180 45 L 260 80 Z" fill="#334155" />
                <line x1="130" y1="45" x2="130" y2="80" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,6" />
                <rect x="70" y="55" width="22" height="14" rx="2" fill="#ef4444" />
                <rect x="110" y="52" width="26" height="15" rx="3" fill="#e2e8f0" />
                <rect x="150" y="58" width="24" height="14" rx="2" fill="#3b82f6" />
                <rect x="190" y="54" width="28" height="16" rx="3" fill="#64748b" />
              </svg>
              <span style={{
                position: 'absolute',
                top: 6,
                left: 6,
                background: 'rgba(0,0,0,0.6)',
                color: '#ffffff',
                fontSize: '9px',
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: 600,
              }}>
                CAM 04-E
              </span>
            </div>

            {/* Metrics List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Current Speed</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>18 km/h</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Free-flow Speed</span>
                <span style={{ fontWeight: 600 }}>42 km/h</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Traffic Volume</span>
                <span style={{ fontWeight: 600 }}>1,760 veh/hr</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Capacity</span>
                <span style={{ fontWeight: 600 }}>2,070 veh/hr</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Queue Length</span>
                <span style={{ fontWeight: 600 }}>640 m</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Congestion</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>87%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Trend</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>↑ Increasing</span>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="btn-blue"
                onClick={onOpenDetails}
                style={{ width: '100%', justifyContent: 'center', padding: '8px 0', fontSize: '12px' }}
              >
                <span>View Details</span>
                <ArrowRight size={13} />
              </button>
              <button
                onClick={onSimulateResponse}
                style={{
                  width: '100%',
                  padding: '8px 0',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                Simulate Response
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
