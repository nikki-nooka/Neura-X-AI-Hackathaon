import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart2,
  Building2,
  Calendar,
  Compass,
  Cpu,
  HeartPulse,
  Home,
  Layers,
  LineChart,
  Navigation,
  Radio,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  Zap,
  Globe,
  Video,
  Play,
} from 'lucide-react';

import AIBriefingCard from './components/AIBriefingCard';
import BottomSection from './components/BottomSection';
import CriticalAlertsCard from './components/CriticalAlertsCard';
import DiversionView from './components/DiversionView';
import EcoBanner from './components/EcoBanner';
import EmergencyView from './components/EmergencyView';
import ForecastView from './components/ForecastView';
import GlobeVisualizerView from './components/GlobeVisualizerView';
import HeaderBar from './components/HeaderBar';
import InfrastructureView from './components/InfrastructureView';
import { IntroAnimation } from './components/IntroAnimation';
import InterventionModal from './components/InterventionModal';
import { LiveRadarPage } from './components/LiveRadarPage';
import LiveTrafficMapCard from './components/LiveTrafficMapCard';
import MetricCards from './components/MetricCards';
import NetworkMap from './components/NetworkMap';
import { ReportIncidentModal } from './components/ReportIncidentModal';
import ResilienceView from './components/ResilienceView';
import RoadsIntelligenceView from './components/RoadsIntelligenceView';
import RunDemoModal from './components/RunDemoModal';
import SpillbackView from './components/SpillbackView';
import SurveillanceStreamView from './components/SurveillanceStreamView';
import WeeklyView from './components/WeeklyView';
import WelcomeBanner from './components/WelcomeBanner';
import HomePage from './components/HomePage';
import { INITIAL_INCIDENTS } from './mockData';
import { fetchKPIs, fetchTopology } from './services/api';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [topology, setTopology] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('R0435');
  const [modalOpen, setModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeCorridorHighlight, setActiveCorridorHighlight] = useState([]);

  // Nuerax / MargaNetra Visualizer, Intro & Radar states
  const [showIntro, setShowIntro] = useState(true);
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [radarCoords, setRadarCoords] = useState(null);
  const [radarCityName, setRadarCityName] = useState(null);

  useEffect(() => {
    fetchTopology().then(setTopology).catch(console.error);
    fetchKPIs().then(setKpis).catch(console.error);
  }, []);

  const handleAddIncident = (newIncData) => {
    const newIncident = {
      ...newIncData,
      id: `inc-user-${Date.now()}`,
      reportedAt: new Date().toISOString(),
      upvotes: 1,
      verified: true,
    };
    setIncidents((prev) => [newIncident, ...prev]);
    setIsReportOpen(false);
  };

  // Compact, professional command center navigation
  const navMenuItems = [
    { id: 'home', label: 'Home Page', icon: Home, badge: 'VIDEO' },
    { id: 'command_center', label: 'Command Center', icon: Activity },
    { id: 'globe_3d', label: '3D Visualizer', icon: Globe, badge: '3D' },
    { id: 'live_radar', label: 'Live Radar', icon: Radio, badge: 'LIVE' },
    { id: 'surveillance', label: 'Surveillance Stream', icon: Video },
    { id: 'roads', label: '436 Cities', icon: Layers },
    { id: 'network_map', label: 'Live Map', icon: Compass },
    { id: 'forecast', label: 'Forecast', icon: LineChart },
    { id: 'spillback', label: 'Incidents', icon: AlertTriangle },
    { id: 'response', label: 'Response', icon: Sliders },
    { id: 'infrastructure', label: 'Infrastructure', icon: Building2 },
    { id: 'resilience', label: 'Resilience', icon: Shield },
    { id: 'weekly', label: 'Reports', icon: Calendar },
    { id: 'emergency', label: 'Emergency Wave', icon: HeartPulse, emergency: true },
  ];

  return (
    <>
      {activeMenu === 'home' ? (
        <HomePage
          onNavigate={(viewId) => setActiveMenu(viewId)}
          onOpenDemo={() => setDemoModalOpen(true)}
          onOpenReport={(coords) => {
            if (coords) setRadarCoords(coords);
            setIsReportOpen(true);
          }}
          onReplayIntro={() => setShowIntro(true)}
          currentUser={currentUser}
          onLogin={(user) => setCurrentUser(user)}
          onLogout={() => setCurrentUser(null)}
          kpis={kpis}
        />
      ) : (
        <div className="app-shell">
          {/* 1. Clean Tactical Left Sidebar */}
          <aside className="sidebar">
            {/* Logo Branding - Clickable to return Home */}
            <div
              className="sidebar-logo"
              onClick={() => setActiveMenu('home')}
              style={{ cursor: 'pointer' }}
              title="Return to MargaNetra Highway Video Home Page"
            >
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '17px',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              }}>
                X
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#ffffff', letterSpacing: '-0.2px' }}>
                  NeuraX
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  Smarter Cities · Hyderabad
                </div>
              </div>
            </div>

        {/* Primary Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Operations</div>
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                <Icon size={16} color={isActive ? '#ffffff' : item.emergency ? 'var(--status-red)' : 'var(--text-sidebar)'} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '5px',
                    background: item.badge === 'LIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                    color: item.badge === 'LIVE' ? '#34d399' : '#38bdf8',
                    border: item.badge === 'LIVE' ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(56, 189, 248, 0.35)',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {/* Hyderabad City Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
            }}>
              <Building2 size={14} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9' }}>Hyderabad</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>120 Nodes · 436 Links</div>
            </div>
          </div>

          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#1e293b',
                color: '#cbd5e1',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                TA
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>Traffic Admin</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>admin@neurax.gov</div>
              </div>
            </div>

            <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              <Settings size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Executive Viewport */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <HeaderBar
          onSelectSegment={(seg) => setSelectedSegment(seg)}
          onNavigate={(viewId) => setActiveMenu(viewId)}
          onOpenIntervention={() => setModalOpen(true)}
          onRunDemo={() => setDemoModalOpen(true)}
          onOpenGlobe={() => setActiveMenu('globe_3d')}
          onOpenRadar={() => setActiveMenu('live_radar')}
          onReplayIntro={() => setShowIntro(true)}
        />

        {/* Dashboard Canvas */}
        <main className="dashboard-viewport">
          {activeMenu === 'command_center' && (
            <>
              {/* Row 1: Welcome Banner with live system time + Hero Run Demo Action */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '14px',
              }}>
                <div style={{ flex: 1, minWidth: '320px' }}>
                  <WelcomeBanner dataTimestamp="Jan 19, 23:55" />
                </div>
                <div>
                  <button
                    id="run-neurax-demo-btn"
                    onClick={() => setDemoModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                      color: '#ffffff',
                      border: '1px solid rgba(56, 189, 248, 0.6)',
                      padding: '12px 26px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 0 25px rgba(37, 99, 235, 0.5), 0 4px 15px rgba(0,0,0,0.3)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      letterSpacing: '0.4px',
                    }}
                  >
                    <Sparkles size={18} />
                    <span>▶ Run NeuraX Demo</span>
                  </button>
                </div>
              </div>

              {/* Row 2: 6 KPI Metric Cards */}
              <MetricCards
                kpis={kpis}
                onNavigate={(viewId) => setActiveMenu(viewId)}
              />

              {/* Row 3: Live Map (Center) + AI Briefing & Critical Alerts (Right) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.9fr 1.1fr',
                gap: '16px',
              }}>
                {/* Left: Map with Segment Inspector */}
                <LiveTrafficMapCard
                  topology={topology}
                  selectedSegment={selectedSegment}
                  onSelectSegment={(seg) => {
                    setSelectedSegment(seg);
                  }}
                  onOpenDetails={() => setModalOpen(true)}
                  onSimulateResponse={() => {
                    setActiveMenu('response');
                  }}
                  onMaximize={() => setActiveMenu('network_map')}
                />

                {/* Right: AI Briefing + Critical Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <AIBriefingCard
                    selectedSegment={selectedSegment}
                    onViewRecommendation={() => setModalOpen(true)}
                    onWhyItMatters={() => setModalOpen(true)}
                  />
                  <CriticalAlertsCard
                    onSelectAlert={(seg) => {
                      setSelectedSegment(seg);
                      setModalOpen(true);
                    }}
                    onViewAll={() => setActiveMenu('roads')}
                  />
                </div>
              </div>

              {/* Row 4: Citywide Traffic Trend + Top Congested Corridors + City in Numbers */}
              <BottomSection
                onSelectCorridor={(code) => {
                  setSelectedSegment(code);
                  setModalOpen(true);
                }}
                onViewAllRoads={() => setActiveMenu('roads')}
              />

              {/* Row 5: Green Eco Banner */}
              <EcoBanner />
            </>
          )}

          {/* Dedicated 436 Cities Flagship View matching Image 1 */}
          {activeMenu === 'roads' && (
            <RoadsIntelligenceView
              topology={topology}
              kpis={kpis}
              selectedSegment={selectedSegment}
              onSelectRoad={(seg) => setSelectedSegment(seg)}
              onOpenModal={() => setModalOpen(true)}
              onNavigateView={(viewId) => setActiveMenu(viewId)}
            />
          )}

          {/* Dedicated Full Network Map View */}
          {activeMenu === 'network_map' && (
            <div className="clean-card" style={{ padding: '20px' }}>
              <NetworkMap
                topology={topology}
                selectedSegment={selectedSegment}
                onSelectSegment={(seg) => setSelectedSegment(seg)}
                highlightSegments={activeCorridorHighlight}
              />
            </div>
          )}

          {/* Dedicated Incident & Spillback View */}
          {activeMenu === 'spillback' && (
            <div className="clean-card" style={{ padding: '24px' }}>
              <SpillbackView
                activeSegment={selectedSegment}
                onHighlightSegments={(segs) => setActiveCorridorHighlight(segs)}
              />
            </div>
          )}

          {/* Dedicated Response Simulator View */}
          {activeMenu === 'response' && (
            <div className="clean-card" style={{ padding: '24px' }}>
              <DiversionView activeSegment={selectedSegment} />
            </div>
          )}

          {/* Dedicated Emergency Green Wave View */}
          {activeMenu === 'emergency' && (
            <div className="clean-card" style={{ padding: '24px' }}>
              <EmergencyView
                onEmergencyDispatched={(corridorSegs) => {
                  setActiveCorridorHighlight(corridorSegs);
                  setActiveMenu('command_center');
                }}
              />
            </div>
          )}

          {/* Dedicated Traffic Forecaster View */}
          {activeMenu === 'forecast' && (
            <div className="clean-card" style={{ padding: '24px' }}>
              <ForecastView activeSegment={selectedSegment} />
            </div>
          )}

          {/* Dedicated Infrastructure Planner View */}
          {activeMenu === 'infrastructure' && (
            <div className="clean-card" style={{ padding: '24px' }}>
              <InfrastructureView />
            </div>
          )}

          {/* Dedicated Network Resilience View */}
          {activeMenu === 'resilience' && (
            <div className="clean-card" style={{ padding: '24px' }}>
              <ResilienceView defaultSegment={selectedSegment} />
            </div>
          )}

          {/* Dedicated Weekly Intelligence View */}
          {activeMenu === 'weekly' && (
            <div className="clean-card" style={{ padding: '24px' }}>
              <WeeklyView />
            </div>
          )}

          {/* 3D Planetary Digital Twin & Corridor Visualizer */}
          {activeMenu === 'globe_3d' && (
            <GlobeVisualizerView
              onNavigate={(viewId) => setActiveMenu(viewId)}
              onOpenRadar={(coords, name) => {
                if (coords) setRadarCoords(coords);
                if (name) setRadarCityName(name);
                setActiveMenu('live_radar');
              }}
            />
          )}

          {/* Google Maps Live Radar Street View & Incident Desk */}
          {activeMenu === 'live_radar' && (
            <div style={{
              height: 'calc(100vh - 120px)',
              minHeight: '650px',
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 12px 35px rgba(0,0,0,0.5)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}>
              <LiveRadarPage
                incidents={incidents}
                initialCoords={radarCoords}
                initialCityName={radarCityName}
                onBack={() => setActiveMenu('command_center')}
                onOpenGlobe={() => setActiveMenu('globe_3d')}
                onOpenReportModal={(prefillCoords) => {
                  if (prefillCoords) setRadarCoords(prefillCoords);
                  setIsReportOpen(true);
                }}
                onUpvoteIncident={(id, e) => {
                  e?.stopPropagation?.();
                  setIncidents((prev) =>
                    prev.map((inc) => (inc.id === id ? { ...inc, upvotes: inc.upvotes + 1 } : inc))
                  );
                }}
                onReplayIntro={() => setShowIntro(true)}
              />
            </div>
          )}

          {/* High-Speed Optical Video Surveillance Feeds */}
          {activeMenu === 'surveillance' && (
            <SurveillanceStreamView
              onOpenReportModal={() => setIsReportOpen(true)}
              onNavigate={(viewId) => setActiveMenu(viewId)}
            />
          )}
        </main>
      </div>
    </div>
  )}

  {/* Global Modals Mounted for Both Home & Command Center */}
  {/* Actionable Incident Intervention Modal */}
  <InterventionModal
    isOpen={modalOpen}
    onClose={() => setModalOpen(false)}
    segmentId={selectedSegment}
    onApplyDetour={(detourSegs) => {
      setActiveCorridorHighlight(detourSegs);
    }}
    onApplyEmergency={(emergencySegs) => {
      setActiveCorridorHighlight(emergencySegs);
    }}
  />

  {/* Hero Competition Live Pipeline Demo Modal */}
  <RunDemoModal
    isOpen={demoModalOpen}
    onClose={() => setDemoModalOpen(false)}
  />

  {/* Cinematic Intro Animation Overlay (ved2.mp4) */}
  {showIntro && (
    <IntroAnimation onComplete={() => setShowIntro(false)} />
  )}

  {/* Report Incident Modal */}
  <ReportIncidentModal
    isOpen={isReportOpen}
    onClose={() => setIsReportOpen(false)}
    onSubmit={handleAddIncident}
    defaultCoords={radarCoords || { lat: 17.385, lng: 78.4867 }}
  />
</>
  );
}
