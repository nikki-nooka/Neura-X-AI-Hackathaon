import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AIBriefingCard({ onViewRecommendation, onWhyItMatters }) {
  return (
    <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {/* Card Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '6px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-blue)',
            }}>
              <Sparkles size={14} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              AI Situation Briefing
            </h3>
          </div>

          <span style={{
            background: '#eff6ff',
            color: 'var(--primary-blue)',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '12px',
          }}>
            Beta
          </span>
        </div>

        {/* Briefing Text with Sparkle Circle */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}>
            <Sparkles size={14} />
          </div>
          <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>
            Congestion on <b>R0435</b> is likely to worsen in the next 30–45 minutes due to a stalled vehicle and high demand. Diversion via <b>R0416</b> can reduce queue growth by <b>31%</b>.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className="btn-blue"
          onClick={onViewRecommendation}
          style={{ flex: 1, justifyContent: 'center', padding: '8px 12px', fontSize: '12px' }}
        >
          View Recommendation
        </button>
        <button
          className="btn-white-outline"
          onClick={onWhyItMatters}
          style={{ padding: '8px 12px', fontSize: '12px' }}
        >
          Why this matters?
        </button>
      </div>
    </div>
  );
}
