import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Command,
  Cpu,
  Expand,
  Info,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  User,
  X,
  Zap,
  Globe,
  Radio,
  Play,
  Home,
} from 'lucide-react';

export default function HeaderBar({
  onSelectSegment,
  onNavigate,
  onOpenIntervention,
  onRunDemo,
  onOpenGlobe,
  onOpenRadar,
  onReplayIntro,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState('Real-Time Telemetry Connected');
  const searchInputRef = useRef(null);

  // Keyboard shortcut Cmd+K or Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setSearchFocused(false);
        setShowNotifications(false);
        setShowWeather(false);
        setShowProfile(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick indexed directory of key Hyderabad corridors, junctions, and hotspots
  const searchDirectory = [
    { id: 'R0435', name: 'Outer Ring Road (East)', type: 'Road', desc: 'Active Severe Congestion · 18 km/h · CAM 04-E', tag: 'CRITICAL', cong: '87%' },
    { id: 'R0211', name: 'Hafeezpet Road', type: 'Road', desc: 'Roadwork Maintenance Zone · 22 km/h', tag: 'ROADWORK', cong: '82%' },
    { id: 'R0299', name: 'Hitech City Phase 2', type: 'Road', desc: 'High Volume Tech Arterial · 24 km/h', tag: 'HEAVY', cong: '76%' },
    { id: 'R0176', name: 'Miyapur Main Road', type: 'Road', desc: 'Unusual Demand Surge · 26 km/h', tag: 'SURGE', cong: '71%' },
    { id: 'R0376', name: 'Gachibowli Junction Link', type: 'Road', desc: 'Critical Bottleneck · 21 km/h', tag: 'CRITICAL', cong: '72%' },
    { id: 'R0067', name: 'Balanagar Flyover Feeder', type: 'Road', desc: 'Stalled Truck · 19 km/h', tag: 'CRITICAL', cong: '78%' },
    { id: 'R0188', name: 'Begumpet Airport Road', type: 'Road', desc: 'Merge Inflow Shockwave · 26 km/h', tag: 'ELEVATED', cong: '58%' },
    { id: 'R0137', name: 'Secunderabad Station Arterial', type: 'Road', desc: 'Single Lane Blockage · 23 km/h', tag: 'CRITICAL', cong: '69%' },
    { id: 'R0341', name: 'Kukatpally Y-Junction Link', type: 'Road', desc: 'Resurfacing Project · 28 km/h', tag: 'ROADWORK', cong: '52%' },
    { id: 'N023', name: 'Junction J-023 (Cyber Towers)', type: 'Junction', desc: 'Signalized 4-Phase Controller · Webster Adaptive', tag: 'SIGNAL', cong: 'Normal' },
    { id: 'N045', name: 'Junction J-045 (Gachibowli Stadium)', type: 'Junction', desc: 'Emergency Priority Preemption Ready', tag: 'SIGNAL', cong: 'Normal' },
    { id: 'N110', name: 'Junction J-110 (Mehdipatnam Hub)', type: 'Junction', desc: 'Green Wave Corridor Origin Point', tag: 'ORIGIN', cong: 'Normal' },
    { id: 'N085', name: 'Junction J-085 (Care Hospital)', type: 'Junction', desc: 'Trauma Center Destination Node', tag: 'EMERGENCY', cong: 'Normal' },
  ];

  const filteredSearch = searchDirectory.filter(
    (item) =>
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const notificationsList = [
    {
      id: 'n1',
      seg: 'R0435',
      title: 'R0435: Stalled Vehicle Confirmed',
      desc: 'RandomForest Classifier confidence: 89.6%. Speed dropped to 18 km/h. Queue spillback predicted within 15m.',
      time: 'Just now',
      severity: 'CRITICAL',
    },
    {
      id: 'n2',
      seg: 'R0376',
      title: 'R0376: Demand Surge Shockwave',
      desc: 'HistGradientBoosting model flags 30m congestion escalation (+18% flow above capacity).',
      time: '4m ago',
      severity: 'WARNING',
    },
    {
      id: 'n3',
      seg: 'R0211',
      title: 'R0211: Roadwork Lane Closure',
      desc: 'Municipal lane closure active. Alternative corridor R0416 spare capacity: 420 veh/h.',
      time: '18m ago',
      severity: 'INFO',
    },
  ];

  const handleSelectSearchItem = (item) => {
    setSearchQuery('');
    setSearchFocused(false);
    if (item.type === 'Road') {
      if (onSelectSegment) onSelectSegment(item.id);
    } else if (onNavigate) {
      onNavigate('emergency');
    }
  };

  const handleSyncTelemetry = () => {
    setIsRefreshing(true);
    setRefreshNotice('Re-evaluating models & telemetry...');
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotice('Synced with ML inference pipeline');
      setTimeout(() => setRefreshNotice('Real-Time Telemetry Connected'), 3000);
    }, 900);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <header className="top-navbar" style={{ position: 'relative', zIndex: 100 }}>
      {/* Search Input Box */}
      <div className="search-input-box" style={{ position: 'relative', width: '380px' }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          placeholder="Search location, road, or junction..."
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#f8fafc', fontSize: '13px' }}
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
          >
            <X size={14} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <span className="kbd-shortcut" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Command size={10} style={{ marginRight: '2px' }} /> K
            </span>
          </div>
        )}

        {/* Autocomplete Search Dropdown */}
        {searchFocused && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '8px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
              border: '1px solid #e2e8f0',
              maxHeight: '340px',
              overflowY: 'auto',
              zIndex: 200,
              padding: '8px',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 10px', letterSpacing: '0.5px' }}>
              {searchQuery ? `Matching Corridors & Nodes (${filteredSearch.length})` : 'Popular Hyderabad Corridors'}
            </div>
            {filteredSearch.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                No segment or junction matching "{searchQuery}"
              </div>
            ) : (
              filteredSearch.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSearchItem(item)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '3px 6px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '11px',
                        background: item.type === 'Road' ? '#eff6ff' : '#f0fdf4',
                        color: item.type === 'Road' ? '#2563eb' : '#16a34a',
                      }}
                    >
                      {item.id}
                    </span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{item.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '10px',
                        background:
                          item.tag === 'CRITICAL'
                            ? '#fee2e2'
                            : item.tag === 'ROADWORK'
                            ? '#ffedd5'
                            : '#f1f5f9',
                        color:
                          item.tag === 'CRITICAL'
                            ? '#dc2626'
                            : item.tag === 'ROADWORK'
                            ? '#ea580c'
                            : '#475569',
                      }}
                    >
                      {item.tag}
                    </span>
                    <ChevronRight size={14} color="#94a3b8" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Action Icons & User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Return to Video Landing Page */}
        <button
          id="header-home-btn"
          onClick={() => onNavigate && onNavigate('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#f1f5f9',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Return to MargaNetra Highway Video Home Page"
        >
          <Home size={13} color="#38bdf8" />
          <span>Home</span>
        </button>

        {/* Intro Replay Trigger */}
        {onReplayIntro && (
          <button
            id="header-replay-intro-btn"
            onClick={onReplayIntro}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '6px 11px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Play Cinematic NeuraX / MargaNetra Problem & Guidance Intro"
          >
            <Play size={12} color="#38bdf8" />
            <span>Intro</span>
          </button>
        )}

        {/* 3D Globe Visualizer Trigger */}
        {onOpenGlobe && (
          <button
            id="header-open-globe-btn"
            onClick={onOpenGlobe}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(6, 182, 212, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Open Interactive 3D Globe & Highway Visualizer"
          >
            <Globe size={13} color="#38bdf8" />
            <span>3D Globe</span>
          </button>
        )}

        {/* Live Radar Trigger */}
        {onOpenRadar && (
          <button
            id="header-open-radar-btn"
            onClick={onOpenRadar}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Open Street-Level Google Maps Live Radar & Incident Desk"
          >
            <Radio size={13} color="#34d399" />
            <span>Live Radar</span>
          </button>
        )}

        {/* Quick Launch Hero Demo */}
        {onRunDemo && (
          <button
            onClick={onRunDemo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)',
              letterSpacing: '0.2px',
            }}
          >
            <Sparkles size={13} />
            <span>▶ Run Demo</span>
          </button>
        )}

        {/* Weather Chip with Friction & Meteorological Popover */}
        <div style={{ position: 'relative' }}>
          <div
            className="header-pill"
            onClick={() => {
              setShowWeather(!showWeather);
              setShowNotifications(false);
              setShowProfile(false);
            }}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            title="View Weather & Environmental Friction Impact"
          >
            <CloudRain size={16} color="#0ea5e9" />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              28°C <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11px' }}>Light Rain</span>
            </span>
          </div>

          {showWeather && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '260px',
                background: 'rgba(11, 21, 40, 0.95)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                padding: '14px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                zIndex: 200,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#f8fafc' }}>Hyderabad Weather Context</span>
                <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  Live Sensor
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4, marginBottom: '10px' }}>
                Precipitation of 1.4 mm/h detected. Grip friction factor derated by 12% across wet asphalt links.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Rainfall Rate:</span>
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>1.4 mm/hr</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Friction Coefficient:</span>
                  <span style={{ fontWeight: 700, color: '#38bdf8' }}>0.88 (Dry: 1.00)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Reaction Time Adder:</span>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>+0.4 sec / veh</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Data Badge matching Image 1 */}
        <div
          className="header-pill"
          onClick={handleSyncTelemetry}
          title="Click to sync telemetry and rerun model inferences"
          style={{ cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none' }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Live Data</span>
        </div>

        {/* Notifications Bell with Interactive Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            className="header-icon-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowWeather(false);
              setShowProfile(false);
            }}
            style={{ cursor: 'pointer', position: 'relative' }}
            title="Real-Time Model Anomaly Notifications"
          >
            <Bell size={17} />
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 15,
                height: 15,
                borderRadius: '50%',
                background: 'var(--status-red)',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              3
            </span>
          </div>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '350px',
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 14px 34px rgba(15, 23, 42, 0.16)',
                border: '1px solid #e2e8f0',
                zIndex: 200,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={14} color="#0f172a" />
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Model Incident Alerts</span>
                </div>
                <span style={{ fontSize: '10px', background: '#fee2e2', color: '#dc2626', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  3 Unresolved
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '320px', overflowY: 'auto' }}>
                {notificationsList.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    onClick={() => {
                      if (onSelectSegment) onSelectSegment(notif.seg);
                      if (onOpenIntervention) onOpenIntervention();
                      setShowNotifications(false);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>{notif.title}</span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{notif.time}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: 1.4 }}>{notif.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--primary-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        Launch Intervention <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '8px 14px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('roads');
                    setShowNotifications(false);
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  View All 436 Roads Diagnostics →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Toggle */}
        <div
          className="header-icon-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          style={{ cursor: 'pointer' }}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Expand size={16} />}
        </div>

        {/* User Profile Avatar with Operational Panel Popover */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
              setShowWeather(false);
            }}
            title="Traffic Admin Operational Profile"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#1e293b',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            TA
          </div>

          {showProfile && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '280px',
                background: '#ffffff',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 14px 34px rgba(15, 23, 42, 0.16)',
                border: '1px solid #e2e8f0',
                zIndex: 200,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  TA
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>Traffic Admin</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>admin@neurax.gov</div>
                  <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>● Clearance: Command Dispatch</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '10px', fontSize: '11px' }}>
                <div style={{ fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Active ML Engines</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', marginBottom: '4px' }}>
                  <Cpu size={12} color="#2563eb" />
                  <span>HistGradientBoosting (Multi-Horizon 15–60m)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', marginBottom: '4px' }}>
                  <Cpu size={12} color="#10b981" />
                  <span>RandomForest Anomaly Classifier (200 Trees)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}>
                  <Cpu size={12} color="#f59e0b" />
                  <span>LWR Kinematic Wave Shockwave Tracer</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Hyderabad Node: HYD-EAST-01</span>
                <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>Online</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
