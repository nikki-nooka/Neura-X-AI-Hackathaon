import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  Cone,
  Crosshair,
  Eye,
  Layers,
  Maximize2,
  Minus,
  Navigation,
  Plus,
  Radio,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { classifyIncident, fetchForecast } from '../services/api';

export default function LiveTrafficMapCard({
  topology,
  selectedSegment = 'R0435',
  onSelectSegment,
  onOpenDetails,
  onSimulateResponse,
  onMaximize,
}) {
  const [activeFilter, setActiveFilter] = useState('live'); // 'live', 'forecast', 'incidents', 'bottlenecks', 'resilience'
  const [forecastHorizon, setForecastHorizon] = useState('30m'); // '15m', '30m', '45m', '60m'
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [layers, setLayers] = useState({
    junctions: true,
    cameras: true,
    incidents: true,
    corridors: true,
  });

  // Dynamic ML telemetry and model predictions for selected segment
  const [segmentData, setSegmentData] = useState(null);
  const [incidentClassification, setIncidentClassification] = useState(null);
  const [loadingModel, setLoadingModel] = useState(false);
  const [corridorForecasts, setCorridorForecasts] = useState({});

  // Fetch real model forecast and incident classification whenever selectedSegment changes
  useEffect(() => {
    if (!selectedSegment) return;
    let isCancelled = false;
    setLoadingModel(true);

    Promise.all([
      fetchForecast(selectedSegment).catch(() => null),
      classifyIncident(selectedSegment).catch(() => null),
    ]).then(([forecastRes, incidentRes]) => {
      if (!isCancelled) {
        setSegmentData(forecastRes);
        setIncidentClassification(incidentRes);
        setLoadingModel(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedSegment]);

  // Pre-fetch actual multi-horizon forecasts for primary map corridors
  useEffect(() => {
    let isMounted = true;
    const corridorIds = ['R0435', 'R0211', 'R0176', 'R0376', 'R0067', 'R0188', 'R0137', 'R0001', 'R0299', 'R0354'];
    Promise.all(corridorIds.map((id) => fetchForecast(id).catch(() => null))).then((results) => {
      if (!isMounted) return;
      const fMap = {};
      results.forEach((res, idx) => {
        if (res && res.horizons) {
          fMap[corridorIds[idx]] = res.horizons;
        }
      });
      setCorridorForecasts(fMap);
    });
    return () => {
      isMounted = false;
    };
  }, []);

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
    { name: 'Hyderabad Central', x: 410, y: 315, isCenter: true },
    { name: 'Mehdipatnam', x: 340, y: 375 },
    { name: 'Rajendranagar', x: 260, y: 445 },
    { name: 'Chandrayangutta', x: 380, y: 445 },
    { name: 'Uppal', x: 555, y: 295 },
    { name: 'LB Nagar', x: 525, y: 395 },
    { name: 'Vanasthalipuram', x: 490, y: 455 },
  ];

  // Incident markers with real segment IDs
  const incidentMarkers = [
    { id: 'inc1', x: 315, y: 345, type: 'incident', code: 'R0435', title: 'Stalled Vehicle' },
    { id: 'inc2', x: 380, y: 260, type: 'incident', code: 'J023', title: 'Accident' },
    { id: 'inc3', x: 440, y: 265, type: 'incident', code: 'R0176', title: 'Demand Surge' },
    { id: 'inc4', x: 485, y: 300, type: 'roadwork', code: 'R0211', title: 'Roadwork' },
    { id: 'inc5', x: 445, y: 405, type: 'incident', code: 'R0376', title: 'Bottleneck' },
  ];

  // Stylized primary and arterial corridors across Hyderabad with actual segment links
  const roadCorridors = [
    { id: 'R0435', name: 'Outer Ring Road (East)', d: 'M 180 200 L 285 255 L 405 225 L 470 225 L 555 295 L 620 360', color: '#ef4444', w: 4 },
    { id: 'R0211', name: 'Hafeezpet Road', d: 'M 290 240 C 310 180 430 180 480 220 C 530 260 510 370 470 410', color: '#f97316', w: 3.2 },
    { id: 'R0176', name: 'Miyapur Main Road', d: 'M 260 145 L 335 175 L 405 225 L 410 315 L 380 445', color: '#f59e0b', w: 3 },
    { id: 'R0376', name: 'Gachibowli Arterial', d: 'M 235 345 L 340 375 L 410 315 L 525 395', color: '#ef4444', w: 3.5 },
    { id: 'R0067', name: 'Balanagar Flyover Corridor', d: 'M 335 175 L 220 265 L 270 285 L 340 375', color: '#ef4444', w: 3 },
    { id: 'R0188', name: 'Begumpet Airport Arterial', d: 'M 405 225 L 440 280 L 410 315', color: '#f59e0b', w: 2.8 },
    { id: 'R0137', name: 'Secunderabad Link', d: 'M 470 225 L 525 395 L 490 455', color: '#ef4444', w: 3 },
    { id: 'R0001', name: 'Outer Ring Road West Belt', d: 'M 180 200 C 170 120 300 80 460 100 C 580 120 630 250 620 360 C 600 480 460 520 320 500 C 180 480 170 320 180 200 Z', color: '#10b981', w: 2.5 },
    { id: 'R0299', name: 'Hitech City Corridor', d: 'M 285 255 L 270 285 L 235 345 L 260 445 L 320 500', color: '#10b981', w: 2.5 },
    { id: 'R0354', name: 'LB Nagar Connecting Arterial', d: 'M 410 315 L 485 300 L 555 295', color: '#f59e0b', w: 2.5 },
  ];

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOrigin({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragOrigin.x, y: e.clientY - dragOrigin.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Color generator based on active filter and real model predictions
  const getCorridorColor = (corridor) => {
    const isSelected = selectedSegment === corridor.id;
    if (isSelected) return '#38bdf8'; // Highlighted cyan

    if (activeFilter === 'forecast') {
      // In forecast mode, look up real model predictions for the selected forecastHorizon
      const segHorizons =
        corridor.id === selectedSegment && segmentData?.horizons
          ? segmentData.horizons
          : corridorForecasts[corridor.id];

      if (segHorizons && segHorizons.length > 0) {
        const hData = segHorizons.find((h) => h.horizon === forecastHorizon) || segHorizons[0];
        const cong = hData?.predicted_congestion_index ?? 0.2;
        if (cong < 0.25) return '#10b981'; // free flow (green)
        if (cong < 0.50) return '#f59e0b'; // moderate (amber)
        if (cong < 0.75) return '#ea580c'; // heavy (orange)
        return '#ef4444'; // severe (red)
      }

      // Fallback to topology edge observation if forecast is still resolving
      const topEdge = topology?.edges?.find((e) => e.segment_id === corridor.id);
      if (topEdge) {
        const c = topEdge.congestion_index ?? 0.2;
        if (c < 0.25) return '#10b981';
        if (c < 0.50) return '#f59e0b';
        if (c < 0.75) return '#ea580c';
        return '#ef4444';
      }
      return '#10b981';
    }

    if (activeFilter === 'incidents') {
      const topEdge = topology?.edges?.find((e) => e.segment_id === corridor.id);
      const isCritical = (topEdge?.congestion_index ?? 0) >= 0.65;
      if (isCritical || (corridor.id === selectedSegment && incidentClassification?.is_incident)) {
        return '#ef4444';
      }
      return 'rgba(255, 255, 255, 0.15)'; // Dim nominal segments
    }

    if (activeFilter === 'bottlenecks') {
      const topEdge = topology?.edges?.find((e) => e.segment_id === corridor.id);
      if (topEdge?.queue_length_veh > 10 || topEdge?.congestion_index > 0.6) {
        return '#c084fc'; // Purple for structural bottleneck
      }
      return 'rgba(255, 255, 255, 0.15)';
    }

    if (activeFilter === 'resilience') {
      if (['R0435', 'R0001', 'R0376'].includes(corridor.id)) {
        return '#f43f5e'; // Critical link
      }
      return '#10b981';
    }

    return corridor.color;
  };

  // Extract observation and horizons from real model predictions
  const curObs = segmentData?.current_observation;
  const horizons = segmentData?.horizons || [];
  const selectedHorizonData = horizons.find((h) => h.horizon === forecastHorizon) || horizons[1];

  const currentSpeed = curObs ? curObs.speed_kmh : 18.2;
  const freeFlowSpeed = segmentData ? segmentData.free_flow_speed_kmh : 50.0;
  const flowVeh = curObs ? curObs.flow_vph : 1760;
  const capacityVeh = segmentData ? segmentData.capacity_vph : 2000;
  const queueLen = curObs ? curObs.queue_length_veh : 18.4;
  const congPct = curObs ? Math.round(curObs.congestion_index * 100) : 87;

  return (
    <div className="clean-card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      {/* Map Header Bar */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
              Live Traffic Network
            </h2>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: 700,
                color: '#2563eb',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              {selectedSegment} Selected
            </span>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className={`pill-tab-btn ${activeFilter === 'live' ? 'active' : ''}`}
              onClick={() => setActiveFilter('live')}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: activeFilter === 'live' ? '#ffffff' : '#10b981',
                }}
              />
              <span>Live Traffic</span>
            </button>
            <button
              className={`pill-tab-btn ${activeFilter === 'forecast' ? 'active' : ''}`}
              onClick={() => setActiveFilter('forecast')}
              title="Trained HistGradientBoosting multi-horizon prediction"
            >
              <Sparkles size={12} style={{ marginRight: '3px' }} />
              <span>Forecast</span>
            </button>
            <button
              className={`pill-tab-btn ${activeFilter === 'incidents' ? 'active' : ''}`}
              onClick={() => setActiveFilter('incidents')}
              title="Trained RandomForest anomaly classifier"
            >
              <span>Incidents</span>
            </button>
            <button
              className={`pill-tab-btn ${activeFilter === 'bottlenecks' ? 'active' : ''}`}
              onClick={() => setActiveFilter('bottlenecks')}
            >
              <span>Bottlenecks</span>
            </button>
            <button
              className={`pill-tab-btn ${activeFilter === 'resilience' ? 'active' : ''}`}
              onClick={() => setActiveFilter('resilience')}
            >
              <span>Resilience</span>
            </button>
          </div>
        </div>

        {/* Right Layer Dropdown & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeFilter === 'forecast' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '2px 4px',
                gap: '3px',
              }}
            >
              {['15m', '30m', '45m', '60m'].map((h) => (
                <button
                  key={h}
                  onClick={() => setForecastHorizon(h)}
                  style={{
                    border: 'none',
                    background: forecastHorizon === h ? '#2563eb' : 'transparent',
                    color: forecastHorizon === h ? '#ffffff' : '#64748b',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 7px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  +{h}
                </button>
              ))}
            </div>
          )}

          {/* Layer Selector Dropdown */}
          <div style={{ position: 'relative' }}>
            <div
              className="header-pill"
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              style={{ cursor: 'pointer', padding: '5px 12px', fontSize: '11px', userSelect: 'none' }}
            >
              <Layers size={13} color="var(--text-muted)" style={{ marginRight: '4px' }} />
              <span>Layers</span>
              <ChevronDown size={14} color="var(--text-muted)" style={{ marginLeft: '4px' }} />
            </div>

            {showLayerMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '180px',
                  background: '#ffffff',
                  borderRadius: '10px',
                  padding: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  border: '1px solid #e2e8f0',
                  zIndex: 200,
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '4px 6px' }}>
                  Map Layers
                </div>
                {Object.keys(layers).map((k) => (
                  <label
                    key={k}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      color: '#334155',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={layers[k]}
                      onChange={(e) => setLayers({ ...layers, [k]: e.target.checked })}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{k}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div
            className="header-icon-btn"
            onClick={onMaximize}
            style={{ width: 32, height: 32, cursor: 'pointer' }}
            title="Expand Full Network Map View"
          >
            <Maximize2 size={14} />
          </div>
        </div>
      </div>

      {/* Map Canvas Box */}
      <div
        style={{
          position: 'relative',
          height: '520px',
          background: '#0a101f',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 740 520"
          style={{ display: 'block', transition: isDragging ? 'none' : 'transform 0.15s ease-out' }}
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transformOrigin: '370px 260px' }}>
            {/* Subtle Background Water Bodies (e.g. Hussain Sagar) */}
            <path
              d="M 425 270 C 445 260 460 275 455 295 C 440 310 420 300 415 285 Z"
              fill="#1e3a8a"
              opacity="0.4"
            />

            {/* Road Corridors */}
            {layers.corridors &&
              roadCorridors.map((rc) => {
                const color = getCorridorColor(rc);
                const isSelected = selectedSegment === rc.id;
                return (
                  <g key={rc.id}>
                    {/* Glowing highlight halo if selected */}
                    {isSelected && (
                      <path
                        d={rc.d}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth={rc.w + 6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.35}
                      />
                    )}
                    <path
                      d={rc.d}
                      fill="none"
                      stroke={color}
                      strokeWidth={isSelected ? rc.w + 1.5 : rc.w}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0.92}
                      style={{ cursor: 'pointer', transition: 'stroke 0.2s, stroke-width 0.2s' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectSegment) onSelectSegment(rc.id);
                        setInspectorOpen(true);
                      }}
                    />
                  </g>
                );
              })}

            {/* Incident Alert Markers */}
            {layers.incidents &&
              incidentMarkers.map((inc) => (
                <g
                  key={inc.id}
                  transform={`translate(${inc.x - 12}, ${inc.y - 12})`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectSegment) onSelectSegment(inc.code);
                    setInspectorOpen(true);
                  }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="14"
                    fill={inc.type === 'incident' ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.3)'}
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill={inc.type === 'incident' ? '#ef4444' : '#f97316'}
                  />
                  {inc.type === 'incident' ? (
                    <text x="12" y="16" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                      !
                    </text>
                  ) : (
                    <text x="12" y="15" textAnchor="middle" fill="#ffffff" fontSize="9">
                      ▲
                    </text>
                  )}
                </g>
              ))}

            {/* City / Landmark Name Labels */}
            {landmarks.map((lm, idx) => (
              <g key={idx} transform={`translate(${lm.x}, ${lm.y})`} style={{ pointerEvents: 'none' }}>
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
          </g>
        </svg>

        {/* Floating Zoom Controls (+ / - / Crosshair) */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 15,
          }}
        >
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 2.8))}
            title="Zoom in"
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
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.7))}
            title="Zoom out"
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
            onClick={handleResetView}
            title="Reset Map View"
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
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 70,
            background: 'rgba(15, 23, 42, 0.92)',
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
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} /> Normal
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b' }} /> Moderate
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

        {/* Reopen Inspector Button if closed */}
        {!inspectorOpen && (
          <button
            onClick={() => setInspectorOpen(true)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: '#0f172a',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              zIndex: 15,
            }}
          >
            <Eye size={13} />
            <span>Inspect {selectedSegment}</span>
          </button>
        )}

        {/* Floating Segment Inspector Card (Live Model Inferences) */}
        {inspectorOpen && (
          <div
            className="map-inspector-card"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: '280px',
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '16px',
              color: '#ffffff',
              boxShadow: '0 14px 36px rgba(0,0,0,0.4)',
              zIndex: 20,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '16px', fontFamily: 'var(--font-mono)' }}>
                    {selectedSegment}
                  </span>
                  <span
                    style={{
                      background: congPct >= 70 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                      color: congPct >= 70 ? '#f87171' : '#fbbf24',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: `1px solid ${congPct >= 70 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                    }}
                  >
                    {congPct >= 70 ? 'Severe Congestion' : congPct >= 40 ? 'Moderate' : 'Optimal'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Hyderabad Operational Corridor
                </div>
              </div>

              <button
                onClick={() => setInspectorOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                title="Close Inspector"
              >
                <X size={14} />
              </button>
            </div>

            {/* Model Incident Classifier Badge */}
            {incidentClassification && incidentClassification.is_incident && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '10px',
                  color: '#fca5a5',
                }}
              >
                <AlertTriangle size={12} color="#ef4444" />
                <span>
                  <b>ML Diagnosis:</b> {incidentClassification.predicted_incident_type.replace('_', ' ').toUpperCase()} ({Math.round(incidentClassification.incident_probability * 100)}% prob)
                </span>
              </div>
            )}

            {/* Road Camera Thumbnail */}
            <div
              style={{
                width: '100%',
                height: '70px',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '10px',
                background: '#1e293b',
                position: 'relative',
              }}
            >
              <svg width="100%" height="70" viewBox="0 0 260 70">
                <rect width="260" height="70" fill="#1e293b" />
                <path d="M 0 70 L 80 38 L 180 38 L 260 70 Z" fill="#334155" />
                <line x1="130" y1="38" x2="130" y2="70" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,6" />
                <rect x="70" y="48" width="22" height="12" rx="2" fill="#ef4444" />
                <rect x="110" y="45" width="26" height="14" rx="3" fill="#e2e8f0" />
                <rect x="150" y="50" width="24" height="13" rx="2" fill="#3b82f6" />
              </svg>
              <span
                style={{
                  position: 'absolute',
                  top: 5,
                  left: 6,
                  background: 'rgba(0,0,0,0.65)',
                  color: '#ffffff',
                  fontSize: '9px',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Camera size={10} /> CAM {selectedSegment.replace('R0', '')}-E
              </span>
            </div>

            {/* Live Model Metrics List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Speed:</span>
                <span style={{ fontWeight: 700, color: currentSpeed < 25 ? '#ef4444' : '#10b981' }}>
                  {currentSpeed} km/h (Free-flow: {freeFlowSpeed})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Volume / Cap:</span>
                <span style={{ fontWeight: 600 }}>{Math.round(flowVeh)} / {Math.round(capacityVeh)} vph</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Queue & Delay:</span>
                <span style={{ fontWeight: 600 }}>{queueLen} veh • {curObs?.delay_min != null ? curObs.delay_min.toFixed(1) : '0.0'} min</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Congestion Index:</span>
                <span style={{ fontWeight: 700, color: congPct >= 70 ? '#ef4444' : '#f59e0b' }}>
                  {congPct}%
                </span>
              </div>

              {/* Multi-Horizon Regressor Strip (15m, 30m, 45m, 60m) */}
              <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Multi-Horizon Forecast:</span>
                  <span style={{ color: '#94a3b8', fontWeight: 400 }}>Speed | Cong</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center' }}>
                  {['15m', '30m', '45m', '60m'].map((hz) => {
                    const hd = horizons.find((h) => h.horizon === hz);
                    return (
                      <div key={hz} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '3px 2px' }}>
                        <div style={{ fontSize: '9px', color: '#94a3b8' }}>{hz}</div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#f8fafc' }}>
                          {hd ? `${hd.predicted_speed_kmh.toFixed(0)}k` : '--'}
                        </div>
                        <div style={{ fontSize: '9px', color: '#f59e0b' }}>
                          {hd ? hd.predicted_congestion_index.toFixed(2) : '--'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spillback status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: '#94a3b8' }}>
                <span>Spillback:</span>
                <span style={{ color: congPct >= 60 ? '#f87171' : '#4ade80', fontWeight: 700 }}>
                  {congPct >= 60 ? 'Active Upstream Shockwave' : 'Nominal (No Cascade)'}
                </span>
              </div>

              {/* Model Provenance */}
              <div
                style={{
                  marginTop: '4px',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '4px',
                  padding: '3px 6px',
                  fontSize: '9px',
                  color: '#38bdf8',
                  textAlign: 'center',
                }}
              >
                37 temporal features → 12 HGB forecasting models
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                className="btn-blue"
                onClick={onOpenDetails}
                style={{ width: '100%', justifyContent: 'center', padding: '8px 0', fontSize: '12px', cursor: 'pointer' }}
              >
                <span>Launch Intervention</span>
                <ArrowRight size={13} />
              </button>
              <button
                onClick={onSimulateResponse}
                style={{
                  width: '100%',
                  padding: '7px 0',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Navigation size={12} />
                <span>Simulate Diversions</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
