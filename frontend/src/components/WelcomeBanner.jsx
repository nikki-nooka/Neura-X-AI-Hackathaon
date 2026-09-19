import React from 'react';
import { Calendar } from 'lucide-react';

export default function WelcomeBanner({ simTime = '06:42 PM' }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
      paddingBottom: '4px',
    }}>
      {/* Welcome Title */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Welcome back,
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', marginTop: '2px' }}>
          Here's what's happening in Hyderabad
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Real-time intelligence for a smarter, more connected city.
        </p>
      </div>

      {/* Right Date Card & Charminar Silhouette */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Date Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <Calendar size={18} color="var(--primary-blue)" />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Mon, 15 Jul 2024</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              {simTime}
            </div>
          </div>
        </div>

        {/* Charminar Illustration & Motto */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: 0.85 }}>
          {/* Stylized Charminar SVG */}
          <svg width="68" height="52" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 15 75 L 15 25 L 20 20 L 25 25 L 25 75 Z" fill="#94a3b8" />
            <path d="M 75 75 L 75 25 L 80 20 L 85 25 L 85 75 Z" fill="#94a3b8" />
            <path d="M 35 75 L 35 30 L 40 25 L 45 30 L 45 75 Z" fill="#cbd5e1" />
            <path d="M 55 75 L 55 30 L 60 25 L 65 30 L 65 75 Z" fill="#cbd5e1" />
            <path d="M 20 35 L 80 35 L 80 40 L 20 40 Z" fill="#94a3b8" />
            <path d="M 20 50 L 80 50 L 80 54 L 20 54 Z" fill="#94a3b8" />
            <path d="M 35 75 C 35 55 65 55 65 75 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="20" cy="18" r="3" fill="#64748b" />
            <circle cx="80" cy="18" r="3" fill="#64748b" />
            <circle cx="40" cy="23" r="2.5" fill="#94a3b8" />
            <circle cx="60" cy="23" r="2.5" fill="#94a3b8" />
          </svg>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '140px', lineHeight: 1.3 }}>
            "Smoother traffic.<br />A smarter Hyderabad."
          </div>
        </div>
      </div>
    </div>
  );
}
