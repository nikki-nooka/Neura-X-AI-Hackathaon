import React from 'react';
import { Bell, CloudRain, Command, Expand, Search } from 'lucide-react';

export default function HeaderBar() {
  return (
    <header className="top-navbar">
      {/* Search Input Box */}
      <div className="search-input-box">
        <Search size={16} color="var(--text-muted)" />
        <input type="text" placeholder="Search location, road, junction or ask AI..." />
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span className="kbd-shortcut" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Command size={10} style={{ marginRight: '2px' }} /> K
          </span>
        </div>
      </div>

      {/* Right Action Icons & User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Live Data Badge */}
        <div className="header-pill">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-green)', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Live Data</span>
        </div>

        {/* Weather Chip */}
        <div className="header-pill">
          <CloudRain size={16} color="#0ea5e9" />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>28°C <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11px' }}>Light Rain</span></span>
        </div>

        {/* Notifications Bell */}
        <div className="header-icon-btn">
          <Bell size={17} />
          <span style={{
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
          }}>
            3
          </span>
        </div>

        {/* Fullscreen Toggle */}
        <div className="header-icon-btn" onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }}>
          <Expand size={16} />
        </div>

        {/* User Profile Avatar */}
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#e2e8f0',
          color: '#334155',
          fontWeight: 700,
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          TA
        </div>
      </div>
    </header>
  );
}
