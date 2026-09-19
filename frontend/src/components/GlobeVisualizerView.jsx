import React, { useState } from 'react';
import { Globe, Radio, Sparkles, Navigation, Layers, Compass, BarChart2 } from 'lucide-react';
import { Globe3D } from './Globe3D';
import { EarthGlobeView } from './EarthGlobeView';
import { GlobePage } from './GlobePage';

export default function GlobeVisualizerView({ onNavigate, onOpenRadar }) {
  const [activeTab, setActiveTab] = useState('tactical'); // 'tactical' | 'earth' | 'intelligence'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: '650px', position: 'relative' }}>
      {/* Top Visualizer Mode Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(11, 21, 40, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: '14px',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        marginBottom: '14px',
        zIndex: 20,
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <Globe size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.2px' }}>
              3D Planetary Digital Twin & Corridor Visualizer
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Surveillance Orbit Telemetry · Drag to Rotate · Click Node to Focus
            </div>
          </div>
        </div>

        {/* Submode Switcher Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <button
            onClick={() => setActiveTab('tactical')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'tactical' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              color: activeTab === 'tactical' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Compass size={13} />
            <span>Tactical Hubs 3D</span>
          </button>

          <button
            onClick={() => setActiveTab('earth')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'earth' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              color: activeTab === 'earth' ? '#34d399' : '#94a3b8',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Globe size={13} />
            <span>Earth Photoreal Twin</span>
          </button>

          <button
            onClick={() => setActiveTab('intelligence')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'intelligence' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              color: activeTab === 'intelligence' ? '#c084fc' : '#94a3b8',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <BarChart2 size={13} />
            <span>City & Incident Intel</span>
          </button>
        </div>

        {/* Quick Trigger to Live Radar */}
        {onOpenRadar && (
          <button
            onClick={onOpenRadar}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Radio size={14} />
            <span>Open Live Radar</span>
          </button>
        )}
      </div>

      {/* Viewport Canvas Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#040814',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 12px 35px rgba(0,0,0,0.5)',
      }}>
        {activeTab === 'tactical' && (
          <Globe3D
            onNavigateToMain={() => {
              if (onNavigate) onNavigate('surveillance');
            }}
          />
        )}

        {activeTab === 'earth' && (
          <EarthGlobeView
            onBack={() => setActiveTab('tactical')}
            onSelectCity={(city) => {
              if (onOpenRadar) onOpenRadar();
            }}
          />
        )}

        {activeTab === 'intelligence' && (
          <GlobePage
            onBack={() => setActiveTab('tactical')}
            onOpenGoogleMaps={(coords, name) => {
              if (onOpenRadar) onOpenRadar(coords, name);
            }}
          />
        )}
      </div>
    </div>
  );
}
