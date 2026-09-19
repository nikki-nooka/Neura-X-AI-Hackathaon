import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  ChevronRight,
  Cpu,
  HeartPulse,
  Layers,
  LineChart,
  Navigation,
  Play,
  Radio,
  RefreshCw,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

import BriefingView from './components/BriefingView';
import DiversionView from './components/DiversionView';
import EmergencyView from './components/EmergencyView';
import ForecastView from './components/ForecastView';
import InfrastructureView from './components/InfrastructureView';
import KPIRibbon from './components/KPIRibbon';
import NetworkMap from './components/NetworkMap';
import SpillbackView from './components/SpillbackView';
import { fetchKPIs, fetchPlaybackSteps, fetchTopology } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'spillback', 'diversions', 'emergency', 'forecast', 'infrastructure', 'briefing'
  const [topology, setTopology] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [playbackSteps, setPlaybackSteps] = useState([]);
  const [playbackIdx, setPlaybackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState('R0376');
  const [highlightSegments, setHighlightSegments] = useState([]);
  const [emergencySegments, setEmergencySegments] = useState([]);

  // Initial Data Load
  useEffect(() => {
    fetchTopology().then(setTopology).catch(console.error);
    fetchKPIs().then(setKpis).catch(console.error);
    fetchPlaybackSteps().then(setPlaybackSteps).catch(console.error);
  }, []);

  // Time Playback Simulation Loop
  useEffect(() => {
    let interval = null;
    if (isPlaying && playbackSteps.length > 0) {
      interval = setInterval(() => {
        setPlaybackIdx((idx) => {
          const next = (idx + 1) % playbackSteps.length;
          // Update KPIs based on the playback step
          const step = playbackSteps[next];
          if (step && kpis) {
            setKpis((prev) => ({
              ...prev,
              timestamp: step.timestamp,
              avg_speed_kmh: step.avg_speed,
              total_flow_vph: step.total_flow,
            }));
          }
          return next;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSteps, kpis]);

  const handleNextStep = () => {
    if (playbackSteps.length === 0) return;
    const next = (playbackIdx + 1) % playbackSteps.length;
    setPlaybackIdx(next);
    const step = playbackSteps[next];
    if (step && kpis) {
      setKpis((prev) => ({
        ...prev,
        timestamp: step.timestamp,
        avg_speed_kmh: step.avg_speed,
        total_flow_vph: step.total_flow,
      }));
    }
  };

  const navItems = [
    { id: 'map', label: 'Live Network Twin', icon: Activity, badge: '436 Links' },
    { id: 'spillback', label: 'Shockwave Spillback', icon: Layers, badge: 'Cascade' },
    { id: 'diversions', label: 'Turn-Restricted Detours', icon: Navigation, badge: '61 Rules' },
    { id: 'emergency', label: 'Ambulance Green Wave', icon: HeartPulse, badge: '-65% ETA', emergency: true },
    { id: 'forecast', label: 'AI Multi-Horizon Predictor', icon: LineChart, badge: '15-60m' },
    { id: 'infrastructure', label: 'Strategic ROI Studio', icon: Building2, badge: '90 Projects' },
    { id: 'briefing', label: 'Multi-Lingual AI Dispatch', icon: Radio, badge: 'EN / HI / TE' },
  ];

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        {/* Brand Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(2, 132, 199, 0.4)' }}>
            <Cpu size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.5px', color: 'var(--text-primary)' }}>
              NEURAX <span style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>ITS</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Urban Traffic Intelligence
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  color: isActive ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} color={isActive ? 'var(--neon-cyan)' : item.emergency ? 'var(--neon-red)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </div>
                <span className={`badge ${item.emergency ? 'badge-red' : isActive ? 'badge-cyan' : 'badge-purple'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* System Health Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', fontSize: '11px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Backend Engine:</span>
            <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>CONNECTED (FastAPI)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Network Scale:</span>
            <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>120 Nodes · 436 Links</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header Bar */}
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="badge badge-green" style={{ padding: '4px 10px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              <span>LIVE CITY DISPATCH ACTIVE</span>
            </span>

            {kpis && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Sim Time: <b style={{ color: 'var(--text-primary)' }}>{kpis.timestamp}</b>
              </span>
            )}
          </div>

          {/* Time Simulation Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className={isPlaying ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              <Play size={12} fill={isPlaying ? 'white' : 'none'} />
              <span>{isPlaying ? 'Pause Simulation' : 'Live Playback'}</span>
            </button>

            <button className="btn-secondary" onClick={handleNextStep} style={{ fontSize: '12px', padding: '6px 12px' }}>
              <ChevronRight size={14} />
              <span>+15m Step</span>
            </button>

            <button
              className="btn-emergency"
              onClick={() => setActiveTab('emergency')}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              <HeartPulse size={14} />
              <span>Ambulance Green Wave</span>
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="content-viewport">
          {/* Top KPI Ribbon */}
          <KPIRibbon kpis={kpis} />

          {/* Tab Views */}
          {activeTab === 'map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <NetworkMap
                topology={topology}
                selectedSegment={selectedSegment}
                onSelectSegment={(segId) => setSelectedSegment(segId)}
                highlightSegments={highlightSegments}
                emergencySegments={emergencySegments}
              />

              {/* Quick Action Dock */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div className="hud-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('spillback')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Shockwave Spillback</span>
                    <ArrowRight size={14} color="var(--neon-amber)" />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Trace upstream queue delay wavefront from corridor <b>{selectedSegment}</b>.
                  </p>
                </div>

                <div className="hud-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('diversions')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Turn-Restricted Detours</span>
                    <ArrowRight size={14} color="var(--neon-green)" />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Generate alternative bypass routes around <b>{selectedSegment}</b> with capacity checks.
                  </p>
                </div>

                <div className="hud-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('forecast')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>15–60m AI Forecast</span>
                    <ArrowRight size={14} color="var(--neon-cyan)" />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Preview multi-horizon speed, flow & congestion curves for <b>{selectedSegment}</b>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spillback' && (
            <SpillbackView
              activeSegment={selectedSegment}
              onHighlightSegments={(segs) => setHighlightSegments(segs)}
            />
          )}

          {activeTab === 'diversions' && (
            <DiversionView activeSegment={selectedSegment} />
          )}

          {activeTab === 'emergency' && (
            <EmergencyView
              onEmergencyDispatched={(corridorSegs) => {
                setEmergencySegments(corridorSegs);
                setActiveTab('map');
              }}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastView activeSegment={selectedSegment} />
          )}

          {activeTab === 'infrastructure' && (
            <InfrastructureView />
          )}

          {activeTab === 'briefing' && (
            <BriefingView activeSegment={selectedSegment} />
          )}
        </div>
      </main>
    </div>
  );
}
