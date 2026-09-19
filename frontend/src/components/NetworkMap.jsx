import React, { useMemo, useState } from 'react';
import { Compass, Info, Maximize2, RotateCcw, Zap } from 'lucide-react';

export default function NetworkMap({
  topology,
  selectedSegment,
  onSelectSegment,
  highlightSegments = [],
  emergencySegments = [],
}) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Compute bounding box and projection
  const { nodePosMap, projectedEdges } = useMemo(() => {
    if (!topology || !topology.nodes || !topology.edges) {
      return { nodePosMap: {}, projectedEdges: [] };
    }

    const lats = topology.nodes.map((n) => n.lat);
    const lons = topology.nodes.map((n) => n.lon);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const width = 860;
    const height = 520;
    const padding = 36;

    const nodePos = {};
    topology.nodes.forEach((node) => {
      // Map lon -> X, lat -> Y (invert Y since lat increases upwards)
      const x = padding + ((node.lon - minLon) / (maxLon - minLon || 1)) * (width - 2 * padding);
      const y = height - (padding + ((node.lat - minLat) / (maxLat - minLat || 1)) * (height - 2 * padding));
      nodePos[node.id] = { x, y, ...node };
    });

    const edges = topology.edges.map((edge) => {
      const u = nodePos[edge.source];
      const v = nodePos[edge.target];
      return {
        ...edge,
        x1: u ? u.x : 0,
        y1: u ? u.y : 0,
        x2: v ? v.x : 0,
        y2: v ? v.y : 0,
      };
    });

    return { nodePosMap: nodePos, projectedEdges: edges };
  }, [topology]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getEdgeColor = (edge) => {
    if (emergencySegments.includes(edge.segment_id)) return '#38bdf8'; // Emergency Cyan
    if (highlightSegments.includes(edge.segment_id)) return '#f97316'; // Spillback Orange
    if (selectedSegment === edge.segment_id) return '#ec4899'; // Selected Pink

    switch (edge.congestion_level) {
      case 'GRIDLOCK':
        return '#c084fc';
      case 'HEAVY':
        return '#ef4444';
      case 'MODERATE':
        return '#f59e0b';
      case 'FREE_FLOW':
      default:
        return '#10b981';
    }
  };

  const getEdgeWidth = (edge) => {
    if (emergencySegments.includes(edge.segment_id)) return 4.5;
    if (highlightSegments.includes(edge.segment_id)) return 4;
    if (selectedSegment === edge.segment_id) return 3.5;
    return edge.road_class === 'arterial' ? 2.2 : 1.4;
  };

  return (
    <div className="hud-card" style={{ position: 'relative', overflow: 'hidden', height: '580px', padding: 0 }}>
      {/* Top Overlay Controls */}
      <div style={{ position: 'absolute', top: 16, left: 20, zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={16} color="var(--neon-cyan)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Hyderabad Metropolitan Network (120 Nodes · 436 Links)</span>
        </div>

        {emergencySegments.length > 0 && (
          <div className="badge badge-cyan" style={{ animation: 'pulse-red 1.5s infinite' }}>
            <Zap size={13} />
            <span>Emergency Green Wave Active ({emergencySegments.length} Segments)</span>
          </div>
        )}
      </div>

      {/* Floating Zoom Controls */}
      <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="btn-secondary" onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} style={{ padding: '8px 12px' }}>+</button>
        <button className="btn-secondary" onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))} style={{ padding: '8px 12px' }}>-</button>
        <button className="btn-secondary" onClick={resetView} title="Reset View" style={{ padding: '8px 12px' }}>
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Interactive Legend */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '16px', fontSize: '11px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Free Flow (&gt;80%)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Moderate (50-80%)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Heavy (30-50%)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} /> Gridlock (&lt;30%)
        </span>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        width="100%"
        height="100%"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', background: '#090d16' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Grid Background Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#grid)" />

          {/* Road Links */}
          {projectedEdges.map((edge) => {
            const color = getEdgeColor(edge);
            const width = getEdgeWidth(edge);
            const isSelected = selectedSegment === edge.segment_id;
            const isEmergency = emergencySegments.includes(edge.segment_id);

            return (
              <line
                key={edge.segment_id}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={color}
                strokeWidth={width}
                strokeLinecap="round"
                strokeDasharray={isEmergency ? '6,4' : 'none'}
                opacity={selectedSegment && !isSelected && !isEmergency && !highlightSegments.includes(edge.segment_id) ? 0.35 : 0.85}
                style={{ cursor: 'pointer', transition: 'stroke 0.2s, stroke-width 0.2s' }}
                onMouseEnter={() => setHoveredItem(edge)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => onSelectSegment && onSelectSegment(edge.segment_id)}
              />
            );
          })}

          {/* Intersection Nodes */}
          {Object.values(nodePosMap).map((node) => (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={node.is_signalized ? 4.5 : 3.0}
              fill={node.is_signalized ? '#38bdf8' : '#64748b'}
              stroke="#0f172a"
              strokeWidth={1.5}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredItem(node)}
              onMouseLeave={() => setHoveredItem(null)}
            />
          ))}
        </g>
      </svg>

      {/* Hover Info Tooltip */}
      {hoveredItem && (
        <div style={{ position: 'absolute', top: 70, right: 20, zIndex: 20, background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--border-glow)', borderRadius: '10px', padding: '12px 16px', minWidth: '220px', pointerEvents: 'none' }}>
          {hoveredItem.segment_id ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>{hoveredItem.segment_id}</span>
                <span className={`badge ${hoveredItem.congestion_level === 'FREE_FLOW' ? 'badge-green' : hoveredItem.congestion_level === 'MODERATE' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '9px' }}>
                  {hoveredItem.congestion_level}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <span>Speed: <b style={{ color: 'var(--text-primary)' }}>{hoveredItem.speed_kmh} km/h</b></span>
                <span>Flow: <b style={{ color: 'var(--text-primary)' }}>{hoveredItem.flow_vph} vph</b></span>
                <span>Class: <b style={{ color: 'var(--text-primary)' }}>{hoveredItem.road_class}</b></span>
                <span>Length: <b style={{ color: 'var(--text-primary)' }}>{hoveredItem.length_km} km</b></span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)' }}>
                Click link to inspect detours & spillback
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Junction {hoveredItem.id}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Signalized: <b style={{ color: hoveredItem.is_signalized ? 'var(--neon-cyan)' : 'var(--text-muted)' }}>{hoveredItem.is_signalized ? 'YES (NEMA 89)' : 'Unsignalized'}</b>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
