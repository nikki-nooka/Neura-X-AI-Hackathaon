import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart2,
  BarChart3,
  Bot,
  Building2,
  Calendar,
  Compass,
  Database,
  Flame,
  Globe2,
  HeartPulse,
  Home,
  Layers,
  LineChart,
  MapPin,
  Navigation,
  Radio,
  Settings,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

import AIBriefingCard from './components/AIBriefingCard';
import BottomSection from './components/BottomSection';
import BriefingView from './components/BriefingView';
import CriticalAlertsCard from './components/CriticalAlertsCard';
import DiversionView from './components/DiversionView';
import EcoBanner from './components/EcoBanner';
import EmergencyView from './components/EmergencyView';
import ForecastView from './components/ForecastView';
import HeaderBar from './components/HeaderBar';
import InfrastructureView from './components/InfrastructureView';
import LiveTrafficMapCard from './components/LiveTrafficMapCard';
import MetricCards from './components/MetricCards';
import SpillbackView from './components/SpillbackView';
import WelcomeBanner from './components/WelcomeBanner';
import { fetchKPIs, fetchTopology } from './services/api';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('command_center');
  const [topology, setTopology] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('R0435');
  const [emergencySegments, setEmergencySegments] = useState([]);

  useEffect(() => {
    fetchTopology().then(setTopology).catch(console.error);
    fetchKPIs().then(setKpis).catch(console.error);
  }, []);

  const navMenuItems = [
    { id: 'command_center', label: 'Command Center', icon: Home },
    { id: 'network_map', label: 'Network Map', icon: MapPin },
    { id: 'traffic_analytics', label: 'Traffic Analytics', icon: BarChart2 },
    { id: 'forecast', label: 'Forecast & Prediction', icon: LineChart },
    { id: 'spillback', label: 'Incidents & Spillback', icon: AlertTriangle },
    { id: 'response_sim', label: 'Response Simulator', icon: HeartPulse },
    { id: 'infrastructure', label: 'Infrastructure Planner', icon: Building2 },
    { id: 'resilience', label: 'Network Resilience', icon: Shield },
    { id: 'weekly_intel', label: 'Weekly Intelligence', icon: Calendar },
  ];

  const toolsItems = [
    { id: 'ai_assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'data_explorer', label: 'Data Explorer', icon: Database },
  ];

  return (
    <div className="app-shell">
      {/* 1. Left Dark Tactical Sidebar */}
      <aside className="sidebar">
        {/* Logo Branding */}
        <div className="sidebar-logo">
          {/* NeuraX Icon */}
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '16px',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          }}>
            X
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#ffffff', letterSpacing: '-0.2px' }}>
              NeuraX
            </div>
            <div style={{ fontSize: '9px', color: '#64748b', lineHeight: 1.1 }}>
              Smarter Cities<br />Smoother Tomorrows.
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Tools Section */}
          <div className="sidebar-section-title">Tools</div>
          {toolsItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer (City Badge + User Profile) */}
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
              <div style={{ fontSize: '10px', color: '#64748b' }}>Smart City Network</div>
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

      {/* 2. Main Wrapper */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <HeaderBar />

        {/* Dashboard Scrollable Viewport */}
        <main className="dashboard-viewport">
          {activeMenu === 'command_center' && (
            <>
              {/* Row 1: Welcome Banner */}
              <WelcomeBanner simTime="06:42 PM" />

              {/* Row 2: 6 Metric Cards */}
              <MetricCards kpis={kpis} />

              {/* Row 3: Main Map + AI Briefing & Critical Alerts */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.9fr 1.1fr',
                gap: '16px',
              }}>
                {/* Left: Map */}
                <LiveTrafficMapCard
                  topology={topology}
                  selectedSegment={selectedSegment}
                  onSelectSegment={(seg) => setSelectedSegment(seg)}
                  onOpenDetails={() => setActiveMenu('forecast')}
                  onSimulateResponse={() => setActiveMenu('response_sim')}
                />

                {/* Right: AI Situation Briefing + Critical Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <AIBriefingCard
                    onViewRecommendation={() => setActiveMenu('spillback')}
                    onWhyItMatters={() => setActiveMenu('ai_assistant')}
                  />
                  <CriticalAlertsCard
                    onSelectAlert={(seg) => {
                      setSelectedSegment(seg);
                      setActiveMenu('command_center');
                    }}
                  />
                </div>
              </div>

              {/* Row 4: Traffic Trend (Citywide) + Top Congested Corridors + City in Numbers */}
              <BottomSection
                onSelectCorridor={(code) => {
                  setSelectedSegment(code);
                }}
              />

              {/* Row 5: Green Eco Banner */}
              <EcoBanner />
            </>
          )}

          {/* Sub-Views accessible via Sidebar */}
          {activeMenu === 'network_map' && (
            <LiveTrafficMapCard
              topology={topology}
              selectedSegment={selectedSegment}
              onSelectSegment={(seg) => setSelectedSegment(seg)}
              onOpenDetails={() => setActiveMenu('forecast')}
              onSimulateResponse={() => setActiveMenu('response_sim')}
            />
          )}

          {activeMenu === 'spillback' && (
            <SpillbackView activeSegment={selectedSegment} />
          )}

          {activeMenu === 'forecast' && (
            <ForecastView activeSegment={selectedSegment} />
          )}

          {activeMenu === 'response_sim' && (
            <EmergencyView
              onEmergencyDispatched={(segs) => {
                setEmergencySegments(segs);
                setActiveMenu('command_center');
              }}
            />
          )}

          {activeMenu === 'infrastructure' && (
            <InfrastructureView />
          )}

          {activeMenu === 'ai_assistant' && (
            <BriefingView activeSegment={selectedSegment} />
          )}

          {activeMenu === 'traffic_analytics' && (
            <BottomSection onSelectCorridor={(c) => setSelectedSegment(c)} />
          )}

          {activeMenu === 'resilience' && (
            <DiversionView activeSegment={selectedSegment} />
          )}

          {activeMenu === 'weekly_intel' && (
            <InfrastructureView />
          )}

          {activeMenu === 'data_explorer' && (
            <ForecastView activeSegment={selectedSegment} />
          )}
        </main>
      </div>
    </div>
  );
}
