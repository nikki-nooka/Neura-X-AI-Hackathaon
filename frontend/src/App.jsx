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
} from 'lucide-react';

import AIBriefingCard from './components/AIBriefingCard';
import BottomSection from './components/BottomSection';
import CriticalAlertsCard from './components/CriticalAlertsCard';
import DiversionView from './components/DiversionView';
import EcoBanner from './components/EcoBanner';
import EmergencyView from './components/EmergencyView';
import ForecastView from './components/ForecastView';
import HeaderBar from './components/HeaderBar';
import InfrastructureView from './components/InfrastructureView';
import InterventionModal from './components/InterventionModal';
import LiveTrafficMapCard from './components/LiveTrafficMapCard';
import MetricCards from './components/MetricCards';
import ResilienceView from './components/ResilienceView';
import SpillbackView from './components/SpillbackView';
import WeeklyView from './components/WeeklyView';
import WelcomeBanner from './components/WelcomeBanner';
import { fetchKPIs, fetchTopology } from './services/api';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('command_center');
  const [topology, setTopology] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('R0435');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCorridorHighlight, setActiveCorridorHighlight] = useState([]);

  useEffect(() => {
    fetchTopology().then(setTopology).catch(console.error);
    fetchKPIs().then(setKpis).catch(console.error);
  }, []);

  // Complete 9 Command Center Navigation Sections
  const navMenuItems = [
    { id: 'command_center', label: 'Command Center', icon: Home },
    { id: 'network_map', label: 'Network Map', icon: Compass },
    { id: 'forecast', label: 'Traffic Predictor', icon: LineChart },
    { id: 'spillback', label: 'Incident & Spillback', icon: AlertTriangle },
    { id: 'response', label: 'Response Simulator', icon: Sliders },
    { id: 'emergency', label: 'Emergency Green Wave', icon: HeartPulse, emergency: true },
    { id: 'infrastructure', label: 'Infrastructure Planner', icon: Building2 },
    { id: 'resilience', label: 'Network Resilience', icon: Shield },
    { id: 'weekly', label: 'Weekly Intelligence', icon: Calendar },
  ];

  return (
    <div className="app-shell">
      {/* 1. Clean Tactical Left Sidebar */}
      <aside className="sidebar">
        {/* Logo Branding */}
        <div className="sidebar-logo">
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
        <HeaderBar />

        {/* Dashboard Canvas */}
        <main className="dashboard-viewport">
          {activeMenu === 'command_center' && (
            <>
              {/* Row 1: Welcome Banner */}
              <WelcomeBanner simTime="06:42 PM" />

              {/* Row 2: 6 KPI Metric Cards */}
              <MetricCards kpis={kpis} />

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
                  onSimulateResponse={() => setModalOpen(true)}
                />

                {/* Right: AI Briefing + Critical Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <AIBriefingCard
                    onViewRecommendation={() => setModalOpen(true)}
                    onWhyItMatters={() => setModalOpen(true)}
                  />
                  <CriticalAlertsCard
                    onSelectAlert={(seg) => {
                      setSelectedSegment(seg);
                      setModalOpen(true);
                    }}
                  />
                </div>
              </div>

              {/* Row 4: Citywide Traffic Trend + Top Congested Corridors + City in Numbers */}
              <BottomSection
                onSelectCorridor={(code) => {
                  setSelectedSegment(code);
                  setModalOpen(true);
                }}
              />

              {/* Row 5: Green Eco Banner */}
              <EcoBanner />
            </>
          )}

          {/* Dedicated Full Network Map View */}
          {activeMenu === 'network_map' && (
            <div className="clean-card" style={{ padding: '20px' }}>
              <LiveTrafficMapCard
                topology={topology}
                selectedSegment={selectedSegment}
                onSelectSegment={(seg) => setSelectedSegment(seg)}
                onOpenDetails={() => setModalOpen(true)}
                onSimulateResponse={() => setModalOpen(true)}
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
        </main>
      </div>

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
    </div>
  );
}
